// src/components/views/AlgorithmLibraryView.tsx
// F20 (Interactive Algorithm Library) + F21 (Research-to-Code) + F23 (Cross-Framework Execution)
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserFrame } from '../ui/BrowserFrame';
import { ActiveView } from '../layout/Header';
import { exportToQiskit, exportToPennyLane, exportToCirq, exportToQASM, analyzeCircuitResources } from '../../quantum/qasm';
import { CircuitGate } from '../../types';
import {
  BookOpen, Play, Copy, Check, ChevronDown, ChevronRight,
  Cpu, Atom, Layers, Zap, FlaskConical, Sparkles, ExternalLink, Code2,
  Pause, SkipBack, SkipForward, ChevronLeft, Eye, GitBranch
} from 'lucide-react';

interface AlgorithmLibraryViewProps {
  onAskDirac: (prompt: string) => void;
  onNavigateToView?: (view: ActiveView) => void;
}

type Framework = 'qiskit' | 'pennylane' | 'cirq' | 'qasm';

interface Algorithm {
  id: string;
  name: string;
  category: 'foundational' | 'search' | 'factoring' | 'variational' | 'research';
  tags: string[];
  icon: any;
  color: string;
  complexity: string;
  description: string;
  physicsInsight: string;
  researchPaper?: string;
  gates: Omit<CircuitGate, 'id'>[];
  numQubits: number;
  expectedOutput: string;
  stepDescriptions: string[];  // narrative for each step
}

