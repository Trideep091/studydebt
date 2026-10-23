import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  BookOpen,
  Clock,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import { TopicCard } from './TopicCard';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import type { Topic, Priority, TopicStatus } from '../../types';

interface BacklogManagerProps {
  topics: Topic[];
  onToggleStatus: (topic: Topic) => void;
  onStartStudy: (topic: Topic) => void;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
  onSelectTopic: (topic: Topic) => void;
  onOpenAddModal: () => void;
}

export const BacklogManager: React.FC<BacklogManagerProps> = ({
  topics,
  onToggleStatus,
  onStartStudy,
  onEditTopic,
  onDeleteTopic,
  onSelectTopic,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'effort-asc' | 'effort-desc' | 'title'>('urgency');

  // Extract unique subjects
  const subjects = useMemo(() => {
    const set = new Set<string>();
    topics.forEach((t) => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set).sort();
  }, [topics]);

  // Filter & sort
  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = t.title.toLowerCase().includes(q);
          const matchesDesc = (t.description || '').toLowerCase().includes(q);
          const matchesSubject = t.subject.toLowerCase().includes(q);
          const matchesTags = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesSubject && !matchesTags) return false;
        }

        // Subject filter
        if (selectedSubject !== 'all' && t.subject !== selectedSubject) return false;

        // Priority filter
        if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

        // Status filter
        if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'urgency') {
          // Uncompleted first
          if (a.status === 'completed' && b.status !== 'completed') return 1;
          if (b.status === 'completed' && a.status !== 'completed') return -1;

          // Due date check
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;

          // Priority weight
          const prioWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (prioWeight[b.priority] || 0) - (prioWeight[a.priority] || 0);
        } else if (sortBy === 'effort-asc') {
          return (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0);
        } else if (sortBy === 'effort-desc') {
          return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [topics, searchQuery, selectedSubject, selectedPriority, selectedStatus, sortBy]);

  const pendingCount = topics.filter((t) => t.status !== 'completed').length;
  const completedCount = topics.filter((t) => t.status === 'completed').length;
  const totalMinutes = topics
    .filter((t) => t.status !== 'completed')
    .reduce((sum, t) => sum + (t.estimatedMinutes || 20), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Backlog Header Bar */}
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
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Backlog Manager</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Organize, prioritize, and systematically conquer your study topics.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onOpenAddModal}
          icon={<Plus size={16} />}
        >
          Add Topic
        </Button>
      </div>

      {/* Summary KPI Pills */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(103, 232, 249, 0.1)',
            border: '1px solid rgba(103, 232, 249, 0.25)',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#67E8F9',
          }}
        >
          <ListTodo size={14} />
          <span>{pendingCount} Pending</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.25)',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#C4B5FD',
          }}
        >
          <Clock size={14} />
          <span>{Math.round(totalMinutes / 60 * 10) / 10}h Backlog Work</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(134, 239, 172, 0.1)',
            border: '1px solid rgba(134, 239, 172, 0.25)',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#86EFAC',
          }}
        >
          <CheckCircle2 size={14} />
          <span>{completedCount} Completed</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <GlassCard style={{ padding: '1.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.85rem',
            alignItems: 'center',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search topics, subjects, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              className="select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              className="select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              className="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="urgency">Sort by Urgency</option>
              <option value="effort-asc">Sort by Shortest First</option>
              <option value="effort-desc">Sort by Longest First</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onToggleStatus={onToggleStatus}
              onStartStudy={onStartStudy}
              onEdit={onEditTopic}
              onDelete={onDeleteTopic}
              onSelect={onSelectTopic}
            />
          ))}
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
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={28} color="var(--accent-lavender)" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
              No matching topics found
            </h3>
            <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem' }}>
              {topics.length === 0
                ? 'Your backlog is currently empty. Add your first study topic to get organized!'
                : 'Try clearing your filters or search query to view your saved topics.'}
            </p>
          </div>

          <Button
            variant="primary"
            onClick={onOpenAddModal}
            icon={<Plus size={16} />}
          >
            Add First Topic
          </Button>
        </GlassCard>
      )}
    </div>
  );
};
