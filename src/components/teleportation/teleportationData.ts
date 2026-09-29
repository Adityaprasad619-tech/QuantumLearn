// src/components/teleportation/teleportationData.ts

export interface FlashCardItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  front?: string;
  back?: string;
  formula?: string;
  conceptTip?: string;
}

export interface CorePrerequisite {
  id: string;
  title: string;
  formula: string;
  shortExplanation: string;
  whyNeeded: string;
  iconName: string;
  keyProperty: string;
}

export interface CircuitGateInfo {
  id: string;
  name: string;
  symbol: string;
  qubits: string;
  wire?: string;
  matrix: string;
  purpose: string;
  effect: string;
  teleportationRole: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  category: string;
  details: string;
  description?: string;
  formula?: string;
  children?: MindMapNode[];
}

export interface TeleportationStepData {
  stepNumber: number;
  step?: number;
  title: string;
  subtitle: string;
  circuitOperation: string;
  operation?: string;
  activeQubits: number[];
  inputState?: string;
  outputState?: string;
  whatHappened: string;
  whyHappened: string;
  whyItHappened?: string;
  whatItMeans: string;
  meaning?: string;
  mathBeginner: string;
  mathFormal: string;
  mathFormula?: string;
  mathDerivation: string;
  advancedDerivation?: string;
}

// Alias for ProtocolStepData
export type ProtocolStepData = TeleportationStepData;

export interface ProtocolStage {
  id: string;
  title: string;
  desc: string;
}

export interface ApplicationItem {
  title: string;
  category: 'current' | 'future';
  status: string;
  description: string;
}

export interface CheckpointQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ---------------------------------------------------------------------------
// 1. FLASH CARDS (13 Comprehensive Cards from Reference PDF)
// ---------------------------------------------------------------------------
export const TELEPORTATION_FLASHCARDS: FlashCardItem[] = [
  {
    id: 'fc-1',
    category: 'Foundations',
    question: 'What is Quantum Teleportation?',
    answer: 'A protocol that transfers the unknown quantum state |ψ⟩ of a qubit from Alice to Bob using an entangled Bell pair and 2 classical bits. It does NOT transport physical matter or particles, and cannot exceed the speed of light.',
    formula: '|ψ⟩_Alice ➔ |ψ⟩_Bob via (|Φ⁺⟩ + 2 classical bits)',
    conceptTip: 'The physical particle stays with Alice; only the quantum state information is reconstructed at Bob.'
  },
  {
    id: 'fc-2',
    category: 'Foundations',
    question: 'What is a Qubit?',
    answer: 'The fundamental unit of quantum information, represented as a vector in a two-dimensional complex Hilbert space ℂ² with orthonormal basis states |0⟩ and |1⟩.',
    formula: '|ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1',
    conceptTip: 'Unlike a classical 0 or 1, a qubit can exist in continuous superpositions.'
  },
  {
    id: 'fc-3',
    category: 'Principles',
    question: 'What is Quantum Superposition?',
    answer: 'The principle that any linear combination of valid quantum states is also a valid state. The complex coefficients α and β represent probability amplitudes.',
    formula: 'α, β ∈ ℂ with P(0) = |α|², P(1) = |β|²',
    conceptTip: 'Superposition is destroyed upon computational basis measurement, collapsing into 0 or 1.'
  },
  {
    id: 'fc-4',
    category: 'Principles',
    question: 'What is Quantum Entanglement?',
    answer: 'A phenomenon where two or more qubits share a non-separable quantum state such that the state of one cannot be described independently of the other, regardless of distance.',
    formula: '|Ψ⟩ ≠ |ψ_A⟩ ⊗ |ψ_B⟩',
    conceptTip: 'Entanglement serves as the physical quantum resource driving teleportation.'
  },
  {
    id: 'fc-5',
    category: 'Quantum States',
    question: 'What is the Bell State |Φ⁺⟩?',
    answer: 'One of the four maximally entangled two-qubit states. Measuring one qubit yields a completely random 0 or 1, but the other qubit is guaranteed to match 100% of the time.',
    formula: '|Φ⁺⟩ = (|00⟩ + |11⟩) / √2',
    conceptTip: 'Created by applying a Hadamard gate to qubit 1, then a CNOT from qubit 1 to qubit 2.'
  },
  {
    id: 'fc-6',
    category: 'Quantum Gates',
    question: 'What does the Hadamard (H) Gate do?',
    answer: 'Transforms computational basis states into equal superpositions, mapping |0⟩ to |+⟩ and |1⟩ to |-⟩. It creates and resolves quantum interference.',
    formula: 'H = 1/√2 [[1, 1], [1, -1]]',
    conceptTip: 'Used first to create the Bell pair, and later by Alice before measurement to rotate into the Bell basis.'
  },
  {
    id: 'fc-7',
    category: 'Quantum Gates',
    question: 'What does the Controlled-NOT (CNOT) Gate do?',
    answer: 'A 2-qubit entangling gate that flips the target qubit if and only if the control qubit is in state |1⟩.',
    formula: '|a, b⟩ ➔ |a, a ⊕ b⟩',
    conceptTip: 'Used to entangle Alice and Bob, and used by Alice to couple the unknown state with the entangled pair.'
  },
  {
    id: 'fc-8',
    category: 'Principles',
    question: 'What happens during Quantum Measurement?',
    answer: 'Measurement in the computational basis irreversibly collapses the superposition into an eigenstate |0⟩ or |1⟩ with probabilities given by Born\'s rule.',
    formula: 'P(i) = |⟨i|ψ⟩|²',
    conceptTip: 'Alice\'s measurement destroys her copy of the unknown state, upholding the No-Cloning theorem.'
  },
  {
    id: 'fc-9',
    category: 'Communication',
    question: 'Why are 2 Classical Bits required?',
    answer: 'Alice\'s measurement has 4 possible outcomes (00, 01, 10, 11). Exactly 2 classical bits are needed to tell Bob which Pauli correction (I, X, Z, or XZ) to apply to his qubit.',
    formula: '4 outcomes = log₂(4) = 2 classical bits',
    conceptTip: 'Without these 2 classical bits, Bob\'s qubit is a completely mixed state with zero extractable information.'
  },
  {
    id: 'fc-10',
    category: 'Theorems',
    question: 'What is the No-Cloning Theorem?',
    answer: 'A fundamental theorem of quantum mechanics stating that it is impossible to create an identical copy of an arbitrary unknown quantum state with a unitary operator.',
    formula: 'U|ψ⟩|0⟩ ≠ |ψ⟩|ψ⟩ for all |ψ⟩',
    conceptTip: 'Teleportation respects no-cloning because Alice\'s original state is destroyed during measurement.'
  },
  {
    id: 'fc-11',
    category: 'Quantum Gates',
    question: 'What does the Pauli-X Gate do?',
    answer: 'The quantum bit-flip gate. It swaps amplitudes between |0⟩ and |1⟩, equivalent to a classical NOT gate or a π rotation around the X-axis of the Bloch sphere.',
    formula: 'X = [[0, 1], [1, 0]], X|0⟩ = |1⟩, X|1⟩ = |0⟩',
    conceptTip: 'Bob applies X if Alice\'s second measurement bit is 1.'
  },
  {
    id: 'fc-12',
    category: 'Quantum Gates',
    question: 'What does the Pauli-Z Gate do?',
    answer: 'The quantum phase-flip gate. It leaves state |0⟩ unchanged while inverting the phase of |1⟩ by applying a π rotation around the Z-axis of the Bloch sphere.',
    formula: 'Z = [[1, 0], [0, -1]], Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩',
    conceptTip: 'Bob applies Z if Alice\'s first measurement bit is 1.'
  },
  {
    id: 'fc-13',
    category: 'Foundations',
    question: 'How is a Quantum State represented geometrically?',
    answer: 'Every single-qubit pure state corresponds to a unique point on the surface of the 3D unit Bloch sphere parameterized by polar angle θ and azimuthal phase angle φ.',
    formula: '|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩',
    conceptTip: 'Teleportation faithfully preserves both θ (amplitudes) and φ (relative phase).'
  }
];

