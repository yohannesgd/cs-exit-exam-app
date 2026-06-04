// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
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
    totalXP: 0
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
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (attempts) => {
    if (attempts.length === 0) return

    const totalQuizzes = attempts.length
    const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0)
    const averageScore = totalScore / totalQuizzes
    const bestScore = Math.max(...attempts.map(a => a.score || 0))
    const totalTime = attempts.reduce((sum, a) => sum + (a.time_taken || 0), 0)
    
    // Calculate streak (simple version - based on consecutive days)
    let currentStreak = 0
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Check if user took quiz today or yesterday
    const lastQuiz = new Date(attempts[0]?.created_at)
    const daysSinceLastQuiz = Math.floor((today - lastQuiz) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLastQuiz <= 1) {
      currentStreak = 1 // Simplified - you can enhance this
    }

    setStats({
      totalQuizzes,
      averageScore: averageScore.toFixed(1),
      bestScore,
      totalTime,
      currentStreak,
      totalXP: attempts.reduce((sum, a) => sum + ((a.score || 0) * 10), 0)
    })
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
        </div>

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