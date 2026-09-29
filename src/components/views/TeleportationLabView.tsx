// src/components/views/TeleportationLabView.tsx
import React, { useState } from 'react';
import { TeleportationLearnView } from '../teleportation/TeleportationLearnView';
import { TeleportationStepByStep } from '../teleportation/TeleportationStepByStep';
import { TeleportationCircuitDesigner } from '../teleportation/TeleportationCircuitDesigner';
import { TeleportationExperiment } from '../teleportation/TeleportationExperiment';
import { BookOpen, Zap, Cpu, FlaskConical, Sparkles } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface TeleportationLabViewProps {
  onAskDirac: (prompt: string) => void;
}

export const TeleportationLabView: React.FC<TeleportationLabViewProps> = ({ onAskDirac }) => {
  // Active tab defaults to 'learn' per user requirement:
  // "When the user opens the Teleportation tab, the first screen should NOT immediately open the simulator. First teach the concept properly."
  const [activeTab, setActiveTab] = useState<'learn' | 'stepByStep' | 'designer' | 'experiment'>('learn');

  const handleTabChange = (tab: 'learn' | 'stepByStep' | 'designer' | 'experiment') => {
    soundEffects.playGateClick();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#FAFAF8'
    }}>
      {/* Sticky Secondary Navigation Header for Teleportation Module */}
      <div style={{
        position: 'sticky',
        top: '64px',
        zIndex: 40,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        padding: '10px 24px'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Module Mode Tabs */}
          <div style={{
            display: 'flex',
            background: '#EBF3FC',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px',
            border: '1px solid #BFDBFE'
          }}>
            <button
              onClick={() => handleTabChange('learn')}
              className="card-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'learn' ? '#1E3A8A' : 'transparent',
                color: activeTab === 'learn' ? '#FFFFFF' : '#334155',
                boxShadow: activeTab === 'learn' ? '0 4px 12px rgba(30, 58, 138, 0.25)' : 'none'
              }}
            >
              <BookOpen size={14} />
              <span>1. Learn & Foundations</span>
            </button>

            <button
              onClick={() => handleTabChange('stepByStep')}
              className="card-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'stepByStep' ? '#2563EB' : 'transparent',
                color: activeTab === 'stepByStep' ? '#FFFFFF' : '#334155',
                boxShadow: activeTab === 'stepByStep' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
              }}
            >
              <Zap size={14} />
              <span>2. 9-Stage Simulator</span>
            </button>

            <button
              onClick={() => handleTabChange('designer')}
              className="card-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'designer' ? '#1E3A8A' : 'transparent',
                color: activeTab === 'designer' ? '#FFFFFF' : '#334155',
                boxShadow: activeTab === 'designer' ? '0 4px 12px rgba(30, 58, 138, 0.25)' : 'none'
              }}
            >
              <Cpu size={14} />
              <span>3. Circuit Designer</span>
            </button>

            <button
              onClick={() => handleTabChange('experiment')}
              className="card-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'experiment' ? '#059669' : 'transparent',
                color: activeTab === 'experiment' ? '#FFFFFF' : '#334155',
                boxShadow: activeTab === 'experiment' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none'
              }}
            >
              <FlaskConical size={14} />
              <span>4. Experiment & Fidelity Lab</span>
            </button>
          </div>

          {/* Quick AI Assistant shortcut */}
          <button
            onClick={() => onAskDirac('Provide an overview of quantum teleportation, Bell measurement, and conditional Pauli corrections.')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              borderRadius: '6px',
              color: '#6D28D9',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={13} color="#7C3AED" />
            <span>Ask Dirac AI</span>
          </button>
        </div>
      </div>

      {/* Main Tab View Rendering */}
      <div>
        {activeTab === 'learn' && (
          <TeleportationLearnView
            onEnterLab={() => handleTabChange('stepByStep')}
            onAskDirac={onAskDirac}
          />
        )}

        {activeTab === 'stepByStep' && (
          <TeleportationStepByStep
            onAskDirac={onAskDirac}
          />
        )}

        {activeTab === 'designer' && (
          <TeleportationCircuitDesigner />
        )}

        {activeTab === 'experiment' && (
          <TeleportationExperiment />
        )}
      </div>
    </div>
  );
};
