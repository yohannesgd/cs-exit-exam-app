// src/App.jsx
import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useQuizEngine } from './hooks/useQuizEngine'
import { fetchCSQuestions } from './services/api'
import { supabase } from './services/supabase'
import { Login } from './components/Auth/Login'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'
import { Leaderboard } from './components/Leaderboard/Leaderboard';


function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [questions, setQuestions] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [quizComplete, setQuizComplete] = useState(false)
  const [quizKey, setQuizKey] = useState(0) // Force re-render
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome', 'leaderboard', 'quiz', 'results'
  
  const quizEngine = useQuizEngine(questions)

  // Timer effect
  useEffect(() => {
    let interval
    if (quizStarted && !quizEngine.isComplete && startTime) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizStarted, quizEngine.isComplete, startTime])

  const startQuiz = async (difficulty) => {
  setLoading(true);
  try {
    const fetchedQuestions = await fetchCSQuestions(15, difficulty);
    setQuestions(fetchedQuestions);
    setCurrentScreen('quiz'); // 👈 navigate to quiz screen
    setStartTime(Date.now());
    setTimeSpent(0);
  } catch (error) {
    console.error('Error starting quiz:', error);
    alert('Failed to load questions. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleQuizComplete = async () => {
  await saveQuizResults();
  setCurrentScreen('results'); // 👈 go to results screen
};

const resetQuiz = () => {
  setQuestions([]);
  setTimeSpent(0);
  setStartTime(null);
  setQuizKey(prev => prev + 1);
  setCurrentScreen('welcome'); // 👈 back to welcome
};
const [loading, setLoading] = useState(false)

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
// Inside App component, after auth loading check and user check
if (!user) return <Login onLogin={() => window.location.reload()} />;

// Render based on currentScreen
switch (currentScreen) {
  case 'leaderboard':
    return (
      <>
        <Header user={user} signOut={signOut} setCurrentScreen={setCurrentScreen} />
        <Leaderboard />
      </>
    );
  case 'quiz':
    return (
      <>
        <Header user={user} signOut={signOut} setCurrentScreen={setCurrentScreen} />
        <QuizScreen
          key={quizKey}
          currentQuestion={quizEngine.currentQuestion}
          selected={quizEngine.selected}
          showExplanation={quizEngine.showExplanation}
          onSelect={quizEngine.handleSelect}
          onNext={quizEngine.nextQuestion}
          progress={quizEngine.progress}
          score={quizEngine.score}
          totalQuestions={questions.length}
          timeSpent={timeSpent}
          onComplete={handleQuizComplete}
        />
      </>
    );
  case 'results':
    return (
      <>
        <Header user={user} signOut={signOut} setCurrentScreen={setCurrentScreen} />
        <ResultsScreen
          score={quizEngine.score}
          totalQuestions={questions.length}
          answers={quizEngine.answers}
          questions={questions}
          onRestart={() => {
            resetQuiz();
            setCurrentScreen('welcome');
          }}
          timeSpent={timeSpent}
          user={user}
        />
      </>
    );
  default: // 'welcome' screen
    return (
      <>
        <Header user={user} signOut={signOut} setCurrentScreen={setCurrentScreen} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                CS Exit Exam Prep
              </h1>
              <p className="text-xl text-gray-600">
                Master Computer Science fundamentals with our comprehensive quizzes
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Test Your Knowledge?
              </h2>
              <p className="text-gray-600 mb-6">
                15 multiple-choice questions • 30 seconds per question • Instant feedback
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => startQuiz('easy')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Easy Mode 🌱
                </button>
                <button
                  onClick={() => startQuiz('medium')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Standard Mode ⚡
                </button>
                <button
                  onClick={() => startQuiz('hard')}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Hard Mode 🎯
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
}

  
}

export default App