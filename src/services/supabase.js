// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Save quiz results with proper UUID handling
export async function saveQuizResult(userId, quizData) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId, // This should be UUID from auth.user
      score: quizData.score,
      total_questions: quizData.totalQuestions,
      correct_answers: quizData.correctAnswers,
      time_taken: quizData.timeSpent,
      answers_data: quizData.answers,
      quiz_type: 'standard'
    })
    .select()
  
  if (error) throw error
  return data
}

// Update user stats after quiz
export async function updateUserStats(userId, correctAnswers, totalQuestions, timeSpent) {
  // First get current stats
  const { data: currentStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  const xpEarned = (correctAnswers * 10) + (correctAnswers === totalQuestions ? 50 : 0)
  
  const { data, error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      total_quizzes: (currentStats?.total_quizzes || 0) + 1,
      total_correct: (currentStats?.total_correct || 0) + correctAnswers,
      total_xp: (currentStats?.total_xp || 0) + xpEarned,
      updated_at: new Date().toISOString()
    })
    .select()
  
  if (error) throw error
  return { data, xpEarned }
}