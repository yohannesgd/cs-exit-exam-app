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
    setLoading(true)
    const fetchedQuestions = await fetchCSQuestions(15, difficulty);
    setQuestions(fetchedQuestions);
    setStartTime(Date.now());
    setTimeSpent(0);
    setCurrentScreen('quiz');
    setQuizStarted(true);
  };

  const handleQuizComplete = async () => {
    console.log('handleQuizComplete called')
    console.log('Quiz complete! Saving results...')
    
    if (!user) {
      console.log('No user, skipping save')
      setQuizComplete(true)
      return
    }
    
    try {
      // Save quiz attempt
      const { error: quizError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          score: quizEngine.score,
          total_questions: questions.length,
          correct_answers: quizEngine.score,
          time_taken: timeSpent,
          answers_data: quizEngine.answers,
          quiz_type: 'standard'
        })
      
      if (quizError) throw quizError
      console.log('✅ Quiz saved')
      
      // Update streak
      const { error: streakError } = await supabase.rpc('update_streak_on_quiz', {
        user_uuid: user.id
      })
      
      if (streakError) throw streakError
      console.log('✅ Streak updated')
      
      setQuizComplete(true)
      
    } catch (error) {
      console.error('Error:', error)
      // Still show results even if save fails
      setQuizComplete(true)
    }
  }

  const resetQuiz = () => {
  console.log('resetQuiz called')
  
  // Reset all states
  setQuestions([])
  setQuizStarted(false)
  setQuizComplete(false)
  setTimeSpent(0)
  setStartTime(null)
  
  // Reset quiz engine
  quizEngine.reset()
  
  // Increment key to force remount
  setQuizKey(prev => prev + 1)
  
  // Small delay to ensure state updates
  setTimeout(() => {
    console.log('Quiz reset complete')
  }, 100)
}
const [loading, setLoading] = useState(false)

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <Login onLogin={() => window.location.reload()} />
  }


  // Keep existing loading/login handling above.

  // Navigation by currentScreen: 'welcome', 'leaderboard', 'quiz', 'results'
  switch (currentScreen) {
    case 'leaderboard':
      return (
        <>
          <div className="bg-white shadow-sm p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">CS Exit Exam</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentScreen('welcome')}
                  className="text-gray-600 hover:text-purple-600"
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentScreen('leaderboard')}
                  className="text-gray-600 hover:text-purple-600"
                >
                  🏆 Leaderboard
                </button>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          <Leaderboard />
        </>
      )

    case 'quiz':
      return (
        <>
          <div className="bg-white shadow-sm p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">CS Exit Exam</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentScreen('welcome')}
                  className="text-gray-600 hover:text-purple-600"
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentScreen('leaderboard')}
                  className="text-gray-600 hover:text-purple-600"
                >
                  🏆 Leaderboard
                </button>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          <QuizScreen
            key={`quiz-${quizKey}`}
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
      )

    case 'results':
      return (
        <>
          <div className="bg-white shadow-sm p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">CS Exit Exam</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentScreen('welcome')}
                  className="text-gray-600 hover:text-purple-600"
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentScreen('leaderboard')}
                  className="text-gray-600 hover:text-purple-600"
                >
                  🏆 Leaderboard
                </button>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          <ResultsScreen
            key={`results-${quizKey}`}
            score={quizEngine.score}
            totalQuestions={questions.length}
            answers={quizEngine.answers}
            questions={questions}
            onRestart={() => {
              resetQuiz()
              setCurrentScreen('welcome')
            }}
            timeSpent={timeSpent}
            user={user}
          />
        </>
      )

    case 'welcome':
    default:
      return (
        <>
          <div className="bg-white shadow-sm p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">CS Exit Exam</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentScreen('welcome')}
                  className="text-gray-600 hover:text-purple-600"
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentScreen('leaderboard')}
                  className="text-gray-600 hover:text-purple-600"
                >
                  🏆 Leaderboard
                </button>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                      onClick={() => {
                        startQuiz('easy')
                        setCurrentScreen('quiz')
                      }}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      Easy Mode 🌱
                    </button>
                    <button
                      onClick={() => {
                        startQuiz('medium')
                        setCurrentScreen('quiz')
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Standard Mode ⚡
                    </button>
                    <button
                      onClick={() => {
                        startQuiz('hard')
                        setCurrentScreen('quiz')
                      }}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
                    >
                      Hard Mode 🎯
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )
  }


  
}

export default App