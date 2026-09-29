// src/components/teleportation/TeleportationHero3D.tsx
import React, { useState, useEffect } from 'react';
import { Radio, Zap, Shield, Cpu, Info, ArrowRight } from 'lucide-react';

export const TeleportationHero3D: React.FC = () => {
  const [packetProgress, setPacketProgress] = useState<number>(0);
  const [pulsePhase, setPulsePhase] = useState<number>(0);
  const [activeChannel, setActiveChannel] = useState<'both' | 'quantum' | 'classical'>('both');

  useEffect(() => {
    const interval = setInterval(() => {
      setPacketProgress(prev => (prev + 1.2) % 100);
      setPulsePhase(prev => (prev + 0.05) % (Math.PI * 2));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const waveOffset = Math.sin(pulsePhase) * 8;

  return (
    <div style={{
      background: 'radial-gradient(ellipse at 50% 20%, #172554 0%, #0F172A 70%, #020617 100%)',
      borderRadius: '16px',
      border: '1px solid #2563EB',
      boxShadow: '0 16px 40px -10px rgba(15, 23, 42, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      color: '#F8FAFC',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Template-inspired Browser Chrome Mockup Top Bar */}
      <div style={{
        height: '36px',
        background: 'rgba(30, 41, 59, 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'relative',
        zIndex: 3
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
        </div>

        <div style={{
          width: '240px',
          height: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '9999px',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10.5px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#94A3B8'
        }}>
          quantum://teleportation/alice-bob-channel
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ width: '14px', height: '6px', borderRadius: '2px', background: '#475569' }} />
          <div style={{ width: '14px', height: '6px', borderRadius: '2px', background: '#475569' }} />
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Background ambient grid from template */}
        <div style={{
          position: 'absolute',
          top: '36px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(to right, rgba(56, 189, 248, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none'
        }} />

        {/* Header / Badges with template coral pill */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="coral-pill-badge" style={{ fontSize: '12px', padding: '5px 14px' }}>
              <Zap size={13} color="#FFFFFF" />
              Final Project • Quantum Teleportation
            </span>
            <span style={{
              fontSize: '12.5px',
              color: '#93C5FD',
              fontWeight: 500
            }}>
              Distant Quantum Systems: Alice → Quantum Channel → Bob
            </span>
          </div>

        {/* Channel Filter Toggles */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '2px'
        }}>
          <button
            onClick={() => setActiveChannel('both')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeChannel === 'both' ? '#4F46E5' : 'transparent',
              color: activeChannel === 'both' ? '#FFF' : '#94A3B8'
            }}
          >
            Show Dual Channels
          </button>
          <button
            onClick={() => setActiveChannel('quantum')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeChannel === 'quantum' ? '#06B6D4' : 'transparent',
              color: activeChannel === 'quantum' ? '#FFF' : '#94A3B8'
            }}
          >
            Entangled Pair Only
          </button>
          <button
            onClick={() => setActiveChannel('classical')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeChannel === 'classical' ? '#F59E0B' : 'transparent',
              color: activeChannel === 'classical' ? '#FFF' : '#94A3B8'
            }}
          >
            Classical Link Only
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div style={{
        position: 'relative',
        minHeight: '260px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 2
      }}>
        {/* SVG Drawing for Channels and Connections */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <defs>
            <linearGradient id="quantumGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="1" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="classicalLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Classical Communication Channel (Top Arc) */}
          {(activeChannel === 'both' || activeChannel === 'classical') && (
            <g>
              <path
                d={`M 170 70 Q 50% 15, calc(100% - 170px) 70`}
                fill="none"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeDasharray="6,4"
                strokeOpacity="0.7"
              />
              {/* Traveling classical bits packet */}
              <circle
                cx={`calc(170px + (100% - 340px) * ${packetProgress / 100})`}
                cy={`${70 - Math.sin((packetProgress / 100) * Math.PI) * 45}`}
                r="6"
                fill="#FBBF24"
                filter="url(#glowEffect)"
              />
              {/* Classical label */}
              <text
                x="50%"
                y="35"
                textAnchor="middle"
                fill="#FCD34D"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.05em"
              >
                CLASSICAL CHANNEL: 2 BITS (m₀, m₁) • SPEED ≤ c
              </text>
            </g>
          )}

          {/* 2. Quantum Entanglement Correlation Channel (Center Wavy Line) */}
          {(activeChannel === 'both' || activeChannel === 'quantum') && (
            <g>
              {/* Entanglement Wave Path */}
              <path
                d={`M 170 145 Q 35% ${145 + waveOffset}, 50% 145 T calc(100% - 170px) 145`}
                fill="none"
                stroke="url(#quantumGlow)"
                strokeWidth="3.5"
                filter="url(#glowEffect)"
              />
              <path
                d={`M 170 145 Q 35% ${145 - waveOffset}, 50% 145 T calc(100% - 170px) 145`}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="1.5"
                strokeOpacity="0.6"
              />
              {/* Entangled Bell Pair Nodes in Channel */}
              <circle
                cx={`calc(170px + (100% - 340px) * 0.35)`}
                cy={145 + waveOffset}
                r="5"
                fill="#A5B4FC"
              />
              <circle
                cx={`calc(170px + (100% - 340px) * 0.65)`}
                cy={145 - waveOffset}
                r="5"
                fill="#6EE7B7"
              />
              {/* Correlation label */}
              <text
                x="50%"
                y="175"
                textAnchor="middle"
                fill="#67E8F9"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.05em"
              >
                SHARED ENTANGLED BELL PAIR: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
              </text>
              <text
                x="50%"
                y="192"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10"
              >
                (Pure Quantum Correlation — NOT a Physical Matter Pipe)
              </text>
            </g>
          )}
        </svg>

        {/* ALICE NODE (LEFT) */}
        <div
          className="floating-element"
          style={{
            width: '180px',
            background: 'rgba(30, 27, 75, 0.85)',
            border: '2px solid #6366F1',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            zIndex: 3
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px #6366F1'
          }}>
            <Cpu size={22} color="#FFFFFF" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Sender Station
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
              ALICE
            </div>
          </div>

          <div style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '11px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0' }}>
              <span>Unknown State:</span>
              <strong style={{ color: '#38BDF8' }}>|ψ⟩ (q₀)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0' }}>
              <span>Entangled Qubit:</span>
              <strong style={{ color: '#818CF8' }}>q₁</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', borderTop: '1px solid #334155', paddingTop: '4px', marginTop: '2px' }}>
              <span>Bell Measurement:</span>
              <strong style={{ color: '#FBBF24' }}>m₀, m₁</strong>
            </div>
          </div>
        </div>

        {/* CENTRAL QUANTUM REPEAT / CORRELATION BADGE */}
        <div
          className="floating-pulse"
          style={{
            zIndex: 3,
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #0E7490',
            borderRadius: '24px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.2)'
          }}
        >
          <Radio size={14} color="#06B6D4" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#67E8F9' }}>
            Non-Local Quantum Correlation
          </span>
        </div>

        {/* BOB NODE (RIGHT) */}
        <div
          className="floating-element-slow"
          style={{
            width: '180px',
            background: 'rgba(6, 78, 59, 0.4)',
            border: '2px solid #10B981',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            zIndex: 3
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px #10B981'
          }}>
            <Shield size={22} color="#FFFFFF" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Receiver Station
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
              BOB
            </div>
          </div>

          <div style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '11px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0' }}>
              <span>Entangled Partner:</span>
              <strong style={{ color: '#10B981' }}>q₂</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0' }}>
              <span>Correction Ops:</span>
              <strong style={{ color: '#FBBF24' }}>Xᵐ¹ · Zᵐ⁰</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', borderTop: '1px solid #334155', paddingTop: '4px', marginTop: '2px' }}>
              <span>Target Recovered:</span>
              <strong style={{ color: '#34D399' }}>|ψ⟩ ✓</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Scientific Clarification Box */}
      <div style={{
        marginTop: '20px',
        padding: '12px 18px',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid #4338CA',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} color="#818CF8" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.5 }}>
            <strong style={{ color: '#F8FAFC' }}>Scientific Fact:</strong> Quantum teleportation does{' '}
            <span style={{ color: '#F87171', fontWeight: 700 }}>NOT</span> move physical matter or energy. It faithfully transfers the{' '}
            <span style={{ color: '#38BDF8', fontWeight: 700 }}>quantum information</span> (superposition coefficients $\alpha$ and $\beta$) of an unknown state to Bob's particle using entanglement and 2 classical bits.
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#A5B4FC',
          background: 'rgba(79, 70, 229, 0.25)',
          padding: '4px 10px',
          borderRadius: '6px'
        }}>
          <span>Speed bounded by $c$</span>
          <ArrowRight size={12} />
        </div>
      </div>
    </div>
    </div>
  );
};
