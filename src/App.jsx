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

  const saveQuizResults = async () => {
    if (!quizEngine.isComplete || questions.length === 0 || !user) return

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

  const updateStreakAfterQuiz = async () => {
    if (!user) {
      console.log('No user logged in, skipping streak update')
      return
    }

    try {
      const { error } = await supabase.rpc('update_streak_on_quiz', {
        user_uuid: user.id
      })

      if (error) throw error
      console.log('✅ Streak updated successfully!')

      const { data: stats } = await supabase
        .from('user_stats')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .single()

      if (stats) {
        console.log(`New streak: ${stats.current_streak} days! 🔥`)
      }
    } catch (error) {
      console.error('Streak update error:', error)
    }
  }

  const handleQuizComplete = async () => {
    await saveQuizResults()
    await updateStreakAfterQuiz()
    setQuizComplete(true)
  }

  useEffect(() => {
    if (quizEngine.isComplete && !quizComplete) {
      handleQuizComplete()
    }
  }, [quizEngine.isComplete, quizComplete, user])

  const startQuiz = async (difficulty = 'medium') => {
    const fetchedQuestions = await fetchCSQuestions(15, difficulty)
    setQuestions(fetchedQuestions)
    setQuizStarted(true)
    setStartTime(Date.now())
    setTimeSpent(0)
    setQuizComplete(false)
    quizEngine.reset?.()
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
              <button
                onClick={async () => {
                  const { data, error } = await supabase
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                  console.log('Current stats:', data)
                  alert(`Streak: ${data?.current_streak || 0}\nLast quiz: ${data?.last_quiz_date || 'never'}`)
                }}
                className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs"
              >
                Check Stats
              </button>
              <button
                onClick={async () => {
                  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

                  if (authError) {
                    console.error('Auth Error:', authError)
                    alert(`Error: ${authError.message}`)
                    return
                  }

                  const { error } = await supabase.rpc('update_streak_on_quiz', {
                    user_uuid: authUser.id
                  })

                  if (error) {
                    console.error('RPC Error:', error)
                    alert(`Error: ${error.message}`)
                  } else {
                    const { data: stats } = await supabase
                      .from('user_stats')
                      .select('current_streak, longest_streak, last_quiz_date')
                      .eq('user_id', authUser.id)
                      .single()

                    alert(`✅ Streak updated!\nCurrent: ${stats?.current_streak}\nLongest: ${stats?.longest_streak}`)
                  }
                }}
                className="fixed bottom-32 right-4 bg-purple-600 text-white px-3 py-1 rounded text-xs"
              >
                Test Streak RPC
              </button>
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