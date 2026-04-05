import { useState } from 'react';
import { Eye, EyeOff, Save, Trash2, CheckCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export default function Settings() {
  const [apiKey, setApiKey] = useLocalStorage('apiKey', '');
  const [vocabSRS, setVocabSRS] = useLocalStorage('vocabSRS', {});
  const [streak, setStreak]     = useLocalStorage('streak', { count: 0, lastStudied: null });

  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = () => {
    setApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    setVocabSRS({});
    setStreak({ count: 0, lastStudied: null });
    setConfirmReset(false);
  };

  const reviewedCount = Object.values(vocabSRS).filter(c => c.repetitions > 0).length;
  const masteredCount = Object.values(vocabSRS).filter(c => c.interval >= 21).length;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your API key and manage your progress.</p>
      </div>

      {/* API Key */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-700">Claude API Key</h2>
        <p className="text-sm text-slate-500">
          Required for grammar explanations, conjugation feedback, and quiz explanations.
          Get your key at{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">
            console.anthropic.com
          </a>.
          Your key is stored only in your browser (localStorage) and sent only to your local backend.
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 pr-10 font-mono"
              placeholder="sk-ant-..."
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={() => setShowKey(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button onClick={handleSave} className="btn-primary flex items-center gap-1.5">
            {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save</>}
          </button>
        </div>

        {apiKey && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle size={12} /> API key is set
          </p>
        )}
        {!apiKey && (
          <p className="text-xs text-amber-600">
            No API key set — grammar explanations and quiz explanations will not work.
          </p>
        )}
      </div>

      {/* Progress stats */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-700">Your Progress</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-600">{reviewedCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Reviewed</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-emerald-600">{masteredCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Mastered</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-amber-600">{streak.count}</div>
            <div className="text-xs text-slate-400 mt-0.5">Day streak</div>
          </div>
        </div>
      </div>

      {/* Reset progress */}
      <div className="card space-y-3 border-red-100">
        <h2 className="font-semibold text-slate-700">Reset Progress</h2>
        <p className="text-sm text-slate-500">
          This will clear all your SRS data and streak. Your API key will not be affected.
        </p>
        <button
          onClick={handleReset}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            confirmReset
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <Trash2 size={14} />
          {confirmReset ? 'Click again to confirm reset' : 'Reset all progress'}
        </button>
        {confirmReset && (
          <button onClick={() => setConfirmReset(false)} className="text-xs text-slate-400 hover:text-slate-600">
            Cancel
          </button>
        )}
      </div>

      {/* About */}
      <div className="card space-y-1 text-sm text-slate-500">
        <p className="font-medium text-slate-700">About</p>
        <p>日本語 Study — built for a 5-month Japanese learner.</p>
        <p>SRS algorithm based on SM-2. LLM explanations powered by Claude (claude-haiku-4-5).</p>
      </div>
    </div>
  );
}
