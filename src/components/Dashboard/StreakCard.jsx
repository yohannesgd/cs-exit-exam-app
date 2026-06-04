// src/components/Dashboard/StreakCard.jsx
import { Flame, Calendar, Award } from 'lucide-react'

export function StreakCard({ currentStreak, longestStreak, lastQuizDate }) {
  const getStreakMessage = () => {
    if (currentStreak === 0) return "Take a quiz to start your streak! 🔥"
    if (currentStreak < 3) return "Keep going! You're building momentum! 💪"
    if (currentStreak < 7) return "Great consistency! You're on fire! 🔥"
    if (currentStreak < 30) return "Amazing dedication! 🌟"
    return "LEGENDARY status! 🏆"
  }

  const getStreakIcon = () => {
    if (currentStreak >= 30) return "🏆"
    if (currentStreak >= 7) return "🔥"
    if (currentStreak >= 3) return "💪"
    return "🌱"
  }

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-8 w-8" />
          <h3 className="text-xl font-bold">Daily Streak</h3>
        </div>
        <div className="text-4xl">{getStreakIcon()}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{currentStreak}</div>
          <div className="text-sm opacity-90">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold">{longestStreak}</div>
          <div className="text-sm opacity-90">Best Streak</div>
        </div>
      </div>

      <p className="text-sm text-center opacity-90">
        {getStreakMessage()}
      </p>

      {lastQuizDate && (
        <div className="mt-3 flex items-center justify-center gap-1 text-xs opacity-75">
          <Calendar className="h-3 w-3" />
          <span>Last quiz: {new Date(lastQuizDate).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  )
}