// src/quantum/matrix.ts
import { Complex } from './complex';
import { ComplexNumber, GateDefinition, GateType } from '../types';

export type Matrix2x2 = [
  [Complex, Complex],
  [Complex, Complex]
];

export type Matrix = Complex[][];

export class QuantumMatrix {
  static identity2(): Matrix2x2 {
    return [
      [Complex.one(), Complex.zero()],
      [Complex.zero(), Complex.one()]
    ];
  }

  static pauliX(): Matrix2x2 {
    return [
      [Complex.zero(), Complex.one()],
      [Complex.one(), Complex.zero()]
    ];
  }

  static pauliY(): Matrix2x2 {
    return [
      [Complex.zero(), new Complex(0, -1)],
      [new Complex(0, 1), Complex.zero()]
    ];
  }

  static pauliZ(): Matrix2x2 {
    return [
      [Complex.one(), Complex.zero()],
      [Complex.zero(), new Complex(-1, 0)]
    ];
  }

  static hadamard(): Matrix2x2 {
    const inv = 1 / Math.SQRT2;
    return [
      [new Complex(inv, 0), new Complex(inv, 0)],
      [new Complex(inv, 0), new Complex(-inv, 0)]
    ];
  }

  static phaseS(): Matrix2x2 {
    return [
      [Complex.one(), Complex.zero()],
      [Complex.zero(), Complex.i()]
    ];
  }

  static phaseSDagger(): Matrix2x2 {
    return [
      [Complex.one(), Complex.zero()],
      [Complex.zero(), new Complex(0, -1)]
    ];
  }

  static phaseT(): Matrix2x2 {
    const phi = Math.PI / 4;
    return [
      [Complex.one(), Complex.zero()],
      [Complex.zero(), Complex.exp(phi)]
    ];
  }

  static phaseTDagger(): Matrix2x2 {
    const phi = -Math.PI / 4;
    return [
      [Complex.one(), Complex.zero()],
      [Complex.zero(), Complex.exp(phi)]
    ];
  }

  static rx(theta: number): Matrix2x2 {
    const half = theta / 2;
    const cos = Math.cos(half);
    const sin = Math.sin(half);
    return [
      [new Complex(cos, 0), new Complex(0, -sin)],
      [new Complex(0, -sin), new Complex(cos, 0)]
    ];
  }

  static ry(theta: number): Matrix2x2 {
    const half = theta / 2;
    const cos = Math.cos(half);
    const sin = Math.sin(half);
    return [
      [new Complex(cos, 0), new Complex(-sin, 0)],
      [new Complex(sin, 0), new Complex(cos, 0)]
    ];
  }

  static rz(theta: number): Matrix2x2 {
    const half = theta / 2;
    return [
      [Complex.exp(-half), Complex.zero()],
      [Complex.zero(), Complex.exp(half)]
    ];
  }

  static getSingleQubitGate(type: GateType, params?: { theta?: number }): Matrix2x2 {
    switch (type) {
      case 'I': return this.identity2();
      case 'X': return this.pauliX();
      case 'Y': return this.pauliY();
      case 'Z': return this.pauliZ();
      case 'H': return this.hadamard();
      case 'S': return this.phaseS();
      case 'S_DAG': return this.phaseSDagger();
      case 'T': return this.phaseT();
      case 'T_DAG': return this.phaseTDagger();
      case 'RX': return this.rx(params?.theta ?? Math.PI);
      case 'RY': return this.ry(params?.theta ?? Math.PI);
      case 'RZ': return this.rz(params?.theta ?? Math.PI);
      default: return this.identity2();
    }
  }

  static identityN(dim: number): Matrix {
    const mat: Matrix = [];
    for (let i = 0; i < dim; i++) {
      const row: Complex[] = [];
      for (let j = 0; j < dim; j++) {
        row.push(i === j ? Complex.one() : Complex.zero());
      }
      mat.push(row);
    }
    return mat;
  }

  static multiply(a: Matrix, b: Matrix): Matrix {
    const rows = a.length;
    const cols = b[0].length;
    const inner = b.length;
    const result: Matrix = [];

    for (let r = 0; r < rows; r++) {
      const row: Complex[] = [];
      for (let c = 0; c < cols; c++) {
        let sum = Complex.zero();
        for (let k = 0; k < inner; k++) {
          sum = sum.add(a[r][k].mul(b[k][c]));
        }
        row.push(sum);
      }
      result.push(row);
    }
    return result;
  }

  static tensorProduct(a: Matrix, b: Matrix): Matrix {
    const aRows = a.length;
    const aCols = a[0].length;
    const bRows = b.length;
    const bCols = b[0].length;

    const resultRows = aRows * bRows;
    const resultCols = aCols * bCols;
    const res: Matrix = Array.from({ length: resultRows }, () =>
      Array.from({ length: resultCols }, () => Complex.zero())
    );

    for (let i1 = 0; i1 < aRows; i1++) {
      for (let j1 = 0; j1 < aCols; j1++) {
        for (let i2 = 0; i2 < bRows; i2++) {
          for (let j2 = 0; j2 < bCols; j2++) {
            res[i1 * bRows + i2][j1 * bCols + j2] = a[i1][j1].mul(b[i2][j2]);
          }
        }
      }
    }
    return res;
  }

  static conjugateTranspose(a: Matrix): Matrix {
    const rows = a.length;
    const cols = a[0].length;
    const res: Matrix = [];
    for (let c = 0; c < cols; c++) {
      const row: Complex[] = [];
      for (let r = 0; r < rows; r++) {
        row.push(a[r][c].conj());
      }
      res.push(row);
    }
    return res;
  }

