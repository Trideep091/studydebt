import { describe, it, expect } from 'vitest';
import { getNextSmallWin } from '../services/scheduler/recommendation';
import { calculateNextRevision } from '../services/scheduler/spacedRepetition';
import { rebalanceTasks, calculateDateWindow, formatDate } from '../services/scheduler/planner';
import type { Topic, StudySession, WeeklyTask } from '../types';

describe('Recommendation Engine (Next Small Win)', () => {
  it('returns null when all topics are completed', () => {
    const topics: Topic[] = [
      {
        id: '1',
        title: 'Completed Topic',
        subject: 'Math',
        priority: 'low',
        estimatedMinutes: 15,
        status: 'completed',
        createdAt: new Date().toISOString(),
        tags: [],
      },
    ];
    expect(getNextSmallWin(topics, 15)).toBeNull();
  });

  it('prioritizes topics due soon and high priority', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const topics: Topic[] = [
      {
        id: '1',
        title: 'Later Topic',
        subject: 'History',
        priority: 'low',
        estimatedMinutes: 20,
        dueDate: formatDate(nextWeek),
        status: 'not_started',
        createdAt: new Date().toISOString(),
        tags: [],
      },
      {
        id: '2',
        title: 'Urgent Topic Due Tomorrow',
        subject: 'Computer Science',
        priority: 'urgent',
        estimatedMinutes: 15,
        dueDate: formatDate(tomorrow),
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        tags: [],
      },
    ];

    const result = getNextSmallWin(topics, 15);
    expect(result).not.toBeNull();
    expect(result?.topic.id).toBe('2');
    expect(result?.urgencyLevel).toBe('high');
  });
});

describe('Spaced Repetition Engine', () => {
  it('increases interval and mastery on correct answer with high confidence', () => {
    const topic: Topic = {
      id: 'topic-test',
      title: 'Java Arrays',
      subject: 'CS',
      priority: 'high',
      estimatedMinutes: 20,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      tags: [],
      masteryScore: 40,
    };

    const session: StudySession = {
      id: 'session-1',
      topicId: topic.id,
      title: topic.title,
      durationMinutes: 10,
      actualSecondsSpent: 550,
      energyLevel: 'medium',
      mode: 'understand',
      isCorrect: true,
      confidenceRating: 5,
      completedAt: new Date().toISOString(),
      content: {} as any,
    };

    const rev = calculateNextRevision(undefined, topic, session);
    expect(rev.reviewCount).toBe(1);
    expect(rev.consecutiveCorrect).toBe(1);
    expect(rev.masteryScore).toBeGreaterThan(40);
  });

  it('resets consecutive correct and adjusts interval on incorrect answer', () => {
    const topic: Topic = {
      id: 'topic-test-2',
      title: 'Eigenvalues',
      subject: 'Math',
      priority: 'urgent',
      estimatedMinutes: 30,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      tags: [],
      masteryScore: 60,
    };

    const session: StudySession = {
      id: 'session-2',
      topicId: topic.id,
      title: topic.title,
      durationMinutes: 10,
      actualSecondsSpent: 600,
      energyLevel: 'low',
      mode: 'revise',
      isCorrect: false,
      confidenceRating: 2,
      completedAt: new Date().toISOString(),
      content: {} as any,
    };

    const rev = calculateNextRevision(
      {
        id: 'rev-topic-test-2',
        topicId: topic.id,
        topicTitle: topic.title,
        subject: topic.subject,
        lastRevisionDate: new Date().toISOString(),
        nextRevisionDate: new Date().toISOString(),
        reviewCount: 3,
        consecutiveCorrect: 3,
        confidenceRating: 4,
        masteryScore: 60,
        history: [],
      },
      topic,
      session
    );

    expect(rev.consecutiveCorrect).toBe(0);
    expect(rev.masteryScore).toBeLessThan(60);
  });
});

describe('Weekly Planner & Rebalance Engine', () => {
  it('preserves completed tasks and redistributes pending tasks', () => {
    const today = formatDate(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    const tasks: WeeklyTask[] = [
      {
        id: 'task-1',
        title: 'Finished Task',
        subject: 'CS',
        date: today,
        durationMinutes: 25,
        priority: 'high',
        status: 'completed',
      },
      {
        id: 'task-2',
        title: 'Missed Task Yesterday',
        subject: 'Math',
        date: '2026-10-01',
        durationMinutes: 30,
        priority: 'urgent',
        status: 'missed',
      },
      {
        id: 'task-3',
        title: 'Upcoming Task',
        subject: 'Physics',
        date: today,
        durationMinutes: 20,
        priority: 'medium',
        status: 'pending',
      },
    ];

    const capacities = { [today]: 60, [tomorrowStr]: 60 };
    const rebalanced = rebalanceTasks(tasks, today, 3, capacities);

    // Completed task should remain exactly as is
    const completed = rebalanced.find((t) => t.id === 'task-1');
    expect(completed?.status).toBe('completed');
    expect(completed?.date).toBe(today);

    // Missed task should now be scheduled on or after today
    const missed = rebalanced.find((t) => t.id === 'task-2');
    expect(missed?.status).toBe('pending');
    expect(new Date(missed!.date).getTime()).toBeGreaterThanOrEqual(new Date(today).getTime());
  });

  it('correctly calculates target date windows for 2, 3, and 7 days', () => {
    const w2 = calculateDateWindow('2_days', '2026-10-24');
    expect(w2.daysCount).toBe(2);

    const w7 = calculateDateWindow('7_days', '2026-10-24');
    expect(w7.daysCount).toBe(7);
  });
});
