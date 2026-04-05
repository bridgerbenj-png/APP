import { useState } from 'react';
import { Search, Loader2, Eye, EyeOff, Volume2, Mic, MicOff, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { grammarData } from '../data/grammar.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { callClaude } from '../utils/api.js';

const LEVEL_COLORS = {
  N5: 'bg-green-100 text-green-700',
  N4: 'bg-blue-100 text-blue-700',
  N3: 'bg-violet-100 text-violet-700',
};

const SYSTEM_PROMPT = `You are a Japanese language teacher generating practice sentences for N5-N4 level students.
Generate 5 natural, varied sentences that clearly demonstrate the target grammar point.
Use everyday vocabulary appropriate for N5-N4 level. Vary the subjects and contexts.
Return ONLY a valid JSON array with no other text, markdown, or explanation:
[
  {
    "japanese": "sentence in Japanese with kanji",
    "reading": "full sentence in hiragana/katakana (no kanji)",
    "romaji": "romanized version",
    "english": "English translation",
    "tip": "one short teaching tip about this specific sentence"
  }
]`;

export default function SentencePractice() {
  const [apiKey] = useLocalStorage('apiKey', '');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState({});
  const [speaking, setSpeaking] = useState(null);
  const [recording, setRecording] = useState(null);
  const [attempts, setAttempts] = useState({});

  const filtered = grammarData.filter(g =>
    g.name.toLowerCase().includes(query.toLowerCase()) ||
    g.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
    g.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const loadSentences = async (point) => {
    setSelected(point);
    setSentences([]);
    setRevealed({});
    setAttempts({});
    setError('');
    if (!apiKey) { setError('Add your API key in Settings first.'); return; }
    setLoading(true);
    try {
      const text = await callClaude({
        messages: [{
          role: 'user',
          content: `Generate 5 practice sentences for the grammar point: ${point.name} — ${point.shortDesc}. Structure: ${point.structure ?? 'N/A'}`,
        }],
        systemPrompt: SYSTEM_PROMPT,
        apiKey,
      });
      // Strip markdown code fences if the model wraps in them
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      setSentences(JSON.parse(cleaned));
    } catch (e) {
      setError(e.message.includes('JSON') || e.message.includes('Unexpected')
        ? 'Could not parse sentences — please try again.'
        : e.message);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text, idx) => {
    window.speechSynthesis.cancel();
    if (speaking === idx) { setSpeaking(null); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ja-JP';
    utt.rate = 0.85;
    utt.onend = () => setSpeaking(null);
    setSpeaking(idx);
    window.speechSynthesis.speak(utt);
  };

  const startRecording = (idx) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setAttempts(a => ({ ...a, [idx]: { text: 'Speech recognition is not supported in this browser. Try Chrome or Edge.', match: null } }));
      return;
    }
    const rec = new SR();
    rec.lang = 'ja-JP';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      // Loose match: strip punctuation and compare
      const normalize = s => s.replace(/[。、！？\s]/g, '');
      const match = normalize(transcript) === normalize(sentences[idx].japanese);
      setAttempts(a => ({ ...a, [idx]: { text: transcript, match } }));
    };
    rec.onerror = () => {
      setAttempts(a => ({ ...a, [idx]: { text: 'Could not recognise speech. Make sure your microphone is allowed and try again.', match: null } }));
      setRecording(null);
    };
    rec.onend = () => setRecording(null);
    setRecording(idx);
    rec.start();
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-88px)]">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Search grammar..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="overflow-y-auto flex-1 space-y-1 pr-1">
          {filtered.map(g => (
            <button
              key={g.id}
              onClick={() => loadSentences(g)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                selected?.id === g.id
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="font-jp font-semibold">{g.name}</div>
              <div className="text-xs text-slate-400 mt-0.5 leading-tight truncate">{g.shortDesc}</div>
              {g.tags?.includes('current') && (
                <span className="badge bg-amber-100 text-amber-600 mt-1 text-[10px]">current study</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-slate-400">
            <MessageSquare size={32} />
            <p className="font-medium text-slate-500">Select a grammar point</p>
            <p className="text-sm">Get 5 practice sentences with listening and speaking exercises.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-jp text-slate-800">{selected.name}</h2>
                {selected.level && (
                  <span className={`badge ${LEVEL_COLORS[selected.level] ?? 'bg-slate-100 text-slate-600'}`}>
                    {selected.level}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-0.5">{selected.shortDesc}</p>
              {selected.structure && (
                <p className="text-xs text-indigo-600 bg-indigo-50 rounded px-2 py-1 mt-1 inline-block font-jp">
                  {selected.structure}
                </p>
              )}
            </div>

            {/* Sentences */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loading && (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-12">
                  <Loader2 size={18} className="animate-spin" /> Generating sentences…
                </div>
              )}
              {error && (
                <div className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{error}</div>
              )}

              {sentences.map((s, i) => (
                <div key={i} className="card space-y-3">
                  {/* Number badge */}
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-1">
                      {i + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-2xl font-jp font-semibold text-slate-800 leading-snug">{s.japanese}</p>
                      <p className="text-sm text-slate-500 font-jp">{s.reading}</p>
                      <p className="text-xs text-slate-400 italic">{s.romaji}</p>
                    </div>
                  </div>

                  {/* Translation reveal */}
                  <div className="ml-9">
                    <button
                      onClick={() => setRevealed(r => ({ ...r, [i]: !r[i] }))}
                      className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      {revealed[i] ? <EyeOff size={13} /> : <Eye size={13} />}
                      {revealed[i] ? 'Hide translation' : 'Show translation'}
                    </button>
                    {revealed[i] && (
                      <p className="text-sm text-slate-600 mt-1.5">{s.english}</p>
                    )}
                  </div>

                  {/* Tip */}
                  {s.tip && (
                    <p className="ml-9 text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">{s.tip}</p>
                  )}

                  {/* Action buttons */}
                  <div className="ml-9 flex items-center gap-2 pt-1">
                    <button
                      onClick={() => speak(s.japanese, i)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        speaking === i
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Volume2 size={13} />
                      {speaking === i ? 'Playing…' : 'Listen'}
                    </button>
                    <button
                      onClick={() => startRecording(i)}
                      disabled={recording !== null && recording !== i}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
                        recording === i
                          ? 'bg-red-100 text-red-600 animate-pulse'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {recording === i ? <MicOff size={13} /> : <Mic size={13} />}
                      {recording === i ? 'Listening…' : 'Speak'}
                    </button>
                  </div>

                  {/* Speech attempt feedback */}
                  {attempts[i] && (
                    <div className={`ml-9 flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${
                      attempts[i].match === true  ? 'bg-emerald-50 text-emerald-700' :
                      attempts[i].match === false ? 'bg-red-50 text-red-700' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {attempts[i].match === true  && <CheckCircle size={15} className="mt-0.5 flex-shrink-0" />}
                      {attempts[i].match === false && <XCircle    size={15} className="mt-0.5 flex-shrink-0" />}
                      <div>
                        <span className="font-jp">{attempts[i].text}</span>
                        {attempts[i].match === true  && <span className="ml-2 text-xs font-medium">Perfect match!</span>}
                        {attempts[i].match === false && <span className="ml-2 text-xs">Keep practising!</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
