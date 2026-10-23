import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glow?: 'lavender' | 'cyan' | 'mint' | 'none';
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  interactive = false,
  glow = 'none',
  children,
  className = '',
  style,
  ...props
}) => {
  const glowClass = glow !== 'none' ? `glow-${glow}` : '';
  const interactiveClass = interactive ? 'interactive' : '';

  return (
    <div
      className={`liquid-glass-card ${interactiveClass} ${glowClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
