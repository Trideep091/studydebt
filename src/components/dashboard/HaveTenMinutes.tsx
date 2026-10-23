import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Play,
  RotateCw,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  UploadCloud,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Screenshot, Topic } from '../../types';

interface HaveTenMinutesProps {
  screenshots: Screenshot[];
  onStartReview: (screenshot: Screenshot, minutes: number) => void;
  onUploadClick: () => void;
  onConvertTopic?: (screenshot: Screenshot) => void;
}

export const HaveTenMinutes: React.FC<HaveTenMinutesProps> = ({
  screenshots,
  onStartReview,
  onUploadClick,
  onConvertTopic,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Filter unread screenshots with overview
  const candidates = screenshots.filter((s) => !s.isRead && s.overview);

  const handleNextCandidate = () => {
    if (candidates.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % candidates.length);
    }
  };

  const activeScreenshot = candidates.length > 0 ? candidates[currentIndex % candidates.length] : null;

  if (!activeScreenshot) {
    return (
      <GlassCard
        glow="lavender"
        style={{
          padding: '2rem',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          background:
            'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(167, 139, 250, 0.1), transparent), rgba(15, 23, 42, 0.65)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--accent-lavender)',
                marginBottom: '0.5rem',
              }}
            >
              <Clock size={14} />
              <span>Have 10 minutes?</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>
              Your saved screenshots still have something to teach you.
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '520px' }}>
              Turn forgotten lecture slides, code snippets, and diagram screenshots into clear,
              active study material. Upload your first educational screenshot to unlock bite-sized reviews!
            </p>
          </div>

          <Button
            variant="primary"
            onClick={onUploadClick}
            icon={<UploadCloud size={16} />}
          >
            Upload a Screenshot
          </Button>
        </div>
      </GlassCard>
    );
  }

  const overview = activeScreenshot.overview!;
  const takeaway = overview.keyTakeaways?.[0] || overview.gist;

  return (
    <GlassCard
      glow="lavender"
      style={{
        padding: '2rem',
        border: '1px solid rgba(167, 139, 250, 0.35)',
        background:
          'radial-gradient(ellipse 80% 60% at 90% 10%, rgba(167, 139, 250, 0.15), transparent), rgba(15, 23, 42, 0.7)',
        boxShadow: 'var(--glass-shadow-elevated)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(167, 139, 250, 0.15)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              color: 'var(--accent-lavender)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.4rem',
            }}
          >
            <Clock size={13} />
            <span>Have {selectedMinutes} minutes?</span>
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF' }}>
            Your saved screenshots still have something to teach you.
          </h3>
        </div>

        {/* Duration selector: 5, 10, 15 min */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {[5, 10, 15].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMinutes(m)}
              style={{
                background:
                  selectedMinutes === m
                    ? 'rgba(167, 139, 250, 0.25)'
                    : 'rgba(255, 255, 255, 0.05)',
                border:
                  selectedMinutes === m
                    ? '1px solid #A78BFA'
                    : '1px solid var(--glass-border)',
                color: selectedMinutes === m ? '#DDD6FE' : 'var(--text-secondary)',
                padding: '0.35rem 0.7rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {m} Min
            </button>
          ))}
        </div>
      </div>

      {/* Featured Item Box */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: activeScreenshot.imageData ? '140px 1fr' : '1fr',
          gap: '1.5rem',
          alignItems: 'center',
          background: 'rgba(10, 15, 30, 0.65)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.5rem',
        }}
      >
        {activeScreenshot.imageData && (
          <div
            style={{
              width: '140px',
              height: '110px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#04060E',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={activeScreenshot.imageData}
              alt={activeScreenshot.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant="cyan">{activeScreenshot.subject || 'Study Material'}</Badge>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Est. Review: {activeScreenshot.estimatedMinutes || selectedMinutes} min
            </span>
          </div>

          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
            {overview.title || activeScreenshot.title}
          </h4>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--accent-cyan)' }}>Quick Overview: </strong>
            {overview.gist}
          </p>

          <div
            style={{
              fontSize: '0.84rem',
              color: 'var(--accent-mint)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.2rem',
            }}
          >
            <Sparkles size={14} style={{ flexShrink: 0 }} />
            <span>
              <strong>Your mission: </strong>Review the key takeaway and test yourself with 1
              concept check question.
            </span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => onStartReview(activeScreenshot, selectedMinutes)}
          icon={<Play size={16} fill="#080B18" />}
        >
          Start {selectedMinutes}-Minute Review
        </Button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {candidates.length > 1 && (
            <Button
              variant="glass"
              size="md"
              onClick={handleNextCandidate}
              icon={<RotateCw size={15} />}
            >
              Choose Another ({candidates.length} available)
            </Button>
          )}

          {onConvertTopic && !activeScreenshot.linkedTopicId && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => onConvertTopic(activeScreenshot)}
            >
              Add to Backlog
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
