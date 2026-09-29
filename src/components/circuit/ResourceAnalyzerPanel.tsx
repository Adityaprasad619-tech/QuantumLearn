// src/components/circuit/ResourceAnalyzerPanel.tsx
// F19: Algorithm Resource Analyzer (gate count, depth, T-count, 2-qubit gate count, estimated fidelity)
import React, { useMemo } from 'react';
import { CircuitGate } from '../../types';
import { analyzeCircuitResources, CircuitResourceMetrics } from '../../quantum/qasm';
import { Layers, Cpu, Zap, ShieldCheck, Activity, Gauge, Info } from 'lucide-react';

interface ResourceAnalyzerPanelProps {
  numQubits: number;
  gates: CircuitGate[];
  onOpenOptimizer?: () => void;
}

export const ResourceAnalyzerPanel: React.FC<ResourceAnalyzerPanelProps> = ({
  numQubits,
  gates,
  onOpenOptimizer
}) => {
  const metrics: CircuitResourceMetrics = useMemo(() => {
    return analyzeCircuitResources(numQubits, gates);
  }, [numQubits, gates]);

  // Determine fault-tolerance readiness
  const ftStatus = useMemo(() => {
    if (metrics.tGates === 0 && metrics.twoQubitGates < 10) {
      return { label: 'Clifford-Only / Near-Term NISQ', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
    } else if (metrics.tGates <= 4) {
      return { label: 'Moderate Magic State Cost', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
    } else {
      return { label: 'High T-Depth (Distillation Heavy)', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
    }
  }, [metrics]);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #BFDBFE',
      borderRadius: '16px',
      padding: '18px 20px',
      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Cpu size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
              Resource Analyzer (F19)
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
              Real-time hardware compile profile & fault-tolerance complexity
            </p>
          </div>
        </div>

        {onOpenOptimizer && (
          <button
            onClick={onOpenOptimizer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#EFF6FF',
              border: '1px solid #93C5FD',
              borderRadius: '8px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1D4ED8',
              cursor: 'pointer'
            }}
          >
            <Zap size={13} />
            <span>AI Optimize Circuit</span>
          </button>
        )}
      </div>

      {/* Grid of Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px'
      }}>
        {/* Total Gates */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '10px 12px'
        }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={12} /> Total Gates
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginTop: '4px' }}>
            {metrics.gateCount}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
            {metrics.qubitCount} active wires
          </div>
        </div>

        {/* Circuit Depth */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '10px 12px'
        }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Gauge size={12} /> Circuit Depth
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
            {metrics.circuitDepth}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
            {metrics.parallelizationScore} gates/cycle
          </div>
        </div>

        {/* 2-Qubit CX/CZ Count */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '10px 12px'
        }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} /> 2-Qubit Gates
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: metrics.twoQubitGates > 5 ? '#D97706' : '#059669', marginTop: '4px' }}>
            {metrics.twoQubitGates}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
            Highest error source
          </div>
        </div>

        {/* T-Gate Count */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '10px 12px'
        }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} /> T-Gate Count
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: metrics.tGates > 0 ? '#7C3AED' : '#64748B', marginTop: '4px' }}>
            {metrics.tGates}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
            Magic state cost
          </div>
        </div>

        {/* Estimated Hardware Fidelity */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '10px 12px'
        }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} /> Est. Fidelity
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: metrics.estimatedFidelity > 0.9 ? '#059669' : '#DC2626', marginTop: '4px' }}>
            {(metrics.estimatedFidelity * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
            NISQ baseline
          </div>
        </div>
      </div>

      {/* Fault-Tolerance & Hardware Tag */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: ftStatus.bg,
        border: `1px solid ${ftStatus.border}`,
        borderRadius: '10px',
        padding: '8px 12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} color={ftStatus.color} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: ftStatus.color }}>
            {ftStatus.label}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#475569' }}>
          {metrics.resourceSummary}
        </span>
      </div>
    </div>
  );
};
