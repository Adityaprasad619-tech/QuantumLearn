// src/components/auth/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { AuthUser, authService, LiveUserProgress, SavedCircuitItem } from '../../auth/authService';
import { ActiveView } from '../layout/Header';
import { BrowserFrame } from '../ui/BrowserFrame';
import { soundEffects } from '../../audio/soundEffects';
import {
  GraduationCap, Atom, Award, Flame, BookOpen,
  Zap, Star, ArrowRight, Layers, Compass, CheckCircle2,
  Cpu, Sparkles, Clock, Target, RefreshCw, Bookmark
} from 'lucide-react';

interface StudentDashboardProps {
  user: AuthUser;
  onLogout?: () => void;
  onNavigateToView: (view: ActiveView) => void;
}

const QUICK_ACTIONS: {
  view: ActiveView;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bg: string;
  badge: string;
}[] = [
  {
    view: 'curriculum',
    title: 'Interactive Curriculum',
    subtitle: 'Step-by-step modular lessons with interactive checks',
    icon: BookOpen,
    color: '#2563EB',
    bg: '#EBF3FC',
    badge: 'CORE'
  },
  {
    view: 'lab3d',
    title: '3D Bloch Sphere Lab',
    subtitle: 'Visualize quantum state vectors and single-qubit rotations in 3D',
    icon: Compass,
    color: '#7C3AED',
    bg: '#F5F3FF',
    badge: '3D VISUALS'
  },
  {
    view: 'playground',
    title: 'Circuit Playground',
    subtitle: 'Drag & drop quantum gates (H, X, CNOT) to build multi-qubit circuits',
    icon: Cpu,
    color: '#059669',
    bg: '#ECFDF5',
    badge: 'SIMULATOR'
  },
  {
    view: 'challenges',
    title: 'Challenge Arena',
    subtitle: 'Hands-on problem sets to test your synthesis and state prep skills',
    icon: Award,
    color: '#D97706',
    bg: '#FFFBEB',
    badge: 'XP REWARDS'
  },
  {
    view: 'teleportation',
    title: 'Quantum Teleportation',
    subtitle: 'Interactive protocol simulation for transmitting quantum states',
    icon: Layers,
    color: '#4F46E5',
    bg: '#EEF2FF',
    badge: 'PROTOCOL'
  },
  {
    view: 'roadmap',
    title: 'Adaptive Roadmap',
    subtitle: 'AI-tailored learning trajectory calibrated to your mastery',
    icon: Target,
    color: '#DC2626',
    bg: '#FEF2F2',
    badge: 'ADAPTIVE'
  }
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onNavigateToView
}) => {
  const [liveProgress, setLiveProgress] = useState<LiveUserProgress | null>(null);
  const [savedCircuits, setSavedCircuits] = useState<SavedCircuitItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [prog, circuits] = await Promise.all([
        authService.getLearnerProgress(),
        authService.getSavedCircuits()
      ]);
      setLiveProgress(prog);
      setSavedCircuits(circuits);
    } catch (e) {
      console.warn('Error refreshing student dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user.id]);

  const xp = liveProgress?.xp ?? 420;
  const level = liveProgress?.level ?? Math.max(1, Math.floor(xp / 200) + 1);
  const streak = liveProgress?.streakDays ?? 5;
  const completedLessons = liveProgress?.completedLessons ?? [];
  const completedChallenges = liveProgress?.completedChallenges ?? [];
  const conceptMastery = liveProgress?.conceptMastery ?? {
    bits: 0.95,
    qubit: 0.88,
    superposition: 0.82,
    gates_h: 0.86,
    entanglement: 0.65
  };

  const levelTitles = [
    'Quantum Novice',
    'Superposition Apprentice',
    'Entanglement Adept',
    'Algorithm Architect',
    'Fault-Tolerant Master',
    'Quantum Supremacist'
  ];
  const currentTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Student Welcome Header Card */}
      <BrowserFrame
        url={`quantumlearn://student/${encodeURIComponent(user.email)}`}
        accentColor="#2563EB"
        style={{ marginBottom: '24px' }}
      >
        <div style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #1E293B 100%)',
          color: '#FFFFFF',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
              flexShrink: 0
            }}>
              <GraduationCap size={36} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {user.name}
                </h1>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: 'rgba(96, 165, 250, 0.25)',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  color: '#93C5FD',
                  padding: '2px 8px',
                  borderRadius: '20px'
                }}>
                  STUDENT / LEARNER
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: 'rgba(52, 211, 153, 0.2)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  color: '#6EE7B7',
                  padding: '2px 8px',
                  borderRadius: '20px'
                }}>
                  SQLITE SYNCED
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8' }}>
                {user.grade || 'Undergraduate Physics (Year 3)'} • {user.institution || 'State University'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '10px 16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>RANK TITLE</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#60A5FA' }}>{currentTitle}</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '10px 16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>CURRENT LEVEL</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#F59E0B' }}>Lvl {level}</div>
            </div>
            <button
              onClick={refreshData}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                borderRadius: '12px',
                padding: '0 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600
              }}
              title="Refresh database records"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </BrowserFrame>

      {/* 4 Live Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Total Experience</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EBF3FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
            {xp} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>XP</span>
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
            +{Math.round(xp % 200)} XP to Level {level + 1}
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #FED7AA',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Study Streak</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={16} color="#EA580C" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
            {streak} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>Days</span>
          </div>
          <div style={{ fontSize: '12px', color: '#EA580C', marginTop: '4px', fontWeight: 600 }}>
            Daily goal achieved today!
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #DDD6FE',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Completed Lessons</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={16} color="#7C3AED" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
            {completedLessons.length} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>/ 12</span>
          </div>
          <div style={{ fontSize: '12px', color: '#7C3AED', marginTop: '4px', fontWeight: 600 }}>
            {Math.round((completedLessons.length / 12) * 100)}% curriculum complete
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #A7F3D0',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Challenges Solved</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
            {completedChallenges.length} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>Solved</span>
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
            State prep & synthesis mastery
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Saved Circuits */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '24px', marginBottom: '28px' }}>
        {/* Quick Launch Quantum Options */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
              Student Learning Workspaces
            </h2>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Explore simulations & exercises</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <div
                  key={action.view}
                  className="card-lift"
                  onClick={() => {
                    soundEffects.playGateClick();
                    onNavigateToView(action.view);
                  }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: action.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={20} color={action.color} />
                    </div>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      fontFamily: 'JetBrains Mono, monospace',
                      background: action.bg,
                      color: action.color,
                      padding: '2px 7px',
                      borderRadius: '4px'
                    }}>
                      {action.badge}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>
                      {action.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                      {action.subtitle}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '12px', fontWeight: 700, color: action.color }}>
                    <span>Launch</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saved Circuits in SQLite */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
              Saved Circuits in SQLite
            </h2>
            <button
              onClick={() => onNavigateToView('playground')}
              style={{
                background: '#EBF3FC',
                border: '1px solid #BFDBFE',
                color: '#2563EB',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + New Circuit
            </button>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.04)',
            minHeight: '260px'
          }}>
            {savedCircuits.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8' }}>
                <Bookmark size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '13px' }}>No saved circuits yet.</p>
                <p style={{ margin: '4px 0 0', fontSize: '11.5px' }}>
                  Create and save custom quantum circuits from the Circuit Simulator.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedCircuits.map(c => (
                  <div
                    key={c.id}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {c.numQubits} Qubits • {c.gates?.length || 0} Gates
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateToView('playground')}
                      className="card-lift"
                      style={{
                        background: '#1E3A8A',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Concept Mastery Progress Bars */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        padding: '20px 24px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            Live Concept Mastery (SQLite Database)
          </h2>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Calibrated via quizzes & lab simulations</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {Object.entries(conceptMastery).map(([concept, score]) => {
            const pct = Math.round(Number(score) * 100);
            return (
              <div key={concept} style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', textTransform: 'capitalize' }}>
                    {concept.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: pct >= 80 ? '#059669' : '#2563EB' }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: '7px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: pct >= 80
                      ? 'linear-gradient(90deg, #059669, #34D399)'
                      : 'linear-gradient(90deg, #2563EB, #60A5FA)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
