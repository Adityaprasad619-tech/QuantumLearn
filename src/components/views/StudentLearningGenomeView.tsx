// src/components/views/StudentLearningGenomeView.tsx
// Concept → lesson mapping so gaps can deep-link to curriculum notes
const CONCEPT_LESSON_MAP: Record<string, string> = {
  bits:             'lesson-1-1',
  qubit:            'lesson-1-1',
  measurement:      'lesson-1-1',
  phase:            'lesson-1-2',
  bloch:            'lesson-2-1',
  gates_x:          'lesson-3-1',
  gates_h:          'lesson-3-1',
  gates:            'lesson-3-1',
  entanglement:     'lesson-4-1',
  teleportation:    'lesson-4-1',
  grover:           'lesson-5-1',
  qft:              'lesson-5-1',
  shor:             'lesson-5-1',
  error_correction: 'lesson-6-1',
  hardware:         'lesson-6-1',
};
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserFrame } from '../ui/BrowserFrame';
import { LearnerModelService, ConceptMastery, ConceptualGap } from '../../learner/learnerModel';
import { UserProgress } from '../../types';
import { AuthUser } from '../../auth/authService';
import { soundEffects } from '../../audio/soundEffects';
import {
  Dna, Award, BrainCircuit, Target, AlertTriangle, CheckCircle2,
  Clock, Flame, ShieldAlert, Sparkles, ArrowRight, Zap, RefreshCw,
  BarChart2, BookOpen, Layers, Check, ChevronRight, Activity, HelpCircle,
  Network, GitBranch, Eye
} from 'lucide-react';

interface StudentLearningGenomeViewProps {
  progress: UserProgress;
  onNavigateToView: (view: any) => void;
  onSelectLesson?: (lessonId: string) => void;
  onAskDirac: (prompt: string) => void;
  authUser?: AuthUser | null;
}

