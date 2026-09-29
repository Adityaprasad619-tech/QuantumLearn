// src/components/ui/BrowserFrame.tsx
import React from 'react';

interface BrowserFrameProps {
  urlPath?: string;
  url?: string;
  badge?: string;
  badgeText?: string;
  badgeColor?: 'coral' | 'navy' | 'purple' | 'emerald' | string;
  accentColor?: string;
  isDark?: boolean;
  gridBackground?: boolean;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  contentStyle?: React.CSSProperties;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  urlPath,
  url,
  badge,
  badgeText,
  badgeColor = 'coral',
  accentColor,
  isDark = false,
  gridBackground = false,
  headerExtra,
  children,
  style,
  className = '',
  contentStyle
}) => {
  const displayUrl = url || urlPath || 'quantum-lab://interactive-canvas';
  const displayBadge = badgeText || badge;

  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'navy': return 'navy-pill-badge';
      case 'purple': return 'purple-pill-badge';
      case 'emerald': return 'emerald-pill-badge';
      case 'coral':
      default:
        return 'coral-pill-badge';
    }
  };

  return (
    <div
      className={`browser-window-frame ${className}`}
      style={{
        border: isDark ? '1px solid #334155' : '1px solid #BFDBFE',
        background: isDark ? '#0F172A' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
        ...style
      }}
    >
      {/* Chrome Window Header */}
      <div className={isDark ? 'browser-mockup-header-dark' : 'browser-mockup-header'}>
        {/* macOS Control Dots */}
        <div className="browser-mockup-dots">
          <div className="browser-mockup-dot red" />
          <div className="browser-mockup-dot yellow" />
          <div className="browser-mockup-dot green" />
        </div>

        {/* Center URL Capsule */}
        <div className={isDark ? 'browser-mockup-capsule-dark' : 'browser-mockup-capsule'}>
          {displayUrl}
        </div>

        {/* Right Corner: Optional Badge or Extra Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {displayBadge && (
            <span className={`${getBadgeClass()} floating-badge`} style={{ fontSize: '11px', padding: '3px 10px' }}>
              {displayBadge}
            </span>
          )}
          {headerExtra}
          {!displayBadge && !headerExtra && (
            <div style={{ display: 'flex', gap: '5px' }}>
              <div style={{ width: '16px', height: '6px', borderRadius: '3px', background: isDark ? '#475569' : '#CBD5E1' }} />
              <div style={{ width: '16px', height: '6px', borderRadius: '3px', background: isDark ? '#475569' : '#CBD5E1' }} />
            </div>
          )}
        </div>
      </div>

      {/* Frame Content */}
      <div
        className={gridBackground ? (isDark ? 'quantum-grid-dark' : 'quantum-grid-bg') : ''}
        style={{
          position: 'relative',
          ...contentStyle
        }}
      >
        {children}
      </div>
    </div>
  );
};
