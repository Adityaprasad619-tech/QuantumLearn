// src/components/curriculum/LessonViewer.tsx
import React, { useState } from 'react';
import { LessonContent, LearningPhase, CircuitGate } from '../../types';
import { QuantumCircuit } from '../../quantum/circuit';
import { BlochSphereScene } from '../canvas3d/BlochSphereScene';
import { CircuitGrid } from '../circuit/CircuitGrid';
import { MeasurementPanel } from '../circuit/MeasurementPanel';
import { StateInspector } from '../circuit/StateInspector';
import { TimelineControls } from '../circuit/TimelineControls';
import { soundEffects } from '../../audio/soundEffects';
import confetti from 'canvas-confetti';
import { BrowserFrame } from '../ui/BrowserFrame';
import {
  BookOpen, Eye, Sliders, HelpCircle, Play, BarChart2,
  CheckCircle2, Sparkles, Award, ArrowRight, ArrowLeft
} from 'lucide-react';
import { TheoryNotes } from './TheoryNotes';
import { BitVsQubitComparison } from './BitVsQubitComparison';
import { QubitFlashCard } from '../canvas3d/QubitFlashCard';

interface LessonViewerProps {
  lesson: LessonContent;
  onCompleteLesson: (lessonId: string, xp: number) => void;
  onOpenAIWithPrompt: (prompt: string) => void;
  onBackToModules: () => void;
}

