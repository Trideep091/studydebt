import React from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Tag,
  Play,
  Edit2,
  Image as ImageIcon,
  GraduationCap,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import type { Topic, Screenshot } from '../../types';

interface TopicDetailModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (topic: Topic) => void;
  onStartStudy: (topic: Topic) => void;
  linkedScreenshots?: Screenshot[];
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  isOpen,
  onClose,
  onEdit,
  onStartStudy,
  linkedScreenshots = [],
}) => {
  if (!topic) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={topic.title} maxWidth="680px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Badges & Meta bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Badge priority={topic.priority}>{topic.priority}</Badge>
          <Badge variant="cyan">{topic.subject}</Badge>
          <Badge status={topic.status}>
            {topic.status === 'not_started'
              ? 'Not Started'
              : topic.status === 'in_progress'
              ? 'In Progress'
              : 'Completed'}
          </Badge>
          {topic.dueDate && <Badge variant="coral">Due: {topic.dueDate}</Badge>}
        </div>

        {/* Effort & Mastery Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--glass-border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Effort</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Clock size={16} color="var(--accent-cyan)" />
              <strong style={{ fontSize: '1.1rem' }}>{topic.estimatedMinutes} Minutes</strong>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mastery Score</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <GraduationCap size={16} color="var(--accent-lavender)" />
              <strong style={{ fontSize: '1.1rem' }}>{topic.masteryScore || 0}%</strong>
            </div>
            <div style={{ marginTop: '0.35rem' }}>
              <ProgressBar value={topic.masteryScore || 0} height={6} />
            </div>
          </div>
        </div>

        {/* Description */}
        {topic.description && (
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Overview & Notes
            </h4>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              {topic.description}
            </p>
          </div>
        )}

        {/* Learning Objectives */}
        {topic.learningObjectives && topic.learningObjectives.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Learning Objectives
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {topic.learningObjectives.map((obj, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <CheckCircle2 size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Tags
            </h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {topic.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Linked Screenshots */}
        {linkedScreenshots.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Attached Study Materials ({linkedScreenshots.length})
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.5rem 0' }}>
              {linkedScreenshots.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--glass-border-subtle)',
                    fontSize: '0.82rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <ImageIcon size={15} color="var(--accent-cyan)" />
                  <span>{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--glass-border)',
            marginTop: '0.5rem',
          }}
        >
          <Button
            variant="glass"
            onClick={() => {
              onClose();
              onEdit(topic);
            }}
            icon={<Edit2 size={15} />}
          >
            Edit Topic
          </Button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onStartStudy(topic);
              }}
              icon={<Play size={16} fill="#080B18" />}
            >
              Start Focus Session
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
