// src/quantum/rag/knowledgeBase.ts

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'fundamentals' | 'math' | 'gates' | 'circuits' | 'algorithms' | 'measurement';
  content: string;
  keywords: string[];
  citation: string;
}

export const QUANTUM_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: 'doc-qm-fundamentals',
    title: 'Quantum Mechanics Fundamentals & Postulates',
    category: 'fundamentals',
    content: `The mathematical framework of quantum mechanics rests upon four foundational postulates:
1. State Space: Any isolated quantum system is associated with a complex Hilbert space H. The physical state of the system is completely described by a unit ray or state vector |ψ⟩ with unit norm ⟨ψ|ψ⟩ = 1.
2. Kinematics and Evolution: The time evolution of a closed quantum system is governed by unitary operators U such that |ψ(t)⟩ = U |ψ(0)⟩, where U†U = I. Unitary evolution preserves normalization, inner products, and quantum information.
3. Observables and Measurement: Quantum measurements are described by a collection {M_m} of measurement operators acting on the state space. The index m refers to possible measurement outcomes. The probability of obtaining outcome m is given by Born's rule: P(m) = ⟨ψ| M_m† M_m |ψ⟩. Upon measuring outcome m, the state instantaneously collapses to |ψ'⟩ = M_m|ψ⟩ / √P(m).
4. Composite Systems: The state space of a composite physical system is the tensor product (Kronecker product) H_A ⊗ H_B of the constituent state spaces.`,
    keywords: ['postulates', 'hilbert space', 'state vector', 'born rule', 'measurement', 'unitary evolution', 'collapse', 'tensor product'],
    citation: 'Nielsen & Chuang, Quantum Computation and Quantum Information, Cambridge Univ. Press, Chapter 2'
  },
  {
    id: 'doc-math-foundations',
    title: 'Mathematical Foundations: Linear Algebra & Complex Hilbert Space',
    category: 'math',
    content: `Quantum computing is formulated in finite-dimensional complex vector spaces C^D:
- Dirac Bra-Ket Notation: |v⟩ denotes a column vector (ket), while ⟨v| = (|v⟩)† denotes its conjugate transpose row vector (bra).
- Inner Product: ⟨u|v⟩ = ∑ u_i* v_i. Two states are orthogonal if ⟨u|v⟩ = 0.
- Outer Product: |u⟩⟨v| creates a linear transformation operator from state |v⟩ to |u⟩.
- Unitary Matrices: An operator U is unitary if U†U = UU† = I. Unitary matrices preserve Euclidean lengths and have eigenvalues of the form e^(iθ).
- Hermitian Operators: An operator A is Hermitian if A† = A. All observable physical quantities are represented by Hermitian operators whose eigenvalues are real numbers.
- Tensor Product: For matrices A (m×n) and B (p×q), the Kronecker product A ⊗ B is an (mp×nq) block matrix. For qubits, C² ⊗ C² = C⁴.`,
    keywords: ['linear algebra', 'bra-ket', 'inner product', 'outer product', 'unitary matrix', 'hermitian', 'eigenvalues', 'kronecker'],
    citation: 'Dirac, P. A. M., The Principles of Quantum Mechanics, Oxford Univ. Press'
  },
  {
    id: 'doc-qubits-superposition',
    title: 'Qubits, Superposition, and the Bloch Sphere',
    category: 'fundamentals',
    content: `A classical bit is strictly binary, existing in state 0 or 1. A qubit (quantum bit) is a two-level quantum system:
|ψ⟩ = α|0⟩ + β|1⟩, where α, β ∈ C and |α|² + |β|² = 1.
- Probability Amplitudes: α and β are complex amplitudes. The probability of measuring 0 is P(0) = |α|², and 1 is P(1) = |β|².
- Global vs Relative Phase: A global phase e^(iγ)|ψ⟩ is physically unobservable. However, a relative phase φ in |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩ creates observable interference.
- The Bloch Sphere: A geometric representation of a single qubit where pure states reside on the unit surface (x² + y² + z² = 1).
  Coordinates: x = sin θ cos φ, y = sin θ sin φ, z = cos θ.
  North Pole (+Z) represents |0⟩; South Pole (-Z) represents |1⟩; Equator represents equal superpositions (|+⟩, |-⟩, |+i⟩, |-i⟩).
  States inside the sphere (r < 1) represent mixed or entangled states described by reduced density matrices.`,
    keywords: ['qubit', 'superposition', 'bloch sphere', 'amplitudes', 'relative phase', 'global phase', 'born rule'],
    citation: 'Bloch, F., Physical Review 70, 460 (1946)'
  },
  {
    id: 'doc-quantum-gates',
    title: 'Single-Qubit Quantum Gates and Unitary Rotations',
    category: 'gates',
    content: `Single-qubit quantum gates are 2×2 unitary matrices acting on state vector |ψ⟩:
- Pauli-X (Bit-flip): X = [[0, 1], [1, 0]]. Rotates the Bloch vector by π around the X axis. X|0⟩ = |1⟩, X|1⟩ = |0⟩.
- Pauli-Y (Bit & Phase flip): Y = [[0, -i], [i, 0]]. Rotates by π around the Y axis. Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩.
- Pauli-Z (Phase-flip): Z = [[1, 0], [0, -1]]. Rotates by π around the Z axis. Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩.
- Hadamard (H): H = (1/√2)[[1, 1], [1, -1]]. Changes basis between computational basis {|0⟩, |1⟩} and diagonal basis {|+⟩, |-⟩}. H|0⟩ = |+⟩, H|1⟩ = |-⟩. H = (X + Z)/√2.
- Phase Gate (S): S = [[1, 0], [0, i]]. Rotates by π/2 around Z. Note that S² = Z.
- T Gate (π/8 Gate): T = [[1, 0], [0, e^(iπ/4)]]. Note that T² = S. Crucial for universal quantum fault tolerance.
- Rotation Gates: Rx(θ) = exp(-iθX/2), Ry(θ) = exp(-iθY/2), Rz(θ) = exp(-iθZ/2). Arbitrary single-qubit rotations.`,
    keywords: ['pauli gates', 'hadamard', 'x gate', 'y gate', 'z gate', 's gate', 't gate', 'rotations', 'rx', 'ry', 'rz'],
    citation: 'Barenco et al., Elementary gates for quantum computation, Phys. Rev. A 52, 3457 (1995)'
  },
  {
    id: 'doc-entanglement-multi-qubit',
    title: 'Multi-Qubit Gates, Entanglement, and Bell States',
    category: 'circuits',
    content: `Multi-qubit systems span Hilbert spaces of dimension 2^n:
- Controlled-NOT (CNOT / CX): A 2-qubit gate with matrix [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]]. Flips the target qubit if and only if the control qubit is |1⟩.
- Generating Entanglement: Applying H to qubit 0 then CNOT(0, 1) to initial state |00⟩ creates the maximally entangled Bell state:
  |Φ+⟩ = (|00⟩ + |11⟩) / √2.
  The four Bell states form an orthonormal basis for two qubits:
  |Φ+⟩ = (|00⟩ + |11⟩)/√2, |Φ-⟩ = (|00⟩ - |11⟩)/√2, |Ψ+⟩ = (|01⟩ + |10⟩)/√2, |Ψ-⟩ = (|01⟩ - |10⟩)/√2.
- Quantum Entanglement Definition: A state |ψ⟩ ∈ H_A ⊗ H_B is entangled if it CANNOT be written as a product state |ψ_A⟩ ⊗ |ψ_B⟩.
- Partial Trace & Reduced Density Matrix: When tracing out subsystem B (ρ_A = Tr_B(|ψ⟩⟨ψ|)), an entangled pure state yields a mixed state ρ_A with purity Tr(ρ_A²) < 1 and non-zero Von Neumann entropy S(ρ_A) = -Tr(ρ_A log₂ ρ_A).`,
    keywords: ['cnot', 'cx', 'entanglement', 'bell states', 'epr pair', 'separable', 'reduced density matrix', 'partial trace', 'entropy'],
    citation: 'Einstein, Podolsky, Rosen, Can Quantum-Mechanical Description of Physical Reality be Considered Complete?, Phys. Rev. 47, 777 (1935)'
  },
  {
    id: 'doc-circuit-principles',
    title: 'Quantum Circuit Principles and Reversibility',
    category: 'circuits',
    content: `Quantum circuits execute sequences of unitary operations on quantum registers:
- Reversibility: Because all quantum gates (except measurement) are unitary (U†U = I), every quantum computation is physically reversible. There is no information erasure, obeying Landauer's principle.
- No-Cloning Theorem: An unknown quantum state |ψ⟩ cannot be perfectly duplicated: there is no unitary operator U such that U(|ψ⟩ ⊗ |0⟩) = |ψ⟩ ⊗ |ψ⟩ for all |ψ⟩. Quantum information can be teleported or swapped, but never cloned.
- Universal Gate Sets: Any multi-qubit unitary can be approximated to arbitrary accuracy using Clifford+T gates {H, S, CNOT, T}, or {H, CNOT, arbitrary single-qubit rotations}.
- Measurement in Circuits: Measurement irreversibly collapses superposition into a classical bit value, represented visually by a meter symbol M connected to double classical wires.`,
    keywords: ['circuits', 'reversibility', 'no cloning theorem', 'universal gate set', 'clifford', 'landauer', 'measurement wire'],
    citation: 'Wootters & Zurek, A Single Quantum Cannot be Cloned, Nature 299, 802–803 (1982)'
  },
  {
    id: 'doc-grover-algorithm',
    title: "Grover's Search Algorithm and Amplitude Amplification",
    category: 'algorithms',
    content: `Grover's algorithm searches an unsorted database of N = 2^n elements in O(√N) queries, achieving a quadratic speedup over the classical O(N) limit:
1. Initialization: Prepare equal superposition |s⟩ = H^⊗n |0⟩^⊗n = (1/√N) ∑ |x⟩.
2. The Oracle (Phase Inversion): An oracle operator O flips the sign of the target item |w⟩:
   O |x⟩ = (-1)^(f(x)) |x⟩, where f(x) = 1 if x = w, else 0.
   This reflects the target state across the hyperplane orthogonal to |w⟩.
3. The Diffusion Operator (Inversion about the Average):
   D = 2|s⟩⟨s| - I.
   In quantum circuits, D is implemented as H^⊗n (2|0⟩⟨0| - I) H^⊗n.
   Diffusion reflects all state amplitudes across the mean amplitude.
4. Iterations: Repeating the Grover operator G = D · O approximately R ≈ (π/4)√N times rotates the state vector in the 2D subspace spanned by |w⟩ and |s⟩ directly towards |w⟩, driving the probability of measuring the target item to nearly 100%.`,
    keywords: ['grover', 'search', 'amplitude amplification', 'oracle', 'diffusion operator', 'quadratic speedup', 'iterations'],
    citation: 'Grover, L. K., A fast quantum mechanical algorithm for database search, STOC 1996, 212–219'
  },
  {
    id: 'doc-qft-algorithm',
    title: 'Quantum Fourier Transform (QFT) and Phase Estimation',
    category: 'algorithms',
    content: `The Quantum Fourier Transform maps a computational basis state |j⟩ to an equal-magnitude phase state:
QFT_N |j⟩ = (1/√N) ∑_{k=0}^{N-1} e^(2πi·j·k / N) |k⟩.
- Circuit Structure: For n qubits (N = 2^n), QFT requires only n(n+1)/2 gates:
  For each qubit j from 0 to n-1:
    Apply Hadamard H to qubit j.
    Apply controlled phase rotations R_k = [[1, 0], [0, exp(2πi / 2^k)]] from subsequent qubits.
  Finally, apply SWAP gates to reverse qubit order (q_i ↔ q_{n-1-i}).
- Exponential Speedup: Classical FFT requires O(N log N) = O(n 2^n) operations. The QFT requires O(n²) gates—an exponential reduction in transforming amplitudes.
- Quantum Phase Estimation (QPE): Uses QFT† to determine the eigenvalue phase θ of a unitary operator U|u⟩ = e^(2πiθ)|u⟩ with exponential precision, serving as the engine for Shor's algorithm and quantum chemistry.`,
    keywords: ['qft', 'quantum fourier transform', 'phase estimation', 'controlled phase', 'swap gates', 'exponential speedup', 'frequency domain'],
    citation: 'Coppersmith, D., An approximate Fourier transform useful in quantum factoring, IBM Research Report (1994)'
  },
  {
    id: 'doc-shor-algorithm',
    title: "Shor's Algorithm for Prime Factorization and RSA Cryptanalysis",
    category: 'algorithms',
    content: `Peter Shor's 1994 algorithm factors composite integers N in polynomial time O((log N)³), rendering RSA public-key encryption vulnerable:
1. Reduction to Order Finding: Factoring composite N = p × q reduces to finding the period r of the function f(x) = a^x mod N for a randomly chosen coprime integer a (gcd(a, N) = 1).
2. Quantum Period Finding Subroutine:
   - Prepare counting register in equal superposition: (1/√2^m) ∑ |x⟩ |0⟩.
   - Compute modular exponentiation in superposition: (1/√2^m) ∑ |x⟩ |a^x mod N⟩.
   - Measure the target register: this collapses the counting register into a periodic state with period r.
   - Apply Inverse QFT (QFT†): translates the spatial periodicity into constructive interference peaks at multiples of 2^m / r.
   - Measure the counting register to obtain an integer s.
3. Continued Fractions: Use the classical continued fractions algorithm on s / 2^m to extract the exact denominator r.
4. Factor Extraction: If r is even and a^(r/2) ≠ -1 mod N, non-trivial prime factors are computed via Euclid's algorithm:
   p = gcd(a^(r/2) - 1, N), and q = gcd(a^(r/2) + 1, N).`,
    keywords: ['shor', 'factorization', 'rsa', 'cryptography', 'period finding', 'order finding', 'modular exponentiation', 'continued fractions', 'euclid gcd'],
    citation: 'Shor, P. W., Algorithms for quantum computation: discrete logarithms and factoring, FOCS 1994, 124–134'
  },
  {
    id: 'doc-quantum-measurement',
    title: 'Measurement, Decoherence, and Open Quantum Systems',
    category: 'measurement',
    content: `Real-world quantum processors interact with environmental degrees of freedom, causing decoherence:
- Pure vs Mixed States: A pure state |ψ⟩ has density matrix ρ = |ψ⟩⟨ψ| with Tr(ρ²) = 1. A mixed state is a statistical ensemble ρ = ∑ p_i |ψ_i⟩⟨ψ_i| where Tr(ρ²) < 1.
- Von Neumann Entanglement Entropy: S(ρ) = -Tr(ρ log₂ ρ) = -∑ λ_i log₂ λ_i, measuring the amount of entanglement between a subsystem and the rest of the universe.
- Relaxation (T1) and Dephasing (T2):
  T1 (Energy relaxation): Transition from excited state |1⟩ to ground state |0⟩.
  T2 (Dephasing): Loss of relative phase coherence without energy loss, causing off-diagonal elements of the density matrix to decay to zero.
- Quantum Error Correction: Preserves quantum information by encoding a single logical qubit into entangled states of multiple physical qubits (e.g., surface codes, Shor 9-qubit code).`,
    keywords: ['measurement', 'decoherence', 'density matrix', 'mixed state', 'purity', 'entropy', 't1', 't2', 'error correction'],
    citation: 'Zurek, W. H., Decoherence, einselection, and the quantum origins of the classical, Rev. Mod. Phys. 75, 715 (2003)'
  }
];
