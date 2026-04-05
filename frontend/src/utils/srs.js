/**
 * Simplified SM-2 spaced repetition algorithm.
 * quality: 0=Again, 1=Hard, 2=Good, 3=Easy
 */
export function calculateNextReview(card, quality) {
  let { interval = 0, easiness = 2.5, repetitions = 0 } = card;

  if (quality === 0) {
    // Again — reset
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = quality === 3 ? 4 : 1;
    } else if (repetitions === 1) {
      interval = quality === 3 ? 10 : 6;
    } else {
      interval = Math.round(interval * easiness);
      if (quality === 1) interval = Math.max(1, Math.round(interval * 0.5));
      if (quality === 3) interval = Math.round(interval * 1.2);
    }
    repetitions += 1;
    easiness = Math.max(1.3, easiness + 0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  nextReview.setHours(0, 0, 0, 0);

  return { interval, easiness, repetitions, nextReview: nextReview.toISOString() };
}

export function isDue(card) {
  if (!card || !card.nextReview) return true; // new card
  return new Date(card.nextReview) <= new Date();
}

export function getDueCount(vocabSRS) {
  return Object.values(vocabSRS).filter(isDue).length;
}
