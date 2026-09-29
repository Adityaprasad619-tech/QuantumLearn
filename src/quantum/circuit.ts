// src/quantum/circuit.ts
import { CircuitGate, SimulationStepState, GateType, ComplexNumber } from '../types';
import { StateVector } from './statevector';
import { Complex } from './complex';

export class QuantumCircuit {
  numQubits: number;
  gates: CircuitGate[];

  constructor(numQubits: number = 2, gates: CircuitGate[] = []) {
    this.numQubits = Math.max(1, Math.min(5, numQubits));
    this.gates = [...gates];
  }

  addGate(gate: Omit<CircuitGate, 'id'>): CircuitGate {
    const newGate: CircuitGate = {
      ...gate,
      id: `gate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    this.gates.push(newGate);
    this.gates.sort((a, b) => a.stepIndex - b.stepIndex);
    return newGate;
  }

  removeGate(gateId: string): void {
    this.gates = this.gates.filter(g => g.id !== gateId);
  }

  clear(): void {
    this.gates = [];
  }

  setNumQubits(n: number): void {
    this.numQubits = Math.max(1, Math.min(5, n));
    // Filter out gates targeting qubits that no longer exist
    this.gates = this.gates.filter(g =>
      g.targets.every(t => t < this.numQubits) &&
      (g.controls?.every(c => c < this.numQubits) ?? true)
    );
  }

  getMaxStep(): number {
    if (this.gates.length === 0) return 0;
    return Math.max(...this.gates.map(g => g.stepIndex)) + 1;
  }

  /**
   * Runs the full circuit simulation step-by-step and returns all intermediate states.
   * State 0: initial state |00...0>
   * State k: state after applying all gates at step k-1
   */
  simulate(): SimulationStepState[] {
    const maxSteps = this.getMaxStep();
    const history: SimulationStepState[] = [];

    let current = new StateVector(this.numQubits);

    // Initial state before any gate (step 0)
    history.push({
      stepIndex: 0,
      stateVector: current.amplitudes,
      probabilities: current.getProbabilities(),
      qubitStates: current.getAllQubitStates(),
      entropy: current.getEntanglementEntropy(),
      densityMatrix: current.getDensityMatrix()
    });

    // Group gates by stepIndex
    const gatesByStep = new Map<number, CircuitGate[]>();
    for (const gate of this.gates) {
      const step = gate.stepIndex;
      if (!gatesByStep.has(step)) {
        gatesByStep.set(step, []);
      }
      gatesByStep.get(step)!.push(gate);
    }

    // Execute step-by-step
    for (let step = 0; step < maxSteps; step++) {
      const gatesAtStep = gatesByStep.get(step) || [];
      for (const gate of gatesAtStep) {
        this.applyGateToState(current, gate);
      }

      history.push({
        stepIndex: step + 1,
        gateApplied: gatesAtStep[0], // primary gate reference
        stateVector: current.amplitudes,
        probabilities: current.getProbabilities(),
        qubitStates: current.getAllQubitStates(),
        entropy: current.getEntanglementEntropy(),
        densityMatrix: current.getDensityMatrix()
      });
    }

    return history;
  }

  private applyGateToState(state: StateVector, gate: CircuitGate): void {
    const { type, targets, controls, params } = gate;

    switch (type) {
      case 'CX':
        if (controls && controls.length > 0 && targets.length > 0) {
          state.applyCNOT(controls[0], targets[0]);
        }
        break;
      case 'CZ':
        if (controls && controls.length > 0 && targets.length > 0) {
          state.applyCZ(controls[0], targets[0]);
        }
        break;
      case 'SWAP':
        if (targets.length >= 2) {
          state.applySWAP(targets[0], targets[1]);
        }
        break;
      case 'CCX':
        if (controls && controls.length >= 2 && targets.length > 0) {
          state.applyToffoli(controls[0], controls[1], targets[0]);
        }
        break;
      case 'MEASURE':
        // Measurement in statevector simulation projects or observes
        // For deterministic statevector timeline, it does not collapse until shot simulation
        break;
      default:
        // Single qubit gate
        if (targets.length > 0) {
          state.applySingleQubitGate(type, targets[0], params);
        }
        break;
    }
  }

  getFinalState(): StateVector {
    const states = this.simulate();
    const finalStep = states[states.length - 1];
    return new StateVector(this.numQubits, finalStep.stateVector);
  }

  /**
   * Computes quantum fidelity F = |<target|actual>|^2 between current circuit output and target state
   */
  computeFidelity(targetState: ComplexNumber[]): number {
    const finalState = this.getFinalState();
    if (finalState.dim !== targetState.length) return 0;

    let dot = Complex.zero();
    for (let i = 0; i < finalState.dim; i++) {
      const targetAmp = new Complex(targetState[i].re, targetState[i].im);
      // dot += conj(target) * actual
      dot = dot.add(targetAmp.conj().mul(finalState.amplitudes[i]));
    }

    return dot.absSq();
  }
}