// ---------------------------------------------------------------------------
// 2. CORE PREREQUISITES
// ---------------------------------------------------------------------------
export const CORE_PREREQUISITES: CorePrerequisite[] = [
  {
    id: 'core-qubit',
    title: 'The Qubit',
    formula: '|ψ⟩ = α|0⟩ + β|1⟩',
    shortExplanation: 'A two-level quantum system holding complex probability amplitudes α and β rather than a simple classical 0 or 1.',
    whyNeeded: 'This is the information packet Alice wishes to transport to Bob without knowing α or β.',
    iconName: 'Binary',
    keyProperty: '|α|² + |β|² = 1'
  },
  {
    id: 'core-superposition',
    title: 'Quantum Superposition',
    formula: 'c₁|0⟩ + c₂|1⟩',
    shortExplanation: 'The physical ability of a quantum particle to exist simultaneously in a linear combination of mutually exclusive basis states.',
    whyNeeded: 'Teleportation must transfer both the magnitude and the fragile relative phase of this superposition intact.',
    iconName: 'Layers',
    keyProperty: 'Continuous Phase & Amplitude'
  },
  {
    id: 'core-entanglement',
    title: 'Quantum Entanglement',
    formula: '|Φ⁺⟩ = (|00⟩ + |11⟩) / √2',
    shortExplanation: 'Maximal quantum correlation shared across space. Measuring one partner instantly projects the other into a correlated state.',
    whyNeeded: 'Serves as the quantum bridge between Alice and Bob that enables remote reconstruction.',
    iconName: 'Atom',
    keyProperty: 'Non-local Quantum Channel'
  },
  {
    id: 'core-measurement',
    title: 'Wavefunction Collapse',
    formula: 'P(outcome) = |amplitude|²',
    shortExplanation: 'Observing a quantum system destroys superposition, collapsing it into a definite classical eigenvalue.',
    whyNeeded: 'Alice\'s Bell measurement extracts classical bits while irreversibly destroying her local copy of the state.',
    iconName: 'Eye',
    keyProperty: 'Irreversible Projection'
  },
  {
    id: 'core-classical',
    title: 'Classical Communication',
    formula: '2 Bits (m₀, m₁ ∈ {0, 1})',
    shortExplanation: 'Sending classical digital signals through standard physical channels (fiber optics, radio waves).',
    whyNeeded: 'Bob cannot know which Pauli transformation to apply without receiving Alice\'s two measurement bits.',
    iconName: 'Radio',
    keyProperty: 'Enforces Light-Speed Limit (c)'
  },
  {
    id: 'core-nocloning',
    title: 'No-Cloning Theorem',
    formula: 'U(|ψ⟩|0⟩) ≠ |ψ⟩|ψ⟩',
    shortExplanation: 'The mathematical impossibility of creating an identical independent copy of an arbitrary unknown quantum state.',
    whyNeeded: 'Explains why teleportation cannot duplicate states: the source is destroyed as the destination is created.',
    iconName: 'ShieldAlert',
    keyProperty: 'State Relocation, Not Duplication'
  }
];

