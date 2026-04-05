import { useState } from 'react';
import { Shuffle, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { vocabData } from '../data/vocab.js';
import { conjugate, FORM_LABELS } from '../utils/conjugation.js';
import { callClaude, SYSTEM_PROMPTS } from '../utils/api.js';

const FORMS = Object.keys(FORM_LABELS);
const VERBS = vocabData.filter(v => v.type === 'verb');

function randomVerb() {
  return VERBS[Math.floor(Math.random() * VERBS.length)];
}
function randomForm() {
  return FORMS[Math.floor(Math.random() * FORMS.length)];
}

export default function Conjugation() {
  const [apiKey] = useLocalStorage('apiKey', '');

  const [verb, setVerb]   = useState(randomVerb);
  const [form, setForm]   = useState('ba');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null); // { correct, expected, explanation }
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const expected = conjugate(verb.reading, verb.group, form);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setSubmitted(true);

    const trimmed = input.trim();
    const isCorrect = trimmed === expected;

    if (isCorrect) {
      setResult({ correct: true, expected, explanation: null });
      return;
    }

    // Wrong — ask Claude to explain
    setLoading(true);
    let explanation = '';
    try {
      if (!apiKey) {
        explanation = `The correct answer is **${expected}**. Add your API key in Settings for a detailed explanation.`;
      } else {
        const msg = `Verb: ${verb.word} (${verb.reading}) — Group: ${verb.group}\nTarget form: ${FORM_LABELS[form]}\nStudent's answer: ${trimmed}\nExpected answer: ${expected}`;
        explanation = await callClaude({
          messages: [{ role: 'user', content: msg }],
          systemPrompt: SYSTEM_PROMPTS.conjugationCheck,
          apiKey,
        });
      }
    } catch (e) {
      explanation = `The correct answer is **${expected}**. (Error: ${e.message})`;
    } finally {
      setLoading(false);
    }

    setResult({ correct: false, expected, explanation });
  };

  const handleNext = () => {
    setVerb(randomVerb());
    setForm(randomForm());
    setInput('');
    setResult(null);
    setSubmitted(false);
  };

  const GROUP_COLORS = { u: 'bg-blue-100 text-blue-700', ru: 'bg-violet-100 text-violet-700', irregular: 'bg-red-100 text-red-700' };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Conjugation Drill</h1>
        <p className="text-slate-400 text-sm mt-1">Type the correct form of the verb.</p>
      </div>

      {/* Verb card */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`badge ${GROUP_COLORS[verb.group] ?? 'bg-slate-100 text-slate-600'}`}>{verb.group}-verb</span>
          </div>
          <button
            onClick={handleNext}
            className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs"
          >
            <Shuffle size={13} /> New verb
          </button>
        </div>

        <div className="text-center py-2">
          <p className="text-4xl font-jp font-bold text-slate-800">{verb.word}</p>
          <p className="text-slate-400 text-sm mt-1">{verb.reading} — {verb.meaning}</p>
        </div>

        <div className="bg-indigo-50 rounded-lg px-4 py-2.5 text-center">
          <p className="text-xs text-indigo-400 uppercase tracking-wide mb-0.5">Target form</p>
          <p className="text-indigo-700 font-semibold text-sm">{FORM_LABELS[form]}</p>
        </div>
      </div>

      {/* Form picker */}
      <div>
        <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Change form</p>
        <div className="flex flex-wrap gap-1.5">
          {FORMS.map(f => (
            <button
              key={f}
              onClick={() => { setForm(f); setInput(''); setResult(null); setSubmitted(false); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                form === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="card space-y-3">
        <label className="text-sm font-medium text-slate-600">Your answer (in hiragana/kanji)</label>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 font-jp text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-50"
            placeholder="type here..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !submitted && handleCheck()}
            disabled={submitted && !loading}
          />
          {!submitted && (
            <button onClick={handleCheck} disabled={!input.trim()} className="btn-primary px-4 flex items-center gap-1.5">
              <Send size={14} /> Check
            </button>
          )}
        </div>

        {/* Result */}
        {submitted && (
          <div>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={14} className="animate-spin" /> Getting explanation...
              </div>
            ) : result && (
              <div className={`rounded-xl p-4 space-y-2 ${result.correct ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                <div className="flex items-center gap-2">
                  {result.correct
                    ? <><CheckCircle size={18} className="text-emerald-500" /><span className="font-semibold text-emerald-700">Correct!</span></>
                    : <><XCircle size={18} className="text-red-500" /><span className="font-semibold text-red-700">Not quite.</span></>
                  }
                </div>
                {!result.correct && (
                  <p className="text-sm text-slate-600 font-jp">
                    Answer: <strong className="text-emerald-700">{result.expected}</strong>
                  </p>
                )}
                {result.explanation && (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
                )}
              </div>
            )}
          </div>
        )}

        {submitted && !loading && (
          <button onClick={handleNext} className="btn-primary w-full">
            Next verb →
          </button>
        )}
      </div>
    </div>
  );
}
