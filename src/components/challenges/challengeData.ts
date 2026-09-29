// src/components/challenges/challengeData.ts
import { Challenge } from '../../types';

const invSqrt2 = 1 / Math.SQRT2;

export const CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    number: 1,
    title: 'The Hadamard Sandwich',
    difficulty: 'Beginner',
    description: 'Create the ground-state flip from |0⟩ to |1⟩ WITHOUT using the Pauli-X gate! Use quantum interference instead.',
    targetDescription: 'Output State: |1⟩',
    numQubits: 1,
    targetStateVector: [
      { re: 0, im: 0 },
      { re: 1, im: 0 }
    ],
    allowedGates: ['H', 'Z', 'S', 'T'],
    maxGates: 3,
    hint: 'Remember that H |0⟩ = |+⟩, Z |+⟩ = |-⟩, and H |-⟩ = |1⟩. A phase flip sandwiched between two Hadamards produces a bit flip!',
    xpReward: 100
  },
  {
    id: 'ch-2',
    number: 2,
    title: 'The Minus State Synthesizer',
    difficulty: 'Beginner',
    description: 'Construct the orthogonal superposition state |-⟩ = (|0⟩ - |1⟩)/√2 on Qubit 0.',
    targetDescription: 'Output State: |-⟩ = (|0⟩ - |1⟩)/√2',
    numQubits: 1,
    targetStateVector: [
      { re: invSqrt2, im: 0 },
      { re: -invSqrt2, im: 0 }
    ],
    allowedGates: ['X', 'H', 'Z'],
    maxGates: 2,
    hint: 'Starting in |0⟩, what happens if you apply X to make |1⟩, and then apply Hadamard?',
    xpReward: 120
  },
  {
    id: 'ch-3',
    number: 3,
    title: 'Entanglement: Bell State |Φ+⟩',
    difficulty: 'Intermediate',
    description: 'Create the canonical maximally entangled Einstein-Podolsky-Rosen pair |Φ+⟩ = (|00⟩ + |11⟩)/√2.',
    targetDescription: 'Output State: (|00⟩ + |11⟩)/√2',
    numQubits: 2,
    targetStateVector: [
      { re: invSqrt2, im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: invSqrt2, im: 0 }
    ],
    allowedGates: ['H', 'CX', 'X', 'Z'],
    maxGates: 2,
    hint: 'Put Qubit 0 into equal superposition first, then use it as a control for a CNOT targeting Qubit 1.',
    xpReward: 150
  },
  {
    id: 'ch-4',
    number: 4,
    title: 'Phase Inverted Bell State |Φ-⟩',
    difficulty: 'Intermediate',
    description: 'Generate the Bell state with a π relative phase: |Φ-⟩ = (|00⟩ - |11⟩)/√2.',
    targetDescription: 'Output State: (|00⟩ - |11⟩)/√2',
    numQubits: 2,
    targetStateVector: [
      { re: invSqrt2, im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: -invSqrt2, im: 0 }
    ],
    allowedGates: ['H', 'CX', 'X', 'Z'],
    maxGates: 3,
    hint: 'You can create |Φ-⟩ by applying a Pauli-Z or Pauli-X gate before or after the standard Bell circuit.',
    xpReward: 180
  },
  {
    id: 'ch-5',
    number: 5,
    title: 'The 3-CNOT Quantum SWAP Trick',
    difficulty: 'Intermediate',
    description: 'Starting with state |10⟩ (Q0=|1⟩, Q1=|0⟩), swap their states so that the output is |01⟩ using ONLY CNOT gates!',
    targetDescription: 'Output State: |01⟩ (Qubit values swapped)',
    numQubits: 2,
    targetStateVector: [
      { re: 0, im: 0 },
      { re: 1, im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 }
    ],
    allowedGates: ['X', 'CX'],
    maxGates: 4,
    hint: 'Prepare Q0 with X to make |10⟩. Then use 3 alternating CNOT gates: CX(0->1), CX(1->0), CX(0->1).',
    xpReward: 200
  },
  {
    id: 'ch-6',
    number: 6,
    title: 'Singlet State |Ψ-⟩ Generator',
    difficulty: 'Advanced',
    description: 'Construct the rotational invariant Singlet state |Ψ-⟩ = (|01⟩ - |10⟩)/√2.',
    targetDescription: 'Output State: (|01⟩ - |10⟩)/√2',
    numQubits: 2,
    targetStateVector: [
      { re: 0, im: 0 },
      { re: invSqrt2, im: 0 },
      { re: -invSqrt2, im: 0 },
      { re: 0, im: 0 }
    ],
    allowedGates: ['X', 'H', 'Z', 'CX'],
    maxGates: 4,
    hint: 'Start with |11⟩ by applying X to both qubits, then apply H to Q0 and CNOT(0->1).',
    xpReward: 250
  },
  {
    id: 'ch-7',
    number: 7,
    title: 'Grover Phase Oracle for |10⟩',
    difficulty: 'Advanced',
    description: 'Given equal superposition of 2 qubits, build an oracle that marks state |10⟩ by inverting only its phase to -1.',
    targetDescription: 'Target |10⟩ inverted: (|00⟩ + |01⟩ - |10⟩ + |11⟩)/2',
    numQubits: 2,
    targetStateVector: [
      { re: 0.5, im: 0 },
      { re: 0.5, im: 0 },
      { re: -0.5, im: 0 },
      { re: 0.5, im: 0 }
    ],
    allowedGates: ['H', 'X', 'CZ', 'Z'],
    maxGates: 5,
    hint: 'First apply H to both qubits to create the uniform superposition. To mark |10⟩ with Controlled-Z, invert Qubit 1 with X before and after CZ!',
    xpReward: 300
  },
  {
    id: 'ch-8',
    number: 8,
    title: 'Quantum Phase Kickback Engine',
    difficulty: 'Expert',
    description: 'Use the phase kickback phenomenon to apply a phase shift to a control qubit using a CNOT targeting a |-⟩ state.',
    targetDescription: 'State: |-0⟩ or phase-kicked superposition',
    numQubits: 2,
    targetStateVector: [
      { re: 0.5, im: 0 },
      { re: -0.5, im: 0 },
      { re: -0.5, im: 0 },
      { re: 0.5, im: 0 }
    ],
    allowedGates: ['H', 'X', 'CX'],
    maxGates: 5,
    hint: 'Put Q0 in |+⟩ using H. Put Q1 in |-⟩ using X then H. Now apply CNOT(0->1). The eigenvalue of the target kicks back into the control qubit!',
    xpReward: 350
  }
];
