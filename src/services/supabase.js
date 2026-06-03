// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test function with better error handling
export async function testSave() {
  try {
    console.log('Testing save to quiz_attempts...')
    
    // Try to insert a test record
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: 'test-user-' + Date.now(),
        score: 5,
        total_questions: 10,
        correct_answers: 5,
        time_taken: 60,
        answers_data: [],
        quiz_type: 'test'
      })
      .select()
    
    if (error) {
      console.error('Insert error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Insert successful!', data)
    return { success: true, data }
  } catch (err) {
    console.error('Exception:', err)
    return { success: false, error: err.message }
  }
}

// Function to check table access
export async function checkAccess() {
  try {
    // Try to read from the table
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Read error:', error)
      return { accessible: false, error: error.message }
    }
    
    console.log('Table accessible!', data)
    return { accessible: true, data }
  } catch (err) {
    return { accessible: false, error: err.message }
  }
}