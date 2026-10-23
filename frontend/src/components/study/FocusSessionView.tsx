import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Volume2,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import type { Topic, Screenshot, StudySession, MicroLearningContent, EnergyLevel, SessionMode } from '../../types';
import { generateMicroStudy } from '../../services/ai/client';

interface FocusSessionViewProps {
  topic?: Topic;
  screenshot?: Screenshot;
  durationMinutes: number;
  energyLevel: EnergyLevel;
  mode: SessionMode;
  onFinishSession: (session: StudySession) => void;
  onExit: () => void;
}

export const FocusSessionView: React.FC<FocusSessionViewProps> = ({
  topic,
  screenshot,
  durationMinutes,
  energyLevel,
  mode,
  onFinishSession,
  onExit,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Concept, 2: Example, 3: Practice, 4: Knowledge Check, 5: Completed
  const [content, setContent] = useState<MicroLearningContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimpler, setIsSimpler] = useState(false);

  // Quiz state
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null);
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);

  const [finalAnswer, setFinalAnswer] = useState<number | null>(null);
  const [finalSubmitted, setFinalSubmitted] = useState(false);

  const [confidence, setConfidence] = useState<number>(4);

  const title = topic?.title || screenshot?.title || 'Focused Study Session';
  const subject = topic?.subject || screenshot?.subject || 'Academics';

  // Fetch or generate session content
  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      setIsLoading(true);
      const res = await generateMicroStudy(
        title,
        subject,
        durationMinutes,
        energyLevel,
        mode,
        topic?.description || screenshot?.overview?.gist || '',
        topic?.learningObjectives || []
      );
      if (isMounted) {
        setContent(res);
        setIsLoading(false);
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, [title, subject, durationMinutes, energyLevel, mode]);

  // Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (isActive && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, secondsRemaining]);

  const totalSeconds = durationMinutes * 60;
  const elapsedSeconds = totalSeconds - secondsRemaining;
  const minutesDisplay = Math.floor(secondsRemaining / 60);
  const secondsDisplay = String(secondsRemaining % 60).padStart(2, '0');

  const handleComplete = () => {
    if (!content) return;
    const isCorrect = finalAnswer === content.knowledgeCheck.answerIndex;

    const session: StudySession = {
      id: `session-${Date.now()}`,
      topicId: topic?.id,
      screenshotId: screenshot?.id,
      title,
      durationMinutes,
      actualSecondsSpent: elapsedSeconds,
      energyLevel,
      mode,
      content,
      userAnswerIndex: finalAnswer !== null ? finalAnswer : undefined,
      isCorrect,
      confidenceRating: confidence,
      completedAt: new Date().toISOString(),
    };

    onFinishSession(session);
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(167, 139, 250, 0.15)',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px var(--accent-lavender-glow)',
          }}
        >
          <Sparkles size={32} color="var(--accent-lavender)" style={{ animation: 'pulseSubtle 1.5s infinite' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>
            Preparing your {durationMinutes}-minute focus session...
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tailoring explanations and interactive checks for {energyLevel} energy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Session Top Bar */}
      <GlassCard
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(8, 11, 24, 0.7)',
              border: '1px solid var(--glass-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: secondsRemaining < 60 ? '#F87171' : '#67E8F9',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            }}
          >
            {minutesDisplay}:{secondsDisplay}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Badge variant="cyan">{subject}</Badge>
              <Badge variant="neutral">{energyLevel} energy</Badge>
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px' }}>{title}</h4>
          </div>
        </div>

        {/* Controls: Pause / Resume, Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setIsActive(!isActive)}
            icon={isActive ? <Pause size={14} /> : <Play size={14} fill="#FFFFFF" />}
          >
            {isActive ? 'Pause' : 'Resume'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Exit focus session? Your timer and progress for this session will reset.')) {
                onExit();
              }
            }}
          >
            <X size={16} />
          </Button>
        </div>
      </GlassCard>

      {/* Step Indicators */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[
          { step: 1, label: '1. Intuition' },
          { step: 2, label: '2. Example' },
          { step: 3, label: '3. Practice' },
          { step: 4, label: '4. Knowledge Check' },
        ].map((item) => (
          <div
            key={item.step}
            style={{
              flex: 1,
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              background:
                currentStep === item.step
                  ? 'rgba(167, 139, 250, 0.2)'
                  : currentStep > item.step
                  ? 'rgba(134, 239, 172, 0.15)'
                  : 'rgba(255, 255, 255, 0.04)',
              border:
                currentStep === item.step
                  ? '1px solid var(--accent-lavender)'
                  : currentStep > item.step
                  ? '1px solid rgba(134, 239, 172, 0.3)'
                  : '1px solid var(--glass-border-subtle)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color:
                currentStep === item.step
                  ? '#FFFFFF'
                  : currentStep > item.step
                  ? '#86EFAC'
                  : 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Step 1: Learning Objective & Intuition Breakdown */}
      {currentStep === 1 && content && (
        <GlassCard glow="lavender" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-lavender)' }}>
              Step 1 of 4: Conceptual Intuition
            </span>

            <Button
              variant="glass"
              size="sm"
              onClick={() => setIsSimpler(!isSimpler)}
              icon={<HelpCircle size={14} />}
            >
              {isSimpler ? 'Standard View' : 'Explain Simpler'}
            </Button>
          </div>

          <div
            style={{
              padding: '0.85rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(167, 139, 250, 0.1)',
              border: '1px solid rgba(167, 139, 250, 0.25)',
              marginBottom: '1.5rem',
            }}
          >
            <strong style={{ color: 'var(--accent-lavender)', fontSize: '0.82rem' }}>
              SESSION OBJECTIVE:
            </strong>
            <p style={{ fontSize: '0.96rem', fontWeight: 600, color: '#FFFFFF', marginTop: '0.2rem' }}>
              {content.objective}
            </p>
          </div>

          <div style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: '2rem' }}>
            {isSimpler ? (
              <p>
                <strong>In simple terms: </strong>
                Think of this like organizing a shelf. You have clear slots, each item has a place,
                and following a consistent rule avoids a chaotic pile. That is exactly what{' '}
                {title} does for your study work.
              </p>
            ) : (
              <p>{content.explanation}</p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              onClick={() => setCurrentStep(2)}
              icon={<ArrowRight size={16} />}
            >
              Continue to Example
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Step 2: Concrete Example Walkthrough */}
      {currentStep === 2 && content && (
        <GlassCard glow="cyan" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              Step 2 of 4: Concrete Application
            </span>
          </div>

          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Practical Walkthrough</h3>

          <div
            style={{
              background: 'rgba(4, 6, 14, 0.85)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              border: '1px solid var(--glass-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: '#A5F3FC',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            {content.example}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" onClick={() => setCurrentStep(1)} icon={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => setCurrentStep(3)}
              icon={<ArrowRight size={16} />}
            >
              Test Practice Question
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Step 3: Mid-session Practice Check */}
      {currentStep === 3 && content && (
        <GlassCard glow="lavender" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-lavender)' }}>
              Step 3 of 4: Practice Check
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#FFFFFF' }}>
            {content.practiceQuestion.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {content.practiceQuestion.options.map((opt, idx) => {
              const isSelected = practiceAnswer === idx;
              const isCorrectOpt = idx === content.practiceQuestion.answerIndex;

              let border = '1px solid var(--glass-border)';
              let bg = 'rgba(255, 255, 255, 0.04)';
              if (practiceSubmitted) {
                if (isCorrectOpt) {
                  border = '1px solid #86EFAC';
                  bg = 'rgba(134, 239, 172, 0.15)';
                } else if (isSelected) {
                  border = '1px solid #F87171';
                  bg = 'rgba(248, 113, 113, 0.15)';
                }
              } else if (isSelected) {
                border = '1px solid var(--accent-lavender)';
                bg = 'rgba(167, 139, 250, 0.18)';
              }

              return (
                <button
                  key={idx}
                  disabled={practiceSubmitted}
                  onClick={() => setPracticeAnswer(idx)}
                  style={{
                    padding: '0.9rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border,
                    background: bg,
                    color: '#F8FAFC',
                    textAlign: 'left',
                    fontSize: '0.92rem',
                    cursor: practiceSubmitted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {practiceSubmitted && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background:
                  practiceAnswer === content.practiceQuestion.answerIndex
                    ? 'rgba(134, 239, 172, 0.1)'
                    : 'rgba(248, 113, 113, 0.1)',
                border:
                  practiceAnswer === content.practiceQuestion.answerIndex
                    ? '1px solid rgba(134, 239, 172, 0.3)'
                    : '1px solid rgba(248, 113, 113, 0.3)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
              }}
            >
              <strong>
                {practiceAnswer === content.practiceQuestion.answerIndex ? 'Correct! ' : 'Good attempt! '}
              </strong>
              {content.practiceQuestion.explanation}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" onClick={() => setCurrentStep(2)} icon={<ArrowLeft size={16} />}>
              Back
            </Button>

            {!practiceSubmitted ? (
              <Button
                variant="primary"
                disabled={practiceAnswer === null}
                onClick={() => setPracticeSubmitted(true)}
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                variant="mint"
                onClick={() => setCurrentStep(4)}
                icon={<ArrowRight size={16} />}
              >
                Final Knowledge Check
              </Button>
            )}
          </div>
        </GlassCard>
      )}

      {/* Step 4: Final Knowledge Check & Confidence Rating */}
      {currentStep === 4 && content && (
        <GlassCard glow="mint" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-mint)' }}>
              Step 4 of 4: Final Knowledge Check
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#FFFFFF' }}>
            {content.knowledgeCheck.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {content.knowledgeCheck.options.map((opt, idx) => {
              const isSelected = finalAnswer === idx;
              const isCorrectOpt = idx === content.knowledgeCheck.answerIndex;

              let border = '1px solid var(--glass-border)';
              let bg = 'rgba(255, 255, 255, 0.04)';
              if (finalSubmitted) {
                if (isCorrectOpt) {
                  border = '1px solid #86EFAC';
                  bg = 'rgba(134, 239, 172, 0.15)';
                } else if (isSelected) {
                  border = '1px solid #F87171';
                  bg = 'rgba(248, 113, 113, 0.15)';
                }
              } else if (isSelected) {
                border = '1px solid var(--accent-mint)';
                bg = 'rgba(134, 239, 172, 0.18)';
              }

              return (
                <button
                  key={idx}
                  disabled={finalSubmitted}
                  onClick={() => setFinalAnswer(idx)}
                  style={{
                    padding: '0.9rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border,
                    background: bg,
                    color: '#F8FAFC',
                    textAlign: 'left',
                    fontSize: '0.92rem',
                    cursor: finalSubmitted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {finalSubmitted && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background:
                  finalAnswer === content.knowledgeCheck.answerIndex
                    ? 'rgba(134, 239, 172, 0.12)'
                    : 'rgba(248, 113, 113, 0.12)',
                border:
                  finalAnswer === content.knowledgeCheck.answerIndex
                    ? '1px solid rgba(134, 239, 172, 0.35)'
                    : '1px solid rgba(248, 113, 113, 0.35)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
              }}
            >
              <strong>
                {finalAnswer === content.knowledgeCheck.answerIndex ? 'Outstanding! ' : 'Concept review: '}
              </strong>
              {content.knowledgeCheck.explanation}
            </div>
          )}

          {/* Confidence self-rating */}
          {finalSubmitted && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(14, 21, 40, 0.75)',
                border: '1px solid var(--glass-border)',
                marginBottom: '1.5rem',
              }}
            >
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.65rem' }}>
                How confident do you feel with this topic now?
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setConfidence(lvl)}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      border: confidence === lvl ? '1px solid var(--accent-mint)' : '1px solid var(--glass-border)',
                      background: confidence === lvl ? 'rgba(134, 239, 172, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: confidence === lvl ? '#86EFAC' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    ★ {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" onClick={() => setCurrentStep(3)} icon={<ArrowLeft size={16} />}>
              Back
            </Button>

            {!finalSubmitted ? (
              <Button
                variant="primary"
                disabled={finalAnswer === null}
                onClick={() => setFinalSubmitted(true)}
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                variant="mint"
                onClick={handleComplete}
                icon={<CheckCircle2 size={16} />}
              >
                Finish & Log Session
              </Button>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
