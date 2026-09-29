// src/components/circuit/CodeExportModal.tsx
// F4 (Multi-Framework Engine) + F16 (Circuit→Code) + F23 (Cross-Framework Execution)
import React, { useState } from 'react';
import { Copy, Check, X, FileCode, Cpu, ExternalLink } from 'lucide-react';
import { CircuitGate } from '../../types';
import { exportToQASM, exportToQiskit, exportToPennyLane, exportToCirq, analyzeCircuitResources } from '../../quantum/qasm';

type Framework = 'qiskit' | 'pennylane' | 'cirq' | 'qasm';

interface CodeExportModalProps {
  numQubits: number;
  gates: CircuitGate[];
  isOpen: boolean;
  onClose: () => void;
}

const FRAMEWORKS: { id: Framework; label: string; badge: string; color: string; docsUrl: string; description: string }[] = [
  { id: 'qiskit', label: 'Qiskit', badge: 'IBM Quantum', color: '#1E3A8A', docsUrl: 'https://qiskit.org', description: 'Run on IBM Quantum processors or local AerSimulator' },
  { id: 'pennylane', label: 'PennyLane', badge: 'Xanadu', color: '#7C3AED', docsUrl: 'https://pennylane.ai', description: 'Differentiable quantum programming for ML & VQE' },
  { id: 'cirq', label: 'Cirq', badge: 'Google', color: '#059669', docsUrl: 'https://quantumai.google/cirq', description: "Run on Google's quantum processors via Cirq cloud" },
  { id: 'qasm', label: 'OpenQASM 2.0', badge: 'Standard', color: '#D97706', docsUrl: 'https://openqasm.com', description: 'Standard quantum assembly language — works across platforms' },
];

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ numQubits, gates, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Framework>('qiskit');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const metrics = analyzeCircuitResources(numQubits, gates);

  const getCode = (fw: Framework): string => {
    switch (fw) {
      case 'qiskit': return exportToQiskit(numQubits, gates);
      case 'pennylane': return exportToPennyLane(numQubits, gates);
      case 'cirq': return exportToCirq(numQubits, gates);
      case 'qasm': return exportToQASM(numQubits, gates);
    }
  };

  const code = getCode(activeTab);
  const activeFw = FRAMEWORKS.find(f => f.id === activeTab)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100, padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0',
        width: '100%', maxWidth: '860px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.15)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #E8E8E8',
          background: 'linear-gradient(180deg, #EFF6FF, #FFFFFF)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCode size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Circuit → Code Export</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>F16 · Multi-Framework Code Generation (F4 · F23)</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F4F8FC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Resource Metrics Bar (F19) */}
        <div style={{ display: 'flex', gap: 12, padding: '10px 20px', background: '#F8FAFC', borderBottom: '1px solid #E8E8E8', flexWrap: 'wrap' }}>
          {[
            { label: 'Gates', value: metrics.gateCount, color: '#1E3A8A' },
            { label: 'Depth', value: metrics.circuitDepth, color: '#7C3AED' },
            { label: '2-Qubit Ops', value: metrics.twoQubitGates, color: '#059669' },
            { label: 'T-Count', value: metrics.tGates, color: '#D97706' },
            { label: 'Qubits', value: metrics.qubitCount, color: '#DC2626' },
            { label: 'Est. Fidelity', value: `${(metrics.estimatedFidelity * 100).toFixed(1)}%`, color: '#0F172A' },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '4px 10px' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>{m.label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Framework Tabs */}
        <div style={{ display: 'flex', padding: '10px 20px', gap: 8, background: '#F8FAFC', borderBottom: '1px solid #E8E8E8', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FRAMEWORKS.map(fw => (
              <button
                key={fw.id}
                onClick={() => setActiveTab(fw.id)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: activeTab === fw.id ? `1.5px solid ${fw.color}` : '1px solid #CBD5E1',
                  background: activeTab === fw.id ? fw.color : '#FFFFFF',
                  color: activeTab === fw.id ? '#FFFFFF' : '#334155',
                  transition: 'all 0.15s'
                }}
              >
                {fw.label}
                <span style={{
                  marginLeft: 5, fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono',
                  background: activeTab === fw.id ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                  color: activeTab === fw.id ? '#fff' : '#64748B',
                  padding: '1px 5px', borderRadius: 4
                }}>{fw.badge}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href={activeFw.docsUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: activeFw.color, fontWeight: 600, textDecoration: 'none' }}>
              <ExternalLink size={12} /> Docs
            </a>
            <button onClick={handleCopy} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
              background: copied ? '#10B981' : activeFw.color,
              color: '#FFFFFF', border: 'none', borderRadius: 8,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
            }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Framework Description */}
        <div style={{ padding: '8px 20px', background: '#FFFBEB', borderBottom: '1px solid #FEF3C7', fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cpu size={13} color="#D97706" />
          <span><strong>{activeFw.label}:</strong> {activeFw.description}</span>
        </div>

        {/* Code View */}
        <div style={{ padding: '20px', overflowY: 'auto', background: '#0F172A', flex: 1 }}>
          <pre style={{
            margin: 0, fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px', color: '#E2E8F0', lineHeight: '1.65', whiteSpace: 'pre-wrap'
          }}>
            {code}
          </pre>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px', borderTop: '1px solid #E8E8E8', background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
        }}>
          <span style={{ fontSize: 11, color: '#64748B' }}>
            💡 {metrics.resourceSummary}
          </span>
          <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
            QuantumLearn · F4/F16/F19/F23
          </span>
        </div>
      </div>
    </div>
  );
};
