// src/components/ai/FormattedAIMessage.tsx
import React, { useState } from 'react';
import katex from 'katex';
import { Copy, Check, Sparkles } from 'lucide-react';

interface FormattedAIMessageProps {
  content: string;
  isUser?: boolean;
}

// Render a LaTeX formula using KaTeX with graceful fallback
const RenderKaTeX: React.FC<{ formula: string; displayMode?: boolean }> = ({
  formula,
  displayMode = false
}) => {
  const [copied, setCopied] = useState(false);

  let clean = formula.trim();
  // Strip delimiters: $$, $, \[, \], \(, \)
  if (clean.startsWith('$$') && clean.endsWith('$$')) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith('$') && clean.endsWith('$')) {
    clean = clean.slice(1, -1).trim();
  } else if (clean.startsWith('\\[') && clean.endsWith('\\]')) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith('\\(') && clean.endsWith('\\)')) {
    clean = clean.slice(2, -2).trim();
  }

  let html: string | null = null;
  try {
    html = katex.renderToString(clean, {
      displayMode,
      throwOnError: false
    });
  } catch {
    // If local katex fails, try window.katex if loaded from CDN
    if (typeof window !== 'undefined' && (window as any).katex) {
      try {
        html = (window as any).katex.renderToString(clean, {
          displayMode,
          throwOnError: false
        });
      } catch {
        html = null;
      }
    }
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (displayMode) {
    return (
      <div
        style={{
          margin: '10px 0',
          padding: '12px 16px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto',
          position: 'relative'
        }}
      >
        <div style={{ flex: 1, overflowX: 'auto', textAlign: 'center' }}>
          {html ? (
            <span dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
              {clean}
            </code>
          )}
        </div>
        <button
          onClick={handleCopy}
          title="Copy LaTeX"
          style={{
            marginLeft: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '4px'
          }}
        >
          {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
        </button>
      </div>
    );
  }

  if (html) {
    return (
      <span
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          display: 'inline-block',
          padding: '0 2px',
          verticalAlign: 'baseline',
          color: '#0F172A'
        }}
      />
    );
  }

  return (
    <code
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '12px',
        background: '#F1F5F9',
        border: '1px solid #E2E8F0',
        borderRadius: '4px',
        padding: '1px 4px',
        color: '#1E293B'
      }}
    >
      {clean}
    </code>
  );
};

