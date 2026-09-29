// src/components/layout/Footer.tsx
import React from 'react';
import { Atom, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid #E8E8E8',
      background: '#FAFAF8',
      padding: '24px',
      fontSize: '12px',
      color: '#666666'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Atom size={16} color="#111111" />
          <span style={{ fontWeight: 600, color: '#111111' }}>QuantumLearn</span>
          <span>• AI-Powered Active Learning & 3D Quantum Simulator</span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a
            href="https://qiskit.org/documentation/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#666666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Qiskit Docs</span>
            <ExternalLink size={11} />
          </a>
          <a
            href="https://quantum-computing.ibm.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#666666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>IBM Quantum</span>
            <ExternalLink size={11} />
          </a>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#94A3B8' }}>
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};
