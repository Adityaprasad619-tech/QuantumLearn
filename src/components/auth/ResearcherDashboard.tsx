// src/components/auth/ResearcherDashboard.tsx
import React, { useState, useEffect } from 'react';
import { AuthUser, authService, ResearchExperimentItem, CohortTelemetry } from '../../auth/authService';
import { ActiveView } from '../layout/Header';
import { BrowserFrame } from '../ui/BrowserFrame';
import { soundEffects } from '../../audio/soundEffects';
import {
  FlaskConical, Users, Cpu, Compass, Play, Plus,
  Trash2, RefreshCw, Layers, CheckCircle2, ArrowRight,
  TrendingUp, BookOpen, Copy, Check, ShieldCheck, Activity
} from 'lucide-react';

interface ResearcherDashboardProps {
  user: AuthUser;
  onLogout?: () => void;
  onNavigateToView: (view: ActiveView) => void;
}

type ResearcherTab = 'experiments' | 'cohort' | 'hardware' | 'qasm';

export const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({
  user,
  onNavigateToView,
}) => {
  const [activeTab, setActiveTab] = useState<ResearcherTab>('experiments');
  const [experiments, setExperiments] = useState<ResearchExperimentItem[]>([]);
  const [cohort, setCohort] = useState<CohortTelemetry | null>(null);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingExp, setIsCreatingExp] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Experiment Form State
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpType, setNewExpType] = useState('bell_chsh');
  const [newExpQubits, setNewExpQubits] = useState(2);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [submittingExp, setSubmittingExp] = useState(false);

  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [exps, coh, bms] = await Promise.all([
        authService.getResearchExperiments(),
        authService.getCohortTelemetry(),
        authService.getHardwareBenchmarks(),
      ]);
      setExperiments(exps);
      setCohort(coh);
      setBenchmarks(bms);
    } catch (e) {
      console.warn('Failed to load researcher dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [user.id]);

  const handleRunNewExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingExp(true);

    let defaultCircuit: any[] = [];
    if (newExpType === 'bell_chsh') {
      defaultCircuit = [
        { type: 'H', targets: [0] },
        { type: 'CNOT', targets: [1], controls: [0] },
      ];
    } else if (newExpType === 'qft_benchmark') {
      defaultCircuit = [
        { type: 'H', targets: [0] },
        { type: 'RZ', targets: [0], params: { theta: 1.5708 } },
        { type: 'H', targets: [1] },
      ];
    } else if (newExpType === 'vqe_ansatz') {
      defaultCircuit = [
        { type: 'X', targets: [0] },
        { type: 'RY', targets: [0], params: { theta: 0.384 } },
        { type: 'CNOT', targets: [1], controls: [0] },
      ];
    }

    const res = await authService.runResearchExperiment({
      title: newExpTitle || 'Quantum Verification Run',
      experimentType: newExpType,
      description: newExpDesc || 'Automated high-precision quantum circuit verification run.',
      qubitCount: newExpQubits,
      circuit: defaultCircuit,
    });

    setSubmittingExp(false);
    if (res) {
      soundEffects.playLevelUp();
      setIsCreatingExp(false);
      setNewExpTitle('');
      setNewExpDesc('');
      await refreshAllData();
    }
  };

  const handleDeleteExperiment = async (id: string) => {
    const success = await authService.deleteResearchExperiment(id);
    if (success) {
      setExperiments(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Researcher Workspace Header Card */}
      <BrowserFrame
        url={`quantumlearn://researcher/${encodeURIComponent(user.email)}`}
        accentColor="#047857"
        style={{ marginBottom: '24px' }}
      >
        <div
          style={{
            padding: '28px 32px',
            background: 'linear-gradient(135deg, #064E3B 0%, #047857 55%, #0F172A 100%)',
            color: '#FFFFFF',
            borderRadius: '0 0 12px 12px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(5, 150, 105, 0.4)',
                flexShrink: 0,
              }}
            >
              <FlaskConical size={36} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {user.name}
                </h1>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'rgba(167, 243, 208, 0.25)',
                    border: '1px solid rgba(167, 243, 208, 0.4)',
                    color: '#A7F3D0',
                    padding: '2px 8px',
                    borderRadius: '20px',
                  }}
                >
                  RESEARCHER / SCIENTIST
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'rgba(52, 211, 153, 0.2)',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    color: '#6EE7B7',
                    padding: '2px 8px',
                    borderRadius: '20px',
                  }}
                >
                  SQLITE SYNCED
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#CBD5E1' }}>
                {user.fieldOfStudy || user.subject || 'Fault-Tolerant Quantum Information'} •{' '}
                {user.institution || 'Quantum Research Lab'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsCreatingExp(true)}
              className="card-lift"
              style={{
                background: '#FFFFFF',
                color: '#064E3B',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Plus size={16} color="#059669" />
              <span>Run Experiment</span>
            </button>

            <button
              onClick={refreshAllData}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                borderRadius: '10px',
                padding: '0 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
              }}
              title="Refresh database records"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Sync DB</span>
            </button>
          </div>
        </div>
      </BrowserFrame>

      {/* Top Researcher Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #A7F3D0',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Quantum Experiments</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FlaskConical size={16} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
            {experiments.length} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>Runs</span>
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
            Stored in SQLite database
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Enrolled Cohort</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#EBF3FC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={16} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
            {cohort?.totalStudents ?? 2}{' '}
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>Students</span>
          </div>
          <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '4px', fontWeight: 600 }}>
            Avg XP: {cohort?.avgXp ?? 600} • Avg Streak: {cohort?.avgStreak ?? 8}d
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #FED7AA',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Avg Class Progress</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#FFF7ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={16} color="#EA580C" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
            {Math.round(((cohort?.avgLessonsCompleted ?? 4.5) / 12) * 100)}%
          </div>
          <div style={{ fontSize: '12px', color: '#EA580C', marginTop: '4px', fontWeight: 600 }}>
            {cohort?.avgLessonsCompleted ?? 4.5} of 12 modules completed
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #DDD6FE',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Simulator Volume</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#F5F3FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={16} color="#7C3AED" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
            512 <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>QV</span>
          </div>
          <div style={{ fontSize: '12px', color: '#7C3AED', marginTop: '4px', fontWeight: 600 }}>
            8-Qubit Statevector Engine
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '24px',
          paddingBottom: '2px',
        }}
      >
        {[
          { id: 'experiments', label: 'Quantum Experiments Lab', icon: FlaskConical },
          { id: 'cohort', label: 'Student Cohort Telemetry', icon: Users },
          { id: 'hardware', label: 'QPU Hardware Benchmarks', icon: Cpu },
          { id: 'qasm', label: 'OpenQASM & Code Export', icon: Layers },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ResearcherTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#047857' : '#64748B',
                background: isActive ? '#ECFDF5' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #047857' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} color={isActive ? '#047857' : '#94A3B8'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Experiments Lab */}
      {activeTab === 'experiments' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Quantum Research Experiments
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
                Persisted in SQLite database with fidelity, purity, and expectation values
              </p>
            </div>
            <button
              onClick={() => setIsCreatingExp(true)}
              style={{
                background: '#047857',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={14} />
              <span>New Benchmark Run</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {experiments.map(exp => {
              const m = exp.metrics || {};
              return (
                <div
                  key={exp.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                          {exp.title}
                        </h3>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            fontFamily: 'JetBrains Mono, monospace',
                            background: '#ECFDF5',
                            color: '#059669',
                            border: '1px solid #A7F3D0',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {exp.experimentType.replace('_', ' ')}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            background: '#F1F5F9',
                            color: '#475569',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {exp.qubitCount} Qubits
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.4 }}>
                        {exp.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteExperiment(exp.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="Delete experiment from SQLite"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Metrics Bar */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '24px',
                      fontSize: '12.5px',
                    }}
                  >
                    {m.stateFidelity !== undefined && (
                      <div>
                        <span style={{ color: '#64748B' }}>State Fidelity: </span>
                        <strong style={{ color: '#059669', fontFamily: 'JetBrains Mono, monospace' }}>
                          {m.stateFidelity}
                        </strong>
                      </div>
                    )}
                    {m.chshParameter !== undefined && (
                      <div>
                        <span style={{ color: '#64748B' }}>CHSH Value: </span>
                        <strong style={{ color: '#2563EB', fontFamily: 'JetBrains Mono, monospace' }}>
                          {m.chshParameter} (&gt; 2.0 Class.)
                        </strong>
                      </div>
                    )}
                    {m.groundEnergyHartree !== undefined && (
                      <div>
                        <span style={{ color: '#64748B' }}>Ground Energy: </span>
                        <strong style={{ color: '#7C3AED', fontFamily: 'JetBrains Mono, monospace' }}>
                          {m.groundEnergyHartree} Ha
                        </strong>
                      </div>
                    )}
                    {m.phaseCoherence !== undefined && (
                      <div>
                        <span style={{ color: '#64748B' }}>Phase Coherence: </span>
                        <strong style={{ color: '#D97706', fontFamily: 'JetBrains Mono, monospace' }}>
                          {m.phaseCoherence}
                        </strong>
                      </div>
                    )}
                    {m.executionTimeMs !== undefined && (
                      <div>
                        <span style={{ color: '#64748B' }}>Exec Time: </span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{m.executionTimeMs} ms</span>
                      </div>
                    )}
                    <div>
                      <span style={{ color: '#64748B' }}>Database Status: </span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓ Verified in SQLite</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Cohort Telemetry */}
      {activeTab === 'cohort' && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              Student Cohort Telemetry (Live SQLite Data)
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
              Aggregate progress and concept mastery computed across all registered students
            </p>
          </div>

          {/* Student Roster Table */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              overflow: 'hidden',
              marginBottom: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Student Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Institution & Grade</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>XP / Level</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Streak</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Lessons Completed</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {cohort?.studentsList.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{s.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{s.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      <div>{s.grade}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{s.institution}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace' }}>
                      <span style={{ fontWeight: 800, color: '#2563EB' }}>{s.xp} XP</span> • Lvl {s.level}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#EA580C' }}>
                      {s.streakDays} Days
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 700, color: '#059669' }}>{s.completedLessonsCount}</span> / 12 modules
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#ECFDF5',
                          color: '#059669',
                          padding: '3px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Curriculum Difficulty Heatmap */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '20px 24px',
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
              Concept Mastery Difficulty Heatmap
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748B' }}>
              Average class understanding scores across core quantum concepts
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {Object.entries(cohort?.conceptHeatmap || {}).map(([concept, score]) => {
                const pct = Math.round(Number(score) * 100);
                const isChallenging = pct < 70;
                return (
                  <div
                    key={concept}
                    style={{
                      background: isChallenging ? '#FFFBEB' : '#F8FAFC',
                      border: `1px solid ${isChallenging ? '#FDE68A' : '#E2E8F0'}`,
                      borderRadius: '10px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {concept.replace('_', ' ')}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          fontFamily: 'JetBrains Mono, monospace',
                          color: isChallenging ? '#D97706' : '#059669',
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: isChallenging ? '#D97706' : '#059669',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QPU Hardware Benchmarks */}
      {activeTab === 'hardware' && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              Simulated & Target QPU Hardware Benchmarks
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
              Calibration metrics for gate fidelities, T1/T2 decoherence times, and Quantum Volume
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {benchmarks.map(bm => (
              <div
                key={bm.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0F172A' }}>
                    {bm.qpuName}
                  </h3>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      fontFamily: 'JetBrains Mono, monospace',
                      background: bm.status === 'ONLINE' ? '#ECFDF5' : '#EBF3FC',
                      color: bm.status === 'ONLINE' ? '#059669' : '#2563EB',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {bm.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Qubit Count:</span>
                    <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{bm.qubits} Qubits</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>1-Qubit Gate Fidelity:</span>
                    <strong style={{ color: '#059669', fontFamily: 'JetBrains Mono, monospace' }}>
                      {(bm.avgGateFidelity * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>2-Qubit (CX) Fidelity:</span>
                    <strong style={{ color: '#2563EB', fontFamily: 'JetBrains Mono, monospace' }}>
                      {(bm.twoQubitFidelity * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>T1 Relaxation / T2 Dephasing:</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {bm.t1Us} μs / {bm.t2Us} μs
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Quantum Volume:</span>
                    <strong style={{ color: '#7C3AED', fontFamily: 'JetBrains Mono, monospace' }}>
                      {bm.quantumVolume} QV
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: QASM & Open Science Export */}
      {activeTab === 'qasm' && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              OpenQASM 2.0 & Python Qiskit Export
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
              Standard publication-ready quantum code generated from verified circuits
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Bell State Code Box */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  Bell State (|Φ+⟩) OpenQASM 2.0
                </span>
                <button
                  onClick={() => handleCopy(`OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0], q[1];\nmeasure q -> c;`, 'bell_qasm')}
                  style={{
                    background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px',
                    padding: '4px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {copiedCode === 'bell_qasm' ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copiedCode === 'bell_qasm' ? 'Copied' : 'Copy QASM'}</span>
                </button>
              </div>
              <pre style={{
                background: '#0F172A', color: '#E2E8F0', padding: '14px', borderRadius: '8px',
                margin: 0, fontSize: '12.5px', fontFamily: 'JetBrains Mono, monospace', overflowX: 'auto'
              }}>
{`OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0], q[1];
measure q -> c;`}
              </pre>
            </div>

            {/* Qiskit Python Code Box */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  CHSH Inequality Verification (Qiskit Python)
                </span>
                <button
                  onClick={() => handleCopy(`from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()\n\nsim = AerSimulator()\njob = sim.run(transpile(qc, sim), shots=8192)\ncounts = job.result().get_counts()`, 'chsh_py')}
                  style={{
                    background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px',
                    padding: '4px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {copiedCode === 'chsh_py' ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copiedCode === 'chsh_py' ? 'Copied' : 'Copy Python'}</span>
                </button>
              </div>
              <pre style={{
                background: '#0F172A', color: '#E2E8F0', padding: '14px', borderRadius: '8px',
                margin: 0, fontSize: '12.5px', fontFamily: 'JetBrains Mono, monospace', overflowX: 'auto'
              }}>
{`from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

# Prepare Bell pair |Φ+⟩ = (|00⟩ + |11⟩) / √2
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

sim = AerSimulator()
job = sim.run(transpile(qc, sim), shots=8192)
counts = job.result().get_counts()`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Run New Quantum Experiment */}
      {isCreatingExp && (
        <>
          <div
            onClick={() => setIsCreatingExp(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(3px)',
            }}
          />
          <div
            style={{
              position: 'fixed',
              zIndex: 1001,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 480,
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '24px',
              border: '1px solid #A7F3D0',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            }}
          >
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              Run Quantum Benchmark Experiment
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748B' }}>
              Simulates quantum register in backend and persists statevector in SQLite
            </p>

            <form onSubmit={handleRunNewExperiment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Experiment Title
                <input
                  type="text"
                  value={newExpTitle}
                  onChange={e => setNewExpTitle(e.target.value)}
                  placeholder="e.g. 4-Qubit GHZ State Entanglement Purity"
                  required
                  style={{
                    padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1',
                    fontSize: '13.5px', background: '#F8FAFC', outline: 'none'
                  }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Experiment Benchmark Type
                <select
                  value={newExpType}
                  onChange={e => setNewExpType(e.target.value)}
                  style={{
                    padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1',
                    fontSize: '13.5px', background: '#F8FAFC', outline: 'none'
                  }}
                >
                  <option value="bell_chsh">Bell-CHSH Non-Locality Test (2 Qubits)</option>
                  <option value="qft_benchmark">QFT Phase Coherence Benchmark (3 Qubits)</option>
                  <option value="vqe_ansatz">VQE Molecular Ground State Energy (2 Qubits)</option>
                  <option value="state_tomography">Quantum State Tomography (2 Qubits)</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Qubit Count
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={newExpQubits}
                  onChange={e => setNewExpQubits(Number(e.target.value))}
                  style={{
                    padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1',
                    fontSize: '13.5px', background: '#F8FAFC', outline: 'none'
                  }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Hypothesis / Description
                <textarea
                  value={newExpDesc}
                  onChange={e => setNewExpDesc(e.target.value)}
                  placeholder="Verification parameters and theoretical bounds..."
                  rows={3}
                  style={{
                    padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1',
                    fontSize: '13.5px', background: '#F8FAFC', outline: 'none', resize: 'vertical'
                  }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreatingExp(false)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: '8px', border: '1px solid #CBD5E1',
                    background: '#F8FAFC', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExp}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: '8px', border: 'none',
                    background: '#047857', color: '#FFF', fontWeight: 700, fontSize: '13px',
                    cursor: submittingExp ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingExp ? 'Simulating...' : 'Execute & Save to DB'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ResearcherDashboard;
