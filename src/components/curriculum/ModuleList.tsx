// src/components/curriculum/ModuleList.tsx
import React from 'react';
import { CURRICULUM_MODULES } from './curriculumData';
import { LessonContent } from '../../types';
import { BrowserFrame } from '../ui/BrowserFrame';
import { Award, ArrowRight, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

interface ModuleListProps {
  completedLessons: string[];
  onSelectLesson: (lesson: LessonContent) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  completedLessons,
  onSelectLesson
}) => {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 20px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }}>
      {/* Editorial Browser Hero */}
      <BrowserFrame
        url="quantum-lab://curriculum/syllabus-matrix"
        badgeText="Full Syllabus"
        badgeColor="#F97316"
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="coral-pill-badge" style={{ fontSize: '11px' }}>
              Active-Learning Curriculum
            </span>
            <span className="navy-pill-badge" style={{ fontSize: '11px' }}>
              6 Interactive Modules
            </span>
          </div>
          <h1 className="editorial-title" style={{ fontSize: '36px', fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
            From Classical Bits to Shor's Algorithm
          </h1>
          <p className="editorial-subtitle" style={{ fontSize: '15px', color: '#334155', maxWidth: '780px', margin: 0, lineHeight: '1.6' }}>
            Every concept follows the 10-step active learning cycle: learn the physics, visualize on the 3D Bloch sphere, formulate predictions, simulate statevectors, collapse wavefunctions, and receive Dirac AI feedback.
          </p>
        </div>
      </BrowserFrame>

      {/* Grid of Modules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {CURRICULUM_MODULES.map((mod) => {
          const totalInMod = mod.lessons.length;
          const completedInMod = mod.lessons.filter(l => completedLessons.includes(l.id)).length;
          const isModCompleted = totalInMod > 0 && completedInMod === totalInMod;

          return (
            <div
              key={mod.id}
              className="card-lift"
              style={{
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.06)'
              }}
            >
              {/* Module Header Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: isModCompleted ? 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)' : 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    border: isModCompleted ? '1px solid #86EFAC' : '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: isModCompleted ? '#059669' : '#1E3A8A',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    0{mod.number}
                  </div>
                  <div>
                    <h2 className="editorial-title" style={{ fontSize: '20px', fontWeight: 800, color: '#1E3A8A', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
                      {mod.title}
                    </h2>
                    <p className="editorial-subtitle" style={{ fontSize: '13.5px', color: '#475569', margin: 0 }}>
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '9999px',
                    fontSize: '11.5px',
                    color: '#92400E',
                    fontWeight: 700
                  }}>
                    <Award size={14} color="#D97706" />
                    <span>Badge: <strong>{mod.badge}</strong></span>
                  </div>

                  <span className={isModCompleted ? "emerald-pill-badge" : "navy-pill-badge"} style={{ fontSize: '11px' }}>
                    {completedInMod}/{totalInMod} Done
                  </span>
                </div>
              </div>

              {/* Lessons List in Module */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginTop: '4px' }}>
                {mod.lessons.map((lesson) => {
                  const isDone = completedLessons.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className="card-lift-sm"
                      style={{
                        padding: '18px 20px',
                        background: isDone ? 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                        border: isDone ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                            {lesson.title}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#64748B', lineHeight: '1.5' }}>
                            {lesson.subtitle}
                          </div>
                        </div>
                        {isDone && <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                          10-Step Active Lab
                        </span>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#1E3A8A'
                        }}>
                          <span>Start Lab</span>
                          <ArrowRight size={13} color="#F97316" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