// ---------------------------------------------------------------------------
// 3. CIRCUIT GATE BREAKDOWN FOR INTERACTIVE DIAGRAM
// ---------------------------------------------------------------------------
export const CIRCUIT_GATES_INFO: CircuitGateInfo[] = [
  {
    id: 'gate-h1',
    name: 'Hadamard Gate (on q₁)',
    symbol: 'H',
    qubits: 'q₁ (Alice)',
    matrix: '1/√2 [[1, 1], [1, -1]]',
    purpose: 'Initializes the equal superposition state |+⟩ on Alice\'s entangled qubit.',
    effect: 'Transforms |0⟩ ➔ (|0⟩ + |1⟩)/√2.',
    teleportationRole: 'First step of creating the shared EPR Bell pair between Alice and Bob.'
  },
  {
    id: 'gate-cnot12',
    name: 'CNOT Gate (Control: q₁, Target: q₂)',
    symbol: 'CX',
    qubits: 'Control: q₁ (Alice) ➔ Target: q₂ (Bob)',
    matrix: '[[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]',
    purpose: 'Entangles Alice\'s qubit q₁ with Bob\'s qubit q₂.',
    effect: 'Maps (|0⟩+|1⟩)|0⟩/√2 ➔ (|00⟩+|11⟩)/√2 = |Φ⁺⟩.',
    teleportationRole: 'Establishes the shared entangled quantum channel before Alice initiates teleportation.'
  },
  {
    id: 'gate-cnot01',
    name: 'CNOT Gate (Control: q₀, Target: q₁)',
    symbol: 'CX',
    qubits: 'Control: q₀ (Alice) ➔ Target: q₁ (Alice)',
    matrix: '[[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]',
    purpose: 'Couples Alice\'s unknown qubit q₀ with her half of the Bell pair q₁.',
    effect: 'Correlates the unknown state with the entangled pair: flips q₁ whenever q₀ is |1⟩.',
    teleportationRole: 'First step in Alice\'s Bell-basis measurement.'
  },
  {
    id: 'gate-h0',
    name: 'Hadamard Gate (on q₀)',
    symbol: 'H',
    qubits: 'q₀ (Alice)',
    matrix: '1/√2 [[1, 1], [1, -1]]',
    purpose: 'Rotates Alice\'s unknown qubit from the computational basis into the X-basis.',
    effect: 'Converts Bell states into standard product states distinguishable by Z-measurements.',
    teleportationRole: 'Completes the Bell-basis transformation so standard detectors can be used.'
  },
  {
    id: 'gate-meas',
    name: 'Measurement Operators (on q₀ & q₁)',
    symbol: 'M',
    qubits: 'q₀ and q₁ (Alice)',
    matrix: 'P₀ = |0⟩⟨0|, P₁ = |1⟩⟨1|',
    purpose: 'Measures Alice\'s two qubits, obtaining two classical bits m₀ and m₁.',
    effect: 'Collapses the 3-qubit state into one of four product branches with equal 25% probability.',
    teleportationRole: 'Destroys the unknown state at Alice and determines which correction Bob needs.'
  },
  {
    id: 'gate-corr-x',
    name: 'Conditional Pauli-X Correction',
    symbol: 'X^{m₁}',
    qubits: 'q₂ (Bob)',
    matrix: '[[0, 1], [1, 0]] (applied if m₁ = 1)',
    purpose: 'Corrects bit-flip error on Bob\'s qubit if Alice measured q₁ in state |1⟩.',
    effect: 'Swaps |0⟩ and |1⟩ amplitudes on Bob\'s qubit if necessary.',
    teleportationRole: 'Restores the original computational basis amplitudes α and β.'
  },
  {
    id: 'gate-corr-z',
    name: 'Conditional Pauli-Z Correction',
    symbol: 'Z^{m₀}',
    qubits: 'q₂ (Bob)',
    matrix: '[[1, 0], [0, -1]] (applied if m₀ = 1)',
    purpose: 'Corrects phase-flip error on Bob\'s qubit if Alice measured q₀ in state |1⟩.',
    effect: 'Flips relative phase of |1⟩ amplitude on Bob\'s qubit if necessary.',
    teleportationRole: 'Restores the original relative phase φ, completing exact state reconstruction.'
  }
];

