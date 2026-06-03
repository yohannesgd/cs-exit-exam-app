// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to save quiz results
export async function saveQuizResults(userId, quizData) {
  const { score, totalQuestions, answers, quizType, timeSpent } = quizData
  
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      score: (score / totalQuestions) * 100,
      total_questions: totalQuestions,
      correct_answers: score,
      answers_data: answers,
      quiz_type: quizType,
      time_taken: timeSpent
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Helper function to update user stats
export async function updateUserStats(userId, correctAnswers, totalQuestions, timeSpent) {
  const xpEarned = calculateXP(correctAnswers, totalQuestions, timeSpent)
  
  const { data, error } = await supabase
    .from('user_stats')
    .update({
      total_quizzes_taken: supabase.raw('total_quizzes_taken + 1'),
      total_correct_answers: supabase.raw(`total_correct_answers + ${correctAnswers}`),
      total_xp: supabase.raw(`total_xp + ${xpEarned}`)
    })
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  
  // Update streak
  await updateStreak(userId)
  
  return { data, xpEarned }
}

async function updateStreak(userId) {
  const { data, error } = await supabase
    .rpc('update_streak', { user_uuid: userId })
  
  if (error) console.error('Streak update error:', error)
  return data
}

function calculateXP(correct, total, timeSpent) {
  const baseXP = correct * 10
  const avgTimePerQuestion = timeSpent / total
  const timeBonus = Math.max(0, 30 - avgTimePerQuestion) * 2
  const perfectBonus = correct === total ? 50 : 0
  return baseXP + timeBonus + perfectBonus
}