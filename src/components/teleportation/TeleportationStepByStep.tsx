// src/components/teleportation/TeleportationStepByStep.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TELEPORTATION_STEPS, TeleportationStepData } from './teleportationData';
import { BlochSphereScene } from '../canvas3d/BlochSphereScene';
import { QubitState } from '../../types';
import { soundEffects } from '../../audio/soundEffects';
import confetti from 'canvas-confetti';
import {
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2,
  Sparkles, Radio, Send, Zap, Eye, Cpu, BookOpen, Layers
} from 'lucide-react';

const buildQubitState = (theta: number, phi: number, label: string = 'q'): QubitState => {
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
  const prob0 = Math.cos(theta / 2) ** 2;
  const prob1 = Math.sin(theta / 2) ** 2;
  return {
    index: 0,
    label,
    bloch: { x, y, z, theta, phi, purity: 1 },
    prob0,
    prob1
  };
};

interface TeleportationStepByStepProps {
  onAskDirac: (prompt: string) => void;
}

export const TeleportationStepByStep: React.FC<TeleportationStepByStepProps> = ({ onAskDirac }) => {
  // Current step index (0 to 8 corresponding to Step 1 to Step 9)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Input state parameters: theta (0 to PI) and phi (0 to 2*PI)
  const [theta, setTheta] = useState<number>(Math.PI / 3);
  const [phi, setPhi] = useState<number>(0);

  // Active math tab: 'beginner' | 'mathematical' | 'advanced'
  const [mathTab, setMathTab] = useState<'beginner' | 'mathematical' | 'advanced'>('mathematical');

  // Autoplay and speed control
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 2x

  // Alice's measured classical bits: m0 (from q0) and m1 (from q1)
  const [measuredBits, setMeasuredBits] = useState<{ m0: number; m1: number }>({ m0: 0, m1: 0 });

  // Compute Alice's input state vector
  const alpha = Math.cos(theta / 2);
  const betaReal = Math.sin(theta / 2) * Math.cos(phi);
  const betaImag = Math.sin(theta / 2) * Math.sin(phi);

  const aliceOriginalQubit: QubitState = buildQubitState(theta, phi, 'Alice');

  // Bob's qubit state evolution based on step and correction
  const getBobQubitState = (stepIdx: number): QubitState => {
    if (stepIdx < 1) {
      // Step 1: Initial state |0>
      return buildQubitState(0, 0, 'Bob');
    }
    if (stepIdx === 1) {
      // Step 2: Entangled Bell state half (maximally mixed on equator)
      return buildQubitState(Math.PI / 2, 0, 'Bob');
    }
    if (stepIdx >= 2 && stepIdx <= 6) {
      // Steps 3 to 7: Correlated entangled state awaiting correction
      return buildQubitState(Math.PI / 2, Math.PI / 4, 'Bob');
    }
    if (stepIdx === 7) {
      // Step 8: Applying correction
      return aliceOriginalQubit;
    }
    // Step 9: Exactly recovered state!
    return aliceOriginalQubit;
  };

  const currentStepData: TeleportationStepData = TELEPORTATION_STEPS[currentStepIndex];

  // Advance step logic
  const handleNextStep = () => {
    if (currentStepIndex >= TELEPORTATION_STEPS.length - 1) {
      setIsPlaying(false);
      return;
    }

    const nextIdx = currentStepIndex + 1;
    soundEffects.playStep();

    // At step 5 (Alice measures two qubits), simulate probabilistic collapse
    if (nextIdx === 5) {
      const outcomes = [
        { m0: 0, m1: 0 },
        { m0: 0, m1: 1 },
        { m0: 1, m0Val: 1, m1: 0 },
        { m0: 1, m1: 1 }
      ];
      const randomOutcome = outcomes[Math.floor(Math.random() * 4)];
      const m0 = randomOutcome.m0;
      const m1 = randomOutcome.m1;
      setMeasuredBits({ m0, m1 });
      soundEffects.playStateCollapse(`${m0}${m1}`);
    } else if (nextIdx === 8) {
      // Final step: celebrate recovery!
      soundEffects.playSuccessChord();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setCurrentStepIndex(nextIdx);
  };

  const handlePrevStep = () => {
    if (currentStepIndex <= 0) return;
    soundEffects.playGateClick();
    setCurrentStepIndex(prev => prev - 1);
  };

  const handleReset = () => {
    soundEffects.playGateClick();
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setMeasuredBits({ m0: 0, m1: 0 });
  };

  // Autoplay timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      const intervalMs = 2800 / playbackSpeed;
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= TELEPORTATION_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          soundEffects.playStep();
          if (next === 5) {
            const m0 = Math.random() > 0.5 ? 1 : 0;
            const m1 = Math.random() > 0.5 ? 1 : 0;
            setMeasuredBits({ m0, m1 });
            soundEffects.playStateCollapse(`${m0}${m1}`);
          } else if (next === 8) {
            soundEffects.playSuccessChord();
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          }
          return next;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const setPresetState = (targetTheta: number, targetPhi: number) => {
    soundEffects.playGateClick();
    setTheta(targetTheta);
    setPhi(targetPhi);
    handleReset();
  };

  const bobState = getBobQubitState(currentStepIndex);

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '24px 20px 80px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Top Header & Overview */}
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
            Synchronized 3-Layer Quantum Simulator
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            9-Stage Quantum Teleportation Protocol
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
            Experience each stage answering simultaneously: <strong>What happened?</strong> (3D visual), <strong>Why did it happen?</strong> (Matrix transformation), and <strong>What does it mean?</strong> (Physics explanation).
          </p>
        </div>

        <button
          onClick={() => onAskDirac(`In teleportation step ${currentStepIndex + 1} (${currentStepData.title}), explain: ${currentStepData.meaning}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: '#F5F3FF',
            border: '1px solid #DDD6FE',
            borderRadius: '8px',
            color: '#6D28D9',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Sparkles size={14} color="#7C3AED" />
          <span>Explain Step {currentStepIndex + 1} with AI</span>
        </button>
      </div>

      {/* 15. TELEPORTATION TIMELINE (Interactive Stepper) */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gap: '6px'
        }}>
          {TELEPORTATION_STEPS.map((s, idx) => {
            const isActive = currentStepIndex === idx;
            const isDone = currentStepIndex > idx;

            return (
              <button
                key={s.stepNumber}
                onClick={() => {
                  soundEffects.playStep();
                  setCurrentStepIndex(idx);
                }}
                style={{
                  padding: '10px 6px',
                  borderRadius: '8px',
                  background: isActive ? '#111111' : isDone ? '#F1F5F9' : '#FFFFFF',
                  border: isActive ? '2px solid #111111' : isDone ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: isActive ? '#38BDF8' : isDone ? '#059669' : '#64748B'
                }}>
                  {isDone ? '✓ STEP ' + s.stepNumber : 'STEP ' + s.stepNumber}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isActive ? '#FFFFFF' : '#0F172A',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%'
                }}>
                  {s.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Playback Controls Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #F1F5F9',
          paddingTop: '12px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            <button
              onClick={() => setIsPlaying(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: isPlaying ? '#EF4444' : '#4F46E5',
                color: '#FFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play Simulation'}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Speed:</span>
              {[0.5, 1, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  style={{
                    padding: '3px 7px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    background: playbackSpeed === speed ? '#111111' : '#FFFFFF',
                    color: playbackSpeed === speed ? '#FFFFFF' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              disabled={currentStepIndex === 0}
              onClick={handlePrevStep}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                cursor: currentStepIndex === 0 ? 'default' : 'pointer',
                opacity: currentStepIndex === 0 ? 0.4 : 1
              }}
            >
              <ChevronLeft size={15} />
              <span>Previous</span>
            </button>

            <button
              disabled={currentStepIndex === TELEPORTATION_STEPS.length - 1}
              onClick={handleNextStep}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                background: currentStepIndex === TELEPORTATION_STEPS.length - 1 ? '#10B981' : '#111111',
                color: '#FFFFFF',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: currentStepIndex === TELEPORTATION_STEPS.length - 1 ? 'default' : 'pointer'
              }}
            >
              <span>{currentStepIndex === TELEPORTATION_STEPS.length - 1 ? 'Protocol Complete ✓' : 'Next Step'}</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 13. THREE-LAYER SYNCHRONIZED VISUALIZATION */}
      {/* VIEW 1: CIRCUIT STATE & ACTIVE GATE HIGHLIGHT */}
      <div style={{
        background: '#0F172A',
        borderRadius: '12px',
        border: '1px solid #334155',
        padding: '16px 20px',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={18} color="#38BDF8" />
          <div>
            <span style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Layer 1 • Active Quantum Circuit Gate
            </span>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>
              {currentStepData.operation}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.06)',
          padding: '6px 14px',
          borderRadius: '8px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px'
        }}>
          <span>Input State: <strong style={{ color: '#38BDF8' }}>{currentStepData.inputState}</strong></span>
          <span style={{ color: '#64748B' }}>→</span>
          <span>Transformed: <strong style={{ color: '#4ADE80' }}>{currentStepData.outputState}</strong></span>
        </div>
      </div>

      {/* VIEW 2: 3D TELEPORTATION ENVIRONMENT (Alice on Left, Entangled Bridge / Classical Link, Bob on Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Alice's Laboratory */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sender Station • Alice
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0 0' }}>
                Alice's Input State |ψ⟩ (q₀)
              </h3>
            </div>

            <div style={{
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              background: '#F1F5F9',
              padding: '3px 8px',
              borderRadius: '6px',
              color: '#0F172A',
              fontWeight: 700
            }}>
              {alpha.toFixed(3)}|0⟩ + {betaReal >= 0 ? '+' : ''}{betaReal.toFixed(3)}|1⟩
            </div>
          </div>

          {/* Alice's Bloch Sphere */}
          <div style={{ height: '320px', background: '#FAFAF8', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <BlochSphereScene
              qubitState={aliceOriginalQubit}
              showFlashCard={false}
            />
          </div>

          {/* Preset Buttons for Alice's input state */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Presets:</span>
              <button onClick={() => setPresetState(0, 0)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '11px', background: '#FFF' }}>|0⟩</button>
              <button onClick={() => setPresetState(Math.PI, 0)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '11px', background: '#FFF' }}>|1⟩</button>
              <button onClick={() => setPresetState(Math.PI / 2, 0)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '11px', background: '#FFF' }}>|+⟩</button>
              <button onClick={() => setPresetState(Math.PI / 2, Math.PI)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '11px', background: '#FFF' }}>|-⟩</button>
              <button onClick={() => setPresetState(Math.PI / 3, 0)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '11px', background: '#FFF' }}>Arbitrary</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#475569', minWidth: '65px' }}>
                θ = {(theta / Math.PI).toFixed(2)}π
              </span>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.05"
                value={theta}
                onChange={(e) => {
                  setTheta(parseFloat(e.target.value));
                  handleReset();
                }}
                style={{ flex: 1, accentColor: '#111111' }}
              />
            </div>
          </div>
        </div>

        {/* Bob's Laboratory */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Receiver Station • Bob
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0 0' }}>
                Bob's Qubit State (q₂)
              </h3>
            </div>

            <div style={{
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              background: currentStepIndex === 8 ? '#DCFCE7' : '#F1F5F9',
              padding: '3px 8px',
              borderRadius: '6px',
              color: currentStepIndex === 8 ? '#166534' : '#0F172A',
              fontWeight: 700
            }}>
              {currentStepIndex === 8 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} color="#16A34A" />
                  <span>STATE MATCH: ✓</span>
                </span>
              ) : (
                <span>Step {currentStepIndex + 1} State</span>
              )}
            </div>
          </div>

          {/* Bob's Bloch Sphere */}
          <div style={{ height: '320px', background: '#FAFAF8', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <BlochSphereScene
              qubitState={bobState}
              showFlashCard={false}
            />
          </div>

          {/* Channel Status & Measurements */}
          <div style={{
            background: currentStepIndex === 8 ? '#F0FDF4' : '#F8FAFC',
            border: currentStepIndex === 8 ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}>
            <div>
              <span style={{ color: '#64748B' }}>Classical Link: </span>
              <strong style={{ color: '#0F172A' }}>
                {currentStepIndex >= 5
                  ? `m₀=${measuredBits.m0}, m₁=${measuredBits.m1}`
                  : 'Awaiting Measurement (Step 6)'}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748B' }}>Fidelity: </span>
              <strong style={{ color: currentStepIndex === 8 ? '#16A34A' : '#64748B' }}>
                {currentStepIndex === 8 ? '100.0% (Exact Reconstruction)' : 'In Progress'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 3: SYNCHRONIZED MATHEMATICS PANEL */}
      {/* Answers: What Happened? (Visual), Why Did It Happen? (Math), What Does It Mean? (Concepts) */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        {/* Math Panel Header with 3 Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '14px'
        }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Layer 3 • Synchronized Mathematics & Physics Engine
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0 0' }}>
              {currentStepData.title}
            </h3>
          </div>

          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            borderRadius: '8px',
            padding: '2px'
          }}>
            <button
              onClick={() => {
                soundEffects.playGateClick();
                setMathTab('beginner');
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: mathTab === 'beginner' ? '#111111' : 'transparent',
                color: mathTab === 'beginner' ? '#FFFFFF' : '#64748B'
              }}
            >
              Beginner View
            </button>
            <button
              onClick={() => {
                soundEffects.playGateClick();
                setMathTab('mathematical');
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: mathTab === 'mathematical' ? '#4F46E5' : 'transparent',
                color: mathTab === 'mathematical' ? '#FFFFFF' : '#64748B'
              }}
            >
              Mathematical View
            </button>
            <button
              onClick={() => {
                soundEffects.playGateClick();
                setMathTab('advanced');
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: mathTab === 'advanced' ? '#0F172A' : 'transparent',
                color: mathTab === 'advanced' ? '#FFFFFF' : '#64748B'
              }}
            >
              Advanced Derivation
            </button>
          </div>
        </div>

        {/* 3 Didactic Columns answering the user's explicit questions: WHAT HAPPENED? WHY DID IT HAPPEN? WHAT DOES IT MEAN? */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* 1. What Happened? */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={15} color="#4F46E5" />
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', margin: 0 }}>
                1. What Happened?
              </h4>
            </div>
            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.55, margin: 0 }}>
              {currentStepData.whatHappened}
            </p>
          </div>

          {/* 2. Why Did It Happen? (Math Display) */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} color="#059669" />
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', margin: 0 }}>
                2. Why Did It Happen?
              </h4>
            </div>

            {mathTab === 'beginner' && (
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                {currentStepData.whyItHappened}
              </p>
            )}

            {mathTab === 'mathematical' && (
              <div style={{
                background: '#0F172A',
                color: '#38BDF8',
                padding: '10px',
                borderRadius: '6px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}>
                {currentStepData.mathFormula}
              </div>
            )}

            {mathTab === 'advanced' && (
              <div style={{
                background: '#0F172A',
                color: '#A5B4FC',
                padding: '10px',
                borderRadius: '6px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11.5px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}>
                {currentStepData.advancedDerivation}
              </div>
            )}
          </div>

          {/* 3. What Does It Mean? */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={15} color="#D97706" />
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', margin: 0 }}>
                3. What Does It Mean?
              </h4>
            </div>
            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.55, margin: 0 }}>
              {currentStepData.meaning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
