// src/components/canvas3d/ProbabilityHeatmap.tsx
import React, { useState } from 'react';
import { StateVector } from '../../quantum/statevector';

interface ProbabilityHeatmapProps {
  stateVector: StateVector;
}

export const ProbabilityHeatmap: React.FC<ProbabilityHeatmapProps> = ({ stateVector }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const numQubits = stateVector.numQubits;
  const totalStates = 1 << numQubits;

  // Layout grid dimensions: 2 qubits -> 2x2, 3 qubits -> 2x4 or 4x2, 4 qubits -> 4x4
  const cols = numQubits <= 2 ? 2 : numQubits === 3 ? 4 : 4;
  const rows = Math.ceil(totalStates / cols);

  const getHeatmapColor = (prob: number, phase: number) => {
    if (prob < 0.0001) return '#F8FAFC';
    // Base color hue based on phase angle, brightness based on probability
    const hue = ((phase * 180 / Math.PI) + 360) % 360;
    const alpha = Math.max(0.15, Math.min(1.0, prob * 1.5));
    return `hsla(${hue}, 80%, 50%, ${alpha})`;
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: '10px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>
            Multi-Qubit Distribution
          </span>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '2px 0 0 0' }}>
            Probability & Phase Heatmap
          </h4>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
          {totalStates} Basis States
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '6px',
        padding: '6px',
        background: '#FAFAF8',
        borderRadius: '8px',
        border: '1px solid #E2E8F0'
      }}>
        {Array.from({ length: totalStates }, (_, idx) => {
          const amp = stateVector.amplitudes[idx];
          const prob = amp ? amp.absSq() : 0;
          const phase = amp ? amp.arg() : 0;
          const phaseDeg = ((phase * 180 / Math.PI) + 360) % 360;
          const binaryLabel = idx.toString(2).padStart(numQubits, '0');
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                height: '56px',
                borderRadius: '6px',
                background: getHeatmapColor(prob, phase),
                border: isHovered ? '2px solid #111111' : '1px solid #CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: prob > 0.05 ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <span style={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                color: prob > 0.3 ? '#FFFFFF' : '#0F172A',
                textShadow: prob > 0.3 ? '0 1px 2px rgba(0,0,0,0.4)' : 'none'
              }}>
                |{binaryLabel}⟩
              </span>

              <span style={{
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                color: prob > 0.3 ? '#FFFFFF' : '#475569',
                fontWeight: 600,
                textShadow: prob > 0.3 ? '0 1px 2px rgba(0,0,0,0.4)' : 'none'
              }}>
                {(prob * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Hovered State Readout */}
      {hoveredIndex !== null && stateVector.amplitudes[hoveredIndex] && (
        <div style={{
          padding: '8px 12px',
          background: '#F8FAFC',
          borderRadius: '6px',
          border: '1px solid #E2E8F0',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#1E293B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>|{hoveredIndex.toString(2).padStart(numQubits, '0')}⟩</strong>: amplitude = {stateVector.amplitudes[hoveredIndex].toString()}
          </div>
          <div>
            P = {(stateVector.amplitudes[hoveredIndex].absSq() * 100).toFixed(2)}% • φ = {(((stateVector.amplitudes[hoveredIndex].arg() * 180 / Math.PI) + 360) % 360).toFixed(1)}°
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: '#64748B',
        paddingTop: '4px'
      }}>
        <span>Cell opacity = Probability |c_i|²</span>
        <span>Hue = Phase Angle φ ∈ [0°, 360°)</span>
      </div>
    </div>
  );
};
