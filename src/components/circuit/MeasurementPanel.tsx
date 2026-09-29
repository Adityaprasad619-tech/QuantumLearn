// src/components/circuit/MeasurementPanel.tsx
import React, { useState } from 'react';
import { StateVector } from '../../quantum/statevector';
import { soundEffects } from '../../audio/soundEffects';

interface MeasurementPanelProps {
  stateVector: StateVector;
}

export const MeasurementPanel: React.FC<MeasurementPanelProps> = ({ stateVector }) => {
  const [shotCount, setShotCount] = useState<number>(1024);
  const [shotResults, setShotResults] = useState<Record<string, number> | null>(null);
  const [singleCollapse, setSingleCollapse] = useState<string | null>(null);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);

  const probs = stateVector.getProbabilities();
  const dim = stateVector.dim;
  const numQubits = stateVector.numQubits;

  const handleSingleCollapse = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      const { bitstring } = stateVector.singleShotCollapse();
      setSingleCollapse(bitstring);
      soundEffects.playStateCollapse(bitstring);
      setIsMeasuring(false);
    }, 150);
  };

  const handleRunShots = (shots: number) => {
    setShotCount(shots);
    setIsMeasuring(true);
    setTimeout(() => {
      const counts = stateVector.measureShots(shots);
      setShotResults(counts);
      soundEffects.playStateCollapse();
      setIsMeasuring(false);
    }, 200);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#111111' }}>
            Quantum Measurement & State Collapse
          </div>
          <div style={{ fontSize: '11px', color: '#666666' }}>
            Projective measurement in computational Z-basis according to Born's Rule
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={handleSingleCollapse}
            disabled={isMeasuring}
            style={{
              padding: '6px 12px',
              background: '#111111',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            Collapse 1 Shot
          </button>

          <span style={{ color: '#CBD5E1', margin: '0 4px' }}>|</span>

          <span style={{ fontSize: '11px', color: '#64748B' }}>Shots:</span>
          {[100, 1024, 8192].map((s) => (
            <button
              key={s}
              onClick={() => handleRunShots(s)}
              disabled={isMeasuring}
              style={{
                padding: '4px 8px',
                background: shotCount === s && shotResults ? '#F1F5F9' : '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer',
                fontWeight: shotCount === s && shotResults ? 600 : 400
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Single Shot Result Highlight Box */}
      {singleCollapse && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#1E40AF' }}>
              Observed Quantum Collapse:
            </span>
            <span style={{
              fontSize: '14px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              color: '#1E3A8A',
              background: '#DBEAFE',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              |{singleCollapse}⟩
            </span>
          </div>
          <span style={{ fontSize: '10px', color: '#3B82F6' }}>
            Wavefunction collapsed to definite classical state
          </span>
        </div>
      )}

      {/* Measurement Distribution Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
          <span>BASIS STATE |x⟩</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>THEORETICAL P(x)</span>
            {shotResults && <span>SHOT COUNT ({shotCount})</span>}
          </div>
        </div>

        {Array.from({ length: dim }, (_, i) => {
          const bitstring = i.toString(2).padStart(numQubits, '0');
          const exactProb = probs[i];
          const observedCount = shotResults ? (shotResults[bitstring] || 0) : null;
          const observedPercent = observedCount !== null ? (observedCount / shotCount) : null;

          return (
            <div
              key={bitstring}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                padding: '6px 8px',
                background: '#F8FAFC',
                borderRadius: '4px',
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#0F172A' }}>
                  |{bitstring}⟩
                </span>
                <div style={{ display: 'flex', gap: '24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
                  <span style={{ color: '#4F46E5', fontWeight: 600 }}>
                    {(exactProb * 100).toFixed(1)}%
                  </span>
                  {observedCount !== null && (
                    <span style={{ color: '#059669', fontWeight: 600 }}>
                      {observedCount} ({(observedPercent! * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Stacked Progress Bar */}
              <div style={{ display: 'flex', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${exactProb * 100}%`,
                    background: '#4F46E5',
                    transition: 'width 0.25s ease'
                  }}
                  title={`Theoretical probability: ${(exactProb * 100).toFixed(2)}%`}
                />
                {observedPercent !== null && (
                  <div
                    style={{
                      width: `${Math.abs(observedPercent - exactProb) * 100}%`,
                      background: observedPercent >= exactProb ? '#10B981' : '#F59E0B',
                      opacity: 0.7
                    }}
                    title={`Observed difference: ${((observedPercent - exactProb) * 100).toFixed(2)}%`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
