import { useState, useRef, useEffect } from 'react';
import { Search, Send, Loader2, ChevronRight, Tag } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { grammarData } from '../data/grammar.js';
import { callClaude, SYSTEM_PROMPTS } from '../utils/api.js';

const LEVEL_COLORS = { N5: 'bg-green-100 text-green-700', N4: 'bg-blue-100 text-blue-700', N3: 'bg-violet-100 text-violet-700' };

function renderMarkdown(text) {
  // Very simple markdown renderer — enough for our grammar explanations
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .split('\n\n')
    .map(p => p.startsWith('<') ? p : `<p>${p}</p>`)
    .join('\n');
}

export default function Grammar() {
  const [apiKey]              = useLocalStorage('apiKey', '');
  const [query, setQuery]     = useState('');
  const [selected, setSelected]   = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const chatEndRef = useRef(null);

  const filtered = grammarData.filter(g =>
    g.name.toLowerCase().includes(query.toLowerCase()) ||
    g.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
    g.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadGrammar = async (point) => {
    setSelected(point);
    setExplanation('');
    setChatMessages([]);
    setError('');
    if (!apiKey) { setError('Add your API key in Settings first.'); return; }

    setLoading(true);
    try {
      const text = await callClaude({
        messages: [{ role: 'user', content: point.prompt }],
        systemPrompt: SYSTEM_PROMPTS.grammar,
        apiKey,
      });
      setExplanation(text);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCustom = async () => {
    if (!customQuery.trim()) return;
    const fake = { name: customQuery, prompt: `Explain the Japanese grammar point: ${customQuery}. Provide a thorough explanation with structure, examples, nuances, and common mistakes.` };
    setCustomQuery('');
    await loadGrammar(fake);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: 'user', content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const history = [
        { role: 'user', content: selected.prompt },
        { role: 'assistant', content: explanation },
        ...chatMessages,
        userMsg,
      ];
      const reply = await callClaude({ messages: history, systemPrompt: SYSTEM_PROMPTS.grammar, apiKey });
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
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

        {/* Custom search */}
        <div className="flex gap-1">
          <input
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Ask anything..."
            value={customQuery}
            onChange={e => setCustomQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadCustom()}
          />
          <button onClick={loadCustom} className="btn-primary px-2.5 py-2 text-sm">
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-1 pr-1">
          {filtered.map(g => (
            <button
              key={g.id}
              onClick={() => loadGrammar(g)}
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
            <Tag size={32} />
            <p className="font-medium text-slate-500">Select a grammar point</p>
            <p className="text-sm">Or type any grammar topic in the search box on the left.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-4 flex items-start gap-3 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-jp text-slate-800">{selected.name}</h2>
                  {selected.level && (
                    <span className={`badge ${LEVEL_COLORS[selected.level] ?? 'bg-slate-100 text-slate-600'}`}>{selected.level}</span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mt-0.5">{selected.shortDesc}</p>
                {selected.structure && (
                  <p className="text-xs text-indigo-600 bg-indigo-50 rounded px-2 py-1 mt-1 inline-block font-jp">{selected.structure}</p>
                )}
              </div>
            </div>

            {/* Explanation */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Generating explanation...
                </div>
              )}
              {error && <div className="text-red-500 text-sm bg-red-50 rounded p-3">{error}</div>}
              {explanation && (
                <div
                  className="prose-japanese card"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(explanation) }}
                />
              )}

              {/* Follow-up chat */}
              {explanation && (
                <div className="card space-y-3">
                  <h3 className="text-sm font-semibold text-slate-600">Ask a follow-up question</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`text-sm rounded-lg px-3 py-2 ${m.role === 'user' ? 'bg-indigo-50 text-indigo-800 ml-6' : 'bg-slate-50 text-slate-700 mr-6'}`}>
                        {m.content}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Loader2 size={14} className="animate-spin" /> Thinking...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="e.g. How does this differ from たら?"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                    />
                    <button onClick={sendChat} disabled={chatLoading} className="btn-primary px-3">
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
