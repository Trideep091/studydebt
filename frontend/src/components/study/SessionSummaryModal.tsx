import React from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { StudySession, Topic } from '../../types';

interface SessionSummaryModalProps {
  session: StudySession | null;
  isOpen: boolean;
  onClose: () => void;
  onContinueNext: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  session,
  isOpen,
  onClose,
  onContinueNext,
}) => {
  if (!session) return null;

  const minsSpent = Math.ceil(session.actualSecondsSpent / 60);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Focus Session Complete!" maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(134, 239, 172, 0.15)',
            border: '1px solid rgba(134, 239, 172, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 0 24px var(--accent-mint-glow)',
          }}
        >
          <Award size={32} color="var(--accent-mint)" />
        </div>

        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Meaningful Progress Made
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            You invested <strong>{minsSpent} minutes</strong> of focused study in{' '}
            <strong>{session.title}</strong>.
          </p>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--glass-border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Check Result</span>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: session.isCorrect ? 'var(--accent-mint)' : '#FDE68A',
                marginTop: '0.2rem',
              }}
            >
              {session.isCorrect ? 'Correct ✓' : 'Reviewed'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Confidence</span>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--accent-lavender)',
                marginTop: '0.2rem',
              }}
            >
              ★ {session.confidenceRating || 4}/5
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Time Logged</span>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                marginTop: '0.2rem',
              }}
            >
              {minsSpent} min
            </div>
          </div>
        </div>

        {/* Learning Outcome callout */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(103, 232, 249, 0.08)',
            border: '1px solid rgba(103, 232, 249, 0.2)',
            textAlign: 'left',
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.25rem' }}>
            <TrendingUp size={15} />
            <span>Learning Engine Updated</span>
          </div>
          <div>
            This topic has been scheduled for your <strong>Revision Queue</strong> using spaced repetition.
            Your study streak and backlog debt have been updated.
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="ghost" onClick={onClose}>
            Back to Dashboard
          </Button>
          <Button
            variant="mint"
            onClick={() => {
              onClose();
              onContinueNext();
            }}
            icon={<ArrowRight size={16} />}
          >
            Next Small Win
          </Button>
        </div>
      </div>
    </Modal>
  );
};
