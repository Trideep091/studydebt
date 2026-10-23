import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Search,
  Filter,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
  Play,
  Trash2,
  Sparkles,
  Clock,
  ArrowRight,
  Loader2,
  Plus,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ScreenshotDetailModal } from './ScreenshotDetailModal';
import type { Screenshot, Topic } from '../../types';
import { summarizeScreenshot } from '../../services/ai/client';

interface ScreenshotVaultProps {
  screenshots: Screenshot[];
  onSaveScreenshot: (screenshot: Screenshot) => Promise<void>;
  onDeleteScreenshot: (id: string) => Promise<void>;
  onStartReview: (screenshot: Screenshot, minutes?: number) => void;
  onConvertToTopic: (screenshot: Screenshot) => void;
}

export const ScreenshotVault: React.FC<ScreenshotVaultProps> = ({
  screenshots,
  onSaveScreenshot,
  onDeleteScreenshot,
  onStartReview,
  onConvertToTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [activeScreenshot, setActiveScreenshot] = useState<Screenshot | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique subjects
  const subjects = Array.from(
    new Set(screenshots.map((s) => s.subject).filter(Boolean))
  ) as string[];

  // Process image files
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setUploadProgress(`Processing ${files.length} screenshot${files.length > 1 ? 's' : ''}...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      setUploadProgress(`Analyzing (${i + 1}/${files.length}): ${file.name}`);

      try {
        const base64Data = await readFileAsDataUrl(file);
        
        // Formulate reasonable extracted text preview or title from file name
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const promptText = `Educational screenshot: ${cleanName}. Notes and visual diagram captured from lecture or documentation.`;

        // Request Smart Overview from AI engine
        const overview = await summarizeScreenshot(promptText, 'Study Screenshot', 10);

        const newScreenshot: Screenshot = {
          id: `screen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: overview.title || cleanName,
          imageData: base64Data,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          createdAt: new Date().toISOString(),
          isRead: false,
          estimatedMinutes: overview.estimatedMinutes || 10,
          subject: overview.tags?.[0] || 'General',
          tags: overview.tags || ['Screenshot'],
          overview,
        };

        await onSaveScreenshot(newScreenshot);
      } catch (err) {
        console.error('Failed to process image', err);
      }
    }

    setIsProcessing(false);
    setUploadProgress('');
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleToggleRead = async (id: string, isRead: boolean) => {
    const target = screenshots.find((s) => s.id === id);
    if (target) {
      const updated = { ...target, isRead };
      await onSaveScreenshot(updated);
      if (activeScreenshot?.id === id) {
        setActiveScreenshot(updated);
      }
    }
  };

  const handleRegenerateOverview = async (screenshot: Screenshot) => {
    const promptText = `Educational screenshot notes: ${screenshot.title}. ${screenshot.fileName}`;
    const newOverview = await summarizeScreenshot(promptText, screenshot.subject, 10);
    const updated = { ...screenshot, overview: newOverview };
    await onSaveScreenshot(updated);
    setActiveScreenshot(updated);
  };

  // Filtered screenshots
  const filteredScreenshots = screenshots.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchGist = (s.overview?.gist || '').toLowerCase().includes(q);
      const matchTags = (s.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchGist && !matchTags) return false;
    }

    if (filterRead === 'unread' && s.isRead) return false;
    if (filterRead === 'read' && !s.isRead) return false;

    if (selectedSubject !== 'all' && s.subject !== selectedSubject) return false;

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800 }}>My Screenshots</h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Transform forgotten educational screenshots and lecture slides into a searchable,
          understandable learning vault.
        </p>
      </div>

      {/* Drag & Drop Upload Glass Panel */}
      <GlassCard
        glow={isDragging ? 'cyan' : 'lavender'}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          border: isDragging ? '2px dashed var(--accent-cyan)' : '2px dashed var(--glass-border-hover)',
          background: isDragging
            ? 'rgba(103, 232, 249, 0.08)'
            : 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(167, 139, 250, 0.08), transparent), rgba(15, 23, 42, 0.6)',
          cursor: 'pointer',
          transition: 'all var(--transition-normal)',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(167, 139, 250, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(167, 139, 250, 0.3)',
            }}
          >
            {isProcessing ? (
              <Loader2 size={26} color="var(--accent-cyan)" className="animate-spin" />
            ) : (
              <UploadCloud size={28} color="var(--accent-lavender)" />
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.3rem' }}>
              {isProcessing ? uploadProgress : 'Drop educational screenshots here'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Supports PNG, JPG, JPEG, and WebP. Automatically generates Smart Overviews, key concepts & practice questions.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            disabled={isProcessing}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            icon={<UploadCloud size={16} />}
          >
            Select Screenshots
          </Button>
        </div>
      </GlassCard>

      {/* Filter and Search Bar */}
      <GlassCard style={{ padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={16}
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
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search screenshot titles, concepts, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Read / Unread Filter */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['all', 'unread', 'read'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterRead(mode)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: filterRead === mode ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                  background: filterRead === mode ? 'rgba(103, 232, 249, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: filterRead === mode ? '#A5F3FC' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {mode === 'all' ? 'All' : mode === 'unread' ? 'Unread' : 'Read'}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          {subjects.length > 0 && (
            <div>
              <select
                className="select"
                style={{ width: 'auto' }}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Screenshot Grid */}
      {filteredScreenshots.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredScreenshots.map((item) => (
            <GlassCard
              key={item.id}
              interactive
              glow={item.isRead ? 'none' : 'lavender'}
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                opacity: item.isRead ? 0.75 : 1,
              }}
            >
              {/* Thumbnail */}
              <div
                onClick={() => setActiveScreenshot(item)}
                style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: 'var(--radius-md)',
                  background: '#04060E',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--glass-border)',
                  position: 'relative',
                }}
              >
                <img
                  src={item.imageData}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {!item.isRead && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(167, 139, 250, 0.9)',
                      color: '#080B18',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    Unread
                  </div>
                )}
              </div>

              {/* Title & Gist */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Badge variant="cyan">{item.subject || 'Screenshot'}</Badge>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {item.estimatedMinutes} min
                  </span>
                </div>

                <h4
                  onClick={() => setActiveScreenshot(item)}
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: item.isRead ? 'var(--text-secondary)' : '#FFFFFF',
                    marginBottom: '0.35rem',
                  }}
                >
                  {item.title}
                </h4>

                {item.overview?.gist && (
                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.overview.gist}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--glass-border-subtle)',
                }}
              >
                <button
                  onClick={() => handleToggleRead(item.id, !item.isRead)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    padding: '0.35rem 0.5rem',
                    color: item.isRead ? 'var(--accent-mint)' : 'var(--text-secondary)',
                  }}
                >
                  {item.isRead ? (
                    <>
                      <CheckCircle2 size={15} color="var(--accent-mint)" />
                      <span>Read</span>
                    </>
                  ) : (
                    <>
                      <Circle size={15} />
                      <span>Mark Read</span>
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveScreenshot(item)}
                  >
                    Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onStartReview(item)}
                    icon={<Play size={13} fill="#080B18" />}
                  >
                    Review
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon size={26} color="var(--accent-cyan)" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>
              No Screenshots Found
            </h3>
            <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.88rem' }}>
              Upload your first lecture screenshot above to turn visual notes into active study material.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Screenshot Detail Modal */}
      <ScreenshotDetailModal
        screenshot={activeScreenshot}
        isOpen={Boolean(activeScreenshot)}
        onClose={() => setActiveScreenshot(null)}
        onToggleRead={handleToggleRead}
        onDelete={onDeleteScreenshot}
        onStartReview={(s) => onStartReview(s)}
        onConvertToTopic={onConvertToTopic}
        onRegenerateOverview={handleRegenerateOverview}
      />
    </div>
  );
};
