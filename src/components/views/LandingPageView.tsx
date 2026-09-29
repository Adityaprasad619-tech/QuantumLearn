// src/components/views/LandingPageView.tsx
import React, { useState } from 'react';
import { ActiveView } from '../layout/Header';
import { soundEffects } from '../../audio/soundEffects';
import { authService, AuthUser, UserRole } from '../../auth/authService';
import {
  Atom, GraduationCap, FlaskConical, LogIn, UserPlus,
  ArrowRight, Sparkles, CheckCircle2, Lock, Mail, User, Building, BookOpen, AlertCircle
} from 'lucide-react';

interface LandingPageViewProps {
  onNavigateToView: (view: ActiveView) => void;
  onSelectLesson: (lessonId: string) => void;
  onAskDirac: (prompt: string) => void;
  onOpenAuth?: (role?: UserRole) => void;
  onAuthSuccess?: (user: AuthUser) => void;
  authUser?: AuthUser | null;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigateToView,
  onOpenAuth,
  onAuthSuccess,
  authUser
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleChange = (role: UserRole) => {
    soundEffects.playGateClick();
    setSelectedRole(role);
    setError('');
    setSuccessMsg('');
  };

  const handleModeChange = (mode: 'login' | 'signup') => {
    soundEffects.playGateClick();
    setAuthMode(mode);
    setError('');
    setSuccessMsg('');
  };

  const handleQuickDemo = async (role: UserRole) => {
    soundEffects.playGateClick();
    setLoading(true);
    setError('');
    const demoEmail = role === 'student' ? 'student@quantumlearn.edu' : 'researcher@quantumlearn.edu';
    const demoPass = 'quantum123';

    try {
      const res = await authService.login(demoEmail, demoPass, role);
      setLoading(false);
      if (res.success && res.user) {
        onAuthSuccess?.(res.user);
        const isRes = res.user.role === 'researcher' || res.user.role === 'teacher';
        onNavigateToView(isRes ? 'researcher-dashboard' : 'student-dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(res.error || 'Demo login failed. Please try manual login.');
      }
    } catch {
      setLoading(false);
      setError('Unable to connect to authentication server.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playGateClick();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (authMode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await authService.login(email, password, selectedRole);
        setLoading(false);
        if (res.success && res.user) {
          onAuthSuccess?.(res.user);
          const isRes = res.user.role === 'researcher' || res.user.role === 'teacher';
          onNavigateToView(isRes ? 'researcher-dashboard' : 'student-dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setError(res.error || 'Invalid credentials. Please check your email and password.');
        }
      } else {
        const res = await authService.signup(name, email, password, selectedRole, {
          institution: institution.trim() || undefined,
          fieldOfStudy: fieldOfStudy.trim() || undefined
        });
        setLoading(false);
        if (res.success && res.user) {
          onAuthSuccess?.(res.user);
          setSuccessMsg('Account created successfully starting at 0 XP! Redirecting to workspace...');
          setTimeout(() => {
            const isRes = res.user!.role === 'researcher' || res.user!.role === 'teacher';
            onNavigateToView(isRes ? 'researcher-dashboard' : 'student-dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 800);
        } else {
          setError(res.error || 'Signup failed. Please try again.');
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError('Authentication server error. Please ensure backend server is running.');
    }
  };

  const isStudent = selectedRole === 'student';

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at 50% 20%, #EFF6FF 0%, #FAFAF8 70%)'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '540px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          padding: '8px 18px',
          borderRadius: '30px',
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF'
          }}>
            <Atom size={16} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.02em' }}>
            QuantumLearn Platform
          </span>
        </div>

        <h1 className="editorial-title" style={{ fontSize: '38px', margin: '0 0 10px 0', color: '#0F172A', lineHeight: 1.15 }}>
          Welcome to QuantumLearn
        </h1>
        <p style={{ fontSize: '15px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
          Log in to your workspace or create a new account to begin learning.
        </p>
      </div>

      {/* Main Login / Sign Up Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px solid #BFDBFE',
        boxShadow: '0 12px 40px rgba(37, 99, 235, 0.12)',
        overflow: 'hidden'
      }}>
        {/* Role Selector Tabs (Learner vs Researcher) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: isStudent ? '#FFFFFF' : 'transparent',
              color: isStudent ? '#1E3A8A' : '#64748B',
              fontWeight: isStudent ? 800 : 600,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderBottom: isStudent ? '3px solid #2563EB' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <GraduationCap size={18} color={isStudent ? '#2563EB' : '#64748B'} />
            <span>Learner / Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('researcher')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: !isStudent ? '#FFFFFF' : 'transparent',
              color: !isStudent ? '#047857' : '#64748B',
              fontWeight: !isStudent ? 800 : 600,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderBottom: !isStudent ? '3px solid #059669' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <FlaskConical size={18} color={!isStudent ? '#059669' : '#64748B'} />
            <span>Quantum Researcher</span>
          </button>
        </div>

        <div style={{ padding: '28px 28px 32px 28px' }}>
          {/* Mode Selector Pill (Login vs Sign Up) */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              style={{
                flex: 1,
                padding: '9px',
                border: 'none',
                borderRadius: '9px',
                background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? '#0F172A' : '#64748B',
                fontWeight: authMode === 'login' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogIn size={14} />
              <span>Log In</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              style={{
                flex: 1,
                padding: '9px',
                border: 'none',
                borderRadius: '9px',
                background: authMode === 'signup' ? '#FFFFFF' : 'transparent',
                color: authMode === 'signup' ? '#0F172A' : '#64748B',
                fontWeight: authMode === 'signup' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: authMode === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UserPlus size={14} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #6EE7B7',
              color: '#065F46',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {authMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isStudent ? 'e.g., Marie Curie' : 'e.g., Dr. Richard Feynman'}
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 38px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isStudent ? 'student@university.edu' : 'researcher@lab.org'}
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Institution / University (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Institute for Quantum Computing"
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 38px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: isStudent
                  ? 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)'
                  : 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isStudent ? '0 4px 14px rgba(37,99,235,0.25)' : '0 4px 14px rgba(4,120,87,0.25)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{authMode === 'login' ? `Sign In as ${isStudent ? 'Learner' : 'Researcher'}` : `Create ${isStudent ? 'Learner' : 'Researcher'} Account`}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Shortcuts */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #E2E8F0',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '10px' }}>
              Or test instantly with 1-click Demo Accounts:
            </span>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #BFDBFE',
                  background: '#EFF6FF',
                  color: '#1E3A8A',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <GraduationCap size={14} />
                <span>Demo Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('researcher')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #A7F3D0',
                  background: '#ECFDF5',
                  color: '#047857',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FlaskConical size={14} />
                <span>Demo Researcher</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>
        QuantumLearn • SQLite Dynamic Auth & Persistence • Supabase Ready
      </footer>
    </div>
  );
};
