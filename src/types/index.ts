// src/types/index.ts

export interface ComplexNumber {
  re: number;
  im: number;
}

export type GateType =
  | 'H'
  | 'X'
  | 'Y'
  | 'Z'
  | 'S'
  | 'T'
  | 'S_DAG'
  | 'T_DAG'
  | 'RX'
  | 'RY'
  | 'RZ'
  | 'CX'
  | 'CZ'
  | 'SWAP'
  | 'CCX'
  | 'MEASURE'
  | 'I';

export interface GateDefinition {
  type: GateType;
  name: string;
  symbol: string;
  qubitCount: 1 | 2 | 3;
  description: string;
  matrixLatex?: string;
  isParametric?: boolean;
  category: 'single' | 'phase' | 'rotation' | 'multi' | 'measurement';
}

export interface CircuitGate {
  id: string;
  type: GateType;
  targets: number[]; // qubit indices
  controls?: number[]; // control qubit indices (for CX, CZ, CCX)
  params?: { theta?: number; phi?: number; lambda?: number };
  stepIndex: number;
}

export interface QubitState {
  index: number;
  label: string;
  bloch: {
    x: number;
    y: number;
    z: number;
    theta: number; // polar angle 0..pi
    phi: number;   // azimuthal angle 0..2pi
    purity: number; // 0..1 (1 for pure state, <1 for entangled/mixed)
  };
  prob0: number;
  prob1: number;
}

export interface SimulationStepState {
  stepIndex: number;
  gateApplied?: CircuitGate;
  stateVector: ComplexNumber[]; // size 2^numQubits
  probabilities: number[];      // size 2^numQubits
  qubitStates: QubitState[];
  entropy: number; // Von Neumann entanglement entropy
  densityMatrix?: ComplexNumber[][];
}

export interface ShotResult {
  bitstring: string;
  count: number;
  percentage: number;
}

export interface MeasurementResult {
  shots: number;
  counts: Record<string, number>;
  collapsedState?: string; // for single shot
}

// Curriculum Types
export type LearningPhase =
  | 'LEARN'
  | 'VISUALIZE'
  | 'INTERACT'
  | 'PREDICT'
  | 'SIMULATE'
  | 'MEASURE'
  | 'QUIZ'
  | 'AI_FEEDBACK'
  | 'ADAPTIVE_PRACTICE'
  | 'MASTERY';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formula?: string;
}

export interface LessonContent {
  id: string;
  moduleId: string;
  title: string;
  subtitle: string;
  conceptSummary: string;
  theoryMarkdown: string;
  interactiveGoal: string;
  initialCircuitGates?: Omit<CircuitGate, 'id'>[];
  numQubits: number;
  predictQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  quiz: QuizQuestion;
  aiSuggestedPrompts: string[];
  masteryCriteria: string;
}

export interface CurriculumModule {
  id: string;
  number: number;
  title: string;
  description: string;
  badge: string;
  lessons: LessonContent[];
}

// Challenges
export interface Challenge {
  id: string;
  number: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
  targetDescription: string;
  targetStateVector: ComplexNumber[]; // target state vector
  numQubits: number;
  allowedGates: GateType[];
  maxGates?: number;
  hint: string;
  xpReward: number;
}

// AI Chat
export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  sources?: { title: string; citation: string; score: number }[];
  ragUsed?: boolean;
  suggestedActions?: string[];
  concepts?: string[];
}

// User Progress
export interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  completedLessons: string[]; // lesson ids
  completedChallenges: string[]; // challenge ids
  soundEnabled: boolean;
}
