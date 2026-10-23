import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const StudyDebtLogo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const titleSize = size === 'sm' ? '1.1rem' : size === 'lg' ? '1.75rem' : '1.35rem';

  return (
    <div
      className={`studydebt-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: iconSize,
          height: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(167, 139, 250, 0.4))' }}
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="50%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="#86EFAC" />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect
            width="48"
            height="48"
            rx="12"
            fill="rgba(16, 23, 42, 0.85)"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.5"
          />
          {/* Open Study Notebook Left Page */}
          <path
            d="M13 33V17C13 15.8954 13.8954 15 15 15H22C23.1046 15 24 15.8954 24 17V33C24 31.8954 23.1046 31 22 31H15C13.8954 31 13 31.8954 13 33Z"
            fill="url(#logoGrad)"
            fillOpacity="0.25"
            stroke="#A78BFA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Open Study Notebook Right Page */}
          <path
            d="M35 33V17C35 15.8954 34.1046 15 33 15H26C24.8954 15 24 15.8954 24 17V33C24 31.8954 24.8954 31 26 31H33C34.1046 31 35 31.8954 35 33Z"
            fill="url(#logoGrad)"
            fillOpacity="0.38"
            stroke="#67E8F9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Upward Recovery Chevron */}
          <path
            d="M24 11L28 16H20L24 11Z"
            fill="#86EFAC"
            filter="url(#logoGlow)"
          />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: titleSize,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 45%, #C4B5FD 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          StudyDebt
        </div>
        {showTagline && (
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.01em',
              fontWeight: 500,
            }}
          >
            Your backlog, under control.
          </span>
        )}
      </div>
    </div>
  );
};