// ---------------------------------------------------------------------------
// 4. MIND MAP HIERARCHY
// ---------------------------------------------------------------------------
export const TELEPORTATION_MINDMAP: MindMapNode = {
  id: 'root',
  label: 'Quantum Teleportation',
  category: 'core',
  details: 'Transfer of an unknown quantum state |ψ⟩ between distant nodes without physically transporting the qubit itself.',
  formula: '|ψ⟩_Alice ➔ |ψ⟩_Bob',
  children: [
    {
      id: 'qubits',
      label: 'Qubits & States',
      category: 'qubits',
      details: 'The fundamental physical information units involved in the protocol.',
      formula: 'q₀, q₁, q₂',
      children: [
        {
          id: 'unknown-state',
          label: 'Unknown State |ψ⟩',
          category: 'qubits',
          details: 'Alice\'s target state parameterized by α and β that must be transmitted without observation.',
          formula: '|ψ⟩ = α|0⟩ + β|1⟩'
        },
        {
          id: 'superposition',
          label: 'Superposition',
          category: 'qubits',
          details: 'Simultaneous linear combination of orthogonal computational eigenstates.',
          formula: '|α|² + |β|² = 1'
        },
        {
          id: 'bloch-representation',
          label: 'Bloch Sphere',
          category: 'qubits',
          details: 'Geometric sphere coordinates (θ, φ) describing pure single-qubit states.',
          formula: 'cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩'
        }
      ]
    },
    {
      id: 'entanglement',
      label: 'Entanglement Resource',
      category: 'entanglement',
      details: 'The non-local quantum channel pre-shared between Alice and Bob.',
      formula: '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
      children: [
        {
          id: 'bell-pair',
          label: 'EPR / Bell State',
          category: 'entanglement',
          details: 'Created via H on q₁ and CNOT(q₁, q₂). Alice keeps q₁; Bob keeps q₂.',
          formula: 'H|0⟩ ➔ CNOT ➔ |Φ⁺⟩'
        },
        {
          id: 'quantum-channel',
          label: 'Quantum Channel',
          category: 'entanglement',
          details: 'Enables quantum correlation across arbitrary physical distances.',
          formula: 'Non-local correlation'
        }
      ]
    },
    {
      id: 'measurement',
      label: 'Bell-Basis Measurement',
      category: 'measurement',
      details: 'Alice couples her unknown qubit with her entangled qubit and performs joint measurement.',
      formula: 'CNOT(q₀, q₁) ➔ H(q₀) ➔ Measure',
      children: [
        {
          id: 'collapse',
          label: 'State Collapse',
          category: 'measurement',
          details: 'Irreversibly projects Alice\'s qubits into one of four classical states: 00, 01, 10, or 11.',
          formula: 'P(00)=P(01)=P(10)=P(11)=25%'
        },
        {
          id: 'nocloning-uphold',
          label: 'No-Cloning Preservation',
          category: 'measurement',
          details: 'Because Alice\'s measurement destroys her state, no duplicate of |ψ⟩ ever exists simultaneously.',
          formula: 'Original is consumed'
        }
      ]
    },
    {
      id: 'classical-comm',
      label: 'Classical Communication',
      category: 'classical',
      details: 'Alice sends two classical bits (m₀, m₁) to Bob via conventional light-speed channels.',
      formula: 'm₀, m₁ ∈ {0, 1}',
      children: [
        {
          id: 'no-ftl',
          label: 'No FTL Communication',
          category: 'classical',
          details: 'Teleportation cannot occur faster than light because Bob cannot decode the state without classical bits.',
          formula: 'Speed ≤ c'
        }
      ]
    },
    {
      id: 'bob-correction',
      label: 'Bob\'s Pauli Correction',
      category: 'correction',
      details: 'Bob applies conditional unitary gates X and Z based on Alice\'s classical bits to restore |ψ⟩.',
      formula: 'U_Bob = Z^{m₀} X^{m₁}',
      children: [
        {
          id: 'pauli-x',
          label: 'Bit Flip (X)',
          category: 'correction',
          details: 'Applied when m₁ = 1 to invert amplitudes.',
          formula: 'X = [[0,1],[1,0]]'
        },
        {
          id: 'pauli-z',
          label: 'Phase Flip (Z)',
          category: 'correction',
          details: 'Applied when m₀ = 1 to correct relative phase.',
          formula: 'Z = [[1,0],[0,-1]]'
        }
      ]
    },
    {
      id: 'state-recovery',
      label: 'Final State Recovery',
      category: 'recovery',
      details: 'Bob\'s qubit q₂ now exactly matches Alice\'s original unknown state |ψ⟩ with 100% fidelity.',
      formula: '|ψ⟩_Bob = α|0⟩ + β|1⟩',
      children: [
        {
          id: 'fidelity-100',
          label: 'Unitary Fidelity: 100%',
          category: 'recovery',
          details: 'The quantum state has been faithfully reconstructed without moving physical matter.',
          formula: 'F = |⟨ψ_in|ψ_out⟩|² = 1.00'
        }
      ]
    }
  ]
};

