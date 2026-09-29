// src/components/views/GateTransformationPanel.tsx
import React, { useState } from 'react';
import { GateType } from '../../types';
import { StateVector } from '../../quantum/statevector';
import { soundEffects } from '../../audio/soundEffects';
import { ArrowRight, RotateCcw, Zap, BookOpen, Binary } from 'lucide-react';

interface GateTransformationPanelProps {
  currentState: StateVector;
  onApplyState: (newState: StateVector, gateName: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

interface GateDetail {
  type: GateType;
  name: string;
  symbol: string;
  matrixDisplay: string[][];
  matrixScalar?: string;
  simpleExplanation: string;
  mathExplanation: string;
  mathFormula: string;
}

const GATE_DETAILS: Record<GateType, GateDetail> = {
  H: {
    type: 'H',
    name: 'Hadamard Gate',
    symbol: 'H',
    matrixScalar: '1/√2',
    matrixDisplay: [
      ['1', '1'],
      ['1', '-1']
    ],
    simpleExplanation: 'Puts the qubit into an equal superposition. If it was 0, it becomes a 50/50 chance of 0 and 1, rotating the vector from the North Pole to the Equator (+X).',
    mathExplanation: 'Performs a change of basis between computational Z-basis {|0⟩, |1⟩} and equatorial X-basis {|+⟩, |-⟩}. Operates as H = (X + Z)/√2, reflecting across the diagonal.',
    mathFormula: 'H|0⟩ = (1/√2) [1  1; 1 -1] [1; 0] = (1/√2)[1; 1] ⟹ |+⟩'
  },
  X: {
    type: 'X',
    name: 'Pauli-X (NOT Gate)',
    symbol: 'X',
    matrixDisplay: [
      ['0', '1'],
      ['1', '0']
    ],
    simpleExplanation: 'The quantum equivalent of a classical NOT switch. It flips 0 to 1 and 1 to 0, rotating the arrow upside down (180° around X).',
    mathExplanation: 'Inverts the computational basis coordinates: X(α|0⟩ + β|1⟩) = β|0⟩ + α|1⟩. Equivalent to π rotation about the X axis.',
    mathFormula: 'X|0⟩ = [0 1; 1 0] [1; 0] = [0; 1] ⟹ |1⟩'
  },
  Y: {
    type: 'Y',
    name: 'Pauli-Y Gate',
    symbol: 'Y',
    matrixDisplay: [
      ['0', '-i'],
      ['i', '0']
    ],
    simpleExplanation: 'Flips both the bit and phase at the same time, rotating the vector 180° around the Y-axis into the complex plane.',
    mathExplanation: 'Applies both a bit flip and an imaginary phase shift of i. Unitary Hermitian operator Y† = Y with eigenvalues ±1.',
    mathFormula: 'Y|0⟩ = [0 -i; i 0] [1; 0] = [0; i] = i|1⟩'
  },
  Z: {
    type: 'Z',
    name: 'Pauli-Z (Phase Flip)',
    symbol: 'Z',
    matrixDisplay: [
      ['1', '0'],
      ['0', '-1']
    ],
    simpleExplanation: 'Leaves state 0 completely alone, but flips the phase of state 1 upside down (adds a minus sign). Inverts |+⟩ into |-⟩.',
    mathExplanation: 'Rotates by π radians around the Z-axis. Modifies relative phase without changing computational measurement probabilities P(0) or P(1).',
    mathFormula: 'Z|+⟩ = [1 0; 0 -1] (1/√2)[1; 1] = (1/√2)[1; -1] ⟹ |-⟩'
  },
  S: {
    type: 'S',
    name: 'Phase Gate (S = √Z)',
    symbol: 'S',
    matrixDisplay: [
      ['1', '0'],
      ['0', 'i']
    ],
    simpleExplanation: 'Adds a quarter-turn (90° / π/2) phase rotation around the equator. Applying S twice is exactly equal to a Z gate.',
    mathExplanation: 'Multiplies the |1⟩ amplitude by imaginary unit i = e^(iπ/2). Rotates the Bloch vector by 90° around the +Z axis.',
    mathFormula: 'S|+⟩ = [1 0; 0 i] (1/√2)[1; 1] = (1/√2)[1; i] ⟹ |+i⟩'
  },
  T: {
    type: 'T',
    name: 'T Gate (π/8 Gate = √S)',
    symbol: 'T',
    matrixDisplay: [
      ['1', '0'],
      ['0', 'e^(iπ/4)']
    ],
    simpleExplanation: 'Adds an eighth-turn (45° / π/4) phase rotation. Applying T four times produces a Z phase flip.',
    mathExplanation: 'Shifts phase by e^(iπ/4) = (1+i)/√2. Together with Clifford gates {H, S, CNOT}, the T gate enables universal fault-tolerant quantum computation.',
    mathFormula: 'T|1⟩ = e^(iπ/4)|1⟩'
  },
  RX: {
    type: 'RX',
    name: 'Rx(θ) Rotation',
    symbol: 'Rx(θ)',
    matrixDisplay: [
      ['cos(θ/2)', '-i·sin(θ/2)'],
      ['-i·sin(θ/2)', 'cos(θ/2)']
    ],
    simpleExplanation: 'Smoothly rotates the quantum state vector around the X-axis by any customized angle θ.',
    mathExplanation: 'Continuous unitary group operator Rx(θ) = exp(-iθX/2) = cos(θ/2)I - i·sin(θ/2)X.',
    mathFormula: 'Rx(θ)|0⟩ = cos(θ/2)|0⟩ - i·sin(θ/2)|1⟩'
  },
  RY: {
    type: 'RY',
    name: 'Ry(θ) Rotation',
    symbol: 'Ry(θ)',
    matrixDisplay: [
      ['cos(θ/2)', '-sin(θ/2)'],
      ['sin(θ/2)', 'cos(θ/2)']
    ],
    simpleExplanation: 'Smoothly rotates the quantum arrow around the Y-axis, directly controlling the 0/1 measurement probabilities with real numbers.',
    mathExplanation: 'Continuous unitary group operator Ry(θ) = exp(-iθY/2) = cos(θ/2)I - sin(θ/2)Y. Keeps state amplitudes purely real.',
    mathFormula: 'Ry(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩'
  },
  RZ: {
    type: 'RZ',
    name: 'Rz(θ) Rotation',
    symbol: 'Rz(θ)',
    matrixDisplay: [
      ['e^(-iθ/2)', '0'],
      ['0', 'e^(iθ/2)']
    ],
    simpleExplanation: 'Rotates the quantum arrow around the Z-axis, adjusting the relative phase angle without changing measurement probabilities.',
    mathExplanation: 'Continuous unitary group operator Rz(θ) = exp(-iθZ/2). Adds a relative phase angle of e^(iθ) between |0⟩ and |1⟩.',
    mathFormula: 'Rz(θ)|+⟩ = (1/√2) [e^(-iθ/2)|0⟩ + e^(iθ/2)|1⟩]'
  },
  S_DAG: {
    type: 'S_DAG',
    name: 'S† Gate',
    symbol: 'S†',
    matrixDisplay: [['1', '0'], ['0', '-i']],
    simpleExplanation: 'Inverse phase gate (-90° around Z).',
    mathExplanation: 'Hermitian conjugate S† = S^(-1). Maps |+i⟩ ⟶ |+⟩.',
    mathFormula: 'S†|+i⟩ = |+⟩'
  },
  T_DAG: {
    type: 'T_DAG',
    name: 'T† Gate',
    symbol: 'T†',
    matrixDisplay: [['1', '0'], ['0', 'e^(-iπ/4)']],
    simpleExplanation: 'Inverse T gate (-45° around Z).',
    mathExplanation: 'Hermitian conjugate T† = T^(-1). T† T = I.',
    mathFormula: 'T† T = I'
  },
  CX: { type: 'CX', name: 'CNOT', symbol: 'CX', matrixDisplay: [], simpleExplanation: '2-qubit controlled-NOT', mathExplanation: '', mathFormula: '' },
  CZ: { type: 'CZ', name: 'CZ', symbol: 'CZ', matrixDisplay: [], simpleExplanation: 'Controlled-Z', mathExplanation: '', mathFormula: '' },
  SWAP: { type: 'SWAP', name: 'SWAP', symbol: 'SWAP', matrixDisplay: [], simpleExplanation: 'SWAP gate', mathExplanation: '', mathFormula: '' },
  CCX: { type: 'CCX', name: 'Toffoli', symbol: 'CCX', matrixDisplay: [], simpleExplanation: 'Toffoli CCNOT', mathExplanation: '', mathFormula: '' },
  MEASURE: { type: 'MEASURE', name: 'Measure', symbol: 'M', matrixDisplay: [], simpleExplanation: 'Measure in Z-basis', mathExplanation: '', mathFormula: '' },
  I: { type: 'I', name: 'Identity', symbol: 'I', matrixDisplay: [['1', '0'], ['0', '1']], simpleExplanation: 'Identity', mathExplanation: 'Does nothing.', mathFormula: 'I|ψ⟩ = |ψ⟩' }
};

export const GateTransformationPanel: React.FC<GateTransformationPanelProps> = ({
  currentState,
  onApplyState,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset
}) => {
  const [selectedGate, setSelectedGate] = useState<GateType>('H');
  const [thetaParam, setThetaParam] = useState<number>(Math.PI);
  const [explanationMode, setExplanationMode] = useState<'simple' | 'mathematical'>('mathematical');

  const gateDetail = GATE_DETAILS[selectedGate];

  // Calculate projected state after applying this gate
  const previewState = currentState.clone();
  previewState.applySingleQubitGate(selectedGate, 0, { theta: thetaParam });

  const qBefore = currentState.getQubitState(0);
  const qAfter = previewState.getQubitState(0);

  const handleApply = () => {
    soundEffects.playGateClick();
    onApplyState(previewState, gateDetail.name);
  };

  const gateButtons: GateType[] = ['H', 'X', 'Y', 'Z', 'S', 'T', 'RX', 'RY', 'RZ'];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* Top Header with Mode Switcher & Undo/Redo/Reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Mathematical Transparency
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111111', margin: '2px 0 0 0' }}>
            Gate Transformation Engine
          </h2>
        </div>

        {/* Explanation Mode Toggle: Simple vs Mathematical */}
        <div style={{
          display: 'flex',
          background: '#F1F5F9',
          padding: '2px',
          borderRadius: '6px'
        }}>
          <button
            onClick={() => {
              soundEffects.playStep();
              setExplanationMode('simple');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: explanationMode === 'simple' ? '#FFFFFF' : 'transparent',
              color: explanationMode === 'simple' ? '#111111' : '#64748B',
              fontSize: '11px',
              fontWeight: explanationMode === 'simple' ? 600 : 500,
              cursor: 'pointer',
              boxShadow: explanationMode === 'simple' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <BookOpen size={12} />
            <span>Simple</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playStep();
              setExplanationMode('mathematical');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: explanationMode === 'mathematical' ? '#111111' : 'transparent',
              color: explanationMode === 'mathematical' ? '#FFFFFF' : '#64748B',
              fontSize: '11px',
              fontWeight: explanationMode === 'mathematical' ? 600 : 500,
              cursor: 'pointer',
              boxShadow: explanationMode === 'mathematical' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <Binary size={12} />
            <span>Mathematical</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              padding: '5px 10px',
              background: canUndo ? '#F8FAFC' : '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              cursor: canUndo ? 'pointer' : 'default',
              opacity: canUndo ? 1 : 0.4,
              fontSize: '11px',
              color: '#334155'
            }}
          >
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              padding: '5px 10px',
              background: canRedo ? '#F8FAFC' : '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              cursor: canRedo ? 'pointer' : 'default',
              opacity: canRedo ? 1 : 0.4,
              fontSize: '11px',
              color: '#334155'
            }}
          >
            Redo
          </button>
          <button
            onClick={onReset}
            style={{
              padding: '5px 10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#334155'
            }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Gate Selector Buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {gateButtons.map((gt) => {
          const isSelected = selectedGate === gt;
          return (
            <button
              key={gt}
              onClick={() => {
                soundEffects.playGateClick();
                setSelectedGate(gt);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: isSelected ? '2px solid #111111' : '1px solid #E2E8F0',
                background: isSelected ? '#111111' : '#FAFAF8',
                color: isSelected ? '#FFFFFF' : '#111111',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {gt}
            </button>
          );
        })}
      </div>

      {/* Parametric Angle Slider (for Rx, Ry, Rz) */}
      {(selectedGate === 'RX' || selectedGate === 'RY' || selectedGate === 'RZ') && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 14px',
          background: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E2E8F0'
        }}>
          <span style={{ fontSize: '11.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#1E293B' }}>
            θ = {(thetaParam / Math.PI).toFixed(2)}π ({(thetaParam * 180 / Math.PI).toFixed(0)}°)
          </span>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.05"
            value={thetaParam}
            onChange={(e) => setThetaParam(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#111111' }}
          />
        </div>
      )}

      {/* Mathematical Explanation vs Simple Explanation Display */}
      {explanationMode === 'mathematical' ? (
        <div style={{
          padding: '16px',
          background: '#FAFAF8',
          borderRadius: '10px',
          border: '1px solid #E8E8E8',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>
              Unitary Matrix Formulation: {gateDetail.name}
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#64748B' }}>
              U† U = I (Conserves Norm)
            </span>
          </div>

          {/* Matrix and Input State Multiplication Formula */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            color: '#0F172A',
            overflowX: 'auto',
            padding: '8px 0'
          }}>
            <span style={{ fontWeight: 700 }}>{gateDetail.symbol} |ψ_in⟩ = </span>
            {gateDetail.matrixScalar && (
              <span style={{ fontSize: '12px', color: '#475569' }}>{gateDetail.matrixScalar}</span>
            )}
            {/* Matrix Box */}
            <div style={{
              display: 'inline-flex',
              borderLeft: '2px solid #111111',
              borderRight: '2px solid #111111',
              padding: '2px 8px',
              borderRadius: '2px'
            }}>
              <table style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
                <tbody>
                  {gateDetail.matrixDisplay.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '2px 8px', fontWeight: 600 }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <span>×</span>

            {/* Input Vector Box */}
            <div style={{
              display: 'inline-flex',
              borderLeft: '2px solid #4F46E5',
              borderRight: '2px solid #4F46E5',
              padding: '2px 6px',
              borderRadius: '2px',
              color: '#4F46E5'
            }}>
              <table style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
                <tbody>
                  <tr><td style={{ padding: '2px 4px', fontWeight: 600 }}>{currentState.amplitudes[0]?.format() || '1'}</td></tr>
                  <tr><td style={{ padding: '2px 4px', fontWeight: 600 }}>{currentState.amplitudes[1]?.format() || '0'}</td></tr>
                </tbody>
              </table>
            </div>

            <span>=</span>

            {/* Output Vector Box */}
            <div style={{
              display: 'inline-flex',
              borderLeft: '2px solid #059669',
              borderRight: '2px solid #059669',
              padding: '2px 6px',
              borderRadius: '2px',
              color: '#059669'
            }}>
              <table style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
                <tbody>
                  <tr><td style={{ padding: '2px 4px', fontWeight: 700 }}>{previewState.amplitudes[0]?.format() || '1'}</td></tr>
                  <tr><td style={{ padding: '2px 4px', fontWeight: 700 }}>{previewState.amplitudes[1]?.format() || '0'}</td></tr>
                </tbody>
              </table>
            </div>

            <span style={{ fontWeight: 700, color: '#059669' }}>⟹ {previewState.toDiracString()}</span>
          </div>

          <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
            {gateDetail.mathExplanation}
          </div>
        </div>
      ) : (
        /* Simple Explanation Mode */
        <div style={{
          padding: '16px',
          background: '#FAFAF8',
          borderRadius: '10px',
          border: '1px solid #E8E8E8',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
            Intuitive Physical Explanation: {gateDetail.name}
          </span>
          <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: '1.6' }}>
            {gateDetail.simpleExplanation}
          </p>
        </div>
      )}

      {/* Before vs After State Comparison Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 16px',
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        borderRadius: '10px'
      }}>
        {/* State Before */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            State Before: |ψ_in⟩
          </div>
          <div style={{ fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#0F172A' }}>
            {currentState.toDiracString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
            P(0) = {(qBefore.prob0 * 100).toFixed(1)}% • P(1) = {(qBefore.prob1 * 100).toFixed(1)}%
          </div>
        </div>

        {/* Arrow & Gate Action */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0 8px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#111111',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {selectedGate}
          </div>
          <ArrowRight size={14} color="#64748B" />
        </div>

        {/* State After */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>
            State After: |ψ_out⟩
          </div>
          <div style={{ fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#059669' }}>
            {previewState.toDiracString()}
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            P(0) = {(qAfter.prob0 * 100).toFixed(1)}% • P(1) = {(qAfter.prob1 * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 20px',
          background: '#111111',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Zap size={15} color="#FBBF24" />
        <span>Apply {gateDetail.name} & Animate Bloch Vector</span>
      </button>
    </div>
  );
};