const ALGORITHMS: Algorithm[] = [
  {
    id: 'bell-state',
    name: 'Bell State (|Φ+⟩)',
    category: 'foundational',
    tags: ['Entanglement', 'CNOT', 'Hadamard', '2-Qubit'],
    icon: Atom,
    color: '#2563EB',
    complexity: 'O(1)',
    description: 'Creates a maximally entangled 2-qubit state where measuring one qubit instantly determines the other, regardless of distance. Foundation of quantum teleportation and superdense coding.',
    physicsInsight: 'H gate creates superposition |+⟩ = (|0⟩+|1⟩)/√2, then CNOT entangles qubits producing |Φ+⟩ = (|00⟩+|11⟩)/√2 — a non-separable state with entropy S = 1.',
    researchPaper: 'https://arxiv.org/abs/quant-ph/9505004',
    numQubits: 2,
    gates: [
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 1 }
    ],
    expectedOutput: '|00⟩: 50%, |11⟩: 50%',
    stepDescriptions: [
      'Initialize: Both qubits start in |0⟩ ground state.',
      'H gate on q0: Creates equal superposition |+⟩ = (|0⟩+|1⟩)/√2',
      'CNOT (q0→q1): Entangles qubits. If q0=|1⟩, flip q1. Result: |Φ+⟩ = (|00⟩+|11⟩)/√2'
    ]
  },
  {
    id: 'ghz-state',
    name: 'GHZ State (3-Qubit)',
    category: 'foundational',
    tags: ['Entanglement', 'Multi-Qubit', 'Non-locality'],
    icon: Layers,
    color: '#7C3AED',
    complexity: 'O(n)',
    description: 'Greenberger–Horne–Zeilinger state — the maximally entangled generalization of Bell states to n qubits. Used in quantum error correction and multi-party cryptography.',
    physicsInsight: 'Creates |GHZ⟩ = (|000⟩+|111⟩)/√2 via cascaded CNOT gates. Any measurement collapses all qubits simultaneously — stronger than Bell nonlocality.',
    researchPaper: 'https://arxiv.org/abs/quant-ph/9904070',
    numQubits: 3,
    gates: [
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 1 },
      { type: 'CX', targets: [2], controls: [0], stepIndex: 2 }
    ],
    expectedOutput: '|000⟩: 50%, |111⟩: 50%',
    stepDescriptions: [
      'Initialize: All 3 qubits in |0⟩ state.',
      'H on q0: Superpose first qubit → (|0⟩+|1⟩)/√2',
      'CNOT (q0→q1): Second qubit entangled with first.',
      'CNOT (q0→q2): Third qubit entangled. Full GHZ = (|000⟩+|111⟩)/√2'
    ]
  },
  {
    id: 'deutsch-jozsa',
    name: 'Deutsch-Jozsa Algorithm',
    category: 'search',
    tags: ['Oracle', 'Exponential Speedup', 'Superposition'],
    icon: Zap,
    color: '#DC2626',
    complexity: 'O(1) vs O(2^n)',
    description: "Determines if a Boolean function f:{0,1}^n → {0,1} is constant or balanced with a single query — exponentially faster than any classical algorithm.",
    physicsInsight: 'Interference between superposition amplitudes: constant oracle leaves all amplitudes in |0…0⟩ (probability 1), balanced oracle interferes destructively so |0…0⟩ has probability 0.',
    researchPaper: 'https://arxiv.org/abs/quant-ph/9508027',
    numQubits: 3,
    gates: [
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'H', targets: [1], stepIndex: 0 },
      { type: 'X', targets: [2], stepIndex: 0 },
      { type: 'H', targets: [2], stepIndex: 1 },
      { type: 'CX', targets: [2], controls: [0], stepIndex: 2 },
      { type: 'CX', targets: [2], controls: [1], stepIndex: 3 },
      { type: 'H', targets: [0], stepIndex: 4 },
      { type: 'H', targets: [1], stepIndex: 4 },
    ],
    expectedOutput: '|11⟩ ancilla: balanced function detected',
    stepDescriptions: [
      'Initialize: Input qubits |00⟩, ancilla |0⟩.',
      'H on inputs + X then H on ancilla: Creates superposition + |−⟩ target.',
      'Oracle query: Phase kickback encodes f(x) into amplitudes.',
      'Oracle continues on second input qubit.',
      'Final Hadamard on inputs: Interference reveals constant vs balanced.',
      'Measure: |00⟩ → constant, |11⟩ → balanced. Single query suffices!'
    ]
  },
  {
    id: 'grover-search',
    name: "Grover's Search",
    category: 'search',
    tags: ['Amplitude Amplification', 'Oracle', 'Quadratic Speedup'],
    icon: Zap,
    color: '#059669',
    complexity: 'O(√N)',
    description: "Finds a marked item in an unsorted database of N items in O(√N) queries — quadratic speedup. Oracle marks target by flipping its phase.",
    physicsInsight: 'Oracle marks |target⟩ with phase –1. Diffusion operator 2|s⟩⟨s|–I performs inversion about the mean, amplifying the target amplitude by ~2/√N each iteration.',
    researchPaper: 'https://arxiv.org/abs/quant-ph/9605043',
    numQubits: 2,
    gates: [
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'H', targets: [1], stepIndex: 0 },
      { type: 'CZ', targets: [1], controls: [0], stepIndex: 1 },
      { type: 'H', targets: [0], stepIndex: 2 },
      { type: 'H', targets: [1], stepIndex: 2 },
      { type: 'X', targets: [0], stepIndex: 3 },
      { type: 'X', targets: [1], stepIndex: 3 },
      { type: 'CZ', targets: [1], controls: [0], stepIndex: 4 },
      { type: 'X', targets: [0], stepIndex: 5 },
      { type: 'X', targets: [1], stepIndex: 5 },
      { type: 'H', targets: [0], stepIndex: 6 },
      { type: 'H', targets: [1], stepIndex: 6 },
    ],
    expectedOutput: '|11⟩: ~100% (marked state amplified)',
    stepDescriptions: [
      'Initialize: Uniform superposition over all 4 states via 2 Hadamards.',
      'Oracle: CZ marks |11⟩ with phase –1 (target state).',
      'Diffusion step 1: H gates transform back to computational basis.',
      'X flip: Invert all qubits for reflection.',
      'Phase kickback: CZ applies global phase shift.',
      'X undo: Restore orientation.',
      'Final H: Complete Grover diffusion. |11⟩ amplitude amplified to ~100%.'
    ]
  },
  {
    id: 'qft-3qubit',
    name: 'Quantum Fourier Transform (3Q)',
    category: 'factoring',
    tags: ['Phase Estimation', 'Shor', 'Walsh-Hadamard'],
    icon: FlaskConical,
    color: '#0891B2',
    complexity: 'O(n²) gates vs O(n·2^n)',
    description: "Transforms computational basis states into the Fourier basis with exponential speedup. Core subroutine of Shor's algorithm and quantum phase estimation.",
    physicsInsight: 'Maps |j⟩ → (1/√N) Σ e^(2πijk/N)|k⟩. Hadamard and controlled phase rotations implement the DFT matrix in O(n²) gates instead of classical O(n·2^n).',
    researchPaper: 'https://arxiv.org/abs/quant-ph/9508027',
    numQubits: 3,
    gates: [
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'RZ', targets: [1], params: { theta: Math.PI / 2 }, stepIndex: 1 },
      { type: 'RZ', targets: [2], params: { theta: Math.PI / 4 }, stepIndex: 2 },
      { type: 'H', targets: [1], stepIndex: 3 },
      { type: 'RZ', targets: [2], params: { theta: Math.PI / 2 }, stepIndex: 4 },
      { type: 'H', targets: [2], stepIndex: 5 },
      { type: 'SWAP', targets: [0, 2], stepIndex: 6 },
    ],
    expectedOutput: 'Equal phase superposition (frequency domain)',
    stepDescriptions: [
      'H on q0: Begin Hadamard-Rz decomposition for first qubit.',
      'Rz(π/2) on q1: Controlled phase rotation for second-order term.',
      'Rz(π/4) on q2: Controlled phase for third-order (smallest frequency).',
      'H on q1: Middle qubit Fourier basis transform.',
      'Rz(π/2) on q2: Phase correction after H on q1.',
      'H on q2: Final qubit transformed to Fourier basis.',
      'SWAP(q0,q2): Bit-reversal permutation to get natural bit order.'
    ]
  },
  {
    id: 'vqe-h2',
    name: 'VQE – H₂ Ground State',
    category: 'variational',
    tags: ['Variational', 'Chemistry', 'NISQ', 'Gradient Descent'],
    icon: FlaskConical,
    color: '#7C3AED',
    complexity: 'O(poly(n)) per shot',
    description: "Variational Quantum Eigensolver for finding the ground state energy of molecular Hydrogen (H₂). Minimizes ⟨ψ(θ)|H|ψ(θ)⟩ via classical-quantum optimization loop.",
    physicsInsight: 'Parameterized Ry-Rz ansatz explores Hilbert space via classical gradient descent. Chemical accuracy (<1.6 mHa) achieved at 0.741 Å bond distance: E = −1.137 Hartree.',
    researchPaper: 'https://arxiv.org/abs/1304.3061',
    numQubits: 2,
    gates: [
      { type: 'X', targets: [0], stepIndex: 0 },
      { type: 'RY', targets: [0], params: { theta: 0.384 }, stepIndex: 1 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 2 },
      { type: 'RZ', targets: [1], params: { theta: 0.192 }, stepIndex: 3 },
    ],
    expectedOutput: '⟨H⟩ ≈ −1.1372 Hartree (chemical accuracy)',
    stepDescriptions: [
      'X on q0: Initialize Hartree-Fock reference state (electron occupancy).',
      'Ry(0.384) on q0: Parameterized rotation, θ optimized by classical loop.',
      'CNOT (q0→q1): Correlate molecular orbital amplitudes (entanglement).',
      'Rz(0.192) on q1: Phase correction. Measure ⟨H⟩ and repeat until convergence.'
    ]
  },
  {
    id: 'teleportation',
    name: 'Quantum Teleportation Protocol',
    category: 'foundational',
    tags: ['Bell Measurement', 'Classical Feed-Forward', 'Entanglement'],
    icon: Layers,
    color: '#4F46E5',
    complexity: 'O(1)',
    description: "Transfers an unknown qubit state |ψ⟩ = α|0⟩+β|1⟩ from Alice to Bob using one Bell pair and 2 classical bits. State is destroyed at source (no-cloning theorem).",
    physicsInsight: 'Bell measurement projects 3-qubit system into one of 4 outcomes, each requiring a specific Pauli correction (I, X, Z, XZ) to recover |ψ⟩ at Bob.',
    researchPaper: 'https://arxiv.org/abs/quant-ph/9705052',
    numQubits: 3,
    gates: [
      { type: 'H', targets: [1], stepIndex: 0 },
      { type: 'CX', targets: [2], controls: [1], stepIndex: 1 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 2 },
      { type: 'H', targets: [0], stepIndex: 3 },
    ],
    expectedOutput: 'State teleported with corrections (classically conditioned)',
    stepDescriptions: [
      'H on q1: Alice and Bob create a shared Bell pair (entanglement resource).',
      'CNOT (q1→q2): Complete Bell pair creation: (|00⟩+|11⟩)/√2 shared.',
      'CNOT (q0→q1): Alice entangles her message qubit |ψ⟩ with her half of Bell pair.',
      `H on q0: Alice's Bell measurement in Bell basis. 2 classical bits sent to Bob for correction.`
    ]
  },
  {
    id: 'qaoa-maxcut',
    name: 'QAOA – MaxCut (p=1)',
    category: 'variational',
    tags: ['Optimization', 'Graph Theory', 'NISQ', 'Combinatorial'],
    icon: Cpu,
    color: '#D97706',
    complexity: 'O(p·m) per layer',
    description: "Quantum Approximate Optimization Algorithm for MaxCut graph problems. Alternates between problem (cost) and mixing (driver) unitary layers.",
    physicsInsight: 'Cost unitary e^(−iγC) applies controlled-Z entanglement. Mixer unitary e^(−iβB) applies Rx rotations. Approximation ratio ≥ 0.6924.',
    researchPaper: 'https://arxiv.org/abs/1411.4028',
    numQubits: 2,
    gates: [
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'H', targets: [1], stepIndex: 0 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 1 },
      { type: 'RZ', targets: [1], params: { theta: 0.785 }, stepIndex: 2 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 3 },
      { type: 'RX', targets: [0], params: { theta: 0.524 }, stepIndex: 4 },
      { type: 'RX', targets: [1], params: { theta: 0.524 }, stepIndex: 4 },
    ],
    expectedOutput: 'Max-Cut approximation ratio ≥ 0.6924',
    stepDescriptions: [
      'H on both: Uniform superposition over all 2-node cut configurations.',
      'CNOT: Begin cost unitary (graph edge interaction).',
      'Rz(γ): Apply graph edge cost, encode MaxCut objective.',
      'CNOT: Complete cost unitary layer.',
      'Rx(β): Mixing unitary — explore neighboring configurations.',
      'Rx(β) on q1: Complete mixing layer. Optimize γ, β classically.'
    ]
  },
];