// ---------------------------------------------------------------------------
// 5. 9 DETAILED PROTOCOL STEPS (Reference PDF Synchronized)
// ---------------------------------------------------------------------------
export const TELEPORTATION_STEPS: TeleportationStepData[] = [
  {
    stepNumber: 1,
    title: 'Unknown Quantum State Prepared',
    subtitle: 'Alice holds an arbitrary qubit |ψ⟩ that she wishes to teleport to Bob',
    circuitOperation: 'Prepare q₀ in state |ψ⟩ = α|0⟩ + β|1⟩',
    activeQubits: [0],
    whatHappened: 'Alice prepares an unknown quantum state |ψ⟩ on qubit q₀. The exact amplitudes α and β are unknown to Alice and must not be measured directly.',
    whyHappened: 'Because measuring |ψ⟩ would destroy its superposition and collapse it to 0 or 1, losing the phase and amplitude ratios forever.',
    whatItMeans: 'The mission of teleportation is to recreate this exact quantum vector on Bob\'s distant qubit without measuring it.',
    mathBeginner: 'Alice has a qubit: |ψ⟩ = α|0⟩ + β|1⟩. It holds two secret numbers α and β.',
    mathFormal: '|q₀⟩ = α|0⟩ + β|1⟩ with |α|² + |β|² = 1.',
    mathDerivation: '|Ψ_init⟩ = (α|0⟩ + β|1⟩)_{q0} ⊗ |00⟩_{q1,q2}.'
  },
  {
    stepNumber: 2,
    title: 'Create Shared Entangled Pair (Bell State)',
    subtitle: 'Generate maximal entanglement between Alice\'s qubit q₁ and Bob\'s qubit q₂',
    circuitOperation: 'H on q₁ ➔ CNOT(q₁, q₂) creates Bell state |Φ⁺⟩',
    activeQubits: [1, 2],
    whatHappened: 'A Hadamard gate puts q₁ into equal superposition (|0⟩+|1⟩)/√2. A CNOT then entangles q₁ with Bob\'s qubit q₂, forming the Bell state |Φ⁺⟩.',
    whyHappened: 'The Hadamard gate creates superposition; the CNOT creates maximal entanglement: if q₁ is 0, q₂ is 0; if q₁ is 1, q₂ is 1.',
    whatItMeans: 'Alice and Bob now share a non-local quantum resource. Alice holds q₁ and Bob holds q₂, separated across any distance.',
    mathBeginner: 'Alice and Bob share a pair of quantum twins: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.',
    mathFormal: '|Φ⁺⟩_{12} = 1/√2 (|00⟩ + |11⟩). Total state: |Ψ₀⟩ = |ψ⟩_0 ⊗ |Φ⁺⟩_{12}.',
    mathDerivation: '|Ψ₀⟩ = 1/√2 [ α|000⟩ + α|011⟩ + β|100⟩ + β|111⟩ ].'
  },
  {
    stepNumber: 3,
    title: 'Combine Three-Qubit System',
    subtitle: 'Express the complete quantum state across all three qubits',
    circuitOperation: 'Joint state: |Ψ₀⟩ = |ψ⟩ ⊗ |Φ⁺⟩',
    activeQubits: [0, 1, 2],
    whatHappened: 'The entire system is now in an 8-dimensional Hilbert space (2³ = 8 basis states). Alice controls qubits 0 and 1; Bob controls qubit 2.',
    whyHappened: 'Tensor product of Alice\'s qubit (dim 2) and the Bell pair (dim 4) yields the combined 3-qubit wavefunction (dim 8).',
    whatItMeans: 'The unknown state α and β is now intertwined with the shared entangled pair.',
    mathBeginner: 'Three qubits together hold 4 possible branches with amplitude 1/√2.',
    mathFormal: '|Ψ₀⟩ = 1/√2 ( α|000⟩ + α|011⟩ + β|100⟩ + β|111⟩ ).',
    mathDerivation: '|Ψ₀⟩ = 1/√2 [ α|0⟩(|00⟩+|11⟩) + β|1⟩(|00⟩+|11⟩) ].'
  },
  {
    stepNumber: 4,
    title: 'Alice Applies CNOT Gate',
    subtitle: 'Alice entangles her unknown qubit q₀ with her Bell qubit q₁',
    circuitOperation: 'CNOT(q₀, q₁): q₀ is control, q₁ is target',
    activeQubits: [0, 1],
    whatHappened: 'Alice applies a CNOT gate entirely inside her own lab. If q₀ is in state |1⟩, q₁ is flipped.',
    whyHappened: 'In the terms where q₀ = 1 (β|100⟩ and β|111⟩), the second qubit flips: |100⟩ ➔ |110⟩ and |111⟩ ➔ |101⟩.',
    whatItMeans: 'Information from the unknown qubit q₀ begins transferring into Alice\'s half of the entangled pair.',
    mathBeginner: 'Alice flips her second qubit whenever her first qubit is in state 1.',
    mathFormal: '|Ψ₁⟩ = 1/√2 [ α|000⟩ + α|011⟩ + β|110⟩ + β|101⟩ ].',
    mathDerivation: 'Notice β terms changed: |100⟩ ➔ |110⟩ and |111⟩ ➔ |101⟩.'
  },
  {
    stepNumber: 5,
    title: 'Alice Applies Hadamard Gate',
    subtitle: 'Rotate qubit q₀ into the X-basis to prepare for Bell measurement',
    circuitOperation: 'H on q₀: |0⟩ ➔ (|0⟩+|1⟩)/√2, |1⟩ ➔ (|0⟩-|1⟩)/√2',
    activeQubits: [0],
    whatHappened: 'Alice applies a Hadamard gate to qubit q₀. This mixes amplitudes and re-expresses the state in the Bell measurement basis.',
    whyHappened: 'Substituting H|0⟩ and H|1⟩ into |Ψ₁⟩ allows factoring Alice\'s qubits {q₀, q₁} into the 4 computational basis states {00, 01, 10, 11}.',
    whatItMeans: 'This equation is the mathematical heart of quantum teleportation! Bob\'s qubit q₂ is now correlated with Alice\'s measurement basis.',
    mathBeginner: 'Alice rotates her first qubit. The formula rearranges into 4 neat pairs.',
    mathFormal: '|Ψ₂⟩ = 1/2 [ |00⟩(α|0⟩+β|1⟩) + |01⟩(α|1⟩+β|0⟩) + |10⟩(α|0⟩-β|1⟩) + |11⟩(α|1⟩-β|0⟩) ].',
    mathDerivation: '|Ψ₂⟩ = 1/2 [ |00⟩|ψ⟩ + |01⟩(X|ψ⟩) + |10⟩(Z|ψ⟩) + |11⟩(XZ|ψ⟩) ].'
  },
  {
    stepNumber: 6,
    title: 'Alice Measures Her Two Qubits',
    subtitle: 'Wavefunction collapse generates two classical bits with equal probability',
    circuitOperation: 'Measure q₀ (yields m₀) and q₁ (yields m₁)',
    activeQubits: [0, 1],
    whatHappened: 'Alice measures qubits 0 and 1. The state instantly collapses into one of 4 outcomes: 00, 01, 10, or 11 with exactly 25% probability each.',
    whyHappened: 'Each of the 4 branches in |Ψ₂⟩ has amplitude 1/2, so Born\'s rule dictates probability P = |1/2|² = 1/4 = 25%.',
    whatItMeans: 'Alice\'s original qubit state |ψ⟩ is destroyed in her lab, respecting the No-Cloning theorem. Bob\'s qubit instantly inherits a transformed version of |ψ⟩.',
    mathBeginner: 'Nature randomly rolls one of 4 outcomes: 00, 01, 10, or 11.',
    mathFormal: 'Outcome (m₀, m₁) ∈ {00, 01, 10, 11}, each with P = 1/4.',
    mathDerivation: 'If Alice measures 00 ➔ Bob has |ψ⟩. If 01 ➔ Bob has X|ψ⟩. If 10 ➔ Bob has Z|ψ⟩. If 11 ➔ Bob has XZ|ψ⟩.'
  },
  {
    stepNumber: 7,
    title: 'Classical Communication Channel',
    subtitle: 'Alice transmits two classical bits (m₀, m₁) to Bob at light speed',
    circuitOperation: 'Transmit classical message (m₀, m₁) to Bob',
    activeQubits: [],
    whatHappened: 'Alice sends the two measured classical bits (m₀, m₁) to Bob using a classical channel (fiber optic cable, radio waves).',
    whyHappened: 'Bob has no way of knowing which of the 4 states his qubit collapsed into until he receives Alice\'s classical message.',
    whatItMeans: 'This proves quantum teleportation does NOT allow faster-than-light communication! Bob must wait for the classical signal.',
    mathBeginner: 'Alice texts Bob her two bits: "m₀, m₁". Bob waits for the message.',
    mathFormal: 'Classical transmission: Alice sends (m₀, m₁) with speed v ≤ c.',
    mathDerivation: 'Before receiving bits, Bob\'s reduced density matrix is ρ_Bob = 1/2 I (completely mixed zero-information state).'
  },
  {
    stepNumber: 8,
    title: 'Bob Applies Conditional Pauli Corrections',
    subtitle: 'Bob executes unitary Pauli rotations X^{m₁} and Z^{m₀} based on Alice\'s bits',
    circuitOperation: 'Bob applies: Z^{m₀} X^{m₁} to qubit q₂',
    activeQubits: [2],
    whatHappened: 'Bob looks at the two classical bits (m₀, m₁) and applies the exact Pauli correction: If m₁=1, apply X. If m₀=1, apply Z.',
    whyHappened: 'Since X² = I and Z² = I, applying X cancels the bit-flip, and applying Z cancels the phase-flip.',
    whatItMeans: 'Whatever distortion was caused by Alice\'s random measurement outcome is perfectly undone by Bob\'s conditional gate!',
    mathBeginner: '00 ➔ Do nothing. 01 ➔ Flip bit (X). 10 ➔ Flip phase (Z). 11 ➔ Flip bit and phase (XZ).',
    mathFormal: 'U_Bob = Z^{m₀} X^{m₁}. Result: U_Bob (Z^{m₀} X^{m₁} |ψ⟩) = |ψ⟩.',
    mathDerivation: 'Case 00: I|ψ⟩ = |ψ⟩. Case 01: X(X|ψ⟩) = |ψ⟩. Case 10: Z(Z|ψ⟩) = |ψ⟩. Case 11: Z X (X Z |ψ⟩) = |ψ⟩.'
  },
  {
    stepNumber: 9,
    title: 'Quantum State Faithfully Recovered!',
    subtitle: 'Bob\'s qubit q₂ now matches Alice\'s original state |ψ⟩ with 100% fidelity',
    circuitOperation: '|ψ⟩_Bob = α|0⟩ + β|1⟩ (Fidelity = 1.00)',
    activeQubits: [2],
    whatHappened: 'Bob\'s qubit q₂ is now in state |ψ⟩ = α|0⟩ + β|1⟩. Both probability amplitudes α, β and relative phase angle φ are perfectly preserved!',
    whyHappened: 'The mathematical cancellation of Pauli errors guarantees 100% unitary state reconstruction regardless of the random measurement outcome.',
    whatItMeans: 'Quantum Teleportation is complete! The quantum state was transferred without the physical particle ever traveling between laboratories.',
    mathBeginner: 'Success! Bob\'s qubit is now identical to Alice\'s original qubit: |ψ⟩!',
    mathFormal: '|q₂⟩_final = α|0⟩ + β|1⟩. Fidelity F = |⟨ψ_in|ψ_out⟩|² = 1.00.',
    mathDerivation: 'Original state destroyed at Alice; exact quantum state reconstructed at Bob. Q.E.D.'
  }
];

