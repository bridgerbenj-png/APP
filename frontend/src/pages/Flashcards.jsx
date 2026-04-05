import { useState, useEffect } from 'react';
import { RotateCcw, ChevronRight } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { vocabData } from '../data/vocab.js';
import { isDue, calculateNextReview } from '../utils/srs.js';

const TYPE_COLORS = {
  'verb':       'bg-blue-100 text-blue-700',
  'i-adj':      'bg-green-100 text-green-700',
  'na-adj':     'bg-teal-100 text-teal-700',
  'noun':       'bg-slate-100 text-slate-600',
  'expression': 'bg-amber-100 text-amber-700',
};

const RATINGS = [
  { label: 'Again', value: 0, color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  { label: 'Hard',  value: 1, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  { label: 'Good',  value: 2, color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
  { label: 'Easy',  value: 3, color: 'bg-sky-100 text-sky-700 hover:bg-sky-200' },
];

export default function Flashcards() {
  const [vocabSRS, setVocabSRS] = useLocalStorage('vocabSRS', {});
  const [streak, setStreak]     = useLocalStorage('streak', { count: 0, lastStudied: null });
  const [flipped, setFlipped]   = useState(false);
  const [index, setIndex]       = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const dueCards = vocabData.filter(v => isDue(vocabSRS[v.id]));

  useEffect(() => {
    setFlipped(false);
  }, [index]);

  useEffect(() => {
    if (dueCards.length === 0) setSessionDone(true);
  }, [dueCards.length]);

  const current = dueCards[index];

  const handleRate = (quality) => {
    if (!current) return;
    const existing = vocabSRS[current.id] ?? {};
    const updated = calculateNextReview(existing, quality);
    setVocabSRS(prev => ({ ...prev, [current.id]: updated }));

    // Update streak
    const today = new Date().toDateString();
    if (streak.lastStudied !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newCount = streak.lastStudied === yesterday.toDateString() ? streak.count + 1 : 1;
      setStreak({ count: newCount, lastStudied: today });
    }

    setSessionCount(c => c + 1);
    setFlipped(false);

    const nextDue = dueCards.filter((v, i) => i !== index && isDue(vocabSRS[v.id]));
    if (nextDue.length === 0 || index >= dueCards.length - 1) {
      setSessionDone(true);
    } else {
      setIndex(prev => Math.min(prev, dueCards.length - 2));
    }
  };

  const resetSession = () => {
    setIndex(0);
    setSessionDone(false);
    setSessionCount(0);
  };

  if (sessionDone || dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800">Session complete!</h2>
        <p className="text-slate-500">You reviewed <strong>{sessionCount}</strong> card{sessionCount !== 1 ? 's' : ''}.</p>
        {dueCards.length === 0 && sessionCount === 0 && (
          <p className="text-slate-400 text-sm">No cards due right now. Come back later or check all cards below.</p>
        )}
        <div className="flex gap-3">
          <button onClick={resetSession} className="btn-primary flex items-center gap-2">
            <RotateCcw size={15} /> Review all cards
          </button>
        </div>
      </div>
    );
  }

  const progressPct = (index / dueCards.length) * 100;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Card {index + 1} of {dueCards.length}</span>
          <span>{dueCards.length - index - 1} remaining</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flashcard-container" style={{ height: 280 }}>
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`} style={{ height: 280 }}>

          {/* Front */}
          <div
            className="flashcard-front card flex flex-col items-center justify-center gap-3 cursor-pointer select-none"
            style={{ height: 280 }}
            onClick={() => setFlipped(true)}
          >
            <span className={`badge ${TYPE_COLORS[current.type] ?? 'bg-slate-100 text-slate-600'}`}>
              {current.type}{current.group ? ` · ${current.group}` : ''}
            </span>
            <p className="text-5xl font-jp font-bold text-slate-800">{current.word}</p>
            <p className="text-slate-400 text-sm mt-2">Tap to reveal</p>
          </div>

          {/* Back */}
          <div
            className="flashcard-back card flex flex-col items-center justify-center gap-3 cursor-pointer select-none"
            style={{ height: 280 }}
            onClick={() => setFlipped(false)}
          >
            <p className="text-2xl font-jp text-indigo-600 font-medium">{current.reading}</p>
            <p className="text-xl font-semibold text-slate-800">{current.meaning}</p>
            {current.example && (
              <p className="text-sm text-slate-500 font-jp text-center px-4">{current.example}</p>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons — only show after flip */}
      {flipped && (
        <div>
          <p className="text-center text-xs text-slate-400 mb-3">How well did you know it?</p>
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map(({ label, value, color }) => (
              <button
                key={value}
                onClick={() => handleRate(value)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${color}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skip */}
      {!flipped && (
        <div className="flex justify-center">
          <button
            onClick={() => setIndex(i => Math.min(i + 1, dueCards.length - 1))}
            className="text-slate-400 text-sm hover:text-slate-600 flex items-center gap-1"
          >
            Skip <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
