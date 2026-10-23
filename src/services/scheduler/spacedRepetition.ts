import type { RevisionRecord, Topic, StudySession } from '../../types';

export function calculateNextRevision(
  currentRecord: RevisionRecord | undefined,
  topic: Topic,
  session: StudySession
): RevisionRecord {
  const isCorrect = session.isCorrect ?? false;
  const confidence = session.confidenceRating ?? 3;
  const now = new Date();

  const prevCount = currentRecord?.reviewCount || 0;
  const prevConsecutive = currentRecord?.consecutiveCorrect || 0;
  const prevMastery = currentRecord?.masteryScore ?? (topic.masteryScore || 40);

  let newConsecutive = isCorrect ? prevConsecutive + 1 : 0;
  let intervalDays = 1;

  if (isCorrect) {
    if (newConsecutive === 1) intervalDays = 1;
    else if (newConsecutive === 2) intervalDays = 3;
    else if (newConsecutive === 3) intervalDays = 7;
    else intervalDays = 14;
  } else {
    intervalDays = 1;
  }

  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + intervalDays);

  const masteryDelta = isCorrect ? 15 + confidence * 2 : -10;
  const newMastery = Math.min(100, Math.max(10, prevMastery + masteryDelta));

  const historyEntry = {
    date: now.toISOString(),
    score: isCorrect ? 100 : 40,
    confidence,
  };

  return {
    id: currentRecord?.id || `rev-${topic.id}`,
    topicId: topic.id,
    topicTitle: topic.title,
    subject: topic.subject,
    lastRevisionDate: now.toISOString(),
    nextRevisionDate: nextDate.toISOString(),
    reviewCount: prevCount + 1,
    consecutiveCorrect: newConsecutive,
    confidenceRating: confidence,
    masteryScore: newMastery,
    history: [...(currentRecord?.history || []), historyEntry],
  };
}
