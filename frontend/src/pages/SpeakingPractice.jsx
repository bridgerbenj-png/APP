import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { callClaude } from '../utils/api.js';

const SYSTEM_PROMPT = `You are a warm, encouraging Japanese language tutor reviewing a student's spoken Japanese.
The student is at N5-N4 level (roughly 5 months of study).
The text you receive is a speech recognition transcript of what the student said in Japanese.

Respond using this structure (use ** for bold headers):
**What you said:** restate the Japanese clearly — fix any obvious speech recognition errors if you can infer them from context.
**Translation:** a natural English translation.
**Grammar feedback:** 2-3 specific points on what was correct and what could be improved. Note any errors with corrections.
**More natural version:** if their phrasing was unnatural, show a better alternative with a brief explanation. If it was already natural, say so.

Be friendly, concise, and encouraging. The student should feel motivated.`;

export default function SpeakingPractice() {
  const [apiKey] = useLocalStorage('apiKey', '');
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    setError('');
    const rec = new SR();
    rec.lang = 'ja-JP';
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      const full = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(full);
    };
    rec.onerror = (e) => {
      setError('Microphone error: ' + e.error + '. Make sure microphone access is allowed.');
      setRecording(false);
    };
    rec.onend = () => setRecording(false);
    recRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const submit = async () => {
    if (!transcript.trim() || loading) return;
    if (!apiKey) { setError('Add your API key in Settings first.'); return; }
    const userText = transcript.trim();
    setTranscript('');
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
          <h1 className="text-xl font-bold text-slate-800">Speaking Practice</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Speak freely in Japanese — submit when ready for feedback.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setTranscript(''); setError(''); }}
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
            <Mic size={40} />
            <p className="font-medium text-slate-500">Start speaking</p>
            <p className="text-sm text-center max-w-xs">
              Press Record, speak Japanese freely, then hit Submit for a translation and feedback.
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
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder={recording ? 'Listening…' : 'Press Record, or type Japanese here directly…'}
          rows={3}
          className="w-full text-base text-slate-800 font-jp resize-none focus:outline-none placeholder:text-slate-400"
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              recording
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {recording ? <MicOff size={15} /> : <Mic size={15} />}
            {recording ? 'Stop' : 'Record'}
          </button>
          <button
            onClick={submit}
            disabled={!transcript.trim() || loading}
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
