// src/components/circuit/GatePalette.tsx
import React, { useState } from 'react';
import { GateType, GateDefinition } from '../../types';
import { GATE_DEFINITIONS } from '../../quantum/matrix';
import { soundEffects } from '../../audio/soundEffects';

interface GatePaletteProps {
  selectedGateType: GateType | null;
  onSelectGateType: (type: GateType, params?: { theta?: number }) => void;
}

export const GatePalette: React.FC<GatePaletteProps> = ({
  selectedGateType,
  onSelectGateType
}) => {
  const [rotationTheta, setRotationTheta] = useState<number>(Math.PI);
  const [hoveredGate, setHoveredGate] = useState<GateDefinition | null>(null);

  const handleSelect = (gateDef: GateDefinition) => {
    soundEffects.playGateClick();
    if (gateDef.isParametric) {
      onSelectGateType(gateDef.type, { theta: rotationTheta });
    } else {
      onSelectGateType(gateDef.type);
    }
  };

  const categories = [
    { title: 'Superposition & NOT', types: ['H', 'X', 'Y', 'Z'] as GateType[] },
    { title: 'Phase & Arbitrary Rotations', types: ['S', 'T', 'S_DAG', 'RX', 'RY', 'RZ'] as GateType[] },
    { title: 'Entanglement & Multi-Qubit', types: ['CX', 'CZ', 'SWAP', 'CCX'] as GateType[] },
    { title: 'Observation', types: ['MEASURE'] as GateType[] }
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: '8px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#444444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quantum Gate Library
        </span>
        <span style={{ fontSize: '11px', color: '#888888' }}>
          Click gate to select, then click circuit slot
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {categories.map((cat) => (
          <div key={cat.title} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#888888', fontWeight: 500 }}>
              {cat.title}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {cat.types.map((type) => {
                const def = GATE_DEFINITIONS[type];
                const isSelected = selectedGateType === type;

                return (
                  <button
                    key={type}
                    onClick={() => handleSelect(def)}
                    onMouseEnter={() => setHoveredGate(def)}
                    onMouseLeave={() => setHoveredGate(null)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #111111' : '1px solid #E2E8F0',
                      background: isSelected ? '#111111' : '#FAFAF8',
                      color: isSelected ? '#FFFFFF' : '#111111',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.12)' : 'none'
                    }}
                    title={def.name}
                  >
                    {def.symbol}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rotation Angle Dial for Parametric Gates (Rx, Ry, Rz) */}
      {(selectedGateType === 'RX' || selectedGateType === 'RY' || selectedGateType === 'RZ') && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          background: '#F8FAFC',
          borderRadius: '6px',
          border: '1px solid #E2E8F0'
        }}>
          <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#334155' }}>
            Rotation θ = {(rotationTheta / Math.PI).toFixed(2)}π ({(rotationTheta * 180 / Math.PI).toFixed(0)}°)
          </span>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.05"
            value={rotationTheta}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setRotationTheta(val);
              onSelectGateType(selectedGateType, { theta: val });
            }}
            style={{ flex: 1, accentColor: '#111111' }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { label: 'π/4', val: Math.PI / 4 },
              { label: 'π/2', val: Math.PI / 2 },
              { label: 'π', val: Math.PI }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => {
                  setRotationTheta(p.val);
                  onSelectGateType(selectedGateType, { theta: p.val });
                }}
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gate Description / Info banner on hover */}
      {hoveredGate && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          background: '#F8FAFC',
          borderRadius: '4px',
          border: '1px solid #E2E8F0',
          fontSize: '11px',
          color: '#475569'
        }}>
          <div>
            <strong>{hoveredGate.name} ({hoveredGate.symbol}):</strong> {hoveredGate.description}
          </div>
          <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
            {hoveredGate.qubitCount} Qubit{hoveredGate.qubitCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};
