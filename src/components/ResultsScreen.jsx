// src/components/ResultsScreen.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Trophy, CheckCircle, XCircle, Clock, Target, RefreshCw, Home, Flame } from 'lucide-react'

function ResultsScreen({ score, totalQuestions, answers, questions, onRestart, timeSpent, user }) {
  const [streakInfo, setStreakInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreakInfo()
  }, [user])

  const fetchStreakInfo = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      console.log('Fetching streak for user:', user.id)
      
      const { data, error } = await supabase
        .from('user_stats')
        .select('current_streak, longest_streak, last_quiz_date, total_xp')
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching streak:', error)
      } else {
        console.log('Streak data:', data)
        setStreakInfo(data)
      }
    } catch (err) {
      console.error('Failed to fetch streak:', err)
    } finally {
      setLoading(false)
    }
  }

  const percentage = (score / totalQuestions) * 100

  useEffect(() => {
    if (percentage < 90) return

    const colors = ['#F59E0B', '#EF4444', '#22C55E', '#3B82F6', '#A855F7']
    const pieces = []

    for (let i = 0; i < 24; i += 1) {
      const confetti = document.createElement('div')
      confetti.className = 'confetti-piece'
      confetti.style.left = `${Math.random() * 100}vw`
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.width = `${Math.floor(Math.random() * 8) + 6}px`
      confetti.style.height = `${Math.floor(Math.random() * 12) + 8}px`
      confetti.style.animationDelay = `${Math.random() * 0.5}s`
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`
      document.body.appendChild(confetti)
      pieces.push(confetti)
    }

    const cleanup = setTimeout(() => {
      pieces.forEach((piece) => {
        if (piece.parentElement) piece.parentElement.removeChild(piece)
      })
    }, 3500)

    return () => {
      clearTimeout(cleanup)
      pieces.forEach((piece) => {
        if (piece.parentElement) piece.parentElement.removeChild(piece)
      })
    }
  }, [percentage])
  const correctCount = score
  const incorrectCount = totalQuestions - score

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} min ${secs} sec`
  }

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { emoji: '🏆', message: 'Outstanding! You\'re a CS Expert!', color: 'text-yellow-600' }
    if (percentage >= 75) return { emoji: '🎯', message: 'Great Job! You\'re Well Prepared!', color: 'text-blue-600' }
    if (percentage >= 60) return { emoji: '👍', message: 'Good Effort! Keep Studying!', color: 'text-green-600' }
    if (percentage >= 45) return { emoji: '📚', message: 'Keep Going! Review the Material!', color: 'text-orange-600' }
    return { emoji: '💪', message: 'Don\'t Give Up! Practice Makes Perfect!', color: 'text-red-600' }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <p className="text-gray-600">Here's how you performed on the CS Exit Exam</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
            <div className="text-sm font-medium opacity-90 mb-2">Your Score</div>
            <div className="text-6xl font-bold mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-2xl font-semibold mb-4">
              {percentage.toFixed(1)}%
            </div>
            <div className="text-sm font-medium text-white/90 mb-4">
              {percentage >= 90 && <span>🏆 Gold Medal!</span>}
              {percentage >= 75 && percentage < 90 && <span>🥈 Silver Medal!</span>}
              {percentage >= 60 && percentage < 75 && <span>🥉 Bronze Medal!</span>}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{correctCount}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{incorrectCount}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
          </div>

          {/* Streak Celebration Card */}
          {!loading && streakInfo && streakInfo.current_streak > 0 && (
            <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-b">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="h-8 w-8 text-orange-500" />
                  <span className="text-3xl font-bold text-orange-600">{streakInfo.current_streak}</span>
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-lg font-semibold text-orange-800">
                  Day Streak!
                </p>
                {streakInfo.current_streak === 1 && (
                  <p className="text-sm text-orange-600 mt-1">🔥 Great start! Keep it going tomorrow!</p>
                )}
                {streakInfo.current_streak === 7 && (
                  <p className="text-sm text-orange-600 mt-1">🏆 Amazing! You've earned the 'Week Warrior' badge!</p>
                )}
                {streakInfo.current_streak === 30 && (
                  <p className="text-sm text-orange-600 mt-1">👑 LEGENDARY! 30-day streak achieved!</p>
                )}
                {streakInfo.current_streak > 1 && streakInfo.current_streak < 7 && (
                  <p className="text-sm text-orange-600 mt-1">🔥 You're on fire! Don't break the streak!</p>
                )}
                {streakInfo.current_streak > 7 && streakInfo.current_streak < 30 && (
                  <p className="text-sm text-orange-600 mt-1">💪 Incredible dedication! Keep pushing!</p>
                )}
                {streakInfo.longest_streak > 0 && (
                  <p className="text-xs text-orange-500 mt-2">
                    Best streak: {streakInfo.longest_streak} days
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Performance Message */}
          <div className="p-6 text-center border-b">
            <div className="text-4xl mb-2">{performance.emoji}</div>
            <p className={`text-xl font-semibold ${performance.color}`}>
              {performance.message}
            </p>
          </div>

          {/* Buttons */}
          <div className="p-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                onRestart()
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <RefreshCw className="h-5 w-5" />
              Take Another Quiz
            </button>

            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={async () => {
                  const { data: { user: currentUser } } = await supabase.auth.getUser()
                  if (!currentUser) return alert('Not logged in')

                  try {
                    const { error } = await supabase.rpc('update_streak_on_quiz', {
                      user_uuid: currentUser.id
                    })

                    if (error) {
                      console.error('RPC Error:', error)
                      return alert(`Error: ${error.message}`)
                    }

                    const { data: stats, error: statsError } = await supabase
                      .from('user_stats')
                      .select('current_streak, longest_streak, last_quiz_date')
                      .eq('user_id', currentUser.id)
                      .single()

                    if (statsError) throw statsError

                    alert(`✅ Streak updated!\nCurrent: ${stats?.current_streak}\nLongest: ${stats?.longest_streak}\nLast quiz: ${stats?.last_quiz_date}`)
                  } catch (err) {
                    console.error('Streak test error:', err)
                    alert('Failed to update streak: ' + (err.message || err))
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
              >
                <Flame className="h-5 w-5" />
                Test Streak Update
              </button>
            )}

            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Answer Review Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Detailed Review
            </h2>
          </div>
          <div className="divide-y">
            {answers.map((answer, idx) => {
              const question = questions[idx]
              const isCorrect = answer.correct
              
              return (
                <div key={idx} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{question.question}</h3>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Your answer: </span>
                          <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                            {answer.selected || 'No answer'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="font-medium text-gray-700">Correct answer: </span>
                            <span className="text-green-700">{question.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsScreen