// src/components/views/RoadmapView.tsx
import React, { useState, useEffect } from 'react';
import { LearnerModelService, AdaptiveRoadmap, ConceptMastery } from '../../learner/learnerModel';
import { soundEffects } from '../../audio/soundEffects';
import { BrowserFrame } from '../ui/BrowserFrame';
import {
  CheckCircle2, AlertTriangle, Lock, Sparkles,
  ArrowRight, RotateCcw, Target, ShieldCheck, Flame, BookOpen, BrainCircuit
} from 'lucide-react';

interface RoadmapViewProps {
  onNavigateToView: (view: any) => void;
  onAskDirac: (prompt: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onNavigateToView, onAskDirac }) => {
  const [roadmap, setRoadmap] = useState<AdaptiveRoadmap>(LearnerModelService.generateRoadmap());
  const [selectedConcept, setSelectedConcept] = useState<ConceptMastery | null>(
    LearnerModelService.getConcept('entanglement') || null
  );

  useEffect(() => {
    const unsubscribe = LearnerModelService.subscribe(() => {
      setRoadmap(LearnerModelService.generateRoadmap());
    });
    return unsubscribe;
  }, []);

  const handleSimulateQuiz = (conceptId: string, isCorrect: boolean) => {
    if (isCorrect) {
      soundEffects.playSuccessChord();
    } else {
      soundEffects.playErrorTone();
    }
    LearnerModelService.recordQuizAttempt(conceptId, isCorrect);
    const updated = LearnerModelService.getConcept(conceptId);
    if (updated) setSelectedConcept(updated);
  };

  const handleSimulateInteraction = (conceptId: string) => {
    soundEffects.playGateClick();
    LearnerModelService.recordSimulationInteraction(conceptId);
    const updated = LearnerModelService.getConcept(conceptId);
    if (updated) setSelectedConcept(updated);
  };

  const handleResetProfile = () => {
    soundEffects.playStep();
    LearnerModelService.resetProfile();
    setSelectedConcept(LearnerModelService.getConcept('entanglement') || null);
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 20px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Editorial Browser Hero */}
      <BrowserFrame
        url="quantum-lab://learning-engine/bayesian-roadmap"
        badgeText="Bayesian Model Active"
        badgeColor="#F97316"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="coral-pill-badge" style={{ fontSize: '11px' }}>
                Dynamic Syllabus Engine
              </span>
              <span className="navy-pill-badge" style={{ fontSize: '11px' }}>
                BKT 2.4 Active
              </span>
            </div>
            <h1 className="editorial-title" style={{ fontSize: '32px', fontWeight: 800, color: '#1E3A8A', margin: 0, letterSpacing: '-0.02em' }}>
              Personalized Quantum Roadmap
            </h1>
            <p className="editorial-subtitle" style={{ fontSize: '14.5px', color: '#334155', margin: '8px 0 0 0', maxWidth: '750px', lineHeight: '1.6' }}>
              Your real-time quantum competency profile. The syllabus dynamically reorganizes according to your quiz accuracy, repeated mistakes, simulation interactions, and prerequisite mastery.
            </p>
          </div>

          {/* Global Competency Badge & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="card-lift-sm" style={{
              padding: '12px 18px',
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 14px -2px rgba(30, 58, 138, 0.08)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Target size={18} color="#1E3A8A" />
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Average Mastery
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E3A8A', fontFamily: 'JetBrains Mono, monospace' }}>
                  {roadmap.overallMasteryPercentage}%
                </div>
              </div>
            </div>

            <button
              onClick={handleResetProfile}
              style={{
                padding: '10px 14px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              title="Reset to default benchmark profile"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </BrowserFrame>

      {/* Recommended Next Mission Banner */}
      {roadmap.nextRecommended && (
        <div className="card-lift" style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '1px solid #FDE68A',
          borderRadius: '16px',
          padding: '22px 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 20px -2px rgba(217, 119, 6, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#F59E0B',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="coral-pill-badge" style={{ fontSize: '10.5px' }}>
                  Recommended Priority Target
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E' }}>
                  {Math.round(roadmap.nextRecommended.score * 100)}% Proficiency
                </span>
              </div>
              <div className="editorial-title" style={{ fontSize: '20px', fontWeight: 800, color: '#78350F', marginTop: '4px' }}>
                {roadmap.nextRecommended.name}
              </div>
              <div style={{ fontSize: '13px', color: '#92400E', marginTop: '2px' }}>
                Strengthening this concept will unlock prerequisite gating for Grover's Search and Shor's Algorithm.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                if (roadmap.nextRecommended?.id === 'entanglement') {
                  onNavigateToView('playground');
                } else if (roadmap.nextRecommended?.id === 'measurement') {
                  onNavigateToView('lab3d');
                } else {
                  onNavigateToView('curriculum');
                }
              }}
              className="btn-coral-action"
              style={{ padding: '10px 22px' }}
            >
              <span>Launch Target Lab</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* SECTION A: IDENTIFIED CONCEPTUAL GAPS & ACTIVE MISCONCEPTIONS */}
      {roadmap.conceptualGaps && roadmap.conceptualGaps.length > 0 && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #FECACA',
          borderRadius: '16px',
          padding: '24px 28px',
          boxShadow: '0 4px 20px -2px rgba(220, 38, 38, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={20} color="#DC2626" />
              </div>
              <div>
                <h3 className="editorial-title" style={{ fontSize: '19px', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                  Active Conceptual Gaps & Weak Prerequisite Links
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Diagnosed from repeated quiz mistakes, simulation error channels, and low predictive accuracy.
                </p>
              </div>
            </div>

            <span style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '4px 12px',
              borderRadius: '9999px'
            }}>
              {roadmap.conceptualGaps.length} Gaps Detected
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
            {roadmap.conceptualGaps.map(gap => (
              <div
                key={gap.conceptId}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: gap.severity === 'high' ? '#FEF2F2' : gap.severity === 'medium' ? '#FFFBEB' : '#F8FAFC',
                  border: gap.severity === 'high' ? '1px solid #FCA5A5' : gap.severity === 'medium' ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    {gap.conceptName}
                  </span>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: gap.severity === 'high' ? '#EF4444' : gap.severity === 'medium' ? '#F59E0B' : '#64748B',
                    color: '#FFFFFF'
                  }}>
                    {gap.severity} Priority
                  </span>
                </div>

                <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
                  {gap.gapDescription}
                </div>

                <div style={{ fontSize: '11.5px', color: '#64748B', background: 'rgba(255,255,255,0.7)', padding: '6px 10px', borderRadius: '6px' }}>
                  <strong>Remediation:</strong> {gap.recommendedAction}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => onNavigateToView('quiz-practice')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      background: '#1E3A8A',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Targeted Quiz
                  </button>
                  <button
                    onClick={() => onAskDirac(`Can you help me understand my conceptual gap in ${gap.conceptName}? Here is the diagnosis: ${gap.gapDescription}`)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      background: '#FFFFFF',
                      color: '#1E3A8A',
                      border: '1px solid #BFDBFE',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Ask Dirac AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION B: WHAT IS LEFT TO STUDY (Personalized Learning Queue) */}
      {roadmap.whatIsLeftToStudy && roadmap.whatIsLeftToStudy.length > 0 && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '24px 28px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={20} color="#1E3A8A" />
              </div>
              <div>
                <h3 className="editorial-title" style={{ fontSize: '19px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
                  What is Left to Study (Personalized Learning Queue)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Ordered based on prerequisite mastery and readiness to ensure optimal conceptual progression.
                </p>
              </div>
            </div>

            <span style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              background: '#EFF6FF',
              color: '#1E3A8A',
              padding: '4px 12px',
              borderRadius: '9999px'
            }}>
              {roadmap.whatIsLeftToStudy.length} Topics Remaining
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {roadmap.whatIsLeftToStudy.map((item, idx) => (
              <div
                key={item.conceptId}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: item.isUnlocked ? '#F8FAFC' : '#FAFAF8',
                  border: item.isUnlocked ? '1px solid #CBD5E1' : '1px dashed #CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', fontWeight: 700 }}>
                    #{idx + 1}
                  </span>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: item.isUnlocked ? '#DCFCE7' : '#F1F5F9',
                    color: item.isUnlocked ? '#166534' : '#64748B'
                  }}>
                    {item.isUnlocked ? 'Ready to Learn' : 'Prereq Locked'}
                  </span>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  {item.conceptName}
                </div>

                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Est. Time: ~{item.estimatedMinutes} mins • Current: {Math.round(item.score * 100)}%
                </div>

                {item.missingPrereqs.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#B45309' }}>
                    Need: {item.missingPrereqs.join(', ')}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (item.conceptId === 'entanglement' || item.conceptId === 'grover') onNavigateToView('playground');
                    else if (item.conceptId === 'qft') onNavigateToView('qft');
                    else if (item.conceptId === 'shor') onNavigateToView('shor');
                    else if (item.conceptId === 'teleportation') onNavigateToView('teleportation');
                    else onNavigateToView('curriculum');
                  }}
                  style={{
                    marginTop: '4px',
                    padding: '6px',
                    background: item.isUnlocked ? 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' : '#E2E8F0',
                    color: item.isUnlocked ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: item.isUnlocked ? 'pointer' : 'not-allowed'
                  }}
                >
                  {item.isUnlocked ? 'Start Concept Lesson' : 'Unlock Prereqs First'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 Main Adaptive Columns: Mastered, Needs Improvement, Locked */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* COLUMN 1: MASTERED (✓) */}
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 16px -2px rgba(30, 58, 138, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={18} color="#059669" />
              </div>
              <h3 className="editorial-title" style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
                Mastered
              </h3>
            </div>
            <span className="emerald-pill-badge" style={{ fontSize: '11px' }}>
              {roadmap.mastered.length} Concepts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roadmap.mastered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const c = LearnerModelService.getConcept(item.id);
                  if (c) setSelectedConcept(c);
                }}
                className="card-lift-sm"
                style={{
                  padding: '14px 16px',
                  background: selectedConcept?.id === item.id ? '#F0FDF4' : '#F8FAFC',
                  border: selectedConcept?.id === item.id ? '2px solid #059669' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                    ✓ {item.name}
                  </span>
                  <span style={{ fontSize: '12.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#059669' }}>
                    {Math.round(item.score * 100)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.score * 100}%`, background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: NEEDS IMPROVEMENT (⚠) */}
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #FDE68A',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 16px -2px rgba(245, 158, 11, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={18} color="#D97706" />
              </div>
              <h3 className="editorial-title" style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
                Needs Improvement
              </h3>
            </div>
            <span className="coral-pill-badge" style={{ fontSize: '11px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
              {roadmap.needsImprovement.length} Concepts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roadmap.needsImprovement.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const c = LearnerModelService.getConcept(item.id);
                  if (c) setSelectedConcept(c);
                }}
                className="card-lift-sm"
                style={{
                  padding: '14px 16px',
                  background: selectedConcept?.id === item.id ? '#FFFBEB' : '#F8FAFC',
                  border: selectedConcept?.id === item.id ? '2px solid #D97706' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                    ⚠ {item.name}
                  </span>
                  <span style={{ fontSize: '12.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#D97706' }}>
                    {Math.round(item.score * 100)}%
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.4' }}>
                  {item.reason}
                </div>
                <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.score * 100}%`, background: 'linear-gradient(90deg, #FBBF24, #D97706)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: LOCKED UNTIL PREREQUISITES (🔒) */}
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 16px -2px rgba(100, 116, 139, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={18} color="#64748B" />
              </div>
              <h3 className="editorial-title" style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
                Locked Prereqs
              </h3>
            </div>
            <span style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              background: '#F1F5F9',
              color: '#475569',
              padding: '3px 10px',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0'
            }}>
              {roadmap.locked.length} Algorithms
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roadmap.locked.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const c = LearnerModelService.getConcept(item.id);
                  if (c) setSelectedConcept(c);
                }}
                className="card-lift-sm"
                style={{
                  padding: '14px 16px',
                  background: selectedConcept?.id === item.id ? '#F8FAFC' : '#FAFAF8',
                  border: selectedConcept?.id === item.id ? '2px solid #64748B' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  opacity: 0.9,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569' }}>
                    🔒 {item.name}
                  </span>
                  <span style={{ fontSize: '11.5px', fontFamily: 'JetBrains Mono, monospace', color: '#94A3B8' }}>
                    {Math.round(item.score * 100)}%
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#B45309', background: '#FFFBEB', padding: '4px 8px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                  {item.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Concept Diagnostic & Simulation Inspector */}
      {selectedConcept && (
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="navy-pill-badge" style={{ fontSize: '11px' }}>
                  Diagnostic Inspector
                </span>
              </div>
              <h3 className="editorial-title" style={{ fontSize: '22px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
                {selectedConcept.name}
              </h3>
            </div>

            <div style={{
              fontSize: '15px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '9999px',
              background: selectedConcept.score >= 0.7 ? '#DCFCE7' : selectedConcept.score >= 0.4 ? '#FEF3C7' : '#FEE2E2',
              color: selectedConcept.score >= 0.7 ? '#065F46' : selectedConcept.score >= 0.4 ? '#92400E' : '#991B1B'
            }}>
              Proficiency: {(selectedConcept.score * 100).toFixed(1)}%
            </div>
          </div>

          {/* Metric Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            <div className="card-lift-sm" style={{ padding: '12px 14px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Quiz Accuracy</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                {selectedConcept.attempts > 0 ? Math.round((selectedConcept.correctAttempts / selectedConcept.attempts) * 100) : 0}% ({selectedConcept.correctAttempts}/{selectedConcept.attempts})
              </div>
            </div>

            <div className="card-lift-sm" style={{ padding: '12px 14px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Active Mistakes</div>
              <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: selectedConcept.consecutiveMistakes > 0 ? '#DC2626' : '#059669', marginTop: '4px' }}>
                {selectedConcept.consecutiveMistakes} in a row
              </div>
            </div>

            <div className="card-lift-sm" style={{ padding: '12px 14px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Prediction Accuracy</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                {Math.round(selectedConcept.predictionAccuracy * 100)}% ({selectedConcept.correctPredictions}/{selectedConcept.predictionsCount})
              </div>
            </div>

            <div className="card-lift-sm" style={{ padding: '12px 14px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Lab Simulations</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                {selectedConcept.simulationInteractions} actions
              </div>
            </div>

            <div className="card-lift-sm" style={{ padding: '12px 14px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Time Invested</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                {selectedConcept.timeSpentMinutes} mins
              </div>
            </div>
          </div>

          {/* Interactive Simulation Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9'
          }}>
            <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>
              Simulate learner actions to observe rolling Bayesian Knowledge Tracing updates:
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleSimulateQuiz(selectedConcept.id, true)}
                className="emerald-pill-badge"
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
                }}
              >
                + Simulate Quiz Success
              </button>

              <button
                onClick={() => handleSimulateQuiz(selectedConcept.id, false)}
                style={{
                  padding: '8px 14px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2)'
                }}
              >
                - Simulate Quiz Error
              </button>

              <button
                onClick={() => handleSimulateInteraction(selectedConcept.id)}
                className="btn-editorial-primary"
                style={{
                  padding: '8px 16px',
                  fontSize: '12px'
                }}
              >
                + Lab Exploration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
