// src/components/views/AdaptiveChallengeView.tsx
// F29 (Adaptive Challenge Generator) + F26 (Misconception Detection) + F24 (Learning Digital Twin)
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserFrame } from '../ui/BrowserFrame';
import { authService } from '../../auth/authService';
import {
  Brain, Target, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, Sparkles, Clock, Zap, BarChart2, RefreshCw, Trophy, BookOpen
} from 'lucide-react';

interface AdaptiveChallengeViewProps {
  onAskDirac: (prompt: string) => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  targetConcept: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'circuit_build' | 'code_debug' | 'prediction' | 'concept_quiz';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  misconceptionTargeted?: string; // F26
  adaptedFrom?: string; // F24: which weakness triggered this
  hint: string;
  xpReward: number;
}

// F26: Known quantum misconceptions to detect and target
const MISCONCEPTIONS: Record<string, { name: string; description: string; targetedBy: string[] }> = {
  'control_target_swap': {
    name: 'Control/Target Swap',
    description: 'Confusing which qubit is the control vs target in CNOT/CX gates',
    targetedBy: ['circuit_build', 'prediction']
  },
  'h_h_identity': {
    name: 'H² = I Not Memorized',
    description: 'Not recognizing that two Hadamards cancel back to identity',
    targetedBy: ['circuit_build', 'code_debug']
  },
  'superposition_collapse': {
    name: 'Measurement Collapse',
    description: 'Misunderstanding that measurement irreversibly collapses superposition',
    targetedBy: ['concept_quiz', 'prediction']
  },
  'entanglement_speed': {
    name: 'Faster-than-light Entanglement',
    description: "Believing entanglement transmits information faster than light (it doesn't)",
    targetedBy: ['concept_quiz']
  },
  'phase_global_local': {
    name: 'Global vs Relative Phase',
    description: 'Confusing global phase (unobservable) with relative phase (observable)',
    targetedBy: ['concept_quiz', 'prediction']
  },
};

