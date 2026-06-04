// src/App.jsx
import { Dashboard } from './components/Dashboard/Dashboard'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useQuizEngine } from './hooks/useQuizEngine'
import { fetchCSQuestions } from './services/api'
import { supabase } from './services/supabase'
import { Login } from './components/Auth/Login'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'

function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [questions, setQuestions] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [quizComplete, setQuizComplete] = useState(false)

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

  // Save quiz results to Supabase with user ID
  useEffect(() => {
    const saveResults = async () => {
      if (quizEngine.isComplete && questions.length > 0 && user) {
        try {
          const { error } = await supabase
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
          
          if (error) throw error
          console.log('✅ Quiz saved for user:', user.email)
        } catch (err) {
          console.error('Save error:', err)
        }
      }
    }
    
    saveResults()
  }, [quizEngine.isComplete, user])

  const startQuiz = async (difficulty = 'medium') => {
    const fetchedQuestions = await fetchCSQuestions(15, difficulty)
    setQuestions(fetchedQuestions)
    setQuizStarted(true)
    setStartTime(Date.now())
    setTimeSpent(0)
    setQuizComplete(false)
    quizEngine.reset?.()
  }

  const handleQuizComplete = () => {
    setQuizComplete(true)
  }

  const resetQuiz = () => {
    setQuestions([])
    setQuizStarted(false)
    setQuizComplete(false)
    setTimeSpent(0)
    setStartTime(null)
  }

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

  // Welcome Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header with user info */}
        <div className="bg-white shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">CS Exit Exam</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Dashboard
              </button>
              <button
                onClick={signOut}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

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
      </div>
    )
  }

  // Results Screen
  if (quizEngine.isComplete || quizComplete) {
    return (
      <ResultsScreen
        score={quizEngine.score}
        totalQuestions={questions.length}
        answers={quizEngine.answers}
        questions={questions}
        onRestart={resetQuiz}
        timeSpent={timeSpent}
      />
    )
  }

  // Quiz Screen
  return (
    <QuizScreen
      currentQuestion={quizEngine.currentQuestion}
      selected={quizEngine.selected}
      showExplanation={quizEngine.showExplanation}
      onSelect={quizEngine.handleSelect}
      onNext={quizEngine.nextQuestion}
      progress={quizEngine.progress}
      score={quizEngine.score}
      totalQuestions={questions.length}
      timeSpent={timeSpent}
    />
  )
}

export default App