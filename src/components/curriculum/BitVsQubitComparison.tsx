// src/components/curriculum/BitVsQubitComparison.tsx
import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import {
  Binary,
  Atom,
  Zap,
  Cpu,
  Layers,
  ShieldAlert,
  Eye,
  Shuffle,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sliders
} from 'lucide-react';

export interface ComparisonItem {
  id: string;
  category: 'state' | 'physics' | 'operations' | 'measurement';
  dimension: string;
  classicalShort: string;
  qubitShort: string;
  classicalFull: string;
  qubitFull: string;
  explanation: string;
  beginnerNote: string;
  icon: React.FC<{ size?: number; color?: string; className?: string }>;
}

export const COMPARISON_DATA: ComparisonItem[] = [
  {
    id: 'state-space',
    category: 'state',
    dimension: 'Allowed States',
    classicalShort: '0 or 1',
    qubitShort: 'Superposition of 0 and 1 (α|0⟩ + β|1⟩)',
    classicalFull: '0 or 1',
    qubitFull: 'Superposition of 0 and 1',
    explanation: 'A classical bit can only be in one of two discrete states at any given moment (0 or 1). A qubit can exist simultaneously in a continuous linear combination of both states, parameterized by complex probability amplitudes α and β.',
    beginnerNote: 'Think of a classical bit as a coin lying flat on a table (strictly heads or tails). A qubit is like a spinning coin in mid-air holding both possibilities until caught!',
    icon: Binary
  },
  {
    id: 'information-nature',
    category: 'state',
    dimension: 'Nature of Information',
    classicalShort: 'Classical information',
    qubitShort: 'Quantum information',
    classicalFull: 'Classical information',
    qubitFull: 'Quantum information',
    explanation: 'Classical information consists of discrete, readable digital digits that obey macroscopic boolean logic. Quantum information is continuous, complex-valued, and governed by quantum mechanical principles like interference and entanglement.',
    beginnerNote: 'Classical data is like printed text on paper. Quantum data is like waves on water that can add together or cancel each other out.',
    icon: Layers
  },
  {
    id: 'physical-substrate',
    category: 'physics',
    dimension: 'Physical Substrate',
    classicalShort: 'Voltage / current states',
    qubitShort: 'Quantum states (spin, photon, trapped ion)',
    classicalFull: 'Uses voltage/current states',
    qubitFull: 'Uses quantum states',
    explanation: 'Classical bits are physically represented by macroscopic electrical signals in silicon transistors (e.g. 0V for logical 0, +3.3V for logical 1). Qubits are realized via isolated subatomic systems, such as electron spin (up/down) or superconducting Josephson junction energy levels.',
    beginnerNote: 'Classical switches contain billions of electrons moving together. A qubit can be a single trapped atom or photon.',
    icon: Zap
  },
  {
    id: 'observation-state',
    category: 'physics',
    dimension: 'State Before Observation',
    classicalShort: 'Deterministic before measurement',
    qubitShort: 'Probabilistic measurement',
    classicalFull: 'Deterministic before measurement',
    qubitFull: 'Probabilistic measurement',
    explanation: 'A classical bit always has a single definite value whether anyone looks at it or not. A qubit in superposition does not hold a predetermined single outcome; the outcome of measurement is fundamentally probabilistic governed by Born\'s rule (P(0) = |α|², P(1) = |β|²).',
    beginnerNote: 'In the classical world, the outcome is already decided inside the computer. In quantum computing, nature picks an outcome according to exact probability laws upon measurement.',
    icon: Shuffle
  },
  {
    id: 'entanglement',
    category: 'physics',
    dimension: 'Entanglement & Correlation',
    classicalShort: 'Cannot be entangled',
    qubitShort: 'Can be entangled',
    classicalFull: 'Cannot be entangled',
    qubitFull: 'Can be entangled',
    explanation: 'Two classical bits can be correlated (like two synchronized clocks), but quantum systems can share entangled states that cannot be represented as independent states of each qubit. Measuring one instantly dictates the state of the other across any distance.',
    beginnerNote: 'Imagine two magical coins: no matter how far apart you take them, whenever one lands heads, the other is guaranteed to land tails instantaneously.',
    icon: Atom
  },
  {
    id: 'operations-gates',
    category: 'operations',
    dimension: 'Logical Operations',
    classicalShort: 'Classical logic gates',
    qubitShort: 'Quantum gates (Unitary operators)',
    classicalFull: 'Classical logic gates',
    qubitFull: 'Quantum gates',
    explanation: 'Classical logic gates (AND, OR, NOT, NAND) perform boolean algebraic manipulations and are often irreversible (losing information and dissipating heat). Quantum gates are unitary transformations that perform reversible rotations on the state vector.',
    beginnerNote: 'Classical gates calculate by combining wires. Quantum gates rotate probability amplitudes smoothly on the surface of the Bloch sphere.',
    icon: Cpu
  },
  {
    id: 'copying-duplication',
    category: 'operations',
    dimension: 'Copying / Duplication',
    classicalShort: 'Copying is possible',
    qubitShort: 'Arbitrary unknown quantum state cannot be copied',
    classicalFull: 'Copying is possible',
    qubitFull: 'Arbitrary unknown quantum state cannot be copied',
    explanation: 'Classical bits can be copied infinitely with 100% precision (Ctrl+C / Ctrl+V). In contrast, the No-Cloning Theorem mathematically proves that it is impossible to create an identical copy of an arbitrary unknown quantum state without destroying the original.',
    beginnerNote: 'You can duplicate any file on your laptop easily. But you cannot duplicate an unknown quantum secret without corrupting it!',
    icon: ShieldAlert
  },
  {
    id: 'measurement-effect',
    category: 'measurement',
    dimension: 'Effect of Measurement',
    classicalShort: 'Doesn\'t fundamentally alter stored bit',
    qubitShort: 'Measurement collapses the quantum state',
    classicalFull: 'Measurement generally doesn\'t fundamentally alter a stored bit',
    qubitFull: 'Measurement collapses the quantum state',
    explanation: 'Measuring voltage across a classical memory capacitor reads the bit without changing its value. Measuring a qubit irreversibly forces its superposition to collapse into one of the basis states (|0⟩ or |1⟩), wiping out the relative phase.',
    beginnerNote: 'Reading a classical book page doesn\'t alter the ink. But observing a quantum state is an active disturbance that collapses it into a single definite result.',
    icon: Eye
  }
];

