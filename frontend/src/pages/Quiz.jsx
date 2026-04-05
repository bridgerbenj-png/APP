import { useState } from 'react';
import { Loader2, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { vocabData } from '../data/vocab.js';
import { conjugate, FORM_LABELS } from '../utils/conjugation.js';
import { callClaude, SYSTEM_PROMPTS } from '../utils/api.js';

const QUIZ_SIZE = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(correct, pool, count = 3) {
  const others = pool.filter(x => x !== correct);
  return shuffle(others).slice(0, count);
}

function buildVocabQuestion(word) {
  const allMeanings = vocabData.map(v => v.meaning);
  const distractors = pickDistractors(word.meaning, allMeanings, 3);
  const choices = shuffle([word.meaning, ...distractors]);
  return {
    type: 'vocab',
    prompt: word.word,
    sub: word.reading,
    choices,
    correct: word.meaning,
    wordId: word.id,
  };
}

const CONJUGATION_FORMS = ['te', 'nai', 'ta', 'ba', 'tara', 'masu'];

function buildConjugationQuestion() {
  const verbs = vocabData.filter(v => v.type === 'verb');
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const form = CONJUGATION_FORMS[Math.floor(Math.random() * CONJUGATION_FORMS.length)];
  const correct = conjugate(verb.reading, verb.group, form);
  if (!correct) return buildVocabQuestion(vocabData[Math.floor(Math.random() * vocabData.length)]);
  return {
    type: 'conjugation',
    prompt: `${verb.word} (${verb.reading})`,
    sub: `→ ${FORM_LABELS[form]}`,
    inputType: 'text',
    correct,
    verb,
    form,
  };
}

function generateQuiz() {
  const questions = [];
  const allWords = shuffle(vocabData);

  for (let i = 0; i < QUIZ_SIZE; i++) {
    if (i % 3 === 2) {
      questions.push(buildConjugationQuestion());
    } else {
      questions.push(buildVocabQuestion(allWords[i % allWords.length]));
    }
  }
  return questions;
}

export default function Quiz() {
  const [apiKey] = useLocalStorage('apiKey', '');
  const [questions, setQuestions] = useState(() => generateQuiz());
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]); // { correct, given, explanation }
  const [selected, setSelected] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [explLoading, setExplLoading] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[current];

  const fetchExplanation = async (question, given, correct) => {
    if (!apiKey) return;
    setExplLoading(true);
    try {
      let msg;
      if (question.type === 'vocab') {
        msg = `The student was asked: what does "${question.prompt}" (${question.sub}) mean?\nThey answered: "${given}"\nCorrect answer: "${correct}"\nBriefly explain why.`;
      } else {
        msg = `The student was asked to conjugate ${question.prompt} into the ${FORM_LABELS[question.form]}.\nThey answered: "${given}"\nCorrect answer: "${correct}"\nBriefly explain the conjugation rule.`;
      }
      const text = await callClaude({ messages: [{ role: 'user', content: msg }], systemPrompt: SYSTEM_PROMPTS.quizExplain, apiKey });
      setExplanation(text);
    } catch {
      setExplanation('');
    } finally {
      setExplLoading(false);
    }
  };

  const submit = async (given) => {
    if (submitted) return;
    const isCorrect = given.trim() === q.correct;
    setSubmitted(true);
    setSelected(given);

    const record = { correct: isCorrect, given, expected: q.correct };
    setAnswers(prev => [...prev, record]);

    if (!isCorrect) {
      await fetchExplanation(q, given, q.correct);
    }
  };

  const next = () => {
    if (current + 1 >= QUIZ_SIZE) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTextInput('');
      setSubmitted(false);
      setExplanation('');
    }
  };

  const restart = () => {
    setQuestions(generateQuiz());
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setTextInput('');
    setSubmitted(false);
    setExplanation('');
    setDone(false);
  };

  if (done) {
    const score = answers.filter(a => a.correct).length;
    const pct = Math.round((score / QUIZ_SIZE) * 100);
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="card text-center py-8 space-y-4">
          <Trophy size={40} className="mx-auto text-amber-400" />
          <h2 className="text-2xl font-bold text-slate-800">Quiz complete!</h2>
          <div className="text-5xl font-bold text-indigo-600">{score}/{QUIZ_SIZE}</div>
          <p className="text-slate-500">{pct >= 80 ? 'Great work!' : pct >= 60 ? 'Good effort!' : 'Keep practicing!'} ({pct}%)</p>
        </div>

        <div className="card space-y-3">
          <h3 className="font-semibold text-slate-700">Review</h3>
          {answers.map((a, i) => (
            <div key={i} className={`flex items-start gap-2 text-sm py-1 border-b border-slate-50 last:border-0`}>
              {a.correct
                ? <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                : <XCircle    size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              }
              <div>
                <span className="font-jp">{questions[i].prompt}</span>
                {!a.correct && <span className="text-slate-400"> → correct: <strong className="text-emerald-600 font-jp">{a.expected}</strong></span>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={restart} className="btn-primary w-full flex items-center justify-center gap-2">
          <RotateCcw size={14} /> New Quiz
        </button>
      </div>
    );
  }

  const isMultiChoice = q.type === 'vocab';
  const progressPct = (current / QUIZ_SIZE) * 100;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <div className="flex justify-between text-sm text-slate-400 mb-1.5">
          <span>Question {current + 1} of {QUIZ_SIZE}</span>
          <span>{answers.filter(a => a.correct).length} correct so far</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="card space-y-4">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">
          {q.type === 'vocab' ? 'Vocabulary' : 'Conjugation'}
        </div>
        <div className="text-center py-2">
          <p className="text-4xl font-jp font-bold text-slate-800">{q.prompt}</p>
          <p className="text-slate-400 mt-1 text-sm">{q.sub}</p>
        </div>
        {isMultiChoice ? (
          <p className="text-center text-slate-500 text-sm">What does this mean?</p>
        ) : (
          <p className="text-center text-indigo-600 text-sm font-medium">{q.sub}</p>
        )}
      </div>

      {isMultiChoice ? (
        <div className="grid grid-cols-1 gap-2">
          {q.choices.map((choice, i) => {
            let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ';
            if (!submitted) {
              cls += 'border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-700';
            } else if (choice === q.correct) {
              cls += 'border-emerald-400 bg-emerald-50 text-emerald-800';
            } else if (choice === selected) {
              cls += 'border-red-300 bg-red-50 text-red-700';
            } else {
              cls += 'border-slate-100 bg-slate-50 text-slate-400';
            }
            return (
              <button key={i} className={cls} onClick={() => submit(choice)} disabled={submitted}>
                {choice}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="card space-y-3">
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 font-jp text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-50"
            placeholder="type answer..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !submitted && submit(textInput)}
            disabled={submitted}
            autoFocus
          />
          {!submitted && (
            <button onClick={() => submit(textInput)} disabled={!textInput.trim()} className="btn-primary w-full">
              Submit
            </button>
          )}
        </div>
      )}

      {/* Feedback */}
      {submitted && (
        <div className={`rounded-xl p-4 space-y-2 ${answers.at(-1)?.correct ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
          <div className="flex items-center gap-2">
            {answers.at(-1)?.correct
              ? <><CheckCircle size={16} className="text-emerald-500" /><span className="font-semibold text-emerald-700 text-sm">Correct!</span></>
              : <><XCircle size={16} className="text-red-400" /><span className="font-semibold text-red-700 text-sm">Incorrect — answer: <span className="font-jp">{q.correct}</span></span></>
            }
          </div>
          {explLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 size={12} className="animate-spin" /> Explaining...
            </div>
          )}
          {explanation && <p className="text-sm text-slate-600 leading-relaxed">{explanation}</p>}
        </div>
      )}

      {submitted && (
        <button onClick={next} className="btn-primary w-full">
          {current + 1 >= QUIZ_SIZE ? 'See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}
