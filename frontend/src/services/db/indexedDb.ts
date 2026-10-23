import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  Topic,
  Screenshot,
  StudySession,
  WeeklyPlan,
  WeeklyTask,
  RevisionRecord,
  UserSettings,
  StudyStats,
} from '../../types';

interface StudyDebtDB extends DBSchema {
  topics: {
    key: string;
    value: Topic;
    indexes: {
      'by-status': string;
      'by-subject': string;
      'by-priority': string;
      'by-dueDate': string;
    };
  };
  screenshots: {
    key: string;
    value: Screenshot;
    indexes: {
      'by-isRead': number;
      'by-createdAt': string;
      'by-subject': string;
    };
  };
  sessions: {
    key: string;
    value: StudySession;
    indexes: {
      'by-completedAt': string;
      'by-topicId': string;
    };
  };
  plans: {
    key: string;
    value: WeeklyPlan;
    indexes: {
      'by-generatedAt': string;
    };
  };
  tasks: {
    key: string;
    value: WeeklyTask;
    indexes: {
      'by-date': string;
      'by-status': string;
    };
  };
  revisionRecords: {
    key: string;
    value: RevisionRecord;
    indexes: {
      'by-topicId': string;
      'by-nextRevisionDate': string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'studydebt_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<StudyDebtDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<StudyDebtDB>> {
  if (!dbPromise) {
    dbPromise = openDB<StudyDebtDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Topics store
        if (!db.objectStoreNames.contains('topics')) {
          const topicStore = db.createObjectStore('topics', { keyPath: 'id' });
          topicStore.createIndex('by-status', 'status');
          topicStore.createIndex('by-subject', 'subject');
          topicStore.createIndex('by-priority', 'priority');
          topicStore.createIndex('by-dueDate', 'dueDate');
        }

        // Screenshots store
        if (!db.objectStoreNames.contains('screenshots')) {
          const screenStore = db.createObjectStore('screenshots', { keyPath: 'id' });
          screenStore.createIndex('by-isRead', 'isRead');
          screenStore.createIndex('by-createdAt', 'createdAt');
          screenStore.createIndex('by-subject', 'subject');
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-completedAt', 'completedAt');
          sessionStore.createIndex('by-topicId', 'topicId');
        }

        // Plans store
        if (!db.objectStoreNames.contains('plans')) {
          const planStore = db.createObjectStore('plans', { keyPath: 'id' });
          planStore.createIndex('by-generatedAt', 'generatedAt');
        }

        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-date', 'date');
          taskStore.createIndex('by-status', 'status');
        }

        // Revision records store
        if (!db.objectStoreNames.contains('revisionRecords')) {
          const revStore = db.createObjectStore('revisionRecords', { keyPath: 'id' });
          revStore.createIndex('by-topicId', 'topicId');
          revStore.createIndex('by-nextRevisionDate', 'nextRevisionDate');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// -------------------------------------------------------------
// TOPIC REPOSITORY
// -------------------------------------------------------------

export async function getAllTopics(): Promise<Topic[]> {
  const db = await getDB();
  return db.getAll('topics');
}

export async function getTopicById(id: string): Promise<Topic | undefined> {
  const db = await getDB();
  return db.get('topics', id);
}

export async function saveTopic(topic: Topic): Promise<void> {
  const db = await getDB();
  await db.put('topics', topic);
}

export async function deleteTopic(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['topics', 'revisionRecords', 'tasks'], 'readwrite');
  await tx.objectStore('topics').delete(id);

  // Clean up associated revision record
  const revStore = tx.objectStore('revisionRecords');
  const revRecords = await revStore.getAll();
  for (const r of revRecords) {
    if (r.topicId === id) {
      await revStore.delete(r.id);
    }
  }

  // Clean up associated tasks
  const taskStore = tx.objectStore('tasks');
  const tasks = await taskStore.getAll();
  for (const t of tasks) {
    if (t.linkedTopicId === id) {
      await taskStore.delete(t.id);
    }
  }

  await tx.done;
}

// -------------------------------------------------------------
// SCREENSHOT REPOSITORY
// -------------------------------------------------------------

export async function getAllScreenshots(): Promise<Screenshot[]> {
  const db = await getDB();
  return db.getAll('screenshots');
}

export async function getScreenshotById(id: string): Promise<Screenshot | undefined> {
  const db = await getDB();
  return db.get('screenshots', id);
}

export async function saveScreenshot(screenshot: Screenshot): Promise<void> {
  const db = await getDB();
  await db.put('screenshots', screenshot);
}

export async function deleteScreenshot(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('screenshots', id);
}

export async function getUnreadScreenshots(): Promise<Screenshot[]> {
  const all = await getAllScreenshots();
  return all.filter((s) => !s.isRead);
}

// -------------------------------------------------------------
// STUDY SESSION REPOSITORY
// -------------------------------------------------------------

export async function getAllSessions(): Promise<StudySession[]> {
  const db = await getDB();
  return db.getAll('sessions');
}

export async function saveSession(session: StudySession): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
}

// -------------------------------------------------------------
// WEEKLY PLAN & TASKS REPOSITORY
// -------------------------------------------------------------

export async function getLatestWeeklyPlan(): Promise<WeeklyPlan | undefined> {
  const db = await getDB();
  const plans = await db.getAll('plans');
  if (plans.length === 0) return undefined;
  plans.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  return plans[0];
}

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['plans', 'tasks'], 'readwrite');
  await tx.objectStore('plans').put(plan);
  const taskStore = tx.objectStore('tasks');
  for (const task of plan.tasks) {
    await taskStore.put(task);
  }
  await tx.done;
}

