// src/components/Auth/Login.jsx
import { useState } from 'react'
import { supabase } from '../../services/supabase'

export function Login({ onLogin, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setVerificationSent(false)

    try {
      if (isSignUp) {
        // Sign up with email confirmation
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/login'
          }
        })
        
        if (error) throw error
        
        if (data?.user?.identities?.length === 0) {
          setError('This email is already registered. Please sign in instead.')
        } else {
          setVerificationSent(true)
          setError('')
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onLogin?.()
      }
    } catch (err) {
      console.error('Auth error:', err)
      
      if (err.message.includes('Email not confirmed')) {
        setError('Please verify your email first. Check your inbox for the confirmation link.')
        setVerificationSent(true)
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (err.message.includes('User already registered')) {
        setError('This email is already registered. Please sign in instead.')
        setIsSignUp(false)

      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    
    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin + '/login'
        }
      })
      
      if (error) throw error
      setError('')
      alert('✅ Verification email resent! Please check your inbox.')
    } catch (err) {
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {/* Success message - Verification sent */}
        {verificationSent && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">
              ✅ Verification email sent!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Please check your inbox and click the confirmation link.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              {resendLoading ? 'Sending...' : "Didn't receive it? Resend email"}
            </button>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="button"
            onClick={onForgotPassword ?? (() => {
              window.location.href = '/forgot-password'
            })}
            className="text-sm text-blue-600 hover:underline mb-4 block"
          >
            Forgot Password?
          </button>
          
          <button
            type="submit"
            disabled={loading || verificationSent}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setVerificationSent(false)
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Resend verification option when user tries to login without verifying */}
        {!isSignUp && error?.includes('verify your email') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-sm text-yellow-700">Need another verification email?</p>
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="mt-1 text-sm text-blue-600 hover:underline"
            >
              {resendLoading ? 'Sending...' : 'Click here to resend'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}