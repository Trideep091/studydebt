import type {
  SmartOverview,
  MicroLearningContent,
  QuizQuestion,
  WeeklyPlan,
  PlanWindow,
  EnergyLevel,
  SessionMode,
} from '../../types';

// Backend URL resolution:
// 1. Build-time environment variable VITE_API_URL or VITE_API_BASE_URL
// 2. In local development (import.meta.env.DEV), default to local FastAPI server 'http://localhost:8000'
// 3. In production builds, default to empty string '' if no production URL was provided
const INITIAL_API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : '')
).replace(/\/+$/, '');

let activeApiBaseUrl = INITIAL_API_BASE_URL;

export function setApiBaseUrl(url: string): void {
  activeApiBaseUrl = (url || '').trim().replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  return activeApiBaseUrl;
}

export interface AIHealthStatus {
  status: 'online' | 'degraded' | 'offline';
  provider: string;
  model: string;
  endpoint: string;
  isConnected: boolean;
  details?: string;
}

export async function checkAIHealth(customEndpoint?: string): Promise<AIHealthStatus> {
  const endpoint = (customEndpoint !== undefined ? customEndpoint : getApiBaseUrl()).trim().replace(/\/+$/, '');

  if (!endpoint) {
    return {
      status: 'offline',
      provider: 'client-offline',
      model: 'client-engine',
      endpoint: 'No remote AI backend configured',
      isConnected: false,
      details: 'No production AI backend URL is configured. StudyDebt is running in client-side educational fallback mode.',
    };
  }

  try {
    const res = await fetch(`${endpoint}/api/ai/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        status: data.status,
        provider: data.provider,
        model: data.model,
        endpoint: data.endpoint || endpoint,
        isConnected: data.is_connected,
        details: data.details,
      };
    }
  } catch (e) {
    // Backend offline or unreachable
  }
  return {
    status: 'offline',
    provider: 'ollama',
    model: 'llama3.2',
    endpoint,
    isConnected: false,
    details: `Backend at ${endpoint} is offline or unreachable. Using client-side educational engine.`,
  };
}

export async function summarizeScreenshot(
  extractedText: string,
  subjectHint: string = '',
  targetMinutes: number = 10
): Promise<SmartOverview> {
  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/api/ai/summarize-screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extracted_text: extractedText,
          subject_hint: subjectHint,
          target_review_minutes: targetMinutes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('API call failed, falling back to local extractor', err);
    }
  }

  // Graceful client fallback
  const lines = extractedText.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0] ? lines[0].slice(0, 50) : (subjectHint ? `${subjectHint} Screenshot` : 'Study Material');
  const gist = lines.slice(0, 3).join(' ') || 'Key concepts and visual formulas extracted from screenshot.';

  return {
    title,
    gist: gist.slice(0, 220) + (gist.length > 220 ? '...' : ''),
    mainConcepts: lines.slice(0, 3).map((l) => l.slice(0, 45)),
    definitionsAndFormulas: [
      {
        term: 'Core Principle',
        explanation: 'Fundamental formula and relationship shown in study notes.',
      },
    ],
    keyTakeaways: [
      'Understand the visual layout and key terminology.',
      'Apply the rule directly to sample problems.',
    ],
    actionItems: ['Review and test understanding with the knowledge check.'],
    knowledgeCheck: {
      question: `What is the central focus of '${title}'?`,
      options: [
        `Gaining foundational clarity on ${title}`,
        'Administrative rules and grading policy',
        'Unrelated external documentation',
        'Historical context only',
      ],
      answerIndex: 0,
      explanation: 'The screenshot specifically captures key learning points for this topic.',
    },
    tags: [subjectHint || 'Lecture Notes', 'Screenshot', 'Key Concepts'],
    estimatedMinutes: targetMinutes,
    sourceExtractedText: extractedText,
    isOcrComplete: true,
  };
}

export async function generateMicroStudy(
  topicTitle: string,
  subject: string,
  durationMinutes: number,
  energyLevel: EnergyLevel,
  mode: SessionMode,
  description: string = '',
  objectives: string[] = []
): Promise<MicroLearningContent> {
  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/api/ai/generate-microstudy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_title: topicTitle,
          subject,
          duration_minutes: durationMinutes,
          energy_level: energyLevel,
          mode,
          description,
          learning_objectives: objectives,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('Backend call failed, using client fallback', err);
    }
  }

  // Client-side fallback
  const isLowEnergy = energyLevel === 'low';
  return {
    objective: `Understand the core intuition of ${topicTitle} without cognitive overload.`,
    explanation: `${topicTitle} in ${subject} is designed to solve a fundamental problem. ${
      description || 'Focus on understanding the input-output relationship and the reasoning behind each step.'
    } By breaking this down into ${durationMinutes} minutes, we eliminate friction and build steady mastery.`,
    example: `Concrete Example:\nSuppose you are working with ${topicTitle}. Notice how each component connects directly to the desired outcome. Work through one step at a time rather than rushing ahead.`,
    practiceQuestion: {
      question: `What is the most effective approach when beginning ${topicTitle}?`,
      options: [
        'Understand the inputs, constraints, and base rules first',
        'Guess without looking at requirements',
        'Skip directly to the hardest variant',
        'Memorize answers without understanding steps',
      ],
      answerIndex: 0,
      explanation: 'Verifying inputs and constraints establishes a strong foundation.',
    },
    knowledgeCheck: {
      question: `Why is steady progress in ${topicTitle} more valuable than cramming?`,
      options: [
        'Spaced, focused sessions lead to stronger neurological retention and less debt',
        'Cramming creates permanent mastery in minutes',
        'Studying without sleep is more productive',
        'Skipping fundamentals makes exams easier',
      ],
      answerIndex: 0,
      explanation: 'Consistent micro-sessions minimize study debt and build genuine confidence.',
    },
  };
}

export async function generateWeeklyPlan(
  workload: string,
  targetWindow: PlanWindow,
  startDate: string,
  daysCount: number,
  dailyCapacities: Record<string, number>
): Promise<{ tasks: any[]; summary: string }> {
  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/api/ai/plan-week`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workload_description: workload,
          target_window: targetWindow,
          start_date: startDate,
          days_count: daysCount,
          daily_available_minutes: dailyCapacities,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { tasks: data.tasks, summary: data.summary };
      }
    } catch (err) {
      console.warn('API call failed, generating deterministic schedule', err);
    }
  }

  // Deterministic schedule generator
  const items = workload
    .split(/[,;\n\.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  const taskTitles = items.length > 0 ? items : ['Finish core topic', 'Revision & quiz check'];

  const start = new Date(startDate);
  const tasks = taskTitles.map((title, idx) => {
    const offset = idx % daysCount;
    const taskDate = new Date(start);
    taskDate.setDate(start.getDate() + offset);
    const dateStr = taskDate.toISOString().split('T')[0];

    return {
      id: `task-gen-${Date.now()}-${idx}`,
      title: title.slice(0, 60),
      subject: 'Weekly Study',
      date: dateStr,
      durationMinutes: 25,
      priority: idx === 0 ? 'urgent' : idx < 3 ? 'high' : 'medium',
      status: 'pending',
      notes: `Balanced step ${idx + 1} of your study sprint.`,
    };
  });

  return {
    tasks,
    summary: `Structured ${tasks.length} actionable sessions across ${daysCount} days to keep your backlog under control.`,
  };
}
