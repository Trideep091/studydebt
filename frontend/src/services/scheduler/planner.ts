import type { WeeklyTask, WeeklyPlan, PlanWindow } from '../../types';

export function calculateDateWindow(windowType: PlanWindow, startDateStr?: string): { start: Date; end: Date; daysCount: number } {
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const end = new Date(start);

  let days = 7;
  if (windowType === '2_days') days = 2;
  else if (windowType === '3_days') days = 3;
  else if (windowType === '7_days') days = 7;
  else days = 14;

  end.setDate(start.getDate() + (days - 1));

  return { start, end, daysCount: days };
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function rebalanceTasks(
  tasks: WeeklyTask[],
  startDate: string,
  daysCount: number,
  dailyCapacities: Record<string, number> = {}
): WeeklyTask[] {
  // Preserve completed tasks
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  // Sort pending by urgency & priority
  const prioWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  pendingTasks.sort((a, b) => (prioWeight[b.priority] || 0) - (prioWeight[a.priority] || 0));

  // Generate target dates starting from today / startDate
  const start = new Date(startDate);
  const dates: string[] = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(formatDate(d));
  }

  // Allocate pending tasks across dates
  const dailyLoads: Record<string, number> = {};
  dates.forEach((date) => {
    // Sum minutes of already completed tasks on that date
    const doneOnDate = completedTasks
      .filter((t) => t.date === date)
      .reduce((sum, t) => sum + t.durationMinutes, 0);
    dailyLoads[date] = doneOnDate;
  });

  const rebalancedPending: WeeklyTask[] = [];

  for (const task of pendingTasks) {
    // Find date with lowest current load relative to capacity
    let bestDate = dates[0];
    let minLoad = Infinity;

    for (const d of dates) {
      const cap = dailyCapacities[d] || 60;
      const load = dailyLoads[d] || 0;
      const ratio = load / cap;

      if (ratio < minLoad) {
        minLoad = ratio;
        bestDate = d;
      }
    }

    rebalancedPending.push({
      ...task,
      date: bestDate,
      status: 'pending',
    });

    dailyLoads[bestDate] = (dailyLoads[bestDate] || 0) + task.durationMinutes;
  }

  return [...completedTasks, ...rebalancedPending];
}
