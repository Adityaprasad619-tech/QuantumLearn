// src/components/circuit/VisualErrorReplay.tsx
// F27: Visual Error Replay – Step-by-step state divergence detection and replay
import React, { useState, useEffect } from 'react';
import { CircuitGate, ComplexNumber } from '../../types';
import { StateVector } from '../../quantum/statevector';
import { QuantumCircuit } from '../../quantum/circuit';
import { Play, Pause, RotateCcw, AlertOctagon, CheckCircle2, ChevronRight, ChevronLeft, FastForward, Activity } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface VisualErrorReplayProps {
  numQubits: number;
  actualGates: CircuitGate[];
  isOpen: boolean;
  onClose: () => void;
  targetAlgorithmName?: string;
  idealGates?: CircuitGate[];
}

export const VisualErrorReplay: React.FC<VisualErrorReplayProps> = ({
  numQubits,
  actualGates,
  isOpen,
  onClose,
  targetAlgorithmName = 'Bell State |Φ+⟩',
  idealGates
}) => {
  // Default ideal gates (Bell State if none provided)
  const referenceGates: CircuitGate[] = idealGates || [
    { id: 'ref0', type: 'H', targets: [0], stepIndex: 0 },
    { id: 'ref1', type: 'CX', targets: [1], controls: [0], stepIndex: 1 }
  ];

  const [replayStep, setReplayStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Simulate both actual and ideal circuits step-by-step
  const actualCircuit = new QuantumCircuit(numQubits, actualGates);
  const actualStates = actualCircuit.simulate();

  const idealCircuit = new QuantumCircuit(numQubits, referenceGates);
  const idealStates = idealCircuit.simulate();

  const maxSteps = Math.max(actualStates.length, idealStates.length);

  // Compute fidelity at each step: |<psi_actual | psi_ideal>|^2
  const stepFidelities = Array.from({ length: maxSteps }, (_, s) => {
    const act = actualStates[Math.min(s, actualStates.length - 1)];
    const idl = idealStates[Math.min(s, idealStates.length - 1)];
    if (!act || !idl) return 1.0;

    let innerReal = 0;
    let innerImag = 0;
    const actVec = act.stateVector;
    const idlVec = idl.stateVector;
    const len = Math.min(actVec.length, idlVec.length);
    for (let i = 0; i < len; i++) {
      // a* * b = (a.re - i a.im) * (b.re + i b.im) = (a.re*b.re + a.im*b.im) + i(a.re*b.im - a.im*b.re)
      innerReal += actVec[i].re * idlVec[i].re + actVec[i].im * idlVec[i].im;
      innerImag += actVec[i].re * idlVec[i].im - actVec[i].im * idlVec[i].re;
    }
    const fid = innerReal * innerReal + innerImag * innerImag;
    return Math.min(1.0, Math.max(0.0, fid));
  });

  // Find divergence point (first step where fidelity < 0.999)
  const divergenceStep = stepFidelities.findIndex(f => f < 0.99);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setReplayStep(prev => {
        if (prev >= maxSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying, maxSteps]);

  if (!isOpen) return null;

  const currentFidelity = stepFidelities[replayStep] ?? 1.0;
  const isDivergedNow = currentFidelity < 0.99;

  const currentActualState = actualStates[Math.min(replayStep, actualStates.length - 1)];
  const currentIdealState = idealStates[Math.min(replayStep, idealStates.length - 1)];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.70)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 210,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #BFDBFE',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                Visual Error Replay (F27)
              </h2>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.85 }}>
                Step-by-step state divergence analysis against {targetAlgorithmName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Close
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Divergence Status Alert */}
          <div style={{
            background: divergenceStep === -1 ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${divergenceStep === -1 ? '#A7F3D0' : '#FECACA'}`,
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {divergenceStep === -1 ? (
                <CheckCircle2 size={24} color="#059669" />
              ) : (
                <AlertOctagon size={24} color="#DC2626" />
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: divergenceStep === -1 ? '#065F46' : '#991B1B' }}>
                  {divergenceStep === -1
                    ? 'Perfect Step Alignment — 100% Target Fidelity'
                    : `Error Introduced at Step t = ${divergenceStep}`}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  {divergenceStep === -1
                    ? 'Your circuit exactly preserves unitary equivalence with the ideal reference.'
                    : `The quantum state vector diverged from the expected reference. State overlap dropped to ${(stepFidelities[divergenceStep] * 100).toFixed(1)}%.`}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Current Step Fidelity:</div>
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: isDivergedNow ? '#DC2626' : '#059669'
              }}>
                {(currentFidelity * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Step Timeline & Playback Controls */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                Timeline Replay: Step {replayStep} of {maxSteps - 1}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => {
                    setReplayStep(Math.max(0, replayStep - 1));
                    soundEffects.playStep();
                  }}
                  disabled={replayStep === 0}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    cursor: replayStep === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    soundEffects.playGateClick();
                  }}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                </button>

                <button
                  onClick={() => {
                    setReplayStep(Math.min(maxSteps - 1, replayStep + 1));
                    soundEffects.playStep();
                  }}
                  disabled={replayStep >= maxSteps - 1}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    cursor: replayStep >= maxSteps - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => {
                    setReplayStep(0);
                    soundEffects.playStep();
                  }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Step Selector Slider */}
            <input
              type="range"
              min={0}
              max={maxSteps - 1}
              value={replayStep}
              onChange={e => setReplayStep(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: isDivergedNow ? '#DC2626' : '#2563EB' }}
            />

            {/* Step Marks with Fidelity Color Code */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
              {stepFidelities.map((fid, idx) => (
                <div
                  key={idx}
                  onClick={() => setReplayStep(idx)}
                  style={{
                    flex: 1,
                    padding: '6px 2px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: idx === replayStep
                      ? (fid < 0.99 ? '#FEE2E2' : '#EFF6FF')
                      : (fid < 0.99 ? '#FEF2F2' : '#F1F5F9'),
                    color: fid < 0.99 ? '#DC2626' : '#2563EB',
                    border: idx === replayStep ? `2px solid ${fid < 0.99 ? '#DC2626' : '#2563EB'}` : '1px solid transparent'
                  }}
                >
                  t={idx}
                  <div style={{ fontSize: '9px', fontWeight: 600 }}>
                    {(fid * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* State Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Actual State at Step t */}
            <div style={{
              background: '#FFFFFF',
              border: `2px solid ${isDivergedNow ? '#FECACA' : '#BFDBFE'}`,
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '13px', color: '#1E293B' }}>
                  Your Circuit State |ψ(t={replayStep})⟩
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isDivergedNow ? '#FEE2E2' : '#EFF6FF',
                  color: isDivergedNow ? '#991B1B' : '#1D4ED8'
                }}>
                  {isDivergedNow ? 'Diverged' : 'Aligned'}
                </span>
              </div>
              <div style={{
                background: '#F8FAFC',
                borderRadius: '8px',
                padding: '10px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '140px',
                overflowY: 'auto'
              }}>
                {currentActualState?.stateVector.slice(0, 8).map((amp: ComplexNumber, idx: number) => {
                  const prob = amp.re * amp.re + amp.im * amp.im;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span style={{ color: '#64748B' }}>|{idx.toString(2).padStart(numQubits, '0')}⟩:</span>
                      <span style={{ fontWeight: 700, color: prob > 0.01 ? '#1E293B' : '#94A3B8' }}>
                        p = {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ideal Reference State at Step t */}
            <div style={{
              background: '#FFFFFF',
              border: '2px solid #A7F3D0',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '13px', color: '#065F46' }}>
                  Target State |ψ_ideal(t={replayStep})⟩
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#ECFDF5',
                  color: '#059669'
                }}>
                  Reference
                </span>
              </div>
              <div style={{
                background: '#F8FAFC',
                borderRadius: '8px',
                padding: '10px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '140px',
                overflowY: 'auto'
              }}>
                {currentIdealState?.stateVector.slice(0, 8).map((amp: ComplexNumber, idx: number) => {
                  const prob = amp.re * amp.re + amp.im * amp.im;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span style={{ color: '#64748B' }}>|{idx.toString(2).padStart(numQubits, '0')}⟩:</span>
                      <span style={{ fontWeight: 700, color: prob > 0.01 ? '#065F46' : '#94A3B8' }}>
                        p = {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
