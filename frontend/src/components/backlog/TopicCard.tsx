import React from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Edit2,
  Trash2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import type { Topic } from '../../types';

interface TopicCardProps {
  topic: Topic;
  onToggleStatus: (topic: Topic) => void;
  onStartStudy: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (id: string) => void;
  onSelect: (topic: Topic) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onToggleStatus,
  onStartStudy,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const isCompleted = topic.status === 'completed';
  const isInProgress = topic.status === 'in_progress';

  // Check if due soon (<= 3 days) or overdue
  let dueText = '';
  let isOverdue = false;
  let isDueSoon = false;
  if (topic.dueDate) {
    const due = new Date(topic.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      dueText = `Overdue (${Math.abs(diffDays)}d ago)`;
      isOverdue = true;
    } else if (diffDays === 0) {
      dueText = 'Due today!';
      isDueSoon = true;
    } else if (diffDays <= 3) {
      dueText = `Due in ${diffDays}d`;
      isDueSoon = true;
    } else {
      dueText = `Due ${topic.dueDate}`;
    }
  }

  return (
    <GlassCard
      interactive
      glow={isDueSoon ? 'none' : isInProgress ? 'lavender' : isCompleted ? 'mint' : 'none'}
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        borderLeft: isDueSoon
          ? '3px solid #F87171'
          : isInProgress
          ? '3px solid var(--accent-lavender)'
          : isCompleted
          ? '3px solid var(--accent-mint)'
          : '1px solid var(--glass-border)',
        opacity: isCompleted ? 0.78 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge priority={topic.priority}>{topic.priority}</Badge>
          <Badge variant="neutral">{topic.subject}</Badge>
          <Badge status={topic.status}>
            {topic.status === 'not_started'
              ? 'Not Started'
              : topic.status === 'in_progress'
              ? 'In Progress'
              : 'Completed'}
          </Badge>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            onClick={() => onEdit(topic)}
            aria-label="Edit topic"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem' }}
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(topic.id)}
            aria-label="Delete topic"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', color: '#F87171' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div>
        <h4
          onClick={() => onSelect(topic)}
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: isCompleted ? 'var(--text-secondary)' : '#FFFFFF',
            textDecoration: isCompleted ? 'line-through' : 'none',
            marginBottom: '0.3rem',
          }}
        >
          {topic.title}
        </h4>
        {topic.description && (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {topic.description}
          </p>
        )}
      </div>

      {/* Meta tags and due date info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={13} />
          {topic.estimatedMinutes} min
        </span>

        {dueText && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: isOverdue ? '#F87171' : isDueSoon ? '#FDE68A' : 'var(--text-muted)',
              fontWeight: isDueSoon || isOverdue ? 600 : 400,
            }}
          >
            <Calendar size={13} />
            {dueText}
          </span>
        )}

        {topic.tags && topic.tags.length > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Tag size={13} />
            {topic.tags.slice(0, 2).join(', ')}
            {topic.tags.length > 2 && ` +${topic.tags.length - 2}`}
          </span>
        )}
      </div>

      {/* Mastery Bar */}
      {typeof topic.masteryScore === 'number' && topic.masteryScore > 0 && (
        <div>
          <ProgressBar
            value={topic.masteryScore}
            height={5}
            variant={topic.masteryScore >= 75 ? 'mint' : 'default'}
          />
        </div>
      )}

      {/* Card Footer Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--glass-border-subtle)',
        }}
      >
        <button
          onClick={() => onToggleStatus(topic)}
          className="btn btn-ghost btn-sm"
          style={{
            padding: '0.35rem 0.6rem',
            color: isCompleted ? 'var(--accent-mint)' : 'var(--text-secondary)',
          }}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={16} color="var(--accent-mint)" />
              <span>Completed</span>
            </>
          ) : (
            <>
              <Circle size={16} />
              <span>Mark Done</span>
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(topic)}
          >
            Details
          </Button>

          {!isCompleted && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStartStudy(topic)}
              icon={<Play size={13} fill="#080B18" />}
            >
              Study
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