const PHASES: { phase: LearningPhase; label: string; icon: React.FC<{ size?: number }> }[] = [
  { phase: 'LEARN', label: 'Theory & Notes', icon: BookOpen },
  { phase: 'VISUALIZE', label: '3D Visualization', icon: Eye },
  { phase: 'INTERACT', label: 'Interactive Simulation', icon: Sliders },
  { phase: 'PREDICT', label: 'Prediction Challenge', icon: HelpCircle },
  { phase: 'QUIZ', label: 'Quiz', icon: Award },
  { phase: 'MEASURE', label: 'Practice & Measure', icon: BarChart2 },
  { phase: 'MASTERY', label: 'Mastery', icon: CheckCircle2 }
];

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  onCompleteLesson,
  onOpenAIWithPrompt,
  onBackToModules
}) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [learnSubTab, setLearnSubTab] = useState<'comparison' | 'notes' | 'both'>('comparison');

  // Embedded Quantum Circuit state for this lesson
  const [circuit, setCircuit] = useState<QuantumCircuit>(() => {
    const qc = new QuantumCircuit(lesson.numQubits);
    if (lesson.initialCircuitGates) {
      for (const g of lesson.initialCircuitGates) {
        qc.addGate(g);
      }
    }
    return qc;
  });

  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedGateType, setSelectedGateType] = useState<any>('H');

  // Prediction state
  const [predictSelected, setPredictSelected] = useState<number | null>(null);
  const [predictSubmitted, setPredictSubmitted] = useState<boolean>(false);

  // Quiz state
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [lessonCompleted, setLessonCompleted] = useState<boolean>(false);

  const simulationStates = circuit.simulate();
  const currentStepState = simulationStates[activeStep] || simulationStates[0];
  const finalState = circuit.getFinalState();

  const currentPhase = PHASES[currentPhaseIndex].phase;

  const handleNextPhase = () => {
    if (currentPhaseIndex < PHASES.length - 1) {
      setCurrentPhaseIndex(currentPhaseIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPhase = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhaseIndex(currentPhaseIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePredictSubmit = () => {
    if (predictSelected === null) return;
    setPredictSubmitted(true);
    if (predictSelected === lesson.predictQuestion.correctIndex) {
      soundEffects.playSuccessChord();
    } else {
      soundEffects.playErrorTone();
    }
  };

  const handleQuizSubmit = () => {
    if (quizSelected === null) return;
    setQuizSubmitted(true);
    if (quizSelected === lesson.quiz.correctIndex) {
      soundEffects.playSuccessChord();
    } else {
      soundEffects.playErrorTone();
    }
  };

  const handleClaimMastery = () => {
    if (lessonCompleted) return;
    setLessonCompleted(true);
    soundEffects.playSuccessChord();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onCompleteLesson(lesson.id, 150);
  };

  const handleAddGate = (gate: Omit<CircuitGate, 'id'>) => {
    const updated = new QuantumCircuit(circuit.numQubits, [...circuit.gates]);
    updated.addGate(gate);
    setCircuit(updated);
    setActiveStep(updated.getMaxStep());
  };

  const handleRemoveGate = (id: string) => {
    const updated = new QuantumCircuit(circuit.numQubits, [...circuit.gates]);
    updated.removeGate(id);
    setCircuit(updated);
    setActiveStep(Math.min(activeStep, updated.getMaxStep()));
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
      {/* Top Concept Browser Header */}
      <BrowserFrame
        url={`quantum-lab://curriculum/${lesson.moduleId}/${lesson.id}`}
        badgeText="Active Lesson Lab"
        badgeColor="#F97316"
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="coral-pill-badge" style={{ fontSize: '11px' }}>
                Active Concept Lab
              </span>
              <span className="navy-pill-badge" style={{ fontSize: '11px' }}>
                {lesson.moduleId.toUpperCase()} • {lesson.id.toUpperCase()}
              </span>
            </div>
            <button
              onClick={onBackToModules}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                color: '#1E3A8A',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: '9999px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              <ArrowLeft size={13} />
              <span>Back to Modules</span>
            </button>
          </div>
          <h1 className="editorial-title" style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#1E3A8A',
            letterSpacing: '-0.02em',
            margin: '0 0 8px 0'
          }}>
            {lesson.title}
          </h1>
          <p className="editorial-subtitle" style={{ fontSize: '15px', color: '#334155', margin: 0, lineHeight: '1.6', maxWidth: '850px' }}>
            {lesson.conceptSummary}
          </p>
        </div>
      </BrowserFrame>

      {/* Sticky Progress Indicator */}
      <div style={{
        position: 'sticky',
        top: '56px',
        zIndex: 40,
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.92)',
        border: '1px solid #BFDBFE',
        borderRadius: '9999px',
        padding: '6px 8px',
        overflowX: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
      }}>
        {PHASES.map((p, idx) => {
          const Icon = p.icon;
          const isActive = currentPhaseIndex === idx;
          const isCompleted = currentPhaseIndex > idx;

          return (
            <button
              key={p.phase}
              onClick={() => setCurrentPhaseIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)' : isCompleted ? '#F0FDF4' : 'transparent',
                color: isActive ? '#FFFFFF' : isCompleted ? '#059669' : '#64748B',
                fontSize: '11.5px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(30, 58, 138, 0.25)' : 'none'
              }}
            >
              <Icon size={13} />
              <span>{p.label}</span>
              {isCompleted && <CheckCircle2 size={12} color="#059669" />}
            </button>
          );
        })}
      </div>

      {/* PHASE 1: LEARN (Theory & Physics + Bit vs Qubit Comparison) */}
      {currentPhase === 'LEARN' && (
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
        }}>
          {lesson.id === 'lesson-1-1' ? (
            <div>
              {/* Subtab Segmented Switcher for Section 1 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '6px',
                background: 'linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%)',
                borderRadius: '9999px',
                width: 'fit-content',
                marginBottom: '20px',
                border: '1px solid #CBD5E1'
              }}>
                <button
                  onClick={() => setLearnSubTab('comparison')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: learnSubTab === 'comparison' ? 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)' : 'transparent',
                    color: learnSubTab === 'comparison' ? '#FFFFFF' : '#475569',
                    boxShadow: learnSubTab === 'comparison' ? '0 2px 8px rgba(30, 58, 138, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Sparkles size={13} color={learnSubTab === 'comparison' ? '#F59E0B' : '#94A3B8'} />
                  <span>Interactive Bit vs Qubit Comparison</span>
                </button>
                <button
                  onClick={() => setLearnSubTab('notes')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: learnSubTab === 'notes' ? 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)' : 'transparent',
                    color: learnSubTab === 'notes' ? '#FFFFFF' : '#475569',
                    boxShadow: learnSubTab === 'notes' ? '0 2px 8px rgba(30, 58, 138, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <BookOpen size={13} color={learnSubTab === 'notes' ? '#F59E0B' : '#94A3B8'} />
                  <span>Structured Theory & Math Notes</span>
                </button>
                <button
                  onClick={() => setLearnSubTab('both')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: learnSubTab === 'both' ? 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)' : 'transparent',
                    color: learnSubTab === 'both' ? '#FFFFFF' : '#475569',
                    boxShadow: learnSubTab === 'both' ? '0 2px 8px rgba(30, 58, 138, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Complete View (Both)</span>
                </button>
              </div>

              {/* RENDER CONTENT BASED ON SUBTAB */}
              {(learnSubTab === 'comparison' || learnSubTab === 'both') && (
                <BitVsQubitComparison />
              )}

              {(learnSubTab === 'notes' || learnSubTab === 'both') && (
                <div style={{ marginTop: learnSubTab === 'both' ? '28px' : '0' }}>
                  <TheoryNotes
                    markdown={lesson.theoryMarkdown}
                    conceptSummary={learnSubTab === 'both' ? undefined : lesson.conceptSummary}
                    lessonId={lesson.id}
                  />
                </div>
              )}
            </div>
          ) : (
            <TheoryNotes
              markdown={lesson.theoryMarkdown}
              conceptSummary={lesson.conceptSummary}
              lessonId={lesson.id}
            />
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
              Phase 1 of {PHASES.length}: Master the foundational concept before visualizing in 3D
            </div>
            <button
              onClick={handleNextPhase}
              className="btn-coral-action"
            >
              <span>Proceed to 3D Visualization</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: VISUALIZE (3D Bloch Sphere with Side Flash Card) */}
      {currentPhase === 'VISUALIZE' && (
        <div className="card-lift" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1.3fr) 330px',
          gap: '20px',
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
        }}>
          {/* COMPLETE 3D VIEW: ZERO OVERLAYS ON TOP OF SPHERE */}
          <div style={{
            height: '480px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #BFDBFE',
            position: 'relative'
          }}>
            <BlochSphereScene
              qubitState={currentStepState.qubitStates[0]}
              showFlashCard={false}
            />
          </div>

          {/* DEDICATED QUANTUM STATE FLASH CARD ON THE SIDE */}
          <div style={{
            height: '480px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <QubitFlashCard
                qubitState={currentStepState.qubitStates[0]}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: '10px'
            }}>
              <button
                onClick={handlePrevPhase}
                style={{
                  padding: '8px 16px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#475569'
                }}
              >
                <ArrowLeft size={13} />
                <span>Theory Notes</span>
              </button>
              <button
                onClick={handleNextPhase}
                className="btn-coral-action"
                style={{ padding: '8px 18px', fontSize: '12.5px' }}
              >
                <span>Step 3: Interact</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: INTERACT (Tuning circuit) */}
      {currentPhase === 'INTERACT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-lift-sm" style={{
            padding: '16px 22px',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: '14px',
            fontSize: '13.5px',
            color: '#1E3A8A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <strong style={{ color: '#1E3A8A' }}>Interactive Mission:</strong> {lesson.interactiveGoal}
            </div>
            <button
              onClick={handleNextPhase}
              className="btn-coral-action"
              style={{ padding: '8px 18px', fontSize: '12px' }}
            >
              Step 4: Formulate Prediction →
            </button>
          </div>

          <CircuitGrid
            numQubits={circuit.numQubits}
            gates={circuit.gates}
            activeStep={activeStep}
            totalSteps={8}
            selectedGateType={selectedGateType}
            onAddGate={handleAddGate}
            onRemoveGate={handleRemoveGate}
            onSelectStep={setActiveStep}
          />

          <TimelineControls
            activeStep={activeStep}
            maxStep={circuit.getMaxStep()}
            onSelectStep={setActiveStep}
            onClearCircuit={() => {
              const fresh = new QuantumCircuit(circuit.numQubits);
              setCircuit(fresh);
              setActiveStep(0);
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div style={{ height: '320px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #BFDBFE' }}>
              <BlochSphereScene
                qubitState={currentStepState.qubitStates[0]}
                showFlashCard={false}
              />
            </div>
            <StateInspector stateVector={finalState} />
          </div>
        </div>
      )}

      {/* PHASE 4: PREDICT */}
      {currentPhase === 'PREDICT' && (
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
        }}>
          <div>
            <span className="purple-pill-badge" style={{ fontSize: '11px', marginBottom: '8px', display: 'inline-flex' }}>
              Hypothesis Formulation • Active Learning Step 4
            </span>
            <h3 className="editorial-title" style={{ fontSize: '20px', fontWeight: 800, color: '#1E3A8A', margin: '6px 0 0 0' }}>
              {lesson.predictQuestion.prompt}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lesson.predictQuestion.options.map((opt, idx) => {
              const isSelected = predictSelected === idx;
              const isCorrect = idx === lesson.predictQuestion.correctIndex;
              const showResult = predictSubmitted;

              let bg = '#FFFFFF';
              let border = '1px solid #E2E8F0';
              if (isSelected) {
                bg = '#EFF6FF';
                border = '2px solid #1E3A8A';
              }
              if (showResult && isCorrect) {
                bg = '#ECFDF5';
                border = '2px solid #10B981';
              } else if (showResult && isSelected && !isCorrect) {
                bg = '#FEF2F2';
                border = '2px solid #EF4444';
              }

              return (
                <div
                  key={idx}
                  onClick={() => !predictSubmitted && setPredictSelected(idx)}
                  className="card-lift-sm"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: bg,
                    border: border,
                    cursor: predictSubmitted ? 'default' : 'pointer',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    fontWeight: isSelected ? 600 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt}
                </div>
              );
            })}
          </div>

          {!predictSubmitted ? (
            <button
              onClick={handlePredictSubmit}
              disabled={predictSelected === null}
              className="btn-coral-action"
              style={{
                alignSelf: 'flex-start',
                opacity: predictSelected !== null ? 1 : 0.5,
                cursor: predictSelected !== null ? 'pointer' : 'not-allowed'
              }}
            >
              Lock In Prediction
            </button>
          ) : (
            <div className="card-lift-sm" style={{
              padding: '18px 22px',
              background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
              borderRadius: '12px',
              border: '1px solid #BFDBFE',
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: '#334155'
            }}>
              <strong style={{ color: '#1E3A8A' }}>Physical Explanation:</strong> {lesson.predictQuestion.explanation}
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={handleNextPhase}
                  className="btn-coral-action"
                >
                  Proceed to Simulation & Verify →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 5: SIMULATE & PHASE 6: MEASURE */}
      {(currentPhase === 'SIMULATE' || currentPhase === 'MEASURE') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-lift-sm" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 22px',
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '14px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div className="editorial-title" style={{ fontSize: '16px', fontWeight: 800, color: '#1E3A8A' }}>
              {currentPhase === 'SIMULATE' ? 'Step 5: Linear Algebra State Simulation' : 'Step 6: Monte Carlo Measurement Collapse'}
            </div>
            <button
              onClick={handleNextPhase}
              className="btn-coral-action"
              style={{ padding: '8px 18px', fontSize: '12px' }}
            >
              Next Step →
            </button>
          </div>

          <MeasurementPanel stateVector={finalState} />
          <StateInspector stateVector={finalState} />
        </div>
      )}

      {/* PHASE 7: QUIZ */}
      {currentPhase === 'QUIZ' && (
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
        }}>
          <div>
            <span className="emerald-pill-badge" style={{ fontSize: '11px', marginBottom: '8px', display: 'inline-flex' }}>
              Comprehension Check • Active Learning Step 7
            </span>
            <h3 className="editorial-title" style={{ fontSize: '20px', fontWeight: 800, color: '#1E3A8A', margin: '6px 0 0 0' }}>
              {lesson.quiz.question}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lesson.quiz.options.map((opt, idx) => {
              const isSelected = quizSelected === idx;
              const isCorrect = idx === lesson.quiz.correctIndex;
              const showResult = quizSubmitted;

              let bg = '#FFFFFF';
              let border = '1px solid #E2E8F0';
              if (isSelected) {
                bg = '#EFF6FF';
                border = '2px solid #1E3A8A';
              }
              if (showResult && isCorrect) {
                bg = '#ECFDF5';
                border = '2px solid #10B981';
              } else if (showResult && isSelected && !isCorrect) {
                bg = '#FEF2F2';
                border = '2px solid #EF4444';
              }

              return (
                <div
                  key={idx}
                  onClick={() => !quizSubmitted && setQuizSelected(idx)}
                  className="card-lift-sm"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: bg,
                    border: border,
                    cursor: quizSubmitted ? 'default' : 'pointer',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    fontWeight: isSelected ? 600 : 500
                  }}
                >
                  {opt}
                </div>
              );
            })}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={handleQuizSubmit}
              disabled={quizSelected === null}
              className="btn-coral-action"
              style={{
                alignSelf: 'flex-start',
                opacity: quizSelected !== null ? 1 : 0.5,
                cursor: quizSelected !== null ? 'pointer' : 'not-allowed'
              }}
            >
              Submit Answer
            </button>
          ) : (
            <div className="card-lift-sm" style={{
              padding: '18px 22px',
              background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
              borderRadius: '12px',
              border: '1px solid #BFDBFE',
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: '#334155'
            }}>
              <strong style={{ color: '#1E3A8A' }}>Physics Explanation:</strong> {lesson.quiz.explanation}
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={handleNextPhase}
                  className="btn-coral-action"
                >
                  Ask Dirac AI / Deepen Understanding →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 8: AI FEEDBACK */}
      {currentPhase === 'AI_FEEDBACK' && (
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="purple-pill-badge" style={{ fontSize: '11px' }}>
                Dirac AI Socratic Feedback
              </span>
            </div>
            <h3 className="editorial-title" style={{ fontSize: '22px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
              Deepen Your Insight with Dirac AI
            </h3>
            <p className="editorial-subtitle" style={{ fontSize: '13.5px', color: '#475569', marginTop: '6px' }}>
              Select a suggested topic or open the Dirac AI chat drawer to explore any subtleties of this quantum phenomenon.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lesson.aiSuggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onOpenAIWithPrompt(prompt)}
                className="card-lift-sm"
                style={{
                  textAlign: 'left',
                  padding: '16px 20px',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                  border: '1px solid #BFDBFE',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>"{prompt}"</span>
                <span className="coral-pill-badge" style={{ fontSize: '11px', flexShrink: 0 }}>Ask Dirac AI ↗</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              onClick={handleNextPhase}
              className="btn-coral-action"
            >
              Complete Lesson & Claim Mastery →
            </button>
          </div>
        </div>
      )}

      {/* PHASE 9: MASTERY */}
      {currentPhase === 'MASTERY' && (
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '44px 28px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
            border: '2px solid #86EFAC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
          }}>
            <Award size={34} color="#059669" />
          </div>

          <h2 className="editorial-title" style={{ fontSize: '28px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
            Lesson Mastered!
          </h2>

          <p className="editorial-subtitle" style={{ fontSize: '14.5px', color: '#475569', maxWidth: '540px', margin: 0, lineHeight: '1.6' }}>
            {lesson.masteryCriteria}
          </p>

          {!lessonCompleted ? (
            <button
              onClick={handleClaimMastery}
              className="btn-coral-action"
              style={{
                marginTop: '12px',
                padding: '12px 28px',
                fontSize: '14px'
              }}
            >
              Claim +150 XP & Finalize
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="emerald-pill-badge" style={{ padding: '10px 20px', fontSize: '13px' }}>
                ✓ +150 XP Added to Profile
              </div>
              <button
                onClick={onBackToModules}
                className="btn-editorial-primary"
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                Back to Curriculum Overview
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
