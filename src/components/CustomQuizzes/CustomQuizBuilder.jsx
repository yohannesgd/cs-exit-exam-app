/*import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

const EMPTY_QUESTION = {
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: ''
}

export default function CustomQuizBuilder({ onCreated }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([EMPTY_QUESTION])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateQuestion = (idx, field, val) =>
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: val } : q))

  const updateOption = (qIdx, oIdx, val) =>
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q
      const opts = [...q.options]
      opts[oIdx] = val
      return { ...q, options: opts }
    }))

  const addQuestion = () => setQuestions(prev => [...prev, { ...EMPTY_QUESTION }])
  const removeQuestion = (idx) => questions.length > 1 && setQuestions(prev => prev.filter((_, i) => i !== idx))

  const validate = () => {
    if (!title.trim()) return 'Quiz title is required.'
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) return `Question ${i + 1} text is required.`
      if (q.options.some(opt => !opt.trim())) return `Question ${i + 1} has empty options.`
      if (!q.explanation.trim()) return `Question ${i + 1} explanation is required.`
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setIsSubmitting(true)
    setError('')

    try {
      const formatted = questions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(o => o.trim()),
        correctAnswer: q.options[q.correctIndex].trim(),
        explanation: q.explanation.trim()
      }))

      const { data, error: dbErr } = await supabase
        .from('custom_quizzes')
        .insert({ title: title.trim(), created_by: user.id, questions: formatted })
        .select()
        .single()

      if (dbErr) throw dbErr
      setTitle('')
      setQuestions([EMPTY_QUESTION])
      onCreated?.(data.id)
    } catch (err) {
      setError(err.message || 'Failed to save quiz.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return <p className="error">🔒 Sign in to create custom quizzes.</p>

  return (
    <form onSubmit={handleSubmit} className="quiz-builder">
      <h2>🛠️ Create Custom Quiz</h2>
      {error && <div className="error-banner">{error}</div>}

      <div className="form-group">
        <label>Quiz Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Data Structures Final" required />
      </div>

      {questions.map((q, i) => (
        <fieldset key={i} className="question-block">
          <legend>Question {i + 1} <button type="button" onClick={() => removeQuestion(i)} className="btn-remove">✕</button></legend>
          <input type="text" placeholder="Question text" value={q.question} onChange={e => updateQuestion(i, 'question', e.target.value)} required />
          <div className="options-grid">
            {q.options.map((opt, j) => (
              <div key={j} className="option-input">
                <input type="radio" name={`q${i}_correct`} checked={q.correctIndex === j} onChange={() => updateQuestion(i, 'correctIndex', j)} />
                <input type="text" placeholder={`Option ${j + 1}`} value={opt} onChange={e => updateOption(i, j, e.target.value)} required />
              </div>
            ))}
          </div>
          <textarea placeholder="Explanation" value={q.explanation} onChange={e => updateQuestion(i, 'explanation', e.target.value)} required />
        </fieldset>
      ))}

      <div className="builder-actions">
        <button type="button" onClick={addQuestion} className="btn-secondary">+ Add Question</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : 'Publish Quiz'}
        </button>
      </div>
    </form>
  )
}*/