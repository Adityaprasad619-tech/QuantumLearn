// src/components/challenges/ChallengeHub.tsx
import React from 'react';
import { CHALLENGES } from './challengeData';
import { Challenge } from '../../types';
import { BrowserFrame } from '../ui/BrowserFrame';
import { CheckCircle2, ArrowRight, Star, Trophy, Zap } from 'lucide-react';

interface ChallengeHubProps {
  completedChallenges: string[];
  onSelectChallenge: (challenge: Challenge) => void;
}

export const ChallengeHub: React.FC<ChallengeHubProps> = ({
  completedChallenges,
  onSelectChallenge
}) => {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 20px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }}>
      {/* Editorial Browser Hero */}
      <BrowserFrame
        url="quantum-lab://challenge-arena/puzzles"
        badgeText="Challenge Arena"
        badgeColor="#F97316"
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="coral-pill-badge" style={{ fontSize: '11px' }}>
              Quantum Challenge Arena
            </span>
            <span className="navy-pill-badge" style={{ fontSize: '11px' }}>
              {CHALLENGES.length} Physical Puzzles
            </span>
          </div>
          <h1 className="editorial-title" style={{ fontSize: '36px', fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
            Solve Quantum Puzzles & Earn Mastery
          </h1>
          <p className="editorial-subtitle" style={{ fontSize: '15px', color: '#334155', maxWidth: '780px', margin: 0, lineHeight: '1.6' }}>
            Synthesize target quantum states under tight physical constraints. Build Hadamard sandwiches, entangle Bell pairs, swap states with CNOTs, and design Grover phase oracles.
          </p>
        </div>
      </BrowserFrame>

      {/* Progress Card */}
      <div className="card-lift" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '20px 24px',
        background: '#FFFFFF',
        border: '1px solid #BFDBFE',
        borderRadius: '16px',
        boxShadow: '0 4px 16px -2px rgba(30, 58, 138, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '1px solid #FCD34D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)'
          }}>
            <Trophy size={22} color="#D97706" />
          </div>
          <div>
            <div className="editorial-title" style={{ fontSize: '16px', fontWeight: 800, color: '#1E3A8A' }}>
              {completedChallenges.length} of {CHALLENGES.length} Challenges Conquered
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              Total Arena XP available: <strong>{CHALLENGES.reduce((sum, c) => sum + c.xpReward, 0)} XP</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '120px', height: '8px', background: '#EFF6FF', borderRadius: '4px', overflow: 'hidden', border: '1px solid #BFDBFE' }}>
            <div style={{
              height: '100%',
              width: `${(completedChallenges.length / CHALLENGES.length) * 100}%`,
              background: 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)',
              borderRadius: '4px'
            }} />
          </div>
          <span style={{
            fontSize: '16px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: '#1E3A8A'
          }}>
            {Math.round((completedChallenges.length / CHALLENGES.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Grid of Challenges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {CHALLENGES.map((ch) => {
          const isSolved = completedChallenges.includes(ch.id);

          return (
            <div
              key={ch.id}
              onClick={() => onSelectChallenge(ch)}
              className="card-lift"
              style={{
                background: isSolved ? 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' : '#FFFFFF',
                border: isSolved ? '1px solid #86EFAC' : '1px solid #BFDBFE',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px -2px rgba(30, 58, 138, 0.05)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className={
                    ch.difficulty === 'Beginner' ? 'emerald-pill-badge' :
                    ch.difficulty === 'Intermediate' ? 'navy-pill-badge' : 'coral-pill-badge'
                  } style={{ fontSize: '11px' }}>
                    {ch.difficulty}
                  </span>
                  <span style={{
                    fontSize: '11.5px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#D97706',
                    fontWeight: 700,
                    background: '#FEF3C7',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    +{ch.xpReward} XP
                  </span>
                </div>

                <h3 className="editorial-title" style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A', margin: '0 0 6px 0' }}>
                  {ch.number}. {ch.title}
                </h3>
                <p className="editorial-subtitle" style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                  {ch.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #F1F5F9'
              }}>
                <span style={{ fontSize: '11.5px', fontFamily: 'JetBrains Mono, monospace', color: '#64748B' }}>
                  {ch.numQubits} Qubit{ch.numQubits > 1 ? 's' : ''} • Max {ch.maxGates} gates
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isSolved ? (
                    <span className="emerald-pill-badge" style={{ fontSize: '11px', padding: '3px 10px', gap: '4px' }}>
                      <CheckCircle2 size={13} />
                      <span>Solved</span>
                    </span>
                  ) : (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1E3A8A'
                    }}>
                      <span>Solve Puzzle</span>
                      <ArrowRight size={13} color="#F97316" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
