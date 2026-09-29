// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Header, ActiveView } from './components/layout/Header';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { Footer } from './components/layout/Footer';
import { LandingPageView } from './components/views/LandingPageView';
import { StudentLearningGenomeView } from './components/views/StudentLearningGenomeView';
import { DashboardView } from './components/views/DashboardView';

import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ModuleList } from './components/curriculum/ModuleList';
import { LessonViewer } from './components/curriculum/LessonViewer';
import { BlochLabView } from './components/views/BlochLabView';
import { CircuitPlaygroundView } from './components/views/CircuitPlaygroundView';
import { TeleportationLabView } from './components/views/TeleportationLabView';
import { QFTLabView } from './components/views/QFTLabView';
import { ShorAlgorithmView } from './components/views/ShorAlgorithmView';
import { RoadmapView } from './components/views/RoadmapView';
import { QuizPracticeView } from './components/views/QuizPracticeView';
import { ChallengeHub } from './components/challenges/ChallengeHub';
import { ChallengeRunner } from './components/challenges/ChallengeRunner';
import { DiracAIPanel } from './components/ai/DiracAIPanel';
import { DemoTourModal } from './components/views/DemoTourModal';
import { LessonContent, Challenge, UserProgress, CircuitGate } from './types';
import { soundEffects } from './audio/soundEffects';
import { LearnerModelService } from './learner/learnerModel';
import { CURRICULUM_MODULES } from './components/curriculum/curriculumData';
import { authService, AuthUser, UserRole } from './auth/authService';
import { AuthModal } from './components/auth/AuthPage';
import { StudentDashboard } from './components/auth/StudentDashboard';
import { ResearcherDashboard } from './components/auth/ResearcherDashboard';
import { AlgorithmLibraryView } from './components/views/AlgorithmLibraryView';
import { BackendComparisonView } from './components/views/BackendComparisonView';
import { AdaptiveChallengeView } from './components/views/AdaptiveChallengeView';

