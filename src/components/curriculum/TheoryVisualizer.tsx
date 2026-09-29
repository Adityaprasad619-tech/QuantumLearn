// src/components/curriculum/TheoryVisualizer.tsx
import React, { useState } from 'react';
import { Atom, Sparkles, Activity, Layers, RotateCw, HelpCircle, Check, ArrowRight, Zap } from 'lucide-react';

interface TheoryVisualizerProps {
  type: 'superposition' | 'interference' | 'bloch' | 'bell' | 'grover' | 'decoherence' | 'gates';
}

export const TheoryVisualizer: React.FC<TheoryVisualizerProps> = ({ type }) => {
  // Superposition state
  const [thetaDeg, setThetaDeg] = useState<number>(60);
  const [phiDeg, setPhiDeg] = useState<number>(0);

  // Interference state
  const [interfMode, setInterfMode] = useState<'constructive' | 'destructive' | 'custom'>('destructive');
  const [phaseDiffDeg, setPhaseDiffDeg] = useState<number>(180);

  // Bell State selector
  const [selectedBell, setSelectedBell] = useState<'phi_plus' | 'phi_minus' | 'psi_plus' | 'psi_minus'>('phi_plus');

  // Grover step
  const [groverStep, setGroverStep] = useState<number>(1); // 0: init, 1: oracle, 2: diffusion

  // Decoherence time
  const [tMicrosec, setTMicrosec] = useState<number>(30);

  // Math helper calculations for Superposition
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const phiRad = (phiDeg * Math.PI) / 180;
  const alpha = Math.cos(thetaRad / 2);
  const betaMag = Math.sin(thetaRad / 2);
  const prob0 = Math.pow(alpha, 2);
  const prob1 = Math.pow(betaMag, 2);

  // Math for interference
  const effectivePhase = interfMode === 'constructive' ? 0 : interfMode === 'destructive' ? Math.PI : (phaseDiffDeg * Math.PI) / 180;
  const amp1 = 1 / Math.sqrt(2);
  const amp2 = 1 / Math.sqrt(2);
  // Total amplitude squared = |amp1 + amp2 * e^(i*phi)|^2 / 2 normalized
  const totalProbInterf = 0.5 * (Math.pow(amp1 + amp2 * Math.cos(effectivePhase), 2) + Math.pow(amp2 * Math.sin(effectivePhase), 2));

  return (
    <div style={{
      margin: '20px 0',
      background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 8px 32px rgba(15, 23, 42, 0.25)',
      color: '#F8FAFC',
      padding: '20px',
      overflow: 'hidden'
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Atom size={16} color="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#93C5FD', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Interactive Physics Lab
            </span>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              {type === 'superposition' && 'State Vector Amplitude & Born Probabilities'}
              {type === 'interference' && 'Quantum Wave Interference & Phase Addition'}
              {type === 'bloch' && 'Bloch Sphere Coordinates & Cardinal Projections'}
              {type === 'bell' && 'Maximally Entangled Bell State Correlations'}
              {type === 'grover' && "Grover's Amplitude Amplification Wave Mechanics"}
              {type === 'decoherence' && 'T1 Relaxation & T2 Dephasing Decoherence Channels'}
              {type === 'gates' && 'Unitary Rotation Matrix Transformations'}
            </div>
          </div>
        </div>
        <span style={{
          fontSize: '10px',
          fontWeight: 800,
          background: 'rgba(59, 130, 246, 0.2)',
          color: '#60A5FA',
          padding: '3px 8px',
          borderRadius: '20px',
          border: '1px solid rgba(96, 165, 250, 0.3)'
        }}>
          REAL-TIME SIMULATION
        </span>
      </div>

      {/* 1. SUPERPOSITION VISUALIZER */}
      {type === 'superposition' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
          <div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', marginBottom: '6px' }}>
                <span>Polar Angle $\theta$ (Superposition Weight)</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60A5FA', fontWeight: 700 }}>
                  {thetaDeg}° ({((thetaDeg / 180) * Math.PI).toFixed(2)} rad)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={180}
                step={1}
                value={thetaDeg}
                onChange={(e) => setThetaDeg(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B' }}>
                <span>0° (|0⟩ pure)</span>
                <span>90° (|+⟩ equal)</span>
                <span>180° (|1⟩ pure)</span>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', marginBottom: '6px' }}>
                <span>Azimuthal Phase Angle $\phi$ (Relative Phase)</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#A855F7', fontWeight: 700 }}>
                  {phiDeg}° ({((phiDeg / 180)).toFixed(2)}π)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={phiDeg}
                onChange={(e) => setPhiDeg(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#A855F7', cursor: 'pointer' }}
              />
            </div>

            {/* Dirac Bra-Ket Display */}
            <div style={{
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px'
            }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                State Vector |ψ⟩
              </div>
              <div style={{ color: '#38BDF8', fontWeight: 700 }}>
                |ψ⟩ = {alpha.toFixed(3)}|0⟩ + {betaMag.toFixed(3)}e<sup>i{phiDeg}°</sup>|1⟩
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                Born Check: |α|² + |β|² = {(prob0 + prob1).toFixed(3)} (100% conserved)
              </div>
            </div>
          </div>

          {/* Probability Bars */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Born Measurement Probabilities P(x) = |amplitude|²
            </div>

            {/* Bar 0 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#38BDF8' }}>|0⟩ (Ground State)</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#38BDF8', fontWeight: 700 }}>
                  {(prob0 * 100).toFixed(1)}% (α = {alpha.toFixed(3)})
                </span>
              </div>
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '7px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${prob0 * 100}%`,
                  background: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)',
                  borderRadius: '7px',
                  transition: 'width 0.1s ease'
                }} />
              </div>
            </div>

            {/* Bar 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#C084FC' }}>|1⟩ (Excited State)</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#C084FC', fontWeight: 700 }}>
                  {(prob1 * 100).toFixed(1)}% (β = {betaMag.toFixed(3)})
                </span>
              </div>
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '7px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${prob1 * 100}%`,
                  background: 'linear-gradient(90deg, #9333EA 0%, #C084FC 100%)',
                  borderRadius: '7px',
                  transition: 'width 0.1s ease'
                }} />
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.5', marginTop: '4px' }}>
              💡 <strong>Key Takeaway:</strong> Measuring this qubit 1,000 times will yield {Math.round(prob0 * 1000)} zeroes and {Math.round(prob1 * 1000)} ones. The superposition collapses instantly.
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERFERENCE VISUALIZER */}
      {type === 'interference' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setInterfMode('destructive'); setPhaseDiffDeg(180); }}
              style={{
                background: interfMode === 'destructive' ? '#EF4444' : 'rgba(255,255,255,0.08)',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Destructive (Δφ = 180° / π) → 0%
            </button>
            <button
              onClick={() => { setInterfMode('constructive'); setPhaseDiffDeg(0); }}
              style={{
                background: interfMode === 'constructive' ? '#10B981' : 'rgba(255,255,255,0.08)',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Constructive (Δφ = 0°) → 100%
            </button>
            <button
              onClick={() => setInterfMode('custom')}
              style={{
                background: interfMode === 'custom' ? '#3B82F6' : 'rgba(255,255,255,0.08)',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Custom Phase Dial
            </button>
          </div>

          {interfMode === 'custom' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                <span>Phase Difference Δφ</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60A5FA', fontWeight: 700 }}>{phaseDiffDeg}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={phaseDiffDeg}
                onChange={(e) => setPhaseDiffDeg(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }}
              />
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Wave Path 1 (c₁)</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#60A5FA', fontFamily: 'JetBrains Mono, monospace' }}>
                +1/√2 ≈ +0.707
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Through Upper Beam</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Wave Path 2 (c₂ · e^(iΔφ))</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#C084FC', fontFamily: 'JetBrains Mono, monospace' }}>
                {(amp2 * Math.cos(effectivePhase)).toFixed(3)} {amp2 * Math.sin(effectivePhase) >= 0 ? '+' : ''} {(amp2 * Math.sin(effectivePhase)).toFixed(3)}i
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Through Lower Beam (Phase Shifted)</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Combined Probability |c₁ + c₂|²</div>
              <div style={{
                fontSize: '20px',
                fontWeight: 800,
                color: totalProbInterf > 0.7 ? '#34D399' : totalProbInterf < 0.1 ? '#F87171' : '#FBBF24',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {(totalProbInterf * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '4px' }}>
                {totalProbInterf === 0 ? '🚫 Complete Destructive Silence' : totalProbInterf === 1 ? '⚡ Full Constructive Amplification' : 'Partial Amplitude'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BLOCH SPHERE CARDINALS */}
      {type === 'bloch' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { name: '|0⟩ (North Pole)', coords: 'θ=0, φ=0', state: '[1, 0]ᵀ', color: '#38BDF8', prob: '100% |0⟩' },
            { name: '|1⟩ (South Pole)', coords: 'θ=π, φ=0', state: '[0, 1]ᵀ', color: '#C084FC', prob: '100% |1⟩' },
            { name: '|+⟩ (+X Equator)', coords: 'θ=π/2, φ=0', state: '1/√2 [1, 1]ᵀ', color: '#34D399', prob: '50% 0, 50% 1' },
            { name: '|-⟩ (-X Equator)', coords: 'θ=π/2, φ=π', state: '1/√2 [1, -1]ᵀ', color: '#F87171', prob: '50% 0, 50% 1' },
            { name: '|+i⟩ (+Y Equator)', coords: 'θ=π/2, φ=π/2', state: '1/√2 [1, i]ᵀ', color: '#FBBF24', prob: '50% 0, 50% 1' },
            { name: '|-i⟩ (-Y Equator)', coords: 'θ=π/2, φ=3π/2', state: '1/√2 [1, -i]ᵀ', color: '#FB923C', prob: '50% 0, 50% 1' }
          ].map((pole, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: pole.color }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: pole.color }}>{pole.name}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>
                {pole.coords}
              </div>
              <div style={{ fontSize: '11px', color: '#E2E8F0', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                {pole.state}
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                Measurement: {pole.prob}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. BELL STATES & ENTANGLEMENT */}
      {type === 'bell' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {[
              { id: 'phi_plus', label: '|Φ+⟩ = (|00⟩ + |11⟩)/√2' },
              { id: 'phi_minus', label: '|Φ-⟩ = (|00⟩ - |11⟩)/√2' },
              { id: 'psi_plus', label: '|Ψ+⟩ = (|01⟩ + |10⟩)/√2' },
              { id: 'psi_minus', label: '|Ψ-⟩ = (|01⟩ - |10⟩)/√2 (Singlet)' }
            ].map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBell(b.id as any)}
                style={{
                  background: selectedBell === b.id ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : 'rgba(255,255,255,0.08)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Synthesis Circuit</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#38BDF8', marginTop: '4px' }}>
                q0: ──H──■──{selectedBell === 'phi_minus' || selectedBell === 'psi_minus' ? 'Z──' : ''}
                <br />
                q1: ─────┼──{selectedBell.startsWith('psi') ? 'X──' : ''}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
                Entanglement Entropy: <strong style={{ color: '#34D399' }}>S = 1.000 (Maximum)</strong>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Measurement Correlation Table</div>
              <table style={{ width: '100%', fontSize: '11.5px', marginTop: '6px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '4px' }}>Alice (q0)</th>
                    <th style={{ padding: '4px' }}>Bob (q1) Result</th>
                    <th style={{ padding: '4px' }}>Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px', color: '#38BDF8' }}>Measures '0'</td>
                    <td style={{ padding: '4px', color: '#34D399' }}>
                      {selectedBell.startsWith('phi') ? 'Guaranteed 0 (100%)' : 'Guaranteed 1 (100%)'}
                    </td>
                    <td style={{ padding: '4px', color: '#94A3B8' }}>{selectedBell.startsWith('phi') ? 'Correlated' : 'Anti-correlated'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px', color: '#C084FC' }}>Measures '1'</td>
                    <td style={{ padding: '4px', color: '#34D399' }}>
                      {selectedBell.startsWith('phi') ? 'Guaranteed 1 (100%)' : 'Guaranteed 0 (100%)'}
                    </td>
                    <td style={{ padding: '4px', color: '#94A3B8' }}>{selectedBell.startsWith('phi') ? 'Correlated' : 'Anti-correlated'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. GROVER AMPLITUDE AMPLIFICATION */}
      {type === 'grover' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            {['1. Initial Equal Superposition', '2. Phase Oracle (Target Negated)', '3. Diffusion (Inversion about Mean)'].map((s, idx) => (
              <button
                key={idx}
                onClick={() => setGroverStep(idx)}
                style={{
                  background: groverStep === idx ? '#3B82F6' : 'rgba(255,255,255,0.08)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase' }}>
              4-Item Database (Target: |11⟩) Amplitude Profile
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '120px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
              {[
                { state: '|00⟩', amp: groverStep === 0 ? 0.5 : groverStep === 1 ? 0.5 : 0.0 },
                { state: '|01⟩', amp: groverStep === 0 ? 0.5 : groverStep === 1 ? 0.5 : 0.0 },
                { state: '|10⟩', amp: groverStep === 0 ? 0.5 : groverStep === 1 ? 0.5 : 0.0 },
                { state: '|11⟩ (Target)', amp: groverStep === 0 ? 0.5 : groverStep === 1 ? -0.5 : 1.0, target: true }
              ].map((item, idx) => {
                const heightPercent = Math.abs(item.amp) * 90;
                const isNeg = item.amp < 0;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: item.target ? '#38BDF8' : '#CBD5E1', fontWeight: 700 }}>
                      {item.amp.toFixed(2)}
                    </div>
                    <div style={{
                      width: '100%',
                      height: `${Math.max(4, heightPercent)}px`,
                      background: item.target
                        ? isNeg ? '#EF4444' : 'linear-gradient(180deg, #38BDF8 0%, #2563EB 100%)'
                        : '#64748B',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease'
                    }} />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: item.target ? '#38BDF8' : '#94A3B8' }}>
                      {item.state}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '11.5px', color: '#CBD5E1', marginTop: '10px' }}>
              {groverStep === 0 && 'All items have equal amplitude 1/√4 = 0.50. Average mean μ = +0.50.'}
              {groverStep === 1 && 'Oracle marks |11⟩ by flipping its amplitude to -0.50. Average mean drops to μ = +0.25.'}
              {groverStep === 2 && 'Diffusion reflects around μ = 0.25: |11⟩ amplitude jumps from -0.50 to 2(0.25) - (-0.50) = 1.00 (100% Probability)!'}
            </div>
          </div>
        </div>
      )}

      {/* 6. DECOHERENCE T1 / T2 */}
      {type === 'decoherence' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', marginBottom: '6px' }}>
              <span>Time Elapsed t (μs)</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60A5FA', fontWeight: 700 }}>{tMicrosec} μs</span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={1}
              value={tMicrosec}
              onChange={(e) => setTMicrosec(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B' }}>
              <span>t = 0 (Coherent)</span>
              <span>t = 50 μs (T1 decay)</span>
              <span>t = 150 μs (Thermal ground)</span>
            </div>

            <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Hardware Assumption (IBM Eagle Transmon):</div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
                T₁ = 65 μs (Energy Decay), T₂ = 45 μs (Dephasing)
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Statevector Fidelity & Purity</div>
            {(() => {
              const T1 = 65;
              const T2 = 45;
              const p1Rem = Math.exp(-tMicrosec / T1);
              const coherenceRem = Math.exp(-tMicrosec / T2);
              const purity = 0.5 * (1 + Math.exp(-2 * tMicrosec / T1));
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#38BDF8' }}>Excited State Pop P₁ = e^(-t/T1):</span>
                    <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#38BDF8' }}>
                      {(p1Rem * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#C084FC' }}>Phase Coherence = e^(-t/T2):</span>
                    <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#C084FC' }}>
                      {(coherenceRem * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#34D399' }}>State Purity Tr(ρ²):</span>
                    <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#34D399' }}>
                      {purity.toFixed(3)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
