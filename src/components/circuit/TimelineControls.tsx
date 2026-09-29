// src/components/circuit/TimelineControls.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Trash2 } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface TimelineControlsProps {
  activeStep: number;
  maxStep: number;
  onSelectStep: (step: number) => void;
  onClearCircuit: () => void;
  onLoadPreset?: (presetId: string) => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  activeStep,
  maxStep,
  onSelectStep,
  onClearCircuit
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);
  const activeStepRef = useRef<number>(activeStep);
  activeStepRef.current = activeStep;

  // Interval duration based on speed
  const speedInterval = playbackSpeed === 0.5 ? 1400 : playbackSpeed === 2 ? 350 : 700;

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        const current = activeStepRef.current;
        if (current >= maxStep) {
          setIsPlaying(false);
        } else {
          soundEffects.playStep();
          onSelectStep(current + 1);
        }
      }, speedInterval);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxStep, onSelectStep, speedInterval]);

  const handleTogglePlay = () => {
    if (!isPlaying && activeStep >= maxStep) {
      onSelectStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (activeStep > 0) {
      soundEffects.playStep();
      onSelectStep(activeStep - 1);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (activeStep < maxStep) {
      soundEffects.playStep();
      onSelectStep(activeStep + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    soundEffects.playStep();
    onSelectStep(0);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      background: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: '10px',
      flexWrap: 'wrap',
      gap: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* Playback Controls (Play, Pause, Step, Reset) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={handleReset}
          style={{
            padding: '6px 10px',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11.5px',
            color: '#334155',
            fontWeight: 500
          }}
          title="Reset to initial step (↻ Reset)"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        <button
          onClick={handleStepBack}
          disabled={activeStep <= 0}
          style={{
            padding: '6px 8px',
            background: activeStep <= 0 ? '#F1F5F9' : '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            cursor: activeStep <= 0 ? 'not-allowed' : 'pointer',
            opacity: activeStep <= 0 ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            color: '#334155'
          }}
          title="Previous step"
        >
          <SkipBack size={14} />
        </button>

        <button
          onClick={handleTogglePlay}
          style={{
            padding: '6px 14px',
            background: isPlaying ? '#EF4444' : '#111111',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          title={isPlaying ? 'Pause simulation (⏸ Pause)' : 'Play simulation (▶ Play)'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={handleStepForward}
          disabled={activeStep >= maxStep}
          style={{
            padding: '6px 10px',
            background: activeStep >= maxStep ? '#F1F5F9' : '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            cursor: activeStep >= maxStep ? 'not-allowed' : 'pointer',
            opacity: activeStep >= maxStep ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#334155',
            fontSize: '11.5px',
            fontWeight: 500
          }}
          title="Next step (⏭ Next step)"
        >
          <span>Next</span>
          <SkipForward size={13} />
        </button>

        {/* Speed Controls (0.5x, 1x, 2x) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: '#F1F5F9',
          padding: '2px',
          borderRadius: '6px',
          marginLeft: '6px'
        }}>
          {([0.5, 1, 2] as const).map(spd => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              style={{
                padding: '3px 7px',
                border: 'none',
                borderRadius: '4px',
                background: playbackSpeed === spd ? '#111111' : 'transparent',
                color: playbackSpeed === spd ? '#FFFFFF' : '#475569',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: playbackSpeed === spd ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Step Progress Display & Scrubber */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, justifyContent: 'flex-end', minWidth: '220px' }}>
        {/* Scrubber Slider */}
        <input
          type="range"
          min={0}
          max={Math.max(1, maxStep)}
          value={activeStep}
          onChange={(e) => {
            setIsPlaying(false);
            onSelectStep(parseInt(e.target.value, 10));
          }}
          style={{
            flex: 1,
            maxWidth: '180px',
            cursor: 'pointer',
            accentColor: '#111111'
          }}
        />

        {/* Exact Step Badge: Step X / Y */}
        <div style={{
          padding: '4px 10px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          color: '#0F172A',
          whiteSpace: 'nowrap'
        }}>
          Step {activeStep} / {maxStep}
        </div>

        {/* Clear Circuit Button */}
        <button
          onClick={onClearCircuit}
          style={{
            padding: '6px 10px',
            background: '#FFF1F2',
            border: '1px solid #FFE4E6',
            color: '#E11D48',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11.5px',
            fontWeight: 600
          }}
          title="Clear all gates from the circuit"
        >
          <Trash2 size={13} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};
