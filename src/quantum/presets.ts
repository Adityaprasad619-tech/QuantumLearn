// src/quantum/presets.ts
import { CircuitGate } from '../types';

export interface CircuitPreset {
  id: string;
  name: string;
  category: 'Fundamentals' | 'Entanglement' | 'Communication' | 'Algorithms' | 'Error Correction';
  numQubits: number;
  description: string;
  mathematicalTarget: string;
  gates: Omit<CircuitGate, 'id'>[];
}

export const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'superposition',
    name: 'Equal Superposition (|+)⟩',
    category: 'Fundamentals',
    numQubits: 1,
    description: 'Applies a Hadamard gate to |0⟩, creating equal superposition of |0⟩ and |1⟩ with zero relative phase.',
    mathematicalTarget: '|ψ⟩ = (|0⟩ + |1⟩)/√2',
    gates: [
      { type: 'H', targets: [0], stepIndex: 0 }
    ]
  },
  {
    id: 'bell-phi-plus',
    name: 'Bell State |Φ+⟩ (EPR Pair)',
    category: 'Entanglement',
    numQubits: 2,
    description: 'Generates the canonical maximally entangled Einstein-Podolsky-Rosen (EPR) Bell state using Hadamard followed by CNOT.',
    mathematicalTarget: '|Φ+⟩ = (|00⟩ + |11⟩)/√2',
    gates: [
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 1 }
    ]
  },
  {
    id: 'bell-phi-minus',
    name: 'Bell State |Φ-⟩',
    category: 'Entanglement',
    numQubits: 2,
    description: 'Bell state with a π relative phase between |00⟩ and |11⟩. Initialized by applying Pauli-Z or starting from |1⟩.',
    mathematicalTarget: '|Φ-⟩ = (|00⟩ - |11⟩)/√2',
    gates: [
      { type: 'X', targets: [0], stepIndex: 0 },
      { type: 'H', targets: [0], stepIndex: 1 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 2 }
    ]
  },
  {
    id: 'bell-psi-plus',
    name: 'Bell State |Ψ+⟩',
    category: 'Entanglement',
    numQubits: 2,
    description: 'Maximally entangled state with anti-correlated computational bit values (|01⟩ and |10⟩).',
    mathematicalTarget: '|Ψ+⟩ = (|01⟩ + |10⟩)/√2',
    gates: [
      { type: 'X', targets: [1], stepIndex: 0 },
      { type: 'H', targets: [0], stepIndex: 1 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 2 }
    ]
  },
  {
    id: 'bell-psi-minus',
    name: 'Bell State |Ψ-⟩ (Singlet State)',
    category: 'Entanglement',
    numQubits: 2,
    description: 'The rotational invariant Singlet state. Crucial in Bell test experiments and quantum cryptography.',
    mathematicalTarget: '|Ψ-⟩ = (|01⟩ - |10⟩)/√2',
    gates: [
      { type: 'X', targets: [0], stepIndex: 0 },
      { type: 'X', targets: [1], stepIndex: 0 },
      { type: 'H', targets: [0], stepIndex: 1 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 2 }
    ]
  },
  {
    id: 'teleportation',
    name: 'Quantum Teleportation Protocol',
    category: 'Communication',
    numQubits: 3,
    description: 'Teleports unknown state on Qubit 0 to Qubit 2 using an entangled Bell pair (Q1, Q2) and classical Bell-state analysis.',
    mathematicalTarget: '|ψ⟩_q0 ⟶ |ψ⟩_q2',
    gates: [
      // State preparation on Q0: arbitrary state (e.g. Ry(pi/3))
      { type: 'RY', targets: [0], params: { theta: Math.PI / 3 }, stepIndex: 0 },
      // Create EPR pair between Q1 and Q2
      { type: 'H', targets: [1], stepIndex: 1 },
      { type: 'CX', targets: [2], controls: [1], stepIndex: 2 },
      // Alice Bell measurement on Q0 and Q1
      { type: 'CX', targets: [1], controls: [0], stepIndex: 3 },
      { type: 'H', targets: [0], stepIndex: 4 },
      // Bob unitary corrections based on measurement
      { type: 'CX', targets: [2], controls: [1], stepIndex: 5 },
      { type: 'CZ', targets: [2], controls: [0], stepIndex: 6 }
    ]
  },
  {
    id: 'superdense-coding',
    name: 'Superdense Coding',
    category: 'Communication',
    numQubits: 2,
    description: 'Allows Alice to transmit two classical bits ("11") by sending just one physical qubit to Bob.',
    mathematicalTarget: '2 classical bits encoded in 1 qubit',
    gates: [
      // Entangle Q0 and Q1
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'CX', targets: [1], controls: [0], stepIndex: 1 },
      // Alice encodes bits "11": applies Z then X
      { type: 'Z', targets: [0], stepIndex: 2 },
      { type: 'X', targets: [0], stepIndex: 3 },
      // Bob decodes with CNOT and H
      { type: 'CX', targets: [1], controls: [0], stepIndex: 4 },
      { type: 'H', targets: [0], stepIndex: 5 }
    ]
  },
  {
    id: 'deutsch-algorithm',
    name: "Deutsch's Algorithm",
    category: 'Algorithms',
    numQubits: 2,
    description: 'Determines whether a boolean function f(x) is constant or balanced in a single quantum query!',
    mathematicalTarget: 'Global property via quantum interference',
    gates: [
      // Prepare |+⟩ and |-⟩
      { type: 'X', targets: [1], stepIndex: 0 },
      { type: 'H', targets: [0], stepIndex: 1 },
      { type: 'H', targets: [1], stepIndex: 1 },
      // Balanced Oracle (e.g. CNOT)
      { type: 'CX', targets: [1], controls: [0], stepIndex: 2 },
      // Interference filter on input qubit
      { type: 'H', targets: [0], stepIndex: 3 }
    ]
  },
  {
    id: 'grover-search',
    name: "Grover's 2-Qubit Search Algorithm",
    category: 'Algorithms',
    numQubits: 2,
    description: 'Searches an unsorted database of 4 items for the marked state |11⟩. Achieves 100% probability in 1 iteration via amplitude amplification!',
    mathematicalTarget: 'Probability(|11⟩) = 1.0 (Quadratic Speedup)',
    gates: [
      // Equal superposition
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'H', targets: [1], stepIndex: 0 },
      // Oracle marking |11⟩ (Controlled-Z)
      { type: 'CZ', targets: [1], controls: [0], stepIndex: 1 },
      // Diffusion Operator (Inversion about the mean)
      { type: 'H', targets: [0], stepIndex: 2 },
      { type: 'H', targets: [1], stepIndex: 2 },
      { type: 'X', targets: [0], stepIndex: 3 },
      { type: 'X', targets: [1], stepIndex: 3 },
      { type: 'CZ', targets: [1], controls: [0], stepIndex: 4 },
      { type: 'X', targets: [0], stepIndex: 5 },
      { type: 'X', targets: [1], stepIndex: 5 },
      { type: 'H', targets: [0], stepIndex: 6 },
      { type: 'H', targets: [1], stepIndex: 6 }
    ]
  },
  {
    id: 'qft-3qubit',
    name: 'Quantum Fourier Transform (3 Qubits)',
    category: 'Algorithms',
    numQubits: 3,
    description: 'Transforms quantum states from computational basis to frequency basis. The core subroutine of Shor’s algorithm.',
    mathematicalTarget: 'QFT_8: |j⟩ ⟶ 1/√8 ∑ e^(2πi jk/8) |k⟩',
    gates: [
      { type: 'H', targets: [0], stepIndex: 0 },
      { type: 'S', targets: [0], stepIndex: 1 },
      { type: 'T', targets: [0], stepIndex: 2 },
      { type: 'H', targets: [1], stepIndex: 3 },
      { type: 'S', targets: [1], stepIndex: 4 },
      { type: 'H', targets: [2], stepIndex: 5 },
      { type: 'SWAP', targets: [0, 2], stepIndex: 6 }
    ]
  },
  {
    id: 'bit-flip-code',
    name: '3-Qubit Bit Flip Error Code',
    category: 'Error Correction',
    numQubits: 3,
    description: 'Encodes 1 logical qubit into 3 physical qubits (|0⟩_L = |000⟩, |1⟩_L = |111⟩) to detect and protect against bit flips.',
    mathematicalTarget: 'Active Error Correction & Redundancy',
    gates: [
      // State preparation
      { type: 'H', targets: [0], stepIndex: 0 },
      // 3-qubit encoding
      { type: 'CX', targets: [1], controls: [0], stepIndex: 1 },
      { type: 'CX', targets: [2], controls: [0], stepIndex: 2 },
      // Simulated bit-flip noise on Qubit 1
      { type: 'X', targets: [1], stepIndex: 3 }
    ]
  }
];
