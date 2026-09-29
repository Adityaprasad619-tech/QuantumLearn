// src/components/circuit/QuantumCodeEditor.tsx
// Quantum Code Editor with Direct Code Editing, Quick Snippets, Line-by-Line Circuit Generation & Line Locking Inspector
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CircuitGate } from '../../types';
import {
  exportToQiskit,
  exportToQASM,
  exportToPennyLane,
  exportToCirq,
  parseQuantumCode,
  getGatePhysicsExplanation,
  GatePhysicsDetails
} from '../../quantum/qasm';
import { soundEffects } from '../../audio/soundEffects';
import {
  Code2, Lock, Unlock, Play, Pause, ChevronRight, ChevronLeft,
  Sparkles, RefreshCw, Copy, Check, Info, Atom, Zap, Layers, Edit3,
  ListOrdered, PlusCircle, RotateCcw, AlertTriangle, BookOpen
} from 'lucide-react';

interface QuantumCodeEditorProps {
  numQubits: number;
  gates: CircuitGate[];
  onUpdateCircuit: (numQubits: number, gates: CircuitGate[]) => void;
  lockedGateId?: string | null;
  onSelectLockedGate?: (gateId: string | null) => void;
  onAskDirac?: (prompt: string) => void;
}

type CodeFramework = 'qiskit' | 'qasm' | 'pennylane' | 'cirq';
type EditorTab = 'inspect' | 'edit';