export async function getAllTasks(): Promise<WeeklyTask[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function saveTask(task: WeeklyTask): Promise<void> {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

// -------------------------------------------------------------
// REVISION RECORDS REPOSITORY
// -------------------------------------------------------------

export async function getAllRevisionRecords(): Promise<RevisionRecord[]> {
  const db = await getDB();
  return db.getAll('revisionRecords');
}

export async function saveRevisionRecord(record: RevisionRecord): Promise<void> {
  const db = await getDB();
  await db.put('revisionRecords', record);
}

export async function getRevisionRecordByTopicId(topicId: string): Promise<RevisionRecord | undefined> {
  const all = await getAllRevisionRecords();
  return all.find((r) => r.topicId === topicId);
}

// -------------------------------------------------------------
// USER SETTINGS REPOSITORY
// -------------------------------------------------------------

const DEFAULT_SETTINGS: UserSettings = {
  studentName: '',
  aiEndpointUrl: 'http://localhost:8000',
  aiModel: 'open-weight-default',
  dailyStudyTargetMinutes: 45,
  allowRemoteInference: false,
};

export async function getUserSettings(): Promise<UserSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'user_settings');
  return settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS;
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const db = await getDB();
  const current = await getUserSettings();
  const updated = { ...current, ...settings };
  await db.put('settings', updated, 'user_settings');
  return updated;
}

// -------------------------------------------------------------
// DERIVED STATISTICS ENGINE
// -------------------------------------------------------------

