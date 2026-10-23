import React, { useState } from 'react';
import { Target, Play, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Topic } from '../../types';
import { getNextSmallWin, type RecommendedAction } from '../../services/scheduler/recommendation';

interface NextSmallWinProps {
  topics: Topic[];
  onStartSession: (topic: Topic, minutes: number) => void;
  onViewBacklog: () => void;
}

export const NextSmallWin: React.FC<NextSmallWinProps> = ({
  topics,
  onStartSession,
  onViewBacklog,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);

  const recommendation: RecommendedAction | null = getNextSmallWin(topics, selectedMinutes);

  if (!recommendation) {
    return (
      <GlassCard
        glow="mint"
        style={{
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(134, 239, 172, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={24} color="#86EFAC" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
            Backlog Clear! No Pending Tasks
          </h3>
          <p style={{ maxWidth: '420px', margin: '0 auto', fontSize: '0.9rem' }}>
            You have conquered all your current topics. Add a new subject or upload a
            lecture screenshot to keep your momentum going.
          </p>
        </div>
        <Button variant="mint" onClick={onViewBacklog} icon={<ArrowRight size={16} />}>
          Explore Backlog
        </Button>
      </GlassCard>
    );
  }

  const { topic, reason, recommendedMinutes } = recommendation;

  return (
    <GlassCard
      glow="cyan"
      style={{
        padding: '1.75rem',
        position: 'relative',
        border: '1px solid rgba(103, 232, 249, 0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(103, 232, 249, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={20} color="#67E8F9" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Next Small Win</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Deterministic recommendation based on urgency & time budget
            </span>
          </div>
        </div>

        {/* Time selector pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Available time:
          </span>
          {[5, 10, 15, 25].map((mins) => (
            <button
              key={mins}
              onClick={() => setSelectedMinutes(mins)}
              style={{
                background:
                  selectedMinutes === mins
                    ? 'rgba(103, 232, 249, 0.25)'
                    : 'rgba(255, 255, 255, 0.05)',
                border:
                  selectedMinutes === mins
                    ? '1px solid #67E8F9'
                    : '1px solid var(--glass-border)',
                color: selectedMinutes === mins ? '#67E8F9' : 'var(--text-secondary)',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'rgba(14, 21, 40, 0.75)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          border: '1px solid var(--glass-border-subtle)',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.65rem',
            flexWrap: 'wrap',
          }}
        >
          <Badge priority={topic.priority}>{topic.priority}</Badge>
          <Badge variant="cyan">{topic.subject}</Badge>
          {topic.dueDate && (
            <Badge variant="coral">Due: {topic.dueDate}</Badge>
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginLeft: 'auto',
            }}
          >
            <Clock size={13} />
            {topic.estimatedMinutes} min estimated
          </span>
        </div>

        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: '#FFFFFF' }}>
          {topic.title}
        </h4>

        {topic.description && (
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.85rem',
            }}
          >
            {topic.description}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.84rem',
            color: 'var(--accent-cyan)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(103, 232, 249, 0.08)',
            border: '1px solid rgba(103, 232, 249, 0.15)',
          }}
        >
          <Sparkles size={15} style={{ flexShrink: 0 }} />
          <span>{reason}</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <Button
          variant="primary"
          onClick={() => onStartSession(topic, recommendedMinutes)}
          icon={<Play size={16} fill="#080B18" />}
        >
          Start {recommendedMinutes}-Minute Session
        </Button>

        <Button variant="ghost" onClick={onViewBacklog}>
          Browse Full Backlog
        </Button>
      </div>
    </GlassCard>
  );
};
