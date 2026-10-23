import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  variant?: 'default' | 'mint' | 'coral';
  height?: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  height = 8,
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const fillVariantClass = variant === 'mint' ? 'mint' : variant === 'coral' ? 'coral' : '';

  return (
    <div className={`progress-wrapper ${className}`} style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            marginBottom: '0.35rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span>Progress</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{percentage}%</span>
        </div>
      )}
      <div className="progress-container" style={{ height: `${height}px` }}>
        <div
          className={`progress-fill ${fillVariantClass}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
