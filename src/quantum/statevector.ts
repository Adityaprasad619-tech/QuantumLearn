// src/quantum/statevector.ts
import { Complex } from './complex';
import { QuantumMatrix } from './matrix';
import { ComplexNumber, QubitState, GateType } from '../types';

export class StateVector {
  readonly numQubits: number;
  readonly dim: number;
  amplitudes: Complex[];

  constructor(numQubits: number, amplitudes?: ComplexNumber[]) {
    this.numQubits = numQubits;
    this.dim = 1 << numQubits;

    if (amplitudes && amplitudes.length === this.dim) {
      this.amplitudes = amplitudes.map(a => new Complex(a.re, a.im));
    } else {
      // Default: |00...0>
      this.amplitudes = Array.from({ length: this.dim }, (_, i) =>
        i === 0 ? Complex.one() : Complex.zero()
      );
    }
  }

  clone(): StateVector {
    return new StateVector(this.numQubits, this.amplitudes.map(a => new Complex(a.re, a.im)));
  }

  normalize(): void {
    let normSq = 0;
    for (const amp of this.amplitudes) {
      normSq += amp.absSq();
    }
    if (normSq > 0 && Math.abs(normSq - 1.0) > 1e-10) {
      const norm = Math.sqrt(normSq);
      this.amplitudes = this.amplitudes.map(a => a.scale(1 / norm));
    }
  }

  getProbabilities(): number[] {
    return this.amplitudes.map(a => a.absSq());
  }

  applySingleQubitGate(gateType: GateType, target: number, params?: { theta?: number }): void {
    const mat = QuantumMatrix.getSingleQubitGate(gateType, params);
    const m00 = mat[0][0];
    const m01 = mat[0][1];
    const m10 = mat[1][0];
    const m11 = mat[1][1];

    const newAmps = [...this.amplitudes];
    const step = 1 << (this.numQubits - 1 - target);

    for (let i = 0; i < this.dim; i += 2 * step) {
      for (let j = 0; j < step; j++) {
        const idx0 = i + j;
        const idx1 = idx0 + step;

        const a0 = this.amplitudes[idx0];
        const a1 = this.amplitudes[idx1];

        // new0 = m00*a0 + m01*a1
        newAmps[idx0] = m00.mul(a0).add(m01.mul(a1));
        // new1 = m10*a0 + m11*a1
        newAmps[idx1] = m10.mul(a0).add(m11.mul(a1));
      }
    }

    this.amplitudes = newAmps;
    this.normalize();
  }

  applyCNOT(control: number, target: number): void {
    const newAmps = [...this.amplitudes];
    const cBit = this.numQubits - 1 - control;
    const tBit = this.numQubits - 1 - target;

    for (let i = 0; i < this.dim; i++) {
      const isControlSet = (i & (1 << cBit)) !== 0;
      if (isControlSet) {
        // Target bit is flipped
        const isTargetSet = (i & (1 << tBit)) !== 0;
        if (!isTargetSet) {
          const partner = i | (1 << tBit);
          const temp = newAmps[i];
          newAmps[i] = newAmps[partner];
          newAmps[partner] = temp;
        }
      }
    }

    this.amplitudes = newAmps;
  }

  applyCZ(control: number, target: number): void {
    const newAmps = [...this.amplitudes];
    const cBit = this.numQubits - 1 - control;
    const tBit = this.numQubits - 1 - target;

    for (let i = 0; i < this.dim; i++) {
      const isControlSet = (i & (1 << cBit)) !== 0;
      const isTargetSet = (i & (1 << tBit)) !== 0;
      if (isControlSet && isTargetSet) {
        newAmps[i] = newAmps[i].scale(-1);
      }
    }

    this.amplitudes = newAmps;
  }

