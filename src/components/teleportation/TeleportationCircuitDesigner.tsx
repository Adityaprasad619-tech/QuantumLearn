// src/components/teleportation/TeleportationCircuitDesigner.tsx
import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Trash2, Plus, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface GatePlacement {
  id: string;
  type: 'H' | 'X' | 'Y' | 'Z' | 'CX' | 'M';
  wire: number; // 0, 1, or 2
  col: number; // 0 to 7
  controlWire?: number; // for CX
}

export const TeleportationCircuitDesigner: React.FC = () => {
  const [selectedToolGate, setSelectedToolGate] = useState<'H' | 'X' | 'Y' | 'Z' | 'CX' | 'M'>('H');
  const [circuitGates, setCircuitGates] = useState<GatePlacement[]>([
    // Standard Teleportation Circuit preset by default
    { id: 'g1', type: 'H', wire: 1, col: 0 },
    { id: 'g2', type: 'CX', wire: 2, controlWire: 1, col: 1 },
    { id: 'g3', type: 'CX', wire: 1, controlWire: 0, col: 2 },
    { id: 'g4', type: 'H', wire: 0, col: 3 },
    { id: 'g5', type: 'M', wire: 0, col: 4 },
    { id: 'g6', type: 'M', wire: 1, col: 4 },
    { id: 'g7', type: 'X', wire: 2, col: 5 },
    { id: 'g8', type: 'Z', wire: 2, col: 6 }
  ]);

  const [activePlaybackCol, setActivePlaybackCol] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const numCols = 8;

  const handleCellClick = (wireIdx: number, colIdx: number) => {
    soundEffects.playGateClick();
    // If gate already exists here, remove it
    const existingGate = circuitGates.find(g => g.wire === wireIdx && g.col === colIdx);
    if (existingGate) {
      setCircuitGates(prev => prev.filter(g => g.id !== existingGate.id));
      return;
    }

    // Place new gate from toolbox
    const newGate: GatePlacement = {
      id: `gate-${Date.now()}-${Math.random()}`,
      type: selectedToolGate,
      wire: wireIdx,
      col: colIdx,
      controlWire: selectedToolGate === 'CX' ? (wireIdx === 0 ? 1 : 0) : undefined
    };

    setCircuitGates(prev => [...prev, newGate]);
  };

  const handleClearCircuit = () => {
    soundEffects.playGateClick();
    setCircuitGates([]);
    setActivePlaybackCol(null);
    setIsPlaying(false);
  };

  const handleLoadTeleportationPreset = () => {
    soundEffects.playSuccessChord();
    setCircuitGates([
      { id: 'g1', type: 'H', wire: 1, col: 0 },
      { id: 'g2', type: 'CX', wire: 2, controlWire: 1, col: 1 },
      { id: 'g3', type: 'CX', wire: 1, controlWire: 0, col: 2 },
      { id: 'g4', type: 'H', wire: 0, col: 3 },
      { id: 'g5', type: 'M', wire: 0, col: 4 },
      { id: 'g6', type: 'M', wire: 1, col: 4 },
      { id: 'g7', type: 'X', wire: 2, col: 5 },
      { id: 'g8', type: 'Z', wire: 2, col: 6 }
    ]);
  };

  const handleStepForward = () => {
    soundEffects.playStep();
    setActivePlaybackCol(prev => (prev === null ? 0 : (prev + 1) % numCols));
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#4F46E5',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '4px'
          }}>
            Section A • Quantum Circuit Canvas
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Design Quantum Teleportation Circuit
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
            Construct and experiment with the 3-qubit circuit. Place gates onto Alice's unknown wire ($q_0$), her entangled partner ($q_1$), or Bob's receiver wire ($q_2$).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleLoadTeleportationPreset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: '8px',
              color: '#4F46E5',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={14} />
            <span>Load Teleportation Preset</span>
          </button>

          <button
            onClick={handleClearCircuit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#475569',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Trash2 size={14} />
            <span>Clear Grid</span>
          </button>
        </div>
      </div>

      {/* Toolbox & Controls */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
            Gate Toolbox:
          </span>
          {(['H', 'X', 'Y', 'Z', 'CX', 'M'] as const).map(gate => {
            const isSelected = selectedToolGate === gate;
            return (
              <button
                key={gate}
                onClick={() => {
                  soundEffects.playGateClick();
                  setSelectedToolGate(gate);
                }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: isSelected ? '#111111' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#0F172A',
                  border: isSelected ? '2px solid #111111' : '1px solid #CBD5E1',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {gate === 'CX' ? 'CNOT' : gate}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleStepForward}
            style={{
              padding: '8px 14px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Step Column
          </button>

          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {activePlaybackCol !== null ? `Col ${activePlaybackCol + 1} / ${numCols}` : 'Idle'}
          </span>
        </div>
      </div>

      {/* Circuit Grid Canvas */}
      <div style={{
        background: 'radial-gradient(ellipse at 50% 50%, #0F172A 0%, #020617 100%)',
        borderRadius: '16px',
        border: '1px solid #334155',
        padding: '32px 24px',
        overflowX: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        color: '#FFFFFF'
      }}>
        <div style={{ minWidth: '720px', display: 'flex', flexDirection: 'column', gap: '36px', position: 'relative' }}>
          {/* 3 Quantum Wires */}
          {[
            { wire: 0, label: 'q₀ : |ψ⟩', desc: "Alice's Unknown Qubit", color: '#38BDF8' },
            { wire: 1, label: 'q₁ : |0⟩', desc: "Alice's Entangled Half", color: '#818CF8' },
            { wire: 2, label: 'q₂ : |0⟩', desc: "Bob's Receiver Qubit", color: '#10B981' }
          ].map(w => (
            <div key={w.wire} style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '48px' }}>
              {/* Wire Label Header */}
              <div style={{ width: '160px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: w.color }}>
                  {w.label}
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                  {w.desc}
                </span>
              </div>

              {/* Wire Line */}
              <div style={{
                position: 'absolute',
                left: '160px',
                right: '20px',
                height: '2px',
                background: w.color,
                opacity: 0.5
              }} />

              {/* Grid Column Slots */}
              <div style={{
                position: 'relative',
                flex: 1,
                display: 'grid',
                gridTemplateColumns: `repeat(${numCols}, 1fr)`,
                height: '100%',
                alignItems: 'center'
              }}>
                {Array.from({ length: numCols }).map((_, colIdx) => {
                  const gate = circuitGates.find(g => g.wire === w.wire && g.col === colIdx);
                  const isPlaybackActive = activePlaybackCol === colIdx;

                  return (
                    <div
                      key={colIdx}
                      onClick={() => handleCellClick(w.wire, colIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        cursor: 'pointer',
                        position: 'relative',
                        background: isPlaybackActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        borderRadius: '6px'
                      }}
                    >
                      {gate ? (
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          background: gate.type === 'M' ? '#F59E0B' : '#1E293B',
                          border: `2px solid ${gate.type === 'M' ? '#FBBF24' : '#6366F1'}`,
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          zIndex: 2
                        }}>
                          {gate.type === 'CX' ? '⊕' : gate.type}
                        </div>
                      ) : (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.1)',
                          transition: 'all 0.1s ease'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Classical Double Wire */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '32px' }}>
            <div style={{ width: '160px', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B' }}>
                c : Classical Bus (2 Bits)
              </span>
            </div>
            <div style={{ position: 'absolute', left: '160px', right: '20px', top: '12px', height: '1px', background: '#F59E0B', opacity: 0.7 }} />
            <div style={{ position: 'absolute', left: '160px', right: '20px', top: '16px', height: '1px', background: '#F59E0B', opacity: 0.7 }} />
          </div>
        </div>
      </div>

      {/* Instructions card */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '16px 20px',
        fontSize: '13px',
        color: '#475569',
        lineHeight: 1.5
      }}>
        💡 <strong>Circuit Designer Tip:</strong> Select a gate from the toolbox above and click anywhere on the wire to place it. Click an existing gate to delete it. Press <strong>"Load Teleportation Preset"</strong> anytime to restore the canonical Bennett et al. protocol circuit.
      </div>
    </div>
  );
};