interface GenomeDomain {
  id: string;
  name: string;
  icon: string;
  color: string;
  subtopics: {
    id: string;
    name: string;
    conceptId: string;
    description: string;
    masteryPercent: number;
    status: 'mastered' | 'proficient' | 'developing' | 'lacking';
    studyTimeMins: number;
    quizAccuracy: number;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DNA HELIX SVG VISUALIZATION
// ─────────────────────────────────────────────────────────────────────────────
const DNAHelixViz: React.FC<{ domains: GenomeDomain[]; overallScore: number; onSelectDomain: (id: string) => void; selectedDomain: string | null }> = ({
  domains, overallScore, onSelectDomain, selectedDomain
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;

    const render = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      timeRef.current = t;

      const speed = 0.0008;
      const amplitude = 90;
      const segCount = 40;
      const segH = H / segCount;
      const allSubtopics = domains.flatMap(d => d.subtopics);
      const totalSubtopics = allSubtopics.length;

      // Draw helix backbone strands
      for (let strand = 0; strand < 2; strand++) {
        const phaseOffset = strand === 0 ? 0 : Math.PI;
        ctx.beginPath();
        for (let i = 0; i <= segCount * 4; i++) {
          const y = (i / (segCount * 4)) * H;
          const angle = (i / segCount) * Math.PI * 2 + t * speed * 1000 + phaseOffset;
          const x = cx + Math.cos(angle) * amplitude;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = strand === 0 ? 'rgba(37, 99, 235, 0.25)' : 'rgba(124, 58, 237, 0.25)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw cross-links (base pairs) mapped to subtopics
      for (let i = 0; i < segCount; i++) {
        const y = (i / segCount) * H + segH / 2;
        const angle = (i / segCount) * Math.PI * 2 * 2 + t * speed * 1000;
        const x1 = cx + Math.cos(angle) * amplitude;
        const x2 = cx + Math.cos(angle + Math.PI) * amplitude;

        const subIdx = i % totalSubtopics;
        const sub = allSubtopics[subIdx];
        const domain = domains.find(d => d.subtopics.some(s => s.id === sub?.id));
        const mastery = sub ? sub.masteryPercent / 100 : 0.5;

        // Cross-link color based on mastery
        const linkColor = mastery >= 0.8 ? '#10B981' : mastery >= 0.65 ? '#3B82F6' : mastery >= 0.45 ? '#F59E0B' : '#EF4444';
        const alpha = 0.5 + mastery * 0.5;

        // Draw cross-link
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = linkColor;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw nucleotide circles
        [x1, x2].forEach((x, si) => {
          const radius = 5 + mastery * 5;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = si === 0
            ? (domain?.color || '#2563EB')
            : linkColor;
          ctx.globalAlpha = 0.8;
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // Glow for mastered
        if (mastery >= 0.8) {
          ctx.beginPath();
          ctx.arc((x1 + x2) / 2, y, 14 + Math.sin(t * 0.003 + i) * 3, 0, Math.PI * 2);
          ctx.fillStyle = '#10B98112';
          ctx.fill();
        }
      }

      // Center score ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, H / 2, 42, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.shadowColor = '#2563EB';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.restore();

      // Score arc
      ctx.beginPath();
      ctx.arc(cx, H / 2, 42, -Math.PI / 2, -Math.PI / 2 + (overallScore / 100) * Math.PI * 2);
      ctx.strokeStyle = overallScore >= 70 ? '#10B981' : overallScore >= 45 ? '#3B82F6' : '#EF4444';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Score text
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'bold 18px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${overallScore}%`, cx, H / 2 + 6);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [domains, overallScore]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={480}
      style={{ display: 'block' }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MIND MAP / FORCE GRAPH VISUALIZATION
// ─────────────────────────────────────────────────────────────────────────────
interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  color: string;
  mastery: number;
  isDomain: boolean;
  domainColor?: string;
}

const wrapMindMapLabel = (label: string, maxChars: number): string[] => {
  const words = label.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  words.forEach(word => {
    if (word.length > maxChars) {
      if (line) {
        lines.push(line);
        line = '';
      }
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
      return;
    }

    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines.slice(0, 3);
};

const MindMapViz: React.FC<{ domains: GenomeDomain[]; onSelectNode: (id: string) => void; selectedNode: string | null }> = ({
  domains, onSelectNode, selectedNode
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [edges, setEdges] = useState<{ from: string; to: string; color: string }[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [animTick, setAnimTick] = useState(0);

  useEffect(() => {
    const W = 760;
    const H = 500;
    const cx = W / 2;
    const cy = H / 2;
    const domainRadius = 175;

    const newNodes: MindMapNode[] = [];
    const newEdges: { from: string; to: string; color: string }[] = [];

    // Central node
    newNodes.push({
      id: 'center',
      label: 'Quantum\nLearning',
      x: cx, y: cy,
      r: 42, color: '#1E3A8A',
      mastery: domains.flatMap(d => d.subtopics).reduce((a, b) => a + b.masteryPercent, 0) / domains.flatMap(d => d.subtopics).length / 100,
      isDomain: true,
    });

    domains.forEach((domain, di) => {
      const angle = (di / domains.length) * Math.PI * 2 - Math.PI / 2;
      const dx = cx + Math.cos(angle) * domainRadius;
      const dy = cy + Math.sin(angle) * domainRadius;
      const domainMastery = domain.subtopics.reduce((a, b) => a + b.masteryPercent, 0) / domain.subtopics.length / 100;

      newNodes.push({
        id: domain.id,
        label: domain.name.split(' ')[0],
        x: dx, y: dy,
        r: 30 + domainMastery * 8,
        color: domain.color,
        mastery: domainMastery,
        isDomain: true,
      });

      newEdges.push({ from: 'center', to: domain.id, color: domain.color });

      domain.subtopics.forEach((sub, si) => {
        const subAngle = angle + (si - (domain.subtopics.length - 1) / 2) * 0.45;
        const subDist = 122 + (sub.masteryPercent / 100) * 8;
        const sx = dx + Math.cos(subAngle) * subDist;
        const sy = dy + Math.sin(subAngle) * subDist;
        const nodeRadius = 27 + (sub.masteryPercent / 100) * 6;

        newNodes.push({
          id: sub.id,
          label: sub.name,
          x: Math.max(nodeRadius + 8, Math.min(W - nodeRadius - 8, sx)),
          y: Math.max(nodeRadius + 8, Math.min(H - nodeRadius - 8, sy)),
          r: nodeRadius,
          color: sub.status === 'mastered' ? '#10B981' : sub.status === 'proficient' ? '#3B82F6' : sub.status === 'developing' ? '#F59E0B' : '#EF4444',
          mastery: sub.masteryPercent / 100,
          isDomain: false,
          domainColor: domain.color,
        });

        newEdges.push({ from: domain.id, to: sub.id, color: domain.color });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [domains]);

  // Pulse animation
  useEffect(() => {
    const id = setInterval(() => setAnimTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const getNode = (id: string) => nodes.find(n => n.id === id);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 760 500"
      width="100%"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {nodes.map(n => (
          <radialGradient key={`grad-${n.id}`} id={`grad-${n.id}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor={n.color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={n.color} stopOpacity="0.6" />
          </radialGradient>
        ))}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map((e, i) => {
        const from = getNode(e.from);
        const to = getNode(e.to);
        if (!from || !to) return null;
        const isHighlighted = selectedNode === e.from || selectedNode === e.to || hovered === e.from || hovered === e.to;
        return (
          <line
            key={`edge-${i}`}
            x1={from.x} y1={from.y}
            x2={to.x} y2={to.y}
            stroke={e.color}
            strokeWidth={isHighlighted ? 2.5 : 1.2}
            strokeOpacity={isHighlighted ? 0.8 : 0.3}
            style={{ transition: 'all 0.2s' }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => {
        const isSelected = selectedNode === n.id;
        const isHovered = hovered === n.id;
        const pulse = Math.sin(animTick * 0.08 + n.x * 0.02) * 2;
        const r = n.r + (isSelected || isHovered ? 4 : 0);

        return (
          <g
            key={n.id}
            onClick={() => onSelectNode(n.id)}
            onMouseEnter={() => setHovered(n.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Outer glow ring for mastered */}
            {n.mastery >= 0.8 && (
              <circle
                cx={n.x} cy={n.y}
                r={r + 8 + pulse}
                fill="none"
                stroke="#10B981"
                strokeWidth={1.5}
                strokeOpacity={0.3 + 0.2 * Math.sin(animTick * 0.1)}
              />
            )}

            {/* Selected ring */}
            {(isSelected || isHovered) && (
              <circle
                cx={n.x} cy={n.y} r={r + 5}
                fill="none" stroke={n.color}
                strokeWidth={2} strokeOpacity={0.6}
                strokeDasharray="4,3"
              />
            )}

            {/* Main circle */}
            <circle
              cx={n.x} cy={n.y} r={r}
              fill={`url(#grad-${n.id})`}
              filter={isSelected ? 'url(#glow)' : undefined}
              style={{ transition: 'all 0.2s' }}
            />

            {/* Mastery arc */}
            {n.isDomain && (
              <circle
                cx={n.x} cy={n.y} r={r}
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={3}
                strokeDasharray={`${n.mastery * 2 * Math.PI * r} ${2 * Math.PI * r}`}
                strokeDashoffset={Math.PI * r / 2}
              />
            )}

            {/* Label */}
            <text
              x={n.x} y={n.y - ((n.isDomain ? 9 : 7) * (wrapMindMapLabel(n.label, n.isDomain ? 9 : 10).length - 1)) / 2}
              textAnchor="middle"
              fontSize={n.isDomain ? 8.5 : 7.2}
              fontWeight={800}
              fill="#FFFFFF"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {wrapMindMapLabel(n.label, n.isDomain ? 9 : 10).map((line, li) => (
                <tspan key={li} x={n.x} dy={li === 0 ? 0 : (n.isDomain ? 9 : 7)}>{line}</tspan>
              ))}
            </text>

            {/* Mastery % for domain nodes */}
            {n.isDomain && n.id !== 'center' && (
              <text
                x={n.x} y={n.y + 14}
                textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.8)"
                fontFamily="JetBrains Mono, monospace" fontWeight={700}
                style={{ pointerEvents: 'none' }}
              >
                {Math.round(n.mastery * 100)}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RADAR CHART
// ─────────────────────────────────────────────────────────────────────────────
const RadarChart: React.FC<{ domains: GenomeDomain[] }> = ({ domains }) => {
  const cx = 160, cy = 160, R = 120;
  const n = domains.length;
  const angles = domains.map((_, i) => (i / n) * Math.PI * 2 - Math.PI / 2);

  const domainAvgs = domains.map(d =>
    d.subtopics.reduce((a, b) => a + b.masteryPercent, 0) / d.subtopics.length / 100
  );

  const points = angles.map((a, i) => ({
    x: cx + Math.cos(a) * R * domainAvgs[i],
    y: cy + Math.sin(a) * R * domainAvgs[i],
  }));

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox="0 0 320 320" width="100%" style={{ maxWidth: 260 }}>
      <defs>
        <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Grid rings */}
      {gridLevels.map((lvl, li) => {
        const gridPts = angles.map(a => ({
          x: cx + Math.cos(a) * R * lvl,
          y: cy + Math.sin(a) * R * lvl,
        }));
        return (
          <polygon
            key={li}
            points={gridPts.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={cx + Math.cos(a) * R}
          y2={cy + Math.sin(a) * R}
          stroke="#E2E8F0" strokeWidth={1}
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="url(#radarGrad)"
        stroke="#2563EB"
        strokeWidth={2}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4}
          fill={domains[i].color} stroke="#FFF" strokeWidth={1.5} />
      ))}

      {/* Labels */}
      {angles.map((a, i) => {
        const labelR = R + 24;
        const lx = cx + Math.cos(a) * labelR;
        const ly = cy + Math.sin(a) * labelR;
        return (
          <g key={i}>
            <text x={lx} y={ly - 3} textAnchor="middle" fontSize={7.5}
              fontWeight={700} fill={domains[i].color}>
              {domains[i].icon}
            </text>
            <text x={lx} y={ly + 9} textAnchor="middle" fontSize={6.5}
              fill="#475569" fontWeight={600}>
              {Math.round(domainAvgs[i] * 100)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN VIEW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const StudentLearningGenomeView: React.FC<StudentLearningGenomeViewProps> = ({
  progress,
  onNavigateToView,
  onSelectLesson,
  onAskDirac,
  authUser
}) => {
  const [profile, setProfile] = useState(() => LearnerModelService.getProfile());
  const [selectedSubtopic, setSelectedSubtopic] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'mindmap' | 'dna' | 'gaps' | 'quizzes' | 'interactions'>('mindmap');
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);
  const [selectedDNA, setSelectedDNA] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = LearnerModelService.subscribe(() => {
      setProfile(LearnerModelService.getProfile());
    });
    return unsubscribe;
  }, []);

  const concepts = profile.concepts;
  const roadmap = LearnerModelService.generateRoadmap();

  const getScore = (id: string) => concepts[id] ? Math.round(concepts[id].score * 100) : 50;
  const getAccuracy = (id: string) => {
    const c = concepts[id];
    if (!c || c.attempts === 0) return 0;
    return Math.round((c.correctAttempts / c.attempts) * 100);
  };
  const getTime = (id: string) => concepts[id]?.timeSpentMinutes || 15;
  const getStatus = (score: number): 'mastered' | 'proficient' | 'developing' | 'lacking' => {
    if (score >= 80) return 'mastered';
    if (score >= 65) return 'proficient';
    if (score >= 45) return 'developing';
    return 'lacking';
  };

  const GENOME_DOMAINS: GenomeDomain[] = [
    {
      id: 'foundations',
      name: 'Information & State Vectors',
      icon: '⚛️',
      color: '#2563EB',
      subtopics: [
        { id: 'classical_bits', name: 'Classical Bits & Voltage Logic', conceptId: 'bits', description: 'Deterministic binary switches and macroscopic electrical constraints.', masteryPercent: getScore('bits'), status: getStatus(getScore('bits')), studyTimeMins: getTime('bits'), quizAccuracy: getAccuracy('bits') },
        { id: 'qubit_superposition', name: 'Superposition & Amplitude Normalization', conceptId: 'qubit', description: 'Complex linear combinations α|0⟩ + β|1⟩ with Born constraint |α|² + |β|² = 1.', masteryPercent: getScore('qubit'), status: getStatus(getScore('qubit')), studyTimeMins: getTime('qubit'), quizAccuracy: getAccuracy('qubit') },
        { id: 'born_measurement', name: 'Born Probability Rule & Wave Collapse', conceptId: 'measurement', description: 'Irreversible state projection upon computational basis observation.', masteryPercent: getScore('measurement'), status: getStatus(getScore('measurement')), studyTimeMins: getTime('measurement'), quizAccuracy: getAccuracy('measurement') }
      ]
    },
    {
      id: 'phase_geometry',
      name: 'Phase, Interference & Bloch',
      icon: '🌐',
      color: '#7C3AED',
      subtopics: [
        { id: 'relative_phase', name: 'Quantum Phase & Amplitude Interference', conceptId: 'phase', description: 'Constructive vs destructive cancellation of complex amplitudes.', masteryPercent: getScore('phase'), status: getStatus(getScore('phase')), studyTimeMins: getTime('phase'), quizAccuracy: getAccuracy('phase') },
        { id: 'bloch_geometry', name: '3D Bloch Sphere Polar Coordinates', conceptId: 'bloch', description: 'Mapping ℂ² Hilbert space to unit sphere S² via polar θ and azimuth φ.', masteryPercent: getScore('bloch'), status: getStatus(getScore('bloch')), studyTimeMins: getTime('bloch'), quizAccuracy: getAccuracy('bloch') }
      ]
    },
    {
      id: 'unitary_gates',
      name: 'Unitary Quantum Logic & Gates',
      icon: '🎛️',
      color: '#0891B2',
      subtopics: [
        { id: 'pauli_x', name: 'Pauli-X Bit Flip Operator', conceptId: 'gates_x', description: '180° rotation around X-axis mapping |0⟩ ↔ |1⟩.', masteryPercent: getScore('gates_x'), status: getStatus(getScore('gates_x')), studyTimeMins: getTime('gates_x'), quizAccuracy: getAccuracy('gates_x') },
        { id: 'hadamard_h', name: 'Hadamard Equal Superposition Gate', conceptId: 'gates_h', description: 'Generates computational basis superposition |+⟩ and |-⟩.', masteryPercent: getScore('gates_h'), status: getStatus(getScore('gates_h')), studyTimeMins: getTime('gates_h'), quizAccuracy: getAccuracy('gates_h') },
        { id: 'unitary_rotations', name: 'Arbitrary Unitary Matrix Transformations', conceptId: 'gates', description: 'Reversible matrix rotations U†U = I preserving norm.', masteryPercent: getScore('gates'), status: getStatus(getScore('gates')), studyTimeMins: getTime('gates'), quizAccuracy: getAccuracy('gates') }
      ]
    },
    {
      id: 'entanglement_multi',
      name: 'Entanglement & Multi-Qubit',
      icon: '🔗',
      color: '#EA580C',
      subtopics: [
        { id: 'bell_states', name: 'Bell States & EPR Entanglement', conceptId: 'entanglement', description: 'Maximally entangled non-separable 2-qubit states and CNOT logic.', masteryPercent: getScore('entanglement'), status: getStatus(getScore('entanglement')), studyTimeMins: getTime('entanglement'), quizAccuracy: getAccuracy('entanglement') },
        { id: 'teleportation_proto', name: 'Quantum Teleportation & Classical Link', conceptId: 'teleportation', description: 'Transferring unknown quantum states via EPR pairs and 2 classical bits.', masteryPercent: getScore('teleportation'), status: getStatus(getScore('teleportation')), studyTimeMins: getTime('teleportation'), quizAccuracy: getAccuracy('teleportation') }
      ]
    },
    {
      id: 'algorithms_speedup',
      name: 'Algorithms & Speedups',
      icon: '⚡',
      color: '#D97706',
      subtopics: [
        { id: 'grover_search', name: "Grover's Amplitude Amplification", conceptId: 'grover', description: 'Unstructured database search in O(√N) via phase oracle and diffusion.', masteryPercent: getScore('grover'), status: getStatus(getScore('grover')), studyTimeMins: getTime('grover'), quizAccuracy: getAccuracy('grover') },
        { id: 'qft_engine', name: 'Quantum Fourier Transform (QFT)', conceptId: 'qft', description: 'Discrete Fourier transform on amplitudes in O(n²) quantum gates.', masteryPercent: getScore('qft'), status: getStatus(getScore('qft')), studyTimeMins: getTime('qft'), quizAccuracy: getAccuracy('qft') },
        { id: 'shor_factoring', name: "Shor's Factoring & Order Finding", conceptId: 'shor', description: 'Exponential speedup for RSA prime factorization via quantum phase estimation.', masteryPercent: getScore('shor'), status: getStatus(getScore('shor')), studyTimeMins: getTime('shor'), quizAccuracy: getAccuracy('shor') }
      ]
    },
    {
      id: 'hardware_noise',
      name: 'Decoherence & Hardware',
      icon: '🛡️',
      color: '#059669',
      subtopics: [
        { id: 'decoherence_t1t2', name: 'Decoherence (T1/T2) & 3-Qubit Code', conceptId: 'error_correction', description: 'Syndrome measurements, energy relaxation, and surface code thresholds.', masteryPercent: getScore('error_correction'), status: getStatus(getScore('error_correction')), studyTimeMins: getTime('error_correction'), quizAccuracy: getAccuracy('error_correction') },
        { id: 'transmon_qpu', name: 'Transmon Superconducting Chip Physics', conceptId: 'hardware', description: 'Josephson junctions, cryogenic cooling (15 mK), and microwave pulse control.', masteryPercent: getScore('hardware'), status: getStatus(getScore('hardware')), studyTimeMins: getTime('hardware'), quizAccuracy: getAccuracy('hardware') }
      ]
    }
  ];

  const allSubtopics = GENOME_DOMAINS.flatMap(d => d.subtopics);
  const masteredCount = allSubtopics.filter(s => s.status === 'mastered').length;
  const proficientCount = allSubtopics.filter(s => s.status === 'proficient').length;
  const developingCount = allSubtopics.filter(s => s.status === 'developing').length;
  const totalStudyMinutes = allSubtopics.reduce((acc, s) => acc + s.studyTimeMins, 0);
  const overallGenomeScore = Math.round(
    allSubtopics.reduce((acc, s) => acc + s.masteryPercent, 0) / allSubtopics.length
  );

  // Find the selected domain from mindmap selection
  const selectedDomainData = selectedMapNode
    ? GENOME_DOMAINS.find(d => d.id === selectedMapNode || d.subtopics.some(s => s.id === selectedMapNode))
    : null;
  const selectedSubtopicData = selectedMapNode
    ? allSubtopics.find(s => s.id === selectedMapNode)
    : null;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 60px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <BrowserFrame
        url="quantum-lab://analytics/student-learning-genome"
        badgeText="Genome v4.0 Active"
        badgeColor="#7C3AED"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="navy-pill-badge" style={{ fontSize: '11px' }}>Adaptive Knowledge Genome</span>
              <span className="coral-pill-badge" style={{ fontSize: '11px' }}>Bayesian Knowledge Tracing</span>
            </div>
            <h1 className="editorial-title" style={{ fontSize: '32px', fontWeight: 800, color: '#1E3A8A', margin: 0, letterSpacing: '-0.02em' }}>
              Student Learning Genome
            </h1>
            <p className="editorial-subtitle" style={{ fontSize: '14px', color: '#334155', margin: '8px 0 0 0', maxWidth: '720px', lineHeight: '1.6' }}>
              Your full competency DNA — topic-by-topic mastery, conceptual gaps, quiz history, and interactive mind-map.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '14px 20px', background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 14px -2px rgba(30,58,138,0.08)' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                <Dna size={22} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Genome Synthesis</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E3A8A', fontFamily: 'JetBrains Mono, monospace' }}>{overallGenomeScore}%</div>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Mastered', value: `${masteredCount}/${allSubtopics.length}`, sub: 'Score > 80%', color: '#059669', bg: '#DCFCE7', border: '#BBF7D0' },
          { label: 'Proficient', value: proficientCount, sub: '65% – 79%', color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE' },
          { label: 'Developing', value: developingCount, sub: '45% – 64%', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
          { label: 'Gaps Found', value: roadmap.conceptualGaps.length, sub: 'Need review', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
          { label: 'Time Invested', value: `${totalStudyMinutes}m`, sub: 'Total study', color: '#475569', bg: '#F1F5F9', border: '#E2E8F0' },
          { label: 'XP Earned', value: progress.xp, sub: `Level ${progress.level}`, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
        ].map(s => (
          <div key={s.label} style={{ background: '#FFFFFF', border: `1px solid ${s.border}`, borderRadius: '12px', padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: s.color, textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '6px', padding: '5px', background: '#F1F5F9', borderRadius: '12px', width: 'fit-content', flexWrap: 'wrap' }}>
        {[
          { id: 'mindmap', label: 'Knowledge Mind Map', icon: Network },
          { id: 'dna', label: 'DNA Helix + Radar', icon: Dna },
          { id: 'gaps', label: `Conceptual Gaps (${roadmap.conceptualGaps.length})`, icon: ShieldAlert },
          { id: 'quizzes', label: 'Quiz Records', icon: Award },
          { id: 'interactions', label: 'Lab Telemetry', icon: Activity },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => { soundEffects.playGateClick(); setActiveTab(tab.id as any); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px',
                borderRadius: '8px', border: 'none',
                background: isActive ? '#1E3A8A' : 'transparent',
                color: isActive ? '#FFFFFF' : '#475569',
                fontSize: '12.5px', fontWeight: isActive ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}>
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB: KNOWLEDGE MIND MAP ── */}
      {activeTab === 'mindmap' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Network size={16} color="#1E3A8A" />
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>Knowledge Graph — All Topics</span>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { color: '#10B981', label: 'Mastered' },
                  { color: '#3B82F6', label: 'Proficient' },
                  { color: '#F59E0B', label: 'Developing' },
                  { color: '#EF4444', label: 'Lacking' },
                ].map(l => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#475569', fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <MindMapViz
                domains={GENOME_DOMAINS}
                onSelectNode={setSelectedMapNode}
                selectedNode={selectedMapNode}
              />
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedSubtopicData ? (
              <div style={{
                background: '#FFFFFF', border: `2px solid ${selectedSubtopicData.status === 'mastered' ? '#10B981' : selectedSubtopicData.status === 'lacking' ? '#EF4444' : '#3B82F6'}`,
                borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 12
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Selected Subtopic</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{selectedSubtopicData.name}</div>
                <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{selectedSubtopicData.description}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 5,
                    background: selectedSubtopicData.status === 'mastered' ? '#DCFCE7' : selectedSubtopicData.status === 'proficient' ? '#DBEAFE' : selectedSubtopicData.status === 'developing' ? '#FEF3C7' : '#FEE2E2',
                    color: selectedSubtopicData.status === 'mastered' ? '#166534' : selectedSubtopicData.status === 'proficient' ? '#1E40AF' : selectedSubtopicData.status === 'developing' ? '#92400E' : '#991B1B'
                  }}>{selectedSubtopicData.status}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#1E3A8A', fontFamily: 'JetBrains Mono' }}>{selectedSubtopicData.masteryPercent}%</span>
                </div>

                <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${selectedSubtopicData.masteryPercent}%`, background: selectedSubtopicData.status === 'mastered' ? '#10B981' : selectedSubtopicData.status === 'lacking' ? '#EF4444' : '#3B82F6', borderRadius: 4, transition: 'width 0.4s' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Quiz Accuracy', value: `${selectedSubtopicData.quizAccuracy}%` },
                    { label: 'Study Time', value: `${selectedSubtopicData.studyTimeMins}m` },
                  ].map(m => (
                    <div key={m.label} style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>{m.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono' }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                <button onClick={() => onAskDirac(`Explain ${selectedSubtopicData.name} and help me close the knowledge gap in it.`)}
                  style={{ padding: '8px 14px', background: '#1E3A8A', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={13} /> Ask Dirac AI
                </button>
              </div>
            ) : (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18, textAlign: 'center' }}>
                <Network size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Select any node</div>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Click a topic or subtopic in the graph to see detailed analytics.</p>
              </div>
            )}

            {/* Domain legend */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 10, textTransform: 'uppercase' }}>Domain Overview</div>
              {GENOME_DOMAINS.map(d => {
                const avg = Math.round(d.subtopics.reduce((a, b) => a + b.masteryPercent, 0) / d.subtopics.length);
                return (
                  <div key={d.id} onClick={() => setSelectedMapNode(d.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid #F8FAFC' }}>
                    <span style={{ fontSize: 14 }}>{d.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#0F172A' }}>{d.name}</div>
                      <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, marginTop: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${avg}%`, background: d.color, borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 800, color: d.color }}>{avg}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: DNA HELIX + RADAR ── */}
      {activeTab === 'dna' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }}>
          {/* DNA Helix */}
          <div style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)', borderRadius: 20, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 8px 40px rgba(30,58,138,0.3)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              DNA Strand
            </div>
            <DNAHelixViz
              domains={GENOME_DOMAINS}
              overallScore={overallGenomeScore}
              onSelectDomain={setSelectedDNA}
              selectedDomain={selectedDNA}
            />
            <div style={{ fontSize: 10, color: '#64748B', textAlign: 'center', lineHeight: 1.5 }}>
              Each cross-link = one subtopic<br />
              <span style={{ color: '#10B981' }}>■</span> mastered &nbsp;
              <span style={{ color: '#F59E0B' }}>■</span> developing &nbsp;
              <span style={{ color: '#EF4444' }}>■</span> gap
            </div>
          </div>

          {/* Right column: Radar + domain breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '20px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart2 size={16} color="#1E3A8A" /> Competency Radar
              </div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <RadarChart domains={GENOME_DOMAINS} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {GENOME_DOMAINS.map(d => {
                    const avg = Math.round(d.subtopics.reduce((a, b) => a + b.masteryPercent, 0) / d.subtopics.length);
                    const status = avg >= 80 ? 'mastered' : avg >= 65 ? 'proficient' : avg >= 45 ? 'developing' : 'lacking';
                    const statusColor = { mastered: '#10B981', proficient: '#3B82F6', developing: '#F59E0B', lacking: '#EF4444' }[status];
                    return (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{d.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{d.name}</span>
                            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 800, color: statusColor }}>{avg}%</span>
                          </div>
                          <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${avg}%`, background: d.color, borderRadius: 3, transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subtopics heat-map */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>🧬 Knowledge Strand — All Subtopics</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allSubtopics.map(sub => {
                  const statusColor = sub.status === 'mastered' ? '#10B981' : sub.status === 'proficient' ? '#3B82F6' : sub.status === 'developing' ? '#F59E0B' : '#EF4444';
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubtopic(sub)}
                      title={`${sub.name}: ${sub.masteryPercent}%`}
                      style={{
                        width: 44, height: 44, borderRadius: 8, cursor: 'pointer',
                        background: statusColor,
                        opacity: 0.3 + (sub.masteryPercent / 100) * 0.7,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color: '#FFF',
                        border: selectedSubtopic?.id === sub.id ? '2px solid #0F172A' : '2px solid transparent',
                        transition: 'all 0.15s'
                      }}
                    >
                      {sub.masteryPercent}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: '#94A3B8' }}>Each cell = one subtopic, color intensity = mastery level. Click to inspect.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: CONCEPTUAL GAPS ── */}
      {activeTab === 'gaps' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 4px 20px rgba(220,38,38,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#991B1B' }}>Diagnosed Conceptual Gaps</h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>Active error patterns, repeated incorrect predictions, or low retention.</p>
              </div>
            </div>
            <button onClick={() => onAskDirac('Please audit my entire quantum learning genome, analyze my conceptual gaps, and provide a 3-step action plan to reach 100% mastery.')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              <Sparkles size={14} color="#FBBF24" /> Generate AI Learning Audit
            </button>
          </div>

          {roadmap.conceptualGaps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle2 size={48} color="#10B981" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: '#065F46' }}>No Critical Gaps!</div>
              <p style={{ color: '#64748B', fontSize: 14 }}>Keep practicing to maintain mastery.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {roadmap.conceptualGaps.map(gap => (
                <div key={gap.conceptId} style={{ padding: 18, borderRadius: 12, background: gap.severity === 'high' ? '#FEF2F2' : '#FFFBEB', border: gap.severity === 'high' ? '1px solid #FCA5A5' : '1px solid #FDE68A', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{gap.conceptName}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, background: gap.severity === 'high' ? '#EF4444' : '#F59E0B', color: '#FFF' }}>
                      {gap.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{gap.gapDescription}</div>
                  <div style={{ fontSize: 12, color: '#64748B', background: 'rgba(255,255,255,0.8)', padding: '8px 10px', borderRadius: 6 }}>
                    <strong>Remedy:</strong> {gap.recommendedAction}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={() => onNavigateToView('quiz-practice')} style={{ flex: 1, minWidth: 100, padding: '7px', background: '#1E3A8A', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Practice Quiz
                    </button>
                    {onSelectLesson && CONCEPT_LESSON_MAP[gap.conceptId] && (
                      <button
                        onClick={() => {
                          onSelectLesson!(CONCEPT_LESSON_MAP[gap.conceptId]);
                        }}
                        style={{ flex: 1, minWidth: 100, padding: '7px', background: '#F0FDF4', color: '#065F46', border: '1px solid #BBF7D0', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                      >
                        📖 View Notes
                      </button>
                    )}
                    <button onClick={() => onAskDirac(`Can you explain the conceptual trap in ${gap.conceptName}? Diagnosis: ${gap.gapDescription}`)}
                      style={{ flex: 1, minWidth: 100, padding: '7px', background: '#FFFFFF', color: '#1E3A8A', border: '1px solid #BFDBFE', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Ask Dirac AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: QUIZ RECORDS ── */}
      {activeTab === 'quizzes' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 20px rgba(30,58,138,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1E3A8A' }}>Past Quizzes & Assessment Records</h3>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>Historical test logs with BKT score updates and error patterns.</p>
            </div>
            <button onClick={() => onNavigateToView('quiz-practice')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Launch Quiz Arena <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                  {['Topic & Concept', 'Total Attempts', 'Correct', 'Accuracy %', 'Active Mistakes', 'BKT Mastery'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.values(concepts).map((c) => {
                  const acc = c.attempts > 0 ? Math.round((c.correctAttempts / c.attempts) * 100) : 0;
                  const mastery = Math.round(c.score * 100);
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{c.name}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>{c.attempts}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#059669', fontWeight: 700 }}>{c.correctAttempts}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 13, color: acc >= 75 ? '#059669' : acc >= 50 ? '#D97706' : '#DC2626' }}>
                          {acc}%
                        </span>
                        <div style={{ height: 3, background: '#F1F5F9', borderRadius: 2, marginTop: 3, width: 60, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${acc}%`, background: acc >= 75 ? '#10B981' : acc >= 50 ? '#F59E0B' : '#EF4444', borderRadius: 2 }} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: c.consecutiveMistakes > 0 ? '#DC2626' : '#64748B' }}>
                        {c.consecutiveMistakes > 0 ? `⚠ ${c.consecutiveMistakes}` : '✓ 0'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 14, color: mastery >= 80 ? '#059669' : mastery >= 60 ? '#2563EB' : '#DC2626' }}>
                          {mastery}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: LAB TELEMETRY ── */}
      {activeTab === 'interactions' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1E3A8A' }}>Laboratory Interactions & Telemetry</h3>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>Real-time records of circuit simulations, Bloch sphere labs, and prediction challenges.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {Object.values(concepts).map(c => {
              const predAcc = Math.round(c.predictionAccuracy * 100);
              return (
                <div key={c.id} style={{ padding: 16, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{c.name}</div>
                  {[
                    { label: 'Lab Simulations', value: `${c.simulationInteractions} actions`, color: '#1E3A8A' },
                    { label: 'Prediction Accuracy', value: `${predAcc}% (${c.correctPredictions}/${c.predictionsCount})`, color: '#059669' },
                    { label: 'Time Invested', value: `${c.timeSpentMinutes} mins`, color: '#475569' },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: '#64748B' }}>{m.label}</span>
                      <span style={{ fontWeight: 700, color: m.color, fontFamily: 'JetBrains Mono' }}>{m.value}</span>
                    </div>
                  ))}
                  <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(c.score * 100)}%`, background: '#3B82F6', borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
