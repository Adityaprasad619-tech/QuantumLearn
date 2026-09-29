// src/components/circuit/CircuitGrid.tsx
import React, { useState } from 'react';
import { CircuitGate, GateType } from '../../types';
import { GATE_DEFINITIONS } from '../../quantum/matrix';
import { soundEffects } from '../../audio/soundEffects';
import { X, Plus, Minus, Move } from 'lucide-react';

interface CircuitGridProps {
  numQubits: number;
  gates: CircuitGate[];
  activeStep: number;
  totalSteps: number;
  selectedGateType: GateType | null;
  selectedParams?: { theta?: number };
  onAddGate: (gate: Omit<CircuitGate, 'id'>) => void;
  onRemoveGate: (id: string) => void;
  onMoveGate?: (gateId: string, newTarget: number, newStep: number) => void;
  onSelectStep: (step: number) => void;
  onAddQubit?: () => void;
  onRemoveQubit?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onReset?: () => void;
  highlightedGateId?: string | null;
  onSelectGate?: (gate: CircuitGate) => void;
}

export const CircuitGrid: React.FC<CircuitGridProps> = ({
  numQubits,
  gates,
  activeStep,
  totalSteps = 8,
  selectedGateType,
  selectedParams,
  onAddGate,
  onRemoveGate,
  onMoveGate,
  onSelectStep,
  onAddQubit,
  onRemoveQubit,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  highlightedGateId,
  onSelectGate
}) => {
  const [draggedGateId, setDraggedGateId] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ q: number; s: number } | null>(null);

  const displaySteps = Math.max(9, Math.max(totalSteps + 1, ...gates.map(g => g.stepIndex + 2)));

  const handleCellClick = (qIndex: number, stepIndex: number) => {
    // Check if there is an existing gate here
    const existingGate = gates.find(g =>
      g.stepIndex === stepIndex &&
      (g.targets.includes(qIndex) || (g.controls && g.controls.includes(qIndex)))
    );

    if (existingGate) {
      soundEffects.playGateClick();
      onRemoveGate(existingGate.id);
      return;
    }

    if (!selectedGateType) return;

    soundEffects.playGateClick();

    if (selectedGateType === 'CX' || selectedGateType === 'CZ') {
      const target = (qIndex + 1) % numQubits;
      onAddGate({
        type: selectedGateType,
        controls: [qIndex],
        targets: [target],
        stepIndex
      });
    } else if (selectedGateType === 'SWAP') {
      const target2 = (qIndex + 1) % numQubits;
      onAddGate({
        type: 'SWAP',
        targets: [qIndex, target2],
        stepIndex
      });
    } else if (selectedGateType === 'CCX') {
      if (numQubits >= 3) {
        const c1 = qIndex;
        const c2 = (qIndex + 1) % numQubits;
        const target = (qIndex + 2) % numQubits;
        onAddGate({
          type: 'CCX',
          controls: [c1, c2],
          targets: [target],
          stepIndex
        });
      }
    } else {
      onAddGate({
        type: selectedGateType,
        targets: [qIndex],
        stepIndex,
        params: selectedParams
      });
    }
  };

  // Drag-and-Drop Handlers
  const handleDragStart = (e: React.DragEvent, gate: CircuitGate) => {
    e.dataTransfer.setData('text/plain', gate.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedGateId(gate.id);
  };

  const handleDragOver = (e: React.DragEvent, q: number, s: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredSlot({ q, s });
  };

  const handleDragLeave = () => {
    setHoveredSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetQubit: number, targetStep: number) => {
    e.preventDefault();
    setHoveredSlot(null);
    const gateId = e.dataTransfer.getData('text/plain') || draggedGateId;

    if (gateId && onMoveGate) {
      soundEffects.playGateClick();
      onMoveGate(gateId, targetQubit, targetStep);
    } else if (selectedGateType) {
      // If dragged from palette
      handleCellClick(targetQubit, targetStep);
    }
    setDraggedGateId(null);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: '10px',
      padding: '18px',
      overflowX: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* Circuit Header Bar with Qubit Controls & Undo/Redo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quantum Circuit Board ({numQubits} Qubit{numQubits > 1 ? 's' : ''})
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {onAddQubit && numQubits < 5 && (
              <button
                onClick={onAddQubit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#1E293B'
                }}
                title="Add Qubit wire"
              >
                <Plus size={12} />
                <span>Qubit</span>
              </button>
            )}

            {onRemoveQubit && numQubits > 1 && (
              <button
                onClick={onRemoveQubit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#1E293B'
                }}
                title="Remove Qubit wire"
              >
                <Minus size={12} />
                <span>Qubit</span>
              </button>
            )}
          </div>
        </div>

        {/* Undo, Redo, Reset Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={!canUndo}
              style={{
                padding: '4px 10px',
                background: canUndo ? '#F8FAFC' : '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: canUndo ? 'pointer' : 'default',
                opacity: canUndo ? 1 : 0.4,
                color: '#334155',
                fontWeight: 500
              }}
            >
              Undo
            </button>
          )}

          {onRedo && (
            <button
              onClick={onRedo}
              disabled={!canRedo}
              style={{
                padding: '4px 10px',
                background: canRedo ? '#F8FAFC' : '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: canRedo ? 'pointer' : 'default',
                opacity: canRedo ? 1 : 0.4,
                color: '#334155',
                fontWeight: 500
              }}
            >
              Redo
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              style={{
                padding: '4px 10px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              Reset Circuit
            </button>
          )}

          <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'JetBrains Mono, monospace', marginLeft: '6px' }}>
            t = <strong>{activeStep}</strong> / {displaySteps}
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div style={{ position: 'relative', minWidth: `${displaySteps * 58 + 90}px`, paddingBottom: '6px' }}>
        {/* Step Numbers Timeline Header */}
        <div style={{ display: 'flex', marginLeft: '70px', marginBottom: '8px' }}>
          {Array.from({ length: displaySteps }, (_, s) => (
            <button
              key={s}
              onClick={() => onSelectStep(s)}
              style={{
                width: '54px',
                textAlign: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '10.5px',
                fontFamily: 'JetBrains Mono, monospace',
                color: activeStep === s ? '#111111' : '#94A3B8',
                fontWeight: activeStep === s ? 700 : 400
              }}
            >
              t={s}
            </button>
          ))}
        </div>

        {/* Vertical Active Step Line */}
        <div style={{
          position: 'absolute',
          left: `${70 + activeStep * 54 + 26}px`,
          top: '24px',
          bottom: '12px',
          width: '2px',
          background: '#4F46E5',
          pointerEvents: 'none',
          zIndex: 15,
          boxShadow: '0 0 6px rgba(79, 70, 229, 0.4)'
        }} />

        {/* Multi-Qubit Connector Lines (for CX, CZ, Toffoli, SWAP) */}
        {gates.map((gate) => {
          if (!gate.controls || gate.controls.length === 0) return null;
          const allIndices = [...gate.controls, ...gate.targets];
          const minQ = Math.min(...allIndices);
          const maxQ = Math.max(...allIndices);
          const colX = 70 + gate.stepIndex * 54 + 27;
          const topY = 32 + minQ * 60 + 20;
          const height = (maxQ - minQ) * 60;

          return (
            <div
              key={`conn-${gate.id}`}
              style={{
                position: 'absolute',
                left: `${colX - 1}px`,
                top: `${topY}px`,
                width: '2px',
                height: `${height}px`,
                background: '#111111',
                pointerEvents: 'none',
                zIndex: 5
              }}
            />
          );
        })}

        {/* Qubit Wires */}
        {Array.from({ length: numQubits }, (_, q) => (
          <div
            key={q}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '60px',
              position: 'relative'
            }}
          >
            {/* Qubit Label and Initial State */}
            <div style={{
              width: '70px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#0F172A'
            }}>
              <span>q[{q}]</span>
              <span style={{ color: '#64748B', fontSize: '10px' }}>|0⟩ ──</span>
            </div>

            {/* Horizontal Quantum Wire Line */}
            <div style={{
              position: 'absolute',
              left: '70px',
              right: 0,
              height: '2px',
              background: '#CBD5E1',
              zIndex: 1
            }} />

            {/* Slot Cells */}
            <div style={{ display: 'flex', zIndex: 6 }}>
              {Array.from({ length: displaySteps }, (_, s) => {
                const gate = gates.find(g =>
                  g.stepIndex === s &&
                  (g.targets.includes(q) || (g.controls && g.controls.includes(q)))
                );

                const isControl = gate?.controls?.includes(q);
                const isTarget = gate?.targets?.includes(q);
                const isHovered = hoveredSlot?.q === q && hoveredSlot?.s === s;

                return (
                  <div
                    key={s}
                    onClick={() => handleCellClick(q, s)}
                    onDragOver={(e) => handleDragOver(e, q, s)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, q, s)}
                    style={{
                      width: '54px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      background: isHovered ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                      borderRadius: '4px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {gate && (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, gate)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectGate) onSelectGate(gate);
                        }}
                        style={{
                          width: isControl ? '14px' : '38px',
                          height: isControl ? '14px' : '38px',
                          borderRadius: isControl ? '50%' : gate.type === 'CX' && isTarget ? '50%' : '6px',
                          background: isControl ? (gate.id === highlightedGateId ? '#F59E0B' : '#111111') : gate.type === 'MEASURE' ? '#FEF3C7' : '#FFFFFF',
                          border: isControl
                            ? 'none'
                            : gate.id === highlightedGateId
                            ? '2.5px solid #F59E0B'
                            : gate.type === 'MEASURE'
                            ? '1.5px solid #D97706'
                            : '1.5px solid #111111',
                          color: gate.type === 'MEASURE' ? '#92400E' : gate.id === highlightedGateId ? '#D97706' : '#111111',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: gate.id === highlightedGateId
                            ? '0 0 0 4px rgba(245, 158, 11, 0.45), 0 4px 14px rgba(245, 158, 11, 0.35)'
                            : '0 2px 4px rgba(0,0,0,0.06)',
                          zIndex: 10,
                          userSelect: 'none',
                          cursor: 'grab',
                          position: 'relative',
                          transform: gate.id === highlightedGateId ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.2s ease'
                        }}
                        title={`${gate.type} (Click to inspect physics, drag to move)`}
                      >
                        {isControl ? '' : gate.type === 'CX' && isTarget ? '⊕' : gate.type === 'SWAP' ? '✕' : gate.type === 'MEASURE' ? 'M' : GATE_DEFINITIONS[gate.type]?.symbol || gate.type}

                        {/* Parametric Angle Badge for Rx, Ry, Rz */}
                        {gate.params?.theta !== undefined && !isControl && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-6px',
                            fontSize: '8px',
                            background: '#111111',
                            color: '#FFFFFF',
                            padding: '1px 3px',
                            borderRadius: '2px',
                            lineHeight: 1
                          }}>
                            {(gate.params.theta / Math.PI).toFixed(1)}π
                          </div>
                        )}
                      </div>
                    )}

                    {!gate && (
                      <div
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: 'transparent',
                          transition: 'all 0.15s ease'
                        }}
                        className="slot-hover-dot"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Move size={13} />
        <span>Tip: Drag existing gates to move them along the timeline. Click any gate to delete it.</span>
      </div>
    </div>
  );
};
