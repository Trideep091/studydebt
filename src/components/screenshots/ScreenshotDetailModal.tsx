import React, { useState } from 'react';
import {
  X,
  Play,
  Plus,
  CheckCircle2,
  Circle,
  RotateCw,
  Trash2,
  Tag,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Screenshot, SmartOverview } from '../../types';

interface ScreenshotDetailModalProps {
  screenshot: Screenshot | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead: (id: string, isRead: boolean) => void;
  onDelete: (id: string) => void;
  onStartReview: (screenshot: Screenshot) => void;
  onConvertToTopic: (screenshot: Screenshot) => void;
  onRegenerateOverview: (screenshot: Screenshot) => Promise<void>;
}

export const ScreenshotDetailModal: React.FC<ScreenshotDetailModalProps> = ({
  screenshot,
  isOpen,
  onClose,
  onToggleRead,
  onDelete,
  onStartReview,
  onConvertToTopic,
  onRegenerateOverview,
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!screenshot) return null;

  const overview = screenshot.overview;

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateOverview(screenshot);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={screenshot.title} maxWidth="820px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant="cyan">{screenshot.subject || 'Screenshot'}</Badge>
            <Badge status={screenshot.isRead ? 'completed' : 'not_started'}>
              {screenshot.isRead ? 'Marked Read' : 'Unread'}
            </Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Added: {new Date(screenshot.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => onToggleRead(screenshot.id, !screenshot.isRead)}
              className="btn btn-ghost btn-sm"
              style={{
                color: screenshot.isRead ? 'var(--accent-mint)' : 'var(--text-secondary)',
              }}
            >
              {screenshot.isRead ? (
                <>
                  <CheckCircle2 size={16} color="var(--accent-mint)" />
                  <span>Mark Unread</span>
                </>
              ) : (
                <>
                  <Circle size={16} />
                  <span>Mark Read</span>
                </>
              )}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              isLoading={isRegenerating}
              icon={<RotateCw size={14} />}
            >
              Regenerate
            </Button>

            <button
              onClick={() => {
                if (window.confirm('Delete this screenshot from your vault?')) {
                  onDelete(screenshot.id);
                  onClose();
                }
              }}
              className="btn btn-ghost btn-sm"
              style={{ color: '#F87171' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Two Column Layout: Image on left / Overview on right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 320px) 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Screenshot image container */}
          <div
            style={{
              background: '#04060E',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              overflow: 'hidden',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <img
              src={screenshot.imageData}
              alt={screenshot.title}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            <div
              style={{
                padding: '0.65rem 0.85rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'rgba(8, 11, 24, 0.8)',
                borderTop: '1px solid var(--glass-border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{screenshot.fileName}</span>
              <span>{(screenshot.fileSize / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          {/* Smart Overview details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {overview ? (
              <>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginBottom: '0.3rem',
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Smart Overview</span>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                    {overview.title}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {overview.gist}
                  </p>
                </div>

                {/* Key Concepts */}
                {overview.mainConcepts && overview.mainConcepts.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Core Concepts
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                      {overview.mainConcepts.map((concept, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(167, 139, 250, 0.12)',
                            color: '#DDD6FE',
                            border: '1px solid rgba(167, 139, 250, 0.25)',
                            fontSize: '0.8rem',
                          }}
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Definitions & Formulas */}
                {overview.definitionsAndFormulas && overview.definitionsAndFormulas.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Definitions & Key Formulas
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.35rem' }}>
                      {overview.definitionsAndFormulas.map((d, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '0.6rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--glass-border-subtle)',
                            fontSize: '0.84rem',
                          }}
                        >
                          <strong style={{ color: 'var(--accent-cyan)' }}>{d.term}: </strong>
                          <span style={{ color: 'var(--text-secondary)' }}>{d.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Takeaways */}
                {overview.keyTakeaways && overview.keyTakeaways.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Key Takeaways
                    </span>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                      {overview.keyTakeaways.map((item, i) => (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.45rem',
                            fontSize: '0.86rem',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <CheckCircle2 size={15} color="var(--accent-mint)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Knowledge Check Preview */}
                {overview.knowledgeCheck && (
                  <div
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(103, 232, 249, 0.06)',
                      border: '1px solid rgba(103, 232, 249, 0.2)',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      Practice Question Ready
                    </span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      {overview.knowledgeCheck.question}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No overview generated yet for this screenshot.
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--glass-border)',
            marginTop: '0.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!screenshot.linkedTopicId && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onConvertToTopic(screenshot);
                }}
                icon={<Plus size={15} />}
              >
                Convert to Backlog Topic
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onStartReview(screenshot);
              }}
              icon={<Play size={15} fill="#080B18" />}
            >
              Start Review Session
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .modal-content > div > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Modal>
  );
};
