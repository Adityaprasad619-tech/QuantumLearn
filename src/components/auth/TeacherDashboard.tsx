// src/components/auth/TeacherDashboard.tsx
import React, { useState, useEffect } from 'react';
import { AuthUser, authService } from '../../auth/authService';
import { ActiveView } from '../layout/Header';
import { BrowserFrame } from '../ui/BrowserFrame';
import { soundEffects } from '../../audio/soundEffects';
import {
  BookOpen, Users, BarChart2, Atom, Award,
  TrendingUp, Clock, ChevronRight, Zap, Star, GraduationCap,
  RefreshCw, CheckCircle2, Compass, Cpu, Layers, ArrowRight,
  ShieldCheck, FileText, ExternalLink
} from 'lucide-react';

interface TeacherDashboardProps {
  user: AuthUser;
  onLogout?: () => void;
  onNavigateToView: (view: ActiveView) => void;
}

type TeacherTab = 'overview' | 'students' | 'resources';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  onNavigateToView
}) => {
  const [students, setStudents] = useState<AuthUser[]>([]);
  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');

  const refreshStudents = () => {
    setStudents(authService.getAllStudents());
  };

  useEffect(() => {
    refreshStudents();
  }, []);

  const stats = [
    {
      icon: Users,
      label: 'Enrolled Students',
      value: students.length.toString(),
      sub: 'Active local students',
      color: '#2563EB',
      bg: '#EBF3FC',
      border: '#BFDBFE'
    },
    {
      icon: Atom,
      label: 'Curriculum Modules',
      value: '8 Modules',
      sub: '4 Fundamental + 4 Advanced',
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE'
    },
    {
      icon: Award,
      label: 'Challenge Problem Sets',
      value: '12 Problems',
      sub: 'State prep & algorithm synthesis',
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A'
    },
    {
      icon: TrendingUp,
      label: 'Avg. Class Progress',
      value: '68%',
      sub: '+14% this week',
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0'
    },
  ];

  const classroomLabs: {
    view: ActiveView;
    title: string;
    desc: string;
    icon: any;
    color: string;
    bg: string;
  }[] = [
    {
      view: 'lab3d',
      title: '3D Bloch Sphere Demonstration',
      desc: 'Interactive visual state rotations (H, X, Y, Z, S gates) on 3D coordinates',
      icon: Compass,
      color: '#2563EB',
      bg: '#EBF3FC'
    },
    {
      view: 'playground',
      title: 'Multi-Qubit Circuit Builder',
      desc: 'Build Bell states, superposition, and measure quantum probabilities in real time',
      icon: Cpu,
      color: '#7C3AED',
      bg: '#F5F3FF'
    },
    {
      view: 'teleportation',
      title: 'Quantum Teleportation Protocol',
      desc: 'Step-through simulation of EPR pair entanglement and classical message transfer',
      icon: Layers,
      color: '#059669',
      bg: '#ECFDF5'
    },
    {
      view: 'shor',
      title: "Shor's Period-Finding Algorithm",
      desc: 'Class demonstration of modular exponentiation and quantum period finding',
      icon: Zap,
      color: '#D97706',
      bg: '#FFFBEB'
    }
  ];

  const curriculumResources = [
    { id: 'mod-1', title: 'Classical Bits vs Qubits', type: 'Core Lecture', status: 'Published', studentsComplete: '92%' },
    { id: 'mod-2', title: 'Single-Qubit Rotations & Bloch Sphere', type: 'Visual Lab', status: 'Published', studentsComplete: '84%' },
    { id: 'mod-3', title: 'Entanglement & Bell States', type: 'Hands-on Lab', status: 'Published', studentsComplete: '71%' },
    { id: 'mod-4', title: 'Quantum Teleportation Protocol', type: 'Interactive Lab', status: 'Published', studentsComplete: '65%' },
    { id: 'mod-5', title: 'Quantum Fourier Transform (QFT)', type: 'Advanced Algorithm', status: 'Published', studentsComplete: '48%' },
    { id: 'mod-6', title: "Shor's Factoring Algorithm", type: 'Advanced Algorithm', status: 'Published', studentsComplete: '35%' },
  ];

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '28px 20px 80px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {/* 1. HERO BANNER IN BROWSER MOCKUP FRAME */}
      <BrowserFrame
        urlPath="quantum-learn://educator-command-center"
        badge="EDUCATOR PORTAL"
        badgeColor="coral"
        gridBackground={true}
        contentStyle={{ padding: '36px' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.5fr) minmax(280px, 1fr)',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="emerald-pill-badge floating-element">
                <BookOpen size={13} />
                <span>Instructor Command Center</span>
              </span>
              <span className="navy-pill-badge">
                <span>{user.subject || 'Quantum Computing'}</span>
              </span>
            </div>

            <h1 className="editorial-title" style={{ fontSize: '38px', margin: 0, lineHeight: 1.15 }}>
              Welcome,{' '}
              <span style={{ color: '#047857' }}>
                {user.name}
              </span>
            </h1>

            <p className="editorial-subtitle" style={{ fontSize: '15.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
              Manage and track your enrolled students, review lesson completion rates, and launch interactive 3D simulations directly during lectures.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '6px' }}>
              <button
                className="btn-coral-action"
                onClick={() => {
                  soundEffects.playGateClick();
                  onNavigateToView('lab3d');
                }}
              >
                <Compass size={16} />
                <span>Launch 3D Bloch Lecture</span>
              </button>

              <button
                className="btn-editorial-primary"
                onClick={() => {
                  soundEffects.playGateClick();
                  onNavigateToView('playground');
                }}
              >
                <Atom size={16} />
                <span>Open Circuit Demo</span>
              </button>
            </div>
          </div>

          {/* Right Column: Instructor Credentials Card */}
          <div
            className="card-lift"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #A7F3D0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(4, 120, 87, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{user.name}</div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>{user.email}</div>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Academic Institution:</span>
                <span style={{ fontWeight: 700, color: '#047857' }}>{user.institution || 'Quantum Institute'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Department / Subject:</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{user.subject || 'Physics'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Instructor Role:</span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontWeight: 700, color: '#047857'
                }}>
                  <ShieldCheck size={14} /> Verified Educator
                </span>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>

      {/* 2. STATS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card-lift"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${stat.border}`,
                borderRadius: '14px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
                flexShrink: 0
              }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  {stat.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. SUB-TABS NAVIGATION BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1.5px solid #E2E8F0',
        paddingBottom: '12px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'overview' as const, label: 'Overview & Tools', icon: BarChart2 },
            { id: 'students' as const, label: `Student Roster (${students.length})`, icon: Users },
            { id: 'resources' as const, label: 'Curriculum & Lectures', icon: BookOpen }
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  soundEffects.playGateClick();
                  setActiveTab(id);
                }}
                className="card-lift"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: isActive ? '#047857' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  border: `1.5px solid ${isActive ? '#047857' : '#E2E8F0'}`,
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 12px rgba(4, 120, 87, 0.2)' : 'none'
                }}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'students' && (
          <button
            onClick={() => {
              soundEffects.playGateClick();
              refreshStudents();
            }}
            className="card-lift"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} />
            <span>Refresh Roster</span>
          </button>
        )}
      </div>

      {/* 4. TAB CONTENTS */}
      {/* TAB 1: OVERVIEW & CLASSROOM DEMONSTRATION TOOLS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h2 className="editorial-title" style={{ fontSize: '20px', margin: '0 0 6px 0' }}>
              Classroom Lecture & Lab Demonstration Tools
            </h2>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B' }}>
              Launch these interactive simulations during live lectures to illustrate abstract quantum mechanics concepts.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {classroomLabs.map((lab) => {
              const Icon = lab.icon;
              return (
                <div
                  key={lab.view}
                  className="card-lift"
                  onClick={() => {
                    soundEffects.playGateClick();
                    onNavigateToView(lab.view);
                  }}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: lab.bg,
                    color: lab.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                      {lab.title}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.4 }}>
                      {lab.desc}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: lab.color,
                    marginTop: 'auto',
                    paddingTop: '8px'
                  }}>
                    <span>Launch in Classroom</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Class Activity */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '16px',
            padding: '22px 24px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
          }}>
            <h3 className="editorial-title" style={{ fontSize: '17px', margin: '0 0 14px 0' }}>
              Recent Student Submissions & Milestones
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { student: 'Alex Rivera', action: 'Solved Bell State Synthesizer Challenge', time: '14 mins ago', tag: 'CHALLENGE' },
                { student: 'Maya Lin', action: 'Completed Module 1: Classical Bits vs Qubits', time: '1 hour ago', tag: 'LESSON' },
                { student: 'Priya Sharma', action: 'Simulated 3-Qubit Quantum Teleportation circuit', time: '3 hours ago', tag: 'LAB' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #F1F5F9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#EBF3FC',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800
                    }}>
                      {item.student.charAt(0)}
                    </div>
                    <div>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{item.student}</span>
                      <span style={{ fontSize: '13px', color: '#64748B', marginLeft: '6px' }}>{item.action}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '9.5px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 800,
                      background: '#EBF3FC',
                      color: '#2563EB',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {item.tag}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ROSTER */}
      {activeTab === 'students' && (
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1.5px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 className="editorial-title" style={{ fontSize: '18px', margin: 0 }}>
                Enrolled Class Roster
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                All registered students on this local instance. New student signups appear here automatically.
              </p>
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#047857',
              background: '#ECFDF5',
              padding: '4px 10px',
              borderRadius: '6px'
            }}>
              {students.length} Students
            </span>
          </div>

          {students.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
              <Users size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#334155' }}>No students registered yet</p>
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                When users create student accounts through the Sign Up modal, they will immediately appear in your class roster.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Student</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Academic Program</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Joined</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 800
                          }}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{student.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                        {student.grade || 'Physics Undergraduate'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#059669',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          <CheckCircle2 size={11} /> Active
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '12.5px', color: '#64748B' }}>
                        {new Date(student.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '80px',
                            height: '6px',
                            borderRadius: '3px',
                            background: '#E2E8F0',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: '65%',
                              height: '100%',
                              background: '#2563EB',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>
                            65%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CURRICULUM & RESOURCES */}
      {activeTab === 'resources' && (
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1.5px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 className="editorial-title" style={{ fontSize: '18px', margin: 0 }}>
                Course Modules & Learning Assets
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                Assigned lesson plans, interactive checks, and laboratory benchmarks
              </p>
            </div>
            <button
              className="btn-editorial-primary"
              onClick={() => onNavigateToView('curriculum')}
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              Open Curriculum Module Viewer →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {curriculumResources.map((res) => (
              <div
                key={res.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: '1px solid #F1F5F9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#EBF3FC',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>{res.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{res.type} · Module {res.id.replace('mod-', '')}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>{res.studentsComplete}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Completion</div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#047857',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '3px 9px',
                    borderRadius: '12px'
                  }}>
                    {res.status}
                  </span>
                  <button
                    onClick={() => onNavigateToView('curriculum')}
                    className="card-lift"
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    View Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
