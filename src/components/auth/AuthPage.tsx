// src/components/auth/AuthPage.tsx
// Auth modal connecting directly to the SQLite backend with real authentication
import React, { useState, useEffect } from 'react';
import { authService, UserRole, AuthUser } from '../../auth/authService';
import { Atom, X, Eye, EyeOff, GraduationCap, ArrowRight, Sparkles, Database, FlaskConical } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  defaultRole?: UserRole;
}

type AuthMode = 'role-select' | 'login' | 'signup';

const ROLE_CONFIG = {
  student: {
    icon: GraduationCap,
    label: 'Student / Learner',
    badge: 'LEARNER',
    subtitle: 'Access interactive curriculum, 3D Bloch sphere, circuits & Dirac AI',
    badgeClass: 'navy-pill-badge',
    accentColor: '#1E3A8A',
    accentBg: '#EBF3FC',
    accentBorder: '#BFDBFE',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
  },
  researcher: {
    icon: FlaskConical,
    label: 'Quantum Researcher',
    badge: 'RESEARCHER',
    subtitle: 'Execute high-precision quantum experiments, benchmarks & cohort telemetry',
    badgeClass: 'emerald-pill-badge',
    accentColor: '#047857',
    accentBg: '#ECFDF5',
    accentBorder: '#A7F3D0',
    gradient: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
  },
  teacher: {
    icon: FlaskConical,
    label: 'Quantum Researcher',
    badge: 'RESEARCHER',
    subtitle: 'Execute high-precision quantum experiments, benchmarks & cohort telemetry',
    badgeClass: 'emerald-pill-badge',
    accentColor: '#047857',
    accentBg: '#ECFDF5',
    accentBorder: '#A7F3D0',
    gradient: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
  },
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, defaultRole }) => {
  const normalizedDefaultRole: UserRole | undefined = defaultRole === 'teacher' ? 'researcher' : defaultRole;
  const [mode, setMode] = useState<AuthMode>(normalizedDefaultRole ? 'login' : 'role-select');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(normalizedDefaultRole ?? null);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [institution, setInstitution] = useState('');
  const [grade, setGrade] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      const initialRole: UserRole | undefined = defaultRole === 'teacher' ? 'researcher' : defaultRole;
      setMode(initialRole ? 'login' : 'role-select');
      setSelectedRole(initialRole ?? null);
      setAuthTab('login');
      setError('');
      resetFields();
    }
  }, [isOpen, defaultRole]);

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setSubject('');
    setInstitution('');
    setGrade('');
    setError('');
  };

  const fillDemoCredentials = (role: UserRole) => {
    if (role === 'student') {
      setEmail('student@quantumlearn.edu');
      setPassword('quantum123');
    } else {
      setEmail('researcher@quantumlearn.edu');
      setPassword('quantum123');
    }
    setError('');
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentRole = selectedRole === 'teacher' ? 'researcher' : selectedRole;
  const cfg = currentRole ? ROLE_CONFIG[currentRole] : null;

  const handleRoleSelect = (role: UserRole) => {
    const normalized = role === 'teacher' ? 'researcher' : role;
    setSelectedRole(normalized);
    setMode('login');
    resetFields();
  };

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setAuthTab(tab);
    resetFields();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    setError('');

    const targetRole = selectedRole === 'teacher' ? 'researcher' : selectedRole;
    let result;

    if (authTab === 'login') {
      result = await authService.login(email, password, targetRole);
    } else {
      const extra =
        targetRole === 'researcher'
          ? { institution, fieldOfStudy: subject }
          : { grade, institution };
      result = await authService.signup(name, email, password, targetRole, extra);
    }

    setLoading(false);
    if (result.success && result.user) {
      onAuthSuccess(result.user);
      onClose();
    } else {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal panel */}
      <div
        style={{
          position: 'fixed',
          zIndex: 1001,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '92%',
          maxWidth: 470,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #BFDBFE',
          boxShadow: '0 24px 60px rgba(30, 58, 138, 0.2), 0 8px 24px rgba(0,0,0,0.1)',
        }}
      >
        {/* Modal header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #EBF3FC',
            background: 'linear-gradient(180deg, #EDF4FD 0%, #FFFFFF 100%)',
            borderRadius: '20px 20px 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
              }}
            >
              <Atom size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.01em' }}>
              QuantumLearn
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 800,
                background: '#EBF3FC',
                color: '#2563EB',
                padding: '2px 6px',
                borderRadius: 4,
                border: '1px solid #BFDBFE',
              }}
            >
              SQLITE
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F4F8FC',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: 6,
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {/* STEP 1: Role selection */}
          {mode === 'role-select' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <h2
                  style={{
                    margin: '0 0 4px',
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#0F172A',
                    letterSpacing: '-0.03em',
                    fontFamily: "'Fraunces', 'Plus Jakarta Sans', Georgia, serif",
                  }}
                >
                  Welcome to QuantumLearn
                </h2>
                <p style={{ margin: 0, fontSize: 13.5, color: '#64748B' }}>
                  Choose your role to access your dedicated workspace and data
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(['student', 'researcher'] as const).map(role => {
                  const RoleCfg = ROLE_CONFIG[role];
                  const Icon = RoleCfg.icon;
                  return (
                    <button
                      key={role}
                      className="card-lift"
                      onClick={() => handleRoleSelect(role)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        background: '#F8FAFC',
                        border: `1.5px solid ${RoleCfg.accentBorder}`,
                        borderRadius: 14,
                        padding: '16px 18px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = RoleCfg.accentBg;
                        (e.currentTarget as HTMLElement).style.borderColor = RoleCfg.accentColor;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '#F8FAFC';
                        (e.currentTarget as HTMLElement).style.borderColor = RoleCfg.accentBorder;
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: RoleCfg.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        }}
                      >
                        <Icon size={22} color="#fff" strokeWidth={1.75} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{RoleCfg.label}</span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 800,
                              fontFamily: 'JetBrains Mono, monospace',
                              color: RoleCfg.accentColor,
                              background: RoleCfg.accentBg,
                              border: `1px solid ${RoleCfg.accentBorder}`,
                              padding: '2px 7px',
                              borderRadius: 4,
                            }}
                          >
                            {RoleCfg.badge}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', lineHeight: 1.4 }}>
                          {RoleCfg.subtitle}
                        </p>
                      </div>
                      <ArrowRight size={16} color="#94A3B8" />
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#64748B',
                }}
              >
                <Database size={14} color="#2563EB" />
                <span>Backed by SQLite database · Structured for seamless Supabase migration</span>
              </div>
            </>
          )}

          {/* STEP 2: Login / Signup form */}
          {mode === 'login' && cfg && currentRole && (
            <>
              {/* Back + role indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <button
                  onClick={() => {
                    setMode('role-select');
                    resetFields();
                  }}
                  style={{
                    background: '#F4F8FC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: '5px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  ← Change Role
                </button>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: cfg.accentBg,
                    border: `1px solid ${cfg.accentBorder}`,
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: cfg.accentColor,
                  }}
                >
                  {React.createElement(cfg.icon, { size: 14, style: { marginRight: 2 } })}
                  {ROLE_CONFIG[currentRole].label}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <h2
                  style={{
                    margin: '0 0 4px',
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                    fontFamily: "'Fraunces', 'Plus Jakarta Sans', Georgia, serif",
                  }}
                >
                  {authTab === 'login' ? 'Sign In to Workspace' : 'Create New Account'}
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                  {authTab === 'login'
                    ? `Enter credentials to load your ${ROLE_CONFIG[currentRole].label} profile and saved data.`
                    : `Register as a new ${ROLE_CONFIG[currentRole].label} in the database.`}
                </p>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: 'flex',
                  marginBottom: 18,
                  background: '#F1F5F9',
                  borderRadius: 10,
                  padding: 4,
                  border: '1px solid #E2E8F0',
                }}
              >
                {(['login', 'signup'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabSwitch(tab)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontSize: 13,
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: 7,
                      cursor: 'pointer',
                      background: authTab === tab ? '#FFFFFF' : 'transparent',
                      color: authTab === tab ? '#0F172A' : '#94A3B8',
                      boxShadow: authTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tab === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {authTab === 'login' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    marginBottom: 16,
                  }}
                >
                  <span style={{ color: '#166534', fontWeight: 600 }}>Demo Account Available:</span>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials(currentRole)}
                    style={{
                      background: cfg.accentColor,
                      color: '#FFF',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    Quick-Fill {currentRole === 'student' ? 'Student' : 'Researcher'}
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {authTab === 'signup' && (
                  <FieldRow label="Full Name">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Dr. Richard Feynman or Alex Rivera"
                      required
                      style={inputStyle(cfg.accentColor)}
                      onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                      onBlur={e => (e.target.style.borderColor = '#CBD5E1')}
                    />
                  </FieldRow>
                )}

                <FieldRow label="Email Address">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@quantumlearn.edu"
                    required
                    style={inputStyle(cfg.accentColor)}
                    onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                    onBlur={e => (e.target.style.borderColor = '#CBD5E1')}
                  />
                </FieldRow>

                {authTab === 'signup' && currentRole === 'researcher' && (
                  <>
                    <FieldRow label="Institution / Organization">
                      <input
                        type="text"
                        value={institution}
                        onChange={e => setInstitution(e.target.value)}
                        placeholder="e.g. MIT, IBM Quantum, Rigetti Computing"
                        style={inputStyle(cfg.accentColor)}
                        onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                        onBlur={e => (e.target.style.borderColor = '#CBD5E1')}
                      />
                    </FieldRow>
                    <FieldRow label="Primary Field of Research">
                      <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="e.g. Fault-Tolerant Quantum Computing, VQE"
                        style={inputStyle(cfg.accentColor)}
                        onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                        onBlur={e => (e.target.style.borderColor = '#CBD5E1')}
                      />
                    </FieldRow>
                  </>
                )}

                {authTab === 'signup' && currentRole === 'student' && (
                  <>
                    <FieldRow label="School / University">
                      <input
                        type="text"
                        value={institution}
                        onChange={e => setInstitution(e.target.value)}
                        placeholder="e.g. Stanford University Department of Physics"
                        style={inputStyle(cfg.accentColor)}
                        onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                        onBlur={e => (e.target.style.borderColor = '#CBD5E1')}
                      />
                    </FieldRow>
                    <FieldRow label="Year / Level of Study">
                      <input
                        type="text"
                        value={grade}
                        onChange={e => setGrade(e.target.value)}
                        placeholder="e.g. Undergraduate Physics (Year 3)"
                        style={inputStyle(cfg.accentColor)}
                        onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                        onBlur={e => (e.target.style.borderColor = '#CBD5E1')}
                      />
                    </FieldRow>
                  </>
                )}

                <FieldRow label="Password">
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={authTab === 'signup' ? 'Min. 6 characters' : '••••••••'}
                      required
                      style={{ ...inputStyle(cfg.accentColor), paddingRight: 40 }}
                      onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                      onBlur={e => (e.target.style.borderColor = '#CBD5E1')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      tabIndex={-1}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        display: 'flex',
                        padding: 2,
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FieldRow>

                {error && (
                  <div
                    style={{
                      background: '#FFF1F2',
                      border: '1px solid #FECDD3',
                      borderRadius: 8,
                      padding: '10px 12px',
                      fontSize: 13,
                      color: '#BE123C',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>⚠</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="card-lift"
                  style={{
                    marginTop: 4,
                    padding: '12px 0',
                    background: cfg.gradient,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.75 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {loading ? (
                    <span>Verifying with Database...</span>
                  ) : (
                    <>
                      <span>{authTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div
                style={{
                  marginTop: 18,
                  textAlign: 'center',
                  fontSize: 12.5,
                  color: '#64748B',
                }}
              >
                {authTab === 'login' ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('signup')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: cfg.accentColor,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Create one
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: cfg.accentColor,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>{label}</span>
    {children}
  </label>
);

const inputStyle = (accentColor: string): React.CSSProperties => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  fontSize: 13.5,
  borderRadius: 8,
  border: '1px solid #CBD5E1',
  background: '#F8FAFC',
  color: '#0F172A',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
});

export default AuthModal;
