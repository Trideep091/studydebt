import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Plus,
  RotateCw,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Send,
  Loader2,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import type { WeeklyPlan, WeeklyTask, PlanWindow, Priority } from '../../types';
import { generateWeeklyPlan } from '../../services/ai/client';
import { rebalanceTasks, calculateDateWindow, formatDate } from '../../services/scheduler/planner';

interface WeeklyPlannerViewProps {
  currentPlan?: WeeklyPlan | null;
  onSavePlan: (plan: WeeklyPlan) => Promise<void>;
  onStartStudyTask?: (task: WeeklyTask) => void;
}

export const WeeklyPlannerView: React.FC<WeeklyPlannerViewProps> = ({
  currentPlan,
  onSavePlan,
  onStartStudyTask,
}) => {
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [workloadInput, setWorkloadInput] = useState('');
  const [selectedWindow, setSelectedWindow] = useState<PlanWindow>('7_days');
  const [dailyCapacityMins, setDailyCapacityMins] = useState<number>(60);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Add Task modal
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [targetDateForNewTask, setTargetDateForNewTask] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Computer Science');
  const [newTaskDuration, setNewTaskDuration] = useState(25);
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');

  const todayStr = formatDate(new Date());

  const handleGeneratePlan = async () => {
    if (!workloadInput.trim()) return;

    setIsGenerating(true);
    try {
      const { start, end, daysCount } = calculateDateWindow(selectedWindow, todayStr);

      const dailyCapacities: Record<string, number> = {};
      for (let i = 0; i < daysCount; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dailyCapacities[formatDate(d)] = dailyCapacityMins;
      }

      const result = await generateWeeklyPlan(
        workloadInput,
        selectedWindow,
        todayStr,
        daysCount,
        dailyCapacities
      );

      const plan: WeeklyPlan = {
        id: `plan-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        targetWindow: selectedWindow,
        startDate: todayStr,
        endDate: formatDate(end),
        dailyCapacityMinutes: dailyCapacities,
        tasks: result.tasks,
        originalPrompt: workloadInput,
      };

      await onSavePlan(plan);
      setIsPromptModalOpen(false);
      setWorkloadInput('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string) => {
    if (!currentPlan) return;
    const updatedTasks = currentPlan.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: t.status === 'completed' ? ('pending' as const) : ('completed' as const),
        };
      }
      return t;
    });

    await onSavePlan({ ...currentPlan, tasks: updatedTasks });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentPlan) return;
    const updatedTasks = currentPlan.tasks.filter((t) => t.id !== taskId);
    await onSavePlan({ ...currentPlan, tasks: updatedTasks });
  };

  const handleMoveToNextDay = async (taskId: string) => {
    if (!currentPlan) return;
    const updatedTasks = currentPlan.tasks.map((t) => {
      if (t.id === taskId) {
        const current = new Date(t.date);
        current.setDate(current.getDate() + 1);
        return {
          ...t,
          date: formatDate(current),
        };
      }
      return t;
    });
    await onSavePlan({ ...currentPlan, tasks: updatedTasks });
  };

  const handleRebalanceMyWeek = async () => {
    if (!currentPlan) return;
    const { daysCount } = calculateDateWindow(currentPlan.targetWindow, todayStr);
    const rebalanced = rebalanceTasks(
      currentPlan.tasks,
      todayStr,
      daysCount,
      currentPlan.dailyCapacityMinutes
    );
    await onSavePlan({ ...currentPlan, tasks: rebalanced });
  };

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentPlan) return;

    const newTask: WeeklyTask = {
      id: `task-manual-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      date: targetDateForNewTask || todayStr,
      durationMinutes: Number(newTaskDuration) || 25,
      priority: newTaskPriority,
      status: 'pending',
    };

    await onSavePlan({
      ...currentPlan,
      tasks: [...currentPlan.tasks, newTask],
    });

    setIsAddTaskModalOpen(false);
    setNewTaskTitle('');
  };

  // Group tasks by date
  const tasksByDate = React.useMemo(() => {
    if (!currentPlan) return {};
    const grouped: Record<string, WeeklyTask[]> = {};

    // Ensure all dates in window exist as columns
    const { start, daysCount } = calculateDateWindow(currentPlan.targetWindow, currentPlan.startDate);
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      grouped[formatDate(d)] = [];
    }

    currentPlan.tasks.forEach((t) => {
      if (!grouped[t.date]) {
        grouped[t.date] = [];
      }
      grouped[t.date].push(t);
    });

    return grouped;
  }, [currentPlan]);

  const datesList = Object.keys(tasksByDate).sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
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
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Weekly Study Planner</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Turn unstructured study loads into a manageable, deadline-aware daily rhythm.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {currentPlan && (
            <Button
              variant="secondary"
              onClick={handleRebalanceMyWeek}
              icon={<RotateCw size={15} />}
            >
              Rebalance My Week
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() => setIsPromptModalOpen(true)}
            icon={<Sparkles size={16} />}
          >
            {currentPlan ? 'Plan New Workload' : 'Generate Study Plan'}
          </Button>
        </div>
      </div>

      {/* Plan Workspace */}
      {currentPlan && datesList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Plan Info banner */}
          <GlassCard style={{ padding: '1rem 1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Badge variant="lavender">
                  {currentPlan.targetWindow.replace('_', ' ').toUpperCase()}
                </Badge>
                <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Active window: {currentPlan.startDate} to {currentPlan.endDate}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Total Tasks: <strong>{currentPlan.tasks.length}</strong>
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--accent-mint)' }}>
                  Completed:{' '}
                  <strong>
                    {currentPlan.tasks.filter((t) => t.status === 'completed').length}
                  </strong>
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Day columns horizontal scroll / grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
              gap: '1rem',
              alignItems: 'start',
            }}
          >
            {datesList.map((dateStr) => {
              const dayTasks = tasksByDate[dateStr] || [];
              const totalMins = dayTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
              const capacity = currentPlan.dailyCapacityMinutes?.[dateStr] || 60;
              const isOverloaded = totalMins > capacity;
              const isToday = dateStr === todayStr;

              const dateObj = new Date(dateStr + 'T00:00:00');
              const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
              const dayFormatted = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

              return (
                <div
                  key={dateStr}
                  style={{
                    background: isToday ? 'rgba(167, 139, 250, 0.08)' : 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(16px)',
                    border: isToday
                      ? '1px solid rgba(167, 139, 250, 0.35)'
                      : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    minHeight: '380px',
                  }}
                >
                  {/* Day Column Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '0.65rem',
                      borderBottom: '1px solid var(--glass-border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <strong style={{ fontSize: '1rem', color: isToday ? 'var(--accent-lavender)' : '#FFFFFF' }}>
                          {dayName}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {dayFormatted}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: isOverloaded ? '#F87171' : 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {totalMins}m / {capacity}m capacity {isOverloaded && '⚠️ Overload'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setTargetDateForNewTask(dateStr);
                        setIsAddTaskModalOpen(true);
                      }}
                      className="btn btn-ghost btn-sm"
                      title="Add task to this day"
                      style={{ padding: '0.3rem' }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Tasks list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                    {dayTasks.map((task) => {
                      const isCompleted = task.status === 'completed';

                      return (
                        <div
                          key={task.id}
                          style={{
                            background: isCompleted ? 'rgba(255, 255, 255, 0.02)' : 'rgba(22, 33, 58, 0.7)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.45rem',
                            opacity: isCompleted ? 0.65 : 1,
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Badge priority={task.priority}>{task.priority}</Badge>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {task.durationMinutes} min
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: isCompleted ? 'var(--text-secondary)' : '#FFFFFF',
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              lineHeight: 1.35,
                            }}
                          >
                            {task.title}
                          </div>

                          {task.notes && (
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {task.notes}
                            </div>
                          )}

                          {/* Task Card Actions */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '0.4rem',
                              borderTop: '1px solid var(--glass-border-subtle)',
                              marginTop: 'auto',
                            }}
                          >
                            <button
                              onClick={() => handleToggleTaskStatus(task.id)}
                              className="btn btn-ghost btn-sm"
                              style={{
                                padding: '0.2rem 0.4rem',
                                fontSize: '0.76rem',
                                color: isCompleted ? 'var(--accent-mint)' : 'var(--text-secondary)',
                              }}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={14} color="var(--accent-mint)" />
                              ) : (
                                <Circle size={14} />
                              )}
                              <span>{isCompleted ? 'Done' : 'Mark'}</span>
                            </button>

                            <div style={{ display: 'flex', gap: '0.2rem' }}>
                              {!isCompleted && (
                                <button
                                  onClick={() => handleMoveToNextDay(task.id)}
                                  className="btn btn-ghost btn-sm"
                                  title="Push task to next day"
                                  style={{ padding: '0.25rem' }}
                                >
                                  <ChevronRight size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="btn btn-ghost btn-sm"
                                title="Delete task"
                                style={{ padding: '0.25rem', color: '#F87171' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {dayTasks.length === 0 && (
                      <div
                        style={{
                          padding: '2rem 1rem',
                          textAlign: 'center',
                          color: 'var(--text-dim)',
                          fontSize: '0.8rem',
                        }}
                      >
                        No tasks scheduled.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <GlassCard
          glow="lavender"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(167, 139, 250, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px var(--accent-lavender-glow)',
            }}
          >
            <CalendarDays size={32} color="var(--accent-lavender)" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              No Active Study Plan
            </h3>
            <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              Describe what you need to study in natural language, pick a 2-day, 3-day, or 7-day
              target, and let the planner build an achievable daily schedule for you.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsPromptModalOpen(true)}
            icon={<Sparkles size={18} />}
          >
            Create My Study Plan
          </Button>
        </GlassCard>
      )}

      {/* Plan Generation Modal */}
      <Modal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        title="Generate Intelligent Study Plan"
        maxWidth="620px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Describe Your Workload Naturally *
            </label>
            <textarea
              className="textarea"
              rows={4}
              placeholder="e.g. I need to finish Java arrays and strings, revise linear algebra matrices, solve 3 practice problems, and catch up on database indexing. I have a test in 3 days."
              value={workloadInput}
              onChange={(e) => setWorkloadInput(e.target.value)}
            />
          </div>

          {/* Target Window Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Target Window
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(
                [
                  { id: '2_days', label: '2 Days', sub: 'Urgent sprint' },
                  { id: '3_days', label: '3 Days', sub: 'Short window' },
                  { id: '7_days', label: '7 Days', sub: 'Full week' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedWindow(preset.id)}
                  style={{
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border:
                      selectedWindow === preset.id
                        ? '1px solid var(--accent-lavender)'
                        : '1px solid var(--glass-border)',
                    background:
                      selectedWindow === preset.id
                        ? 'rgba(167, 139, 250, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                    color: selectedWindow === preset.id ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{preset.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{preset.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily study time capacity */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Target Study Capacity (Minutes per day)
            </label>
            <input
              type="number"
              className="input"
              min="20"
              max="240"
              step="10"
              value={dailyCapacityMins}
              onChange={(e) => setDailyCapacityMins(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setIsPromptModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!workloadInput.trim()}
              isLoading={isGenerating}
              onClick={handleGeneratePlan}
              icon={<Send size={15} />}
            >
              Generate Plan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manual Task Add Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add Task to Plan"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateManualTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Task Title *
            </label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Practice 3 coding exercises"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Subject
              </label>
              <input
                type="text"
                className="input"
                value={newTaskSubject}
                onChange={(e) => setNewTaskSubject(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Duration (min)
              </label>
              <input
                type="number"
                className="input"
                min="5"
                max="180"
                step="5"
                value={newTaskDuration}
                onChange={(e) => setNewTaskDuration(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Scheduled Date
              </label>
              <input
                type="date"
                className="input"
                value={targetDateForNewTask}
                onChange={(e) => setTargetDateForNewTask(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Priority
              </label>
              <select
                className="select"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setIsAddTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