  applySWAP(q1: number, q2: number): void {
    const newAmps = [...this.amplitudes];
    const bit1 = this.numQubits - 1 - q1;
    const bit2 = this.numQubits - 1 - q2;

    for (let i = 0; i < this.dim; i++) {
      const b1 = (i >> bit1) & 1;
      const b2 = (i >> bit2) & 1;
      if (b1 !== b2 && b1 === 1) {
        const partner = (i ^ (1 << bit1)) | (1 << bit2);
        const temp = newAmps[i];
        newAmps[i] = newAmps[partner];
        newAmps[partner] = temp;
      }
    }

    this.amplitudes = newAmps;
  }

  applyToffoli(control1: number, control2: number, target: number): void {
    const newAmps = [...this.amplitudes];
    const c1Bit = this.numQubits - 1 - control1;
    const c2Bit = this.numQubits - 1 - control2;
    const tBit = this.numQubits - 1 - target;

    for (let i = 0; i < this.dim; i++) {
      const c1 = (i & (1 << c1Bit)) !== 0;
      const c2 = (i & (1 << c2Bit)) !== 0;
      if (c1 && c2) {
        const isTargetSet = (i & (1 << tBit)) !== 0;
        if (!isTargetSet) {
          const partner = i | (1 << tBit);
          const temp = newAmps[i];
          newAmps[i] = newAmps[partner];
          newAmps[partner] = temp;
        }
      }
    }

    this.amplitudes = newAmps;
  }

  getDensityMatrix(): Complex[][] {
    const rho: Complex[][] = [];
    for (let r = 0; r < this.dim; r++) {
      const row: Complex[] = [];
      for (let c = 0; c < this.dim; c++) {
        // rho[r][c] = amp[r] * conj(amp[c])
        row.push(this.amplitudes[r].mul(this.amplitudes[c].conj()));
      }
      rho.push(row);
    }
    return rho;
  }

  /**
   * Computes the reduced density matrix rho_k for qubit k by tracing out all other qubits.
   */
  getReducedDensityMatrix(k: number): [[Complex, Complex], [Complex, Complex]] {
    const bitPos = this.numQubits - 1 - k;
    let r00 = Complex.zero();
    let r01 = Complex.zero();
    let r10 = Complex.zero();
    let r11 = Complex.zero();

    for (let i = 0; i < this.dim; i++) {
      const bitI = (i >> bitPos) & 1;
      const ampI = this.amplitudes[i];

      for (let j = 0; j < this.dim; j++) {
        // Tracing out other qubits means all bits other than k must match
        const otherBitsI = i ^ (bitI << bitPos);
        const bitJ = (j >> bitPos) & 1;
        const otherBitsJ = j ^ (bitJ << bitPos);

        if (otherBitsI === otherBitsJ) {
          const product = ampI.mul(this.amplitudes[j].conj());
          if (bitI === 0 && bitJ === 0) r00 = r00.add(product);
          else if (bitI === 0 && bitJ === 1) r01 = r01.add(product);
          else if (bitI === 1 && bitJ === 0) r10 = r10.add(product);
          else if (bitI === 1 && bitJ === 1) r11 = r11.add(product);
        }
      }
    }

    return [
      [r00, r01],
      [r10, r11]
    ];
  }

