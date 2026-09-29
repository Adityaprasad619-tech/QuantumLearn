// src/components/canvas3d/MultiBlochView.tsx
import React, { useState } from 'react';
import { QubitState } from '../../types';
import { BlochSphereScene } from './BlochSphereScene';

interface MultiBlochViewProps {
  qubitStates: QubitState[];
  activeQubitIndex?: number;
  onSelectQubit?: (index: number) => void;
  entropy?: number;
}

export const MultiBlochView: React.FC<MultiBlochViewProps> = ({
  qubitStates,
  activeQubitIndex = 0,
  onSelectQubit,
  entropy = 0
}) => {
  const [selectedTab, setSelectedTab] = useState<number>(activeQubitIndex);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  const currentQubitIndex = onSelectQubit ? activeQubitIndex : selectedTab;
  const currentQubit = qubitStates[currentQubitIndex] || qubitStates[0];

  const handleSelect = (idx: number) => {
    setSelectedTab(idx);
    if (onSelectQubit) onSelectQubit(idx);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#FAFAF8',
      border: '1px solid #E8E8E8',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Top Bar with Qubit Selectors and Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E8E8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Bloch Spheres:
          </span>
          {qubitStates.map((q, idx) => (
            <button
              key={q.index}
              onClick={() => handleSelect(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '4px',
                border: currentQubitIndex === idx ? '1px solid #111111' : '1px solid #E8E8E8',
                background: currentQubitIndex === idx ? '#111111' : '#FFFFFF',
                color: currentQubitIndex === idx ? '#FFFFFF' : '#333333',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{q.label}</span>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: q.bloch.purity > 0.98 ? '#10B981' : '#F59E0B'
              }} />
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {entropy > 0.01 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#92400E'
            }}>
              <span>Entanglement Entropy:</span>
              <strong>{entropy.toFixed(3)} bits</strong>
            </div>
          )}

          {qubitStates.length > 1 && (
            <div style={{ display: 'flex', border: '1px solid #E8E8E8', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('single')}
                style={{
                  padding: '3px 8px',
                  background: viewMode === 'single' ? '#F1F5F9' : '#FFFFFF',
                  border: 'none',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'single' ? 600 : 400
                }}
              >
                Focus
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '3px 8px',
                  background: viewMode === 'grid' ? '#F1F5F9' : '#FFFFFF',
                  border: 'none',
                  borderLeft: '1px solid #E8E8E8',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'grid' ? 600 : 400
                }}
              >
                Multi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sphere Display Area */}
      <div style={{ flex: 1, minHeight: '340px', position: 'relative' }}>
        {viewMode === 'single' || qubitStates.length === 1 ? (
          currentQubit && <BlochSphereScene qubitState={currentQubit} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(3, qubitStates.length)}, 1fr)`,
            height: '100%',
            gap: '1px',
            background: '#E8E8E8'
          }}>
            {qubitStates.slice(0, 3).map((q) => (
              <div key={q.index} style={{ position: 'relative', height: '100%', background: '#FAFAF8' }}>
                <BlochSphereScene qubitState={q} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
