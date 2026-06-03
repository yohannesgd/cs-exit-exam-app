import { supabase } from './supabase'

export async function fetchCustomQuiz(quizId) {
  const { data, error } = await supabase
    .from('custom_quizzes')
    .select('title, questions')
    .eq('id', quizId)
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Quiz not found')

  // Normalize to match useQuizEngine expectations
  return data.questions.map(q => ({ ...q, id: crypto.randomUUID(), category: data.title }))
}