export async function computeStudyStats(): Promise<StudyStats> {
  const [topics, screenshots, sessions, revisionRecords] = await Promise.all([
    getAllTopics(),
    getAllScreenshots(),
    getAllSessions(),
    getAllRevisionRecords(),
  ]);

  const pendingTopics = topics.filter((t) => t.status !== 'completed');
  const completedTopics = topics.filter((t) => t.status === 'completed');
  const unreadScreenshots = screenshots.filter((s) => !s.isRead);

  const estimatedRemainingMinutes = pendingTopics.reduce((acc, t) => acc + (t.estimatedMinutes || 20), 0);

  // Compute due soon (within next 3 days)
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const dueSoonTopics = pendingTopics.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due >= now && due <= threeDaysFromNow;
  });

  // Calculate streak based on distinct dates in completed sessions
  const sessionDates = Array.from(
    new Set(
      sessions.map((s) => {
        const d = new Date(s.completedAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    )
  ).sort().reverse();

  let streak = 0;
  if (sessionDates.length > 0) {
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    // Streak counts if practiced today or yesterday
    if (sessionDates[0] === todayStr || sessionDates[0] === yesterdayStr) {
      streak = 1;
      let checkDate = new Date(sessionDates[0]);
      for (let i = 1; i < sessionDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expected = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (sessionDates[i] === expected) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // Calculate average mastery score
  const masteryValues = revisionRecords.map((r) => r.masteryScore).filter((v) => typeof v === 'number');
  const averageMastery = masteryValues.length > 0 ? Math.round(masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length) : 0;

  return {
    pendingTopicsCount: pendingTopics.length,
    estimatedRemainingMinutes,
    completedTopicsCount: completedTopics.length,
    studyStreakDays: streak,
    dueSoonTopicsCount: dueSoonTopics.length,
    averageMastery,
    totalStudySessionsCount: sessions.length,
    unreadScreenshotsCount: unreadScreenshots.length,
  };
}

// -------------------------------------------------------------
// INITIAL SEED DATA (For seamless onboarding when database is empty)
// -------------------------------------------------------------

export async function seedInitialDataIfEmpty(): Promise<boolean> {
  const topics = await getAllTopics();
  if (topics.length > 0) return false;

  const now = new Date();
  const d1 = new Date();
  d1.setDate(now.getDate() + 2);
  const d2 = new Date();
  d2.setDate(now.getDate() + 4);

  const initialTopics: Topic[] = [
    {
      id: 'topic-java-arrays',
      title: 'Java Arrays & Memory Allocation',
      subject: 'Computer Science',
      description: 'Understanding contiguous memory layout, index out of bounds exceptions, and 2D arrays in Java.',
      learningObjectives: ['Master array declaration & initialization', 'Analyze O(1) random access', 'Trace 2D grid matrix indexing'],
      priority: 'high',
      estimatedMinutes: 25,
      dueDate: d1.toISOString().split('T')[0],
      status: 'in_progress',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      tags: ['Java', 'Data Structures', 'Memory'],
      masteryScore: 40,
    },
    {
      id: 'topic-linear-algebra',
      title: 'Matrix Multiplication & Eigenvalues',
      subject: 'Mathematics',
      description: 'Geometric interpretation of linear transformations, dot products, and finding characteristic polynomials.',
      learningObjectives: ['Understand row-column multiplication conditions', 'Calculate 2x2 determinants & eigenvalues'],
      priority: 'urgent',
      estimatedMinutes: 30,
      dueDate: d1.toISOString().split('T')[0],
      status: 'not_started',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      tags: ['Math', 'Linear Algebra', 'Exam Prep'],
      masteryScore: 20,
    },
    {
      id: 'topic-db-indexing',
      title: 'B-Tree Indexing in Relational Databases',
      subject: 'Databases',
      description: 'How B-Trees reduce disk I/O compared to sequential table scans and why index selectivity matters.',
      learningObjectives: ['Compare clustered vs secondary indexes', 'Analyze query execution plans (EXPLAIN)'],
      priority: 'medium',
      estimatedMinutes: 20,
      dueDate: d2.toISOString().split('T')[0],
      status: 'not_started',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      tags: ['SQL', 'Databases', 'Performance'],
      masteryScore: 0,
    },
    {
      id: 'topic-recursion',
      title: 'Recursive Call Stacks & Base Cases',
      subject: 'Computer Science',
      description: 'Visualization of activation records on the call stack and avoiding StackOverflowError.',
      learningObjectives: ['Identify recursive base cases', 'Trace factorial and Fibonacci call trees'],
      priority: 'low',
      estimatedMinutes: 15,
      status: 'completed',
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      tags: ['Algorithms', 'Recursion'],
      masteryScore: 85,
    },
  ];

  for (const t of initialTopics) {
    await saveTopic(t);
  }

  // Create initial revision record for the completed recursion topic
  await saveRevisionRecord({
    id: 'rev-recursion',
    topicId: 'topic-recursion',
    topicTitle: 'Recursive Call Stacks & Base Cases',
    subject: 'Computer Science',
    lastRevisionDate: new Date(Date.now() - 86400000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    reviewCount: 2,
    consecutiveCorrect: 2,
    confidenceRating: 4,
    masteryScore: 85,
    history: [
      { date: new Date(Date.now() - 86400000 * 2).toISOString(), score: 75, confidence: 3 },
      { date: new Date(Date.now() - 86400000).toISOString(), score: 95, confidence: 5 },
    ],
  });

  return true;
}
