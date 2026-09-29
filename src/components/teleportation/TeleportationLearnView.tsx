// src/components/teleportation/TeleportationLearnView.tsx
import React, { useState } from 'react';
import { TeleportationHero3D } from './TeleportationHero3D';
import { TeleportationCircuitDiagram } from './TeleportationCircuitDiagram';
import { TeleportationFlashcards } from './TeleportationFlashcards';
import { TeleportationMindMap } from './TeleportationMindMap';
import { TeleportationCheckpoints } from './TeleportationCheckpoints';
import { CORE_PREREQUISITES, PROTOCOL_STAGES, APPLICATIONS_DATA } from './teleportationData';
import {
  Sparkles, ArrowRight, BookOpen, ShieldAlert, Cpu, Network,
  Layers, Lightbulb, CheckCircle2, ChevronRight, Play
} from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface TeleportationLearnViewProps {
  onEnterLab: () => void;
  onAskDirac: (prompt: string) => void;
}

export const TeleportationLearnView: React.FC<TeleportationLearnViewProps> = ({
  onEnterLab,
  onAskDirac
}) => {
  const [selectedPrereq, setSelectedPrereq] = useState<string>(CORE_PREREQUISITES[0].id);
  const [activeAppTab, setActiveAppTab] = useState<'current' | 'future'>('current');
  const [activeFlowIndex, setActiveFlowIndex] = useState<number>(0);

  const handlePrereqClick = (id: string) => {
    soundEffects.playGateClick();
    setSelectedPrereq(id);
  };

  const handleFlowStepClick = (idx: number) => {
    soundEffects.playStep();
    setActiveFlowIndex(idx);
  };

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '24px 20px 80px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px'
    }}>
      {/* 1. HERO INTRODUCTION — STYLED DIRECTLY AFTER TEMPLATE SCREENSHOT */}
      <section style={{
        background: 'linear-gradient(135deg, #EBF3FC 0%, #F0F7FF 50%, #E2EFFD 100%)',
        border: '1px solid #BFDBFE',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 12px 32px -8px rgba(37, 99, 235, 0.12)',
        position: 'relative'
      }}>
        {/* Template Browser Mockup Header Bar */}
        <div className="browser-mockup-header">
          <div className="browser-mockup-dots">
            <div className="browser-mockup-dot" style={{ background: '#F87171' }} />
            <div className="browser-mockup-dot" style={{ background: '#FBBF24' }} />
            <div className="browser-mockup-dot" style={{ background: '#34D399' }} />
          </div>

          <div className="browser-mockup-capsule" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#64748B'
          }}>
            quantum-lab://teleportation-curriculum
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '18px', height: '8px', borderRadius: '4px', background: '#CBD5E1' }} />
            <div style={{ width: '18px', height: '8px', borderRadius: '4px', background: '#CBD5E1' }} />
          </div>
        </div>

        {/* Hero Content Area with Template Layout */}
        <div style={{
          padding: '36px 36px 32px 36px',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '28px',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Subtle Grid Effect Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none'
          }} />

          {/* Left Column: Title, Subtitle, Coral Pill Badge & Description */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#2563EB',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px'
            }}>
              ADVANCED QUANTUM INFORMATION PROTOCOL
            </div>

            <h1 className="editorial-title" style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#1E3A8A',
              margin: '0 0 12px 0',
              lineHeight: 1.12
            }}>
              Quantum Teleportation
            </h1>

            <p style={{
              fontSize: '18.5px',
              fontWeight: 600,
              color: '#2563EB',
              margin: '0 0 18px 0',
              fontStyle: 'italic',
              lineHeight: 1.4
            }}>
              "Transfer quantum information from one location to another without physically moving the quantum particle."
            </p>

            {/* Template-Inspired Coral/Orange Pill Badge */}
            <div style={{ marginBottom: '20px' }}>
              <span className="coral-pill-badge" style={{ fontSize: '13px', padding: '6px 16px' }}>
                March 25, 2025 • Quantum Computing Final Project
              </span>
            </div>

            <p style={{
              fontSize: '14.5px',
              color: '#334155',
              margin: '0 0 24px 0',
              maxWidth: '640px',
              lineHeight: 1.65,
              fontWeight: 500
            }}>
              Quantum teleportation does <strong style={{ color: '#DC2626' }}>NOT</strong> teleport physical matter. It transmits the complete, continuous superposition state $|ψ\rangle = \alpha|0\rangle + \beta|1\rangle$ using <strong>shared entanglement</strong>, <strong>Bell-basis measurement</strong>, and <strong>two classical bits</strong>.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  soundEffects.playSuccessChord();
                  onEnterLab();
                }}
                className="card-lift"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(30, 58, 138, 0.25)'
                }}
              >
                <Play size={16} fill="#FFF" />
                <span>ENTER QUANTUM TELEPORTATION LAB</span>
              </button>

              <button
                onClick={() => onAskDirac('Explain the exact quantum teleportation protocol and why no matter is transported.')}
                className="card-lift"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '10px',
                  color: '#1E3A8A',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
                }}
              >
                <Sparkles size={14} color="#2563EB" />
                <span>Ask Dirac AI</span>
              </button>
            </div>
          </div>

          {/* Right Column: Floating 3D-Style Knowledge Illustration Inspired by Template */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}>
            <div className="floating-element" style={{
              width: '100%',
              maxWidth: '360px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              border: '2px solid #BFDBFE',
              padding: '24px',
              boxShadow: '0 20px 40px -12px rgba(37, 99, 235, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative'
            }}>
              {/* Floating Quantum Hat & Stack Indicator */}
              <div style={{
                position: 'absolute',
                top: '-18px',
                right: '24px',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                color: '#FFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>🎓 Syllabus Milestone</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #EBF3FC 0%, #DBEAFE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #93C5FD'
                }}>
                  <Cpu size={24} color="#1E3A8A" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1E3A8A' }}>
                    Protocol Architecture
                  </h4>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    3 Qubits • 2 Classical Bits
                  </span>
                </div>
              </div>

              {/* Visual Nodes Diagram */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A' }}>
                  <span>Input State:</span>
                  <strong style={{ color: '#2563EB' }}>|ψ⟩ = α|0⟩ + β|1⟩</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A' }}>
                  <span>Bell Resource:</span>
                  <strong style={{ color: '#059669' }}>|Φ⁺⟩ = (|00⟩+|11⟩)/√2</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A' }}>
                  <span>Classical Channel:</span>
                  <strong style={{ color: '#EA580C' }}>m₀, m₁ (Speed ≤ c)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A', borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                  <span>Target Fidelity:</span>
                  <strong style={{ color: '#10B981' }}>F = 1.0000 (100%)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Visual Architecture Canvas */}
      <TeleportationHero3D />

      {/* 2. WHAT IS QUANTUM TELEPORTATION? */}
      <section style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BookOpen size={22} color="#2563EB" />
          <h2 className="editorial-title" style={{ fontSize: '26px', color: '#1E3A8A', margin: 0 }}>
            What is Quantum Teleportation?
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                1. What is Quantum Information?
              </h4>
              <p style={{ margin: 0 }}>
                Classical information is discrete (a bit is either 0 or 1). In contrast, <strong>quantum information</strong> is continuous and probabilistic, encoded in the complex amplitudes of a state vector:
                <span style={{ display: 'block', margin: '6px 0', fontFamily: 'JetBrains Mono, monospace', color: '#4F46E5', fontWeight: 700 }}>
                  |ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1
                </span>
                These probability amplitudes cannot be directly extracted by measurement without destroying the superposition.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                2. Why Can't Alice Simply Copy the State? (No-Cloning Theorem)
              </h4>
              <p style={{ margin: 0 }}>
                The <strong>No-Cloning Theorem</strong> (Wootters & Zurek, 1982) strictly proves that no unitary operator can duplicate an unknown quantum state $|\psi\rangle$. Therefore, Alice cannot clone her qubit and send one copy while keeping another. To transfer $|\psi\rangle$, her original qubit <em>must be destroyed in the process</em>.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                3. Why is Entanglement Required?
              </h4>
              <p style={{ margin: 0 }}>
                Entanglement serves as the <strong>quantum bridge</strong>. Alice and Bob pre-share an Einstein-Podolsky-Rosen (EPR) Bell state:
                <span style={{ display: 'block', margin: '6px 0', fontFamily: 'JetBrains Mono, monospace', color: '#059669', fontWeight: 700 }}>
                  |Φ⁺⟩ = (|00⟩ + |11⟩) / √2
                </span>
                This non-local correlation couples Alice's lab with Bob's lab, enabling Alice to project her unknown qubit into Bob's qubit via a Bell-state measurement.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                4. How Does Teleportation Transfer the State?
              </h4>
              <p style={{ margin: 0 }}>
                Alice performs a joint <strong>Bell measurement</strong> on her unknown qubit $q_0$ and her half of the entangled pair $q_1$. This operation forces Bob's distant qubit $q_2$ into one of four possible states:
                <span style={{ display: 'block', margin: '6px 0', fontFamily: 'JetBrains Mono, monospace', color: '#D97706', fontWeight: 700 }}>
                  |ψ⟩, X|ψ⟩, Z|ψ⟩, or XZ|ψ⟩
                </span>
                Notice that all four states contain the original $\alpha$ and $\beta$ coefficients, but scrambled by a known Pauli operator!
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                5. Why is Classical Communication Essential?
              </h4>
              <p style={{ margin: 0 }}>
                Bob's qubit is in a maximally mixed state until he knows <em>which</em> of the four measurement outcomes Alice received. Alice must transmit <strong>2 classical bits</strong> ($m_0, m_1$) across a conventional channel (radio, fiber optic, or laser) so Bob knows which correction ($I, X, Z,$ or $XZ$) to apply.
              </p>
            </div>

            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '13px',
              color: '#991B1B'
            }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} color="#DC2626" />
                Why Teleportation Cannot Exceed the Speed of Light
              </h4>
              Because Bob cannot unscramble his qubit without Alice's 2 classical bits, and classical bits cannot travel faster than the speed of light $c$, quantum teleportation <strong>strictly obeys Einstein's Special Relativity</strong>. No faster-than-light communication occurs.
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY IS QUANTUM TELEPORTATION IMPORTANT? */}
      <section style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={22} color="#2563EB" />
              <h2 className="editorial-title" style={{ fontSize: '26px', color: '#1E3A8A', margin: 0 }}>
                Why is Quantum Teleportation Important?
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', margin: '4px 0 0 0' }}>
              Explore the real-world applications of quantum teleportation in modern research vs. future computing architectures.
            </p>
          </div>

          {/* Current vs Future Tab Selector */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            borderRadius: '8px',
            padding: '3px'
          }}>
            <button
              onClick={() => {
                soundEffects.playGateClick();
                setActiveAppTab('current');
              }}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: activeAppTab === 'current' ? '#111111' : 'transparent',
                color: activeAppTab === 'current' ? '#FFFFFF' : '#64748B'
              }}
            >
              Current Research & Reality
            </button>
            <button
              onClick={() => {
                soundEffects.playGateClick();
                setActiveAppTab('future');
              }}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: activeAppTab === 'future' ? '#2563EB' : 'transparent',
                color: activeAppTab === 'future' ? '#FFFFFF' : '#64748B'
              }}
            >
              Future Potential & Scaling
            </button>
          </div>
        </div>

        {/* Applications Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {APPLICATIONS_DATA.filter(item => item.category === activeAppTab).map(app => (
            <div
              key={app.title}
              className="card-lift"
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: app.category === 'current' ? '#059669' : '#2563EB',
                  background: app.category === 'current' ? '#ECFDF5' : '#EFF6FF',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {app.category === 'current' ? 'Lab Demonstrated' : 'Future Milestone'}
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>{app.status}</span>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {app.title}
              </h4>

              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                {app.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CORE CONCEPTS BEFORE TELEPORTATION */}
      <section style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={22} color="#2563EB" />
            <h2 className="editorial-title" style={{ fontSize: '26px', color: '#1E3A8A', margin: 0 }}>
              Core Prerequisites Before Teleportation
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: '#475569', margin: '4px 0 0 0' }}>
            Click each card below to understand why each quantum principle is strictly required by the protocol.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {CORE_PREREQUISITES.map(concept => {
            const isSelected = selectedPrereq === concept.id;
            return (
              <div
                key={concept.id}
                onClick={() => handlePrereqClick(concept.id)}
                className="card-lift"
                style={{
                  background: isSelected ? '#F0F7FF' : '#FFFFFF',
                  border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: isSelected ? '0 6px 20px rgba(37, 99, 235, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {concept.title}
                  </h4>
                  {isSelected && <CheckCircle2 size={16} color="#2563EB" />}
                </div>

                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                  {concept.shortExplanation}
                </p>

                {concept.formula && (
                  <div style={{
                    background: '#0F172A',
                    color: '#38BDF8',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12.5px',
                    textAlign: 'center'
                  }}>
                    {concept.formula}
                  </div>
                )}

                <div style={{
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#1E3A8A',
                  lineHeight: 1.4
                }}>
                  <strong>Why needed:</strong> {concept.whyNeeded}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. TELEPORTATION PROTOCOL OVERVIEW (ANIMATED FLOWCHART) */}
      <section style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={22} color="#2563EB" />
            <h2 className="editorial-title" style={{ fontSize: '26px', color: '#1E3A8A', margin: 0 }}>
              Protocol Overview Flowchart
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: '#475569', margin: '4px 0 0 0' }}>
            Click through the 8 sequential stages to see how quantum information moves from Alice's hands to Bob's recovery.
          </p>
        </div>

        {/* 8-Stage Flow Line */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          marginBottom: '20px'
        }}>
          {PROTOCOL_STAGES.map((stage, idx) => {
            const isActive = activeFlowIndex === idx;
            return (
              <button
                key={stage.id}
                onClick={() => handleFlowStepClick(idx)}
                style={{
                  padding: '12px 10px',
                  background: isActive ? '#111111' : '#F8FAFC',
                  border: isActive ? '1px solid #111111' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isActive ? '#38BDF8' : '#64748B'
                }}>
                  STAGE {idx + 1}
                </div>
                <div style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: isActive ? '#FFFFFF' : '#0F172A',
                  lineHeight: 1.3
                }}>
                  {stage.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: '#FFFFFF',
          border: '1px solid #4338CA',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Flow Stage {activeFlowIndex + 1} of 8
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', margin: '4px 0 8px 0' }}>
              {PROTOCOL_STAGES[activeFlowIndex].title}
            </h3>
            <p style={{ fontSize: '14px', color: '#CBD5E1', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              {PROTOCOL_STAGES[activeFlowIndex].desc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={activeFlowIndex === 0}
              onClick={() => handleFlowStepClick(activeFlowIndex - 1)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFF',
                cursor: activeFlowIndex === 0 ? 'default' : 'pointer',
                opacity: activeFlowIndex === 0 ? 0.4 : 1,
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              Previous Stage
            </button>
            <button
              disabled={activeFlowIndex === PROTOCOL_STAGES.length - 1}
              onClick={() => handleFlowStepClick(activeFlowIndex + 1)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: '#4F46E5',
                border: 'none',
                color: '#FFF',
                cursor: activeFlowIndex === PROTOCOL_STAGES.length - 1 ? 'default' : 'pointer',
                opacity: activeFlowIndex === PROTOCOL_STAGES.length - 1 ? 0.4 : 1,
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              Next Stage
            </button>
          </div>
        </div>
      </section>

      {/* 6. QUANTUM TELEPORTATION CIRCUIT DIAGRAM */}
      <section>
        <TeleportationCircuitDiagram />
      </section>

      {/* 7. FLASHCARDS */}
      <section>
        <TeleportationFlashcards />
      </section>

      {/* 8. MIND MAP */}
      <section>
        <TeleportationMindMap />
      </section>

      {/* 9. LEARNING CHECKPOINTS */}
      <section>
        <TeleportationCheckpoints />
      </section>

      {/* FINAL CALL TO ACTION: ENTER LAB */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
        borderRadius: '16px',
        padding: '36px',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '16px',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.4)'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 24px #6366F1'
        }}>
          <Cpu size={28} color="#FFFFFF" />
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
          Ready to Run the Teleportation Protocol?
        </h2>

        <p style={{ fontSize: '15px', color: '#CBD5E1', maxWidth: '640px', lineHeight: 1.6, margin: 0 }}>
          Enter the interactive 3D laboratory to test custom input states $|\psi\rangle$, watch real-time probabilistic Bell-state collapses, send classical packets through the channel, and verify Bob's 100% unitary state recovery.
        </p>

        <button
          onClick={() => {
            soundEffects.playSuccessChord();
            onEnterLab();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 32px',
            background: '#FFFFFF',
            color: '#0F172A',
            borderRadius: '10px',
            border: 'none',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)',
            marginTop: '8px'
          }}
        >
          <span>ENTER QUANTUM TELEPORTATION LAB</span>
          <ArrowRight size={18} color="#0F172A" />
        </button>
      </section>
    </div>
  );
};
