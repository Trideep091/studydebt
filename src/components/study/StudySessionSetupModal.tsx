import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Clock, Zap, Target } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Topic, Screenshot, EnergyLevel, SessionMode } from '../../types';

interface StudySessionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSession: (config: {
    topic?: Topic;
    screenshot?: Screenshot;
    durationMinutes: number;
    energyLevel: EnergyLevel;
    mode: SessionMode;
  }) => void;
  topics: Topic[];
  screenshots: Screenshot[];
  initialTopic?: Topic | null;
  initialScreenshot?: Screenshot | null;
  defaultMinutes?: number;
}

export const StudySessionSetupModal: React.FC<StudySessionSetupModalProps> = ({
  isOpen,
  onClose,
  onLaunchSession,
  topics,
  screenshots,
  initialTopic = null,
  initialScreenshot = null,
  defaultMinutes = 10,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedScreenshotId, setSelectedScreenshotId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(defaultMinutes);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [mode, setMode] = useState<SessionMode>('understand');

  useEffect(() => {
    if (initialTopic) {
      setSelectedTopicId(initialTopic.id);
      setSelectedScreenshotId('');
    } else if (initialScreenshot) {
      setSelectedScreenshotId(initialScreenshot.id);
      setSelectedTopicId('');
    } else if (topics.length > 0) {
      const incomplete = topics.find((t) => t.status !== 'completed');
      setSelectedTopicId(incomplete ? incomplete.id : topics[0].id);
      setSelectedScreenshotId('');
    }
    setDurationMinutes(defaultMinutes);
  }, [initialTopic, initialScreenshot, topics, defaultMinutes, isOpen]);

  const handleLaunch = () => {
    const topic = topics.find((t) => t.id === selectedTopicId);
    const screenshot = screenshots.find((s) => s.id === selectedScreenshotId);

    onLaunchSession({
      topic,
      screenshot,
      durationMinutes,
      energyLevel,
      mode,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Quick Focus Session" maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Source Selection: Topic or Screenshot */}
        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Study Focus Topic *
          </label>
          <select
            className="select"
            value={selectedTopicId}
            onChange={(e) => {
              setSelectedTopicId(e.target.value);
              setSelectedScreenshotId('');
            }}
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.subject}] {t.title} ({t.status === 'completed' ? 'Done' : 'Pending'})
              </option>
            ))}
          </select>
        </div>

        {/* Time duration selector: 5, 10, 15, 25 minutes */}
        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Available Time
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {[5, 10, 15, 25].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  border: durationMinutes === mins ? '1px solid var(--accent-lavender)' : '1px solid var(--glass-border)',
                  background: durationMinutes === mins ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: durationMinutes === mins ? '#FFFFFF' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>{mins}m</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  {mins === 5 ? 'Micro' : mins === 10 ? 'Sprint' : mins === 15 ? 'Balanced' : 'Deep'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Level: Low, Medium, High */}
        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Current Energy Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {(
              [
                { level: 'low', label: 'Low Energy', sub: 'Gentle, bite-sized' },
                { level: 'medium', label: 'Medium Energy', sub: 'Standard study pace' },
                { level: 'high', label: 'High Energy', sub: 'Challenging & deep' },
              ] as const
            ).map((item) => (
              <button
                key={item.level}
                type="button"
                onClick={() => setEnergyLevel(item.level)}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: energyLevel === item.level ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                  background: energyLevel === item.level ? 'rgba(103, 232, 249, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  color: energyLevel === item.level ? '#A5F3FC' : 'var(--text-secondary)',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode: Understand, Practice, Revise, Catch Up */}
        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Learning Mode
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {(
              [
                { mode: 'understand', label: 'Understand', desc: 'Concept clarity & examples' },
                { mode: 'practice', label: 'Practice', desc: 'Active problem solving' },
                { mode: 'revise', label: 'Revise', desc: 'Reinforce memory' },
                { mode: 'catchup', label: 'Catch Up', desc: 'Fast essentials recap' },
              ] as const
            ).map((item) => (
              <button
                key={item.mode}
                type="button"
                onClick={() => setMode(item.mode)}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: mode === item.mode ? '1px solid var(--accent-mint)' : '1px solid var(--glass-border)',
                  background: mode === item.mode ? 'rgba(134, 239, 172, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: mode === item.mode ? '#BBF7D0' : 'var(--text-secondary)',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleLaunch}
            icon={<Play size={16} fill="#080B18" />}
          >
            Start {durationMinutes}-Minute Session
          </Button>
        </div>
      </div>
    </Modal>
  );
};
