// src/components/views/ShorAlgorithmView.tsx
import React, { useState, useMemo } from 'react';
import { soundEffects } from '../../audio/soundEffects';
import confetti from 'canvas-confetti';
import { BrowserFrame } from '../ui/BrowserFrame';
import {
  ArrowRight, ArrowLeft, CheckCircle2,
  Sparkles, KeyRound, ShieldAlert
} from 'lucide-react';

interface ShorAlgorithmViewProps {
  onAskDirac: (prompt: string) => void;
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export const ShorAlgorithmView: React.FC<ShorAlgorithmViewProps> = ({ onAskDirac }) => {
  const [targetN, setTargetN] = useState<number>(15);
  const [chosenA, setChosenA] = useState<number>(7);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Available coprimes for N=15
  const coprimes15 = [2, 7, 8, 11, 13];
  // Available coprimes for N=21
  const coprimes21 = [2, 4, 5, 8, 10, 11, 13];

  const currentCoprimes = targetN === 15 ? coprimes15 : coprimes21;

  // Compute periodic sequence f(x) = a^x mod N
  const sequenceLength = 16;
  const periodicSequence = useMemo(() => {
    const seq: { x: number; val: number }[] = [];
    let current = 1;
    for (let x = 0; x < sequenceLength; x++) {
      seq.push({ x, val: current });
      current = (current * chosenA) % targetN;
    }
    return seq;
  }, [targetN, chosenA]);

  // Find exact period r
  const periodR = useMemo(() => {
    let current = chosenA % targetN;
    let r = 1;
    while (current !== 1 && r < 30) {
      current = (current * chosenA) % targetN;
      r++;
    }
    return r;
  }, [targetN, chosenA]);

  // Number of counting qubits for simulation: n=8 for N=15 (2^8 = 256)
  const countingQubits = 8;
  const countingDim = 1 << countingQubits; // 256

  // QFT interference peaks: multiples of 2^n / r
  const interferencePeaks = useMemo(() => {
    const peaks: { s: number; k: number; approxR: number; prob: number }[] = [];
    for (let k = 0; k < periodR; k++) {
      const s = Math.round((k * countingDim) / periodR);
      peaks.push({
        s,
        k,
        approxR: k > 0 ? Math.round(countingDim / (s / k)) : periodR,
        prob: 1 / periodR
      });
    }
    return peaks;
  }, [countingDim, periodR]);

  // Factor computation
  const isEvenPeriod = periodR % 2 === 0;
  const halfPow = Math.pow(chosenA, periodR / 2);
  const isNotTrivialMinusOne = isEvenPeriod && (halfPow % targetN !== targetN - 1);

  const factor1 = isEvenPeriod ? gcd(Math.round(halfPow - 1), targetN) : null;
  const factor2 = isEvenPeriod ? gcd(Math.round(halfPow + 1), targetN) : null;
  const isSuccessful = factor1 && factor2 && factor1 > 1 && factor2 > 1 && factor1 * factor2 === targetN;

  const steps = [
    { title: '1. Classical Preprocessing', subtitle: 'Pick a coprime integer a with gcd(a, N) = 1' },
    { title: '2. Modular Function f(x)', subtitle: 'Compute f(x) = aˣ mod N and find periodicity' },
    { title: '3. Quantum Period Finding', subtitle: 'Superposition, entanglement, and QFT interference' },
    { title: '4. Continued Fractions', subtitle: 'Extract exact integer period r from measurement' },
    { title: '5. Factor Extraction', subtitle: 'Compute gcd(a^(r/2) ± 1, N) to recover prime factors' }
  ];

  const handleNextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      soundEffects.playStep();
      const nextIdx = activeStepIndex + 1;
      setActiveStepIndex(nextIdx);
      if (nextIdx === 4 && isSuccessful) {
        soundEffects.playSuccessChord();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      soundEffects.playStep();
      setActiveStepIndex(activeStepIndex - 1);
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
      {/* Header with Template Styling */}
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
              <span>RSA Cryptanalysis Engine</span>
            </span>
            <span className="navy-pill-badge">
              <span>Polynomial Time O((log N)³)</span>
            </span>
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Shor's Algorithm: Quantum Factorization
          </h1>
          <p className="editorial-subtitle" style={{ fontSize: '14px', margin: '4px 0 0 0', maxWidth: '780px' }}>
            Peter Shor's 1994 algorithm factors composite integers in polynomial time, exponentially outperforming the best classical algorithms and breaking RSA public-key encryption.
          </p>
        </div>

        {/* Target N Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E3A8A' }}>Composite N:</span>
          {[15, 21].map((n) => (
            <button
              key={n}
              onClick={() => {
                soundEffects.playStep();
                setTargetN(n);
                setChosenA(n === 15 ? 7 : 4);
                setActiveStepIndex(0);
              }}
              className={targetN === n ? 'btn-editorial-primary' : 'card-lift-sm'}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                border: targetN === n ? 'none' : '1px solid #BFDBFE',
                background: targetN === n ? '#1E3A8A' : '#FFFFFF',
                color: targetN === n ? '#FFFFFF' : '#1E3A8A',
                fontSize: '12.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              N = {n}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Step Progression Breadcrumb Bar */}
      <div
        className="card-lift"
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '8px',
          overflowX: 'auto',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.04)'
        }}
      >
        {steps.map((st, idx) => {
          const isActive = activeStepIndex === idx;
          const isDone = activeStepIndex > idx;

          return (
            <button
              key={st.title}
              onClick={() => setActiveStepIndex(idx)}
              className="card-lift-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid #2563EB' : '1px solid transparent',
                background: isActive ? '#EFF6FF' : isDone ? '#F8FAFC' : 'transparent',
                color: isActive ? '#1E3A8A' : isDone ? '#0F172A' : '#64748B',
                fontSize: '12px',
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{st.title}</span>
              {isDone && <CheckCircle2 size={13} color="#059669" />}
            </button>
          );
        })}
      </div>

      {/* STEP 1: CLASSICAL PREPROCESSING */}
      {activeStepIndex === 0 && (
        <div
          className="card-lift"
          style={{
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.04)'
          }}
        >
          <div>
            <span className="navy-pill-badge" style={{ fontSize: '11px', padding: '3px 12px' }}>
              Step 1 of 5: Classical Setup
            </span>
            <h2 className="editorial-title" style={{ fontSize: '24px', margin: '10px 0 6px 0' }}>
              Classical Preprocessing & Coprime Selection
            </h2>
            <p className="editorial-subtitle" style={{ fontSize: '14.5px', margin: 0 }}>
              We wish to find non-trivial prime factors of composite integer <strong>N = {targetN}</strong>. First, we pick a random integer $a$ in the range $1 &lt; a &lt; N$ and test whether $\gcd(a, N) = 1$ using Euclid's algorithm.
            </p>
          </div>

          <div style={{
            padding: '20px',
            background: '#F8FAFC',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A8A' }}>
              Select Coprime Base a:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {currentCoprimes.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    soundEffects.playGateClick();
                    setChosenA(a);
                  }}
                  className="card-lift-sm"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: chosenA === a ? '2px solid #2563EB' : '1px solid #BFDBFE',
                    background: chosenA === a ? '#EFF6FF' : '#FFFFFF',
                    color: chosenA === a ? '#1E3A8A' : '#475569',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  a = {a}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#065F46'
            }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>
                <strong>Coprime Verified:</strong> $\gcd({chosenA}, {targetN}) = 1$. Base $a = {chosenA}$ shares no common factor with $N = {targetN}$.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleNextStep}
              className="btn-coral-action"
            >
              <span>Step 2: Inspect Modular Periodicity →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MODULAR FUNCTION PERIODICITY */}
      {activeStepIndex === 1 && (
        <div
          className="card-lift"
          style={{
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.04)'
          }}
        >
          <div>
            <span className="navy-pill-badge" style={{ fontSize: '11px', padding: '3px 12px' }}>
              Step 2 of 5: Number Theory
            </span>
            <h2 className="editorial-title" style={{ fontSize: '24px', margin: '10px 0 6px 0' }}>
              The Periodic Function: f(x) = {chosenA}ˣ mod {targetN}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#4B5563', margin: 0, lineHeight: '1.6' }}>
              Euler's theorem guarantees that the modular exponential sequence $f(x) = a^x \pmod N$ is strictly periodic! The smallest positive integer $r$ such that $a^r \equiv 1 \pmod N$ is the <strong>order</strong> or <strong>period</strong> of $a$.
            </p>
          </div>

          {/* Sequence Chart */}
          <div style={{
            padding: '16px',
            background: '#FAFAF8',
            border: '1px solid #E8E8E8',
            borderRadius: '10px',
            overflowX: 'auto'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
              Sequence Values: {periodicSequence.slice(0, 12).map(s => `${chosenA}^${s.x} mod ${targetN} = ${s.val}`).join(' ⟶ ')}
            </div>

            <div style={{ display: 'flex', gap: '6px', minWidth: '600px', height: '140px', alignItems: 'flex-end', paddingTop: '10px' }}>
              {periodicSequence.map((item) => {
                const isPeriodBoundary = item.x % periodR === 0;
                const heightPercent = (item.val / targetN) * 100;

                return (
                  <div
                    key={item.x}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: isPeriodBoundary ? '#4F46E5' : '#334155' }}>
                      {item.val}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(12, heightPercent)}%`,
                        background: isPeriodBoundary ? '#4F46E5' : '#CBD5E1',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                    <span style={{ fontSize: '9.5px', color: '#94A3B8' }}>
                      x={item.x}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Period Callout Card */}
          <div style={{
            padding: '12px 16px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#1E40AF'
          }}>
            <strong>Fundamental Period Discovered:</strong> The sequence repeats every <strong>r = {periodR}</strong> steps! Notice {chosenA}^{periodR} mod {targetN} = {Math.pow(chosenA, periodR) % targetN}.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={handlePrevStep}
              style={{
                padding: '8px 14px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleNextStep}
              className="btn-coral-action"
            >
              <span>Step 3: Run Quantum Period Finding →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: QUANTUM PERIOD FINDING & QFT */}
      {activeStepIndex === 2 && (
        <div
          className="card-lift"
          style={{
            background: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.04)'
          }}
        >
          <div>
            <span className="navy-pill-badge" style={{ fontSize: '11px', padding: '3px 12px' }}>
              Step 3 of 5: Quantum Interference
            </span>
            <h2 className="editorial-title" style={{ fontSize: '24px', margin: '10px 0 6px 0' }}>
              Quantum Period Finding Subroutine (QFT Interference)
            </h2>
            <p className="editorial-subtitle" style={{ fontSize: '14.5px', margin: 0 }}>
              Classical computers must evaluate f(x) one-by-one, which is exponentially slow for 2048-bit numbers. A quantum computer prepares a uniform superposition of all states x from 0 to 2ⁿ - 1, computes aˣ mod N in superposition, and applies the Inverse QFT to produce <strong>sharp constructive interference peaks</strong> at multiples of 2ⁿ / r!
            </p>
          </div>

          {/* Simulated QFT Peak Distribution */}
          <div style={{
            padding: '20px',
            background: '#F8FAFC',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>MEASUREMENT BASIS STATES s ∈ [0, {countingDim - 1}]</span>
              <span>INTERFERENCE PROBABILITY P(s)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {interferencePeaks.map((peak) => (
                <div
                  key={peak.k}
                  className="card-lift-sm"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    padding: '10px 14px',
                    background: '#FFFFFF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}>
                    <div>
                      <strong style={{ color: '#2563EB' }}>s = {peak.s}</strong>
                      <span style={{ color: '#64748B', marginLeft: '10px', fontSize: '11.5px' }}>
                        (Peak k={peak.k} of {periodR}: {peak.k}·{countingDim}/{periodR})
                      </span>
                    </div>
                    <strong style={{ color: '#059669' }}>
                      {(peak.prob * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div style={{ height: '7px', background: '#E2EEFC', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${peak.prob * 100}%`, background: 'linear-gradient(90deg, #2563EB 0%, #1E3A8A 100%)', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handlePrevStep}
              className="card-lift-sm"
              style={{
                padding: '8px 18px',
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleNextStep}
              className="btn-coral-action"
            >
              <span>Step 4: Continued Fractions Algorithm →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONTINUED FRACTIONS */}
      {activeStepIndex === 3 && (
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
        }}>
          <div>
            <span className="purple-pill-badge" style={{ fontSize: '11px', marginBottom: '8px', display: 'inline-flex' }}>
              Step 4 of 5 • Classical Post-Processing
            </span>
            <h2 className="editorial-title" style={{ fontSize: '22px', fontWeight: 800, color: '#1E3A8A', margin: '6px 0 8px 0' }}>
              Continued Fractions Expansion: Estimating s / 2ⁿ ≈ k / r
            </h2>
            <p className="editorial-subtitle" style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
              Measuring the quantum register yields an integer <em>s</em>. The phase ratio <strong>s / 2ⁿ</strong> is a close rational approximation to <strong>k / r</strong>. The classical Continued Fractions algorithm efficiently extracts the exact quantum period denominator <strong>r</strong>!
            </p>
          </div>

          <div style={{
            padding: '18px',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0 6px',
              fontSize: '12.5px',
              fontFamily: 'JetBrains Mono, monospace',
              textAlign: 'left'
            }}>
              <thead>
                <tr style={{ color: '#64748B', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '8px 12px' }}>Measured s</th>
                  <th style={{ padding: '8px 12px' }}>Phase Ratio (s / 256)</th>
                  <th style={{ padding: '8px 12px' }}>Fraction k / r</th>
                  <th style={{ padding: '8px 12px' }}>Extracted Period r</th>
                </tr>
              </thead>
              <tbody>
                {interferencePeaks.slice(1).map((peak) => (
                  <tr key={peak.s} style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A', borderRadius: '6px 0 0 6px' }}>s = {peak.s}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{(peak.s / countingDim).toFixed(4)}</td>
                    <td style={{ padding: '10px 12px', color: '#4F46E5', fontWeight: 600 }}>{peak.k} / {periodR}</td>
                    <td style={{ padding: '10px 12px', color: '#059669', fontWeight: 700, borderRadius: '0 6px 6px 0' }}>
                      <span className="emerald-pill-badge" style={{ fontSize: '11px', padding: '3px 8px' }}>r = {periodR} ✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handlePrevStep}
              style={{
                padding: '8px 16px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleNextStep}
              className="btn-coral-action"
            >
              <span>Step 5: Extract Prime Factors →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CLASSICAL POST-PROCESSING & FACTOR EXTRACTION */}
      {activeStepIndex === 4 && (
        <div className="card-lift" style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 4px 20px -2px rgba(30, 58, 138, 0.08)'
        }}>
          <div>
            <span className="emerald-pill-badge" style={{ fontSize: '11px', marginBottom: '8px', display: 'inline-flex' }}>
              Step 5 of 5: Grand Solution
            </span>
            <h2 className="editorial-title" style={{ fontSize: '24px', fontWeight: 800, color: '#1E3A8A', margin: '6px 0 8px 0' }}>
              Recovering Prime Factors: {targetN} = {factor1} × {factor2}
            </h2>
            <p className="editorial-subtitle" style={{ fontSize: '14.5px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
              With the quantum period <strong>r = {periodR}</strong> in hand, number theory does the rest! Since aʳ ≡ 1 (mod N), we have (a^(r/2))² - 1 ≡ 0 (mod N), which factors into (a^(r/2) - 1)(a^(r/2) + 1) ≡ 0 (mod N).
            </p>
          </div>

          {/* Mathematical Derivation Box */}
          <div style={{
            padding: '20px 24px',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px'
          }}>
            <div style={{ color: '#1E3A8A', fontWeight: 600 }}>1. Verify period r is even: <strong>r = {periodR} is even ✓</strong></div>
            <div style={{ color: '#334155' }}>2. Half power: a^(r/2) = {chosenA}^({periodR}/2) = {chosenA}^{periodR / 2} = <strong style={{ color: '#1E3A8A' }}>{halfPow}</strong></div>
            <div style={{ color: '#334155' }}>
              3. Factor 1: gcd(a^(r/2) - 1, N) = gcd({halfPow} - 1, {targetN}) = gcd({halfPow - 1}, {targetN}) = <strong style={{ color: '#059669', fontSize: '16px', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>{factor1}</strong>
            </div>
            <div style={{ color: '#334155' }}>
              4. Factor 2: gcd(a^(r/2) + 1, N) = gcd({halfPow} + 1, {targetN}) = gcd({halfPow + 1}, {targetN}) = <strong style={{ color: '#059669', fontSize: '16px', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>{factor2}</strong>
            </div>
          </div>

          {/* Success Banner */}
          {isSuccessful && (
            <div className="card-lift-sm" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              border: '2px solid #10B981',
              borderRadius: '12px',
              color: '#065F46',
              boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.15)'
            }}>
              <CheckCircle2 size={36} color="#059669" />
              <div>
                <div className="editorial-title" style={{ fontSize: '19px', fontWeight: 800, color: '#065F46' }}>
                  Factorization Complete: {targetN} = {factor1} × {factor2}
                </div>
                <div style={{ fontSize: '13.5px', marginTop: '3px', color: '#047857' }}>
                  Shor's algorithm successfully factored composite number {targetN} in polynomial time using quantum period finding!
                </div>
              </div>
            </div>
          )}

          {/* Cryptographic Impact: Why This Breaks RSA */}
          <div style={{
            padding: '18px 22px',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 700, fontSize: '13.5px' }}>
              <ShieldAlert size={18} />
              <span>Cryptographic Impact: Why This Breaks RSA</span>
            </div>
            <p style={{ fontSize: '13px', color: '#92400E', margin: 0, lineHeight: '1.6' }}>
              RSA public-key encryption relies on the fact that multiplying two large primes (N = p × q) takes microseconds, whereas reversing this factorization classically takes billions of years.
              Because Shor's quantum period finding runs in <strong>O((log N)³)</strong> polynomial time, a fault-tolerant quantum computer can factor standard 2048-bit RSA keys in hours!
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handlePrevStep}
              style={{
                padding: '8px 16px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => onAskDirac(`Explain why finding the period of f(x) = a^x mod N using quantum Fourier transform breaks RSA public key cryptography.`)}
              className="btn-editorial-primary"
              style={{ gap: '8px', padding: '10px 22px' }}
            >
              <Sparkles size={15} color="#F59E0B" />
              <span>Ask Dirac AI About RSA Security Implications</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
