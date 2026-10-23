import React from 'react';
import type { Priority, TopicStatus, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lavender' | 'cyan' | 'mint' | 'coral' | 'amber' | 'neutral';
  priority?: Priority;
  status?: TopicStatus | TaskStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  priority,
  status,
  className = '',
}) => {
  let resolvedVariant = variant || 'neutral';

  if (priority) {
    switch (priority) {
      case 'urgent':
        resolvedVariant = 'coral';
        break;
      case 'high':
        resolvedVariant = 'amber';
        break;
      case 'medium':
        resolvedVariant = 'lavender';
        break;
      case 'low':
        resolvedVariant = 'mint';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'completed':
        resolvedVariant = 'mint';
        break;
      case 'in_progress':
        resolvedVariant = 'cyan';
        break;
      case 'not_started':
      case 'pending':
        resolvedVariant = 'neutral';
        break;
      case 'missed':
      case 'blocked':
        resolvedVariant = 'coral';
        break;
    }
  }

  return <span className={`badge badge-${resolvedVariant} ${className}`}>{children}</span>;
};
