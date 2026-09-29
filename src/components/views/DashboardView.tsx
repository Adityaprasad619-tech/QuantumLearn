// src/components/views/DashboardView.tsx
import React, { useState, useEffect } from 'react';
import { LearnerModelService, AdaptiveRoadmap, ConceptMastery } from '../../learner/learnerModel';
import { UserProgress } from '../../types';
import { soundEffects } from '../../audio/soundEffects';
import { BrowserFrame } from '../ui/BrowserFrame';
import {
  Sparkles, Flame, Target, Trophy, ArrowRight, BookOpen,
  Activity, CheckCircle2, AlertTriangle, Play, Zap, Clock,
  Award, Shield, Layers, Compass, TrendingUp
} from 'lucide-react';

interface DashboardViewProps {
  progress: UserProgress;
  onNavigateToView: (view: any) => void;
  onSelectLesson?: (lessonId: string) => void;
  onAskDirac: (prompt: string) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 100
  unlockedAt?: string;
}

interface RecentSimulation {
  id: string;
  name: string;
  type: string;
  timestamp: string;
  outcome: string;
  targetView: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigateToView,
  onSelectLesson,
  onAskDirac
}) => {
  const [roadmap, setRoadmap] = useState<AdaptiveRoadmap>(LearnerModelService.generateRoadmap());
  const [learnerSummary, setLearnerSummary] = useState<Record<string, number>>(
    LearnerModelService.getMasterySummary()
  );

  useEffect(() => {
    const unsubscribe = LearnerModelService.subscribe(() => {
      setRoadmap(LearnerModelService.generateRoadmap());
      setLearnerSummary(LearnerModelService.getMasterySummary());
    });
    return unsubscribe;
  }, []);

  // Compute Quantum Learning Score (QLS): weighted composite of mastery, XP, streak, and challenges
  const avgMastery = roadmap.overallMasteryPercentage;
  const qlsScore = Math.round(avgMastery * 6.5 + progress.xp * 0.45 + progress.streakDays * 15);

  const levelTitles = [
    'Quantum Novice',
    'Superposition Apprentice',
    'Entanglement Adept',
    'Algorithm Architect',
    'Fault-Tolerant Master',
    'Quantum Supremacist'
  ];
  const currentTitle = levelTitles[Math.min(progress.level - 1, levelTitles.length - 1)];
  const nextLevelXp = progress.level * 200;
  const currentLevelProgress = Math.min(100, Math.round(((progress.xp % 200) / 200) * 100));

  // Achievements List
  const achievements: Achievement[] = [
    {
      id: 'ach-superposition',
      title: 'Wavefunction Pioneer',
      description: 'Created your first equal superposition state on the Bloch Sphere.',
      icon: '✨',
      unlocked: true,
      progress: 100,
      unlockedAt: '2 days ago'
    },
    {
      id: 'ach-bell',
      title: 'Spooky Action Architect',
      description: 'Successfully synthesized the maximally entangled Bell state |Φ+⟩.',
      icon: '🔗',
      unlocked: true,
      progress: 100,
      unlockedAt: 'Yesterday'
    },
    {
      id: 'ach-interference',
      title: 'Phase Alchemist',
      description: 'Constructed a Hadamard sandwich causing 100% destructive interference.',
      icon: '⚡',
      unlocked: true,
      progress: 100,
      unlockedAt: 'Today'
    },
    {
      id: 'ach-qft',
      title: 'Frequency Master',
      description: 'Simulated a 3-qubit Quantum Fourier Transform circuit.',
      icon: '🌊',
      unlocked: false,
      progress: 60
    },
    {
      id: 'ach-shor',
      title: 'RSA Breaker',
      description: 'Factored composite integer 15 using quantum period finding.',
      icon: '🔐',
      unlocked: false,
      progress: 25
    },
    {
      id: 'ach-streak',
      title: 'Coherence Champion',
      description: 'Maintained a 7-day continuous learning streak.',
      icon: '🔥',
      unlocked: false,
      progress: Math.min(100, Math.round((progress.streakDays / 7) * 100))
    }
  ];

  // Recent Laboratory Simulations
  const recentSimulations: RecentSimulation[] = [
    {
      id: 'sim-1',
      name: 'Bell State |Φ+⟩ Synthesis',
      type: 'Circuit Simulation',
      timestamp: '12 mins ago',
      outcome: '50% |00⟩ + 50% |11⟩ (Entangled)',
      targetView: 'playground'
    },
    {
      id: 'sim-2',
      name: 'Hadamard Sandwich (H-Z-H)',
      type: 'Interference Lab',
      timestamp: '1 hour ago',
      outcome: 'Destructive cancellation into |1⟩',
      targetView: 'lab3d'
    },
    {
      id: 'sim-3',
      name: 'QFT 3-Qubit Frequency Clocks',
      type: 'Algorithm Subroutine',
      timestamp: '3 hours ago',
      outcome: 'Uniform phase dispersion 2πj·k/8',
      targetView: 'qft'
    },
    {
      id: 'sim-4',
      name: 'Shor Factoring (N=15, a=7)',
      type: 'Cryptanalysis',
      timestamp: 'Yesterday',
      outcome: 'Extracted period r=4 ⟶ 15 = 3 × 5',
      targetView: 'shor'
    }
  ];

  // Weak Concepts list (from roadmap needsImprovement)
  const weakConcepts = roadmap.needsImprovement;

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '28px 20px 80px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {/* 1. TOP WELCOME HERO IN BROWSER MOCKUP FRAME */}
      <BrowserFrame
        urlPath="quantum-lab://researcher-dashboard"
        badge="March 25, 2025"
        badgeColor="coral"
        gridBackground={true}
        contentStyle={{ padding: '32px' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.6fr) minmax(280px, 1fr)',
          gap: '28px',
          alignItems: 'stretch'
        }}>
          {/* Left Hero Card Content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div>
              {/* Badges Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="coral-pill-badge floating-element">
                  <Flame size={13} />
                  <span>{progress.streakDays}-Day Coherence Streak</span>
                </span>
                <span className="navy-pill-badge">
                  <span>LEVEL {progress.level} • {currentTitle}</span>
                </span>
              </div>

              {/* Editorial Title */}
              <h1 className="editorial-title" style={{
                fontSize: '38px',
                lineHeight: 1.15,
                margin: '14px 0 0 0'
              }}>
                Welcome back, Researcher.
              </h1>

              <p className="editorial-subtitle" style={{
                fontSize: '15px',
                lineHeight: 1.65,
                margin: '10px 0 0 0',
                maxWidth: '620px'
              }}>
                Your quantum coherence is high today. You are making steady progress in quantum linear algebra,
                single-qubit rotations, and statevector transformations.
              </p>
            </div>

            {/* Level Progress Bar */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #CFE2F9',
              borderRadius: '12px',
              padding: '14px 18px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '8px' }}>
                <span style={{ color: '#1E3A8A', fontWeight: 700 }}>Level Progression</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#0F172A', fontWeight: 700 }}>
                  {progress.xp} / {nextLevelXp} XP ({currentLevelProgress}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#E2EEFC', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${currentLevelProgress}%`,
                  background: 'linear-gradient(90deg, #2563EB 0%, #1E3A8A 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Right Metric Card: Quantum Learning Score */}
          <div
            className="floating-pulse"
            style={{
              background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #334155',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Grid Pattern inside card */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Quantum Learning Score
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <Trophy size={18} color="#FBBF24" />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '14px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em', color: '#FFFFFF' }}>
                  {qlsScore}
                </span>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>/ 1000 QLS</span>
              </div>

              <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '6px', lineHeight: 1.5 }}>
                Top <strong style={{ color: '#F8FAFC' }}>12%</strong> of quantum learners worldwide this week.
              </div>
            </div>

            <div style={{
              position: 'relative',
              zIndex: 1,
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Mastery</div>
                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34D399', marginTop: '3px' }}>
                  {avgMastery}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Labs Completed</div>
                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#60A5FA', marginTop: '3px' }}>
                  {progress.completedLessons.length + progress.completedChallenges.length} Total
                </div>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>

      {/* 2. RECOMMENDED NEXT CONCEPT BANNER */}
      {roadmap.nextRecommended && (
        <div
          className="card-lift"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #BFDBFE',
            borderRadius: '16px',
            padding: '22px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '18px',
            boxShadow: '0 4px 18px rgba(37, 99, 235, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#FFF7ED',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid #FED7AA'
            }}>
              <Compass size={24} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Adaptive Learning Recommendation
              </div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                Master {roadmap.nextRecommended.name} (Current: {Math.round(roadmap.nextRecommended.score * 100)}%)
              </div>
              <div style={{ fontSize: '13.5px', color: '#475569', marginTop: '3px' }}>
                Based on your rolling performance profile, strengthening this concept will unlock Grover's search and QFT gating.
              </div>
            </div>
          </div>

          <button
            className="btn-coral-action"
            onClick={() => {
              if (roadmap.nextRecommended?.id === 'entanglement') {
                onNavigateToView('playground');
              } else if (roadmap.nextRecommended?.id === 'measurement') {
                onNavigateToView('lab3d');
              } else {
                onNavigateToView('curriculum');
              }
            }}
          >
            <span>Launch Target Laboratory</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* 3. TWO COLUMN GRID: CONCEPT MASTERY + WEAK CONCEPTS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(360px, 1.5fr) minmax(300px, 1fr)',
        gap: '24px'
      }}>
        {/* Concept Mastery Visual Grid */}
        <div
          className="card-lift"
          style={{
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Knowledge Competency Vector
              </div>
              <h3 className="editorial-title" style={{ fontSize: '20px', margin: '4px 0 0 0' }}>
                Concept Mastery Profile
              </h3>
            </div>

            <button
              onClick={() => onNavigateToView('roadmap')}
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#1E3A8A',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View Full Roadmap</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Mastery Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(learnerSummary).slice(0, 8).map(([key, score]) => {
              const scorePct = Math.round(score * 100);
              const isMastered = score >= 0.70;
              const isNeedsWork = score >= 0.35 && score < 0.70;
              const labelMap: Record<string, string> = {
                bits: 'Classical Bits & Information',
                qubit: 'Qubits & State Vectors',
                gates_x: 'Pauli-X (Bit Flip)',
                gates_h: 'Hadamard Gate (H)',
                gates: 'Unitary Gate Operators',
                superposition: 'Superposition & Interference',
                measurement: 'Born Rule & Collapse',
                entanglement: 'CNOT & Bell Entanglement',
                grover: "Grover's Search Algorithm",
                qft: 'Quantum Fourier Transform',
                shor: "Shor's Factoring Algorithm"
              };
              const label = labelMap[key] || key;

              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{label}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: isMastered ? '#059669' : isNeedsWork ? '#EA580C' : '#64748B'
                    }}>
                      {scorePct}%
                    </span>
                  </div>
                  <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${scorePct}%`,
                      background: isMastered ? '#059669' : isNeedsWork ? 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)' : '#94A3B8',
                      transition: 'width 0.4s ease',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Concepts Diagnosis Card */}
        <div
          className="card-lift"
          style={{
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.04)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Targeted Focus Area
            </div>
            <h3 className="editorial-title" style={{ fontSize: '20px', margin: '4px 0 0 0', color: '#92400E' }}>
              Weak Concepts & Error Traps
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {weakConcepts.length > 0 ? (
              weakConcepts.map((item) => (
                <div
                  key={item.id}
                  className="card-lift-sm"
                  style={{
                    padding: '14px 16px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13.5px', color: '#92400E' }}>
                      ⚠ {item.name}
                    </strong>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#EA580C' }}>
                      {Math.round(item.score * 100)}%
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#B45309', lineHeight: '1.45' }}>
                    {item.reason}
                  </div>
                  <button
                    onClick={() => {
                      if (item.id === 'entanglement') {
                        onNavigateToView('playground');
                      } else {
                        onNavigateToView('lab3d');
                      }
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: '4px',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#B45309',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Practice Concept</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontSize: '13.5px' }}>
                All active foundational concepts are currently above the 70% mastery threshold!
              </div>
            )}
          </div>

          {/* Socratic Assistance Prompt */}
          <div style={{
            marginTop: 'auto',
            padding: '14px',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ fontSize: '12.5px', color: '#1E3A8A', fontWeight: 500 }}>
              Want tailored Socratic review on your weak spots?
            </div>
            <button
              className="btn-editorial-primary"
              onClick={() => onAskDirac('Review my current weak concepts (Measurement and Entanglement) and explain common student misconceptions.')}
              style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              Ask Dirac AI
            </button>
          </div>
        </div>
      </div>

      {/* 4. TWO COLUMN GRID: RECENT SIMULATIONS + ACHIEVEMENTS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(340px, 1fr)',
        gap: '24px'
      }}>
        {/* Recent Laboratory Simulations */}
        <div
          className="card-lift"
          style={{
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Interactive Lab History
              </div>
              <h3 className="editorial-title" style={{ fontSize: '20px', margin: '4px 0 0 0' }}>
                Recent Simulations
              </h3>
            </div>
            <Clock size={18} color="#2563EB" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentSimulations.map((sim) => (
              <div
                key={sim.id}
                className="card-lift-sm"
                onClick={() => onNavigateToView(sim.targetView)}
                style={{
                  padding: '14px 16px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                    {sim.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    {sim.outcome}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {sim.timestamp}
                  </span>
                  <div style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: 700, marginTop: '2px' }}>
                    Reopen →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements & Badges */}
        <div
          className="card-lift"
          style={{
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Earned Credentials
              </div>
              <h3 className="editorial-title" style={{ fontSize: '20px', margin: '4px 0 0 0' }}>
                Achievements & Badges
              </h3>
            </div>
            <Award size={20} color="#EA580C" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="card-lift-sm"
                style={{
                  padding: '14px 12px',
                  background: ach.unlocked ? '#EFF6FF' : '#F8FAFC',
                  border: ach.unlocked ? '1.5px solid #93C5FD' : '1px dashed #CBD5E1',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '8px',
                  opacity: ach.unlocked ? 1 : 0.65
                }}
                title={ach.description}
              >
                <div style={{ fontSize: '26px' }} className={ach.unlocked ? 'floating-element' : ''}>
                  {ach.icon}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: ach.unlocked ? '#1E3A8A' : '#64748B' }}>
                  {ach.title}
                </div>
                <div style={{ fontSize: '10.5px', color: ach.unlocked ? '#059669' : '#64748B', fontWeight: 700 }}>
                  {ach.unlocked ? '✓ Unlocked' : `${ach.progress}% Complete`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