export const QuantumCodeEditor: React.FC<QuantumCodeEditorProps> = ({
  numQubits,
  gates,
  onUpdateCircuit,
  lockedGateId,
  onSelectLockedGate,
  onAskDirac
}) => {
  const [framework, setFramework] = useState<CodeFramework>('qiskit');
  const [editorText, setEditorText] = useState<string>('');
  const [editorTab, setEditorTab] = useState<EditorTab>('inspect');
  const [isLiveSync, setIsLiveSync] = useState<boolean>(true);
  const [lockedLineIndex, setLockedLineIndex] = useState<number | null>(null);
  const [isPlayingLineByLine, setIsPlayingLineByLine] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const isInternalUpdate = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate code from current visual circuit gates
  const generateCodeFromGates = (fw: CodeFramework, nq: number, gList: CircuitGate[]): string => {
    switch (fw) {
      case 'qiskit': return exportToQiskit(nq, gList);
      case 'qasm': return exportToQASM(nq, gList);
      case 'pennylane': return exportToPennyLane(nq, gList);
      case 'cirq': return exportToCirq(nq, gList);
      default: return exportToQiskit(nq, gList);
    }
  };

  // Synchronize editor text when visual circuit updates (unless user is actively typing in edit mode)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const code = generateCodeFromGates(framework, numQubits, gates);
    setEditorText(code);
    setParseError(null);
  }, [framework, numQubits, gates]);

  // Split code into lines
  const codeLines = useMemo(() => editorText.split('\n'), [editorText]);

  // Parse code to find line-to-gate associations
  const parsedMapping = useMemo(() => {
    return parseQuantumCode(editorText);
  }, [editorText]);

  // If lockedGateId is changed externally (e.g. by clicking a gate in the circuit grid)
  useEffect(() => {
    if (lockedGateId) {
      let foundLine: number | null = null;
      if (parsedMapping.gateIdToLineIndex[lockedGateId] !== undefined) {
        foundLine = parsedMapping.gateIdToLineIndex[lockedGateId];
      } else {
        const visualGateIdx = gates.findIndex(g => g.id === lockedGateId);
        if (visualGateIdx !== -1) {
          const matchedLine = Object.entries(parsedMapping.lineIndexToGateIndex).find(([_, gIdx]) => gIdx === visualGateIdx);
          if (matchedLine) foundLine = parseInt(matchedLine[0], 10);
        }
      }
      if (foundLine !== null) {
        setLockedLineIndex(foundLine);
      }
    }
  }, [lockedGateId, parsedMapping, gates]);

  // Find gate details for the currently locked line
  const activeLockedGate = useMemo<CircuitGate | null>(() => {
    if (lockedLineIndex === null) return null;
    
    // 1. Direct parsed gate on that line
    if (parsedMapping.lineIndexToGate && parsedMapping.lineIndexToGate[lockedLineIndex]) {
      return parsedMapping.lineIndexToGate[lockedLineIndex];
    }
    
    // 2. Sequential gate index in visual gates array
    const gateIdx = parsedMapping.lineIndexToGateIndex?.[lockedLineIndex];
    if (gateIdx !== undefined && gates[gateIdx]) {
      return gates[gateIdx];
    }

    // 3. Fallback: match from parsedMapping.gates
    const gateId = parsedMapping.lineIndexToGateId?.[lockedLineIndex];
    if (gateId) {
      return parsedMapping.gates.find(g => g.id === gateId) || null;
    }

    return null;
  }, [lockedLineIndex, parsedMapping, gates]);

  // Physics explanation for the active locked line
  const physicsDetails = useMemo<GatePhysicsDetails | null>(() => {
    if (!activeLockedGate) return null;
    return getGatePhysicsExplanation(activeLockedGate);
  }, [activeLockedGate]);

  // Handle user typing directly in the code editor
  const handleEditorChange = (newText: string) => {
    setEditorText(newText);

    const res = parseQuantumCode(newText);
    if (res.error && res.gates.length === 0) {
      setParseError(res.error);
    } else {
      setParseError(null);
      if (isLiveSync) {
        isInternalUpdate.current = true;
        onUpdateCircuit(res.numQubits, res.gates);
      }
    }
  };

  // Compile / sync button
  const handleForceCompile = () => {
    const res = parseQuantumCode(editorText);
    if (res.gates.length > 0) {
      soundEffects.playStep();
      onUpdateCircuit(res.numQubits, res.gates);
      setParseError(null);
    } else {
      setParseError(res.error || 'No valid quantum gates parsed in code.');
    }
  };

  // Insert a snippet at current cursor or at the bottom
  const handleInsertSnippet = (snippet: string) => {
    soundEffects.playGateClick();
    if (textareaRef.current) {
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const text = editorText;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + snippet + '\n' + after;
      handleEditorChange(newText);
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + snippet.length + 1;
      }, 50);
    } else {
      // Append to the section before measurements
      const lines = editorText.split('\n');
      const measureIdx = lines.findIndex(l => l.includes('measure'));
      if (measureIdx !== -1) {
        lines.splice(measureIdx, 0, snippet);
      } else {
        lines.push(snippet);
      }
      handleEditorChange(lines.join('\n'));
    }
  };

  // Lock or unlock a line
  const handleToggleLockLine = (lineIdx: number) => {
    if (lockedLineIndex === lineIdx) {
      setLockedLineIndex(null);
      if (onSelectLockedGate) onSelectLockedGate(null);
    } else {
      setLockedLineIndex(lineIdx);
      soundEffects.playGateClick();
      
      // Match with visual gate
      const gateIdx = parsedMapping.lineIndexToGateIndex?.[lineIdx];
      if (gateIdx !== undefined && gates[gateIdx] && onSelectLockedGate) {
        onSelectLockedGate(gates[gateIdx].id);
      } else {
        const gId = parsedMapping.lineIndexToGateId?.[lineIdx];
        if (onSelectLockedGate) onSelectLockedGate(gId || null);
      }
    }
  };

  // Step through lines line-by-line
  const handleStepLine = (direction: 'next' | 'prev') => {
    const gateLines = Object.keys(parsedMapping.lineIndexToGateId).map(Number).sort((a, b) => a - b);
    if (gateLines.length === 0) return;

    soundEffects.playStep();
    if (lockedLineIndex === null) {
      handleToggleLockLine(gateLines[0]);
      return;
    }

    const currPos = gateLines.indexOf(lockedLineIndex);
    if (direction === 'next') {
      const nextPos = (currPos + 1) % gateLines.length;
      handleToggleLockLine(gateLines[nextPos]);
    } else {
      const prevPos = (currPos - 1 + gateLines.length) % gateLines.length;
      handleToggleLockLine(gateLines[prevPos]);
    }
  };

  // Auto-play line-by-line animation
  useEffect(() => {
    if (!isPlayingLineByLine) return;
    const gateLines = Object.keys(parsedMapping.lineIndexToGateId).map(Number).sort((a, b) => a - b);
    if (gateLines.length === 0) {
      setIsPlayingLineByLine(false);
      return;
    }

    const interval = setInterval(() => {
      setLockedLineIndex(prev => {
        const currIndex = prev !== null ? gateLines.indexOf(prev) : -1;
        const nextIndex = currIndex + 1;
        if (nextIndex >= gateLines.length) {
          setIsPlayingLineByLine(false);
          return gateLines[0];
        }
        const targetLine = gateLines[nextIndex];
        const gateIdx = parsedMapping.lineIndexToGateIndex?.[targetLine];
        if (gateIdx !== undefined && gates[gateIdx] && onSelectLockedGate) {
          onSelectLockedGate(gates[gateIdx].id);
        } else {
          const gId = parsedMapping.lineIndexToGateId[targetLine];
          if (onSelectLockedGate) onSelectLockedGate(gId || null);
        }
        soundEffects.playStep();
        return targetLine;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isPlayingLineByLine, parsedMapping, onSelectLockedGate, gates]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorText);
    setCopied(true);
    soundEffects.playStep();
    setTimeout(() => setCopied(false), 2000);
  };

  const gateLinesList = useMemo(() => {
    return Object.entries(parsedMapping.lineIndexToGateId).map(([lStr, _]) => {
      const lIdx = parseInt(lStr, 10);
      const gate = parsedMapping.lineIndexToGate?.[lIdx];
      return {
        lineIdx: lIdx,
        text: codeLines[lIdx] || '',
        gate
      };
    });
  }, [parsedMapping, codeLines]);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #BFDBFE',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header Bar */}
      <div style={{
        padding: '12px 18px',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Code2 size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
                Quantum Code Editor & Line Inspector
              </h3>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                background: '#DBEAFE',
                color: '#1E3A8A',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                Two-Way Sync
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.85 }}>
              Type code or lock lines to inspect quantum state transformations in real-time
            </p>
          </div>
        </div>

        {/* Framework Switcher & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Editor Mode: Inspect vs Type Code */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <button
              onClick={() => setEditorTab('inspect')}
              style={{
                background: editorTab === 'inspect' ? '#FFFFFF' : 'transparent',
                color: editorTab === 'inspect' ? '#1E3A8A' : '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ListOrdered size={12} />
              <span>Inspect & Lock</span>
            </button>

            <button
              onClick={() => setEditorTab('edit')}
              style={{
                background: editorTab === 'edit' ? '#FFFFFF' : 'transparent',
                color: editorTab === 'edit' ? '#1E3A8A' : '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Edit3 size={12} />
              <span>Edit Code</span>
            </button>
          </div>

          {/* Framework Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {(['qiskit', 'qasm', 'pennylane', 'cirq'] as CodeFramework[]).map(fw => (
              <button
                key={fw}
                onClick={() => setFramework(fw)}
                style={{
                  background: framework === fw ? '#FFFFFF' : 'transparent',
                  color: framework === fw ? '#1E3A8A' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {fw === 'qiskit' ? 'Qiskit (Py)' : fw === 'qasm' ? 'OpenQASM' : fw === 'pennylane' ? 'PennyLane' : 'Cirq'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsLiveSync(!isLiveSync)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isLiveSync ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.15)',
              border: isLiveSync ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title={isLiveSync ? 'Live synchronization enabled: code updates generate visual circuit' : 'Auto-sync paused'}
          >
            <RefreshCw size={12} className={isLiveSync ? 'spinning-slow' : ''} />
            <span>{isLiveSync ? 'Live Sync: ON' : 'Live Sync: OFF'}</span>
          </button>

          <button
            onClick={handleCopyCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Code on Left, Physics Deep Dive on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(360px, 1.2fr) minmax(320px, 1fr)',
        gap: '0',
        minHeight: '400px'
      }}>
        {/* Left: Code Viewer & Editor */}
        <div style={{
          borderRight: '1px solid #BFDBFE',
          background: '#0F172A',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Quick Gate Insertion Snippets Toolbar */}
          <div style={{
            padding: '8px 12px',
            background: '#1E293B',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {editorTab === 'inspect' ? (
              /* Stepper Toolbar for Inspect Mode */
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#93C5FD' }}>
                  Line Stepper:
                </span>
                <button
                  onClick={() => handleStepLine('prev')}
                  style={{
                    background: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: '#F8FAFC',
                    fontWeight: 600
                  }}
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <button
                  onClick={() => handleStepLine('next')}
                  style={{
                    background: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: '#F8FAFC',
                    fontWeight: 600
                  }}
                >
                  Next <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => setIsPlayingLineByLine(!isPlayingLineByLine)}
                  style={{
                    background: isPlayingLineByLine ? '#DC2626' : '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isPlayingLineByLine ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isPlayingLineByLine ? 'Pause' : 'Auto Play'}</span>
                </button>
              </div>
            ) : (
              /* Quick Gate Snippets for Edit Mode */
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#93C5FD' }}>
                  Insert Gate:
                </span>
                {[
                  { label: '+ H(0)', code: 'qc.h(0)' },
                  { label: '+ X(0)', code: 'qc.x(0)' },
                  { label: '+ Z(0)', code: 'qc.z(0)' },
                  { label: '+ CX(0,1)', code: 'qc.cx(0, 1)' },
                  { label: '+ SWAP', code: 'qc.swap(0, 1)' },
                  { label: '+ Rz(π/4)', code: 'qc.rz(np.pi/4, 0)' },
                  { label: '+ Measure', code: 'qc.measure(0, 0)' }
                ].map((snip, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleInsertSnippet(snip.code)}
                    style={{
                      background: '#334155',
                      border: '1px solid #475569',
                      borderRadius: '5px',
                      padding: '2px 7px',
                      fontSize: '10.5px',
                      color: '#67E8F9',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title={`Insert ${snip.code}`}
                  >
                    {snip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Right Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editorTab === 'inspect' && lockedLineIndex !== null ? (
                <button
                  onClick={() => handleToggleLockLine(lockedLineIndex)}
                  style={{
                    background: '#F59E0B',
                    border: 'none',
                    color: '#0F172A',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Unlock size={12} />
                  <span>Unlock Line {lockedLineIndex + 1}</span>
                </button>
              ) : editorTab === 'edit' ? (
                <button
                  onClick={handleForceCompile}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={11} />
                  <span>Sync to Circuit</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Code Area: Either Inspect/Lock Mode OR Editable Textarea Mode */}
          {editorTab === 'inspect' ? (
            /* Mode 1: Interactive Line-Locking Blocks */
            <div style={{
              fontFamily: 'JetBrains Mono, Menlo, monospace',
              fontSize: '12px',
              maxHeight: '380px',
              overflowY: 'auto',
              background: '#0F172A',
              color: '#E2E8F0',
              padding: '8px 0',
              flex: 1
            }}>
              {codeLines.map((line, idx) => {
                const isLocked = lockedLineIndex === idx;
                const hasGate = parsedMapping.lineIndexToGateId[idx] !== undefined;
                const isComment = line.trim().startsWith('#') || line.trim().startsWith('//');

                return (
                  <div
                    key={idx}
                    onClick={() => hasGate && handleToggleLockLine(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '3px 12px',
                      background: isLocked ? 'rgba(245, 158, 11, 0.28)' : 'transparent',
                      borderLeft: isLocked ? '4px solid #F59E0B' : '4px solid transparent',
                      cursor: hasGate ? 'pointer' : 'default',
                      transition: 'background 0.15s ease'
                    }}
                    title={hasGate ? 'Click to lock this line and inspect its physics' : undefined}
                  >
                    {/* Line Number */}
                    <span style={{
                      width: '32px',
                      textAlign: 'right',
                      marginRight: '12px',
                      color: isLocked ? '#FBBF24' : '#64748B',
                      fontSize: '11px',
                      userSelect: 'none',
                      fontWeight: isLocked ? 800 : 400
                    }}>
                      {idx + 1}
                    </span>

                    {/* Lock Button for gate lines */}
                    <div style={{ width: '22px', display: 'flex', alignItems: 'center' }}>
                      {hasGate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLockLine(idx);
                          }}
                          style={{
                            background: isLocked ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
                            border: isLocked ? 'none' : '1px solid rgba(255, 255, 255, 0.25)',
                            color: isLocked ? '#0F172A' : '#E2E8F0',
                            borderRadius: '4px',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0
                          }}
                          title={isLocked ? 'Unlock line' : 'Lock line for physics breakdown'}
                        >
                          {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                        </button>
                      )}
                    </div>

                    {/* Line Code Content with Syntax Coloring */}
                    <span style={{
                      flex: 1,
                      marginLeft: '6px',
                      color: isComment
                        ? '#64748B'
                        : isLocked
                        ? '#FDE68A'
                        : line.includes('qc.') || line.includes('qml.') || line.includes('cirq.')
                        ? '#60A5FA'
                        : line.includes('import ') || line.includes('from ')
                        ? '#F472B6'
                        : '#F1F5F9',
                      fontWeight: isLocked ? 700 : 400,
                      whiteSpace: 'pre'
                    }}>
                      {line || ' '}
                    </span>

                    {/* Locked Badge */}
                    {isLocked && (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        background: '#F59E0B',
                        color: '#0F172A',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        marginLeft: '8px',
                        letterSpacing: '0.04em'
                      }}>
                        LOCKED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Mode 2: Direct Editable Monospaced Textarea */
            <div style={{
              display: 'flex',
              flex: 1,
              background: '#0B1120',
              position: 'relative',
              maxHeight: '380px',
              overflow: 'hidden'
            }}>
              {/* Line Numbers Gutter */}
              <div style={{
                width: '42px',
                padding: '10px 6px 10px 0',
                background: '#070C18',
                borderRight: '1px solid #1E293B',
                fontFamily: 'JetBrains Mono, Menlo, monospace',
                fontSize: '12px',
                lineHeight: '20px',
                color: '#475569',
                textAlign: 'right',
                userSelect: 'none',
                overflowY: 'hidden'
              }}>
                {codeLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Editable Textarea */}
              <textarea
                ref={textareaRef}
                value={editorText}
                onChange={(e) => handleEditorChange(e.target.value)}
                spellCheck={false}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: '#38BDF8',
                  fontFamily: 'JetBrains Mono, Menlo, monospace',
                  fontSize: '12px',
                  lineHeight: '20px',
                  padding: '10px 12px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  whiteSpace: 'pre',
                  overflowY: 'auto',
                  tabSize: 4
                }}
                placeholder="# Type your Qiskit code here... (e.g. qc.h(0), qc.cx(0, 1))"
              />
            </div>
          )}

          {/* Bottom Toolbar */}
          <div style={{
            padding: '8px 14px',
            background: '#1E293B',
            borderTop: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                {editorTab === 'inspect' ? 'Click 🔒 on any line to inspect physics.' : 'Type code freely; updates visual circuit in real time.'}
              </span>
            </div>

            {parseError ? (
              <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} /> {parseError}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={12} /> Circuit Synced ({gates.length} gates)
              </span>
            )}
          </div>
        </div>

        {/* Right: Locked Line Deep Dive & Physics Breakdown (F1 / F2 / Conceptual Analysis) */}
        <div style={{
          padding: '18px 20px',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflowY: 'auto',
          maxHeight: '440px'
        }}>
          {lockedLineIndex !== null && physicsDetails ? (
            <>
              {/* Header of locked line */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid #E2E8F0'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FDE68A'
                    }}>
                      Line {lockedLineIndex + 1} Locked
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#2563EB',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>
                      {physicsDetails.operation}
                    </span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {physicsDetails.title}
                  </h4>
                </div>

                <button
                  onClick={() => handleToggleLockLine(lockedLineIndex)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    color: '#64748B',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Unlock
                </button>
              </div>

              {/* Plain English & Physics Breakdown */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={14} color="#2563EB" />
                  <span>Physical Operation & Mechanism:</span>
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.55 }}>
                  {physicsDetails.physicsSummary}
                </p>
              </div>

              {/* State Transformation Formula */}
              <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '10px 14px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E3A8A', marginBottom: '4px' }}>
                  State Transformation Formula:
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1D4ED8'
                }}>
                  {physicsDetails.stateFormula}
                </div>
              </div>

              {/* Bloch Sphere Rotation & Matrix Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                {/* Bloch Sphere Trajectory */}
                <div style={{
                  background: '#FDF4FF',
                  border: '1px solid #F0ABFC',
                  borderRadius: '10px',
                  padding: '10px 12px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#86198F', marginBottom: '4px' }}>
                    Bloch Sphere Trajectory:
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#701A75', lineHeight: 1.45 }}>
                    {physicsDetails.blochAction}
                  </div>
                </div>

                {/* Unitary Matrix Table */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '10px 12px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Unitary Matrix:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${physicsDetails.matrixGrid[0].length}, 1fr)`,
                    gap: '4px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    textAlign: 'center'
                  }}>
                    {physicsDetails.matrixGrid.flat().map((elem, eIdx) => (
                      <div key={eIdx} style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '4px 2px',
                        fontWeight: 600,
                        color: '#0F172A'
                      }}>
                        {elem}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Entanglement Role & Reversibility */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '8px 10px'
                }}>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
                    Reversibility:
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                    {physicsDetails.reversibility}
                  </div>
                </div>

                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '8px 10px'
                }}>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
                    NISQ Hardware Fidelity:
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {physicsDetails.hardwareFidelity}
                  </div>
                </div>
              </div>

              {/* AI Tutor Prompt Button */}
              {onAskDirac && (
                <button
                  onClick={() => {
                    onAskDirac(`Can you explain in detail what line ${lockedLineIndex + 1} (${physicsDetails.operation}) does physically and mathematically in this quantum circuit? Specifically explain how it transforms the state amplitudes.`);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <Sparkles size={14} />
                  <span>Ask Dirac AI to Explain This Line In-Depth</span>
                </button>
              )}
            </>
          ) : (
            /* Default State when no line is locked */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              height: '100%',
              padding: '20px 10px',
              gap: '14px'
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Atom size={28} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  Interactive Quantum Line Inspector
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', maxWidth: '340px', lineHeight: 1.5 }}>
                  Click the 🔒 icon on any code line or type in <strong>Edit Code</strong> mode to build and analyze circuits in real-time.
                </p>
              </div>

              {/* Quick Lock Shortcuts for all gates in current circuit */}
              {gateLinesList.length > 0 && (
                <div style={{ width: '100%', maxWidth: '360px', marginTop: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px', textAlign: 'left' }}>
                    Quick Lock Gate Lines in this Circuit:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {gateLinesList.slice(0, 5).map(({ lineIdx, text }) => (
                      <button
                        key={lineIdx}
                        onClick={() => {
                          setEditorTab('inspect');
                          handleToggleLockLine(lineIdx);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 12px',
                          background: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1E3A8A' }}>
                          Line {lineIdx + 1}: {text.trim()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontSize: '11px', fontWeight: 700 }}>
                          <Lock size={11} /> Lock
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
