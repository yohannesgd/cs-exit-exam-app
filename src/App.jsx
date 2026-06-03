// src/App.jsx - Full working version
import { useState, useEffect } from 'react'
import { useQuizEngine } from './hooks/useQuizEngine'
import { fetchCSQuestions } from './services/api'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'

function App() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState(null)

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

  const startQuiz = async (difficulty = 'medium') => {
    setLoading(true)
    try {
      const fetchedQuestions = await fetchCSQuestions(15, difficulty)
      setQuestions(fetchedQuestions)
      setQuizStarted(true)
      setStartTime(Date.now())
      setTimeSpent(0)
    } catch (error) {
      console.error('Error starting quiz:', error)
      alert('Failed to load questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetQuiz = () => {
    setQuestions([])
    setQuizStarted(false)
    setTimeSpent(0)
    setStartTime(null)
  }

  // Welcome Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                CS Exit Exam Prep
              </h1>
              <p className="text-xl text-gray-600">
                Master Computer Science fundamentals with our comprehensive quizzes
              </p>
            </div>

            {/* Start Quiz Card */}
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

            {/* Loading Indicator */}
            {loading && (
              <div className="mt-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading questions...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Results Screen
  if (quizEngine.isComplete) {
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