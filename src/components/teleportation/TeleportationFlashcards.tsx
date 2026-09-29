// src/components/teleportation/TeleportationFlashcards.tsx
import React, { useState } from 'react';
import { TELEPORTATION_FLASHCARDS } from './teleportationData';
import { RotateCw, ChevronLeft, ChevronRight, Shuffle, CheckCircle, HelpCircle, Layers } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

export const TeleportationFlashcards: React.FC = () => {
  const [cards, setCards] = useState(TELEPORTATION_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    soundEffects.playGateClick();
    setIsFlipped(prev => !prev);
  };

  const handleNext = () => {
    soundEffects.playGateClick();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    soundEffects.playGateClick();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    soundEffects.playStep();
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playSuccessChord();
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(currentCard.id)) {
        next.delete(currentCard.id);
      } else {
        next.add(currentCard.id);
      }
      return next;
    });
  };

  const isMastered = masteredIds.has(currentCard.id);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#4F46E5" />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Quantum Teleportation Flashcards
            </h3>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
            Master the essential quantum principles, gates, theorems, and mathematical transformations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#4F46E5',
            background: '#EEF2FF',
            padding: '4px 10px',
            borderRadius: '20px'
          }}>
            Mastered: {masteredIds.size} / {cards.length}
          </span>
          <button
            onClick={handleShuffle}
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
            <Shuffle size={13} />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Flashcard Area with 3D Flip Container */}
      <div
        style={{
          perspective: '1200px',
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto',
          minHeight: '280px',
          cursor: 'pointer'
        }}
        onClick={handleFlip}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '280px',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          {/* FRONT OF CARD */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
            border: '2px solid #4338CA',
            borderRadius: '16px',
            padding: '32px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 12px 28px rgba(30, 27, 75, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(99, 102, 241, 0.3)',
                border: '1px solid #818CF8',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: '#C7D2FE',
                textTransform: 'uppercase'
              }}>
                {currentCard.category}
              </span>

              <button
                onClick={toggleMastered}
                style={{
                  background: isMastered ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#FFF',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle size={12} />
                <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px', fontWeight: 600 }}>
                QUESTION / CONCEPT
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.4 }}>
                {currentCard.question}
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#818CF8',
              fontWeight: 600
            }}>
              <RotateCw size={13} />
              <span>Click card or press Flip to reveal answer</span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            border: '2px solid #06B6D4',
            borderRadius: '16px',
            padding: '32px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 12px 28px rgba(6, 182, 212, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(6, 182, 212, 0.2)',
                border: '1px solid #22D3EE',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: '#67E8F9',
                textTransform: 'uppercase'
              }}>
                ANSWER & EXPLANATION
              </span>

              <button
                onClick={toggleMastered}
                style={{
                  background: isMastered ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#FFF',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle size={12} />
                <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
            </div>

            <div style={{ margin: '14px 0', textAlign: 'left' }}>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#F1F5F9', margin: '0 0 12px 0' }}>
                {currentCard.answer}
              </p>

              {currentCard.formula && (
                <div style={{
                  background: 'rgba(2, 6, 23, 0.8)',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13.5px',
                  color: '#38BDF8',
                  textAlign: 'center'
                }}>
                  {currentCard.formula}
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#38BDF8',
              fontWeight: 600
            }}>
              <RotateCw size={13} />
              <span>Click again to flip back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Navigation Controls & Progress Bar */}
      <div style={{
        marginTop: '24px',
        maxWidth: '680px',
        margin: '24px auto 0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: '#F1F5F9',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${((currentIndex + 1) / cards.length) * 100}%`,
            background: 'linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              {currentIndex + 1}
            </span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>/</span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              {cards.length}
            </span>
            <button
              onClick={handleFlip}
              style={{
                marginLeft: '12px',
                padding: '6px 12px',
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                borderRadius: '6px',
                color: '#4F46E5',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Flip Card
            </button>
          </div>

          <button
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#111111',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
