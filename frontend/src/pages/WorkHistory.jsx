import { Flame, Bot, CheckCircle, BookOpen, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { vocabData } from '../data/vocab.js';
import { isDue } from '../utils/srs.js';

export default function WorkHistory() {
  const [chatHistory, setChatHistory] = useLocalStorage('chatHistory', []);
  const [streak]                      = useLocalStorage('streak', { count: 0, lastStudied: null });
  const [vocabSRS]                    = useLocalStorage('vocabSRS', {});

  const reviewedCount   = Object.values(vocabSRS).filter(c => c.repetitions > 0).length;
  const masteredCount   = Object.values(vocabSRS).filter(c => c.interval >= 21).length;
  const inProgressCount = reviewedCount - masteredCount;
  const notStarted      = vocabData.length - reviewedCount;
  const dueCount        = vocabData.filter(v => isDue(vocabSRS[v.id])).length;
  const userMessages    = chatHistory.filter(m => m.role === 'user');

  const clearHistory = () => {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      setChatHistory([]);
    }
  };

  const lastStudiedStr = streak.lastStudied
    ? new Date(streak.lastStudied).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Work History</h1>
        <p className="text-slate-500 text-sm mt-1">Your progress, study streak, and chat log.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-4">
          <div className="flex items-center justify-center gap-1.5 text-orange-500 mb-1">
            <Flame size={18} />
            <span className="text-2xl font-bold">{streak.count}</span>
          </div>
          <p className="text-xs text-slate-400">Day streak</p>
        </div>
        <div className="card text-center py-4">
          <div className="flex items-center justify-center gap-1.5 text-indigo-500 mb-1">
            <Bot size={18} />
            <span className="text-2xl font-bold">{userMessages.length}</span>
          </div>
          <p className="text-xs text-slate-400">Chat messages</p>
        </div>
        <div className="card text-center py-4">
          <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
            <CheckCircle size={16} />
            <span className="text-2xl font-bold">{masteredCount}</span>
          </div>
          <p className="text-xs text-slate-400">Words mastered</p>
        </div>
      </div>

      {/* Vocab breakdown */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-500" />
          <h2 className="font-semibold text-slate-700">Vocabulary progress</h2>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${(reviewedCount / vocabData.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">{reviewedCount} of {vocabData.length} words reviewed</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Due for review', value: dueCount,        color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'In progress',    value: inProgressCount, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Mastered',       value: masteredCount,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Not started',    value: notStarted,      color: 'text-slate-500',  bg: 'bg-slate-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl px-3 py-3 text-center`}>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Last studied */}
      <div className="card py-4">
        <p className="text-sm font-medium text-slate-600">Last studied</p>
        <p className="text-slate-800 mt-1">
          {lastStudiedStr ?? (
            <span className="text-slate-400 italic">Not yet — complete a flashcard session to start your streak!</span>
          )}
        </p>
      </div>

      {/* Chat history */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-700">Chat history</h2>
            <span className="badge bg-slate-100 text-slate-500">{userMessages.length} message{userMessages.length !== 1 ? 's' : ''}</span>
          </div>
          {userMessages.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} /> Clear history
            </button>
          )}
        </div>

        {userMessages.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-4 text-center">
            No chat history yet — start a conversation on the Chat page.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {[...userMessages].reverse().map((m, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 bg-slate-50 rounded-xl text-sm">
                <Bot size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-600 leading-snug">
                  {m.content.length > 80 ? m.content.slice(0, 80) + '…' : m.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
