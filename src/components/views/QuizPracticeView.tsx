// src/components/views/QuizPracticeView.tsx
import React, { useState, useEffect } from 'react';
import { BrowserFrame } from '../ui/BrowserFrame';
import { LearnerModelService } from '../../learner/learnerModel';
import { soundEffects } from '../../audio/soundEffects';
import confetti from 'canvas-confetti';
import {
  Award, CheckCircle2, XCircle, AlertTriangle, BookOpen, Sparkles,
  Zap, Clock, RotateCcw, Filter, ArrowRight, Brain, Target, ShieldAlert,
  ChevronRight, BarChart3, HelpCircle
} from 'lucide-react';

export type QuizDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Hardcore';

export interface PracticeQuestion {
  id: string;
  topicId: string;
  topicName: string;
  difficulty: QuizDifficulty;
  question: string;
  formula?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  misconceptionAlert?: string;
  xpReward: number;
}

export const QUIZ_TOPICS = [
  { id: 'all', name: 'All Topics (Full Arena)' },
  { id: 'superposition', name: 'Superposition & State Vectors' },
  { id: 'measurement', name: 'Born Rule & Measurement' },
  { id: 'phase', name: 'Phase & Interference' },
  { id: 'bloch', name: 'Bloch Sphere & Rotations' },
  { id: 'gates', name: 'Pauli & Unitary Gates' },
  { id: 'entanglement', name: 'Bell States & Entanglement' },
  { id: 'grover', name: "Grover's Search Algorithm" },
  { id: 'qft_shor', name: 'QFT & Shor Factorization' },
  { id: 'teleportation', name: 'Quantum Teleportation' },
  { id: 'error_correction', name: 'Decoherence & Error Correction' },
  { id: 'hardware', name: 'QPU Hardware & NISQ Physics' }
];

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // SUPERPOSITION
  {
    id: 'pq-sup-1',
    topicId: 'superposition',
    topicName: 'Superposition & State Vectors',
    difficulty: 'Beginner',
    question: 'A qubit is in the state |ψ⟩ = α|0⟩ + β|1⟩. What condition must complex amplitudes α and β strictly satisfy?',
    formula: '|\\alpha|^2 + |\\beta|^2 = 1',
    options: [
      'α + β = 1',
      '|α|² + |β|² = 1 (Conservation of Total Probability)',
      'α × β = 0',
      '|α| = |β| at all times'
    ],
    correctIndex: 1,
    explanation: 'By the Born rule, |α|² is the probability of measuring 0 and |β|² is the probability of measuring 1. The sum of all mutually exclusive probabilities must equal 1 (100%).',
    misconceptionAlert: 'Classical intuition confuses linear amplitudes (α + β) with squared probabilities (|α|² + |β|²).',
    xpReward: 30
  },
  {
    id: 'pq-sup-2',
    topicId: 'superposition',
    topicName: 'Superposition & State Vectors',
    difficulty: 'Intermediate',
    question: 'Given the unnormalized quantum state |v⟩ = 3|0⟩ + 4i|1⟩, what is its normalized state vector |ψ⟩?',
    formula: '|\\psi\\rangle = \\frac{1}{\\sqrt{\\langle v|v\\rangle}}|v\\rangle',
    options: [
      '|ψ⟩ = (3/7)|0⟩ + (4i/7)|1⟩',
      '|ψ⟩ = (3/5)|0⟩ + (4i/5)|1⟩',
      '|ψ⟩ = (3/25)|0⟩ + (4i/25)|1⟩',
      '|ψ⟩ = (9/25)|0⟩ + (16/25)|1⟩'
    ],
    correctIndex: 1,
    explanation: 'The norm is ||v|| = √(3² + |4i|²) = √(9 + 16) = √25 = 5. Dividing each amplitude by 5 gives (3/5)|0⟩ + (4i/5)|1⟩. Note (3/5)² + |4i/5|² = 9/25 + 16/25 = 1.',
    misconceptionAlert: 'Adding magnitudes directly without squaring leads to dividing by 7 instead of the Euclidean L2 norm 5.',
    xpReward: 50
  },
  {
    id: 'pq-sup-3',
    topicId: 'superposition',
    topicName: 'Superposition & State Vectors',
    difficulty: 'Advanced',
    question: 'How many real independent continuous degrees of freedom parameterize a pure state of an n-qubit quantum register?',
    formula: '\\text{Dim}_{\\mathbb{R}} = 2^{n+1} - 2',
    options: [
      '2n real parameters',
      '2ⁿ real parameters',
      '2ⁿ⁺¹ - 2 real parameters',
      'n² complex parameters'
    ],
    correctIndex: 2,
    explanation: 'An n-qubit Hilbert space has 2ⁿ complex amplitudes, corresponding to 2 × 2ⁿ = 2ⁿ⁺¹ real numbers. Subtracting 1 constraint for normalization (|α|² + ... = 1) and 1 constraint for global unobservable phase yields 2ⁿ⁺¹ - 2 independent real parameters.',
    misconceptionAlert: 'Many forget that each complex number has 2 real dimensions, minus 2 global constraints.',
    xpReward: 80
  },

  // MEASUREMENT & BORN RULE
  {
    id: 'pq-meas-1',
    topicId: 'measurement',
    topicName: 'Born Rule & Measurement',
    difficulty: 'Beginner',
    question: 'What happens to a qubit in superposition (|0⟩ + |1⟩)/√2 immediately after a computational basis measurement yields "0"?',
    formula: '|\\psi\\rangle \\xrightarrow{\\text{Measure } 0} |0\\rangle',
    options: [
      'It collapses completely and irreversibly to |0⟩',
      'It immediately bounces back into superposition (|0⟩ + |1⟩)/√2',
      'It becomes an invalid undefined quantum state',
      'It creates an entangled twin qubit'
    ],
    correctIndex: 0,
    explanation: 'According to von Neumann projective measurement, observing eigenvalue 0 projects (collapses) the wavefunction onto the corresponding eigenstate |0⟩.',
    misconceptionAlert: 'Superposition does not persist after projective measurement; the state is physically altered.',
    xpReward: 30
  },
  {
    id: 'pq-meas-2',
    topicId: 'measurement',
    topicName: 'Born Rule & Measurement',
    difficulty: 'Intermediate',
    question: 'If state |ψ⟩ = (1/2)|0⟩ + (√3/2)|1⟩ is measured in the Hadamard basis {|+⟩, |-⟩}, what is the probability of measuring |+⟩?',
    formula: 'P(+) = |\\langle +|\\psi\\rangle|^2',
    options: [
      'P(+) = 1/2',
      'P(+) = (1 + √3)² / 8 ≈ 0.933',
      'P(+) = (1/2)² = 0.25',
      'P(+) = 0.75'
    ],
    correctIndex: 1,
    explanation: '⟨+|ψ⟩ = (1/√2)(⟨0| + ⟨1|)((1/2)|0⟩ + (√3/2)|1⟩) = (1/√2)(1/2 + √3/2) = (1 + √3)/(2√2). Squaring gives (1 + 2√3 + 3)/8 = (4 + 2√3)/8 = (2 + √3)/4 ≈ 0.933.',
    misconceptionAlert: 'Always calculate inner product ⟨basis_state|ψ⟩ before squaring, rather than projecting in the computational basis.',
    xpReward: 60
  },

  // PHASE & INTERFERENCE
  {
    id: 'pq-phase-1',
    topicId: 'phase',
    topicName: 'Phase & Interference',
    difficulty: 'Beginner',
    question: 'Why do two quantum states |ψ₁⟩ = |+⟩ and |ψ₂⟩ = |-⟩ produce the exact same 50/50 measurement probabilities in the computational basis?',
    formula: '|+⟩ = \\frac{|0\\rangle+|1\\rangle}{\\sqrt{2}}, \\quad |-⟩ = \\frac{|0\\rangle-|1\\rangle}{\\sqrt{2}}',
    options: [
      'Because |+1/√2|² = |-1/√2|² = 1/2 for both basis states',
      'Because the minus sign cancels in the hardware',
      'Because |-⟩ is an impossible state',
      'Because Pauli-Z gate does not do anything'
    ],
    correctIndex: 0,
    explanation: 'In the computational basis, P(1) = |β|². Since |+1/√2|² = 1/2 and |-1/√2|² = 1/2, both yield 50% 0 and 50% 1. The relative phase π only reveals itself when transformed by a Hadamard gate!',
    misconceptionAlert: 'Relative phase affects interference upon gate application, even though computational measurement probabilities appear identical.',
    xpReward: 35
  },
  {
    id: 'pq-phase-2',
    topicId: 'phase',
    topicName: 'Phase & Interference',
    difficulty: 'Intermediate',
    question: 'What is the sequence of gates needed to transform |0⟩ into |1⟩ using quantum phase interference without applying a Pauli-X bit flip?',
    formula: 'H Z H |0\\rangle = |1\\rangle',
    options: [
      'Apply H, then Z, then H (H-Z-H)',
      'Apply Z, then H, then Z',
      'Apply S, then T, then S',
      'Interference cannot flip bits'
    ],
    correctIndex: 0,
    explanation: 'H|0⟩ = |+⟩. Z|+⟩ = |-⟩ = (|0⟩ - |1⟩)/√2. H|-⟩ = |1⟩! Destructive interference completely eliminates the |0⟩ amplitude and reinforces |1⟩ to 100%.',
    xpReward: 55
  },

  // BLOCH SPHERE & ROTATIONS
  {
    id: 'pq-bloch-1',
    topicId: 'bloch',
    topicName: 'Bloch Sphere & Rotations',
    difficulty: 'Beginner',
    question: 'Where do orthogonal quantum states |0⟩ and |1⟩ lie relative to each other on the 3D Bloch sphere?',
    formula: '\\vec{r}_{|0\\rangle} = (0,0,1), \\quad \\vec{r}_{|1\\rangle} = (0,0,-1)',
    options: [
      'Antipodal (180° apart, at North and South poles)',
      'Perpendicular (90° apart)',
      'At the exact center (r = 0)',
      'Both at the Equator'
    ],
    correctIndex: 0,
    explanation: 'Although orthogonal in ℂ² (⟨0|1⟩ = 0, angle 90°), on the Bloch sphere they are antipodal points separated by 180° along the Z-axis.',
    misconceptionAlert: 'Hilbert space angles are doubled on the Bloch sphere (θ on sphere = 2 × angle in Hilbert space).',
    xpReward: 35
  },
  {
    id: 'pq-bloch-2',
    topicId: 'bloch',
    topicName: 'Bloch Sphere & Rotations',
    difficulty: 'Advanced',
    question: 'A qubit is initially in state |0⟩. An RY(π/2) rotation followed by an RZ(π/2) rotation is applied. What are the resulting Bloch coordinates (x, y, z)?',
    formula: 'R_z(\\pi/2) R_y(\\pi/2) |0\\rangle',
    options: [
      '(0, 1, 0) along positive Y-axis',
      '(1, 0, 0) along positive X-axis',
      '(0, 0, 1) at North Pole',
      '(1/√2, 1/√2, 0)'
    ],
    correctIndex: 0,
    explanation: 'RY(π/2) rotates |0⟩ by 90° around Y onto the +X axis (|+⟩). RZ(π/2) then rotates +X by 90° around Z into the +Y axis (|+i⟩ = (|0⟩ + i|1⟩)/√2), giving coordinates (0, 1, 0).',
    xpReward: 75
  },

  // GATES & UNITARIES
  {
    id: 'pq-gates-1',
    topicId: 'gates',
    topicName: 'Pauli & Unitary Gates',
    difficulty: 'Beginner',
    question: 'Which of the following gates is equal to its own inverse (i.e., U² = I)?',
    formula: 'U = U^\\dagger = U^{-1}',
    options: [
      'Pauli-X, Pauli-Y, Pauli-Z, and Hadamard (all are self-inverse)',
      'Phase Gate S only',
      'T gate only',
      'No quantum gates are self-inverse'
    ],
    correctIndex: 0,
    explanation: 'Pauli matrices X, Y, Z and the Hadamard gate H are Hermitian unitaries, meaning U = U† = U⁻¹, so applying them twice is equivalent to Identity (U² = I). S² = Z and T⁴ = Z are not self-inverse.',
    xpReward: 35
  },
  {
    id: 'pq-gates-2',
    topicId: 'gates',
    topicName: 'Pauli & Unitary Gates',
    difficulty: 'Intermediate',
    question: 'What is the relationship between the Phase Gate S and the T gate?',
    formula: 'S = T^2 = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/2} \\end{pmatrix}',
    options: [
      'T² = S, and S² = Z',
      'S² = T',
      'T = S + Z',
      'S and T are identical'
    ],
    correctIndex: 0,
    explanation: 'T is the π/8 gate (diagonal [1, e^(iπ/4)]). Squaring it yields [1, e^(iπ/2)] = S. Squaring S yields [1, e^(iπ)] = [1, -1] = Z.',
    xpReward: 55
  },

  // ENTANGLEMENT & BELL STATES
  {
    id: 'pq-ent-1',
    topicId: 'entanglement',
    topicName: 'Bell States & Entanglement',
    difficulty: 'Beginner',
    question: 'Which of the following represents the maximally entangled Bell state |Φ⁺⟩?',
    formula: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
    options: [
      '(|00⟩ + |11⟩) / √2',
      '(|01⟩ + |10⟩) / √2',
      '|00⟩ + |01⟩ + |10⟩ + |11⟩',
      '(|00⟩ - |11⟩) / 2'
    ],
    correctIndex: 0,
    explanation: '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is created by applying H to qubit 0 and CNOT from qubit 0 to qubit 1.',
    xpReward: 35
  },
  {
    id: 'pq-ent-2',
    topicId: 'entanglement',
    topicName: 'Bell States & Entanglement',
    difficulty: 'Advanced',
    question: 'What is the reduced density matrix ρ_A of qubit A when the two-qubit system is in the Bell state |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2?',
    formula: '\\rho_A = \\text{Tr}_B(|\\Psi^-\\rangle\\langle\\Psi^-|) = \\frac{1}{2} I_2',
    options: [
      'ρ_A = I/2 = diag(1/2, 1/2) (Maximally Mixed State, Bloch radius r = 0)',
      'ρ_A = |0⟩⟨0| (Pure ground state)',
      'ρ_A = |-⟩⟨-|',
      'Zero matrix'
    ],
    correctIndex: 0,
    explanation: 'For any maximally entangled Bell state, partial tracing over the second qubit yields the completely mixed state ρ_A = (1/2)|0⟩⟨0| + (1/2)|1⟩⟨1| = I/2. Its Bloch vector length is zero, indicating total loss of individual local state information.',
    misconceptionAlert: 'Entanglement means global purity (pure 2-qubit state) coexisting with complete local uncertainty (mixed 1-qubit reduced state).',
    xpReward: 80
  },

  // GROVER ALGORITHM
  {
    id: 'pq-grov-1',
    topicId: 'grover',
    topicName: "Grover's Search Algorithm",
    difficulty: 'Intermediate',
    question: 'How many oracle queries does Grover’s algorithm need to search an unsorted database of N items with 1 marked item?',
    formula: 'R \\approx \\frac{\\pi}{4} \\sqrt{N}',
    options: [
      'O(√N) queries (Quadratic speedup)',
      'O(N) queries',
      'O(log N) queries',
      'O(1) queries'
    ],
    correctIndex: 0,
    explanation: 'Grover’s algorithm requires approximately (π/4)√N oracle evaluations, providing a proven quadratic speedup over the classical worst-case O(N) search.',
    xpReward: 60
  },
  {
    id: 'pq-grov-2',
    topicId: 'grover',
    topicName: "Grover's Search Algorithm",
    difficulty: 'Hardcore',
    question: 'What happens if you run Grover’s algorithm for 2 × (π/4)√N iterations instead of stopping at the optimal iteration count?',
    formula: '\\sin((2k+1)\\theta) \\text{ over-rotation}',
    options: [
      'The probability of measuring the target state decreases back towards zero (Overcooking / Over-rotation)',
      'The probability reaches 200%',
      'The quantum processor overheats',
      'The search completes twice as accurately'
    ],
    correctIndex: 0,
    explanation: 'Grover iterations rotate the state vector in a 2D subspace. Continuing iterations beyond π/(4θ) causes the state vector to rotate PAST the solution vector back towards the orthogonal subspace, causing the success probability to plummet!',
    misconceptionAlert: 'Quantum algorithms are unitary rotations, not monotonic convergence loops; more iterations can ruin the answer.',
    xpReward: 100
  },

  // QFT & SHOR
  {
    id: 'pq-qft-1',
    topicId: 'qft_shor',
    topicName: 'QFT & Shor Factorization',
    difficulty: 'Advanced',
    question: 'What is the computational complexity of performing the n-qubit Quantum Fourier Transform (QFT) in terms of 2-qubit gates?',
    formula: '\\mathcal{O}(n^2) \\text{ vs Classical FFT } \\mathcal{O}(n 2^n)',
    options: [
      'O(n²) quantum gates',
      'O(2ⁿ) gates',
      'O(n³) gates',
      'O(n log n) gates'
    ],
    correctIndex: 0,
    explanation: 'The n-qubit QFT requires n(n+1)/2 Hadamard and controlled-phase rotation gates, giving O(n²) complexity. This operates on 2ⁿ amplitudes exponentially faster than the classical Fast Fourier Transform (FFT) which takes O(n 2ⁿ) steps.',
    xpReward: 85
  },

  // TELEPORTATION
  {
    id: 'pq-tele-1',
    topicId: 'teleportation',
    topicName: 'Quantum Teleportation',
    difficulty: 'Intermediate',
    question: 'In the standard Quantum Teleportation protocol, what must Alice send to Bob over a classical channel so Bob can reconstruct the unknown state |ψ⟩?',
    formula: '2 \\text{ classical bits } (m_0, m_1)',
    options: [
      '2 classical bits (the outcome of her Bell measurement)',
      'The original qubit |ψ⟩ through a laser beam',
      '1 classical bit',
      'Infinite continuous parameters α and β'
    ],
    correctIndex: 0,
    explanation: 'Alice performs a Bell measurement on her qubit and half of an EPR pair, obtaining 2 classical bits. Bob applies {I, X, Z, XZ} based on those 2 bits to reconstruct |ψ⟩ identically. No faster-than-light signaling occurs.',
    xpReward: 60
  },

  // ERROR CORRECTION
  {
    id: 'pq-err-1',
    topicId: 'error_correction',
    topicName: 'Decoherence & Error Correction',
    difficulty: 'Intermediate',
    question: 'Why cannot classical repetition codes (copying |ψ⟩ to |ψ⟩|ψ⟩|ψ⟩) be used directly in quantum error correction?',
    formula: 'U(|\\psi\\rangle|0\\rangle) \\neq |\\psi\\rangle|\\psi\\rangle',
    options: [
      'Because of the No-Cloning Theorem',
      'Because qubits are too small to copy',
      'Because copying destroys the vacuum',
      'Because memory is too expensive'
    ],
    correctIndex: 0,
    explanation: 'The No-Cloning Theorem mathematically proves that an unknown arbitrary quantum state cannot be copied unitarily. Quantum error correction instead entangles the logical state across an entangled subspace.',
    xpReward: 60
  },
  {
    id: 'pq-err-2',
    topicId: 'error_correction',
    topicName: 'Decoherence & Error Correction',
    difficulty: 'Hardcore',
    question: 'In the Surface Code (Toric code variant), what is the error threshold requirement on physical 2-qubit gate fidelities for fault-tolerant scaling?',
    formula: 'p_{\\text{threshold}} \\approx 1\\%',
    options: [
      'Error rate below ~1% (Fidelity > 99%)',
      'Error rate below 0.0001% (Fidelity > 99.9999%)',
      'Error rate below 50%',
      'Errors are not tolerated at any percentage'
    ],
    correctIndex: 0,
    explanation: 'The surface code has a remarkably high fault-tolerance threshold of ~1% physical error rate, making it the premier architecture for modern superconducting and neutral-atom quantum processors.',
    xpReward: 100
  },

  // HARDWARE
  {
    id: 'pq-hw-1',
    topicId: 'hardware',
    topicName: 'QPU Hardware & NISQ Physics',
    difficulty: 'Beginner',
    question: 'Why must superconducting transmon quantum chips be cooled to ~15 millikelvin inside a dilution refrigerator?',
    formula: 'k_B T \\ll \\hbar \\omega_{01}',
    options: [
      'To prevent thermal noise (kB·T) from exciting the qubits out of their ground state',
      'To make the metal shiny',
      'To speed up CPU clock cycles',
      'To prevent quantum lasers from overheating'
    ],
    correctIndex: 0,
    explanation: 'At room temperature, thermal energy kB·T vastly exceeds the quantum transition energy ℏω₀₁ (~5 GHz). Cooling below 20 mK suppresses thermal phonons, allowing qubits to stay in their coherent ground state.',
    xpReward: 40
  }
];

