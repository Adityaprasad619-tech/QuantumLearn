// src/components/views/QFTLabView.tsx
import React, { useState } from 'react';
import { Complex } from '../../quantum/complex';
import { QuantumCircuit } from '../../quantum/circuit';
import { CircuitGrid } from '../circuit/CircuitGrid';
import { StateInspector } from '../circuit/StateInspector';
import { TimelineControls } from '../circuit/TimelineControls';
import { BrowserFrame } from '../ui/BrowserFrame';
import { soundEffects } from '../../audio/soundEffects';
import { Sparkles, ArrowRight, Activity, Zap } from 'lucide-react';

interface QFTLabViewProps {
  onAskDirac: (prompt: string) => void;
}

export const QFTLabView: React.FC<QFTLabViewProps> = ({ onAskDirac }) => {
  const [numQubits, setNumQubits] = useState<number>(3);
  const [inputVal, setInputVal] = useState<number>(3); // initial input state |3⟩ = |011⟩
  const [activeStep, setActiveStep] = useState<number>(7);

  // Generate QFT circuit for 3 qubits
  const buildQFTCircuit = (n: number, initialBasis: number): QuantumCircuit => {
    const qc = new QuantumCircuit(n);

    // 1. Prepare initial computational basis state |initialBasis⟩
    for (let q = 0; q < n; q++) {
      const bit = (initialBasis >> (n - 1 - q)) & 1;
      if (bit === 1) {
        qc.addGate({ type: 'X', targets: [q], stepIndex: 0 });
      }
    }

    let currentStep = 1;
    // 2. QFT Algorithm: For each qubit, apply H then controlled-phase rotations
    if (n === 3) {
      // Qubit 0
      qc.addGate({ type: 'H', targets: [0], stepIndex: currentStep++ });
      qc.addGate({ type: 'S', targets: [0], stepIndex: currentStep++ }); // R2 = S
      qc.addGate({ type: 'T', targets: [0], stepIndex: currentStep++ }); // R3 = T

      // Qubit 1
      qc.addGate({ type: 'H', targets: [1], stepIndex: currentStep++ });
      qc.addGate({ type: 'S', targets: [1], stepIndex: currentStep++ });

      // Qubit 2
      qc.addGate({ type: 'H', targets: [2], stepIndex: currentStep++ });

      // SWAP bit reversal
      qc.addGate({ type: 'SWAP', targets: [0, 2], stepIndex: currentStep++ });
    } else {
      // 2-qubit QFT
      qc.addGate({ type: 'H', targets: [0], stepIndex: currentStep++ });
      qc.addGate({ type: 'S', targets: [0], stepIndex: currentStep++ });
      qc.addGate({ type: 'H', targets: [1], stepIndex: currentStep++ });
      qc.addGate({ type: 'SWAP', targets: [0, 1], stepIndex: currentStep++ });
    }

    return qc;
  };

  const circuit = buildQFTCircuit(numQubits, inputVal);
  const simulationStates = circuit.simulate();
  const currentStepState = simulationStates[Math.min(activeStep, simulationStates.length - 1)] || simulationStates[simulationStates.length - 1];
  const finalState = circuit.getFinalState();
  const dim = 1 << numQubits;

  const handleSelectInput = (val: number) => {
    soundEffects.playGateClick();
    setInputVal(val);
    setActiveStep(circuit.getMaxStep());
  };

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '24px 20px 80px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Header with Template Styling */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)',
        border: '1px solid #BFDBFE',
        borderRadius: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="coral-pill-badge floating-element">
              <Sparkles size={13} />
              <span>Phase Dispersion Engine</span>
            </span>
            <span className="navy-pill-badge">
              <span>Exponential Fourier Speedup</span>
            </span>
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Quantum Fourier Transform (QFT) Laboratory
          </h1>
          <p className="editorial-subtitle" style={{ fontSize: '14px', margin: '4px 0 0 0', maxWidth: '780px' }}>
            The quantum analogue of the Discrete Fourier Transform. Transforms quantum states from the computational basis into the phase basis, unlocking exponential speedups in Shor's algorithm and quantum phase estimation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              soundEffects.playStep();
              setNumQubits(2);
              if (inputVal >= 4) setInputVal(1);
            }}
            className={numQubits === 2 ? 'btn-editorial-primary' : 'card-lift-sm'}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              border: numQubits === 2 ? 'none' : '1px solid #BFDBFE',
              background: numQubits === 2 ? '#1E3A8A' : '#FFFFFF',
              color: numQubits === 2 ? '#FFFFFF' : '#1E3A8A',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            2 Qubits (N=4)
          </button>
          <button
            onClick={() => {
              soundEffects.playStep();
              setNumQubits(3);
            }}
            className={numQubits === 3 ? 'btn-editorial-primary' : 'card-lift-sm'}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              border: numQubits === 3 ? 'none' : '1px solid #BFDBFE',
              background: numQubits === 3 ? '#1E3A8A' : '#FFFFFF',
              color: numQubits === 3 ? '#FFFFFF' : '#1E3A8A',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            3 Qubits (N=8)
          </button>
        </div>
      </div>

      {/* Input Basis State Selector */}
      <div
        className="card-lift"
        style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 10px rgba(37, 99, 235, 0.04)'
        }}
      >
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Choose Computational Input State |j⟩
          </div>
          <div style={{ fontSize: '15px', color: '#0F172A', fontWeight: 800, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            Input Basis: |{inputVal.toString(2).padStart(numQubits, '0')}⟩ (decimal {inputVal})
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Array.from({ length: dim }, (_, i) => (
            <button
              key={i}
              onClick={() => handleSelectInput(i)}
              className="card-lift-sm"
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: inputVal === i ? '2px solid #2563EB' : '1px solid #BFDBFE',
                background: inputVal === i ? '#EFF6FF' : '#FFFFFF',
                color: inputVal === i ? '#1E3A8A' : '#475569',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              |{i.toString(2).padStart(numQubits, '0')}⟩
            </button>
          ))}
        </div>
      </div>

      {/* Visual QFT Pipeline Stages Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '12px'
      }}>
        {[
          { stage: '1. Input State', desc: `Basis state |${inputVal}⟩`, color: '#64748B' },
          { stage: '2. Hadamards (H)', desc: 'Uniform amplitude 1/√N', color: '#0EA5E9' },
          { stage: '3. Phase Rotations', desc: 'Controlled R_k shifts 2π/2^k', color: '#7C3AED' },
          { stage: '4. SWAP Operations', desc: 'Reverse bit order (q0 ⟷ qN-1)', color: '#EA580C' },
          { stage: '5. Phase Spectrum', desc: 'All frequencies encoded', color: '#059669' }
        ].map((s) => (
          <div
            key={s.stage}
            className="card-lift-sm"
            style={{
              padding: '14px 16px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #BFDBFE',
              borderLeft: `4px solid ${s.color}`,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.04)'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: s.color }}>
              {s.stage}
            </div>
            <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '3px', lineHeight: 1.4 }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Circuit Grid Wireboard wrapped in BrowserFrame */}
      <BrowserFrame
        urlPath={`quantum-lab://qft-circuit/${numQubits}-qubits/input-${inputVal}`}
        badge={`QFT Circuit (${numQubits}Q)`}
        badgeColor="coral"
        gridBackground={true}
        contentStyle={{ padding: '16px' }}
      >
        <CircuitGrid
          numQubits={numQubits}
          gates={circuit.gates}
          activeStep={activeStep}
          totalSteps={circuit.getMaxStep() + 1}
          selectedGateType={null}
          onAddGate={() => {}}
          onRemoveGate={() => {}}
          onSelectStep={setActiveStep}
        />
      </BrowserFrame>

      {/* Timeline Controls */}
      <div className="card-lift">
        <TimelineControls
          activeStep={activeStep}
          maxStep={circuit.getMaxStep()}
          onSelectStep={setActiveStep}
          onClearCircuit={() => {}}
        />
      </div>

      {/* Visual Quantum Phase Clocks Array in BrowserFrame */}
      <BrowserFrame
        urlPath="quantum-lab://qft-phase-clocks/unit-circle"
        badge="Phase Dial Spectrum"
        badgeColor="navy"
        gridBackground={true}
        contentStyle={{ padding: '24px' }}
        headerExtra={
          <span style={{ fontSize: '11px', color: '#1E3A8A', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            |c_k| = 1/√{dim} = {(1 / Math.sqrt(dim)).toFixed(3)}
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Frequency Basis Phase Clock Dials (QFT Output)
            </div>
            <h3 className="editorial-title" style={{ fontSize: '18px', margin: '4px 0 0 0' }}>
              Phase Angle Distribution: φ_k = 2π·j·k / {dim}
            </h3>
          </div>

          {/* Clocks Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(110px, 1fr))`,
            gap: '14px'
          }}>
            {Array.from({ length: dim }, (_, k) => {
              const amp = finalState.amplitudes[k];
              const phase = amp.arg();
              const phaseDeg = ((phase * 180 / Math.PI) + 360) % 360;

              return (
                <div
                  key={k}
                  className="card-lift-sm"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '16px 10px',
                    background: '#FFFFFF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.04)'
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: '#0F172A'
                  }}>
                    |{k.toString(2).padStart(numQubits, '0')}⟩
                  </div>

                  {/* Circular Phase Dial */}
                  <div
                    className="floating-element"
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      border: '2px solid #BFDBFE',
                      position: 'relative',
                      background: 'radial-gradient(circle, #EFF6FF 0%, #FFFFFF 70%)',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)'
                    }}
                  >
                    {/* Center Dot */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#1E3A8A',
                      transform: 'translate(-50%, -50%)'
                    }} />

                    {/* Rotating Clock Needle */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '24px',
                      height: '2.5px',
                      background: 'linear-gradient(90deg, #1E3A8A, #7C3AED)',
                      transformOrigin: '0 50%',
                      transform: `rotate(${-phaseDeg}deg)`,
                      transition: 'transform 0.3s ease',
                      borderRadius: '2px'
                    }} />
                  </div>

                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#7C3AED', fontWeight: 700 }}>
                    {phaseDeg.toFixed(0)}°
                  </div>

                  <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                    k={k}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BrowserFrame>

      {/* State Inspector */}
      <div className="card-lift">
        <StateInspector stateVector={finalState} />
      </div>

      {/* Deep Scientific Explanation: Classical DFT vs Quantum QFT */}
      <div
        className="card-lift"
        style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #BFDBFE'
          }}>
            <Zap size={18} color="#2563EB" />
          </div>
          <h3 className="editorial-title" style={{ fontSize: '20px', margin: 0 }}>
            The Physics: Why QFT Delivers an Exponential Speedup
          </h3>
        </div>

        <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7' }}>
          <p style={{ margin: '0 0 10px 0' }}>
            In classical computing, the Discrete Fourier Transform (DFT) of an N-element vector requires O(N²) additions and multiplications, or O(N log N) operations using the Fast Fourier Transform (FFT). For N = 2⁶⁰, this would require over 10¹⁸ operations—impossible on classical supercomputers.
          </p>
          <p style={{ margin: '0 0 10px 0' }}>
            The <strong>Quantum Fourier Transform (QFT)</strong> operates on the quantum state itself:
            <br />
            <code style={{ display: 'block', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', margin: '8px 0', fontFamily: 'var(--font-mono)', color: '#1E3A8A' }}>
              QFT_N |j⟩ = (1/√N) ∑ e^(2πi·j·k / N) |k⟩
            </code>
            Because quantum superposition and entanglement allow all N amplitudes to be rotated simultaneously using only n(n+1)/2 quantum gates, the complexity is:
            <br />
            <strong style={{ color: '#059669', fontSize: '15px' }}>O(n²) = O((log N)²)</strong>.
            This transforms exponential complexity into quadratic polynomial time, making period finding and integer factorization in Shor's algorithm possible!
          </p>
        </div>

        <button
          className="btn-editorial-primary card-lift-sm"
          onClick={() => onAskDirac('Explain the exact step-by-step mathematical derivation of the 3-qubit Quantum Fourier Transform circuit and how phase rotations work.')}
          style={{
            alignSelf: 'flex-start',
            padding: '10px 20px',
            fontSize: '12.5px'
          }}
        >
          <Sparkles size={14} color="#FBBF24" />
          <span>Ask Dirac AI to Explain QFT Mathematical Derivation</span>
        </button>
      </div>
    </div>
  );
};
