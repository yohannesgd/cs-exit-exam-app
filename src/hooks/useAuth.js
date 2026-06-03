// src/hooks/useAuth.js
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserStats(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserStats(session.user.id)
      } else {
        setUserStats(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserStats = async (userId) => {
    try {
      let { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // No stats found, create default
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({ user_id: userId })
          .select()
          .single()
        
        if (insertError) throw insertError
        data = newStats
      } else if (error) {
        throw error
      }

      setUserStats(data)
    } catch (error) {
      console.error('Error fetching user stats:', error)
      // Set default stats
      setUserStats({
        current_streak: 0,
        longest_streak: 0,
        total_xp: 0,
        total_quizzes_taken: 0,
        total_correct_answers: 0
      })
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setSession(null)
    setUserStats(null)
  }

  return {
    user,
    session,
    loading,
    userStats,
    signIn,
    signUp,
    signOut,
    refreshStats: () => user && fetchUserStats(user.id)
  }
}