// src/utils/streakLogic.js
import { supabase } from '../lib/supabase'
import { differenceInDays, format } from 'date-fns'

// Client-side streak tracking with LocalStorage fallback
export const updateDailyStreak = async (userId) => {
  try {
    // Primary: Supabase RPC call
    const { data, error } = await supabase
      .rpc('update_streak', { user_uuid: userId })
    
    if (error) throw error
    return data
  } catch (error) {
    // Fallback: LocalStorage-based streak
    return updateStreakLocal()
  }
}

const updateStreakLocal = () => {
  const lastDate = localStorage.getItem('lastQuizDate')
  const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0')
  const today = format(new Date(), 'yyyy-MM-dd')
  
  let newStreak = currentStreak
  if (lastDate === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')) {
    newStreak = currentStreak + 1
  } else if (lastDate !== today) {
    newStreak = 1
  }
  
  localStorage.setItem('lastQuizDate', today)
  localStorage.setItem('currentStreak', newStreak)
  localStorage.setItem('longestStreak', 
    Math.max(newStreak, parseInt(localStorage.getItem('longestStreak') || '0'))
  )
  
  return newStreak
}

// Streak badges logic
export const getStreakBadge = (streak) => {
  if (streak >= 100) return { name: 'Legendary Scholar', icon: '🏆', color: 'gold' }
  if (streak >= 50) return { name: 'Master Coder', icon: '⚡', color: 'purple' }
  if (streak >= 30) return { name: 'Dedicated Learner', icon: '🔥', color: 'orange' }
  if (streak >= 7) return { name: 'On Fire!', icon: '🌟', color: 'yellow' }
  return { name: 'Getting Started', icon: '🌱', color: 'green' }
}