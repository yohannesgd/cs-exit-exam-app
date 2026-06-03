import { supabase } from './supabase'

export async function recordExamCompletion(userId, score, total) {
  const percentage = Math.round((score / total) * 100)
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('user_stats')
    .select('total_exams, avg_score')
    .eq('user_id', userId)
    .single()

  const newTotal = (existing?.total_exams || 0) + 1
  const oldAvg = existing?.avg_score || 0
  const newAvg = parseFloat(((oldAvg * (newTotal - 1)) + percentage) / newTotal)

  // Upsert handles streak logic via your DB trigger, or client-side fallback
  const { error } = await supabase.from('user_stats').upsert({
    user_id: userId,
    total_exams: newTotal,
    avg_score: newAvg,
    last_active: today
  }, { onConflict: 'user_id' })

  if (error) throw new Error(`Stats update failed: ${error.message}`)
  return { total_exams: newTotal, avg_score: newAvg }
}

export async function fetchUserStats(userId) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('streak, total_exams, avg_score, last_active')
    .eq('user_id', userId)
    .single()
  if (error) throw new Error(error.message)
  return data
}