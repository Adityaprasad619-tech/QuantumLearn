// src/components/circuit/StateInspector.tsx
import React from 'react';
import { StateVector } from '../../quantum/statevector';

interface StateInspectorProps {
  stateVector: StateVector;
}

export const StateInspector: React.FC<StateInspectorProps> = ({ stateVector }) => {
  const diracString = stateVector.toDiracString();
  const probs = stateVector.getProbabilities();
  const dim = stateVector.dim;
  const numQubits = stateVector.numQubits;
  const entropy = stateVector.getEntanglementEntropy();

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
      {/* Dirac Notation Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          State Vector Formulation |ψ⟩
        </div>
        <div style={{
          padding: '10px 14px',
          background: '#FAFAF8',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '13px',
          color: '#0F172A',
          wordBreak: 'break-all',
          lineHeight: '1.6'
        }}>
          |ψ⟩ = {diracString}
        </div>
      </div>

      {/* Global State Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px'
      }}>
        <div style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '10px', color: '#64748B' }}>Dimension 2^n</div>
          <div style={{ fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#0F172A' }}>
            {dim} states
          </div>
        </div>

        <div style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '10px', color: '#64748B' }}>Entanglement Entropy</div>
          <div style={{ fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: entropy > 0.05 ? '#D97706' : '#059669' }}>
            {entropy.toFixed(3)} bits
          </div>
        </div>

        <div style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '10px', color: '#64748B' }}>Norm Constraint ∑|c_i|²</div>
          <div style={{ fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#059669' }}>
            1.0000
          </div>
        </div>
      </div>

      {/* Amplitudes Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
              <th style={{ padding: '6px 8px' }}>Basis |x⟩</th>
              <th style={{ padding: '6px 8px' }}>Complex Amplitude (c_x)</th>
              <th style={{ padding: '6px 8px' }}>Magnitude |c_x|</th>
              <th style={{ padding: '6px 8px' }}>Phase Arg(c_x)</th>
              <th style={{ padding: '6px 8px' }}>Probability |c_x|²</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: dim }, (_, i) => {
              const bitstring = i.toString(2).padStart(numQubits, '0');
              const amp = stateVector.amplitudes[i];
              const prob = probs[i];
              const phase = amp.arg();
              const phaseDeg = (phase * 180 / Math.PI + 360) % 360;

              return (
                <tr
                  key={bitstring}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    background: prob > 0.01 ? 'rgba(79, 70, 229, 0.03)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: '#0F172A' }}>
                    |{bitstring}⟩
                  </td>
                  <td style={{ padding: '6px 8px', color: '#334155' }}>
                    {amp.format(3)}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#64748B' }}>
                    {amp.abs().toFixed(3)}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#64748B' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        border: '1px solid #CBD5E1',
                        position: 'relative'
                      }}>
                        <span style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          width: '4px',
                          height: '1px',
                          background: '#7C3AED',
                          transformOrigin: '0 0',
                          transform: `rotate(${phaseDeg}deg)`
                        }} />
                      </span>
                      {phaseDeg.toFixed(0)}°
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: '#4F46E5' }}>
                    {(prob * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