export const BitVsQubitComparison: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'all' | 'step'>('all');

  // Classical Bit Interactive Sandbox State
  const [bitValue, setBitValue] = useState<0 | 1>(0);
  const [bitSwitchCount, setBitSwitchCount] = useState<number>(0);

  // Quantum Qubit Interactive Sandbox State (for live contrast)
  const [qubitTheta, setQubitTheta] = useState<number>(Math.PI / 2); // default equal superposition |+>

  // GSAP animation refs
  const bitCardRef = useRef<HTMLDivElement>(null);
  const bitValueRef = useRef<HTMLDivElement>(null);
  const voltageBarRef = useRef<HTMLDivElement>(null);
  const explanationBoxRef = useRef<HTMLDivElement>(null);
  const comparisonRowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Toggle Classical Bit with GSAP Animation
  const handleToggleBit = () => {
    const nextVal = bitValue === 0 ? 1 : 0;
    setBitValue(nextVal);
    setBitSwitchCount(prev => prev + 1);

    // GSAP 3D Flip & Bounce Transition
    if (bitCardRef.current) {
      gsap.killTweensOf(bitCardRef.current);
      gsap.fromTo(
        bitCardRef.current,
        { rotateY: 0, scale: 0.95 },
        {
          rotateY: 180,
          scale: 1,
          duration: 0.45,
          ease: 'back.out(1.8)',
          clearProps: 'rotateY,scale'
        }
      );
    }

    if (bitValueRef.current) {
      gsap.fromTo(
        bitValueRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    }

    if (voltageBarRef.current) {
      gsap.to(voltageBarRef.current, {
        width: nextVal === 1 ? '100%' : '5%',
        duration: 0.3,
        ease: 'power2.inOut'
      });
    }
  };

  // Trigger GSAP transition when comparison item changes
  const handleSelectComparison = (index: number) => {
    setSelectedIndex(index);
    if (explanationBoxRef.current) {
      gsap.fromTo(
        explanationBoxRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  };

  const selectedItem = COMPARISON_DATA[selectedIndex];

  // Calculate live qubit amplitudes based on theta
  const alpha = Math.cos(qubitTheta / 2);
  const beta = Math.sin(qubitTheta / 2);
  const prob0 = Math.round(alpha * alpha * 100);
  const prob1 = Math.round(beta * beta * 100);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      margin: '8px 0 24px 0'
    }}>
      {/* SECTION HEADER — STYLED WITH TEMPLATE PRESENTATION AESTHETIC */}
      <div style={{
        background: 'linear-gradient(135deg, #EBF3FC 0%, #F0F7FF 50%, #E2EFFD 100%)',
        borderRadius: '16px',
        border: '1px solid #BFDBFE',
        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
        position: 'relative',
        overflow: 'hidden'
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
            quantum-curriculum://bit-vs-qubit
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ width: '14px', height: '6px', borderRadius: '2px', background: '#94A3B8' }} />
            <div style={{ width: '14px', height: '6px', borderRadius: '2px', background: '#94A3B8' }} />
          </div>
        </div>

        <div style={{ padding: '28px', position: 'relative' }}>
          {/* Subtle Grid Effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none'
          }} />

          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px', position: 'relative', zIndex: 2 }}>
            <span className="coral-pill-badge" style={{ fontSize: '12px', padding: '5px 14px' }}>
              <Zap size={13} color="#FFFFFF" />
              March 2025 • Quantum Foundations
            </span>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#2563EB'
            }}>
              Interactive Architectural Comparison
            </span>
          </div>

          <h2 className="editorial-title" style={{
            margin: '0 0 10px 0',
            fontSize: '36px',
            fontWeight: 800,
            color: '#1E3A8A',
            lineHeight: 1.15,
            position: 'relative',
            zIndex: 2
          }}>
            Bit vs Qubit
          </h2>

          <p style={{
            margin: 0,
            fontSize: '16px',
            color: '#2563EB',
            fontStyle: 'italic',
            lineHeight: '1.5',
            maxWidth: '680px',
            fontWeight: 600,
            position: 'relative',
            zIndex: 2
          }}>
            "Classical computers store information as bits. Quantum computers encode information using quantum states."
          </p>

          {/* Mode Toggle Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px',
            position: 'relative',
            zIndex: 2
          }}>
            <button
              onClick={() => setActiveTab('all')}
              className="card-lift"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTab === 'all' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                background: activeTab === 'all' ? '#1E3A8A' : '#FFFFFF',
                color: activeTab === 'all' ? '#FFFFFF' : '#334155'
              }}
            >
              Full Comparison Matrix
            </button>
            <button
              onClick={() => setActiveTab('step')}
              className="card-lift"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTab === 'step' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                background: activeTab === 'step' ? '#1E3A8A' : '#FFFFFF',
                color: activeTab === 'step' ? '#FFFFFF' : '#334155'
              }}
            >
              Step-by-Step Walkthrough
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: INTERACTIVE BIT VISUALIZATION (with Qubit Live Counterpart) */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: bitValue === 1 ? '#10B981' : '#64748B'
            }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Interactive Sandbox: Classical Bit vs Quantum State
            </h3>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Toggle to observe physical state determinism
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '20px'
        }}>
          {/* LEFT: CLASSICAL BIT VISUALIZATION */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#0284C7',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Binary size={14} />
              <span>CLASSICAL BIT (MACROSCOPIC SWITCH)</span>
            </div>

            {/* ASCII / BOX STYLE CONTAINER FROM SPECIFICATION */}
            <div
              ref={bitCardRef}
              style={{
                width: '140px',
                height: '140px',
                background: bitValue === 1 ? '#0F172A' : '#FFFFFF',
                border: bitValue === 1 ? '3px solid #0284C7' : '3px solid #94A3B8',
                borderRadius: '12px',
                boxShadow: bitValue === 1
                  ? '0 8px 24px rgba(2, 132, 199, 0.25)'
                  : '0 4px 12px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'border-color 0.2s, background-color 0.2s',
                position: 'relative'
              }}
              onClick={handleToggleBit}
              title="Click to toggle classical bit"
            >
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '8px',
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: bitValue === 1 ? '#38BDF8' : '#94A3B8'
              }}>
                BIT
              </div>

              <div
                ref={bitValueRef}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '56px',
                  fontWeight: 800,
                  color: bitValue === 1 ? '#FFFFFF' : '#0F172A',
                  lineHeight: '1'
                }}
              >
                {bitValue}
              </div>

              <div style={{
                position: 'absolute',
                bottom: '8px',
                fontSize: '10.5px',
                fontWeight: 600,
                color: bitValue === 1 ? '#38BDF8' : '#64748B'
              }}>
                {bitValue === 1 ? 'HIGH (3.3V)' : 'LOW (0.0V)'}
              </div>
            </div>

            {/* TOGGLE BUTTON 0 <-> 1 */}
            <button
              onClick={handleToggleBit}
              style={{
                marginTop: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
                transition: 'transform 0.1s ease'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <RefreshCw size={14} />
              <span>Toggle: 0 ↔ 1</span>
            </button>

            {/* VOLTAGE LEVEL METER */}
            <div style={{ width: '100%', marginTop: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#64748B',
                marginBottom: '4px',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                <span>Transistor State</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  {bitValue === 1 ? 'Conducting (1)' : 'Cutoff (0)'}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#E2E8F0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  ref={voltageBarRef}
                  style={{
                    width: bitValue === 1 ? '100%' : '5%',
                    height: '100%',
                    background: bitValue === 1 ? '#0284C7' : '#94A3B8',
                    transition: 'background 0.2s'
                  }}
                />
              </div>
            </div>

            {/* LIVE EXPLANATION OF CURRENT STATE */}
            <div style={{
              marginTop: '14px',
              padding: '10px 12px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '12px',
              lineHeight: '1.5',
              color: '#334155',
              width: '100%',
              textAlign: 'center'
            }}>
              <strong>Definite Logical State: {bitValue}</strong>.
              {bitValue === 0
                ? ' Switch is OPEN. Zero voltage. It is definitively 0 with 0% ambiguity.'
                : ' Switch is CLOSED. Voltage saturated. It is definitively 1 with 0% ambiguity.'}
            </div>
          </div>

          {/* RIGHT: QUBIT SUPERPOSITION CONTRAST VISUALIZATION */}
          <div style={{
            background: '#FAF5FF',
            border: '1px solid #E9D5FF',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#7C3AED',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Atom size={14} />
              <span>QUBIT (QUANTUM STATE VECTOR)</span>
            </div>

            {/* QUBIT STATE CARD */}
            <div style={{
              width: '140px',
              height: '140px',
              background: '#FFFFFF',
              border: '3px solid #8B5CF6',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '8px',
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: '#7C3AED'
              }}>
                QUBIT |ψ⟩
              </div>

              {/* Dynamic Superposition Wave / Ket Symbol */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '22px',
                fontWeight: 700,
                color: '#0F172A',
                textAlign: 'center',
                padding: '4px'
              }}>
                {prob0 === 100
                  ? '|0⟩'
                  : prob1 === 100
                    ? '|1⟩'
                    : `${alpha.toFixed(2)}|0⟩ + ${beta.toFixed(2)}|1⟩`}
              </div>

              <div style={{
                position: 'absolute',
                bottom: '8px',
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#7C3AED'
              }}>
                {prob0 === 100
                  ? 'Pure Ground'
                  : prob1 === 100
                    ? 'Pure Excited'
                    : 'Superposition'}
              </div>
            </div>

            {/* SUPERPOSITION ANGLE SLIDER */}
            <div style={{ width: '100%', marginTop: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#64748B',
                marginBottom: '4px',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                <span>Superposition θ: {(qubitTheta / Math.PI).toFixed(2)}π</span>
                <span style={{ fontWeight: 600, color: '#7C3AED' }}>
                  P(0)={prob0}% | P(1)={prob1}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.01"
                value={qubitTheta}
                onChange={e => setQubitTheta(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#7C3AED',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '6px',
                gap: '6px'
              }}>
                <button
                  onClick={() => setQubitTheta(0)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '10.5px',
                    fontFamily: "'JetBrains Mono', monospace",
                    borderRadius: '4px',
                    border: '1px solid #E9D5FF',
                    background: qubitTheta === 0 ? '#7C3AED' : '#FFFFFF',
                    color: qubitTheta === 0 ? '#FFFFFF' : '#6B21A8',
                    cursor: 'pointer'
                  }}
                >
                  |0⟩
                </button>
                <button
                  onClick={() => setQubitTheta(Math.PI / 2)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '10.5px',
                    fontFamily: "'JetBrains Mono', monospace",
                    borderRadius: '4px',
                    border: '1px solid #E9D5FF',
                    background: Math.abs(qubitTheta - Math.PI / 2) < 0.05 ? '#7C3AED' : '#FFFFFF',
                    color: Math.abs(qubitTheta - Math.PI / 2) < 0.05 ? '#FFFFFF' : '#6B21A8',
                    cursor: 'pointer'
                  }}
                >
                  |+⟩ (50/50)
                </button>
                <button
                  onClick={() => setQubitTheta(Math.PI)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '10.5px',
                    fontFamily: "'JetBrains Mono', monospace",
                    borderRadius: '4px',
                    border: '1px solid #E9D5FF',
                    background: qubitTheta === Math.PI ? '#7C3AED' : '#FFFFFF',
                    color: qubitTheta === Math.PI ? '#FFFFFF' : '#6B21A8',
                    cursor: 'pointer'
                  }}
                >
                  |1⟩
                </button>
              </div>
            </div>

            {/* LIVE EXPLANATION OF CURRENT QUBIT STATE */}
            <div style={{
              marginTop: '14px',
              padding: '10px 12px',
              background: '#FFFFFF',
              border: '1px solid #E9D5FF',
              borderRadius: '6px',
              fontSize: '12px',
              lineHeight: '1.5',
              color: '#334155',
              width: '100%',
              textAlign: 'center'
            }}>
              <strong>Simultaneous Linear Combination</strong>.
              The qubit does not have to choose 0 or 1 before measurement. It holds both complex probability amplitudes simultaneously!
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: ANIMATED SIDE-BY-SIDE INTERACTIVE COMPARISON MATRIX */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
              Side-by-Side Comparison Matrix
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Click or hover any dimension to inspect the underlying quantum physics vs classical architecture.
            </p>
          </div>

          {/* Stepper controls if in step-by-step mode */}
          {activeTab === 'step' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => handleSelectComparison(Math.max(0, selectedIndex - 1))}
                disabled={selectedIndex === 0}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  cursor: selectedIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: selectedIndex === 0 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <ArrowLeft size={14} />
                <span>Prev</span>
              </button>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                {selectedIndex + 1} / {COMPARISON_DATA.length}
              </span>
              <button
                onClick={() => handleSelectComparison(Math.min(COMPARISON_DATA.length - 1, selectedIndex + 1))}
                disabled={selectedIndex === COMPARISON_DATA.length - 1}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  cursor: selectedIndex === COMPARISON_DATA.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: selectedIndex === COMPARISON_DATA.length - 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <span>Next</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* COLUMN HEADERS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(140px, 1.2fr) 40px minmax(140px, 1.2fr)',
          gap: '12px',
          alignItems: 'center',
          padding: '10px 16px',
          background: '#F8FAFC',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#0284C7',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Binary size={14} />
            <span>CLASSICAL BIT</span>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
            VS
          </div>

          <div style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#7C3AED',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Atom size={14} />
            <span>QUBIT</span>
          </div>
        </div>

        {/* COMPARISON ITEMS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {COMPARISON_DATA.map((item, index) => {
            const isSelected = selectedIndex === index;
            const ItemIcon = item.icon;

            // In step mode, show current or allow browsing
            if (activeTab === 'step' && !isSelected) {
              return null;
            }

            return (
              <div
                key={item.id}
                ref={el => {
                  comparisonRowRefs.current[index] = el;
                }}
                onClick={() => handleSelectComparison(index)}
                onMouseEnter={() => handleSelectComparison(index)}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #0F172A' : '1px solid #E2E8F0',
                  borderRadius: '10px',
                  background: isSelected ? '#F8FAFC' : '#FFFFFF',
                  boxShadow: isSelected
                    ? '0 6px 18px rgba(15, 23, 42, 0.08)'
                    : '0 1px 3px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                {/* DIMENSION BADGE BAR */}
                <div style={{
                  padding: '6px 16px',
                  background: isSelected ? '#0F172A' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ItemIcon size={13} color={isSelected ? '#38BDF8' : '#64748B'} />
                    <span>{item.dimension}</span>
                  </div>
                  {isSelected && (
                    <span style={{
                      fontSize: '10px',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      Active Comparison
                    </span>
                  )}
                </div>

                {/* SIDE BY SIDE CARD VALUES */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(140px, 1.2fr) 40px minmax(140px, 1.2fr)',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '16px'
                }}>
                  {/* LEFT: CLASSICAL BIT */}
                  <div style={{
                    padding: '12px 14px',
                    background: isSelected ? '#E0F2FE' : '#F8FAFC',
                    border: isSelected ? '1px solid #BAE6FD' : '1px solid #F1F5F9',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      fontSize: '13.5px',
                      fontWeight: 650,
                      color: isSelected ? '#0369A1' : '#1E293B',
                      lineHeight: '1.4'
                    }}>
                      {item.classicalFull}
                    </div>
                  </div>

                  {/* CENTER CONNECTOR / ARROWS */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '2px',
                      height: '14px',
                      background: isSelected ? '#0F172A' : '#CBD5E1'
                    }} />
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: isSelected ? '#0F172A' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#64748B',
                      fontSize: '10px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ⚡
                    </div>
                    <div style={{
                      width: '2px',
                      height: '14px',
                      background: isSelected ? '#0F172A' : '#CBD5E1'
                    }} />
                  </div>

                  {/* RIGHT: QUBIT */}
                  <div style={{
                    padding: '12px 14px',
                    background: isSelected ? '#F3E8FF' : '#FAF5FF',
                    border: isSelected ? '1px solid #DDD6FE' : '1px solid #F3E8FF',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      fontSize: '13.5px',
                      fontWeight: 650,
                      color: isSelected ? '#6D28D9' : '#3B0764',
                      lineHeight: '1.4'
                    }}>
                      {item.qubitFull}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DETAILED EXPLANATION & BEGINNER INSIGHT CARD FOR SELECTED COMPARISON */}
        <div
          ref={explanationBoxRef}
          style={{
            marginTop: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#0F172A'
            }}>
              <Info size={16} color="#0284C7" />
              <span>In-Depth Explanation: {selectedItem.dimension}</span>
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748B',
              background: '#FFFFFF',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #E2E8F0'
            }}>
              {selectedItem.category.toUpperCase()}
            </div>
          </div>

          <p style={{
            margin: '0 0 12px 0',
            fontSize: '14.5px',
            lineHeight: '1.65',
            color: '#1E293B'
          }}>
            {selectedItem.explanation}
          </p>

          <div style={{
            padding: '10px 14px',
            background: '#FFFFFF',
            borderRadius: '8px',
            borderLeft: '4px solid #7C3AED',
            borderTop: '1px solid #E2E8F0',
            borderRight: '1px solid #E2E8F0',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Sparkles size={16} color="#7C3AED" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', lineHeight: '1.55', color: '#4C1D95' }}>
              <strong>Beginner Intuition:</strong> {selectedItem.beginnerNote}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
