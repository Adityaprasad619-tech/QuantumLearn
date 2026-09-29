// src/components/ai/DiracAIPanel.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AIMessage, CircuitGate } from '../../types';
import { StateVector } from '../../quantum/statevector';
import { DiracAIService, DiracResponse, TutorMode } from './aiService';
import { FormattedAIMessage } from './FormattedAIMessage';
import {
  Sparkles, Send, X, Bot, Key, RotateCcw, BookOpen, ChevronDown, ChevronUp,
  Brain, MessageSquare, Image, Paperclip, Mic, XCircle, Upload, Eye, EyeOff,
  HelpCircle, Zap, FlaskConical
} from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface DiracAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeCircuitGates?: CircuitGate[];
  numQubits?: number;
  finalState?: StateVector;
  prefillPrompt?: string;
  onClearPrefill?: () => void;
  userLevel?: number;
}

interface AttachedImage {
  base64: string;
  preview: string;
  name: string;
  description: string;
  kind: 'image' | 'pdf';
  mimeType: string;
}

// ─── Mode config ──────────────────────────────────────────────────────────────
const MODE_CONFIG: Record<TutorMode, { label: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
  normal: {
    label: 'Normal',
    icon: Zap,
    color: '#1E3A8A',
    bg: '#EBF3FC',
    border: '#BFDBFE',
    desc: 'Direct expert answers with RAG grounding and citations'
  },
  socratic: {
    label: 'Socratic',
    icon: Brain,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    desc: 'Guided questioning — I ask you questions so you discover answers yourself'
  },
};

// ─── Prompt chips per mode ───────────────────────────────────────────────────
const CHIPS: Record<TutorMode, string[]> = {
  normal: [
    'Why did H create superposition?',
    'What does the Bloch sphere mean?',
    'Why does CNOT create entanglement?',
    'Explain Grover simply.',
    'Why did my circuit produce this result?'
  ],
  socratic: [
    'Help me understand superposition',
    'I\'m confused about entanglement',
    'Guide me through Grover\'s algorithm',
    'What is quantum phase?',
    'Help me understand QFT'
  ]
};

