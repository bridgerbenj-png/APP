import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw, PenLine } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { callClaude } from '../utils/api.js';

const SYSTEM_PROMPT = `You are a warm, encouraging Japanese language tutor reviewing a student's written Japanese.
The student is at N5-N4 level (roughly 5 months of study).

When given a Japanese sentence or passage, respond using this structure (use ** for bold headers):
**Translation:** a natural English translation of what they wrote.
**Grammar check:** note any grammatical errors with corrections. If there are none, say so clearly.
**Naturalness:** is this how a native speaker would say it? If not, show a more natural version and briefly explain why.
**What you did well:** highlight one or two things they got right — vocabulary choice, particle use, sentence structure, etc.

Be friendly, concise, and encouraging. The student should feel motivated to keep writing.`;

export default function WritingPractice() {
  const [apiKey] = useLocalStorage('apiKey', '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const submit = async () => {
    if (!input.trim() || loading) return;
    if (!apiKey) { setError('Add your API key in Settings first.'); return; }
    const userText = input.trim();
    setInput('');
    setError('');
    setMessages(m => [...m, { role: 'user', content: userText }]);
    setLoading(true);
    try {
      const reply = await callClaude({
        messages: [{ role: 'user', content: userText }],
        systemPrompt: SYSTEM_PROMPT,
        apiKey,
      });
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-88px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Writing Practice</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Write freely in Japanese — submit when ready for feedback.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setInput(''); setError(''); }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw size={13} /> New session
          </button>
        )}
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 pb-8">
            <PenLine size={40} />
            <p className="font-medium text-slate-500">Start writing</p>
            <p className="text-sm text-center max-w-xs">
              Type in Japanese below — sentences, a short paragraph, anything. Submit when you're happy with it.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              m.role === 'user'
                ? 'bg-indigo-600 text-white font-jp text-lg leading-relaxed'
                : 'bg-white border border-slate-100 shadow-sm text-slate-700 text-sm whitespace-pre-wrap leading-relaxed'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={14} className="animate-spin" /> Analysing…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mb-3 flex-shrink-0">{error}</p>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Write in Japanese here… take your time, there's no rush."
          rows={4}
          className="w-full text-base text-slate-800 font-jp resize-none focus:outline-none placeholder:text-slate-400"
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {input.length > 0 ? `${input.length} characters` : 'Tip: write at least one full sentence for the best feedback'}
          </p>
          <button
            onClick={submit}
            disabled={!input.trim() || loading}
            className="btn-primary flex items-center gap-2 py-2 px-4 disabled:opacity-40"
          >
            <Send size={14} />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
