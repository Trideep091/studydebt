import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Topic, Priority, TopicStatus } from '../../types';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topic: Topic) => Promise<void>;
  initialTopic?: Topic | null;
  subjectsList?: string[];
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTopic,
  subjectsList = ['Computer Science', 'Mathematics', 'Databases', 'Physics', 'Biology', 'Literature'],
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [customSubject, setCustomSubject] = useState('');
  const [description, setDescription] = useState('');
  const [objectivesText, setObjectivesText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TopicStatus>('not_started');
  const [tagsText, setTagsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setTitle(initialTopic.title);
      if (subjectsList.includes(initialTopic.subject)) {
        setSubject(initialTopic.subject);
        setCustomSubject('');
      } else {
        setSubject('Other');
        setCustomSubject(initialTopic.subject);
      }
      setDescription(initialTopic.description || '');
      setObjectivesText((initialTopic.learningObjectives || []).join('\n'));
      setPriority(initialTopic.priority);
      setEstimatedMinutes(initialTopic.estimatedMinutes || 25);
      setDueDate(initialTopic.dueDate || '');
      setStatus(initialTopic.status);
      setTagsText((initialTopic.tags || []).join(', '));
    } else {
      setTitle('');
      setSubject('Computer Science');
      setCustomSubject('');
      setDescription('');
      setObjectivesText('');
      setPriority('medium');
      setEstimatedMinutes(25);
      setDueDate('');
      setStatus('not_started');
      setTagsText('');
    }
  }, [initialTopic, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const resolvedSubject = subject === 'Other' && customSubject.trim() ? customSubject.trim() : subject;
      const objectives = objectivesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const tags = tagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const topic: Topic = {
        id: initialTopic?.id || `topic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        subject: resolvedSubject,
        description: description.trim(),
        learningObjectives: objectives,
        priority,
        estimatedMinutes: Number(estimatedMinutes) || 20,
        dueDate: dueDate || undefined,
        status,
        completedAt:
          status === 'completed'
            ? initialTopic?.completedAt || new Date().toISOString()
            : undefined,
        createdAt: initialTopic?.createdAt || new Date().toISOString(),
        tags,
        screenshotIds: initialTopic?.screenshotIds || [],
        masteryScore: initialTopic?.masteryScore || (status === 'completed' ? 80 : 0),
      };

      await onSave(topic);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTopic ? 'Edit Topic' : 'Add New Study Topic'}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Topic Title *
          </label>
          <input
            type="text"
            className="input"
            required
            placeholder="e.g., Matrix Multiplication & Eigenvalues"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Subject / Category
            </label>
            <select
              className="select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="Other">Other (Custom)</option>
            </select>
            {subject === 'Other' && (
              <input
                type="text"
                className="input"
                placeholder="Enter custom subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                style={{ marginTop: '0.5rem' }}
                required
              />
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Priority Level
            </label>
            <select
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Estimated Effort (Minutes)
            </label>
            <input
              type="number"
              className="input"
              min="5"
              max="240"
              step="5"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Target Due Date (Optional)
            </label>
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Status
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['not_started', 'in_progress', 'completed'] as TopicStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: status === st ? '1px solid var(--accent-lavender)' : '1px solid var(--glass-border)',
                  background: status === st ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: status === st ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {st === 'not_started' ? 'Not Started' : st === 'in_progress' ? 'In Progress' : 'Completed'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Description or Study Notes
          </label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="Brief context, chapter reference, or lecture summary..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Learning Objectives (one per line)
          </label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="e.g. Master formula for 2x2 determinant&#10;Solve sample eigenvalue problem"
            value={objectivesText}
            onChange={(e) => setObjectivesText(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Tags (comma-separated)
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Midterm, Chapter 4, Formulas"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {initialTopic ? 'Save Changes' : 'Create Topic'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
