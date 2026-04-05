import { useState } from 'react';
import { Headphones, Play, Square, Eye, EyeOff, Loader2, RefreshCw, HelpCircle, CheckCircle, BookOpen } from 'lucide-react';
import { grammarData } from '../data/grammar.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { callClaude } from '../utils/api.js';

const SYSTEM_PROMPT = `You are a Japanese language teacher creating listening comprehension content for N5-N4 level students.
Write a short, natural passage (2-4 sentences) on an everyday topic using vocabulary and grammar appropriate for the level.
Keep the language natural — how a native speaker would actually say it, not textbook-stiff.
Return ONLY valid JSON with no markdown fences or extra text:
{
  "japanese": "Full passage in Japanese with kanji",
  "reading": "Full passage in hiragana/katakana only (no kanji)",
  "romaji": "Full romanized reading",
  "english": "Full natural English translation",
  "topic": "Brief topic description in English (e.g. 'Making weekend plans with a friend')",
  "grammarNotes": "2-3 concise notes on key grammar or vocabulary used in this passage, explained in plain English",
  "question": "A comprehension question about the passage, in English",
  "answer": "The answer to the comprehension question"
}`;

export default function Listening() {
  const [apiKey] = useLocalStorage('apiKey', '');
  const [focus, setFocus] = useState('current');
  const [passage, setPassage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showText, setShowText] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [playing, setPlaying] = useState(false);

  const currentGrammar = grammarData.filter(g => g.tags?.includes('current'));

  const generate = async () => {
    setError('');
    setPassage(null);
    setShowText(false);
    setShowNotes(false);
    setShowAnswer(false);
    window.speechSynthesis.cancel();
    setPlaying(false);
    if (!apiKey) { setError('Add your API key in Settings first.'); return; }
    setLoading(true);

    let contextHint;
    if (focus === 'current') {
      contextHint = `Base the passage around these grammar points currently being studied: ${currentGrammar.map(g => `${g.name} (${g.shortDesc})`).join('; ')}.`;
    } else if (focus === 'mixed') {
      contextHint = 'Use a natural mix of N5-N4 grammar. No specific focus — just everyday conversational Japanese.';
    } else {
      const g = grammarData.find(g => String(g.id) === focus);
      contextHint = g
        ? `Build the passage so it naturally demonstrates the grammar point: ${g.name} — ${g.shortDesc}. Structure: ${g.structure ?? 'N/A'}.`
        : 'Use a natural mix of N5-N4 grammar.';
    }

    try {
      const text = await callClaude({
        messages: [{ role: 'user', content: `Generate a listening comprehension passage. ${contextHint}` }],
        systemPrompt: SYSTEM_PROMPT,
        apiKey,
      });
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      setPassage(JSON.parse(cleaned));
    } catch (e) {
      setError(e.message.includes('JSON') || e.message.includes('Unexpected')
        ? 'Could not parse passage — please try again.'
        : e.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!passage) return;
    window.speechSynthesis.cancel();
    if (playing) { setPlaying(false); return; }
    const utt = new SpeechSynthesisUtterance(passage.japanese);
    utt.lang = 'ja-JP';
    utt.rate = 0.8;
    utt.onend = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utt);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Listening Practice</h1>
        <p className="text-slate-500 text-sm mt-1">
          Listen to a passage, then test your comprehension — reveal the text and notes when ready.
        </p>
      </div>

      {/* Controls */}
      <div className="card flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-44">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Grammar focus</label>
          <select
            value={focus}
            onChange={e => setFocus(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="current">Current study focus</option>
            <option value="mixed">Mixed N5–N4</option>
            <optgroup label="Specific grammar point">
              {grammarData.map(g => (
                <option key={g.id} value={String(g.id)}>
                  {g.name} — {g.shortDesc}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary flex items-center gap-2 py-2 px-4 disabled:opacity-60"
        >
          {loading
            ? <Loader2 size={15} className="animate-spin" />
            : <RefreshCw size={15} />}
          {loading ? 'Generating…' : passage ? 'New passage' : 'Generate passage'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{error}</div>
      )}

      {/* Passage area */}
      {passage && (
        <div className="space-y-3">

          {/* Topic + play button */}
          <div className="card flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Topic</p>
              <p className="text-slate-800 font-medium">{passage.topic}</p>
              <p className="text-xs text-slate-400 mt-2">
                Press play and listen before revealing the text.
              </p>
            </div>
            <button
              onClick={togglePlay}
              className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center shadow transition-all ${
                playing
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {playing ? <Square size={18} /> : <Play size={20} className="ml-0.5" />}
            </button>
          </div>

          {/* Text reveal */}
          <div className="card space-y-3">
            <button
              onClick={() => setShowText(t => !t)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              {showText ? <EyeOff size={15} /> : <Eye size={15} />}
              {showText ? 'Hide text' : 'Show text'}
            </button>
            {showText && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <p className="text-xl font-jp font-semibold text-slate-800 leading-relaxed">{passage.japanese}</p>
                <p className="text-sm text-slate-500 font-jp">{passage.reading}</p>
                <p className="text-xs text-slate-400 italic">{passage.romaji}</p>
                <p className="text-sm text-slate-600 pt-2 border-t border-slate-100">{passage.english}</p>
              </div>
            )}
          </div>

          {/* Grammar notes */}
          <div className="card space-y-3">
            <button
              onClick={() => setShowNotes(n => !n)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              <BookOpen size={15} />
              {showNotes ? 'Hide grammar notes' : 'Show grammar notes'}
            </button>
            {showNotes && (
              <p className="text-sm text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                {passage.grammarNotes}
              </p>
            )}
          </div>

          {/* Comprehension question */}
          <div className="card space-y-3">
            <div className="flex items-start gap-2">
              <HelpCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium text-slate-700">{passage.question}</p>
            </div>
            <button
              onClick={() => setShowAnswer(a => !a)}
              className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              {showAnswer ? 'Hide answer' : 'Reveal answer'}
            </button>
            {showAnswer && (
              <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{passage.answer}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!passage && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Headphones size={40} />
          <p className="font-medium text-slate-500">No passage yet</p>
          <p className="text-sm">Choose a grammar focus above and click Generate.</p>
        </div>
      )}
    </div>
  );
}