// Adaptive challenge bank organized by concept weakness
const CHALLENGE_BANK: Challenge[] = [
  // Superposition challenges
  {
    id: 'ch_h_prediction',
    title: 'Hadamard State Prediction',
    targetConcept: 'superposition',
    difficulty: 'beginner',
    type: 'prediction',
    description: 'Test your understanding of the Hadamard gate output.',
    question: 'Starting with |0⟩, what is the state after applying Hadamard (H)?',
    options: ['|0⟩', '|1⟩', '(|0⟩+|1⟩)/√2', '(|0⟩−|1⟩)/√2'],
    correctAnswer: 2,
    explanation: 'H|0⟩ = (|0⟩+|1⟩)/√2 = |+⟩. The Hadamard gate creates an equal superposition with positive phase.',
    hint: 'Think about the Hadamard matrix: H = 1/√2 [[1,1],[1,-1]]. Apply it to [1,0]^T.',
    xpReward: 50,
    adaptedFrom: 'superposition'
  },
  {
    id: 'ch_h_h_cancel',
    title: 'H² = Identity',
    targetConcept: 'superposition',
    difficulty: 'beginner',
    type: 'prediction',
    misconceptionTargeted: 'h_h_identity',
    description: 'Two Hadamards applied in sequence.',
    question: 'What is the result of applying H twice (H²) to |0⟩?',
    options: ['|+⟩', '|-⟩', '|0⟩', '|1⟩'],
    correctAnswer: 2,
    explanation: 'H² = I (identity). The Hadamard gate is its own inverse (self-adjoint unitary). Two H gates cancel perfectly, returning |0⟩.',
    hint: 'Every quantum gate U satisfying U† = U is called Hermitian. What does applying U twice do?',
    xpReward: 60,
    adaptedFrom: 'superposition'
  },
  {
    id: 'ch_cnot_prediction',
    title: 'CNOT State Evolution',
    targetConcept: 'entanglement',
    difficulty: 'intermediate',
    type: 'prediction',
    misconceptionTargeted: 'control_target_swap',
    description: 'Track what CNOT does to a 2-qubit computational basis state.',
    question: 'Apply CNOT (control=q0, target=q1) to |10⟩. What is the output?',
    options: ['|10⟩', '|11⟩', '|00⟩', '|01⟩'],
    correctAnswer: 1,
    explanation: 'CNOT flips target q1 ONLY when control q0 = |1⟩. Input is |10⟩ (q0=1, q1=0). Since control=1, target flips: q1 becomes |1⟩. Output = |11⟩.',
    hint: 'CNOT truth table: |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩. The first qubit is always the control.',
    xpReward: 75,
    adaptedFrom: 'entanglement'
  },
  {
    id: 'ch_bell_state_compose',
    title: 'Bell State Circuit Composition',
    targetConcept: 'entanglement',
    difficulty: 'intermediate',
    type: 'circuit_build',
    description: 'Identify the correct gate sequence to create the Bell state |Φ+⟩.',
    question: 'Which gate sequence starting from |00⟩ produces the Bell state (|00⟩+|11⟩)/√2?',
    options: ['CX then H on q0', 'H on q0 then CX(q0→q1)', 'H on both qubits', 'X on q0 then CX'],
    correctAnswer: 1,
    explanation: 'Step 1: H on q0 → (|0⟩+|1⟩)/√2 ⊗ |0⟩. Step 2: CX with control q0 → (|00⟩+|11⟩)/√2 = |Φ+⟩. Order matters!',
    hint: 'You need to create superposition first (H gate), then establish entanglement (CNOT). The CNOT conditionally flips q1 based on the superposition of q0.',
    xpReward: 90,
    adaptedFrom: 'entanglement'
  },
  {
    id: 'ch_measurement_collapse',
    title: 'Measurement Irreversibility',
    targetConcept: 'measurement',
    difficulty: 'beginner',
    type: 'concept_quiz',
    misconceptionTargeted: 'superposition_collapse',
    description: 'Understand the fundamental nature of quantum measurement.',
    question: 'You measure qubit in superposition (|0⟩+|1⟩)/√2 and get result 0. What is the qubit\'s state immediately after?',
    options: ['Still (|0⟩+|1⟩)/√2', '|0⟩', 'Unknown — random each measurement', '(|0⟩−|1⟩)/√2'],
    correctAnswer: 1,
    explanation: 'Measurement causes irreversible wavefunction collapse. After measuring |0⟩, the qubit IS in state |0⟩ with probability 1. The superposition is destroyed — this is the projection postulate.',
    hint: 'Born rule: probability of outcome |k⟩ = |⟨k|ψ⟩|². After measurement, the system collapses INTO the measured eigenstate.',
    xpReward: 60,
    adaptedFrom: 'measurement'
  },
  {
    id: 'ch_phase_kickback',
    title: 'Phase Kickback Mechanism',
    targetConcept: 'entanglement',
    difficulty: 'advanced',
    type: 'concept_quiz',
    misconceptionTargeted: 'phase_global_local',
    description: 'Understand the key quantum oracle mechanism used in Deutsch-Jozsa and Grover.',
    question: 'In phase kickback, where does the phase change appear when an oracle flips the ancilla qubit?',
    options: ['Only on the ancilla qubit', 'On both qubits symmetrically', 'Kicks back to the control/query register', 'No phase change occurs'],
    correctAnswer: 2,
    explanation: 'Phase kickback: if ancilla = |−⟩ = (|0⟩−|1⟩)/√2, applying oracle Uf to |x⟩|−⟩ gives (−1)^f(x)|x⟩|−⟩. The phase −1 "kicks back" to the query register x, leaving ancilla unchanged.',
    hint: 'Uf|x⟩|y⊕f(x)⟩. Set |y⟩ = |−⟩ and expand (|0⟩−|1⟩)/√2 to see what happens to the phase.',
    xpReward: 120,
    adaptedFrom: 'entanglement'
  },
  {
    id: 'ch_debug_hh',
    title: 'Debug: Redundant H Gates',
    targetConcept: 'superposition',
    difficulty: 'intermediate',
    type: 'code_debug',
    misconceptionTargeted: 'h_h_identity',
    description: 'Find and fix the conceptual bug in this Qiskit circuit.',
    question: '```python\nqc = QuantumCircuit(1)\nqc.h(0)  # create superposition\nqc.h(0)  # "maintain superposition"\nqc.measure_all()\n```\nWhat is wrong with this circuit?',
    options: [
      'Missing reset at the beginning',
      'Two H gates cancel (H²=I), so qubit returns to |0⟩ — always measures 0',
      'Incorrect measurement syntax',
      'Circuit requires 2 qubits'
    ],
    correctAnswer: 1,
    explanation: 'H² = I (identity). Two consecutive Hadamard gates perfectly cancel each other. The circuit prepares |0⟩ → |+⟩ → |0⟩ again. The final measurement will always yield 0, defeating the purpose of superposition.',
    hint: 'H is its own inverse (self-adjoint). What happens when you compose H twice? Check the circuit: H|0⟩ = |+⟩, then H|+⟩ = ?',
    xpReward: 85,
    adaptedFrom: 'superposition'
  },
  {
    id: 'ch_grover_speedup',
    title: "Grover's Speedup Analysis",
    targetConcept: 'grover',
    difficulty: 'advanced',
    type: 'concept_quiz',
    description: "Test deep understanding of Grover's quadratic speedup.",
    question: 'For a database of N=1,000,000 items, how many oracle queries does Grover require vs classical?',
    options: [
      'Grover: 500,000 | Classical: 1,000,000',
      'Grover: ~1,000 (√N) | Classical: ~500,000 (N/2 avg)',
      'Grover: 1,000,000 | Classical: 1,000',
      'Both require exactly log₂(N) = 20 queries'
    ],
    correctAnswer: 1,
    explanation: 'Grover\'s algorithm requires O(√N) ≈ √1,000,000 = 1,000 oracle queries. Classical exhaustive search needs O(N/2) ≈ 500,000 queries on average. This is a quadratic speedup (not exponential like Shor).',
    hint: 'Grover amplitudes grow by ~2/√N per iteration. After π√N/4 iterations the target probability ≈ 1. What is √1,000,000?',
    xpReward: 100,
    adaptedFrom: 'grover'
  },
];

