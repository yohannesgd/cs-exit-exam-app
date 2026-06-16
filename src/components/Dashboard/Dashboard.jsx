// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { StreakCard } from './StreakCard'
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target,
  Award,
  Flame,
  BarChart3,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()
  const [quizHistory, setQuizHistory] = useState([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalXP: 0,
    lastQuizDate: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch quiz history
      const { data: attempts, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setQuizHistory(attempts || [])
      calculateStats(attempts || [])
      await refreshStreak()
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (attempts) => {
    if (attempts.length === 0) {
      setStats({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalXP: 0,
        lastQuizDate: null
      })
      return
    }

    const totalQuizzes = attempts.length
    const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0)
    const averageScore = totalScore / totalQuizzes
    const bestScore = Math.max(...attempts.map(a => a.score || 0))
    const totalTime = attempts.reduce((sum, a) => sum + (a.time_taken || 0), 0)
    const totalXP = attempts.reduce((sum, a) => sum + ((a.score || 0) * 10), 0)

    setStats({
      totalQuizzes,
      averageScore: averageScore.toFixed(1),
      bestScore,
      totalTime,
      totalXP,
      currentStreak: 0,
      longestStreak: 0,
      lastQuizDate: null
    })
  }

  const refreshStreak = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_stats')
      .select('current_streak, longest_streak, last_quiz_date')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error refreshing streak:', error)
      return
    }

    if (data) {
      setStats(prev => ({
        ...prev,
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastQuizDate: data.last_quiz_date
      }))
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score) => {
    if (score >= 90) return '🏆 Excellent'
    if (score >= 70) return '👍 Good'
    if (score >= 50) return '📚 Keep Going'
    return '💪 Need Practice'
  }

  // Add this at the top of your Dashboard component
{!user?.email_confirmed_at && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700">
          ⚠️ Please verify your email address. 
          <button 
            onClick={async () => {
              const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email
              })
              if (error) {
                alert('Failed to resend: ' + error.message)
              } else {
                alert('✅ Verification email sent! Check your inbox.')
              }
            }}
            className="ml-2 text-yellow-800 font-medium hover:underline"
          >
            Resend verification email
          </button>
        </p>
      </div>
    </div>
  </div>
)}

if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
 
return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-blue-100">Track your progress and performance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Quizzes</h3>
            <p className="text-sm text-gray-400 mt-1">Completed challenges</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.averageScore}%</span>
            </div>
            <h3 className="text-gray-600 font-medium">Average Score</h3>
            <p className="text-sm text-gray-400 mt-1">Across all quizzes</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Flame className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.currentStreak}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Current Streak</h3>
            <p className="text-sm text-gray-400 mt-1">Days in a row</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Award className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalXP}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total XP</h3>
            <p className="text-sm text-gray-400 mt-1">Experience points</p>
          </div>

          <div className="lg:col-span-2">
            <StreakCard
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              lastQuizDate={stats.lastQuizDate}
            />
          </div>
        </div>

        <details className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
          <summary className="cursor-pointer font-medium">Streak Debug Info</summary>
          <pre className="mt-2">
            {JSON.stringify({
              currentStreak: stats.currentStreak,
              longestStreak: stats.longestStreak,
              lastQuizDate: stats.lastQuizDate,
              today: new Date().toISOString().split('T')[0]
            }, null, 2)}
          </pre>
        </details>

        <button
          onClick={async () => {
            const { data: { user } } = await supabase.auth.getUser()
            console.log('Current user:', user?.id)

            const { data, error } = await supabase
              .from('user_stats')
              .select('*')
              .eq('user_id', user.id)
              .single()

            if (error) {
              console.error('Error:', error)
              alert(`Error: ${error.message}`)
            } else {
              console.log('Stats:', data)
              alert(`Streak: ${data.current_streak}\nLongest: ${data.longest_streak}\nLast quiz: ${data.last_quiz_date}`)
            }
          }}
          className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs"
        >
          Check Streak Data
        </button>

        {/* Best Performance Card */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8 border border-yellow-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🏆 Best Performance</h3>
              <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.bestScore}%</p>
              <p className="text-sm text-gray-600">Your highest score yet!</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        {/* Quiz History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Recent Quiz History</h2>
          </div>

          {quizHistory.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No quizzes taken yet</p>
              <p className="text-sm text-gray-400 mt-1">Take your first quiz to see history!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {quizHistory.slice(0, 10).map((attempt, idx) => (
                <div key={idx} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg ${
                        attempt.score >= 70 ? 'bg-green-100 text-green-600' :
                        attempt.score >= 50 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {attempt.score}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {getScoreBadge(attempt.score)}
                          </span>
                          <span className={`text-sm font-medium ${getScoreColor(attempt.score)}`}>
                            {attempt.correct_answers}/{attempt.total_questions} correct
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {Math.floor(attempt.time_taken / 60)} min {attempt.time_taken % 60} sec
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(attempt.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">XP Earned</div>
                      <div className="text-xl font-bold text-purple-600">
                        +{(attempt.score || 0) * 10} XP
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
}