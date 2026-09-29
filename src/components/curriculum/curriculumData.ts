// src/components/curriculum/curriculumData.ts
import { CurriculumModule } from '../../types';

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'module-1',
    number: 1,
    title: 'Foundations of Information: From Bits to Qubits',
    description: 'Explore the transition from classical deterministic bits to complex quantum state vectors and superposition.',
    badge: 'Bit Pioneer',
    lessons: [
      {
        id: 'lesson-1-1',
        moduleId: 'module-1',
        title: 'Classical Bits vs Quantum Superposition',
        subtitle: 'Why quantum information is fundamentally non-binary',
        conceptSummary: 'A classical bit exists strictly in state 0 or 1. A qubit exists in a linear combination α|0⟩ + β|1⟩, where α and β are complex probability amplitudes.',
        theoryMarkdown: `### 1. The Classical Deterministic Limit
In classical computing, information is represented by physical macroscopic switches (transistors). At any given moment, electric current either flows through the channel or it does not, establishing a definite voltage:
- **Logical 0**: Low voltage state (typically $0.0\\text{ V}$).
- **Logical 1**: High voltage state (typically $+3.3\\text{ V}$ or $+1.8\\text{ V}$).

Classical bits are strictly **binary**, **deterministic**, and can be read or copied infinitely without fundamentally disturbing their stored information.

### 2. Enter the Quantum Superposition Principle
A quantum bit (**qubit**) is realized using an isolated two-level quantum mechanical system, such as an electron's spin (spin-up $|0\\rangle$ or spin-down $|1\\rangle$), or a photon's polarization.

According to quantum mechanics, if $|0\\rangle$ and $|1\\rangle$ are valid states in the Hilbert space $\\mathbb{C}^2$, any complex linear combination is also a valid physical state:

$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$$

where $\\alpha, \\beta \\in \\mathbb{C}$ are complex numbers known as **probability amplitudes**.

Unlike a classical coin that must lie flat on a table as either heads or tails, a qubit in superposition behaves like a coin spinning continuously in the air—holding both possibilities simultaneously until an observation takes place!

### 3. Born's Probability Rule & Wavefunction Collapse
The state vector $|\\psi\\rangle$ itself cannot be directly observed from the outside. When we perform a measurement in the standard computational basis $\{|0\\rangle, |1\\rangle\}$, the superposition **irreversibly collapses** into one of the definite basis states:

- State $|0\\rangle$ is observed with probability $P(0) = |\\alpha|^2$
- State $|1\\rangle$ is observed with probability $P(1) = |\\beta|^2$

Because the total probability of all mutually exclusive outcomes must equal 100%, conservation of probability enforces the fundamental **Born Normalization Condition**:

$$|\\alpha|^2 + |\\beta|^2 = 1$$

### 4. Why Qubits Are Radically More Powerful
While a classical bit stores a single boolean digit (0 or 1), a qubit stores continuous complex coordinates on the Bloch sphere. Furthermore, while $n$ classical bits can only exist in one of $2^n$ configurations at once, an $n$-qubit register can exist in an entangled superposition of all $2^n$ computational basis states simultaneously!`,
        interactiveGoal: 'Apply a Hadamard gate to create the equal superposition |+⟩ = (|0⟩ + |1⟩)/√2 and observe measurement probabilities.',
        numQubits: 1,
        initialCircuitGates: [
          { type: 'H', targets: [0], stepIndex: 0 }
        ],
        predictQuestion: {
          prompt: 'If a qubit is in state |+⟩ = (|0⟩ + |1⟩)/√2 and we measure it 1,000 times, what will we observe?',
          options: [
            '100% of the shots will yield 0',
            'Approximately 50% shots 0 and 50% shots 1',
            'All shots will be in a mysterious half-value 0.5',
            'It will collapse to state 1 every time'
          ],
          correctIndex: 1,
          explanation: 'Since |α|² = |1/√2|² = 1/2 and |β|² = |1/√2|² = 1/2, Born\'s rule predicts exactly 50% probability for 0 and 50% for 1.'
        },
        quiz: {
          id: 'q1-1',
          question: 'If a quantum state has amplitude α = √3 / 2 for state |0⟩, what must the magnitude of amplitude β for state |1⟩ be?',
          options: [
            '|β| = 1/2',
            '|β| = 1/4',
            '|β| = 3/4',
            '|β| = 1/√2'
          ],
          correctIndex: 0,
          explanation: 'By the Born normalization condition: |α|² + |β|² = 1. (√3/2)² + |β|² = 3/4 + |β|² = 1, hence |β|² = 1/4, so |β| = 1/2.'
        },
        aiSuggestedPrompts: [
          'Why can amplitudes be negative or complex numbers?',
          'What physically causes a quantum wavefunction to collapse upon measurement?',
          'Is superposition just classical ignorance like a flipped coin in the air?'
        ],
        masteryCriteria: 'Understand state vectors, complex amplitudes, and Born\'s probability normalization.'
      },
      {
        id: 'lesson-1-2',
        moduleId: 'module-1',
        title: 'Quantum Interference & Relative Phase',
        subtitle: 'How probability amplitudes cancel each other out',
        conceptSummary: 'Classical probabilities always add (P = P1 + P2). Quantum amplitudes can add constructively or destructively cancel out, driving quantum computational speedup.',
        theoryMarkdown: `### The Magic of Wave Interference
Because quantum amplitudes are complex numbers ($\alpha, \beta \in \mathbb{C}$), they possess both a magnitude and a **phase angle** $\phi$:

$$\alpha = |\alpha| e^{i \phi}$$

When multiple computational paths lead to the same state:
$$c_{\\text{final}} = c_1 + c_2$$

If $c_1 = +1/2$ and $c_2 = -1/2$, the amplitudes **destructively interfere**:
$$c_{\\text{final}} = 0 \\implies P = |0|^2 = 0$$

Quantum algorithms are designed so that incorrect answers cancel out via destructive interference, while the correct answer is amplified through constructive interference!`,
        interactiveGoal: 'Apply H, then Z (phase flip), then H again. Watch the state transition from |0⟩ to |1⟩ purely through interference!',
        numQubits: 1,
        initialCircuitGates: [
          { type: 'H', targets: [0], stepIndex: 0 },
          { type: 'Z', targets: [0], stepIndex: 1 },
          { type: 'H', targets: [0], stepIndex: 2 }
        ],
        predictQuestion: {
          prompt: 'What is the final state after applying H, then Z, then H to initial state |0⟩?',
          options: [
            'State |0⟩ with 100% probability',
            'State |1⟩ with 100% probability',
            'Equal superposition |+⟩',
            'Mixed random state'
          ],
          correctIndex: 1,
          explanation: 'H|0⟩ = |+⟩. Z|+⟩ = |-⟩ = (|0⟩ - |1⟩)/√2. H|-⟩ = |1⟩! The destructive interference cancels the |0⟩ amplitude completely.'
        },
        quiz: {
          id: 'q1-2',
          question: 'What is the mathematical consequence of applying a Pauli-Z gate to state |+⟩ = (|0⟩ + |1⟩)/√2?',
          options: [
            'It creates state |-⟩ = (|0⟩ - |1⟩)/√2',
            'It flips the qubit into |0⟩',
            'It leaves the state completely unchanged',
            'It doubles the probability of |1⟩'
          ],
          correctIndex: 0,
          explanation: 'Z|0⟩ = |0⟩ and Z|1⟩ = -|1⟩. Thus Z|+⟩ = (|0⟩ - |1⟩)/√2 = |-⟩.'
        },
        aiSuggestedPrompts: [
          'Can you explain the difference between constructive and destructive interference in quantum computing?',
          'Why cannot classical computers use amplitude cancellation?'
        ],
        masteryCriteria: 'Master relative phase shifts and destructive interference.'
      }
    ]
  },
  {
    id: 'module-2',
    number: 2,
    title: 'The Bloch Sphere & Single-Qubit Geometry',
    description: 'Visualize quantum states as points on the unit 2-sphere S² and explore polar coordinate rotations.',
    badge: 'Geometrician',
    lessons: [
      {
        id: 'lesson-2-1',
        moduleId: 'module-2',
        title: 'Spherical Geometry of the Bloch Sphere',
        subtitle: 'Mapping Hilbert space ℂ² to the 3D unit sphere',
        conceptSummary: 'Every pure single-qubit state can be uniquely represented as a point on the surface of a unit sphere parameterized by polar angle θ (0 to π) and azimuth angle φ (0 to 2π).',
        theoryMarkdown: `### Parameterizing Pure States
Up to an unobservable global phase, any single-qubit pure state can be written as:

$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$

where:
- $\\theta \\in [0, \\pi]$ is the polar angle measured from the North Pole ($+Z$).
- $\\phi \\in [0, 2\\pi)$ is the azimuthal angle in the equatorial plane ($XY$).

### The Cardinal Poles:
- **North Pole ($+Z$)**: $\\theta = 0 \\implies |0\\rangle$
- **South Pole ($-Z$)**: $\\theta = \\pi \\implies |1\\rangle$
- **Equator**: $\\theta = \\pi/2$:
  - $+X$: $\\phi = 0 \\implies |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$
  - $-X$: $\\phi = \\pi \\implies |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$
  - $+Y$: $\\phi = \\pi/2 \\implies |+i\\rangle = \\frac{|0\\rangle + i|1\\rangle}{\\sqrt{2}}$
  - $-Y$: $\\phi = 3\\pi/2 \\implies |-i\\rangle = \\frac{|0\\rangle - i|1\\rangle}{\\sqrt{2}}$`,
        interactiveGoal: 'Rotate the 3D Bloch sphere, inspect the coordinates, and test the camera snap presets.',
        numQubits: 1,
        initialCircuitGates: [
          { type: 'RY', targets: [0], params: { theta: Math.PI / 2 }, stepIndex: 0 }
        ],
        predictQuestion: {
          prompt: 'Where on the Bloch sphere does the state (|0⟩ + i|1⟩)/√2 lie?',
          options: [
            'At the North Pole (+Z)',
            'On the Equator along the positive Y-axis (+Y)',
            'On the Equator along the positive X-axis (+X)',
            'At the South Pole (-Z)'
          ],
          correctIndex: 1,
          explanation: 'With θ = π/2 and relative phase φ = π/2, the state lies on the equator along the +Y direction (the circular basis |+i⟩).'
        },
        quiz: {
          id: 'q2-1',
          question: 'Why is the angle in the state formula θ/2 rather than θ?',
          options: [
            'Because orthogonal states |0⟩ and |1⟩ are separated by 180° (π radians) on the Bloch sphere, but 90° in Hilbert space',
            'Due to electron spin-1/2 requiring a 720° rotation to return to its original quantum phase',
            'Both of the above answers are correct',
            'It is an arbitrary mathematical convention with no physical meaning'
          ],
          correctIndex: 2,
          explanation: 'Both! Qubits represent spin-1/2 systems. Orthogonal quantum states |0⟩ and |1⟩ lie antipodal (180° apart) on the Bloch sphere, so a physical rotation of θ corresponds to half-angle θ/2 in amplitude space.'
        },
        aiSuggestedPrompts: [
          'Why are orthogonal quantum states antipodal (180 degrees apart) on the Bloch sphere?',
          'What happens to a qubit if we rotate it by 360 degrees?'
        ],
        masteryCriteria: 'Fluently locate computational, Hadamard, and circular basis states on the Bloch sphere.'
      }
    ]
  },
  {
    id: 'module-3',
    number: 3,
    title: 'Quantum Gates as Unitary Rotations',
    description: 'Understand how single-qubit gates act as rigid 3D spatial rotations on the Bloch sphere.',
    badge: 'Rotational Master',
    lessons: [
      {
        id: 'lesson-3-1',
        moduleId: 'module-3',
        title: 'The Pauli Rotations: X, Y, and Z',
        subtitle: '180-degree flips around Cartesian axes',
        conceptSummary: 'The fundamental Pauli matrices act as 180-degree (π radian) rotations about their respective Cartesian axes on the Bloch sphere.',
        theoryMarkdown: `### The Pauli Unitaries
The three Pauli matrices are both **Hermitian** ($A = A^\\dagger$) and **Unitary** ($A^\\dagger A = I$). This means:
$$X^2 = Y^2 = Z^2 = I$$
Every Pauli gate is its own inverse!

### Geometric Interpretation:
- **Pauli-X (Bit-flip)**: A rotation by $\\pi$ around the X-axis. It inverts the Z-axis: $|0\\rangle \\leftrightarrow |1\\rangle$.
- **Pauli-Z (Phase-flip)**: A rotation by $\\pi$ around the Z-axis. It leaves the Z-axis fixed and inverts the equator: $|+\\rangle \\leftrightarrow |-\\rangle$.
- **Pauli-Y**: A rotation by $\\pi$ around the Y-axis. It flips both bit and phase.

### Arbitrary Rotation Generators
Any arbitrary rotation around axis $\\vec{n} = (n_x, n_y, n_z)$ by angle $\\theta$ is generated by:
$$R_n(\\theta) = \\exp\\left(-i \\frac{\\theta}{2} \\vec{n} \\cdot \\vec{\\sigma}\\right) = \\cos\\left(\\frac{\\theta}{2}\\right) I - i \\sin\\left(\\frac{\\theta}{2}\\right) (n_x X + n_y Y + n_z Z)$$`,
        interactiveGoal: 'Apply Pauli-X to |0⟩, see the vector flip from North to South, then apply Pauli-Z to observe equatorial rotations.',
        numQubits: 1,
        initialCircuitGates: [
          { type: 'X', targets: [0], stepIndex: 0 }
        ],
        predictQuestion: {
          prompt: 'If you apply Pauli-X twice in a row (X followed by X) to any initial state |ψ⟩, what is the output state?',
          options: [
            'The exact original state |ψ⟩',
            'A flipped state with opposite phase',
            'Equal superposition |+⟩',
            'State |0⟩ always'
          ],
          correctIndex: 0,
          explanation: 'Since X² = I (the identity operator), two consecutive 180° rotations around the X-axis return the qubit to its original state.'
        },
        quiz: {
          id: 'q3-1',
          question: 'Which Pauli gate leaves state |0⟩ unchanged up to global phase, but adds a -1 sign to |1⟩?',
          options: [
            'Pauli-X',
            'Pauli-Y',
            'Pauli-Z',
            'Hadamard'
          ],
          correctIndex: 2,
          explanation: 'The Pauli-Z matrix is diag(1, -1). Z|0⟩ = |0⟩, and Z|1⟩ = -|1⟩.'
        },
        aiSuggestedPrompts: [
          'Why are quantum gates required to be unitary matrices?',
          'What is Landauer\'s principle and why are quantum gates reversible?'
        ],
        masteryCriteria: 'Master Pauli operations and the concept of unitary reversibility.'
      }
    ]
  },
  {
    id: 'module-4',
    number: 4,
    title: 'Entanglement & Multi-Qubit Systems',
    description: 'Discover Einstein\'s "spooky action at a distance", Bell states, and the Quantum Teleportation protocol.',
    badge: 'Quantum Weaver',
    lessons: [
      {
        id: 'lesson-4-1',
        moduleId: 'module-4',
        title: 'The Bell States & EPR Pairs',
        subtitle: 'Maximally entangled two-qubit quantum states',
        conceptSummary: 'An entangled state cannot be written as a product of individual qubit states |ψ⟩ ≠ |q0⟩ ⊗ |q1⟩. Measuring one qubit instantaneously dictates the state of the other.',
        theoryMarkdown: `### The Tensor Product Space
For two qubits, the Hilbert space is $\\mathbb{C}^2 \\otimes \\mathbb{C}^2 = \\mathbb{C}^4$, spanned by four computational basis states:
$$\\{|00\\rangle, |01\\rangle, |10\\rangle, |11\\rangle\\}$$

### Separable vs Entangled States
A state is **separable** if it can be factored:
$$|\\psi\\rangle = |\\psi_A\\rangle \\otimes |\\psi_B\\rangle$$

A state is **entangled** if it is non-separable! The quintessential examples are the four **Bell States**:
$$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$
$$|\\Phi^-\\rangle = \\frac{|00\\rangle - |11\\rangle}{\\sqrt{2}}$$
$$|\\Psi^+\\rangle = \\frac{|01\\rangle + |10\\rangle}{\\sqrt{2}}$$
$$|\\Psi^-\\rangle = \\frac{|01\\rangle - |10\\rangle}{\\sqrt{2}}$$

### The CNOT Entangler
The canonical way to generate $|\\Phi^+\\rangle$:
1. Start in $|00\\rangle$
2. Apply $H$ to qubit 0: $\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}$
3. Apply $\\text{CNOT}$ (control: 0, target: 1): maps $|10\\rangle \\to |11\\rangle$, producing $|\\Phi^+\\rangle$!`,
        interactiveGoal: 'Simulate the Bell State circuit. Notice on the 3D Bloch sphere that both individual qubit vectors shrink to the origin r=0 with maximum entanglement entropy!',
        numQubits: 2,
        initialCircuitGates: [
          { type: 'H', targets: [0], stepIndex: 0 },
          { type: 'CX', targets: [1], controls: [0], stepIndex: 1 }
        ],
        predictQuestion: {
          prompt: 'If two qubits are in Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2 and Alice measures her qubit and gets "1", what will Bob measure?',
          options: [
            '1 with 100% certainty',
            '0 with 100% certainty',
            '50% chance of 0 and 50% chance of 1',
            'His qubit will be destroyed'
          ],
          correctIndex: 0,
          explanation: 'The wavefunction collapses instantaneously onto |11⟩. Because the states are perfectly correlated, Bob is guaranteed to measure 1!'
        },
        quiz: {
          id: 'q4-1',
          question: 'What is the reduced density matrix of qubit 0 when the two qubits are in Bell state |Φ+⟩?',
          options: [
            'Maximally mixed state ρ = I/2 with Bloch vector length r = 0',
            'Pure state |0⟩ with r = 1',
            'Pure state |+⟩ with r = 1',
            'Zero matrix'
          ],
          correctIndex: 0,
          explanation: 'Partial tracing out qubit 1 leaves qubit 0 in the maximally mixed state ρ = diag(1/2, 1/2) = I/2. Its Bloch vector length is r = 0 (the exact center of the sphere), representing complete lack of local information!'
        },
        aiSuggestedPrompts: [
          'Does quantum entanglement violate Einstein\'s special relativity by transmitting information faster than light?',
          'Why does the Bloch vector shrink inside the sphere for entangled qubits?'
        ],
        masteryCriteria: 'Understand non-separability, Bell state synthesis, and reduced density matrices.'
      }
    ]
  },
  {
    id: 'module-5',
    number: 5,
    title: 'Quantum Algorithms & Speedups',
    description: 'Master Grover\'s search, Quantum Fourier Transform, and Shor\'s period-finding factorization.',
    badge: 'Algorithm Architect',
    lessons: [
      {
        id: 'lesson-5-1',
        moduleId: 'module-5',
        title: "Grover's Search Algorithm",
        subtitle: 'Quadratic speedup for unstructured database search',
        conceptSummary: 'Grover\'s algorithm searches an unsorted database of N items in O(√N) queries instead of classical O(N), using phase inversion and amplitude amplification.',
        theoryMarkdown: `### The Search Problem
Suppose you have an unsorted database of $N = 2^n$ items, with one marked solution $w$. Classically, in the worst case, you must check all $N$ items (average $N/2$ queries).

Grover's algorithm finds $w$ in $\\mathcal{O}(\\sqrt{N})$ steps!

### The Two Core Operators:
1. **Phase Oracle ($U_w$)**: Flips the phase of the marked target state only:
$$U_w |x\\rangle = \\begin{cases} -|x\\rangle & \\text{if } x = w \\\\ +|x\\rangle & \\text{if } x \\neq w \\end{cases}$$

2. **Grover Diffusion Operator ($D$)**: Inversion about the average amplitude:
$$D = 2|s\\rangle\\langle s| - I = H^{\\otimes n} (2|0\\rangle\\langle 0| - I) H^{\\otimes n}$$

In a 2-qubit system ($N = 4$), a single Grover iteration amplifies the probability of the target item from $25\\%$ to **$100\\%$**!`,
        interactiveGoal: 'Run the 2-qubit Grover circuit. Watch how the marked item |11⟩ is amplified to 100% probability.',
        numQubits: 2,
        initialCircuitGates: [
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
          { type: 'H', targets: [1], stepIndex: 6 }
        ],
        predictQuestion: {
          prompt: 'For an unsorted database of 1,000,000 items, approximately how many queries does Grover\'s algorithm need?',
          options: [
            '~1,000 queries (quadratic speedup √1,000,000)',
            '~500,000 queries',
            'Only 1 query',
            '1,000,000 queries'
          ],
          correctIndex: 0,
          explanation: 'Grover requires ~ (π/4) * √N operations. For N = 1,000,000, √N = 1,000 queries, representing a massive real-world quadratic speedup!'
        },
        quiz: {
          id: 'q5-1',
          question: 'What is the role of the Grover Diffusion Operator (Inversion about the mean)?',
          options: [
            'It flips the amplitudes that were negated by the oracle above the average, boosting the solution\'s probability',
            'It randomly shuffles the database',
            'It measures the quantum state and resets the qubits',
            'It performs error correction'
          ],
          correctIndex: 0,
          explanation: 'After the oracle negates the marked amplitude, the average amplitude drops below zero. Inversion about this mean reflects the negated amplitude high above the others, amplifying it!'
        },
        aiSuggestedPrompts: [
          'Can Grover\'s algorithm solve NP-complete problems in polynomial time?',
          'How does Shor\'s algorithm achieve exponential speedup compared to Grover\'s quadratic speedup?'
        ],
        masteryCriteria: 'Master the phase oracle and amplitude amplification mechanism.'
      }
    ]
  },
  {
    id: 'module-6',
    number: 6,
    title: 'Quantum Noise, Decoherence & Error Correction',
    description: 'Understand environment coupling, T1 and T2 relaxation times, and how quantum error codes protect fragile states.',
    badge: 'Fault-Tolerant Architect',
    lessons: [
      {
        id: 'lesson-6-1',
        moduleId: 'module-6',
        title: 'Decoherence & The 3-Qubit Bit-Flip Code',
        subtitle: 'Protecting quantum information without measuring it',
        conceptSummary: 'Quantum systems interact with their environment, causing energy relaxation (T1) and dephasing (T2). Quantum error correction uses entanglement redundancy and syndrome measurements without collapsing the superposition.',
        theoryMarkdown: `### The No-Cloning Theorem
In classical computing, error correction is simple: make copies (0 -> 000, 1 -> 111).
However, the **No-Cloning Theorem** proves that an unknown quantum state cannot be copied:
$$U(|\\psi\\rangle |0\\rangle) \\neq |\\psi\\rangle |\\psi\\rangle$$

### Entangled Redundancy
Instead of cloning, we entangle a single logical qubit into multiple physical qubits:
$$|0\\rangle_L = |000\\rangle$$
$$|1\\rangle_L = |111\\rangle$$

If environmental noise introduces an $X$ bit-flip error on one qubit (e.g. $|000\\rangle \\to |010\\rangle$), we can measure **syndrome operators** (parity checks $Z_0 Z_1$ and $Z_1 Z_2$) that reveal *which* qubit flipped without revealing *what* the logical state is!`,
        interactiveGoal: 'Inspect the 3-qubit bit-flip circuit. Trace how encoding protects the state from noise.',
        numQubits: 3,
        initialCircuitGates: [
          { type: 'H', targets: [0], stepIndex: 0 },
          { type: 'CX', targets: [1], controls: [0], stepIndex: 1 },
          { type: 'CX', targets: [2], controls: [0], stepIndex: 2 },
          { type: 'X', targets: [1], stepIndex: 3 }
        ],
        predictQuestion: {
          prompt: 'Why cannot we protect quantum states by measuring them and rewriting the values if an error occurs?',
          options: [
            'Because projective measurement collapses the superposition into a definite classical 0 or 1, destroying quantum information',
            'Because quantum measurements take too much electricity',
            'Because qubits cannot be measured more than once in their lifetime',
            'Measuring changes the temperature of the chip'
          ],
          correctIndex: 0,
          explanation: 'Measuring the qubit directly forces it to collapse into |0⟩ or |1⟩ according to Born\'s rule, instantly erasing the delicate continuous superposition α|0⟩ + β|1⟩.'
        },
        quiz: {
          id: 'q6-1',
          question: 'What is the physical meaning of the T1 relaxation time in a superconducting quantum processor?',
          options: [
            'The characteristic time for an excited state |1⟩ to decay back to the ground state |0⟩ by emitting energy',
            'The time it takes to boot the cryogenic refrigerator',
            'The duration of a single Hadamard gate pulse',
            'The time until phase coherence is lost on the equator'
          ],
          correctIndex: 0,
          explanation: 'T1 is the longitudinal relaxation time (energy relaxation from |1⟩ to ground state |0⟩), while T2 is the transversal dephasing time.'
        },
        aiSuggestedPrompts: [
          'What is the threshold theorem for fault-tolerant quantum computation?',
          'What is a surface code and why do modern quantum computers (Google, IBM) use it?'
        ],
        masteryCriteria: 'Understand decoherence channels and syndrome-based quantum error correction.'
      }
    ]
  }
];
