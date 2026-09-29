// src/components/curriculum/TheoryNotes.tsx
import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Lightbulb, Copy, Check, Atom } from 'lucide-react';
import { TheoryVisualizer } from './TheoryVisualizer';

interface TheoryNotesProps {
  markdown: string;
  conceptSummary?: string;
  lessonId?: string;
}

declare global {
  interface Window {
    katex?: {
      renderToString: (tex: string, options?: any) => string;
    };
  }
}

// Fallback Math Formatter when KaTeX is not loaded or during initial hydration
const fallbackFormatMath = (tex: string): string => {
  return tex
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\phi/g, 'ϕ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\pi/g, 'π')
    .replace(/\\langle/g, '⟨')
    .replace(/\\rangle/g, '⟩')
    .replace(/\\vert/g, '|')
    .replace(/\\in/g, '∈')
    .replace(/\\mathbb\{C\}/g, 'ℂ')
    .replace(/\\mathbb\{R\}/g, 'ℝ')
    .replace(/\\implies/g, ' ⟹ ')
    .replace(/\\to/g, ' → ')
    .replace(/\\times/g, ' × ')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\pm/g, '±')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\sum/g, '∑')
    .replace(/\\sqrt/g, '√')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\^2/g, '²')
    .replace(/\^\{2\}/g, '²')
    .replace(/\^\{([^}]+)\}/g, '^$1')
    .replace(/_\{([^}]+)\}/g, '_$1');
};

