// src/components/views/CircuitPlaygroundView.tsx
import React, { useState } from 'react';
import { QuantumCircuit } from '../../quantum/circuit';
import { StateVector } from '../../quantum/statevector';
import { CircuitGate, GateType } from '../../types';
import { CIRCUIT_PRESETS } from '../../quantum/presets';
import { CircuitGrid } from '../circuit/CircuitGrid';
import { GatePalette } from '../circuit/GatePalette';
import { TimelineControls } from '../circuit/TimelineControls';
import { MeasurementPanel } from '../circuit/MeasurementPanel';
import { StateInspector } from '../circuit/StateInspector';
import { MultiBlochView } from '../canvas3d/MultiBlochView';
import { DensityMatrix3D } from '../canvas3d/DensityMatrix3D';
import { ProbabilityHeatmap } from '../canvas3d/ProbabilityHeatmap';
import { CodeExportModal } from '../circuit/CodeExportModal';
import { ResourceAnalyzerPanel } from '../circuit/ResourceAnalyzerPanel';
import { CircuitCriticPanel } from '../circuit/CircuitCriticPanel';
import { ShareCircuitModal } from '../circuit/ShareCircuitModal';
import { VisualErrorReplay } from '../circuit/VisualErrorReplay';
import { QuantumCodeEditor } from '../circuit/QuantumCodeEditor';
import { BrowserFrame } from '../ui/BrowserFrame';
import { soundEffects } from '../../audio/soundEffects';
import { authService } from '../../auth/authService';
import { FileCode, Sparkles, BookOpen, Bookmark, Check, ShieldAlert, Share2, Activity, Code2, LayoutGrid } from 'lucide-react';


interface CircuitPlaygroundViewProps {
  onAskDirac: (prompt: string, context?: {
    gates?: CircuitGate[];
    numQubits?: number;
    finalState?: StateVector;
  }) => void;
}

