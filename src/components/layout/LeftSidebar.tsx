// src/components/layout/LeftSidebar.tsx
import React from 'react';
import {
  Home, BookOpen, Award, Target, Dna, Atom, Globe,
  Radio, Waves, Binary, Library, Zap, Server, Swords, FlaskConical,
  ChevronLeft, ChevronRight, GraduationCap, Sparkles, BrainCircuit, X
} from 'lucide-react';
import { ActiveView } from './Header';
import { AuthUser } from '../../auth/authService';
import { soundEffects } from '../../audio/soundEffects';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  authUser?: AuthUser | null;
  onOpenDiracAI: () => void;
}

interface NavCategory {
  title: string;
  items: {
    id: ActiveView;
    label: string;
    icon: React.FC<{ size?: number; color?: string; className?: string }>;
    badge?: string;
    badgeColor?: string;
    requiresAuth?: boolean;
    researcherOnly?: boolean;
  }[];
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isOpen,
  onToggle,
  activeView,
  onSelectView,
  authUser,
  onOpenDiracAI
}) => {
  const isResearcher = authUser?.role === 'researcher' || authUser?.role === 'teacher';

  const categories: NavCategory[] = [
    {
      title: 'Learning & Mastery',
      items: [
        { id: 'landing', label: 'Overview', icon: Home },
        { id: 'curriculum', label: 'Curriculum & Theory', icon: BookOpen, badge: '6 Modules' },
        { id: 'quiz-practice', label: 'Quiz & Practice Arena', icon: Award, badge: 'New', badgeColor: '#10B981' },
        { id: 'learning-genome', label: 'Learning Genome', icon: Dna, badge: 'Telemetry' },
        { id: 'roadmap', label: 'Adaptive Roadmap', icon: Target, badge: 'BKT 2.4' },
        ...(authUser && !isResearcher ? [{ id: 'student-dashboard' as ActiveView, label: 'Student Portal', icon: GraduationCap }] : [])
      ]
    },
    {
      title: 'Quantum Laboratories',
      items: [
        { id: 'playground', label: 'Circuit Simulator', icon: Atom, badge: 'Dual Sim' },
        { id: 'lab3d', label: '3D Bloch Lab', icon: Globe },
        { id: 'teleportation', label: 'Teleportation Lab', icon: Radio },
        { id: 'qft', label: 'QFT Lab', icon: Waves },
        { id: 'shor', label: "Shor's Factorization", icon: Binary }
      ]
    },
    {
      title: 'Advanced & Research',
      items: [
        { id: 'algorithm-library', label: 'Algorithm Library', icon: Library },
        { id: 'adaptive-challenges', label: 'Adaptive Challenges', icon: Zap },
        { id: 'backend-comparison', label: 'Hardware Backends', icon: Server, badge: 'IBM/IonQ' },
        { id: 'challenges', label: 'Challenge Arena', icon: Swords },
        ...(isResearcher || authUser?.role === 'researcher'
          ? [{ id: 'researcher-dashboard' as ActiveView, label: 'Researcher Portal', icon: FlaskConical }]
          : [{ id: 'researcher-dashboard' as ActiveView, label: 'Researcher Portal', icon: FlaskConical, badge: 'Pro' }])
      ]
    }
  ];

  return (
    <>
      {/* Sidebar Container */}
      <aside
        style={{
          position: 'fixed',
          top: '58px',
          left: 0,
          bottom: 0,
          width: isOpen ? '260px' : '64px',
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '4px 0 24px rgba(15, 23, 42, 0.15)',
          zIndex: 85,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowX: 'hidden'
        }}
      >
        {/* Top Control Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {isOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BrainCircuit size={14} color="#FFF" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
                Navigation Hub
              </span>
            </div>
          )}

          <button
            onClick={() => {
              soundEffects.playGateClick();
              onToggle();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title={isOpen ? 'Collapse Panel' : 'Expand Panel'}
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: isOpen ? '12px 10px' : '12px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {categories.map((cat, catIdx) => (
            <div key={catIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {isOpen && (
                <div style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#64748B',
                  padding: '4px 10px 2px',
                  userSelect: 'none'
                }}>
                  {cat.title}
                </div>
              )}

              {cat.items.map((item) => {
                const isActive = activeView === item.id;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundEffects.playGateClick();
                      onSelectView(item.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isOpen ? 'space-between' : 'center',
                      padding: isOpen ? '9px 12px' : '10px 0',
                      borderRadius: '10px',
                      border: isActive ? '1px solid #3B82F6' : '1px solid transparent',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)'
                        : 'transparent',
                      color: isActive ? '#60A5FA' : '#CBD5E1',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      width: '100%',
                      boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'none'
                    }}
                    title={!isOpen ? item.label : undefined}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <IconComponent
                        size={17}
                        color={isActive ? '#60A5FA' : '#94A3B8'}
                      />
                      {isOpen && (
                        <span style={{
                          fontSize: '13px',
                          fontWeight: isActive ? 700 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.label}
                        </span>
                      )}
                    </div>

                    {isOpen && item.badge && (
                      <span style={{
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255, 255, 255, 0.08)',
                        color: item.badgeColor || '#94A3B8',
                        border: `1px solid ${item.badgeColor ? `${item.badgeColor}44` : 'rgba(255, 255, 255, 0.12)'}`
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Dirac AI Tutor Action */}
        <div style={{
          padding: '12px 10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <button
            onClick={() => {
              soundEffects.playSuccessChord();
              onOpenDiracAI();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isOpen ? 'flex-start' : 'center',
              gap: '8px',
              padding: isOpen ? '9px 12px' : '10px 0',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
            title="Ask Dirac AI Quantum Tutor"
          >
            <Sparkles size={16} color="#FBBF24" />
            {isOpen && (
              <span style={{ fontSize: '13px', fontWeight: 700 }}>
                Ask Dirac AI Tutor
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
