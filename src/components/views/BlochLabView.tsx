// src/components/views/BlochLabView.tsx
import React, { useState } from 'react';
import { BlochSphereScene } from '../canvas3d/BlochSphereScene';
import { DensityMatrix3D } from '../canvas3d/DensityMatrix3D';
import { GateTransformationPanel } from './GateTransformationPanel';
import { StateVector } from '../../quantum/statevector';
import { soundEffects } from '../../audio/soundEffects';
import { BrowserFrame } from '../ui/BrowserFrame';
import { Sparkles, BarChart2 } from 'lucide-react';

interface BlochLabViewProps {
  onAskDirac: (prompt: string) => void;
}

export const BlochLabView: React.FC<BlochLabViewProps> = ({ onAskDirac }) => {
  // State History Stack for Undo/Redo/Reset
  const [history, setHistory] = useState<StateVector[]>([
    new StateVector(1) // Initial state |0⟩
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<'bloch' | 'density'>('bloch');
  const [showProjections, setShowProjections] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [lastAppliedMessage, setLastAppliedMessage] = useState<string>(
    'Initial ground state |0⟩. Vector points directly at the North Pole (+Z).'
  );
  const [trajectoryHistory, setTrajectoryHistory] = useState<[number, number, number][]>([
    [0, 1, 0]
  ]);

  const currentState = history[historyIndex];
  const qubitState = currentState.getQubitState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleApplyState = (newState: StateVector, gateName: string) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newState);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);

    const qBefore = qubitState;
    const qAfter = newState.getQubitState(0);

    // Update trajectory
    setTrajectoryHistory(prev => [
      ...prev,
      [qAfter.bloch.x, qAfter.bloch.z, qAfter.bloch.y] as [number, number, number]
    ]);

    // Descriptive explanation
    setLastAppliedMessage(
      `Applied ${gateName}: Transformed from ${currentState.toDiracString()} ⟶ ${newState.toDiracString()}. ` +
      `Probabilities: P(0) = ${(qAfter.prob0 * 100).toFixed(1)}%, P(1) = ${(qAfter.prob1 * 100).toFixed(1)}%. ` +
      `Bloch vector rotated to (x=${qAfter.bloch.x.toFixed(2)}, y=${qAfter.bloch.y.toFixed(2)}, z=${qAfter.bloch.z.toFixed(2)}).`
    );
  };

  const handleUndo = () => {
    if (canUndo) {
      soundEffects.playStep();
      setHistoryIndex(historyIndex - 1);
      setLastAppliedMessage('Undid last gate transformation.');
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      soundEffects.playStep();
      setHistoryIndex(historyIndex + 1);
      setLastAppliedMessage('Redid gate transformation.');
    }
  };

  const handleReset = () => {
    soundEffects.playStep();
    const fresh = new StateVector(1);
    setHistory([fresh]);
    setHistoryIndex(0);
    setTrajectoryHistory([[0, 1, 0]]);
    setLastAppliedMessage('Reset to initial ground state |0⟩ (North Pole +Z).');
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
      {/* Header with Template Styling */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)',
        border: '1px solid #BFDBFE',
        borderRadius: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="coral-pill-badge floating-element">
              <Sparkles size={13} />
              <span>3D Real-Time Physics</span>
            </span>
            <span className="navy-pill-badge">
              <span>Interactive 3D Laboratory</span>
            </span>
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            3D Bloch Sphere & Gate Simulator
          </h1>
          <p className="editorial-subtitle" style={{ fontSize: '14px', margin: '4px 0 0 0', maxWidth: '780px' }}>
            Real Three.js 3D physics rendering with real unitary gate matrices, dynamic trajectory arcs, and Born probability measurement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('bloch')}
            className={activeTab === 'bloch' ? 'btn-editorial-primary' : 'btn-outline'}
            style={{
              padding: '8px 18px',
              fontSize: '12.5px',
              borderRadius: '9999px',
              border: activeTab === 'bloch' ? 'none' : '1px solid #BFDBFE',
              background: activeTab === 'bloch' ? '#1E3A8A' : '#FFFFFF',
              color: activeTab === 'bloch' ? '#FFFFFF' : '#1E3A8A',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            3D Bloch Sphere
          </button>
          <button
            onClick={() => setActiveTab('density')}
            style={{
              padding: '8px 18px',
              fontSize: '12.5px',
              borderRadius: '9999px',
              border: activeTab === 'density' ? 'none' : '1px solid #BFDBFE',
              background: activeTab === 'density' ? '#1E3A8A' : '#FFFFFF',
              color: activeTab === 'density' ? '#FFFFFF' : '#1E3A8A',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            3D Quantum City (ρ)
          </button>
        </div>
      </div>

      {/* Main Two-Column Studio: 3D Canvas + Live Gate Transformation Inspector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(380px, 1.3fr) minmax(340px, 1fr)',
        gap: '24px'
      }}>
        {/* Left Column: 3D Bloch Scene wrapped in BrowserFrame */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <BrowserFrame
            urlPath="quantum-lab://bloch-sphere/qubit-0"
            badge={activeTab === 'bloch' ? 'Bloch Vector' : 'Density Matrix ρ'}
            badgeColor="coral"
            gridBackground={true}
            headerExtra={
              <div style={{
                display: 'flex',
                gap: '8px',
                background: '#FFFFFF',
                padding: '3px 10px',
                borderRadius: '9999px',
                border: '1px solid #BFDBFE',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#1E3A8A' }}>
                  <input
                    type="checkbox"
                    checked={showProjections}
                    onChange={(e) => setShowProjections(e.target.checked)}
                  />
                  <span>Projections</span>
                </label>
                <span style={{ color: '#CBD5E1' }}>|</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#1E3A8A' }}>
                  <input
                    type="checkbox"
                    checked={showTrajectory}
                    onChange={(e) => setShowTrajectory(e.target.checked)}
                  />
                  <span>Trajectory</span>
                </label>
              </div>
            }
          >
            <div style={{ height: '460px', position: 'relative', overflow: 'hidden' }}>
              {activeTab === 'bloch' ? (
                <BlochSphereScene
                  qubitState={qubitState}
                  showProjections={showProjections}
                  showTrajectory={showTrajectory}
                  trajectoryHistory={trajectoryHistory}
                />
              ) : (
                <DensityMatrix3D
                  densityMatrix={currentState.getDensityMatrix()}
                  numQubits={1}
                />
              )}

              {/* Floating Coordinates Pill Badge */}
              <div
                className="floating-element"
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: '#1E3A8A',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)'
                }}
              >
                x: {qubitState.bloch.x.toFixed(2)} • y: {qubitState.bloch.y.toFixed(2)} • z: {qubitState.bloch.z.toFixed(2)}
              </div>
            </div>
          </BrowserFrame>

          {/* Last Applied Transformation Explanation Card */}
          <div
            className="card-lift"
            style={{
              padding: '16px 20px',
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.04)'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
              border: '1px solid #BFDBFE'
            }}>
              <BarChart2 size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Transformation Summary & Physics Insight
              </div>
              <div style={{ fontSize: '13.5px', color: '#1E293B', marginTop: '3px', lineHeight: '1.55', fontWeight: 500 }}>
                {lastAppliedMessage}
              </div>
            </div>
          </div>

          {/* Live Probabilities Card */}
          <div
            className="card-lift"
            style={{
              padding: '18px 20px',
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Born Rule Measurement Probabilities (|α|² + |β|² = 1)
              </div>
              <span className="navy-pill-badge" style={{ fontSize: '10px', padding: '2px 8px' }}>
                Exact Amplitude
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* P(0) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>P(|0⟩) = |α|²</span>
                  <strong style={{ color: '#2563EB' }}>{(qubitState.prob0 * 100).toFixed(1)}% ({qubitState.prob0.toFixed(3)})</strong>
                </div>
                <div style={{ height: '8px', background: '#E2EEFC', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ height: '100%', width: `${qubitState.prob0 * 100}%`, background: 'linear-gradient(90deg, #2563EB 0%, #1E3A8A 100%)', transition: 'width 0.25s ease', borderRadius: '4px' }} />
                </div>
              </div>

              {/* P(1) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>P(|1⟩) = |β|²</span>
                  <strong style={{ color: '#0EA5E9' }}>{(qubitState.prob1 * 100).toFixed(1)}% ({qubitState.prob1.toFixed(3)})</strong>
                </div>
                <div style={{ height: '8px', background: '#E2EEFC', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ height: '100%', width: `${qubitState.prob1 * 100}%`, background: 'linear-gradient(90deg, #0EA5E9 0%, #0284C7 100%)', transition: 'width 0.25s ease', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Gate Transformation Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="card-lift">
            <GateTransformationPanel
              currentState={currentState}
              onApplyState={handleApplyState}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onReset={handleReset}
            />
          </div>

          {/* Socratic Question Prompt */}
          <button
            className="btn-editorial-primary card-lift-sm"
            onClick={() => onAskDirac(
              `Explain the mathematical transformation caused by applying gates to state ${currentState.toDiracString()} ` +
              `and why the vector moves across the Bloch sphere according to the unitary matrix.`
            )}
            style={{
              justifyContent: 'center',
              padding: '13px',
              fontSize: '13px',
              borderRadius: '12px'
            }}
          >
            <Sparkles size={16} color="#FBBF24" />
            <span>Ask Dirac AI to Explain This State Transition</span>
          </button>
        </div>
      </div>
    </div>
  );
};