// Formats inline markdown tokens: inline math ($...$, \(...\)), bold (**...**), italic (*...*), code (`...`)
const renderInlineTokens = (text: string, keyPrefix: string): React.ReactNode[] => {
  // 1. Split by inline math: $...$ or \(...\)
  const mathRegex = /(\$[^$\n]+\$|\\\([^\)]+\\\))/g;
  const parts = text.split(mathRegex);

  return parts.flatMap((part, pIdx) => {
    if ((part.startsWith('$') && part.endsWith('$') && part.length > 2) ||
        (part.startsWith('\\(') && part.endsWith('\\)'))) {
      return [<RenderKaTeX key={`${keyPrefix}-math-${pIdx}`} formula={part} displayMode={false} />];
    }

    // 2. Split by inline code: `code`
    const codeParts = part.split(/(`[^`]+`)/g);
    return codeParts.flatMap((cPart, cIdx) => {
      if (cPart.startsWith('`') && cPart.endsWith('`') && cPart.length > 2) {
        return [
          <code
            key={`${keyPrefix}-code-${pIdx}-${cIdx}`}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11.5px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              padding: '1px 5px',
              color: '#0F172A',
              fontWeight: 500
            }}
          >
            {cPart.slice(1, -1)}
          </code>
        ];
      }

      // 3. Split by bold: **bold**
      const boldParts = cPart.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.flatMap((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
          return [
            <strong
              key={`${keyPrefix}-bold-${pIdx}-${cIdx}-${bIdx}`}
              style={{ fontWeight: 650, color: '#0F172A' }}
            >
              {bPart.slice(2, -2)}
            </strong>
          ];
        }

        // 4. Split by italic: *italic* (avoiding lone asterisks)
        const italicParts = bPart.split(/(\*[^*\n]+\*)/g);
        return italicParts.map((iPart, iIdx) => {
          if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
            return (
              <em
                key={`${keyPrefix}-em-${pIdx}-${cIdx}-${bIdx}-${iIdx}`}
                style={{ fontStyle: 'italic', color: '#1E293B' }}
              >
                {iPart.slice(1, -1)}
              </em>
            );
          }
          return <span key={`${keyPrefix}-txt-${pIdx}-${cIdx}-${bIdx}-${iIdx}`}>{iPart}</span>;
        });
      });
    });
  });
};

export const FormattedAIMessage: React.FC<FormattedAIMessageProps> = ({ content, isUser }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (isUser) {
    return (
      <div style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '13px',
        lineHeight: 1.55,
        color: '#FFFFFF',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {content}
      </div>
    );
  }

  // Parse markdown blocks (Code blocks, display math, headers, lists, callouts, paragraphs)
  const renderBlocks = (): React.ReactNode[] => {
    const raw = content.trim();
    if (!raw) return [];

    const nodes: React.ReactNode[] = [];
    const lines = raw.split('\n');
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines: string[] = [];
    let inDisplayMath = false;
    let mathLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block delimiters: ``` or ```python
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, '') || 'python';
          codeLines = [];
        } else {
          inCodeBlock = false;
          const codeSnippet = codeLines.join('\n');
          const blockIdx = i;
          nodes.push(
            <div
              key={`code-block-${blockIdx}`}
              style={{
                margin: '10px 0',
                borderRadius: '8px',
                background: '#0F172A',
                border: '1px solid #1E293B',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 12px',
                  background: '#1E293B',
                  borderBottom: '1px solid #334155',
                  fontSize: '11px',
                  color: '#94A3B8',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                <span>{codeLanguage}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeSnippet);
                    setCopiedIndex(blockIdx);
                    setTimeout(() => setCopiedIndex(null), 1500);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px'
                  }}
                >
                  {copiedIndex === blockIdx ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                  <span>{copiedIndex === blockIdx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '12px',
                  overflowX: 'auto',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11.5px',
                  lineHeight: '1.5',
                  color: '#E2E8F0'
                }}
              >
                <code>{codeSnippet}</code>
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Display math delimiters: $$ or \[
      if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
        nodes.push(<RenderKaTeX key={`display-math-${i}`} formula={line.trim()} displayMode={true} />);
        continue;
      }

      if (line.trim() === '$$' || line.trim() === '\\[') {
        if (!inDisplayMath) {
          inDisplayMath = true;
          mathLines = [];
        } else {
          inDisplayMath = false;
          nodes.push(<RenderKaTeX key={`display-math-${i}`} formula={mathLines.join('\n')} displayMode={true} />);
        }
        continue;
      }

      if (line.trim() === '$$' || line.trim() === '\\]') {
        inDisplayMath = false;
        nodes.push(<RenderKaTeX key={`display-math-${i}`} formula={mathLines.join('\n')} displayMode={true} />);
        continue;
      }

      if (inDisplayMath) {
        mathLines.push(line);
        continue;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        nodes.push(<div key={`spacer-${i}`} style={{ height: '6px' }} />);
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        nodes.push(
          <h4
            key={`h3-${i}`}
            style={{
              margin: '12px 0 6px',
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {renderInlineTokens(trimmed.slice(4), `h3-${i}`)}
          </h4>
        );
        continue;
      }

      if (trimmed.startsWith('## ')) {
        nodes.push(
          <h3
            key={`h2-${i}`}
            style={{
              margin: '14px 0 6px',
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontSize: '14.5px',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.01em'
            }}
          >
            {renderInlineTokens(trimmed.slice(3), `h2-${i}`)}
          </h3>
        );
        continue;
      }

      if (trimmed.startsWith('# ')) {
        nodes.push(
          <h2
            key={`h1-${i}`}
            style={{
              margin: '16px 0 8px',
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.01em'
            }}
          >
            {renderInlineTokens(trimmed.slice(2), `h1-${i}`)}
          </h2>
        );
        continue;
      }

      // Socratic Guidance / Callout Card
      if (trimmed.startsWith('*Socratic Guidance:*') ||
          trimmed.startsWith('**Socratic Guidance:**') ||
          trimmed.startsWith('*Learner Reflection:*') ||
          trimmed.startsWith('**Learner Reflection:**') ||
          trimmed.startsWith('> [!TIP]') ||
          trimmed.startsWith('> [!NOTE]')) {
        const cleanCallout = trimmed.replace(/^(\*|\*\*|>\s*\[!\w+\])\s*/, '').replace(/(\*|\*\*)$/, '');
        nodes.push(
          <div
            key={`callout-${i}`}
            style={{
              margin: '10px 0',
              padding: '10px 14px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderLeft: '3px solid #10B981',
              borderRadius: '8px',
              fontSize: '12px',
              lineHeight: 1.5,
              color: '#14532D',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start'
            }}
          >
            <Sparkles size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              {renderInlineTokens(cleanCallout, `callout-${i}`)}
            </div>
          </div>
        );
        continue;
      }

      // Ordered lists (e.g. "1. ")
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (orderedMatch) {
        nodes.push(
          <div
            key={`ol-${i}`}
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'baseline',
              margin: '4px 0',
              paddingLeft: '2px',
              fontSize: '12.5px',
              lineHeight: 1.55
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                fontSize: '11px',
                color: '#6366F1',
                flexShrink: 0,
                background: '#EEF2FF',
                padding: '1px 6px',
                borderRadius: '4px'
              }}
            >
              {orderedMatch[1]}
            </span>
            <div style={{ flex: 1 }}>
              {renderInlineTokens(orderedMatch[2], `ol-content-${i}`)}
            </div>
          </div>
        );
        continue;
      }

      // Unordered lists (e.g. "- " or "* ")
      if (trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.endsWith('*'))) {
        nodes.push(
          <div
            key={`ul-${i}`}
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'baseline',
              margin: '4px 0',
              paddingLeft: '4px',
              fontSize: '12.5px',
              lineHeight: 1.55
            }}
          >
            <span style={{ color: '#6366F1', fontSize: '10px', flexShrink: 0 }}>●</span>
            <div style={{ flex: 1 }}>
              {renderInlineTokens(trimmed.slice(2), `ul-content-${i}`)}
            </div>
          </div>
        );
        continue;
      }

      // Regular Paragraph
      nodes.push(
        <p
          key={`p-${i}`}
          style={{
            margin: '4px 0 6px',
            fontSize: '12.5px',
            lineHeight: 1.6,
            color: '#334155'
          }}
        >
          {renderInlineTokens(trimmed, `p-content-${i}`)}
        </p>
      );
    }

    return nodes;
  };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        wordBreak: 'break-word'
      }}
    >
      {renderBlocks()}
    </div>
  );
};
