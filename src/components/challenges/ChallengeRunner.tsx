// src/components/challenges/ChallengeRunner.tsx
import React, { useState } from 'react';
import { Challenge, CircuitGate, GateType } from '../../types';
import { QuantumCircuit } from '../../quantum/circuit';
import { CircuitGrid } from '../circuit/CircuitGrid';
import { BlochSphereScene } from '../canvas3d/BlochSphereScene';
import { StateInspector } from '../circuit/StateInspector';
import { soundEffects } from '../../audio/soundEffects';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react';
import { GATE_DEFINITIONS } from '../../quantum/matrix';

interface ChallengeRunnerProps {
  challenge: Challenge;
  isSolved: boolean;
  onSolveChallenge: (challengeId: string, xp: number) => void;
  onBack: () => void;
}

export const ChallengeRunner: React.FC<ChallengeRunnerProps> = ({
  challenge,
  isSolved,
  onSolveChallenge,
  onBack
}) => {
  const [circuit, setCircuit] = useState<QuantumCircuit>(() => new QuantumCircuit(challenge.numQubits));
  const [selectedGateType, setSelectedGateType] = useState<GateType>(challenge.allowedGates[0] || 'H');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hasSolved, setHasSolved] = useState<boolean>(isSolved);

  const activeStep = circuit.getMaxStep();
  const fidelity = circuit.computeFidelity(challenge.targetStateVector);
  const finalState = circuit.getFinalState();
  const currentGateCount = circuit.gates.length;
  const isWithinGateLimit = !challenge.maxGates || currentGateCount <= challenge.maxGates;
  const meetsCriteria = fidelity >= 0.999 && isWithinGateLimit;

  const handleAddGate = (gate: Omit<CircuitGate, 'id'>) => {
    if (!challenge.allowedGates.includes(gate.type)) {
      soundEffects.playErrorTone();
      return;
    }
    const updated = new QuantumCircuit(circuit.numQubits, [...circuit.gates]);
    updated.addGate(gate);
    setCircuit(updated);

    // Auto check if this newly placed gate completes the puzzle
    const newFidelity = updated.computeFidelity(challenge.targetStateVector);
    const newCount = updated.gates.length;
    if (newFidelity >= 0.999 && (!challenge.maxGates || newCount <= challenge.maxGates)) {
      handleSuccess();
    }
  };

  const handleRemoveGate = (id: string) => {
    const updated = new QuantumCircuit(circuit.numQubits, [...circuit.gates]);
    updated.removeGate(id);
    setCircuit(updated);
  };

  const handleReset = () => {
    setCircuit(new QuantumCircuit(challenge.numQubits));
    soundEffects.playStep();
  };

  const handleSuccess = () => {
    if (hasSolved) return;
    setHasSolved(true);
    soundEffects.playSuccessChord();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onSolveChallenge(challenge.id, challenge.xpReward);
  };

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#666666',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Challenge Arena</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '4px',
            background: challenge.difficulty === 'Beginner' ? '#ECFDF5' : challenge.difficulty === 'Intermediate' ? '#EFF6FF' : '#FEF3C7',
            color: challenge.difficulty === 'Beginner' ? '#059669' : challenge.difficulty === 'Intermediate' ? '#2563EB' : '#D97706'
          }}>
            {challenge.difficulty}
          </span>
          <span style={{ fontSize: '12px', color: '#111111', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
            +{challenge.xpReward} XP
          </span>
        </div>
      </div>

      {/* Challenge Description Card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111111', margin: '0 0 4px 0' }}>
              Challenge {challenge.number}: {challenge.title}
            </h1>
            <p style={{ fontSize: '13.5px', color: '#4B5563', margin: 0, lineHeight: '1.5' }}>
              {challenge.description}
            </p>
          </div>

          <button
            onClick={() => setShowHint(!showHint)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Lightbulb size={13} color="#D97706" />
            <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
          </button>
        </div>

        {showHint && (
          <div style={{
            padding: '10px 14px',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#92400E',
            lineHeight: '1.5'
          }}>
            <strong>💡 Hint:</strong> {challenge.hint}
          </div>
        )}

        {/* Real-time Target State & Fidelity Progress Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '12px',
          background: '#FAFAF8',
          border: '1px solid #E8E8E8',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>TARGET STATE</div>
            <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
              {challenge.targetDescription}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
              <span>QUANTUM FIDELITY</span>
              <span style={{ color: meetsCriteria ? '#059669' : '#4F46E5', fontWeight: 700 }}>
                {(fidelity * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, fidelity * 100)}%`,
                background: meetsCriteria ? '#10B981' : '#4F46E5',
                transition: 'width 0.2s ease, background-color 0.2s ease'
              }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>GATE BUDGET</div>
            <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: isWithinGateLimit ? '#0F172A' : '#EF4444', marginTop: '2px' }}>
              {currentGateCount} {challenge.maxGates ? `/ ${challenge.maxGates} max` : 'gates'}
            </div>
          </div>
        </div>

        {hasSolved && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '6px',
            color: '#065F46'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <div>
                <strong>Challenge Mastered!</strong> Quantum fidelity reaches {(fidelity * 100).toFixed(1)}%. +{challenge.xpReward} XP earned.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Allowed Gate Palette for this Challenge */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#666666' }}>
            Allowed Gates:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {challenge.allowedGates.map((gt) => {
              const def = GATE_DEFINITIONS[gt];
              const isSelected = selectedGateType === gt;
              return (
                <button
                  key={gt}
                  onClick={() => {
                    soundEffects.playGateClick();
                    setSelectedGateType(gt);
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    border: isSelected ? '2px solid #111111' : '1px solid #CBD5E1',
                    background: isSelected ? '#111111' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#111111',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  title={def?.name || gt}
                >
                  {def?.symbol || gt}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSuccess}
            disabled={!meetsCriteria || hasSolved}
            style={{
              padding: '6px 16px',
              background: meetsCriteria && !hasSolved ? '#111111' : '#E2E8F0',
              color: meetsCriteria && !hasSolved ? '#FFFFFF' : '#94A3B8',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: meetsCriteria && !hasSolved ? 'pointer' : 'default'
            }}
          >
            {hasSolved ? 'Solved ✓' : 'Verify State'}
          </button>
        </div>
      </div>

      {/* Circuit Grid */}
      <CircuitGrid
        numQubits={challenge.numQubits}
        gates={circuit.gates}
        activeStep={activeStep}
        totalSteps={6}
        selectedGateType={selectedGateType}
        onAddGate={handleAddGate}
        onRemoveGate={handleRemoveGate}
        onSelectStep={() => {}}
      />

      {/* 3D Visualizer & State Inspector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ height: '340px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <BlochSphereScene qubitState={finalState.getQubitState(0)} />
        </div>
        <StateInspector stateVector={finalState} />
      </div>
    </div>
  );
};