// ─── Image analysis helper ───────────────────────────────────────────────────
const analyzeImageLocally = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    // Generate a structural description from file metadata + name heuristics
    const name = file.name.toLowerCase();
    let desc = `Uploaded image: "${file.name}" (${(file.size / 1024).toFixed(1)} KB).`;
    if (name.includes('circuit')) desc += ' Appears to be a quantum circuit diagram.';
    else if (name.includes('bloch')) desc += ' Appears to be a Bloch sphere visualization.';
    else if (name.includes('gate')) desc += ' Appears to show quantum gate operations.';
    else if (name.includes('note') || name.includes('hand')) desc += ' Appears to be handwritten notes.';
    else desc += ' Please describe what this image shows if automatic analysis is insufficient.';
    resolve(desc);
  });
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const DiracAIPanel: React.FC<DiracAIPanelProps> = ({
  isOpen,
  onClose,
  activeCircuitGates = [],
  numQubits = 2,
  finalState,
  prefillPrompt,
  onClearPrefill,
  userLevel = 1
}) => {
  const [tutorMode, setTutorMode] = useState<TutorMode>('normal');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `### Welcome to Dirac AI ✦

I am your quantum computing tutor — grounded in your curriculum, circuit telemetry, and a multimodal RAG knowledge base.

**Two modes available:**
- ⚡ **Normal Mode** — I give direct, expert, RAG-cited answers
- 🧠 **Socratic Mode** — I guide you with questions so you *discover* the answer yourself

You can also attach **images** (circuit diagrams, handwritten notes, textbook pages) and I'll analyze them.

Ask me anything about superposition, entanglement, gates, algorithms, or your active simulation!`,
      timestamp: Date.now()
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [showModePanel, setShowModePanel] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modeConf = MODE_CONFIG[tutorMode];

  useEffect(() => {
    if (prefillPrompt && prefillPrompt.trim().length > 0) {
      handleSendMessage(prefillPrompt);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [inputQuery]);

  const toggleSources = (msgId: string) =>
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));

  // ─── Image attachment ──────────────────────────────────────────────────────
  const handleAttachment = useCallback(async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isImage && !isPdf) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      const desc = isPdf
        ? `Uploaded PDF: "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Its text will be extracted for grounded analysis.`
        : await analyzeImageLocally(file);
      setAttachedImage({
        base64,
        preview: isImage ? dataUrl : '',
        name: file.name,
        description: desc,
        kind: isPdf ? 'pdf' : 'image',
        mimeType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream')
      });
    };
    reader.onerror = () => setAttachedImage(null);
    reader.readAsDataURL(file);
  }, []);

  const handleFilePick = () => fileInputRef.current?.click();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleAttachment(file);
  }, [handleAttachment]);

  // ─── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if ((!text.trim() && !attachedImage) || isGenerating) return;
    const prompt = text.trim() || `Please analyze the attached ${attachedImage?.kind === 'pdf' ? 'PDF document' : 'image'} and explain the important content.`;

    soundEffects.playGateClick();

    // Build user message with optional image preview
    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      content: attachedImage
        ? `${prompt}\n\n*[📎 ${attachedImage.kind === 'pdf' ? 'PDF' : 'Image'} attached: ${attachedImage.name}]*`
        : prompt,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    const imgSnap = attachedImage;
    setAttachedImage(null);
    setIsGenerating(true);

    try {
      const diracResult = await DiracAIService.queryDirac({
        userQuery: prompt,
        gates: activeCircuitGates,
        numQubits,
        finalState,
        apiKey,
        userLevel,
        tutorMode,
        imageBase64: imgSnap?.kind === 'image' ? imgSnap.base64 : undefined,
        imageDescription: imgSnap?.description,
        attachmentType: imgSnap?.kind,
        attachmentName: imgSnap?.name,
        attachmentMimeType: imgSnap?.mimeType
      });

      const botMsgId = `bot_${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          sender: 'assistant',
          content: diracResult.answerMarkdown,
          timestamp: Date.now(),
          sources: diracResult.sources,
          ragUsed: diracResult.ragUsed,
          suggestedActions: diracResult.suggestedActions,
          concepts: diracResult.concepts
        }
      ]);
      soundEffects.playStep();
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'assistant',
          content: 'An error occurred while calculating the quantum response. Please check that the backend server is running.',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModeSwitch = (mode: TutorMode) => {
    if (mode === tutorMode) return;
    setTutorMode(mode);
    setShowModePanel(false);
    soundEffects.playGateClick();
    const conf = MODE_CONFIG[mode];
    setMessages(prev => [
      ...prev,
      {
        id: `mode_${Date.now()}`,
        sender: 'assistant',
        content: mode === 'socratic'
          ? `### 🧠 Socratic Mode Activated\n\nI'll now guide you through questions rather than give direct answers. This is proven to build much deeper understanding.\n\n**How it works:**\n- I'll ask you targeted questions based on your mastery gaps\n- I'll use analogies and thought experiments\n- I'll only reveal hints, never the full answer\n- You discover the answer yourself!\n\nWhat concept would you like to explore?`
          : `### ⚡ Normal Mode Activated\n\nBack to direct, expert, RAG-grounded answers with full citations and mathematical derivations.\n\nWhat would you like to know?`,
        timestamp: Date.now()
      }
    ]);
  };

  if (!isOpen) return null;

  const chips = CHIPS[tutorMode];

  return (
    <div
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '460px', maxWidth: '100vw',
        background: '#FFFFFF',
        borderLeft: '1px solid #E2E8F0',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
        zIndex: 120,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          background: 'rgba(124, 58, 237, 0.08)',
          border: '2px dashed #7C3AED',
          borderRadius: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ textAlign: 'center', color: '#7C3AED' }}>
            <Upload size={32} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 16, fontWeight: 800 }}>Drop image to analyze</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Circuit diagrams, notes, textbook pages</div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid #E8E8E8',
        background: tutorMode === 'socratic'
          ? 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)'
          : 'linear-gradient(135deg, #F8FAFF 0%, #EBF3FC 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Animated logo */}
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: tutorMode === 'socratic'
              ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
              : 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
            boxShadow: tutorMode === 'socratic' ? '0 4px 12px rgba(124,58,237,0.3)' : '0 4px 12px rgba(30,58,138,0.3)'
          }}>
            {tutorMode === 'socratic' ? <Brain size={17} /> : <Bot size={17} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111111' }}>Dirac AI</span>
              <span style={{
                fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                background: modeConf.bg, color: modeConf.color,
                padding: '1px 6px', borderRadius: 3, border: `1px solid ${modeConf.border}`
              }}>
                {tutorMode === 'socratic' ? '🧠 SOCRATIC' : '⚡ NORMAL'}
              </span>
              <span style={{
                fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                background: '#ECFDF5', color: '#065F46', padding: '1px 5px', borderRadius: 3
              }}>
                RAG+MULTIMODAL
              </span>
            </div>
            <div style={{ fontSize: 10, color: '#64748B' }}>{modeConf.desc}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Mode toggle */}
          <button
            onClick={() => setShowModePanel(p => !p)}
            title="Switch tutor mode"
            style={{
              background: showModePanel ? modeConf.bg : 'none',
              border: showModePanel ? `1px solid ${modeConf.border}` : 'none',
              cursor: 'pointer', color: modeConf.color, padding: '6px 8px',
              borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 700
            }}>
            <Brain size={14} />
            Mode
          </button>

          <button onClick={() => setShowKeyModal(!showKeyModal)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: apiKey ? '#10B981' : '#94A3B8', padding: '6px', borderRadius: 4 }}
            title={apiKey ? 'API Key configured (vision enabled)' : 'Configure API Key for vision + advanced models'}>
            <Key size={15} />
          </button>

          <button onClick={() => setMessages([messages[0]])}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '6px', borderRadius: 4 }}
            title="Reset conversation">
            <RotateCcw size={14} />
          </button>

          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px', borderRadius: 4 }}>
            <X size={17} />
          </button>
        </div>
      </div>

      {/* ── Mode Switcher Drawer ── */}
      {showModePanel && (
        <div style={{ padding: '12px 16px', background: '#FAFAFA', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 8 }}>
          {(Object.keys(MODE_CONFIG) as TutorMode[]).map(mode => {
            const conf = MODE_CONFIG[mode];
            const Icon = conf.icon;
            const isActive = tutorMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleModeSwitch(mode)}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  background: isActive ? conf.bg : '#FFFFFF',
                  border: isActive ? `2px solid ${conf.color}` : '1px solid #E2E8F0',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.15s'
                }}>
                <Icon size={18} color={conf.color} />
                <span style={{ fontSize: 11, fontWeight: 800, color: conf.color }}>{conf.label}</span>
                <span style={{ fontSize: 9.5, color: '#64748B', textAlign: 'center', lineHeight: 1.3 }}>{conf.desc.split(' — ')[1]?.slice(0, 40) || conf.desc.slice(0, 40)}…</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── API Key Drawer ── */}
      {showKeyModal && (
        <div style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>External LLM API Key</div>
          <div style={{ color: '#64748B' }}>
            Enables <strong>GPT-4o vision</strong> (image analysis) and higher-quality responses. Leave blank for built-in RAG engine.
          </div>
          <input
            type="password" placeholder="sk-..."
            value={apiKey} onChange={(e) => setApiKey(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #CBD5E1', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          />
          {apiKey && (
            <div style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>
              ✓ Vision enabled — you can now attach images for GPT-4o analysis
            </div>
          )}
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column',
        gap: '14px', background: tutorMode === 'socratic' ? '#FDFCFF' : '#FAFAF8'
      }}>
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          const hasSources = m.sources && m.sources.length > 0;
          const isExpanded = expandedSources[m.id];

          return (
            <div key={m.id} style={{
              alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '94%',
              display: 'flex', flexDirection: 'column', gap: 4
            }}>
              <div style={{
                padding: isUser ? '10px 14px' : '14px 16px',
                borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                background: isUser
                  ? (tutorMode === 'socratic' ? '#4F46E5' : '#0F172A')
                  : '#FFFFFF',
                color: isUser ? '#FFFFFF' : '#1E293B',
                border: isUser ? 'none' : `1px solid ${tutorMode === 'socratic' && !isUser ? '#DDD6FE' : '#E2E8F0'}`,
                fontSize: '13px', lineHeight: '1.6',
                boxShadow: isUser ? '0 2px 6px rgba(15,23,42,0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                wordBreak: 'break-word'
              }}>
                <FormattedAIMessage content={m.content} isUser={isUser} />

                {/* Suggested Actions */}
                {!isUser && m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #F1F5F9', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {m.suggestedActions.map((action, aIdx) => (
                      <button key={aIdx} onClick={() => handleSendMessage(action)} disabled={isGenerating}
                        style={{
                          background: tutorMode === 'socratic' ? '#F5F3FF' : '#F1F5F9',
                          border: `1px solid ${tutorMode === 'socratic' ? '#DDD6FE' : '#CBD5E1'}`,
                          borderRadius: 14, padding: '4px 10px', fontSize: 11,
                          color: tutorMode === 'socratic' ? '#7C3AED' : '#4338CA',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500
                        }}>
                        {tutorMode === 'socratic' ? <HelpCircle size={10} /> : <Sparkles size={11} color="#6366F1" />}
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                {/* Concept Tags */}
                {!isUser && m.concepts && m.concepts.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {m.concepts.map((c, cIdx) => (
                      <span key={cIdx} style={{
                        fontSize: 10, background: '#F8FAFC', color: '#64748B',
                        border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        #{c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sources */}
                {hasSources && (
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                    <button onClick={() => toggleSources(m.id)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#4F46E5', fontWeight: 600 }}>
                      <BookOpen size={12} />
                      Sources ({m.sources!.length} RAG docs)
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {isExpanded && (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {m.sources!.map((src, sIdx) => (
                          <div key={sIdx} style={{ padding: '6px 10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 10.5 }}>
                            <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{src.title}</span>
                              <span style={{ color: '#059669' }}>{src.score}% match</span>
                            </div>
                            <div style={{ color: '#64748B', fontStyle: 'italic', marginTop: 2 }}>{src.citation}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <span style={{ fontSize: 9.5, color: '#94A3B8', alignSelf: isUser ? 'flex-end' : 'flex-start', padding: '0 4px' }}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isGenerating && (
          <div style={{
            alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '12px 12px 12px 2px',
            background: '#FFFFFF', border: `1px solid ${tutorMode === 'socratic' ? '#DDD6FE' : '#E8E8E8'}`,
            fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <div style={{
              display: 'flex', gap: 4,
              animation: 'none'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: tutorMode === 'socratic' ? '#7C3AED' : '#2563EB',
                  animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                  opacity: 0.7
                }} />
              ))}
            </div>
            <span>
              {tutorMode === 'socratic'
                ? 'Formulating the perfect Socratic question...'
                : 'Searching vector index & grounding quantum response...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Prompt Chips ── */}
      <div style={{
        padding: '8px 12px', background: '#FFFFFF', borderTop: '1px solid #E8E8E8',
        display: 'flex', gap: 6, overflowX: 'auto', whiteSpace: 'nowrap'
      }}>
        {chips.map((chip, idx) => (
          <button key={idx} onClick={() => handleSendMessage(chip)} disabled={isGenerating}
            style={{
              padding: '4px 10px', flexShrink: 0,
              background: tutorMode === 'socratic' ? '#F5F3FF' : '#F8FAFC',
              border: `1px solid ${tutorMode === 'socratic' ? '#DDD6FE' : '#E2E8F0'}`,
              borderRadius: 14, fontSize: 11,
              color: tutorMode === 'socratic' ? '#7C3AED' : '#334155',
              cursor: 'pointer'
            }}>
            {tutorMode === 'socratic' && <HelpCircle size={10} style={{ marginRight: 4, display: 'inline' }} />}
            {chip}
          </button>
        ))}
      </div>

      {/* ── Attached image preview ── */}
      {attachedImage && (
        <div style={{
          padding: '8px 16px', background: '#F5F3FF', borderTop: '1px solid #DDD6FE',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          {attachedImage.kind === 'image' ? (
            <img src={attachedImage.preview} alt="attached"
              style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid #DDD6FE' }} />
          ) : (
            <div style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: '#FEE2E2', color: '#B91C1C', fontSize: 11, fontWeight: 800 }}>
              PDF
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachedImage.name}</div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{attachedImage.description.slice(0, 80)}…</div>
          </div>
          <button onClick={() => setAttachedImage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', flexShrink: 0 }}>
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* ── Input Area ── */}
      <div style={{ padding: '12px 16px', background: '#FFFFFF', borderTop: '1px solid #E8E8E8' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: '#FAFAF8', border: `1.5px solid ${tutorMode === 'socratic' ? '#DDD6FE' : '#E2E8F0'}`,
          borderRadius: 12, padding: '8px 12px', transition: 'border-color 0.15s'
        }}>
          {/* Multimodal image button */}
          <button onClick={handleFilePick} title="Attach an image or PDF"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: attachedImage ? '#7C3AED' : '#94A3B8', padding: '2px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <Image size={16} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,application/pdf" style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleAttachment(e.target.files[0])} />

          {/* Text input */}
          <textarea
            ref={textareaRef}
            placeholder={tutorMode === 'socratic'
              ? 'What concept would you like to explore? I\'ll guide you with questions...'
              : 'Ask Dirac AI (RAG grounded + multimodal)...'}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
            }}
            disabled={isGenerating}
            rows={1}
            style={{
              flex: 1, border: 'none', background: 'transparent', resize: 'none',
              fontSize: 13, outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
              color: '#0F172A', padding: 0, minHeight: 22, maxHeight: 120, overflowY: 'auto'
            }}
          />

          {/* Send */}
          <button onClick={() => handleSendMessage()} disabled={(!inputQuery.trim() && !attachedImage) || isGenerating}
            style={{
              padding: '7px 10px', borderRadius: 8, flexShrink: 0,
              background: ((inputQuery.trim() || attachedImage) && !isGenerating)
                ? (tutorMode === 'socratic' ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : 'linear-gradient(135deg,#1E3A8A,#2563EB)')
                : '#E2E8F0',
              color: ((inputQuery.trim() || attachedImage) && !isGenerating) ? '#FFFFFF' : '#94A3B8',
              border: 'none', cursor: ((inputQuery.trim() || attachedImage) && !isGenerating) ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s'
            }}>
            <Send size={14} />
          </button>
        </div>

        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9.5, color: '#94A3B8' }}>
            Enter to send · Shift+Enter for newline · Drag & drop images
          </span>
          <span style={{ fontSize: 9.5, color: modeConf.color, fontWeight: 700 }}>
            {tutorMode === 'socratic' ? '🧠 Socratic' : '⚡ Normal'} · Level {userLevel}
          </span>
        </div>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
