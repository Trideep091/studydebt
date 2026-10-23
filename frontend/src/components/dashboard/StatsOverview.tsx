import React from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Flame,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { StudyStats } from '../../types';

interface StatsOverviewProps {
  stats: StudyStats;
  onOpenPending?: () => void;
  onOpenDueSoon?: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  onOpenPending,
  onOpenDueSoon,
}) => {
  const hours = Math.floor(stats.estimatedRemainingMinutes / 60);
  const mins = stats.estimatedRemainingMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const statCards = [
    {
      id: 'pending',
      label: 'Pending Topics',
      value: stats.pendingTopicsCount,
      subtext: `${stats.pendingTopicsCount === 1 ? '1 topic' : `${stats.pendingTopicsCount} topics`} to conquer`,
      icon: ListTodo,
      color: '#67E8F9',
      glow: 'cyan' as const,
      onClick: onOpenPending,
    },
    {
      id: 'remaining-time',
      label: 'Estimated Backlog Time',
      value: timeFormatted,
      subtext: 'Calculated from topic estimates',
      icon: Clock,
      color: '#A78BFA',
      glow: 'lavender' as const,
    },
    {
      id: 'completed',
      label: 'Topics Completed',
      value: stats.completedTopicsCount,
      subtext: `${stats.totalStudySessionsCount} study sessions logged`,
      icon: CheckCircle2,
      color: '#86EFAC',
      glow: 'mint' as const,
    },
    {
      id: 'streak',
      label: 'Study Streak',
      value: `${stats.studyStreakDays} ${stats.studyStreakDays === 1 ? 'Day' : 'Days'}`,
      subtext: stats.studyStreakDays > 0 ? 'Consecutive learning days' : 'Complete a session to start',
      icon: Flame,
      color: '#FBBF24',
      glow: 'none' as const,
    },
    {
      id: 'due-soon',
      label: 'Topics Due Soon',
      value: stats.dueSoonTopicsCount,
      subtext: 'Deadlines within 3 days',
      icon: AlertTriangle,
      color: stats.dueSoonTopicsCount > 0 ? '#F87171' : 'var(--text-muted)',
      glow: stats.dueSoonTopicsCount > 0 ? ('none' as const) : ('none' as const),
      onClick: onOpenDueSoon,
    },
    {
      id: 'mastery',
      label: 'Average Concept Mastery',
      value: `${stats.averageMastery}%`,
      subtext: 'Based on quiz checks & ratings',
      icon: GraduationCap,
      color: '#C084FC',
      glow: 'none' as const,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <GlassCard
            key={card.id}
            glow={card.glow}
            interactive={Boolean(card.onClick)}
            onClick={card.onClick}
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              cursor: card.onClick ? 'pointer' : 'default',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.01em',
                }}
              >
                {card.label}
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={17} color={card.color} />
              </div>
            </div>

            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.1,
                marginBottom: '0.35rem',
                fontFamily: 'var(--font-display)',
              }}
            >
              {card.value}
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginTop: 'auto',
              }}
            >
              {card.subtext}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
