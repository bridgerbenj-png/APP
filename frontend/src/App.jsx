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
import SpeakingPractice from './pages/SpeakingPractice.jsx';
import WritingPractice from './pages/WritingPractice.jsx';
import FloatingCharacters from './components/FloatingCharacters.jsx';
import Chat from './pages/Chat.jsx';
import WorkHistory from './pages/WorkHistory.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <FloatingCharacters />
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/history" element={<WorkHistory />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/grammar" element={<Grammar />} />
          <Route path="/conjugation" element={<Conjugation />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/sentences" element={<SentencePractice />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/speaking" element={<SpeakingPractice />} />
          <Route path="/writing" element={<WritingPractice />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
