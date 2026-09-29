// src/components/teleportation/TeleportationCircuitDiagram.tsx
import React, { useState } from 'react';
import { CIRCUIT_GATES_INFO, CircuitGateInfo } from './teleportationData';
import { Cpu, Info, X, Zap, Sliders, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

export const TeleportationCircuitDiagram: React.FC = () => {
  const [selectedGate, setSelectedGate] = useState<CircuitGateInfo | null>(CIRCUIT_GATES_INFO[0]);
  const [hoveredGateId, setHoveredGateId] = useState<string | null>(null);

  const handleSelectGate = (gate: CircuitGateInfo) => {
    soundEffects.playGateClick();
    setSelectedGate(gate);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} color="#4F46E5" />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Interactive Teleportation Circuit Architecture
          </h3>
        </div>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
          Standard quantum circuit from reference lecture notes. Click or hover any quantum gate, measurement, or conditional correction to view its unitary matrix and physical role.
        </p>
      </div>

      {/* Main Grid: Circuit Diagram on Left, Gate Details Inspector on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Visual Circuit Canvas Container */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 50%, #0F172A 0%, #020617 100%)',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '24px 20px',
          color: '#FFFFFF',
          position: 'relative',
          overflowX: 'auto',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)'
        }}>
          {/* Wire Headers and Tracks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minWidth: '580px', position: 'relative' }}>

            {/* Wire 0: Alice's Unknown Qubit q0 */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '44px' }}>
              <div style={{ width: '130px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8' }}>
                  q₀ : |ψ⟩
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Alice (Unknown)
                </span>
              </div>
              {/* Wire line */}
              <div style={{ position: 'absolute', left: '130px', right: '40px', height: '2px', background: '#38BDF8', opacity: 0.6 }} />

              {/* Gate on Wire 0: Bell CNOT Control (col 2) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[2])}
                onMouseEnter={() => setHoveredGateId('bell-cnot')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '260px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#38BDF8',
                  border: 'none',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  boxShadow: '0 0 10px #38BDF8',
                  zIndex: 2
                }}
                title="CNOT Control (q0 -> q1)"
              />

              {/* Gate on Wire 0: Alice Hadamard (col 3) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[3])}
                onMouseEnter={() => setHoveredGateId('alice-h')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '340px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: selectedGate?.id === 'alice-h' ? '#6366F1' : '#1E293B',
                  border: '2px solid #818CF8',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: selectedGate?.id === 'alice-h' ? '0 0 14px #818CF8' : 'none',
                  zIndex: 2
                }}
              >
                H
              </button>

              {/* Gate on Wire 0: Measurement M1 (col 4) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[4])}
                onMouseEnter={() => setHoveredGateId('measure-q0')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '420px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: selectedGate?.id === 'measure-q0' ? '#F59E0B' : '#1E293B',
                  border: '2px solid #F59E0B',
                  color: '#FCD34D',
                  fontWeight: 800,
                  fontSize: '11px',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                M₁
              </button>
            </div>

            {/* Wire 1: Alice's Entangled Qubit q1 */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '44px' }}>
              <div style={{ width: '130px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#818CF8' }}>
                  q₁ : |0⟩
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Alice (Entangled)
                </span>
              </div>
              {/* Wire line */}
              <div style={{ position: 'absolute', left: '130px', right: '40px', height: '2px', background: '#818CF8', opacity: 0.6 }} />

              {/* Gate on Wire 1: EPR Hadamard (col 0) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[0])}
                onMouseEnter={() => setHoveredGateId('epr-h')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '170px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: selectedGate?.id === 'epr-h' ? '#6366F1' : '#1E293B',
                  border: '2px solid #818CF8',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                H
              </button>

              {/* Gate on Wire 1: EPR CNOT Control (col 1) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[1])}
                onMouseEnter={() => setHoveredGateId('epr-cnot')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '215px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#818CF8',
                  border: 'none',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  boxShadow: '0 0 10px #818CF8',
                  zIndex: 2
                }}
                title="EPR CNOT Control (q1 -> q2)"
              />

              {/* Gate on Wire 1: Bell CNOT Target (col 2) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[2])}
                onMouseEnter={() => setHoveredGateId('bell-cnot')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '260px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'none',
                  border: '2px solid #38BDF8',
                  color: '#38BDF8',
                  fontWeight: 900,
                  fontSize: '18px',
                  lineHeight: '1',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                ⊕
              </button>

              {/* Gate on Wire 1: Measurement M2 (col 4) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[5])}
                onMouseEnter={() => setHoveredGateId('measure-q1')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '420px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: selectedGate?.id === 'measure-q1' ? '#F59E0B' : '#1E293B',
                  border: '2px solid #F59E0B',
                  color: '#FCD34D',
                  fontWeight: 800,
                  fontSize: '11px',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                M₂
              </button>
            </div>

            {/* Wire 2: Bob's Entangled Qubit q2 */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '44px' }}>
              <div style={{ width: '130px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#10B981' }}>
                  q₂ : |0⟩
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Bob (Receiver)
                </span>
              </div>
              {/* Wire line */}
              <div style={{ position: 'absolute', left: '130px', right: '40px', height: '2px', background: '#10B981', opacity: 0.6 }} />

              {/* Gate on Wire 2: EPR CNOT Target (col 1) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[1])}
                onMouseEnter={() => setHoveredGateId('epr-cnot')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '215px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'none',
                  border: '2px solid #818CF8',
                  color: '#818CF8',
                  fontWeight: 900,
                  fontSize: '18px',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                ⊕
              </button>

              {/* Gate on Wire 2: Bob Pauli-X Correction (col 5) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[6])}
                onMouseEnter={() => setHoveredGateId('bob-x')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '480px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: selectedGate?.id === 'bob-x' ? '#10B981' : '#1E293B',
                  border: '2px solid #10B981',
                  color: '#6EE7B7',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                Xᵐ¹
              </button>

              {/* Gate on Wire 2: Bob Pauli-Z Correction (col 6) */}
              <button
                onClick={() => handleSelectGate(CIRCUIT_GATES_INFO[7])}
                onMouseEnter={() => setHoveredGateId('bob-z')}
                onMouseLeave={() => setHoveredGateId(null)}
                style={{
                  position: 'absolute',
                  left: '535px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: selectedGate?.id === 'bob-z' ? '#10B981' : '#1E293B',
                  border: '2px solid #10B981',
                  color: '#6EE7B7',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transform: 'translate(-50%, 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                Zᵐ⁰
              </button>
            </div>

            {/* Classical Double Wire (Bottom) */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '28px', marginTop: '4px' }}>
              <div style={{ width: '130px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B' }}>
                  c : 2 Classical Bits
                </span>
              </div>
              {/* Double classical wire lines */}
              <div style={{ position: 'absolute', left: '130px', right: '40px', height: '1px', background: '#F59E0B', opacity: 0.7, top: '10px' }} />
              <div style={{ position: 'absolute', left: '130px', right: '40px', height: '1px', background: '#F59E0B', opacity: 0.7, top: '14px' }} />

              <span style={{ position: 'absolute', left: '420px', top: '18px', fontSize: '10px', color: '#FCD34D', transform: 'translate(-50%, 0)' }}>
                m₀, m₁
              </span>
            </div>

            {/* Vertical CNOT and Classical Feed-Forward Connector Lines */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {/* EPR CNOT vertical line (col 1: x=215 from q1 to q2) */}
              <line x1="215" y1="90" x2="215" y2="152" stroke="#818CF8" strokeWidth="2" />

              {/* Bell CNOT vertical line (col 2: x=260 from q0 to q1) */}
              <line x1="260" y1="22" x2="260" y2="84" stroke="#38BDF8" strokeWidth="2" />

              {/* Classical lines down from M1 (x=420) to Classical bus and Bob's Z */}
              <line x1="420" y1="40" x2="420" y2="210" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Classical feed-forward to Bob X (from M2 at x=420 to X at x=480) */}
              <path d="M 420 100 L 480 100 L 480 134" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Classical feed-forward to Bob Z (from M1 at x=420 to Z at x=535) */}
              <path d="M 420 210 L 535 210 L 535 170" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,3" />
            </svg>
          </div>

          <div style={{
            marginTop: '20px',
            paddingTop: '12px',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#94A3B8'
          }}>
            <span>← Time flows from left to right →</span>
            <span>Click any gate to inspect details</span>
          </div>
        </div>

        {/* Selected Gate Details Inspector Panel */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {selectedGate ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#4F46E5',
                  background: '#EEF2FF',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  Gate Inspector
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Target: {selectedGate.qubits}
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                  {selectedGate.name}
                </h4>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {selectedGate.purpose}
                </div>
              </div>

              {/* Matrix display */}
              <div style={{
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                color: '#38BDF8',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12.5px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Unitary Matrix / Operation:
                </div>
                {selectedGate.matrix}
              </div>

              {/* Effect on qubit */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Effect on Qubit State:
                </div>
                <div style={{ fontSize: '13px', color: '#0F172A', lineHeight: 1.5 }}>
                  {selectedGate.effect}
                </div>
              </div>

              {/* Why used in teleportation */}
              <div style={{
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12.5px',
                color: '#312E81',
                lineHeight: 1.5
              }}>
                <strong>Teleportation Role:</strong> {selectedGate.teleportationRole}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 0' }}>
              <Info size={24} style={{ margin: '0 auto 8px auto' }} />
              <p>Click any gate on the circuit to view its matrix and role.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
