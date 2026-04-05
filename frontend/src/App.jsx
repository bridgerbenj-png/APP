import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Flashcards from './pages/Flashcards.jsx';
import Grammar from './pages/Grammar.jsx';
import Conjugation from './pages/Conjugation.jsx';
import Quiz from './pages/Quiz.jsx';
import Settings from './pages/Settings.jsx';
import SentencePractice from './pages/SentencePractice.jsx';
import Listening from './pages/Listening.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/grammar" element={<Grammar />} />
          <Route path="/conjugation" element={<Conjugation />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/sentences" element={<SentencePractice />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
