// src/components/ui/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Graceful Error Boundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          background: '#FFF1F2',
          border: '1px solid #FFE4E6',
          borderRadius: '12px',
          margin: '16px auto',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#E11D48'
          }}>
            <AlertTriangle size={20} />
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#9F1239', margin: 0 }}>
            {this.props.fallbackTitle || 'Quantum Simulation Safeguard Triggered'}
          </h3>

          <p style={{ fontSize: '13px', color: '#BE123C', margin: 0, lineHeight: 1.5, maxWidth: '480px' }}>
            {this.props.fallbackMessage ||
              'A non-unitary state or unsupported circuit operation was safely intercepted. The quantum engine has preserved your learning session.'}
          </p>

          <button
            onClick={this.handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset to Coherent State</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
