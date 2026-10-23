import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  ListTodo,
  Calendar,
  Flame,
  Award,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import type { Topic, StudySession, StudyStats, RevisionRecord } from '../../types';

interface BacklogDebtTrackerProps {
  stats: StudyStats;
  topics: Topic[];
  sessions: StudySession[];
  revisionRecords: RevisionRecord[];
}

export const BacklogDebtTracker: React.FC<BacklogDebtTrackerProps> = ({
  stats,
  topics,
  sessions,
  revisionRecords,
}) => {
  const pending = topics.filter((t) => t.status !== 'completed');
  const completed = topics.filter((t) => t.status === 'completed');

  const totalBacklogHours = (stats.estimatedRemainingMinutes / 60).toFixed(1);
  const totalCompletedMinutes = completed.reduce((sum, t) => sum + (t.estimatedMinutes || 20), 0);
  const totalCompletedHours = (totalCompletedMinutes / 60).toFixed(1);

  // Group topics by subject
  const subjectStats: Record<string, { total: number; completed: number; pending: number; minutes: number }> = {};
  topics.forEach((t) => {
    const sub = t.subject || 'Other';
    if (!subjectStats[sub]) {
      subjectStats[sub] = { total: 0, completed: 0, pending: 0, minutes: 0 };
    }
    subjectStats[sub].total += 1;
    if (t.status === 'completed') {
      subjectStats[sub].completed += 1;
    } else {
      subjectStats[sub].pending += 1;
      subjectStats[sub].minutes += t.estimatedMinutes || 20;
    }
  });

  const subjectsList = Object.entries(subjectStats);

  // Calculate session activity across last 7 days
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    const count = sessions.filter((s) => s.completedAt.startsWith(str)).length;
    return { dateStr: str, dayName, count };
  });

  const completionRate = topics.length > 0 ? Math.round((completed.length / topics.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Backlog Debt & Progress</h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Transparent, data-backed metrics tracking your academic recovery and concept mastery.
        </p>
      </div>

      {/* Top Level Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Outstanding Backlog Debt */}
        <GlassCard
          glow="lavender"
          style={{
            padding: '1.5rem',
            border: '1px solid rgba(167, 139, 250, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Outstanding Study Debt
            </span>
            <Clock size={18} color="var(--accent-lavender)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
            {totalBacklogHours} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Hours</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {pending.length} pending topics remaining
          </div>
        </GlassCard>

        {/* Conquered Hours */}
        <GlassCard
          glow="mint"
          style={{
            padding: '1.5rem',
            border: '1px solid rgba(134, 239, 172, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Backlog Conquered
            </span>
            <CheckCircle2 size={18} color="var(--accent-mint)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-mint)', lineHeight: 1.1 }}>
            {totalCompletedHours} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Hours</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {completed.length} topics fully mastered
          </div>
        </GlassCard>

        {/* Completion Rate */}
        <GlassCard
          glow="cyan"
          style={{
            padding: '1.5rem',
            border: '1px solid rgba(103, 232, 249, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Backlog Reduction
            </span>
            <TrendingDown size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
            {completionRate}%
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <ProgressBar value={completionRate} height={6} variant="mint" />
          </div>
        </GlassCard>

        {/* Study Sessions Count */}
        <GlassCard
          style={{
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Focus Sessions Completed
            </span>
            <Award size={18} color="#FBBF24" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
            {sessions.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {stats.studyStreakDays} consecutive study days
          </div>
        </GlassCard>
      </div>

      {/* Two Column Section: Subject Breakdown & Recent Activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Subject Breakdown Card */}
        <GlassCard style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Study Debt by Subject
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {subjectsList.map(([subName, data]) => {
              const subRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              const subHours = (data.minutes / 60).toFixed(1);

              return (
                <div key={subName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{subName}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ({data.completed}/{data.total} completed)
                      </span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      {subHours}h debt
                    </span>
                  </div>
                  <ProgressBar value={subRate} height={7} />
                </div>
              );
            })}

            {subjectsList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                No topics categorized yet.
              </div>
            )}
          </div>
        </GlassCard>

        {/* 7-Day Activity Heatmap Bar */}
        <GlassCard style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            7-Day Session Rhythm
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            Daily focus session completions over the past week.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '0.5rem',
              height: '140px',
              padding: '0 0.5rem',
            }}
          >
            {last7Days.map((d, i) => {
              const maxSessions = Math.max(1, ...last7Days.map((item) => item.count));
              const heightPct = Math.max(12, Math.round((d.count / maxSessions) * 100));

              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: d.count > 0 ? '#FFFFFF' : 'var(--text-dim)', fontWeight: 600 }}>
                    {d.count > 0 ? d.count : '-'}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '32px',
                      height: `${heightPct}%`,
                      borderRadius: 'var(--radius-xs)',
                      background:
                        d.count > 0
                          ? 'linear-gradient(180deg, #A78BFA 0%, #67E8F9 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: d.count > 0 ? '0 0 12px var(--accent-lavender-glow)' : 'none',
                      transition: 'height 0.3s var(--ease-smooth)',
                    }}
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
