import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const TYPES = ['noun', 'verb', 'i-adj', 'na-adj', 'expression'];

export default function NotesToFlashcards() {
  const [customVocab, setCustomVocab] = useLocalStorage('customVocab', []);
  const [notes, setNotes] = useState('');
  const [parsedItems, setParsedItems] = useState([]);

  const parseNotes = () => {
    const lines = notes.split('\n').filter(line => line.trim());
    const items = lines.map(line => {
      // Assume format: word (reading) - meaning
      const match = line.match(/^(.+?)\s*\((.+?)\)\s*-\s*(.+)$/);
      if (match) {
        const [, word, reading, meaning] = match;
        return { word: word.trim(), reading: reading.trim(), meaning: meaning.trim(), type: 'noun' }; // default type
      }
      return null;
    }).filter(Boolean);
    setParsedItems(items);
  };

  const addVocab = (item) => {
    const newId = Math.max(...customVocab.map(v => v.id), 0) + 1;
    const vocabItem = { ...item, id: newId, example: '' };
    setCustomVocab(prev => [...prev, vocabItem]);
    setParsedItems(prev => prev.filter(i => i !== item));
  };

  const removeParsed = (item) => {
    setParsedItems(prev => prev.filter(i => i !== item));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Notes to Flashcards</h1>
        <p className="text-slate-600">Paste your lesson notes and create flashcards to practice.</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Lesson Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes in format: word (reading) - meaning&#10;Example:&#10;食べる (たべる) - to eat&#10;話す (はなす) - to speak"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={8}
          />
        </label>
        <button onClick={parseNotes} className="btn-primary flex items-center gap-2">
          <BookOpen size={16} /> Parse Notes
        </button>
      </div>

      {parsedItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Parsed Vocabulary</h2>
          <div className="space-y-2">
            {parsedItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-medium">{item.word}</span> ({item.reading}) - {item.meaning}
                </div>
                <div className="flex gap-2">
                  <select
                    value={item.type}
                    onChange={(e) => setParsedItems(prev => prev.map((i, idx) => idx === index ? { ...i, type: e.target.value } : i))}
                    className="rounded border-slate-300 text-sm"
                  >
                    {TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <button onClick={() => addVocab(item)} className="btn-secondary text-sm">
                    <Plus size={14} /> Add
                  </button>
                  <button onClick={() => removeParsed(item)} className="btn-secondary text-sm text-red-600">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {customVocab.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Your Custom Vocabulary ({customVocab.length})</h2>
          <div className="space-y-2">
            {customVocab.map(item => (
              <div key={item.id} className="p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">{item.word}</span> ({item.reading}) - {item.meaning} <span className="text-sm text-slate-500">({item.type})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}