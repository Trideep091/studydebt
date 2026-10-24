import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Cpu,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { UserSettings } from '../../types';
import { checkAIHealth, type AIHealthStatus } from '../../services/ai/client';
import {
  getAllTopics,
  getAllScreenshots,
  getAllSessions,
  getAllTasks,
  getAllRevisionRecords,
  getLatestWeeklyPlan,
  saveTopic,
  saveScreenshot,
  saveSession,
  saveTask,
  saveRevisionRecord,
  saveWeeklyPlan,
} from '../../services/db/indexedDb';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (settings: Partial<UserSettings>) => Promise<void>;
  onDataReset: () => Promise<void>;
  onShowToast: (msg: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onDataReset,
  onShowToast,
}) => {
  const defaultEndpoint =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:8000' : '');
  const [studentName, setStudentName] = useState(settings.studentName || '');
  const [endpointUrl, setEndpointUrl] = useState(settings.aiEndpointUrl ?? defaultEndpoint);
  const [model, setModel] = useState(settings.aiModel || 'open-weight-default');
  const [dailyTarget, setDailyTarget] = useState(settings.dailyStudyTargetMinutes || 45);
  const [allowRemote, setAllowRemote] = useState(settings.allowRemoteInference || false);

  const [healthStatus, setHealthStatus] = useState<AIHealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCheckConnection = async (targetUrl?: string | unknown) => {
    setIsCheckingHealth(true);
    try {
      const urlToTest = typeof targetUrl === 'string' ? targetUrl : endpointUrl;
      const res = await checkAIHealth(urlToTest);
      setHealthStatus(res);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    handleCheckConnection(settings.aiEndpointUrl ?? defaultEndpoint);
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        studentName: studentName.trim(),
        aiEndpointUrl: endpointUrl.trim(),
        aiModel: model.trim(),
        dailyStudyTargetMinutes: Number(dailyTarget),
        allowRemoteInference: allowRemote,
      });
      onShowToast({ type: 'success', message: 'Preferences saved successfully.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Export full JSON backup
  const handleExportData = async () => {
    try {
      const [topics, screenshots, sessions, tasks, revisions, plan] = await Promise.all([
        getAllTopics(),
        getAllScreenshots(),
        getAllSessions(),
        getAllTasks(),
        getAllRevisionRecords(),
        getLatestWeeklyPlan(),
      ]);

      const backup = {
        exportDate: new Date().toISOString(),
        version: 1,
        topics,
        screenshots,
        sessions,
        tasks,
        revisions,
        plan,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studydebt-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      onShowToast({ type: 'success', message: 'Study records exported to JSON successfully.' });
    } catch (err) {
      onShowToast({ type: 'error', message: 'Failed to export backup.' });
    }
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.topics && Array.isArray(data.topics)) {
          for (const t of data.topics) await saveTopic(t);
        }
        if (data.screenshots && Array.isArray(data.screenshots)) {
          for (const s of data.screenshots) await saveScreenshot(s);
        }
        if (data.sessions && Array.isArray(data.sessions)) {
          for (const s of data.sessions) await saveSession(s);
        }
        if (data.revisions && Array.isArray(data.revisions)) {
          for (const r of data.revisions) await saveRevisionRecord(r);
        }
        if (data.plan) {
          await saveWeeklyPlan(data.plan);
        }

        onShowToast({ type: 'success', message: 'Data restored successfully from backup.' });
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        onShowToast({ type: 'error', message: 'Invalid backup file format.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Settings & Privacy</h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Configure inference runtimes, manage your local study data, and review privacy controls.
        </p>
      </div>

      {/* AI Inference Runtime Card */}
      <GlassCard glow="lavender" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Cpu size={22} color="var(--accent-lavender)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Open-Weight AI Inference</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Modular runtime configured via backend environment or local endpoints
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {healthStatus && (
              <Badge variant={healthStatus.isConnected ? 'mint' : 'coral'}>
                {healthStatus.status.toUpperCase()}
              </Badge>
            )}
            <Button
              variant="glass"
              size="sm"
              onClick={handleCheckConnection}
              isLoading={isCheckingHealth}
              icon={<RotateCw size={14} />}
            >
              Test Connection
            </Button>
          </div>
        </div>

        {/* Health status diagnostics message */}
        {healthStatus && (
          <div
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: healthStatus.isConnected ? 'rgba(134, 239, 172, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${healthStatus.isConnected ? 'rgba(134, 239, 172, 0.25)' : 'var(--glass-border)'}`,
              fontSize: '0.86rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
            }}
          >
            {healthStatus.isConnected ? (
              <CheckCircle2 size={17} color="var(--accent-mint)" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertCircle size={17} color="var(--accent-lavender)" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <div><strong>Runtime Endpoint: </strong>{healthStatus.endpoint}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                {healthStatus.details || `Provider: ${healthStatus.provider} | Model: ${healthStatus.model}`}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Your Name (Optional Personalized Greeting)
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Alex"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Backend API URL
              </label>
              <input
                type="text"
                className="input"
                placeholder={defaultEndpoint || "https://api.your-backend.com"}
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Daily Study Target (Minutes)
              </label>
              <input
                type="number"
                className="input"
                min="10"
                max="240"
                step="5"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="primary" type="submit" isLoading={isSaving}>
              Save Preferences
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Data Management & Backups */}
      <GlassCard style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Data Backup & Portability
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          All your topics, screenshots, study sessions, and revision records are stored in browser-side
          IndexedDB. You can export or restore a complete JSON backup at any time.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={handleExportData}
            icon={<Download size={16} />}
          >
            Export All Study Data (JSON)
          </Button>

          <label className="btn btn-glass" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportData}
            />
          </label>

          <Button
            variant="danger"
            onClick={async () => {
              if (
                window.confirm(
                  'Are you sure you want to reset all study debt records? This will clear all local topics, screenshots, and progress.'
                )
              ) {
                await onDataReset();
                onShowToast({ type: 'info', message: 'All local study records have been reset.' });
                setTimeout(() => window.location.reload(), 600);
              }
            }}
            icon={<Trash2 size={16} />}
          >
            Reset Database
          </Button>
        </div>
      </GlassCard>

      {/* Privacy Notice */}
      <GlassCard
        style={{
          padding: '1.5rem',
          background: 'rgba(8, 11, 24, 0.45)',
          border: '1px solid var(--glass-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-mint)', marginBottom: '0.6rem' }}>
          <ShieldCheck size={20} />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Local-First Privacy Architecture</h4>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          StudyDebt does not embed private API tokens into browser client code or send study screenshots
          to unauthorized third-party trackers. All learning materials are retained within your local browser
          IndexedDB database. Inference runs against your configured local Ollama instance or authorized endpoint.
        </p>
      </GlassCard>
    </div>
  );
};
