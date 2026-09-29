// src/components/canvas3d/QubitFlashCard.tsx
import React from 'react';
import { QubitState } from '../../types';
import { Atom, Sparkles, Compass, CheckCircle2 } from 'lucide-react';

interface QubitFlashCardProps {
  qubitState: QubitState;
  onSelectState?: (theta: number, phi: number) => void;
  compact?: boolean;
}

export const QubitFlashCard: React.FC<QubitFlashCardProps> = ({
  qubitState,
  onSelectState,
  compact = false
}) => {
  const thetaDeg = (qubitState.bloch.theta * (180 / Math.PI)).toFixed(1);
  const phiDeg = (qubitState.bloch.phi * (180 / Math.PI)).toFixed(1);
  const thetaRad = (qubitState.bloch.theta / Math.PI).toFixed(2);
  const phiRad = (qubitState.bloch.phi / Math.PI).toFixed(2);

  const p0 = Math.round(qubitState.prob0 * 100);
  const p1 = Math.round(qubitState.prob1 * 100);

  const x = qubitState.bloch.x.toFixed(2);
  const y = qubitState.bloch.y.toFixed(2);
  const z = qubitState.bloch.z.toFixed(2);
  const r = Math.min(1, Math.sqrt(qubitState.bloch.x ** 2 + qubitState.bloch.y ** 2 + qubitState.bloch.z ** 2)).toFixed(2);

  const isPure = qubitState.bloch.purity > 0.98;

  // Determine standard state name if close to a cardinal landmark
  const getSemanticState = () => {
    const th = qubitState.bloch.theta;
    const ph = qubitState.bloch.phi;
    if (th < 0.08) return { symbol: '|0⟩', name: 'Ground State (+Z)' };
    if (Math.abs(th - Math.PI) < 0.08) return { symbol: '|1⟩', name: 'Excited State (-Z)' };
    if (Math.abs(th - Math.PI / 2) < 0.1) {
      if (ph < 0.1 || Math.abs(ph - 2 * Math.PI) < 0.1) return { symbol: '|+⟩', name: 'Superposition (+X)' };
      if (Math.abs(ph - Math.PI) < 0.1) return { symbol: '|-⟩', name: 'Phase Flip (-X)' };
      if (Math.abs(ph - Math.PI / 2) < 0.1) return { symbol: '|+i⟩', name: 'Circular (+Y)' };
      if (Math.abs(ph - (3 * Math.PI) / 2) < 0.1) return { symbol: '|-i⟩', name: 'Circular (-Y)' };
    }
    const a = Math.cos(th / 2);
    const b = Math.sin(th / 2);
    return {
      symbol: `${a.toFixed(2)}|0⟩ + ${b.toFixed(2)}|1⟩`,
      name: 'Arbitrary Superposition'
    };
  };

  const semantic = getSemanticState();

  const LANDMARKS = [
    { label: '|0⟩', theta: 0, phi: 0, title: 'Ground (+Z)' },
    { label: '|1⟩', theta: Math.PI, phi: 0, title: 'Excited (-Z)' },
    { label: '|+⟩', theta: Math.PI / 2, phi: 0, title: 'Plus (+X)' },
    { label: '|-⟩', theta: Math.PI / 2, phi: Math.PI, title: 'Minus (-X)' },
    { label: '|+i⟩', theta: Math.PI / 2, phi: Math.PI / 2, title: '+i (+Y)' },
    { label: '|-i⟩', theta: Math.PI / 2, phi: (3 * Math.PI) / 2, title: '-i (-Y)' }
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      padding: compact ? '14px' : '18px',
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      height: '100%',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      {/* FLASH CARD TOP BADGE */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #F1F5F9',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '9.5px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '2px 7px',
            borderRadius: '4px'
          }}>
            FLASH CARD
          </span>
          <span style={{
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: '#0F172A'
          }}>
            {qubitState.label}
          </span>
        </div>

        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          padding: '2px 8px',
          borderRadius: '4px',
          background: isPure ? '#ECFDF5' : '#FEF3C7',
          color: isPure ? '#059669' : '#D97706',
          border: isPure ? '1px solid #A7F3D0' : '1px solid #FDE68A'
        }}>
          {isPure ? 'PURE STATE' : 'MIXED / ENTANGLED'}
        </span>
      </div>

      {/* STATE VECTOR KET DISPLAY */}
      <div style={{
        padding: '12px',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#64748B',
          marginBottom: '4px'
        }}>
          Quantum State |ψ⟩
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '17px',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '0.02em'
        }}>
          {semantic.symbol}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#64748B',
          marginTop: '3px'
        }}>
          {semantic.name}
        </div>
      </div>

      {/* MEASUREMENT PROBABILITIES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: '#334155'
        }}>
          <span>Measurement Probabilities</span>
          <span style={{ fontSize: '10px', color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>
            Born's Rule
          </span>
        </div>

        {/* P(|0>) Bar */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#475569',
            marginBottom: '3px'
          }}>
            <span>P(|0⟩)</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>{p0}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: '#F1F5F9',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${p0}%`,
              height: '100%',
              background: '#0284C7',
              borderRadius: '3px',
              transition: 'width 0.25s ease'
            }} />
          </div>
        </div>

        {/* P(|1>) Bar */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#475569',
            marginBottom: '3px'
          }}>
            <span>P(|1⟩)</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>{p1}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: '#F1F5F9',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${p1}%`,
              height: '100%',
              background: '#7C3AED',
              borderRadius: '3px',
              transition: 'width 0.25s ease'
            }} />
          </div>
        </div>
      </div>

      {/* POLAR & CARTESIAN METRICS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        padding: '10px 12px',
        background: '#FAFAFA',
        border: '1px solid #F1F5F9',
        borderRadius: '8px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px'
      }}>
        <div>
          <span style={{ color: '#64748B', fontSize: '10px' }}>Polar θ: </span>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>{thetaDeg}°</span>
          <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>{thetaRad}π rad</div>
        </div>
        <div>
          <span style={{ color: '#64748B', fontSize: '10px' }}>Azimuth φ: </span>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>{phiDeg}°</span>
          <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>{phiRad}π rad</div>
        </div>
        <div>
          <span style={{ color: '#64748B', fontSize: '10px' }}>Coords (x,y): </span>
          <span style={{ fontWeight: 600, color: '#334155' }}>({x}, {y})</span>
        </div>
        <div>
          <span style={{ color: '#64748B', fontSize: '10px' }}>Axis z, |r|: </span>
          <span style={{ fontWeight: 600, color: '#334155' }}>z={z}, |r|={r}</span>
        </div>
      </div>

      {/* QUICK LANDMARK SNAP PRESETS */}
      {onSelectState && (
        <div>
          <div style={{
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748B',
            marginBottom: '6px'
          }}>
            Cardinal Presets
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px'
          }}>
            {LANDMARKS.map(lm => (
              <button
                key={lm.label}
                onClick={() => onSelectState(lm.theta, lm.phi)}
                title={lm.title}
                style={{
                  padding: '4px 6px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  color: '#1E293B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#0F172A';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#0F172A';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.color = '#1E293B';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                {lm.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INSTRUCTIONAL HINT */}
      <div style={{
        marginTop: 'auto',
        padding: '8px 10px',
        background: '#F8FAFC',
        border: '1px solid #F1F5F9',
        borderRadius: '6px',
        fontSize: '10.5px',
        color: '#64748B',
        lineHeight: '1.4'
      }}>
        💡 <strong>Complete 3D View:</strong> Drag anywhere on the sphere to orbit. Click landmarks to inspect state.
      </div>
    </div>
  );
};
