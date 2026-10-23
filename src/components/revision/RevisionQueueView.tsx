import React from 'react';
import {
  Repeat,
  CheckCircle2,
  Calendar,
  Clock,
  Play,
  Sparkles,
  GraduationCap,
  Award,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import type { RevisionRecord, Topic } from '../../types';

interface RevisionQueueViewProps {
  records: RevisionRecord[];
  topics: Topic[];
  onStartRevision: (topic: Topic) => void;
}

export const RevisionQueueView: React.FC<RevisionQueueViewProps> = ({
  records,
  topics,
  onStartRevision,
}) => {
  const now = new Date();

  // Find corresponding topic for each record
  const enrichedRecords = records.map((rec) => {
    const topic = topics.find((t) => t.id === rec.topicId);
    const dueDate = new Date(rec.nextRevisionDate);
    const isDue = dueDate <= now;
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      record: rec,
      topic,
      isDue,
      diffDays,
    };
  });

  // Sort due items first, then by mastery score ascending
  enrichedRecords.sort((a, b) => {
    if (a.isDue && !b.isDue) return -1;
    if (!a.isDue && b.isDue) return 1;
    return a.record.masteryScore - b.record.masteryScore;
  });

  const dueCount = enrichedRecords.filter((r) => r.isDue).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Revision Queue</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Spaced repetition engine. Revisit concepts right before you forget them to cement permanent mastery.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: dueCount > 0 ? 'rgba(248, 113, 113, 0.15)' : 'rgba(134, 239, 172, 0.15)',
              border: `1px solid ${dueCount > 0 ? 'rgba(248, 113, 113, 0.35)' : 'rgba(134, 239, 172, 0.35)'}`,
              color: dueCount > 0 ? '#FECACA' : '#BBF7D0',
              fontWeight: 700,
              fontSize: '0.84rem',
            }}
          >
            <Repeat size={15} />
            <span>{dueCount} Topics Ready for Review</span>
          </div>
        </div>
      </div>

      {/* Grid of revision items */}
      {enrichedRecords.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {enrichedRecords.map(({ record, topic, isDue, diffDays }) => {
            const mastery = record.masteryScore || 0;

            return (
              <GlassCard
                key={record.id}
                glow={isDue ? 'lavender' : 'none'}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  borderLeft: isDue ? '3px solid var(--accent-lavender)' : '1px solid var(--glass-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Badge variant="cyan">{record.subject}</Badge>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isDue ? 'var(--accent-lavender)' : 'var(--text-muted)',
                    }}
                  >
                    {isDue ? 'Due Today' : `In ${diffDays} days`}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {record.topicTitle}
                </h4>

                {/* Mastery progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mastery Level</span>
                    <strong style={{ color: mastery >= 75 ? 'var(--accent-mint)' : 'var(--accent-lavender)' }}>
                      {mastery}%
                    </strong>
                  </div>
                  <ProgressBar value={mastery} height={6} variant={mastery >= 75 ? 'mint' : 'default'} />
                </div>

                {/* Spaced stats */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    paddingTop: '0.35rem',
                  }}
                >
                  <span>Reviews: <strong>{record.reviewCount}</strong></span>
                  <span>Streak: <strong>{record.consecutiveCorrect} correct</strong></span>
                  <span>Conf: <strong>★ {record.confidenceRating}/5</strong></span>
                </div>

                {/* Footer action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 'auto',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--glass-border-subtle)',
                  }}
                >
                  <Button
                    variant={isDue ? 'primary' : 'glass'}
                    size="sm"
                    onClick={() => {
                      if (topic) {
                        onStartRevision(topic);
                      }
                    }}
                    icon={<Play size={13} fill="#080B18" />}
                  >
                    {isDue ? 'Revise Now' : 'Practice Ahead'}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(134, 239, 172, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={28} color="var(--accent-mint)" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>
              Revision Queue Caught Up!
            </h3>
            <p style={{ maxWidth: '420px', margin: '0 auto', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              As you complete quick study sessions and answer practice questions, the spaced repetition engine
              will automatically schedule concepts here when they are ready for reinforcement.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