// F24: Digital Twin - compute learner weaknesses from concept mastery
function detectWeaknesses(conceptMastery: Record<string, number>): string[] {
  return Object.entries(conceptMastery)
    .filter(([, score]) => score < 0.75)
    .sort(([, a], [, b]) => a - b)
    .map(([concept]) => concept)
    .slice(0, 3);
}

// F29: Adaptive selection - pick challenge that targets learner's weakest areas
function selectAdaptiveChallenges(conceptMastery: Record<string, number>): Challenge[] {
  const weaknesses = detectWeaknesses(conceptMastery);
  const targeted: Challenge[] = [];
  const fallback: Challenge[] = [];

  for (const ch of CHALLENGE_BANK) {
    if (weaknesses.some(w => ch.adaptedFrom === w || ch.targetConcept === w)) {
      targeted.push(ch);
    } else {
      fallback.push(ch);
    }
  }
  // Return up to 4 targeted + 1 bonus
  return [...targeted.slice(0, 4), ...fallback.slice(0, 1)];
}

export const AdaptiveChallengeView: React.FC<AdaptiveChallengeViewProps> = ({ onAskDirac }) => {
  const [conceptMastery, setConceptMastery] = useState<Record<string, number>>({
    bits: 0.95, qubit: 0.82, superposition: 0.65, entanglement: 0.48,
    measurement: 0.70, grover: 0.35, qft: 0.25, shor: 0.12
  });
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, attempted: 0, xp: 0 });
  const [detectedMisconceptions, setDetectedMisconceptions] = useState<string[]>([]);

  const weaknesses = detectWeaknesses(conceptMastery);

  useEffect(() => {
    // Load real mastery data from DB if available
    const session = authService.getSession();
    if (session?.progress?.conceptMastery) {
      const mastery: Record<string, number> = {};
      Object.entries(session.progress.conceptMastery).forEach(([k, v]) => {
        mastery[k] = typeof v === 'number' ? v : parseFloat(String(v));
      });
      setConceptMastery(mastery);
    }
    refreshChallenges();
  }, []);

  const refreshChallenges = useCallback(() => {
    const session = authService.getSession();
    const mastery = session?.progress?.conceptMastery || conceptMastery;
    const normalized: Record<string, number> = {};
    Object.entries(mastery).forEach(([k, v]) => { normalized[k] = typeof v === 'number' ? v : parseFloat(String(v)); });
    const adaptive = selectAdaptiveChallenges(normalized);
    setAvailableChallenges(adaptive);
    if (adaptive.length > 0) setActiveChallenge(adaptive[0]);
    setSelectedOption(null);
    setAnswered(false);
    setShowHint(false);
  }, [conceptMastery]);

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setSelectedOption(optionIndex);
    setAnswered(true);
    const correct = optionIndex === activeChallenge!.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => ({
        correct: prev.correct + 1,
        attempted: prev.attempted + 1,
        xp: prev.xp + activeChallenge!.xpReward
      }));
      // F24: Update mastery score
      setConceptMastery(prev => ({
        ...prev,
        [activeChallenge!.targetConcept]: Math.min(1.0, (prev[activeChallenge!.targetConcept] || 0.5) + 0.05)
      }));
    } else {
      setScore(prev => ({ ...prev, attempted: prev.attempted + 1 }));
      // F26: Track misconception
      if (activeChallenge!.misconceptionTargeted && !detectedMisconceptions.includes(activeChallenge!.misconceptionTargeted)) {
        setDetectedMisconceptions(prev => [...prev, activeChallenge!.misconceptionTargeted!]);
      }
      // F24: Decrease mastery slightly for incorrect
      setConceptMastery(prev => ({
        ...prev,
        [activeChallenge!.targetConcept]: Math.max(0, (prev[activeChallenge!.targetConcept] || 0.5) - 0.03)
      }));
    }
  };

  const difficultyConfig = {
    beginner: { label: 'Beginner', color: '#059669', bg: '#DCFCE7' },
    intermediate: { label: 'Intermediate', color: '#2563EB', bg: '#DBEAFE' },
    advanced: { label: 'Advanced', color: '#7C3AED', bg: '#EDE9FE' },
  };

  const typeConfig = {
    circuit_build: { label: '⬡ Circuit Build', color: '#0891B2' },
    code_debug: { label: '🐞 Code Debug', color: '#DC2626' },
    prediction: { label: '🎯 State Prediction', color: '#7C3AED' },
    concept_quiz: { label: '📚 Concept Quiz', color: '#D97706' },
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px', borderRadius: 16, marginBottom: 24,
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'F29 · Adaptive Challenges', color: '#A5B4FC' },
              { label: 'F26 · Misconception Detection', color: '#6EE7B7' },
              { label: 'F24 · Learning Digital Twin', color: '#FCD34D' },
            ].map(b => (
              <span key={b.label} style={{ fontSize: 9, fontWeight: 800, fontFamily: 'JetBrains Mono', background: 'rgba(255,255,255,0.12)', color: b.color, padding: '2px 8px', borderRadius: 4, border: `1px solid ${b.color}40` }}>{b.label}</span>
            ))}
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Adaptive Challenge Engine</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#C7D2FE' }}>
            Challenges auto-generated from your Learning Digital Twin · Targets your weakest concepts
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{score.xp} XP</div>
          <div style={{ fontSize: 11, color: '#C7D2FE' }}>{score.correct}/{score.attempted} correct</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Left: Digital Twin Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* F24: Learning Digital Twin */}
          <BrowserFrame urlPath="ql://digital-twin/mastery" badge="F24 · Digital Twin" badgeColor="coral">
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={13} color="#7C3AED" /> Concept Mastery Profile
              </div>
              {Object.entries(conceptMastery).map(([concept, score]) => {
                const pct = Math.round(score * 100);
                const isWeak = pct < 75;
                return (
                  <div key={concept} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isWeak ? '#DC2626' : '#0F172A', textTransform: 'capitalize' }}>
                        {isWeak && '⚠ '}{concept.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'JetBrains Mono', color: isWeak ? '#DC2626' : '#059669' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: isWeak ? 'linear-gradient(90deg, #DC2626, #F87171)' : 'linear-gradient(90deg, #059669, #34D399)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </BrowserFrame>

          {/* F26: Misconception Detection */}
          {detectedMisconceptions.length > 0 && (
            <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={13} color="#D97706" /> Detected Misconceptions
                <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', background: '#FCD34D', color: '#78350F', padding: '1px 5px', borderRadius: 3 }}>F26</span>
              </div>
              {detectedMisconceptions.map(mid => {
                const m = MISCONCEPTIONS[mid];
                if (!m) return null;
                return (
                  <div key={mid} style={{ marginBottom: 8, padding: '8px 10px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: '#B45309', marginTop: 2 }}>{m.description}</div>
                    <button onClick={() => onAskDirac(`I have a misconception about: "${m.name}". ${m.description}. Please correct this with a clear explanation.`)}
                      style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#7C3AED', fontSize: 10, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                      <Sparkles size={11} /> Ask Dirac to clarify
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Challenge List */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Target size={12} color="#7C3AED" /> Adaptive Queue
              </span>
              <button onClick={refreshChallenges} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            {availableChallenges.map((ch, i) => {
              const isActive = activeChallenge?.id === ch.id;
              const dc = difficultyConfig[ch.difficulty];
              return (
                <div key={ch.id} onClick={() => { setActiveChallenge(ch); setSelectedOption(null); setAnswered(false); setShowHint(false); }}
                  style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', background: isActive ? '#F5F3FF' : '#FFFFFF', borderLeft: isActive ? '3px solid #7C3AED' : '3px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, background: dc.bg, color: dc.color, padding: '1px 6px', borderRadius: 4 }}>{dc.label}</span>
                    <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: '#7C3AED', fontWeight: 700 }}>+{ch.xpReward} XP</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#7C3AED' : '#0F172A' }}>{ch.title}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{typeConfig[ch.type].label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Challenge */}
        <div>
          {!activeChallenge ? (
            <div style={{ background: '#FFFFFF', border: '2px dashed #DDD6FE', borderRadius: 14, padding: '60px 24px', textAlign: 'center', color: '#94A3B8' }}>
              <Brain size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>No challenges loaded</p>
            </div>
          ) : (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
              {/* Challenge Header */}
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #F5F3FF, #EEF2FF)', borderBottom: '1px solid #DDD6FE', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, fontWeight: 800, fontFamily: 'JetBrains Mono', background: difficultyConfig[activeChallenge.difficulty].bg, color: difficultyConfig[activeChallenge.difficulty].color, padding: '2px 7px', borderRadius: 4 }}>
                      {difficultyConfig[activeChallenge.difficulty].label}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: typeConfig[activeChallenge.type].color, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '2px 7px', borderRadius: 4 }}>
                      {typeConfig[activeChallenge.type].label}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, fontFamily: 'JetBrains Mono', background: '#EDE9FE', color: '#7C3AED', padding: '2px 7px', borderRadius: 4 }}>
                      +{activeChallenge.xpReward} XP
                    </span>
                    {activeChallenge.adaptedFrom && (
                      <span style={{ fontSize: 9, fontWeight: 800, background: '#FEF3C7', color: '#D97706', padding: '2px 7px', borderRadius: 4, border: '1px solid #FCD34D' }}>
                        🎯 Targeting: {activeChallenge.adaptedFrom}
                      </span>
                    )}
                  </div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: '#0F172A' }}>{activeChallenge.title}</h2>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#475569' }}>{activeChallenge.description}</p>
                </div>
              </div>

              {/* Question */}
              <div style={{ padding: 20 }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                  <pre style={{ margin: 0, fontFamily: activeChallenge.question.includes('```') ? 'JetBrains Mono, monospace' : 'inherit', fontSize: 13.5, fontWeight: 600, color: '#0F172A', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {activeChallenge.question.replace(/```python\n/, '').replace(/\n```/, '')}
                  </pre>
                </div>

                {/* Options */}
                {activeChallenge.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {activeChallenge.options.map((opt, i) => {
                      let bg = '#FFFFFF', border = '#E2E8F0', color = '#0F172A';
                      if (answered) {
                        if (i === activeChallenge.correctAnswer) { bg = '#DCFCE7'; border = '#059669'; color = '#065F46'; }
                        else if (i === selectedOption) { bg = '#FEE2E2'; border = '#DC2626'; color = '#991B1B'; }
                      } else if (selectedOption === i) { bg = '#EEF2FF'; border = '#6366F1'; }
                      return (
                        <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: bg, border: `1.5px solid ${border}`, borderRadius: 10, cursor: answered ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: border, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                            {['A', 'B', 'C', 'D'][i]}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 600, color, fontFamily: opt.includes('⟩') ? 'JetBrains Mono, monospace' : 'inherit' }}>{opt}</span>
                          {answered && i === activeChallenge.correctAnswer && <CheckCircle2 size={16} color="#059669" style={{ marginLeft: 'auto' }} />}
                          {answered && i === selectedOption && i !== activeChallenge.correctAnswer && <XCircle size={16} color="#DC2626" style={{ marginLeft: 'auto' }} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Hint */}
                {!answered && (
                  <button onClick={() => setShowHint(!showHint)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #BFDBFE', borderRadius: 8, padding: '6px 12px', color: '#2563EB', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
                    <BookOpen size={13} /> {showHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                )}
                {showHint && !answered && (
                  <div style={{ background: '#EBF3FC', border: '1px solid #BFDBFE', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12.5, color: '#1E3A8A', lineHeight: 1.6 }}>
                    💡 {activeChallenge.hint}
                  </div>
                )}

                {/* Explanation after answer */}
                {answered && (
                  <div style={{ background: isCorrect ? '#F0FDF4' : '#FFF7ED', border: `1px solid ${isCorrect ? '#BBF7D0' : '#FED7AA'}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: isCorrect ? '#065F46' : '#9A3412', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isCorrect ? <><CheckCircle2 size={16} color="#059669" /> Correct! +{activeChallenge.xpReward} XP</> : <><XCircle size={16} color="#DC2626" /> Incorrect</>}
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: isCorrect ? '#064E3B' : '#7C2D12', lineHeight: 1.6 }}>{activeChallenge.explanation}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button onClick={() => onAskDirac(`Explain in more detail: ${activeChallenge.explanation}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${isCorrect ? '#059669' : '#D97706'}`, borderRadius: 7, padding: '5px 10px', color: isCorrect ? '#059669' : '#D97706', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        <Sparkles size={11} /> Deep Dive with Dirac AI
                      </button>
                      {answered && (
                        <button onClick={() => {
                          const next = availableChallenges.find(c => c.id !== activeChallenge.id);
                          if (next) { setActiveChallenge(next); setSelectedOption(null); setAnswered(false); setShowHint(false); }
                        }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#7C3AED', border: 'none', borderRadius: 7, padding: '5px 12px', color: '#FFFFFF', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          Next Challenge <ChevronRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
