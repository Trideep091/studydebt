import type { Topic } from '../../types';

export interface RecommendedAction {
  topic: Topic;
  reason: string;
  recommendedMinutes: number;
  urgencyLevel: 'high' | 'medium' | 'normal';
}

export function getNextSmallWin(
  topics: Topic[],
  availableMinutes: number = 15
): RecommendedAction | null {
  const incomplete = topics.filter((t) => t.status !== 'completed');
  if (incomplete.length === 0) return null;

  const now = new Date();

  const scored = incomplete.map((topic) => {
    let score = 0;
    let reason = 'Keep momentum going with this next backlog task.';
    let urgencyLevel: 'high' | 'medium' | 'normal' = 'normal';

    // 1. Due date factor
    if (topic.dueDate) {
      const due = new Date(topic.dueDate);
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 2 && diffDays >= 0) {
        score += 60;
        reason = `Upcoming deadline: Due in ${diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : '2 days'}.`;
        urgencyLevel = 'high';
      } else if (diffDays <= 4) {
        score += 35;
        reason = `Approaching due date in ${diffDays} days.`;
        urgencyLevel = 'medium';
      }
    }

    // 2. Priority factor
    switch (topic.priority) {
      case 'urgent':
        score += 40;
        if (urgencyLevel === 'normal') {
          reason = 'Marked as urgent priority in your backlog.';
          urgencyLevel = 'high';
        }
        break;
      case 'high':
        score += 30;
        if (urgencyLevel === 'normal') {
          reason = 'High-priority learning objective.';
          urgencyLevel = 'medium';
        }
        break;
      case 'medium':
        score += 15;
        break;
      case 'low':
        score += 5;
        break;
    }

    // 3. Momentum factor (already in progress)
    if (topic.status === 'in_progress') {
      score += 20;
      if (urgencyLevel === 'normal') {
        reason = 'Pick up right where you left off.';
      }
    }

    // 4. Time fit factor (matches or slightly under availableMinutes)
    const effort = topic.estimatedMinutes || 20;
    if (effort <= availableMinutes) {
      score += 25;
      reason = `${reason} (Perfect fit for your ${availableMinutes}-minute window)`;
    } else if (effort <= availableMinutes * 1.5) {
      score += 10;
    }

    // 5. Low mastery boost
    if (typeof topic.masteryScore === 'number' && topic.masteryScore < 50) {
      score += 20;
      reason = 'Recent performance indicates this concept needs a quick reinforcement.';
    }

    return {
      topic,
      score,
      reason,
      urgencyLevel,
      recommendedMinutes: Math.min(effort, availableMinutes),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  return {
    topic: best.topic,
    reason: best.reason,
    recommendedMinutes: best.recommendedMinutes,
    urgencyLevel: best.urgencyLevel,
  };
}
