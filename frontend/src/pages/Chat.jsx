import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw, Bot } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { callClaude } from '../utils/api.js';

const SYSTEM_PROMPT = `You are a friendly and knowledgeable Japanese language tutor. The student has been studying Japanese for about 5 months and is at roughly N5 level, working toward N4. They are currently focused on conditional forms (ば, たら, なら, と).

You can help with anything Japanese-related:
- Grammar explanations and comparisons
- Vocabulary questions
- Sentence translation and checking
- Cultural context
- Study advice
- General questions about the language

When showing Japanese, always include the reading (hiragana/romaji) and an English translation unless the student specifically asks otherwise. Keep explanations clear, friendly, and appropriately detailed — not too long, not too brief. Use **bold** for key terms.`;

const SUGGESTIONS = [
  "What's the difference between は and が?",
  "How do I say 'I want to go to Japan'?",
  "Can you explain ている vs ていた?",
  "What does よろしくお願いします mean?",
  "How do I count things in Japanese?",
  "Explain the difference between ば and たら",
];

export default function Chat() {
  const [apiKey] = useLocalStorage('apiKey', '');
  const [messages, setMessages] = useLocalStorage('chatHistory', []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    if (!apiKey) { setError('Add your API key in Settings first.'); return; }
    setInput('');
    setError('');
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setLoading(true);
    try {
      const reply = await callClaude({
        messages: next,
        systemPrompt: SYSTEM_PROMPT,
        apiKey,
      });
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-88px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Chat</h1>
          <p className="text-slate-500 text-sm mt-0.5">Ask anything about Japanese — grammar, vocab, culture, anything.</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setError(''); }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw size={13} /> New chat
          </button>
        )}
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-8">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Bot size={40} />
              <p className="font-medium text-slate-500">What would you like to know?</p>
              <p className="text-sm">Ask anything about Japanese.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              m.role === 'user'
                ? 'bg-indigo-600 text-white text-sm'
                : 'bg-white border border-slate-100 shadow-sm text-slate-700 text-sm whitespace-pre-wrap leading-relaxed'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={14} className="animate-spin" /> Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mb-3 flex-shrink-0">{error}</p>
      )}

      {/* Input */}
      <div className="flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="w-full text-sm text-slate-800 resize-none focus:outline-none placeholder:text-slate-400"
        />
        <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="btn-primary flex items-center gap-2 py-2 px-4 disabled:opacity-40"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
