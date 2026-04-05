import { Link } from 'react-router-dom';
import { Layers, BookOpen, Pencil, Trophy, Flame, CheckCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { vocabData } from '../data/vocab.js';
import { isDue } from '../utils/srs.js';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'おはようございます！';
  if (h < 18) return 'こんにちは！';
  return 'こんばんは！';
}

export default function Dashboard() {
  const [vocabSRS] = useLocalStorage('vocabSRS', {});
  const [streak]   = useLocalStorage('streak', { count: 0, lastStudied: null });

  const dueCount = vocabData.filter(v => isDue(vocabSRS[v.id])).length;
  const reviewedTotal = Object.values(vocabSRS).filter(c => c.repetitions > 0).length;
  const masteredCount = Object.values(vocabSRS).filter(c => c.interval >= 21).length;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const actions = [
    { to: '/flashcards',  icon: Layers,   label: 'Review Flashcards', color: 'indigo', sub: `${dueCount} card${dueCount !== 1 ? 's' : ''} due` },
    { to: '/grammar',     icon: BookOpen, label: 'Grammar Lessons',   color: 'violet', sub: 'Explain any grammar point' },
    { to: '/conjugation', icon: Pencil,   label: 'Conjugation Drill', color: 'sky',    sub: 'Practice verb forms' },
    { to: '/quiz',        icon: Trophy,   label: 'Daily Quiz',        color: 'amber',  sub: '10-question mixed quiz' },
  ];

  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    violet: 'bg-violet-50 text-violet-600 hover:bg-violet-100',
    sky:    'bg-sky-50 text-sky-600 hover:bg-sky-100',
    amber:  'bg-amber-50 text-amber-600 hover:bg-amber-100',
  };
  const iconBg = {
    indigo: 'bg-indigo-100 text-indigo-600',
    violet: 'bg-violet-100 text-violet-600',
    sky:    'bg-sky-100 text-sky-600',
    amber:  'bg-amber-100 text-amber-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-slate-400 text-sm">{today}</p>
        <h1 className="text-2xl font-bold text-slate-800 font-jp mt-0.5">{getGreeting()}</h1>
        <p className="text-slate-500 mt-1 text-sm">Ready to practice Japanese?</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-4">
          <div className="flex items-center justify-center gap-1.5 text-orange-500 mb-1">
            <Flame size={18} />
            <span className="text-2xl font-bold">{streak.count}</span>
          </div>
          <p className="text-xs text-slate-400">Day streak</p>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-indigo-600 mb-1">{dueCount}</div>
          <p className="text-xs text-slate-400">Cards due</p>
        </div>
        <div className="card text-center py-4">
          <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
            <CheckCircle size={16} />
            <span className="text-2xl font-bold">{masteredCount}</span>
          </div>
          <p className="text-xs text-slate-400">Mastered</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card py-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 font-medium">Vocab progress</span>
          <span className="text-slate-400">{reviewedTotal} / {vocabData.length}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${(reviewedTotal / vocabData.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {vocabData.length - reviewedTotal} words not yet reviewed
        </p>
      </div>

      {/* Action cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Study modes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map(({ to, icon: Icon, label, color, sub }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all ${colorMap[color]}`}
            >
              <div className={`p-2.5 rounded-lg ${iconBg[color]}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="font-semibold text-slate-800">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Current focus tip */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Current focus</p>
        <p className="text-slate-700 text-sm">
          You're studying <strong>conditional forms</strong> — ば, たら, なら, と.{' '}
          <Link to="/grammar" className="text-indigo-600 underline underline-offset-2">Open the Grammar page</Link> and click any conditional to get a full AI explanation.
        </p>
      </div>
    </div>
  );
}
