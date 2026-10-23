export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TopicStatus = 'not_started' | 'in_progress' | 'completed';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type SessionMode = 'understand' | 'practice' | 'revise' | 'catchup';
export type TaskStatus = 'pending' | 'completed' | 'missed' | 'blocked';
export type PlanWindow = '2_days' | '3_days' | '7_days' | 'custom';

export interface Topic {
  id: string;
  title: string;
  subject: string;
  description?: string;
  learningObjectives?: string[];
  priority: Priority;
  estimatedMinutes: number;
  dueDate?: string; // YYYY-MM-DD
  status: TopicStatus;
  completedAt?: string;
  createdAt: string;
  tags: string[];
  screenshotIds?: string[];
  masteryScore?: number; // 0-100
}

export interface DefinitionItem {
  term: string;
  explanation: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface SmartOverview {
  title: string;
  gist: string;
  mainConcepts: string[];
  definitionsAndFormulas: DefinitionItem[];
  keyTakeaways: string[];
  actionItems: string[];
  knowledgeCheck: QuizQuestion;
  tags: string[];
  estimatedMinutes: number;
  sourceExtractedText?: string;
  isOcrComplete: boolean;
}

export interface Screenshot {
  id: string;
  title: string;
  imageData: string; // Data URL or object URL reference
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  isRead: boolean;
  estimatedMinutes: number;
  subject?: string;
  tags: string[];
  overview?: SmartOverview;
  linkedTopicId?: string;
}

export interface MicroLearningContent {
  objective: string;
  explanation: string;
  example: string;
  practiceQuestion: QuizQuestion;
  knowledgeCheck: QuizQuestion;
}

export interface StudySession {
  id: string;
  topicId?: string;
  screenshotId?: string;
  title: string;
  durationMinutes: number; // 5, 10, 15, 25
  actualSecondsSpent: number;
  energyLevel: EnergyLevel;
  mode: SessionMode;
  content: MicroLearningContent;
  userAnswerIndex?: number;
  isCorrect?: boolean;
  confidenceRating?: number; // 1 to 5
  completedAt: string;
}

export interface WeeklyTask {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  priority: Priority;
  status: TaskStatus;
  linkedTopicId?: string;
  notes?: string;
}

export interface WeeklyPlan {
  id: string;
  generatedAt: string;
  targetWindow: PlanWindow;
  startDate: string;
  endDate: string;
  dailyCapacityMinutes: Record<string, number>; // date -> minutes
  tasks: WeeklyTask[];
  originalPrompt?: string;
}

export interface RevisionRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  subject: string;
  lastRevisionDate: string;
  nextRevisionDate: string;
  reviewCount: number;
  consecutiveCorrect: number;
  confidenceRating: number;
  masteryScore: number; // 0-100
  history: { date: string; score: number; confidence: number }[];
}

export interface UserSettings {
  studentName?: string;
  aiEndpointUrl: string;
  aiModel: string;
  dailyStudyTargetMinutes: number;
  allowRemoteInference: boolean;
}

export interface StudyStats {
  pendingTopicsCount: number;
  estimatedRemainingMinutes: number;
  completedTopicsCount: number;
  studyStreakDays: number;
  dueSoonTopicsCount: number;
  averageMastery: number;
  totalStudySessionsCount: number;
  unreadScreenshotsCount: number;
}