interface QuizPracticeViewProps {
  onAskDirac?: (prompt: string) => void;
  onNavigateToRoadmap?: () => void;
}

export const QuizPracticeView: React.FC<QuizPracticeViewProps> = ({
  onAskDirac,
  onNavigateToRoadmap
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number; xpEarned: number }>({
    correct: 0,
    total: 0,
    xpEarned: 0
  });
  const [sessionHistory, setSessionHistory] = useState<{
    questionId: string;
    isCorrect: boolean;
    topicId: string;
    difficulty: QuizDifficulty;
  }[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);

  // Filtered Questions Pool
  const filteredQuestions = PRACTICE_QUESTIONS.filter(q => {
    const matchesTopic = selectedTopic === 'all' || q.topicId === selectedTopic;
    const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    return matchesTopic && matchesDiff;
  });

  const currentQuestion = filteredQuestions[activeQuestionIndex] || filteredQuestions[0];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    soundEffects.playGateClick();
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setIsAnswerSubmitted(true);

    if (isCorrect) {
      soundEffects.playSuccessChord();
      setQuizScore(s => ({
        ...s,
        correct: s.correct + 1,
        total: s.total + 1,
        xpEarned: s.xpEarned + currentQuestion.xpReward
      }));
    } else {
      soundEffects.playErrorTone();
      setQuizScore(s => ({
        ...s,
        total: s.total + 1
      }));
    }

    // Direct real-time update into Bayesian Learner Model!
    LearnerModelService.recordQuizAttempt(currentQuestion.topicId, isCorrect);

    setSessionHistory(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        isCorrect,
        topicId: currentQuestion.topicId,
        difficulty: currentQuestion.difficulty
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < filteredQuestions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsQuizComplete(true);
      soundEffects.playSuccessChord();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestartQuiz = () => {
    setActiveQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsQuizComplete(false);
    setQuizScore({ correct: 0, total: 0, xpEarned: 0 });
    setSessionHistory([]);
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 20px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Top Browser Hero */}
      <BrowserFrame
        url="quantum-lab://evaluator/multi-difficulty-arena"
        badgeText="Assessment Engine"
        badgeColor="#2563EB"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="navy-pill-badge" style={{ fontSize: '11px' }}>
                Multi-Topic & Multi-Difficulty Quiz
              </span>
              <span className="coral-pill-badge" style={{ fontSize: '11px' }}>
                Active BKT Engine Sync
              </span>
            </div>
            <h1 className="editorial-title" style={{ fontSize: '32px', fontWeight: 800, color: '#1E3A8A', margin: 0, letterSpacing: '-0.02em' }}>
              Quantum Quiz & Adaptive Practice Arena
            </h1>
            <p className="editorial-subtitle" style={{ fontSize: '14.5px', color: '#334155', margin: '8px 0 0 0', maxWidth: '750px', lineHeight: '1.6' }}>
              Test and reinforce your quantum mechanics foundations with multi-difficulty conceptual & mathematical quizzes. Every response dynamically updates your knowledge profile, identifies conceptual gaps, and reshapes your personalized roadmap.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="card-lift-sm" style={{
              padding: '12px 18px',
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 14px -2px rgba(30, 58, 138, 0.08)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={18} color="#1E3A8A" />
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  Session Score
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A', fontFamily: 'JetBrains Mono, monospace' }}>
                  {quizScore.correct} / {quizScore.total} <span style={{ fontSize: '12px', color: '#059669' }}>+{quizScore.xpEarned} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>

      {/* Filter Toolbar: Topic & Difficulty */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        {/* Topic Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Topic:
          </span>
          <select
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setActiveQuestionIndex(0);
              setSelectedOption(null);
              setIsAnswerSubmitted(false);
              setIsQuizComplete(false);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1E293B',
              background: '#F8FAFC',
              cursor: 'pointer'
            }}
          >
            {QUIZ_TOPICS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginRight: '4px' }}>
            Difficulty:
          </span>
          {['all', 'Beginner', 'Intermediate', 'Advanced', 'Hardcore'].map(diff => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setActiveQuestionIndex(0);
                setSelectedOption(null);
                setIsAnswerSubmitted(false);
                setIsQuizComplete(false);
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: selectedDifficulty === diff ? '1px solid #1E3A8A' : '1px solid #E2E8F0',
                background: selectedDifficulty === diff ? '#1E3A8A' : '#FFFFFF',
                color: selectedDifficulty === diff ? '#FFFFFF' : '#475569',
                fontSize: '12px',
                fontWeight: selectedDifficulty === diff ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {diff === 'all' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* QUESTION CARD / QUIZ COMPLETION VIEW */}
      {!isQuizComplete && currentQuestion ? (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Progress Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '6px',
                background: currentQuestion.difficulty === 'Beginner' ? '#DCFCE7' : currentQuestion.difficulty === 'Intermediate' ? '#DBEAFE' : currentQuestion.difficulty === 'Advanced' ? '#FEF3C7' : '#FEE2E2',
                color: currentQuestion.difficulty === 'Beginner' ? '#166534' : currentQuestion.difficulty === 'Intermediate' ? '#1E40AF' : currentQuestion.difficulty === 'Advanced' ? '#92400E' : '#991B1B'
              }}>
                {currentQuestion.difficulty}
              </span>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                {currentQuestion.topicName}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', color: '#1E3A8A', fontWeight: 700 }}>
                Question {activeQuestionIndex + 1} of {filteredQuestions.length}
              </span>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, background: '#ECFDF5', padding: '3px 8px', borderRadius: '6px' }}>
                +{currentQuestion.xpReward} XP
              </span>
            </div>
          </div>

          {/* Question Text & Formula */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', lineHeight: '1.5', margin: '0 0 12px 0' }}>
              {currentQuestion.question}
            </h2>
            {currentQuestion.formula && (
              <div style={{
                display: 'inline-block',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
                color: '#1E293B',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                {currentQuestion.formula}
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = isAnswerSubmitted && idx === currentQuestion.correctIndex;
              const isWrongSelected = isAnswerSubmitted && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: isCorrect
                      ? '2px solid #10B981'
                      : isWrongSelected
                        ? '2px solid #EF4444'
                        : isSelected
                          ? '2px solid #2563EB'
                          : '1px solid #E2E8F0',
                    background: isCorrect
                      ? '#F0FDF4'
                      : isWrongSelected
                        ? '#FEF2F2'
                        : isSelected
                          ? '#EFF6FF'
                          : '#FFFFFF',
                    cursor: isAnswerSubmitted ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? 'none' : '1px solid #CBD5E1',
                      background: isCorrect ? '#10B981' : isWrongSelected ? '#EF4444' : isSelected ? '#2563EB' : '#F8FAFC',
                      color: isSelected || isCorrect || isWrongSelected ? '#FFFFFF' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span style={{ fontSize: '14px', color: '#1E293B', fontWeight: isSelected ? 600 : 400 }}>
                      {option}
                    </span>
                  </div>

                  {isCorrect && <CheckCircle2 size={20} color="#10B981" />}
                  {isWrongSelected && <XCircle size={20} color="#EF4444" />}
                </button>
              );
            })}
          </div>

          {/* Detailed Step-by-Step Explanation & Misconception Alert */}
          {isAnswerSubmitted && (
            <div style={{
              marginTop: '12px',
              padding: '18px 20px',
              borderRadius: '12px',
              background: selectedOption === currentQuestion.correctIndex ? '#F0FDF4' : '#FEF2F2',
              border: selectedOption === currentQuestion.correctIndex ? '1px solid #BBF7D0' : '1px solid #FECACA'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {selectedOption === currentQuestion.correctIndex ? (
                  <CheckCircle2 size={18} color="#16A34A" />
                ) : (
                  <AlertTriangle size={18} color="#DC2626" />
                )}
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: selectedOption === currentQuestion.correctIndex ? '#166534' : '#991B1B'
                }}>
                  {selectedOption === currentQuestion.correctIndex ? 'Correct Solution!' : 'Incorrect — Conceptual Clarification'}
                </span>
              </div>

              <p style={{ margin: '0 0 10px 0', fontSize: '13.5px', color: '#1E293B', lineHeight: '1.6' }}>
                {currentQuestion.explanation}
              </p>

              {currentQuestion.misconceptionAlert && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #FCD34D',
                  fontSize: '12.5px',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <ShieldAlert size={16} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong>Common Misconception Trap:</strong> {currentQuestion.misconceptionAlert}
                  </div>
                </div>
              )}

              {onAskDirac && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onAskDirac(`Can you explain why the question "${currentQuestion.question}" has solution "${currentQuestion.options[currentQuestion.correctIndex]}"?`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#1E3A8A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Brain size={14} />
                    <span>Deep Dive with Dirac AI</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <button
              onClick={handleRestartQuiz}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>Reset Quiz</span>
            </button>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: selectedOption !== null ? 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' : '#E2E8F0',
                  color: selectedOption !== null ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
                  boxShadow: selectedOption !== null ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
                }}
              >
                <span>Submit Answer</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                <span>{activeQuestionIndex < filteredQuestions.length - 1 ? 'Next Question' : 'View Score & Mastery Report'}</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* QUIZ COMPLETE SUMMARY & KNOWLEDGE GAPS REPORT */
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#FFF'
          }}>
            <Award size={32} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
            Quiz & Practice Complete!
          </h2>
          <p style={{ color: '#64748B', fontSize: '15px', maxWidth: '500px', margin: '0 auto 24px' }}>
            Great job! Your performance data has been dynamically integrated into the Bayesian Knowledge Tracing engine.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            maxWidth: '650px',
            margin: '0 auto 28px'
          }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Accuracy</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E3A8A', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                {quizScore.total > 0 ? Math.round((quizScore.correct / quizScore.total) * 100) : 0}%
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>XP Earned</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                +{quizScore.xpEarned} XP
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Roadmap Status</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                Updated Live ⚡
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleRestartQuiz}
              style={{
                padding: '12px 24px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Practice Again
            </button>

            {onNavigateToRoadmap && (
              <button
                onClick={onNavigateToRoadmap}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                }}
              >
                <span>View Updated Adaptive Roadmap</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