// ---------------------------------------------------------------------------
// 6. CHECKPOINT QUESTIONS
// ---------------------------------------------------------------------------
export const TELEPORTATION_CHECKPOINTS: CheckpointQuestion[] = [
  {
    id: 'chk-1',
    question: 'Why can\'t Alice simply measure her unknown qubit and tell Bob the numbers over the phone?',
    options: [
      'Alice does not have a phone in her quantum lab.',
      'Measurement irreversibly collapses the superposition into 0 or 1, destroying the exact amplitudes and phase.',
      'Classical phones cannot transmit complex numbers.',
      'Measuring a qubit makes it too hot to touch.'
    ],
    correctIndex: 1,
    explanation: 'Measuring an unknown qubit collapses it into an eigenstate (0 or 1), permanently destroying the complex probability amplitudes α and β. A single measurement cannot reveal the continuous coordinates of an unknown state!'
  },
  {
    id: 'chk-2',
    question: 'Does Quantum Teleportation transport physical matter (like in science fiction)?',
    options: [
      'Yes, it disintegrates atoms and beams them through a quantum wormhole.',
      'Yes, but only for tiny subatomic particles like protons and neutrons.',
      'No, it only transports the quantum state (information); the physical particle remains at Alice\'s side.',
      'It depends on whether fiber optics or laser beams are used.'
    ],
    correctIndex: 2,
    explanation: 'Quantum teleportation transfers quantum INFORMATION (the state vector |ψ⟩). Alice\'s physical qubit stays in Alice\'s lab, while Bob\'s physical qubit was already in Bob\'s lab as part of the entangled pair.'
  },
  {
    id: 'chk-3',
    question: 'Why doesn\'t Quantum Teleportation violate Einstein\'s cosmic speed limit (c)?',
    options: [
      'It does violate relativity, but physicists don\'t talk about it.',
      'Because Bob cannot reconstruct the state until he receives Alice\'s 2 classical bits, which travel at or below light speed.',
      'Because entanglement moves at the speed of sound.',
      'Because the quantum vacuum absorbs the extra speed.'
    ],
    correctIndex: 1,
    explanation: 'Before Bob receives the two classical bits from Alice, his qubit is in a maximally mixed state with zero extractable information. The protocol requires a classical communication channel, which is strictly bounded by the speed of light c.'
  },
  {
    id: 'chk-4',
    question: 'If Alice measures outcome "10" (m₀ = 1, m₁ = 0), which correction gate must Bob apply?',
    options: [
      'Identity gate I (do nothing)',
      'Pauli-X gate (bit-flip)',
      'Pauli-Z gate (phase-flip)',
      'Both X and Z gates'
    ],
    correctIndex: 2,
    explanation: 'When Alice measures 10, Bob temporarily holds Z|ψ⟩. To undo the phase flip, Bob must apply the Pauli-Z gate (since Z · Z = I).'
  },
  {
    id: 'chk-5',
    question: 'Why does Quantum Teleportation NOT violate the No-Cloning Theorem?',
    options: [
      'Because the No-Cloning theorem only applies to classical computers.',
      'Because Alice\'s original quantum state is destroyed by measurement during the protocol, so only one copy ever exists.',
      'Because Bob\'s state is only an approximation.',
      'Because the Bell state duplicates the state before it is measured.'
    ],
    correctIndex: 1,
    explanation: 'The No-Cloning Theorem prohibits duplicating an unknown state. In quantum teleportation, Alice\'s measurement destroys her local copy in the process of transferring it to Bob, so at no point do two identical copies coexist!'
  }
];