  static multiplyVector(m: Matrix, v: Complex[]): Complex[] {
    const rows = m.length;
    const cols = m[0].length;
    const res: Complex[] = [];
    for (let r = 0; r < rows; r++) {
      let sum = Complex.zero();
      for (let c = 0; c < cols; c++) {
        sum = sum.add(m[r][c].mul(v[c]));
      }
      res.push(sum);
    }
    return res;
  }

  static trace(m: Matrix): Complex {
    let sum = Complex.zero();
    for (let i = 0; i < m.length; i++) {
      sum = sum.add(m[i][i]);
    }
    return sum;
  }
}

export const GATE_DEFINITIONS: Record<GateType, GateDefinition> = {
  H: {
    type: 'H',
    name: 'Hadamard',
    symbol: 'H',
    qubitCount: 1,
    description: 'Creates an equal superposition of |0⟩ and |1⟩. Maps Z basis to X basis.',
    matrixLatex: '\\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}',
    category: 'single'
  },
  X: {
    type: 'X',
    name: 'Pauli-X (NOT)',
    symbol: 'X',
    qubitCount: 1,
    description: 'Quantum bit-flip NOT gate. Rotates state by π around the X-axis.',
    matrixLatex: '\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}',
    category: 'single'
  },
  Y: {
    type: 'Y',
    name: 'Pauli-Y',
    symbol: 'Y',
    qubitCount: 1,
    description: 'Bit and phase flip. Rotates state by π around the Y-axis.',
    matrixLatex: '\\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}',
    category: 'single'
  },
  Z: {
    type: 'Z',
    name: 'Pauli-Z',
    symbol: 'Z',
    qubitCount: 1,
    description: 'Phase flip. Leaves |0⟩ unchanged, negates phase of |1⟩.',
    matrixLatex: '\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
    category: 'phase'
  },
  S: {
    type: 'S',
    name: 'Phase (S)',
    symbol: 'S',
    qubitCount: 1,
    description: 'Phase gate. Adds a π/2 (90°) phase shift to state |1⟩. S = √Z.',
    matrixLatex: '\\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}',
    category: 'phase'
  },
  S_DAG: {
    type: 'S_DAG',
    name: 'Phase Dagger',
    symbol: 'S†',
    qubitCount: 1,
    description: 'Inverse Phase gate. Adds -π/2 (-90°) phase shift to state |1⟩.',
    matrixLatex: '\\begin{pmatrix} 1 & 0 \\\\ 0 & -i \\end{pmatrix}',
    category: 'phase'
  },
  T: {
    type: 'T',
    name: 'T (π/8)',
    symbol: 'T',
    qubitCount: 1,
    description: 'Adds a π/4 (45°) phase shift to state |1⟩. T = √S = ⁴√Z.',
    matrixLatex: '\\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix}',
    category: 'phase'
  },
  T_DAG: {
    type: 'T_DAG',
    name: 'T Dagger',
    symbol: 'T†',
    qubitCount: 1,
    description: 'Inverse T gate. Adds -π/4 (-45°) phase shift to state |1⟩.',
    matrixLatex: '\\begin{pmatrix} 1 & 0 \\\\ 0 & e^{-i\\pi/4} \\end{pmatrix}',
    category: 'phase'
  },
  RX: {
    type: 'RX',
    name: 'Rx(θ)',
    symbol: 'Rx',
    qubitCount: 1,
    description: 'Arbitrary rotation around the X-axis of the Bloch sphere by angle θ.',
    isParametric: true,
    category: 'rotation'
  },
  RY: {
    type: 'RY',
    name: 'Ry(θ)',
    symbol: 'Ry',
    qubitCount: 1,
    description: 'Arbitrary rotation around the Y-axis of the Bloch sphere by angle θ.',
    isParametric: true,
    category: 'rotation'
  },
  RZ: {
    type: 'RZ',
    name: 'Rz(θ)',
    symbol: 'Rz',
    qubitCount: 1,
    description: 'Arbitrary rotation around the Z-axis of the Bloch sphere by angle θ.',
    isParametric: true,
    category: 'rotation'
  },
  CX: {
    type: 'CX',
    name: 'CNOT (CX)',
    symbol: 'CX',
    qubitCount: 2,
    description: 'Controlled-NOT. Flips target qubit if control qubit is |1⟩. Primary entanglement generator.',
    category: 'multi'
  },
  CZ: {
    type: 'CZ',
    name: 'Controlled-Z',
    symbol: 'CZ',
    qubitCount: 2,
    description: 'Controlled-Z. Applies Z gate (phase flip) to target qubit if control qubit is |1⟩.',
    category: 'multi'
  },
  SWAP: {
    type: 'SWAP',
    name: 'SWAP',
    symbol: 'SWAP',
    qubitCount: 2,
    description: 'Exchanges the states of two qubits. Can be decomposed into 3 CNOT gates.',
    category: 'multi'
  },
  CCX: {
    type: 'CCX',
    name: 'Toffoli (CCX)',
    symbol: 'CCX',
    qubitCount: 3,
    description: 'Controlled-Controlled-NOT. Flips target if both controls are |1⟩. Universal for classical reversible logic.',
    category: 'multi'
  },
  MEASURE: {
    type: 'MEASURE',
    name: 'Measure',
    symbol: 'M',
    qubitCount: 1,
    description: 'Projective measurement in the computational basis {|0⟩, |1⟩}. Collapses quantum state.',
    category: 'measurement'
  },
  I: {
    type: 'I',
    name: 'Identity',
    symbol: 'I',
    qubitCount: 1,
    description: 'Identity operator. Does nothing (delay / idle cycle).',
    category: 'single'
  }
};