export const CircuitPlaygroundView: React.FC<CircuitPlaygroundViewProps> = ({ onAskDirac }) => {
  // Default circuit: Bell State Generator |Φ+⟩
  const initialGates: CircuitGate[] = [
    { id: 'g0', type: 'H', targets: [0], stepIndex: 0 },
    { id: 'g1', type: 'CX', targets: [1], controls: [0], stepIndex: 1 }
  ];

  const [numQubits, setNumQubits] = useState<number>(2);
  const [history, setHistory] = useState<CircuitGate[][]>([initialGates]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [activeStep, setActiveStep] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'split' | 'visual' | 'code'>('split');
  const [lockedGateId, setLockedGateId] = useState<string | null>(null);
  const [selectedGateType, setSelectedGateType] = useState<GateType | null>('H');
  const [selectedParams, setSelectedParams] = useState<{ theta?: number }>({ theta: Math.PI });
  const [activeTab3D, setActiveTab3D] = useState<'bloch' | 'density' | 'heatmap'>('bloch');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showCriticModal, setShowCriticModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showReplayModal, setShowReplayModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleUpdateFromCode = (newNumQubits: number, newGates: CircuitGate[]) => {
    setNumQubits(newNumQubits);
    pushNewCircuitState(newGates);
    const maxS = newGates.length > 0 ? Math.max(...newGates.map(g => g.stepIndex)) + 1 : 0;
    setActiveStep(maxS);
  };

  const handleSaveCircuitToDb = async () => {
    setIsSaving(true);
    const name = window.prompt('Enter a name for this circuit in SQLite:', `Custom ${numQubits}-Qubit Circuit`) || `Circuit ${Date.now()}`;
    const res = await authService.saveCircuit(name, 'Custom quantum circuit designed in Circuit Simulator', numQubits, currentGates.map(g => ({
      type: g.type,
      targets: g.targets,
      controls: g.controls,
      params: g.params
    })));
    setIsSaving(false);
    if (res) {
      soundEffects.playLevelUp();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };


  const currentGates = history[historyIndex] || [];
  const circuit = new QuantumCircuit(numQubits, currentGates);
  const simulationStates = circuit.simulate();
  const currentStepState = simulationStates[activeStep] || simulationStates[simulationStates.length - 1];
  const finalState = circuit.getFinalState();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const pushNewCircuitState = (newGates: CircuitGate[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newGates);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleAddGate = (gate: Omit<CircuitGate, 'id'>) => {
    const newGate: CircuitGate = {
      ...gate,
      id: `gate_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = [...currentGates, newGate];
    pushNewCircuitState(updated);
    setActiveStep(Math.max(...updated.map(g => g.stepIndex)) + 1);
  };

  const handleRemoveGate = (id: string) => {
    const updated = currentGates.filter(g => g.id !== id);
    pushNewCircuitState(updated);
    const maxS = updated.length > 0 ? Math.max(...updated.map(g => g.stepIndex)) + 1 : 0;
    setActiveStep(Math.min(activeStep, maxS));
  };

  const handleMoveGate = (gateId: string, newTarget: number, newStep: number) => {
    const updated = currentGates.map(g => {
      if (g.id !== gateId) return g;
      const targetDiff = newTarget - g.targets[0];
      const newTargets = g.targets.map(t => Math.min(numQubits - 1, Math.max(0, t + targetDiff)));
      const newControls = g.controls?.map(c => Math.min(numQubits - 1, Math.max(0, c + targetDiff)));
      return {
        ...g,
        targets: newTargets,
        controls: newControls,
        stepIndex: newStep
      };
    });
    pushNewCircuitState(updated);
  };

  const handleUndo = () => {
    if (canUndo) {
      soundEffects.playStep();
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      soundEffects.playStep();
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleResetCircuit = () => {
    soundEffects.playStep();
    pushNewCircuitState([]);
    setActiveStep(0);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = CIRCUIT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    soundEffects.playGateClick();

    setNumQubits(preset.numQubits);
    const loadedGates: CircuitGate[] = preset.gates.map((g, idx) => ({
      ...g,
      id: `preset_${idx}_${Date.now()}`
    }));

    pushNewCircuitState(loadedGates);
    const maxS = loadedGates.length > 0 ? Math.max(...loadedGates.map(g => g.stepIndex)) + 1 : 0;
    setActiveStep(maxS);
  };

  const handleAddQubit = () => {
    if (numQubits < 5) {
      soundEffects.playStep();
      setNumQubits(numQubits + 1);
    }
  };

  const handleRemoveQubit = () => {
    if (numQubits > 1) {
      soundEffects.playStep();
      const nextQ = numQubits - 1;
      setNumQubits(nextQ);
      // Filter out gates targeting removed qubit
      const filtered = currentGates.filter(g =>
        g.targets.every(t => t < nextQ) && (g.controls?.every(c => c < nextQ) ?? true)
      );
      pushNewCircuitState(filtered);
    }
  };

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '24px 20px 80px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Header Bar with Template Styling */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)',
        border: '1px solid #BFDBFE',
        borderRadius: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="coral-pill-badge floating-element">
              <Sparkles size={13} />
              <span>Multi-Wire Simulator</span>
            </span>
            <span className="navy-pill-badge">
              <span>Linear Algebra Matrix Engine</span>
            </span>
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Quantum Circuit Playground
          </h1>
          <p className="editorial-subtitle" style={{ fontSize: '14px', margin: '4px 0 0 0', maxWidth: '720px' }}>
            Design multi-qubit algorithms, place unitary gates, inspect intermediate states, and watch real-time entanglement unfold.
          </p>
        </div>

        {/* Preset Selector & Code Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            padding: '4px 10px',
            borderRadius: '10px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)'
          }}>
            <BookOpen size={14} color="#2563EB" />
            <select
              onChange={(e) => handleLoadPreset(e.target.value)}
              defaultValue="bell-phi-plus"
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '12.5px',
                color: '#1E3A8A',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }}
            >
              <option disabled>-- Load Famous Circuit Preset --</option>
              {CIRCUIT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.numQubits}Q)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveCircuitToDb}
            disabled={isSaving}
            className="card-lift-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: savedSuccess ? '#ECFDF5' : '#FFFFFF',
              border: `1px solid ${savedSuccess ? '#10B981' : '#BFDBFE'}`,
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: savedSuccess ? '#047857' : '#1E3A8A',
              cursor: isSaving ? 'wait' : 'pointer'
            }}
            title="Save this circuit structure directly to SQLite database"
          >
            {savedSuccess ? <Check size={14} color="#059669" /> : <Bookmark size={14} color="#2563EB" />}
            <span>{savedSuccess ? 'Saved to DB!' : isSaving ? 'Saving...' : 'Save Circuit'}</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="card-lift-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#1E3A8A',
              cursor: 'pointer'
            }}
          >
            <FileCode size={14} color="#2563EB" />
            <span>Export QASM / Qiskit</span>
          </button>

          <button
            onClick={() => setShowCriticModal(true)}
            className="card-lift-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#EFF6FF',
              border: '1px solid #93C5FD',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#1D4ED8',
              cursor: 'pointer'
            }}
            title="Detect circuit design flaws, coherence hazards, and auto-optimize depth (F25/F10)"
          >
            <ShieldAlert size={14} color="#2563EB" />
            <span>AI Critic & Optimizer</span>
          </button>

          <button
            onClick={() => setShowReplayModal(true)}
            className="card-lift-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#1E3A8A',
              cursor: 'pointer'
            }}
            title="Step-by-step state divergence analysis and visual replay (F27)"
          >
            <Activity size={14} color="#2563EB" />
            <span>Error Replay</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="card-lift-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#1E3A8A',
              cursor: 'pointer'
            }}
            title="Share this circuit with a public link (F14)"
          >
            <Share2 size={14} color="#2563EB" />
            <span>Share Circuit</span>
          </button>

          {/* View Mode Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#EFF6FF',
            padding: '3px',
            borderRadius: '9999px',
            border: '1px solid #BFDBFE'
          }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: viewMode === 'split' ? '#1E3A8A' : 'transparent',
                color: viewMode === 'split' ? '#FFFFFF' : '#1E3A8A',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="View Quantum Code Editor and Visual Circuit side-by-side"
            >
              <Code2 size={13} />
              <span>Split (Code + Circuit)</span>
            </button>

            <button
              onClick={() => setViewMode('visual')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: viewMode === 'visual' ? '#1E3A8A' : 'transparent',
                color: viewMode === 'visual' ? '#FFFFFF' : '#1E3A8A',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Visual circuit wireboard only"
            >
              <Sparkles size={13} />
              <span>Visual Only</span>
            </button>

            <button
              onClick={() => setViewMode('code')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: viewMode === 'code' ? '#1E3A8A' : 'transparent',
                color: viewMode === 'code' ? '#FFFFFF' : '#1E3A8A',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Full Quantum Code Editor with Line Locking"
            >
              <Code2 size={13} />
              <span>Code Only</span>
            </button>
          </div>

          <button
            className="btn-editorial-primary card-lift-sm"
            onClick={() => onAskDirac('Explain the physical operation of my currently loaded circuit, including entanglement, interference, and expected measurement statistics.', {
              gates: currentGates,
              numQubits,
              finalState
            })}
            style={{ padding: '8px 16px', fontSize: '12.5px' }}
          >
            <Sparkles size={14} color="#FBBF24" />
            <span>Explain with Dirac AI</span>
          </button>
        </div>
      </div>

      {/* Quantum Code Editor with Line-by-Line Execution & Line Locking (F3 / F16 / Line-by-Line) */}
      {(viewMode === 'split' || viewMode === 'code') && (
        <QuantumCodeEditor
          numQubits={numQubits}
          gates={currentGates}
          onUpdateCircuit={handleUpdateFromCode}
          lockedGateId={lockedGateId}
          onSelectLockedGate={setLockedGateId}
          onAskDirac={(prompt) => onAskDirac(prompt, { gates: currentGates, numQubits, finalState })}
        />
      )}

      {viewMode !== 'code' && (
        <>
          {/* Gate Library Palette */}
          <div className="card-lift" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <GatePalette
              selectedGateType={selectedGateType}
              onSelectGateType={(type, params) => {
                setSelectedGateType(type);
                if (params) setSelectedParams(params);
              }}
            />
          </div>

          {/* Circuit Grid Wireboard in BrowserFrame */}
          <BrowserFrame
            urlPath="quantum-lab://circuit-grid/workspace"
            badge="Interactive Wireboard"
            badgeColor="coral"
            gridBackground={true}
            contentStyle={{ padding: '16px' }}
          >
            <CircuitGrid
              numQubits={numQubits}
              gates={currentGates}
              activeStep={activeStep}
              totalSteps={Math.max(8, circuit.getMaxStep() + 2)}
              selectedGateType={selectedGateType}
              selectedParams={selectedParams}
              onAddGate={handleAddGate}
              onRemoveGate={handleRemoveGate}
              onMoveGate={handleMoveGate}
              onSelectStep={setActiveStep}
              onAddQubit={handleAddQubit}
              onRemoveQubit={handleRemoveQubit}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onReset={handleResetCircuit}
              highlightedGateId={lockedGateId}
              onSelectGate={(gate) => setLockedGateId(gate.id)}
            />
          </BrowserFrame>

          {/* Stepper Controls */}
          <div className="card-lift">
            <TimelineControls
              activeStep={activeStep}
              maxStep={circuit.getMaxStep()}
              onSelectStep={setActiveStep}
              onClearCircuit={handleResetCircuit}
            />
          </div>
        </>
      )}

      {/* Algorithm Resource Analyzer (F19) */}
      <ResourceAnalyzerPanel
        numQubits={numQubits}
        gates={currentGates}
        onOpenOptimizer={() => setShowCriticModal(true)}
      />

      {/* 3D Real-time Visualization & State Inspection Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 1.2fr) minmax(320px, 1fr)',
        gap: '24px'
      }}>
        {/* 3D Scene Card in BrowserFrame */}
        <BrowserFrame
          urlPath={`quantum-lab://multi-qubit-states/step-${activeStep}`}
          badge={`Step t=${activeStep}`}
          badgeColor="navy"
          gridBackground={true}
          headerExtra={
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setActiveTab3D('bloch')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: activeTab3D === 'bloch' ? '1px solid #1E3A8A' : '1px solid #BFDBFE',
                  background: activeTab3D === 'bloch' ? '#1E3A8A' : '#FFFFFF',
                  color: activeTab3D === 'bloch' ? '#FFFFFF' : '#1E3A8A',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Bloch Spheres
              </button>
              <button
                onClick={() => setActiveTab3D('density')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: activeTab3D === 'density' ? '1px solid #1E3A8A' : '1px solid #BFDBFE',
                  background: activeTab3D === 'density' ? '#1E3A8A' : '#FFFFFF',
                  color: activeTab3D === 'density' ? '#FFFFFF' : '#1E3A8A',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                3D State City (ρ)
              </button>
              <button
                onClick={() => setActiveTab3D('heatmap')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: activeTab3D === 'heatmap' ? '1px solid #1E3A8A' : '1px solid #BFDBFE',
                  background: activeTab3D === 'heatmap' ? '#1E3A8A' : '#FFFFFF',
                  color: activeTab3D === 'heatmap' ? '#FFFFFF' : '#1E3A8A',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Probability Heatmap
              </button>
            </div>
          }
        >
          <div style={{ height: '380px', position: 'relative', overflowY: 'auto' }}>
            {activeTab3D === 'bloch' ? (
              <MultiBlochView
                qubitStates={currentStepState.qubitStates}
                entropy={currentStepState.entropy}
              />
            ) : activeTab3D === 'density' ? (
              <DensityMatrix3D
                densityMatrix={currentStepState.densityMatrix}
                numQubits={numQubits}
              />
            ) : (
              <ProbabilityHeatmap stateVector={finalState} />
            )}
          </div>
        </BrowserFrame>

        {/* State Formulation and Amplitudes */}
        <div className="card-lift">
          <StateInspector stateVector={finalState} />
        </div>
      </div>

      {/* Measurement Simulator Panel */}
      <div className="card-lift">
        <MeasurementPanel stateVector={finalState} />
      </div>

      {/* Code Export Modal */}
      <CodeExportModal
        numQubits={numQubits}
        gates={currentGates}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* AI Circuit Critic & Depth Optimizer Modal (F25 / F10) */}
      <CircuitCriticPanel
        numQubits={numQubits}
        gates={currentGates}
        isOpen={showCriticModal}
        onClose={() => setShowCriticModal(false)}
        onAskDirac={onAskDirac}
      />

      {/* Public Circuit Sharing Modal (F14) */}
      <ShareCircuitModal
        numQubits={numQubits}
        gates={currentGates}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Visual Error Replay & Step Divergence Modal (F27) */}
      <VisualErrorReplay
        numQubits={numQubits}
        actualGates={currentGates}
        isOpen={showReplayModal}
        onClose={() => setShowReplayModal(false)}
      />
    </div>
  );
};