// ---------------------------------------------------------------------------
// 7. PROTOCOL OVERVIEW STAGES (8 Flow Stages per Specification)
// ---------------------------------------------------------------------------
export const PROTOCOL_STAGES: ProtocolStage[] = [
  {
    id: 'stage-1',
    title: 'UNKNOWN STATE',
    desc: 'Alice holds an unknown qubit state |ψ⟩ = α|0⟩ + β|1⟩ which she wishes to convey to Bob without measuring or cloning it.'
  },
  {
    id: 'stage-2',
    title: 'CREATE ENTANGLED PAIR',
    desc: 'A third-party EPR source (or Alice & Bob) prepares a maximally entangled Bell pair |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 and distributes one qubit to Alice (q₁) and one to Bob (q₂).'
  },
  {
    id: 'stage-3',
    title: 'ALICE HOLDS 2 QUBITS',
    desc: 'Alice now holds two qubits locally: her unknown target qubit q₀ and her entangled Bell half q₁.'
  },
  {
    id: 'stage-4',
    title: 'BELL-STATE OPERATION',
    desc: 'Alice performs a CNOT(q₀, q₁) followed by a Hadamard gate H(q₀) to entangle her unknown qubit with the Bell pair.'
  },
  {
    id: 'stage-5',
    title: 'MEASURE ALICE\'S 2 QUBITS',
    desc: 'Alice performs standard computational measurements on both q₀ and q₁, collapsing the 3-qubit wavefunction and obtaining two classical bits (m₀, m₁).'
  },
  {
    id: 'stage-6',
    title: 'SEND 2 CLASSICAL BITS',
    desc: 'Alice sends the two classical measurement bits (m₀, m₁) to Bob via a classical communication channel (radio, fiber optic, or laser) bounded by speed of light c.'
  },
  {
    id: 'stage-7',
    title: 'BOB APPLIES CORRECTION',
    desc: 'Bob receives (m₀, m₁) and conditionally applies unitary Pauli gates: if m₁=1, apply X; if m₀=1, apply Z (total operator: Z^{m₀} X^{m₁}).'
  },
  {
    id: 'stage-8',
    title: 'BOB RECOVERS STATE',
    desc: 'Bob\'s qubit q₂ is now precisely in the original state |ψ⟩ = α|0⟩ + β|1⟩. Fidelity is 100% and Alice\'s original state was destroyed.'
  }
];

