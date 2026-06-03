// src/components/SupabaseTest.jsx
import { useState } from 'react'
import { supabase } from '../services/supabase'

export function SupabaseTest() {
  const [status, setStatus] = useState('untested')
  const [message, setMessage] = useState('')

  const testConnection = async () => {
    setStatus('testing')
    setMessage('Testing connection...')
    
    try {
      // Simple test query
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('count', { count: 'exact', head: true })
      
      if (error) throw error
      
      setStatus('success')
      setMessage('✅ Supabase connected successfully!')
      console.log('Supabase test passed:', data)
    } catch (err) {
      setStatus('error')
      setMessage(`❌ Error: ${err.message}`)
      console.error('Supabase test failed:', err)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 999
    }}>
      <button
        onClick={testConnection}
        style={{
          background: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        {status === 'testing' ? 'Testing...' : 'Test Supabase'}
      </button>
      {message && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {message}
        </div>
      )}
    </div>
  )
}