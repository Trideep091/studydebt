import React from 'react';
import {
  ListTodo,
  ArrowRight,
  Plus,
  Play,
  BookOpen,
} from 'lucide-react';
import { DashboardHero } from './DashboardHero';
import { StatsOverview } from './StatsOverview';
import { HaveTenMinutes } from './HaveTenMinutes';
import { NextSmallWin } from './NextSmallWin';
import { TopicCard } from '../backlog/TopicCard';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import type { Topic, Screenshot, StudyStats } from '../../types';

interface DashboardViewProps {
  studentName?: string;
  stats: StudyStats;
  topics: Topic[];
  screenshots: Screenshot[];
  onStartQuickStudy: () => void;
  onUploadScreenshot: () => void;
  onPlanWeek: () => void;
  onAddTopic: () => void;
  onToggleTopicStatus: (topic: Topic) => void;
  onStartSession: (topic: Topic, minutes?: number) => void;
  onStartScreenshotReview: (screenshot: Screenshot, minutes?: number) => void;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
  onSelectTopic: (topic: Topic) => void;
  onViewAllTopics: () => void;
  onConvertScreenshotToTopic?: (screenshot: Screenshot) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  studentName,
  stats,
  topics,
  screenshots,
  onStartQuickStudy,
  onUploadScreenshot,
  onPlanWeek,
  onAddTopic,
  onToggleTopicStatus,
  onStartSession,
  onStartScreenshotReview,
  onEditTopic,
  onDeleteTopic,
  onSelectTopic,
  onViewAllTopics,
  onConvertScreenshotToTopic,
}) => {
  // Recent pending topics
  const recentTopics = topics
    .filter((t) => t.status !== 'completed')
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Prominent Hero */}
      <DashboardHero
        studentName={studentName}
        onStartQuickStudy={onStartQuickStudy}
        onUploadScreenshot={onUploadScreenshot}
        onPlanWeek={onPlanWeek}
        onAddTopic={onAddTopic}
      />

      {/* 2. Real Study Statistics Derived from Records */}
      <StatsOverview
        stats={stats}
        onOpenPending={onViewAllTopics}
        onOpenDueSoon={onViewAllTopics}
      />

      {/* 3. Signature Panel: Have 10 Minutes? */}
      <HaveTenMinutes
        screenshots={screenshots}
        onStartReview={onStartScreenshotReview}
        onUploadClick={onUploadScreenshot}
        onConvertTopic={onConvertScreenshotToTopic}
      />

      {/* 4. Recommendation: Your Next Small Win */}
      <NextSmallWin
        topics={topics}
        onStartSession={(t, mins) => onStartSession(t, mins)}
        onViewBacklog={onViewAllTopics}
      />

      {/* 5. Active Backlog Quick Access */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ListTodo size={20} color="var(--accent-lavender)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Priority Backlog Tasks</h3>
          </div>

          <Button variant="ghost" size="sm" onClick={onViewAllTopics} icon={<ArrowRight size={15} />}>
            View All ({topics.length})
          </Button>
        </div>

        {recentTopics.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {recentTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onToggleStatus={onToggleTopicStatus}
                onStartStudy={(t) => onStartSession(t)}
                onEdit={onEditTopic}
                onDelete={onDeleteTopic}
                onSelect={onSelectTopic}
              />
            ))}
          </div>
        ) : (
          <GlassCard
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <BookOpen size={24} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No pending topics right now. All caught up!
            </p>
            <Button variant="primary" size="sm" onClick={onAddTopic} icon={<Plus size={15} />}>
              Add Study Topic
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
