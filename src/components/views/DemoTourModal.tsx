// src/components/views/DemoTourModal.tsx
import React, { useState } from 'react';
import { ActiveView } from '../layout/Header';
import { soundEffects } from '../../audio/soundEffects';
import {
  Sparkles, X, ArrowRight, ArrowLeft, CheckCircle2,
  Atom, Zap, Play, BarChart2, Cpu, Activity, HelpCircle, Layers
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView: (view: ActiveView) => void;
  onOpenDiracAIWithPrompt: (prompt: string) => void;
}

interface DemoStep {
  id: string;
  title: string;
  description: string;
  targetView: ActiveView;
  actionButtonLabel: string;
  icon: React.FC<{ size?: number; color?: string }>;
  promptForAI?: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'bloch',
    title: '1. 3D Bloch Sphere',
    description: 'Explore the continuous geometric representation of a single-qubit quantum state in complex Hilbert space.',
    targetView: 'lab3d',
    actionButtonLabel: 'Open 3D Bloch Lab',
    icon: Atom
  },
  {
    id: 'apply-h',
    title: '2. Apply Hadamard Gate (H)',
    description: 'Transform computational basis state |0⟩ into equal superposition |+⟩ = (|0⟩+|1⟩)/√2 with 50/50 measurement probability.',
    targetView: 'lab3d',
    actionButtonLabel: 'Apply H on Bloch Sphere',
    icon: Zap
  },
  {
    id: 'apply-x',
    title: '3. Apply Pauli-X Gate',
    description: 'Rotate the Bloch vector 180° around the X-axis, performing a quantum bit-flip from North Pole (|0⟩) to South Pole (|1⟩).',
    targetView: 'lab3d',
    actionButtonLabel: 'Apply X Bit-Flip',
    icon: Zap
  },
  {
    id: 'bell-state',
    title: '4. Create Entangled Bell State',
    description: 'Couple two qubits using Hadamard followed by CNOT, synthesizing maximally entangled state |Φ+⟩ = (|00⟩+|11⟩)/√2.',
    targetView: 'playground',
    actionButtonLabel: 'Open Bell State in Circuit',
    icon: Layers
  },
  {
    id: 'measure',
    title: '5. Quantum Measurement Collapse',
    description: 'Trigger wave function collapse across 1024 Monte Carlo shots according to Born rule probabilities.',
    targetView: 'playground',
    actionButtonLabel: 'Simulate Measurement Shots',
    icon: BarChart2
  },
  {
    id: 'build-circuit',
    title: '6. Build Custom Circuit',
    description: 'Drag, drop, and sequence arbitrary quantum gates on the multi-wire timeline with reversible time-scrubbing.',
    targetView: 'playground',
    actionButtonLabel: 'Launch Circuit Wireboard',
    icon: Cpu
  },
  {
    id: 'grover',
    title: "7. Run Grover's Search Algorithm",
    description: 'Amplify target state probability quadratically using quantum oracle phase inversion and diffusion reflection.',
    targetView: 'challenges',
    actionButtonLabel: 'Run Grover Search Arena',
    icon: Play
  },
  {
    id: 'qft',
    title: '8. Explore Quantum Fourier Transform',
    description: 'Inspect phase clock dials as computational basis states disperse exponentially into frequency interference patterns.',
    targetView: 'qft',
    actionButtonLabel: 'Explore Visual QFT Lab',
    icon: Activity
  },
  {
    id: 'shor',
    title: "9. Explore Shor's Factoring",
    description: 'Factor composite integer 15 = 3 × 5 using quantum period-finding, modular exponentiation, and continued fractions.',
    targetView: 'shor',
    actionButtonLabel: "Launch Shor's Laboratory",
    icon: Activity
  },
  {
    id: 'ai-tutor',
    title: '10. Ask Dirac AI Socratic Tutor',
    description: 'Query the in-browser RAG vector engine to receive physics explanations grounded in textbooks without hallucinations.',
    targetView: 'dashboard',
    actionButtonLabel: 'Ask Dirac AI with Citations',
    icon: Sparkles,
    promptForAI: 'How does quantum entanglement differ fundamentally from classical correlation?'
  }
];

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
  onOpenDiracAIWithPrompt
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  const handleExecuteStep = () => {
    soundEffects.playSuccessChord();
    if (currentStep.promptForAI) {
      onOpenDiracAIWithPrompt(currentStep.promptForAI);
    }
    onNavigateToView(currentStep.targetView);
    onClose();
  };

  const handleNext = () => {
    soundEffects.playStep();
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    soundEffects.playStep();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '580px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FAFAF8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: '#111111',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={15} color="#A78BFA" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Interactive Evaluator Demo Tour
              </h3>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Step {currentStepIndex + 1} of {DEMO_STEPS.length}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Content */}
        <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {DEMO_STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: i === currentStepIndex ? '#111111' : i < currentStepIndex ? '#4F46E5' : '#E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              />
            ))}
          </div>

          {/* Current Step Card */}
          <div style={{
            background: '#FAFAF8',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4F46E5',
              flexShrink: 0
            }}>
              <StepIcon size={22} color="#4F46E5" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {currentStep.title}
              </h4>
              <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleExecuteStep}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px',
              background: '#111111',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <span>{currentStep.actionButtonLabel}</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '14px 24px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: currentStepIndex === 0 ? '#CBD5E1' : '#475569',
              cursor: currentStepIndex === 0 ? 'default' : 'pointer'
            }}
          >
            <ArrowLeft size={13} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
            Click anywhere on the bar above to jump
          </span>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === DEMO_STEPS.length - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: currentStepIndex === DEMO_STEPS.length - 1 ? '#CBD5E1' : '#475569',
              cursor: currentStepIndex === DEMO_STEPS.length - 1 ? 'default' : 'pointer'
            }}
          >
            <span>Next</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
