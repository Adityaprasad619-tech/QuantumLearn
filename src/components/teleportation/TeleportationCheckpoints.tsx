// src/components/teleportation/TeleportationCheckpoints.tsx
import React, { useState } from 'react';
import { TELEPORTATION_CHECKPOINTS, CheckpointQuestion } from './teleportationData';
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

export const TeleportationCheckpoints: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const handleSelectOption = (questionId: string, optionIdx: number, correctIdx: number) => {
    if (revealed[questionId]) return;

    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    setRevealed(prev => ({ ...prev, [questionId]: true }));

    if (optionIdx === correctIdx) {
      soundEffects.playSuccessChord();
    } else {
      soundEffects.playGateClick();
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setRevealed({});
  };

  const correctCount = Object.entries(revealed).filter(
    ([id, isRev]) => isRev && selectedAnswers[id] === TELEPORTATION_CHECKPOINTS.find(q => q.id === id)?.correctIndex
  ).length;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#4F46E5" />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Conceptual Checkpoints
            </h3>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
            Test your intuition on the fundamental quantum mechanics behind teleportation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#4F46E5',
            background: '#EEF2FF',
            padding: '4px 12px',
            borderRadius: '20px'
          }}>
            Score: {correctCount} / {TELEPORTATION_CHECKPOINTS.length}
          </span>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {TELEPORTATION_CHECKPOINTS.map((q, qIdx) => {
          const isAnswered = revealed[q.id];
          const userChoice = selectedAnswers[q.id];
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div
              key={q.id}
              style={{
                background: '#F8FAFC',
                border: isAnswered
                  ? isCorrect
                    ? '1px solid #86EFAC'
                    : '1px solid #FCA5A5'
                  : '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '18px 20px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                <span style={{
                  background: '#111111',
                  color: '#FFF',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {qIdx + 1}
                </span>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.4 }}>
                  {q.question}
                </h4>
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginLeft: '34px' }}>
                {q.options.map((opt, optIdx) => {
                  let optBg = '#FFFFFF';
                  let optBorder = '1px solid #E2E8F0';
                  let optColor = '#1E293B';

                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      optBg = '#DCFCE7';
                      optBorder = '2px solid #22C55E';
                      optColor = '#14532D';
                    } else if (optIdx === userChoice) {
                      optBg = '#FEE2E2';
                      optBorder = '2px solid #EF4444';
                      optColor = '#7F1D1D';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx, q.correctIndex)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: optBg,
                        border: optBorder,
                        color: optColor,
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: isAnswered ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: isAnswered && (optIdx === q.correctIndex || optIdx === userChoice) ? 700 : 500,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{opt}</span>
                      {isAnswered && optIdx === q.correctIndex && (
                        <CheckCircle2 size={16} color="#16A34A" />
                      )}
                      {isAnswered && optIdx === userChoice && optIdx !== q.correctIndex && (
                        <XCircle size={16} color="#DC2626" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {isAnswered && (
                <div style={{
                  marginTop: '14px',
                  marginLeft: '34px',
                  padding: '12px 14px',
                  background: isCorrect ? '#F0FDF4' : '#FFF1F2',
                  borderLeft: `4px solid ${isCorrect ? '#22C55E' : '#EF4444'}`,
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                  color: isCorrect ? '#166534' : '#991B1B'
                }}>
                  <strong>{isCorrect ? 'Correct! ' : 'Not quite. '}</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
