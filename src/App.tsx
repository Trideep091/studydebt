import React, { useState, useEffect, useCallback } from 'react';
import { Shell } from './components/layout/Shell';
import type { NavigationTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { BacklogManager } from './components/backlog/BacklogManager';
import { TopicModal } from './components/backlog/TopicModal';
import { TopicDetailModal } from './components/backlog/TopicDetailModal';
import { ScreenshotVault } from './components/screenshots/ScreenshotVault';
import { FocusSessionView } from './components/study/FocusSessionView';
import { StudySessionSetupModal } from './components/study/StudySessionSetupModal';
import { SessionSummaryModal } from './components/study/SessionSummaryModal';
import { WeeklyPlannerView } from './components/planner/WeeklyPlannerView';
import { RevisionQueueView } from './components/revision/RevisionQueueView';
import { BacklogDebtTracker } from './components/progress/BacklogDebtTracker';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer, type ToastMessage } from './components/ui/NotificationToast';

import type {
  Topic,
  Screenshot,
  StudySession,
  WeeklyPlan,
  RevisionRecord,
  UserSettings,
  StudyStats,
  EnergyLevel,
  SessionMode,
} from './types';

import {
  getAllTopics,
  getAllScreenshots,
  getAllSessions,
  getAllRevisionRecords,
  getLatestWeeklyPlan,
  getUserSettings,
  saveTopic,
  deleteTopic,
  saveScreenshot,
  deleteScreenshot,
  saveSession,
  saveRevisionRecord,
  saveWeeklyPlan,
  saveUserSettings,
  computeStudyStats,
  seedInitialDataIfEmpty,
} from './services/db/indexedDb';
import { calculateNextRevision } from './services/scheduler/spacedRepetition';
import { setApiBaseUrl } from './services/ai/client';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  // Core Data
  const [topics, setTopics] = useState<Topic[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [revisionRecords, setRevisionRecords] = useState<RevisionRecord[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    studentName: '',
    aiEndpointUrl:
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      (import.meta.env.DEV ? 'http://localhost:8000' : ''),
    aiModel: 'open-weight-default',
    dailyStudyTargetMinutes: 45,
    allowRemoteInference: false,
  });
  const [stats, setStats] = useState<StudyStats>({
    pendingTopicsCount: 0,
    estimatedRemainingMinutes: 0,
    completedTopicsCount: 0,
    studyStreakDays: 0,
    dueSoonTopicsCount: 0,
    averageMastery: 0,
    totalStudySessionsCount: 0,
    unreadScreenshotsCount: 0,
  });

  // Modal & Flow States
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [selectedDetailTopic, setSelectedDetailTopic] = useState<Topic | null>(null);

  const [isStudySetupModalOpen, setIsStudySetupModalOpen] = useState(false);
  const [studySetupTopic, setStudySetupTopic] = useState<Topic | null>(null);
  const [studySetupScreenshot, setStudySetupScreenshot] = useState<Screenshot | null>(null);
  const [studySetupMinutes, setStudySetupMinutes] = useState(10);

  // Active Focus Session
  const [activeSessionConfig, setActiveSessionConfig] = useState<{
    topic?: Topic;
    screenshot?: Screenshot;
    durationMinutes: number;
    energyLevel: EnergyLevel;
    mode: SessionMode;
  } | null>(null);

  const [completedSession, setCompletedSession] = useState<StudySession | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((msg: { type: 'success' | 'error' | 'info'; title?: string; message: string }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { ...msg, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load and refresh all data
  const refreshData = useCallback(async () => {
    try {
      const [allTopics, allScreenshots, allSessions, allRevisions, currentPlan, settings, computedStats] =
        await Promise.all([
          getAllTopics(),
          getAllScreenshots(),
          getAllSessions(),
          getAllRevisionRecords(),
          getLatestWeeklyPlan(),
          getUserSettings(),
          computeStudyStats(),
        ]);

      setTopics(allTopics);
      setScreenshots(allScreenshots);
      setSessions(allSessions);
      setRevisionRecords(allRevisions);
      setWeeklyPlan(currentPlan || null);
      setUserSettings(settings);
      if (settings?.aiEndpointUrl !== undefined) {
        setApiBaseUrl(settings.aiEndpointUrl);
      }
      setStats(computedStats);
    } catch (err) {
      console.error('Failed to load local data', err);
    }
  }, []);

  // Initialize DB on mount
  useEffect(() => {
    async function init() {
      await seedInitialDataIfEmpty();
      await refreshData();
      setIsInitializing(false);
    }
    init();
  }, [refreshData]);

  // Topic Handlers
  const handleSaveTopic = async (topic: Topic) => {
    await saveTopic(topic);
    await refreshData();
    showToast({
      type: 'success',
      title: 'Topic Saved',
      message: `"${topic.title}" has been updated in your backlog.`,
    });
  };

  const handleDeleteTopic = async (id: string) => {
    const topic = topics.find((t) => t.id === id);
    if (window.confirm(`Delete "${topic?.title || 'topic'}" from your backlog?`)) {
      await deleteTopic(id);
      await refreshData();
      showToast({
        type: 'info',
        message: 'Topic removed from backlog.',
      });
    }
  };

  const handleToggleTopicStatus = async (topic: Topic) => {
    const newStatus = topic.status === 'completed' ? 'in_progress' : 'completed';
    const updated: Topic = {
      ...topic,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
      masteryScore: newStatus === 'completed' ? Math.max(topic.masteryScore || 0, 80) : topic.masteryScore,
    };
    await saveTopic(updated);
    await refreshData();
    showToast({
      type: 'success',
      message: `Marked "${topic.title}" as ${newStatus === 'completed' ? 'completed' : 'in progress'}.`,
    });
  };

  // Screenshot Handlers
  const handleSaveScreenshot = async (screenshot: Screenshot) => {
    await saveScreenshot(screenshot);
    await refreshData();
    showToast({
      type: 'success',
      title: 'Screenshot Vault Updated',
      message: `Saved "${screenshot.title}" with generated Smart Overview.`,
    });
  };

  const handleDeleteScreenshot = async (id: string) => {
    await deleteScreenshot(id);
    await refreshData();
    showToast({
      type: 'info',
      message: 'Screenshot deleted from vault.',
    });
  };

  const handleConvertScreenshotToTopic = async (screenshot: Screenshot) => {
    const newTopic: Topic = {
      id: `topic-from-${screenshot.id}`,
      title: screenshot.overview?.title || screenshot.title,
      subject: screenshot.subject || 'Study Notes',
      description: screenshot.overview?.gist || 'Converted from educational screenshot.',
      learningObjectives: screenshot.overview?.mainConcepts || [],
      priority: 'medium',
      estimatedMinutes: screenshot.estimatedMinutes || 20,
      status: 'not_started',
      createdAt: new Date().toISOString(),
      tags: screenshot.tags || [],
      screenshotIds: [screenshot.id],
    };

    await saveTopic(newTopic);
    const updatedScreen: Screenshot = { ...screenshot, linkedTopicId: newTopic.id };
    await saveScreenshot(updatedScreen);
    await refreshData();

    showToast({
      type: 'success',
      title: 'Backlog Topic Created',
      message: `Converted "${newTopic.title}" into an active backlog topic!`,
    });
  };

  // Study Session Launchers
  const handleStartTopicSession = (topic: Topic, minutes: number = 10) => {
    setStudySetupTopic(topic);
    setStudySetupScreenshot(null);
    setStudySetupMinutes(minutes);
    setIsStudySetupModalOpen(true);
  };

  const handleStartScreenshotReview = (screenshot: Screenshot, minutes: number = 10) => {
    setStudySetupTopic(null);
    setStudySetupScreenshot(screenshot);
    setStudySetupMinutes(minutes);
    setIsStudySetupModalOpen(true);
  };

  const handleLaunchSession = (config: {
    topic?: Topic;
    screenshot?: Screenshot;
    durationMinutes: number;
    energyLevel: EnergyLevel;
    mode: SessionMode;
  }) => {
    setActiveSessionConfig(config);
  };

  // Finish Study Session
  const handleFinishFocusSession = async (session: StudySession) => {
    await saveSession(session);

    // If attached to a topic, update topic status and spaced repetition
    if (session.topicId) {
      const topic = topics.find((t) => t.id === session.topicId);
      if (topic) {
        const existingRev = revisionRecords.find((r) => r.topicId === topic.id);
        const updatedRev = calculateNextRevision(existingRev, topic, session);
        await saveRevisionRecord(updatedRev);

        const updatedTopic: Topic = {
          ...topic,
          status: 'completed',
          completedAt: new Date().toISOString(),
          masteryScore: updatedRev.masteryScore,
        };
        await saveTopic(updatedTopic);
      }
    }

    // If attached to screenshot, mark as read
    if (session.screenshotId) {
      const screen = screenshots.find((s) => s.id === session.screenshotId);
      if (screen) {
        await saveScreenshot({ ...screen, isRead: true });
      }
    }

    await refreshData();
    setActiveSessionConfig(null);
    setCompletedSession(session);
  };

  // Reset database handler
  const handleResetDatabase = async () => {
    const indexedDB = window.indexedDB;
    if (indexedDB) {
      indexedDB.deleteDatabase('studydebt_db');
    }
  };

  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          color: 'var(--text-primary)',
          gap: '1rem',
        }}
      >
        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>StudyDebt</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Initializing your liquid-glass study environment...
        </div>
      </div>
    );
  }

  // Active Focus Session Full View Mode
  if (activeSessionConfig) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', background: 'var(--bg-base)' }}>
        <FocusSessionView
          topic={activeSessionConfig.topic}
          screenshot={activeSessionConfig.screenshot}
          durationMinutes={activeSessionConfig.durationMinutes}
          energyLevel={activeSessionConfig.energyLevel}
          mode={activeSessionConfig.mode}
          onFinishSession={handleFinishFocusSession}
          onExit={() => setActiveSessionConfig(null)}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <Shell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onStartQuickStudy={() => {
        setStudySetupTopic(null);
        setStudySetupScreenshot(null);
        setStudySetupMinutes(10);
        setIsStudySetupModalOpen(true);
      }}
      onOpenAddTopic={() => {
        setEditingTopic(null);
        setIsTopicModalOpen(true);
      }}
      unreadScreenshotsCount={stats.unreadScreenshotsCount}
      pendingTopicsCount={stats.pendingTopicsCount}
      dueSoonCount={stats.dueSoonTopicsCount}
      streakDays={stats.studyStreakDays}
      remainingMinutes={stats.estimatedRemainingMinutes}
    >
      {/* 1. Dashboard View */}
      {activeTab === 'dashboard' && (
        <DashboardView
          studentName={userSettings.studentName}
          stats={stats}
          topics={topics}
          screenshots={screenshots}
          onStartQuickStudy={() => {
            setStudySetupTopic(null);
            setStudySetupScreenshot(null);
            setStudySetupMinutes(10);
            setIsStudySetupModalOpen(true);
          }}
          onUploadScreenshot={() => setActiveTab('screenshots')}
          onPlanWeek={() => setActiveTab('planner')}
          onAddTopic={() => {
            setEditingTopic(null);
            setIsTopicModalOpen(true);
          }}
          onToggleTopicStatus={handleToggleTopicStatus}
          onStartSession={handleStartTopicSession}
          onStartScreenshotReview={handleStartScreenshotReview}
          onEditTopic={(t) => {
            setEditingTopic(t);
            setIsTopicModalOpen(true);
          }}
          onDeleteTopic={handleDeleteTopic}
          onSelectTopic={(t) => setSelectedDetailTopic(t)}
          onViewAllTopics={() => setActiveTab('backlog')}
          onConvertScreenshotToTopic={handleConvertScreenshotToTopic}
        />
      )}

      {/* 2. My Screenshots View */}
      {activeTab === 'screenshots' && (
        <ScreenshotVault
          screenshots={screenshots}
          onSaveScreenshot={handleSaveScreenshot}
          onDeleteScreenshot={handleDeleteScreenshot}
          onStartReview={handleStartScreenshotReview}
          onConvertToTopic={handleConvertScreenshotToTopic}
        />
      )}

      {/* 3. Backlog View */}
      {activeTab === 'backlog' && (
        <BacklogManager
          topics={topics}
          onToggleStatus={handleToggleTopicStatus}
          onStartStudy={handleStartTopicSession}
          onEditTopic={(t) => {
            setEditingTopic(t);
            setIsTopicModalOpen(true);
          }}
          onDeleteTopic={handleDeleteTopic}
          onSelectTopic={(t) => setSelectedDetailTopic(t)}
          onOpenAddModal={() => {
            setEditingTopic(null);
            setIsTopicModalOpen(true);
          }}
        />
      )}

      {/* 4. Weekly Planner View */}
      {activeTab === 'planner' && (
        <WeeklyPlannerView
          currentPlan={weeklyPlan}
          onSavePlan={async (plan) => {
            await saveWeeklyPlan(plan);
            await refreshData();
            showToast({
              type: 'success',
              title: 'Study Plan Updated',
              message: 'Your weekly tasks and daily time budgets have been saved.',
            });
          }}
        />
      )}

      {/* 5. Revision Queue View */}
      {activeTab === 'revision' && (
        <RevisionQueueView
          records={revisionRecords}
          topics={topics}
          onStartRevision={handleStartTopicSession}
        />
      )}

      {/* 6. Backlog Debt Progress View */}
      {activeTab === 'progress' && (
        <BacklogDebtTracker
          stats={stats}
          topics={topics}
          sessions={sessions}
          revisionRecords={revisionRecords}
        />
      )}

      {/* 7. Settings View */}
      {activeTab === 'settings' && (
        <SettingsView
          settings={userSettings}
          onSaveSettings={async (newSet) => {
            await saveUserSettings(newSet);
            await refreshData();
          }}
          onDataReset={handleResetDatabase}
          onShowToast={showToast}
        />
      )}

      {/* Add / Edit Topic Modal */}
      <TopicModal
        isOpen={isTopicModalOpen}
        onClose={() => {
          setIsTopicModalOpen(false);
          setEditingTopic(null);
        }}
        onSave={handleSaveTopic}
        initialTopic={editingTopic}
      />

      {/* Topic Detail Modal */}
      <TopicDetailModal
        topic={selectedDetailTopic}
        isOpen={Boolean(selectedDetailTopic)}
        onClose={() => setSelectedDetailTopic(null)}
        onEdit={(t) => {
          setSelectedDetailTopic(null);
          setEditingTopic(t);
          setIsTopicModalOpen(true);
        }}
        onStartStudy={(t) => {
          setSelectedDetailTopic(null);
          handleStartTopicSession(t);
        }}
        linkedScreenshots={screenshots.filter((s) => s.linkedTopicId === selectedDetailTopic?.id)}
      />

      {/* Study Session Setup Modal */}
      <StudySessionSetupModal
        isOpen={isStudySetupModalOpen}
        onClose={() => setIsStudySetupModalOpen(false)}
        onLaunchSession={handleLaunchSession}
        topics={topics}
        screenshots={screenshots}
        initialTopic={studySetupTopic}
        initialScreenshot={studySetupScreenshot}
        defaultMinutes={studySetupMinutes}
      />

      {/* Session Summary Modal */}
      <SessionSummaryModal
        session={completedSession}
        isOpen={Boolean(completedSession)}
        onClose={() => setCompletedSession(null)}
        onContinueNext={() => {
          setCompletedSession(null);
          // Pick next small win or open quick study
          const next = topics.find((t) => t.status !== 'completed');
          if (next) {
            handleStartTopicSession(next, 10);
          } else {
            setActiveTab('dashboard');
          }
        }}
      />

      {/* Notification Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </Shell>
  );
}

export default App;