export const App: React.FC = () => {
  // Auth state synced with SQLite backend
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => authService.getSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<UserRole | undefined>(undefined);

  // Left Sidebar Drawer Open/Close State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // View state: defaults to 'landing' (Overview)
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);


  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    level: 1,
    streakDays: 0,
    completedLessons: [],
    completedChallenges: [],
    soundEnabled: true
  });

  const [isDiracAIOpen, setIsDiracAIOpen] = useState<boolean>(false);
  const [diracPrefillPrompt, setDiracPrefillPrompt] = useState<string>('');
  const [diracCircuitContext, setDiracCircuitContext] = useState<{
    gates?: CircuitGate[];
    numQubits?: number;
    finalState?: any;
  }>({});

  // Synchronize session and live progress from SQLite on mount
  // Synchronize session and live progress from SQLite on mount
  useEffect(() => {
    const syncDatabaseState = async () => {
      try {
        const { user } = await authService.getProfile();
        if (user) {
          setAuthUser(user);
        }
        const liveProg = await authService.getLearnerProgress();
        if (liveProg) {
          setProgress(p => ({
            ...p,
            xp: liveProg.xp || 0,
            level: liveProg.level || 1,
            streakDays: liveProg.streakDays || 0,
            completedLessons: liveProg.completedLessons || [],
            completedChallenges: liveProg.completedChallenges || [],
          }));
          LearnerModelService.syncWithBackendProgress(liveProg.conceptMastery);
        }
      } catch (e) {
        console.warn('Initial SQLite sync error:', e);
      }
    };
    syncDatabaseState();
  }, []);

  const handleToggleSound = () => {
    const next = !progress.soundEnabled;
    soundEffects.setEnabled(next);
    setProgress(p => ({ ...p, soundEnabled: next }));
  };

  const handleCompleteLesson = (lessonId: string, xpGain: number) => {
    // Persist directly to SQLite database
    authService.recordLessonComplete(lessonId, xpGain).then(updated => {
      if (updated) {
        setProgress(p => ({
          ...p,
          xp: updated.xp,
          level: updated.level,
          streakDays: updated.streakDays,
          completedLessons: updated.completedLessons,
        }));
      }
    });

    setProgress(p => ({
      ...p,
      xp: p.xp + xpGain,
      completedLessons: p.completedLessons.includes(lessonId)
        ? p.completedLessons
        : [...p.completedLessons, lessonId],
    }));
    LearnerModelService.recordQuizAttempt('qubit', true);
    LearnerModelService.recordQuizAttempt('superposition', true);
  };

  const handleSolveChallenge = (challengeId: string, xpGain: number) => {
    // Persist directly to SQLite database
    authService.recordChallengeComplete(challengeId, xpGain).then(updated => {
      if (updated) {
        setProgress(p => ({
          ...p,
          xp: updated.xp,
          level: updated.level,
          completedChallenges: updated.completedChallenges,
        }));
      }
    });

    setProgress(p => ({
      ...p,
      xp: p.xp + xpGain,
      completedChallenges: p.completedChallenges.includes(challengeId)
        ? p.completedChallenges
        : [...p.completedChallenges, challengeId],
    }));
    LearnerModelService.recordSimulationInteraction('entanglement');
  };

  const handleOpenDiracWithPrompt = (
    prompt: string,
    context?: { gates?: CircuitGate[]; numQubits?: number; finalState?: any }
  ) => {
    setDiracPrefillPrompt(prompt);
    if (context) setDiracCircuitContext(context);
    setIsDiracAIOpen(true);
  };

  const handleNavSelect = (view: ActiveView) => {
    setActiveView(view);
    if (view === 'curriculum') setActiveLesson(null);
    if (view === 'challenges') setActiveChallenge(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLessonById = (lessonId: string) => {
    for (const mod of CURRICULUM_MODULES) {
      const found = mod.lessons.find(l => l.id === lessonId);
      if (found) {
        setActiveLesson(found);
        setActiveView('curriculum');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
  };

  const handleOpenAuth = (role?: UserRole) => {
    setAuthModalDefaultRole(role);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = async (user: AuthUser) => {
    setAuthUser(user);
    setIsAuthModalOpen(false);

    // Sync live progress from SQLite for this user
    try {
      const liveProg = await authService.getLearnerProgress();
      if (liveProg) {
        setProgress(p => ({
          ...p,
          xp: liveProg.xp || 0,
          level: liveProg.level || 1,
          streakDays: liveProg.streakDays || 0,
          completedLessons: liveProg.completedLessons || [],
          completedChallenges: liveProg.completedChallenges || [],
        }));
        LearnerModelService.syncWithBackendProgress(liveProg.conceptMastery);
      }
    } catch (e) {
      console.warn('Failed to sync progress on auth success:', e);
    }

    // Navigate automatically to dedicated role workspace
    const isResearcher = user.role === 'researcher' || user.role === 'teacher';
    setActiveView(isResearcher ? 'researcher-dashboard' : 'student-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    authService.logout();
    LearnerModelService.resetToZero();
    setAuthUser(null);
    setProgress({
      xp: 0,
      level: 1,
      streakDays: 0,
      completedLessons: [],
      completedChallenges: [],
      soundEnabled: true
    });
    // Return gracefully to overview landing page
    setActiveView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAF8', color: '#111111' }}>
      {/* Top Header Bar (Hidden on Landing Page) */}
      {activeView !== 'landing' && (
        <Header
          activeView={activeView}
          onSelectView={handleNavSelect}
          xp={progress.xp}
          streakDays={progress.streakDays}
          soundEnabled={progress.soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenDiracAI={() => setIsDiracAIOpen(true)}
          onOpenDemoTour={() => setIsDemoTourOpen(true)}
          authUser={authUser}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />
      )}


      {/* Collapsible Left Navigation Drawer (Hidden on Landing Page) */}
      {activeView !== 'landing' && (
        <LeftSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(prev => !prev)}
          activeView={activeView}
          onSelectView={handleNavSelect}
          authUser={authUser}
          onOpenDiracAI={() => setIsDiracAIOpen(true)}
        />
      )}

      <main style={{
        flex: 1,
        paddingBottom: '40px',
        marginLeft: activeView === 'landing' ? '0px' : (isSidebarOpen ? '260px' : '64px'),
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>

        <ErrorBoundary>
          {activeView === 'landing' && (
            <LandingPageView
              onNavigateToView={handleNavSelect}
              onSelectLesson={handleSelectLessonById}
              onAskDirac={handleOpenDiracWithPrompt}
              onOpenAuth={handleOpenAuth}
              onAuthSuccess={handleAuthSuccess}
              authUser={authUser}
            />
          )}

          {activeView === 'student-dashboard' && (
            authUser ? (
              <StudentDashboard
                user={authUser}
                onLogout={handleLogout}
                onNavigateToView={handleNavSelect}
              />
            ) : (
              <div style={{ maxWidth: 500, margin: '80px auto', padding: '40px 32px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #BFDBFE', boxShadow: '0 8px 32px rgba(37,99,235,0.10)', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: 28 }}>🎓</span>
                </div>
                <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Login Required</h2>
                <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: 14 }}>Please sign in as a Student to access your personal learning dashboard and progress.</p>
                <button
                  onClick={() => handleOpenAuth('student')}
                  style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', color: '#FFF', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In as Student
                </button>
              </div>
            )
          )}

          {(activeView === 'researcher-dashboard' || activeView === 'teacher-dashboard') && (
            authUser && (authUser.role === 'researcher' || authUser.role === 'teacher') ? (
              <ResearcherDashboard
                user={authUser}
                onLogout={handleLogout}
                onNavigateToView={handleNavSelect}
              />
            ) : (
              <div style={{ maxWidth: 500, margin: '80px auto', padding: '40px 32px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #A7F3D0', boxShadow: '0 8px 32px rgba(4,120,87,0.10)', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #047857, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: 28 }}>🔬</span>
                </div>
                <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Researcher Login Required</h2>
                <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: 14 }}>Please sign in as a Quantum Researcher to access your experiment workspace, cohort analytics, and hardware benchmarks.</p>
                <button
                  onClick={() => handleOpenAuth('researcher')}
                  style={{ background: 'linear-gradient(135deg, #047857, #059669)', color: '#FFF', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In as Researcher
                </button>
              </div>
            )
          )}


          {(activeView === 'learning-genome' || activeView === 'dashboard') && (
            <StudentLearningGenomeView
              progress={progress}
              onNavigateToView={handleNavSelect}
              onSelectLesson={handleSelectLessonById}
              onAskDirac={handleOpenDiracWithPrompt}
              authUser={authUser}
            />
          )}

          {activeView === 'curriculum' && (
            activeLesson ? (
              <LessonViewer
                lesson={activeLesson}
                onCompleteLesson={handleCompleteLesson}
                onOpenAIWithPrompt={handleOpenDiracWithPrompt}
                onBackToModules={() => setActiveLesson(null)}
              />
            ) : (
              <ModuleList
                completedLessons={progress.completedLessons}
                onSelectLesson={(lesson) => {
                  setActiveLesson(lesson);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )
          )}

          {activeView === 'quiz-practice' && (
            <QuizPracticeView
              onAskDirac={handleOpenDiracWithPrompt}
              onNavigateToRoadmap={() => handleNavSelect('roadmap')}
            />
          )}

          {activeView === 'lab3d' && <BlochLabView onAskDirac={handleOpenDiracWithPrompt} />}
          {activeView === 'playground' && <CircuitPlaygroundView onAskDirac={handleOpenDiracWithPrompt} />}
          {activeView === 'algorithm-library' && (
            <AlgorithmLibraryView
              onAskDirac={handleOpenDiracWithPrompt}
              onNavigateToView={handleNavSelect}
            />
          )}
          {activeView === 'backend-comparison' && (
            <BackendComparisonView
              onAskDirac={handleOpenDiracWithPrompt}
              onNavigateToView={handleNavSelect}
            />
          )}
          {activeView === 'adaptive-challenges' && (
            <AdaptiveChallengeView
              onAskDirac={handleOpenDiracWithPrompt}
            />
          )}
          {activeView === 'teleportation' && <TeleportationLabView onAskDirac={handleOpenDiracWithPrompt} />}
          {activeView === 'qft' && <QFTLabView onAskDirac={handleOpenDiracWithPrompt} />}
          {activeView === 'shor' && <ShorAlgorithmView onAskDirac={handleOpenDiracWithPrompt} />}
          {activeView === 'roadmap' && (
            <RoadmapView onNavigateToView={handleNavSelect} onAskDirac={handleOpenDiracWithPrompt} />
          )}
          {activeView === 'challenges' && (
            activeChallenge ? (
              <ChallengeRunner
                challenge={activeChallenge}
                isSolved={progress.completedChallenges.includes(activeChallenge.id)}
                onSolveChallenge={handleSolveChallenge}
                onBack={() => setActiveChallenge(null)}
              />
            ) : (
              <ChallengeHub
                completedChallenges={progress.completedChallenges}
                onSelectChallenge={(challenge) => {
                  setActiveChallenge(challenge);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )
          )}
        </ErrorBoundary>
      </main>

      <DiracAIPanel
        isOpen={isDiracAIOpen}
        onClose={() => setIsDiracAIOpen(false)}
        activeCircuitGates={diracCircuitContext.gates}
        numQubits={diracCircuitContext.numQubits}
        finalState={diracCircuitContext.finalState}
        prefillPrompt={diracPrefillPrompt}
        onClearPrefill={() => setDiracPrefillPrompt('')}
        userLevel={progress.level}
      />

      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigateToView={handleNavSelect}
        onOpenDiracAIWithPrompt={handleOpenDiracWithPrompt}
      />

      <div style={{
        marginLeft: activeView === 'landing' ? '0px' : (isSidebarOpen ? '260px' : '64px'),
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <Footer />
      </div>


      {/* Unified Project Auth Modal Dialog */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultRole={authModalDefaultRole}
      />
    </div>
  );
};

export default App;