export const MathEquation: React.FC<{ formula: string; displayMode?: boolean }> = ({
  formula,
  displayMode = false
}) => {
  const [copied, setCopied] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null);

  useEffect(() => {
    let cleanFormula = formula.trim();
    // Strip surrounding $ or $$ if present
    if (cleanFormula.startsWith('$$') && cleanFormula.endsWith('$$')) {
      cleanFormula = cleanFormula.slice(2, -2).trim();
    } else if (cleanFormula.startsWith('$') && cleanFormula.endsWith('$')) {
      cleanFormula = cleanFormula.slice(1, -1).trim();
    }

    if (window.katex) {
      try {
        const html = window.katex.renderToString(cleanFormula, {
          displayMode,
          throwOnError: false
        });
        setRenderedHtml(html);
        return;
      } catch (err) {
        console.warn('KaTeX render error:', err);
      }
    }
    setRenderedHtml(null);
  }, [formula, displayMode]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rawClean = formula.replace(/^\$\$?/, '').replace(/\$\$?$/, '').trim();

  if (displayMode) {
    return (
      <div style={{
        margin: '18px 0',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        overflowX: 'auto'
      }}>
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          {renderedHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              style={{ fontSize: '16.5px', color: '#0F172A', padding: '4px 0' }}
            />
          ) : (
            <div style={{
              fontFamily: "'JetBrains Mono', 'Cambria Math', serif",
              fontSize: '16px',
              fontWeight: 600,
              color: '#0F172A',
              letterSpacing: '0.02em',
              padding: '6px 0'
            }}>
              {fallbackFormatMath(rawClean)}
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          title="Copy LaTeX Formula"
          style={{
            background: 'transparent',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '4px 8px',
            cursor: 'pointer',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            marginLeft: '12px',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#94A3B8'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#CBD5E1'}
        >
          {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'LaTeX'}</span>
        </button>
      </div>
    );
  }

  // Inline Math
  if (renderedHtml) {
    return (
      <span
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
        style={{
          display: 'inline-block',
          padding: '0 3px',
          verticalAlign: 'baseline',
          color: '#0F172A'
        }}
      />
    );
  }

  return (
    <code style={{
      fontFamily: "'JetBrains Mono', 'Cambria Math', monospace",
      fontSize: '13px',
      fontWeight: 600,
      color: '#1E293B',
      background: '#F1F5F9',
      padding: '2px 6px',
      borderRadius: '4px',
      border: '1px solid #E2E8F0',
      whiteSpace: 'nowrap'
    }}>
      {fallbackFormatMath(rawClean)}
    </code>
  );
};

// Formats inline markdown tokens (**bold**, *italic*, `code`, and $inline math$)
const renderFormattedInline = (text: string): React.ReactNode[] => {
  // Split by inline math $...$ first
  const mathParts = text.split(/(\$[^$]+\$)/g);

  return mathParts.map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      return <MathEquation key={`math-${index}`} formula={part} displayMode={false} />;
    }

    // Split by bold **bold**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
        const cleanBold = bPart.slice(2, -2);
        return (
          <strong key={`bold-${index}-${bIdx}`} style={{ color: '#0F172A', fontWeight: 650 }}>
            {cleanBold}
          </strong>
        );
      }

      // Split by inline code `code`
      const codeParts = bPart.split(/(`[^`]+`)/g);
      return codeParts.map((cPart, cIdx) => {
        if (cPart.startsWith('`') && cPart.endsWith('`') && cPart.length > 2) {
          const cleanCode = cPart.slice(1, -1);
          return (
            <code
              key={`code-${index}-${bIdx}-${cIdx}`}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12.5px',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '2px 5px',
                color: '#475569'
              }}
            >
              {cleanCode}
            </code>
          );
        }

        return <span key={`txt-${index}-${bIdx}-${cIdx}`}>{cPart}</span>;
      });
    });
  });
};

export const TheoryNotes: React.FC<TheoryNotesProps> = ({
  markdown,
  conceptSummary,
  lessonId
}) => {
  const [katexLoaded, setKatexLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Check if KaTeX is already loaded or polls briefly
    if (window.katex) {
      setKatexLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.katex) {
        setKatexLoaded(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Parse markdown lines and blocks
  const parseBlocks = () => {
    const lines = markdown.split('\n');
    const blocks: React.ReactNode[] = [];
    let currentList: string[] = [];
    let inDisplayMath = false;
    let displayMathBuffer: string[] = [];

    const flushList = (key: string) => {
      if (currentList.length > 0) {
        const items = [...currentList];
        currentList = [];
        blocks.push(
          <div
            key={key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              margin: '12px 0 16px 0',
              padding: '14px 18px',
              background: '#FAFAFA',
              border: '1px solid #F0F0F0',
              borderRadius: '8px'
            }}
          >
            {items.map((it, idx) => (
              <div
                key={`li-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '14px',
                  lineHeight: '1.65',
                  color: '#334155'
                }}
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#0F172A',
                  marginTop: '8px',
                  flexShrink: 0
                }} />
                <div>{renderFormattedInline(it)}</div>
              </div>
            ))}
          </div>
        );
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check for standalone $$ on line or $$...$$ single line
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
        flushList(`list-before-math-${idx}`);
        blocks.push(
          <MathEquation
            key={`math-block-${idx}`}
            formula={trimmed}
            displayMode={true}
          />
        );
        return;
      }

      if (trimmed === '$$') {
        if (inDisplayMath) {
          // close math block
          const formula = displayMathBuffer.join(' ');
          displayMathBuffer = [];
          inDisplayMath = false;
          blocks.push(
            <MathEquation
              key={`math-block-${idx}`}
              formula={formula}
              displayMode={true}
            />
          );
        } else {
          flushList(`list-before-math-open-${idx}`);
          inDisplayMath = true;
        }
        return;
      }

      if (inDisplayMath) {
        displayMathBuffer.push(trimmed);
        return;
      }

      // Check for headings
      if (trimmed.startsWith('### ')) {
        flushList(`list-before-h3-${idx}`);
        const title = trimmed.replace('### ', '');
        blocks.push(
          <div
            key={`h3-${idx}`}
            style={{
              margin: '28px 0 12px 0',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{
              width: '4px',
              height: '18px',
              background: '#0F172A',
              borderRadius: '2px'
            }} />
            <h3 style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.01em'
            }}>
              {title}
            </h3>
          </div>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        flushList(`list-before-h2-${idx}`);
        const title = trimmed.replace('## ', '');
        blocks.push(
          <h2
            key={`h2-${idx}`}
            style={{
              margin: '32px 0 14px 0',
              fontSize: '19px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.015em'
            }}
          >
            {title}
          </h2>
        );
        return;
      }

      // Check for bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        currentList.push(trimmed.slice(2));
        return;
      }

      // Plain paragraph
      if (trimmed.length > 0) {
        flushList(`list-before-p-${idx}`);
        blocks.push(
          <p
            key={`p-${idx}`}
            style={{
              margin: '10px 0',
              fontSize: '14.5px',
              lineHeight: '1.75',
              color: '#334155'
            }}
          >
            {renderFormattedInline(trimmed)}
          </p>
        );
      }
    });

    flushList('list-end');
    return blocks;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Core Intuition Banner */}
      {conceptSummary && (
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          borderLeft: '4px solid #0F172A',
          borderTop: '1px solid #E2E8F0',
          borderRight: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          borderRadius: '0 8px 8px 0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <Lightbulb size={20} color="#0F172A" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#475569',
              marginBottom: '4px'
            }}>
              Core Intuition
            </div>
            <div style={{
              fontSize: '14px',
              lineHeight: '1.65',
              color: '#0F172A',
              fontWeight: 500
            }}>
              {renderFormattedInline(conceptSummary)}
            </div>
          </div>
        </div>
      )}

      {/* Structured Notes Content */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '8px',
        fontSize: '14.5px',
        color: '#1E293B',
        lineHeight: '1.7'
      }}>
        {parseBlocks()}
      </div>

      {/* Embedded Real-Time Interactive Physics Visualizer */}
      {(() => {
        let visualizerType: 'superposition' | 'interference' | 'bloch' | 'bell' | 'grover' | 'decoherence' | null = null;
        if (lessonId === 'lesson-1-1' || markdown.toLowerCase().includes('superposition')) visualizerType = 'superposition';
        if (lessonId === 'lesson-1-2' || markdown.toLowerCase().includes('interference') || markdown.toLowerCase().includes('phase angle')) visualizerType = 'interference';
        if (lessonId === 'lesson-2-1' || markdown.toLowerCase().includes('bloch sphere')) visualizerType = 'bloch';
        if (lessonId === 'lesson-4-1' || markdown.toLowerCase().includes('bell states') || markdown.toLowerCase().includes('entanglement')) visualizerType = 'bell';
        if (lessonId === 'lesson-5-1' || markdown.toLowerCase().includes('grover')) visualizerType = 'grover';
        if (lessonId === 'lesson-6-1' || markdown.toLowerCase().includes('decoherence') || markdown.toLowerCase().includes('error correction')) visualizerType = 'decoherence';

        if (visualizerType) {
          return <TheoryVisualizer type={visualizerType} />;
        }
        return null;
      })()}
    </div>
  );
};