const CATEGORY_CONFIG = {
  foundational: { label: 'Foundational', color: '#2563EB', bg: '#EBF3FC' },
  search: { label: 'Search & Query', color: '#059669', bg: '#ECFDF5' },
  factoring: { label: 'Factoring & QFT', color: '#0891B2', bg: '#ECFEFF' },
  variational: { label: 'Variational (NISQ)', color: '#7C3AED', bg: '#F5F3FF' },
  research: { label: 'Research Examples', color: '#D97706', bg: '#FFFBEB' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Circuit Visualizer Component
// ─────────────────────────────────────────────────────────────────────────────
const GATE_COLORS: Record<string, string> = {
  H: '#2563EB', X: '#DC2626', Y: '#7C3AED', Z: '#0891B2',
  CX: '#059669', CZ: '#D97706', SWAP: '#EA580C',
  RY: '#4F46E5', RZ: '#0891B2', RX: '#DC2626',
  S: '#7C3AED', T: '#059669', CNOT: '#059669',
};

interface CircuitVisualizerProps {
  algo: Algorithm;
  activeStep: number;
}

const CircuitVisualizer: React.FC<CircuitVisualizerProps> = ({ algo, activeStep }) => {
  const { gates, numQubits } = algo;
  const maxStep = gates.reduce((m, g) => Math.max(m, g.stepIndex ?? 0), 0);
  const totalSteps = maxStep + 1;

  const QUBIT_LABEL_W = 52;
  const STEP_W = 64;
  const ROW_H = 52;
  const PAD_TOP = 20;
  const PAD_BOT = 20;
  const svgW = QUBIT_LABEL_W + totalSteps * STEP_W + 40;
  const svgH = PAD_TOP + numQubits * ROW_H + PAD_BOT;

  const getGateX = (stepIndex: number) =>
    QUBIT_LABEL_W + stepIndex * STEP_W + STEP_W / 2;
  const getQubitY = (q: number) => PAD_TOP + q * ROW_H + ROW_H / 2;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ fontFamily: 'JetBrains Mono, monospace', overflow: 'visible' }}
    >
      {/* Qubit wire lines */}
      {Array.from({ length: numQubits }).map((_, q) => (
        <g key={`wire-${q}`}>
          <line
            x1={QUBIT_LABEL_W - 4}
            y1={getQubitY(q)}
            x2={svgW - 20}
            y2={getQubitY(q)}
            stroke="#CBD5E1"
            strokeWidth={1.5}
            strokeDasharray={activeStep >= 0 ? 'none' : '4,3'}
          />
          {/* Qubit label */}
          <rect x={2} y={getQubitY(q) - 13} width={46} height={26} rx={6}
            fill="#F1F5F9" stroke="#E2E8F0" />
          <text x={25} y={getQubitY(q) + 4.5} textAnchor="middle"
            fontSize={11} fontWeight={700} fill="#334155">
            q[{q}]
          </text>
          {/* initial state */}
          <text x={QUBIT_LABEL_W - 6} y={getQubitY(q) - 16}
            textAnchor="middle" fontSize={9} fill="#94A3B8">|0⟩</text>
        </g>
      ))}

      {/* Step columns */}
      {Array.from({ length: totalSteps }).map((_, step) => {
        const x = getGateX(step);
        const isActive = step === activeStep;
        return (
          <rect
            key={`col-${step}`}
            x={x - STEP_W / 2 + 4}
            y={PAD_TOP - 12}
            width={STEP_W - 8}
            height={svgH - PAD_TOP - PAD_BOT + 24}
            rx={8}
            fill={isActive ? `${algo.color}18` : 'transparent'}
            stroke={isActive ? algo.color : 'transparent'}
            strokeWidth={1.5}
          />
        );
      })}

      {/* Gates */}
      {gates.map((gate, idx) => {
        const step = gate.stepIndex ?? 0;
        const x = getGateX(step);
        const isPast = step < activeStep;
        const isCurrent = step === activeStep;
        const isFuture = step > activeStep;
        const opacity = isFuture ? 0.25 : 1;
        const color = GATE_COLORS[gate.type] || '#475569';
        const target = gate.targets[0];
        const control = gate.controls?.[0];

        return (
          <g key={`gate-${idx}`} opacity={opacity} style={{ transition: 'opacity 0.3s' }}>
            {/* Control-target connector */}
            {control !== undefined && (
              <>
                <line
                  x1={x} y1={getQubitY(control)}
                  x2={x} y2={getQubitY(target)}
                  stroke={color} strokeWidth={2}
                />
                <circle cx={x} cy={getQubitY(control)} r={5}
                  fill={color} />
              </>
            )}

            {/* SWAP connector */}
            {gate.type === 'SWAP' && gate.targets.length > 1 && (
              <line
                x1={x} y1={getQubitY(gate.targets[0])}
                x2={x} y2={getQubitY(gate.targets[1])}
                stroke={color} strokeWidth={2}
              />
            )}

            {/* Gate box / circle */}
            {gate.type === 'CX' || gate.type === 'CNOT' ? (
              // Target of CX: circle with ⊕
              <g>
                <circle cx={x} cy={getQubitY(target)} r={14}
                  fill="#FFFFFF" stroke={color} strokeWidth={2} />
                <line x1={x - 10} y1={getQubitY(target)} x2={x + 10} y2={getQubitY(target)}
                  stroke={color} strokeWidth={1.5} />
                <line x1={x} y1={getQubitY(target) - 10} x2={x} y2={getQubitY(target) + 10}
                  stroke={color} strokeWidth={1.5} />
              </g>
            ) : gate.type === 'CZ' ? (
              <circle cx={x} cy={getQubitY(target)} r={5} fill={color} />
            ) : gate.type === 'SWAP' ? (
              <>
                {gate.targets.map((t, ti) => (
                  <g key={ti}>
                    <line x1={x - 9} y1={getQubitY(t) - 9} x2={x + 9} y2={getQubitY(t) + 9}
                      stroke={color} strokeWidth={2} />
                    <line x1={x + 9} y1={getQubitY(t) - 9} x2={x - 9} y2={getQubitY(t) + 9}
                      stroke={color} strokeWidth={2} />
                  </g>
                ))}
              </>
            ) : (
              // Standard gate box
              <g>
                <rect
                  x={x - 18} y={getQubitY(target) - 14}
                  width={36} height={28} rx={7}
                  fill={isCurrent ? color : isPast ? `${color}CC` : color}
                  stroke={isCurrent ? '#FFFFFF' : 'transparent'}
                  strokeWidth={2}
                />
                {isCurrent && (
                  <rect x={x - 20} y={getQubitY(target) - 16} width={40} height={32} rx={9}
                    fill="none" stroke={color} strokeWidth={2} opacity={0.5}>
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
                  </rect>
                )}
                <text x={x} y={getQubitY(target) + 4.5}
                  textAnchor="middle" fontSize={10.5} fontWeight={800}
                  fill="#FFFFFF">
                  {gate.type.length > 4 ? gate.type.slice(0, 3) : gate.type}
                  {gate.params?.theta ? `` : ''}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Step index labels at top */}
      {Array.from({ length: totalSteps }).map((_, step) => (
        <text
          key={`step-label-${step}`}
          x={getGateX(step)}
          y={PAD_TOP - 4}
          textAnchor="middle"
          fontSize={9}
          fill={step === activeStep ? algo.color : '#94A3B8'}
          fontWeight={step === activeStep ? 800 : 400}
        >
          s{step}
        </text>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Probability Bar Chart
// ─────────────────────────────────────────────────────────────────────────────
const ProbabilityChart: React.FC<{ algo: Algorithm; activeStep: number }> = ({ algo, activeStep }) => {
  const totalSteps = algo.gates.reduce((m, g) => Math.max(m, g.stepIndex ?? 0), 0) + 1;
  const progress = activeStep / Math.max(totalSteps - 1, 1);

  // Simplified state amplitude simulation based on step progress
  const states: { label: string; prob: number; color: string }[] = [];
  const n = algo.numQubits;
  const numStates = Math.pow(2, Math.min(n, 3));

  if (algo.id === 'bell-state') {
    states.push(
      { label: '|00⟩', prob: progress < 0.5 ? 1 - progress : 0.5, color: '#2563EB' },
      { label: '|01⟩', prob: progress < 0.5 ? 0 : 0, color: '#7C3AED' },
      { label: '|10⟩', prob: 0, color: '#DC2626' },
      { label: '|11⟩', prob: progress < 0.5 ? 0 : 0.5, color: '#059669' },
    );
  } else if (algo.id === 'grover-search') {
    const amp = Math.min(1, progress * 1.3);
    states.push(
      { label: '|00⟩', prob: (1 - amp) * 0.33, color: '#94A3B8' },
      { label: '|01⟩', prob: (1 - amp) * 0.33, color: '#94A3B8' },
      { label: '|10⟩', prob: (1 - amp) * 0.34, color: '#94A3B8' },
      { label: '|11⟩', prob: 0.01 + amp * 0.98, color: '#059669' },
    );
  } else {
    // Generic equal superposition then collapse
    for (let i = 0; i < numStates; i++) {
      const label = '|' + i.toString(2).padStart(n, '0') + '⟩';
      const isTarget = i === numStates - 1;
      states.push({
        label,
        prob: progress < 0.3 ? 1 / numStates : isTarget ? 0.2 + progress * 0.8 / numStates : (1 - progress * 0.6) / numStates,
        color: isTarget ? algo.color : '#CBD5E1',
      });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {states.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontFamily: 'JetBrains Mono', color: '#475569',
            width: 36, textAlign: 'right', flexShrink: 0
          }}>{s.label}</span>
          <div style={{ flex: 1, height: 16, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${Math.min(100, s.prob * 100)}%`,
              background: s.color, borderRadius: 4,
              transition: 'width 0.4s ease'
            }} />
          </div>
          <span style={{
            fontSize: 10, fontFamily: 'JetBrains Mono', color: s.color,
            fontWeight: 700, width: 36
          }}>{(s.prob * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export const AlgorithmLibraryView: React.FC<AlgorithmLibraryViewProps> = ({ onAskDirac }) => {
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm>(ALGORITHMS[0]);
  const [activeFramework, setActiveFramework] = useState<Framework>('qiskit');
  const [copied, setCopied] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>('foundational');
  const [activeStep, setActiveStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePanel, setActivePanel] = useState<'visual' | 'code'>('visual');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const maxStep = selectedAlgo.gates.reduce((m, g) => Math.max(m, g.stepIndex ?? 0), 0);

  useEffect(() => {
    setActiveStep(-1);
    setIsPlaying(false);
  }, [selectedAlgo]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= maxStep) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, maxStep]);

  const gatesWithIds: CircuitGate[] = selectedAlgo.gates.map((g, i) => ({
    ...g, id: `algo_${selectedAlgo.id}_${i}`
  }));

  const metrics = analyzeCircuitResources(selectedAlgo.numQubits, gatesWithIds);

  const getCode = useCallback((fw: Framework) => {
    switch (fw) {
      case 'qiskit': return exportToQiskit(selectedAlgo.numQubits, gatesWithIds);
      case 'pennylane': return exportToPennyLane(selectedAlgo.numQubits, gatesWithIds);
      case 'cirq': return exportToCirq(selectedAlgo.numQubits, gatesWithIds);
      case 'qasm': return exportToQASM(selectedAlgo.numQubits, gatesWithIds);
    }
  }, [selectedAlgo, activeFramework]);

  const code = getCode(activeFramework);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [...new Set(ALGORITHMS.map(a => a.category))];

  const currentStepDesc = activeStep >= 0
    ? selectedAlgo.stepDescriptions[activeStep] || `Step ${activeStep}: gate applied.`
    : 'Press ▶ to animate the circuit step-by-step';

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header */}
      <div style={{
        padding: '22px 28px', borderRadius: 18, marginBottom: 24,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #1E293B 100%)',
        color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'F20 · Algorithm Library', color: '#60A5FA' },
              { label: 'F21 · Research-to-Code', color: '#34D399' },
              { label: 'F23 · Cross-Framework', color: '#FBBF24' },
              { label: 'F-VIZ · Circuit Visualizer', color: '#F472B6' },
            ].map(b => (
              <span key={b.label} style={{ fontSize: 9, fontWeight: 800, fontFamily: 'JetBrains Mono', background: 'rgba(255,255,255,0.1)', color: b.color, padding: '2px 8px', borderRadius: 4, border: `1px solid ${b.color}40` }}>{b.label}</span>
            ))}
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Interactive Algorithm Library</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94A3B8' }}>
            8 executable quantum algorithms · Animated step-by-step circuit · Run in Qiskit, PennyLane, Cirq or OpenQASM
          </p>
        </div>
        <button
          onClick={() => onAskDirac(`Explain how ${selectedAlgo.name} works, including the quantum speedup and circuit structure.`)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(99,102,241,0.3)', border: '1px solid #6366F1', borderRadius: 10, color: '#A5B4FC', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          <Sparkles size={15} color="#A5B4FC" />
          Ask Dirac AI
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(230px, 280px) 1fr', gap: 20 }}>
        {/* Algorithm Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.map(cat => {
            const cfg = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
            const catAlgos = ALGORITHMS.filter(a => a.category === cat);
            const isExpanded = expandedCategory === cat;
            return (
              <div key={cat} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedCategory(isExpanded ? '' : cat)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: cfg.bg, border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span>
                  {isExpanded ? <ChevronDown size={14} color={cfg.color} /> : <ChevronRight size={14} color={cfg.color} />}
                </button>
                {isExpanded && catAlgos.map(algo => {
                  const Icon = algo.icon;
                  const isSelected = selectedAlgo.id === algo.id;
                  return (
                    <button
                      key={algo.id}
                      onClick={() => setSelectedAlgo(algo)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                        background: isSelected ? algo.color : '#FFFFFF', border: 'none', borderTop: '1px solid #F1F5F9',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: isSelected ? 'rgba(255,255,255,0.2)' : `${algo.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={14} color={isSelected ? '#FFFFFF' : algo.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? '#FFFFFF' : '#0F172A' }}>{algo.name}</div>
                        <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>{algo.complexity}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Algorithm Info Header */}
          <BrowserFrame urlPath={`quantum://algorithms/${selectedAlgo.id}`} badge="Algorithm Detail" badgeColor="navy">
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    {selectedAlgo.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono', background: `${selectedAlgo.color}15`, color: selectedAlgo.color, border: `1px solid ${selectedAlgo.color}30`, padding: '2px 7px', borderRadius: 4 }}>{tag}</span>
                    ))}
                  </div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{selectedAlgo.name}</h2>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{selectedAlgo.description}</p>
                </div>
                {selectedAlgo.researchPaper && (
                  <a href={selectedAlgo.researchPaper} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#334155', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <ExternalLink size={12} /> Research Paper
                  </a>
                )}
              </div>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46', marginBottom: 4 }}>⚛ Physics Insight</div>
                <p style={{ margin: 0, fontSize: 12.5, color: '#064E3B', lineHeight: 1.6 }}>{selectedAlgo.physicsInsight}</p>
              </div>
            </div>
          </BrowserFrame>

          {/* Resource Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
            {[
              { label: 'Gate Count', value: metrics.gateCount, icon: '⬡', color: '#1E3A8A' },
              { label: 'Circuit Depth', value: metrics.circuitDepth, icon: '↕', color: '#7C3AED' },
              { label: '2-Qubit Gates', value: metrics.twoQubitGates, icon: '⋈', color: '#059669' },
              { label: 'Qubits', value: metrics.qubitCount, icon: '◉', color: '#0891B2' },
              { label: 'Est. Fidelity', value: `${(metrics.estimatedFidelity * 100).toFixed(1)}%`, icon: '✓', color: '#059669' },
              { label: 'Complexity', value: selectedAlgo.complexity, icon: 'Ω', color: '#D97706' },
            ].map(m => (
              <div key={m.label} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 17, marginBottom: 2 }}>{m.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: m.color, fontFamily: 'JetBrains Mono' }}>{m.value}</div>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Panel Toggle */}
          <div style={{ display: 'flex', gap: 0, background: '#F1F5F9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {[
              { id: 'visual', label: 'Circuit Visualization', icon: Eye },
              { id: 'code', label: 'Code Export', icon: Code2 },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activePanel === tab.id;
              return (
                <button key={tab.id} onClick={() => setActivePanel(tab.id as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 20px',
                    borderRadius: 7, border: 'none', cursor: 'pointer',
                    background: active ? '#1E3A8A' : 'transparent',
                    color: active ? '#FFFFFF' : '#475569',
                    fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 0.15s'
                  }}>
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* CIRCUIT VISUALIZATION PANEL */}
          {activePanel === 'visual' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              {/* Viz Header */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${selectedAlgo.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GitBranch size={14} color={selectedAlgo.color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Circuit Diagram</span>
                  <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', background: `${selectedAlgo.color}15`, color: selectedAlgo.color, padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                    Step {activeStep >= 0 ? activeStep : '-'} / {selectedAlgo.gates.reduce((m, g) => Math.max(m, g.stepIndex ?? 0), 0)}
                  </span>
                </div>

                {/* Playback controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => setActiveStep(-1)}
                    style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <SkipBack size={13} color="#475569" />
                  </button>
                  <button onClick={() => setActiveStep(s => Math.max(-1, s - 1))}
                    style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={13} color="#475569" />
                  </button>
                  <button
                    onClick={() => {
                      if (activeStep >= maxStep) setActiveStep(-1);
                      setIsPlaying(p => !p);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px',
                      background: isPlaying ? '#DC2626' : selectedAlgo.color,
                      color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer',
                      fontSize: 12, fontWeight: 700
                    }}>
                    {isPlaying ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
                  </button>
                  <button onClick={() => setActiveStep(s => Math.min(maxStep, s + 1))}
                    style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={13} color="#475569" />
                  </button>
                  <button onClick={() => setActiveStep(maxStep)}
                    style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <SkipForward size={13} color="#475569" />
                  </button>
                </div>
              </div>

              {/* SVG Circuit */}
              <div style={{ padding: '20px 18px', overflowX: 'auto', background: '#FAFCFF' }}>
                <CircuitVisualizer algo={selectedAlgo} activeStep={activeStep} />
              </div>

              {/* Step description */}
              <div style={{
                padding: '12px 18px', borderTop: '1px solid #F1F5F9',
                background: activeStep >= 0 ? `${selectedAlgo.color}08` : '#F8FAFC',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: activeStep >= 0 ? selectedAlgo.color : '#E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>
                    {activeStep >= 0 ? activeStep : '?'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5, fontStyle: activeStep < 0 ? 'italic' : 'normal' }}>
                  {currentStepDesc}
                </p>
              </div>

              {/* Probability chart */}
              <div style={{ padding: '16px 18px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 10 }}>
                  📊 Measurement Probabilities (Live)
                </div>
                <ProbabilityChart algo={selectedAlgo} activeStep={Math.max(0, activeStep)} />
                <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8' }}>
                  Expected final state: <strong style={{ color: selectedAlgo.color }}>{selectedAlgo.expectedOutput}</strong>
                </div>
              </div>
            </div>
          )}

          {/* CODE EXPORT PANEL */}
          {activePanel === 'code' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Code2 size={15} color="#1E3A8A" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Cross-Framework Execution</span>
                  <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', background: '#EBF3FC', color: '#1E3A8A', padding: '2px 7px', borderRadius: 4, fontWeight: 800 }}>F23</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['qiskit', 'pennylane', 'cirq', 'qasm'] as Framework[]).map(fw => (
                    <button key={fw} onClick={() => setActiveFramework(fw)} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      border: activeFramework === fw ? '1.5px solid #1E3A8A' : '1px solid #CBD5E1',
                      background: activeFramework === fw ? '#1E3A8A' : '#FFFFFF',
                      color: activeFramework === fw ? '#FFF' : '#334155'
                    }}>
                      {fw === 'qasm' ? 'OpenQASM' : fw.charAt(0).toUpperCase() + fw.slice(1)}
                    </button>
                  ))}
                  <button onClick={handleCopy} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6,
                    background: copied ? '#059669' : '#10B981', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700
                  }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />} Copy
                  </button>
                </div>
              </div>
              <div style={{ background: '#0F172A', padding: '16px 20px', maxHeight: 380, overflowY: 'auto' }}>
                <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px', color: '#E2E8F0', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                  {code}
                </pre>
              </div>
              <div style={{ padding: '8px 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Expected: {selectedAlgo.expectedOutput}</span>
                <button onClick={() => onAskDirac(`Show me the research background and physics derivation of ${selectedAlgo.name} in detail.`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#7C3AED', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  <BookOpen size={12} /> View Research Context
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