  /**
   * Computes the 3D Bloch coordinates (x, y, z, theta, phi, purity) for qubit k
   */
  getQubitState(k: number): QubitState {
    const rho = this.getReducedDensityMatrix(k);
    const r00 = rho[0][0].re;
    const r11 = rho[1][1].re;
    const r01 = rho[0][1];

    // Pauli expectation values:
    // <X> = Tr(rho * sigma_x) = 2 * Re(rho_01)
    // <Y> = Tr(rho * sigma_y) = 2 * Im(rho_10) = -2 * Im(rho_01)
    // <Z> = Tr(rho * sigma_z) = rho_00 - rho_11
    const x = 2 * r01.re;
    const y = -2 * r01.im;
    const z = r00 - r11;

    const r = Math.min(1.0, Math.sqrt(x * x + y * y + z * z));
    const purity = Math.min(1.0, (1 + r * r) / 2);

    // Spherical coordinates
    // theta = arccos(z / r)
    // phi = atan2(y, x)
    let theta = 0;
    let phi = 0;

    if (r > 1e-7) {
      const clampedZ = Math.max(-1, Math.min(1, z / r));
      theta = Math.acos(clampedZ);
      phi = Math.atan2(y, x);
      if (phi < 0) phi += 2 * Math.PI;
    }

    return {
      index: k,
      label: `q[${k}]`,
      bloch: {
        x: Math.abs(x) < 1e-7 ? 0 : x,
        y: Math.abs(y) < 1e-7 ? 0 : y,
        z: Math.abs(z) < 1e-7 ? 0 : z,
        theta,
        phi,
        purity
      },
      prob0: Math.max(0, Math.min(1, r00)),
      prob1: Math.max(0, Math.min(1, r11))
    };
  }

  getAllQubitStates(): QubitState[] {
    const states: QubitState[] = [];
    for (let k = 0; k < this.numQubits; k++) {
      states.push(this.getQubitState(k));
    }
    return states;
  }

  /**
   * Computes the Von Neumann entanglement entropy of the system (using Qubit 0 vs rest)
   */
  getEntanglementEntropy(): number {
    if (this.numQubits <= 1) return 0;
    const q0 = this.getQubitState(0);
    const r = Math.sqrt(q0.bloch.x ** 2 + q0.bloch.y ** 2 + q0.bloch.z ** 2);
    const l1 = (1 + r) / 2;
    const l2 = (1 - r) / 2;

    let entropy = 0;
    if (l1 > 1e-7) entropy -= l1 * Math.log2(l1);
    if (l2 > 1e-7) entropy -= l2 * Math.log2(l2);

    return Math.max(0, entropy);
  }

  /**
   * Simulates N measurement shots according to Born's probability distribution
   */
  measureShots(shots: number = 1024): Record<string, number> {
    const probs = this.getProbabilities();
    const counts: Record<string, number> = {};

    // Initialize all possible bitstrings with 0
    for (let i = 0; i < this.dim; i++) {
      const bitstring = i.toString(2).padStart(this.numQubits, '0');
      counts[bitstring] = 0;
    }

    // Cumulative probability distribution
    const cumulative: number[] = [];
    let sum = 0;
    for (const p of probs) {
      sum += p;
      cumulative.push(sum);
    }

    for (let s = 0; s < shots; s++) {
      const rand = Math.random();
      let chosenIndex = 0;
      for (let i = 0; i < cumulative.length; i++) {
        if (rand <= cumulative[i]) {
          chosenIndex = i;
          break;
        }
      }
      const bitstring = chosenIndex.toString(2).padStart(this.numQubits, '0');
      counts[bitstring] = (counts[bitstring] || 0) + 1;
    }

    return counts;
  }

  /**
   * Collapses to a single bitstring (for 1 shot interactive collapse)
   */
  singleShotCollapse(): { bitstring: string; index: number } {
    const probs = this.getProbabilities();
    const rand = Math.random();
    let cumulative = 0;
    let chosenIndex = 0;

    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i];
      if (rand <= cumulative) {
        chosenIndex = i;
        break;
      }
    }

    const bitstring = chosenIndex.toString(2).padStart(this.numQubits, '0');
    return { bitstring, index: chosenIndex };
  }

  toDiracString(): string {
    const terms: string[] = [];
    for (let i = 0; i < this.dim; i++) {
      const amp = this.amplitudes[i];
      if (amp.absSq() > 1e-5) {
        const bitstring = i.toString(2).padStart(this.numQubits, '0');
        terms.push(`(${amp.formatExact()})|${bitstring}⟩`);
      }
    }
    return terms.length > 0 ? terms.join(' + ') : '|0⟩';
  }
}
