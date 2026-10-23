import React from 'react';
import { Play, UploadCloud, CalendarDays, Plus, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface DashboardHeroProps {
  studentName?: string;
  onStartQuickStudy: () => void;
  onUploadScreenshot: () => void;
  onPlanWeek: () => void;
  onAddTopic: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  studentName,
  onStartQuickStudy,
  onUploadScreenshot,
  onPlanWeek,
  onAddTopic,
}) => {
  const greeting = studentName?.trim()
    ? `Welcome back, ${studentName}.`
    : 'What can we accomplish today?';

  return (
    <GlassCard
      glow="lavender"
      className="dashboard-hero-card"
      style={{
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        background:
          'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(167, 139, 250, 0.12), transparent), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(103, 232, 249, 0.08), transparent), rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(167, 139, 250, 0.22)',
      }}
    >
      <div style={{ maxWidth: '780px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(167, 139, 250, 0.12)',
            border: '1px solid rgba(167, 139, 250, 0.28)',
            color: 'var(--accent-lavender)',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={14} />
          <span>StudyDebt — Your backlog, under control.</span>
        </div>

        <h1
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            marginBottom: '0.65rem',
            lineHeight: 1.2,
          }}
        >
          {greeting}
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
            lineHeight: 1.5,
          }}
        >
          Small sessions. Steady progress. Less academic chaos. Transform overwhelming
          study backlogs and forgotten screenshots into clear, bite-sized wins.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onStartQuickStudy}
            icon={<Play size={18} fill="#080B18" />}
          >
            Start a Quick Study
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onUploadScreenshot}
            icon={<UploadCloud size={18} />}
          >
            Upload Screenshot
          </Button>

          <Button
            variant="glass"
            size="lg"
            onClick={onPlanWeek}
            icon={<CalendarDays size={18} />}
          >
            Plan the Week
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={onAddTopic}
            icon={<Plus size={18} />}
          >
            Add Topic
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};