// ---------------------------------------------------------------------------
// 8. APPLICATIONS DATA (Current Research vs Future Potential)
// ---------------------------------------------------------------------------
export const APPLICATIONS_DATA: ApplicationItem[] = [
  {
    title: 'Quantum Key Distribution (QKD)',
    category: 'current',
    status: 'Commercial / Field Tested',
    description: 'Enables provably unbreakable cryptographic key exchange over satellite and metropolitan dark-fiber links.'
  },
  {
    title: 'Satellite-to-Ground Teleportation',
    category: 'current',
    status: 'Achieved over 1,400 km (Micius)',
    description: 'Ground-to-space quantum state teleportation demonstrating global-scale quantum links through free space.'
  },
  {
    title: 'Trapped-Ion & Superconducting State Transfer',
    category: 'current',
    status: 'Laboratory Benchmark',
    description: 'Teleportation of quantum gate states between distinct physical qubits within quantum computing processors.'
  },
  {
    title: 'Long-Distance Quantum Repeaters',
    category: 'future',
    status: 'Active Academic R&D',
    description: 'Overcoming fiber optical photon loss using entanglement swapping and quantum memory nodes without measurement collapse.'
  },
  {
    title: 'Distributed Quantum Computing',
    category: 'future',
    status: 'Architecture Design Phase',
    description: 'Linking modular, multi-core quantum processors across datacenters into a single unified coherent supercomputing cluster.'
  },
  {
    title: 'Global Quantum Internet',
    category: 'future',
    status: 'Next-Generation Horizon',
    description: 'A worldwide quantum communication mesh networking quantum computers, quantum sensor arrays, and secure cryptographic nodes.'
  }
];

// Enrich datasets with convenience alias properties
TELEPORTATION_FLASHCARDS.forEach(fc => {
  fc.front = fc.question;
  fc.back = fc.answer;
});

CIRCUIT_GATES_INFO.forEach(g => {
  g.wire = g.qubits;
});

const enrichMindMap = (node: MindMapNode) => {
  node.description = node.details;
  if (node.children) node.children.forEach(enrichMindMap);
};
enrichMindMap(TELEPORTATION_MINDMAP);

TELEPORTATION_STEPS.forEach(s => {
  s.step = s.stepNumber;
  s.operation = s.circuitOperation;
  s.whyItHappened = s.whyHappened;
  s.meaning = s.whatItMeans;
  s.mathFormula = s.mathFormal;
  s.advancedDerivation = s.mathDerivation;
  s.inputState = s.stepNumber === 1 ? '|ψ⟩' : s.stepNumber <= 5 ? '|Ψ⟩' : 'm₀, m₁';
  s.outputState = s.stepNumber === 9 ? '|ψ⟩ (100% Match)' : s.stepNumber >= 6 ? 'Corrected |ψ⟩' : 'Transformed |Ψ⟩';
});

