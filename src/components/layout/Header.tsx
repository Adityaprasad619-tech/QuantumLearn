// src/components/layout/Header.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Atom, Flame, Zap, LogIn, LogOut, BookOpen, GraduationCap, Menu, PanelLeftClose, PanelLeft, User, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';
import { AuthUser, UserRole } from '../../auth/authService';

export type ActiveView =
  | 'landing'
  | 'learning-genome'
  | 'dashboard'
  | 'curriculum'
  | 'quiz-practice'
  | 'lab3d'
  | 'playground'
  | 'algorithm-library'
  | 'adaptive-challenges'
  | 'backend-comparison'
  | 'teleportation'
  | 'qft'
  | 'shor'
  | 'roadmap'
  | 'challenges'
  | 'student-dashboard'
  | 'researcher-dashboard'
  | 'teacher-dashboard';

interface HeaderProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  xp: number;
  streakDays: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenDiracAI: () => void;
  onOpenDemoTour: () => void;
  authUser?: AuthUser | null;
  onOpenAuth?: (role?: UserRole) => void;
  onLogout?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  xp,
  streakDays,
  soundEnabled,
  onToggleSound,
  onOpenDiracAI,
  onOpenDemoTour,
  authUser,
  onOpenAuth,
  onLogout,
  sidebarOpen,
  onToggleSidebar
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const level = Math.floor(xp / 200) + 1;
  const isResearcher = authUser?.role === 'researcher' || authUser?.role === 'teacher';
  const levelTitles = [
    'Quantum Novice',
    'Superposition Apprentice',
    'Entanglement Adept',
    'Algorithm Architect',
    'Fault-Tolerant Master',
    'Quantum Supremacist'
  ];
  const currentTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #BFDBFE',
      zIndex: 90,
      height: '58px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      gap: '12px',
      boxShadow: '0 2px 10px rgba(37, 99, 235, 0.04)'
    }}>
      {/* Left Sidebar Toggle + Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {onToggleSidebar && activeView !== 'landing' && (

          <button
            onClick={() => {
              soundEffects.playGateClick();
              onToggleSidebar();
            }}
            className="card-lift"
            style={{
              background: sidebarOpen ? '#EFF6FF' : '#F8FAFC',
              border: sidebarOpen ? '1px solid #3B82F6' : '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '6px 8px',
              color: sidebarOpen ? '#1E3A8A' : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700
            }}
            title={sidebarOpen ? 'Close Navigation Panel' : 'Open Navigation Panel'}
          >
            {sidebarOpen ? <PanelLeftClose size={16} color="#1E3A8A" /> : <PanelLeft size={16} color="#475569" />}
            <span style={{ fontSize: '11.5px' }}>{sidebarOpen ? 'Sidebar' : 'Menu'}</span>
          </button>
        )}

        {/* Brand Logo with Floating Micro-Animation */}
        <div
          onClick={() => onSelectView('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div
            className="floating-element"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Atom size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <span className="editorial-title" style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.02em' }}>
              QuantumLearn
            </span>
            <span style={{
              fontSize: '9px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              background: '#EBF3FC',
              color: '#2563EB',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #BFDBFE'
            }}>
              STUDIO
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Interactive Demo Tour Trigger */}
        <button
          onClick={onOpenDemoTour}
          className="card-lift"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 11px',
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: '8px',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#B45309',
            cursor: 'pointer'
          }}
          title="Launch Interactive Evaluator Demo Tour"
        >
          <Zap size={13} color="#D97706" />
          <span>Demo Tour</span>
        </button>

        {/* Streak Counter */}
        <div
          title={`${streakDays}-day learning streak`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: '#FFF7ED',
            border: '1px solid #FFEDD5',
            borderRadius: '8px',
            fontSize: '11.5px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            color: '#EA580C'
          }}
        >
          <Flame size={13} color="#EA580C" />
          <span>{streakDays}d</span>
        </div>

        {/* XP & Level Badge with Coral Pill Style from Template */}
        <div
          title={`Level ${level}: ${currentTitle}`}
          className="coral-pill-badge"
          style={{
            fontSize: '11.5px',
            padding: '4px 11px',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          <span>{xp} XP</span>
          <span style={{ opacity: 0.7 }}>•</span>
          <span style={{ fontSize: '10px' }}>Lvl {level}</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="card-lift"
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: soundEnabled ? '#0F172A' : '#94A3B8'
          }}
          title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Dirac AI Trigger Button */}
        <button
          onClick={onOpenDiracAI}
          className="card-lift"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            color: '#FFFFFF',
            border: '1px solid #4338CA',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(67, 56, 202, 0.25)'
          }}
        >
          <Sparkles size={13} color="#A5B4FC" />
          <span>Dirac AI</span>
        </button>

        {/* Authentication Controls: Sign In or User Profile Chip */}
        {!authUser ? (
          <button
            onClick={() => onOpenAuth?.()}
            className="card-lift"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
              color: '#FFFFFF',
              border: '1px solid #1E3A8A',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30, 58, 138, 0.25)',
              whiteSpace: 'nowrap'
            }}
            title="Sign in or create an account"
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        ) : (
          <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="card-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: isResearcher ? '#ECFDF5' : '#EBF3FC',
                border: `1px solid ${isResearcher ? '#A7F3D0' : '#BFDBFE'}`,
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: isResearcher ? '#047857' : '#1E3A8A',
                cursor: 'pointer'
              }}
              title={`Logged in as ${authUser.name} (${authUser.role})`}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: isResearcher ? '#059669' : '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 800
              }}>
                {authUser.name.charAt(0).toUpperCase()}
              </div>
              <span>{authUser.name.split(' ')[0]}</span>
              <span style={{
                fontSize: '9px',
                fontFamily: 'JetBrains Mono, monospace',
                padding: '1px 5px',
                borderRadius: '4px',
                background: isResearcher ? '#D1FAE5' : '#DBEAFE',
                color: isResearcher ? '#065F46' : '#1D4ED8',
                textTransform: 'uppercase'
              }}>
                {isResearcher ? 'RESEARCHER' : 'LEARNER'}
              </span>
              <ChevronDown size={12} style={{ opacity: 0.7 }} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: '200px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
                  padding: '8px',
                  zIndex: 100,
                }}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onSelectView(isResearcher ? 'researcher-dashboard' : 'student-dashboard');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#F8FAFC',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '6px',
                    color: '#0F172A',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <LayoutDashboard size={14} />
                  <span>View Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    window.alert('Profile editor is coming soon.');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '6px',
                    color: '#0F172A',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <User size={14} />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    window.alert('Settings panel is coming soon.');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '6px',
                    color: '#0F172A',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>

                <div style={{ height: '1px', background: '#E2E8F0', margin: '6px 0' }} />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#FEF2F2',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#B91C1C',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
