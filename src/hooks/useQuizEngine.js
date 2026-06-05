// src/hooks/useQuizEngine.js
import { useState, useCallback } from 'react';

export function useQuizEngine(questions) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = useCallback((option) => {
    if (showExplanation) return;
    setSelected(option);
    const isCorrect = option === questions[current]?.correctAnswer;
    if (isCorrect) setScore(s => s + 1);

    setAnswers(prev => [...prev, {
      questionId: questions[current]?.id,
      selected: option,
      correct: isCorrect
    }]);
    setShowExplanation(true);
  }, [current, questions, showExplanation]);

  const nextQuestion = useCallback(() => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
    }
  }, [current, questions.length]);

  // Add reset method
  const reset = useCallback(() => {
    setCurrent(0);
    setScore(0);
    setAnswers([]);
    setIsComplete(false);
    setSelected(null);
    setShowExplanation(false);
  }, []);

  return {
    currentQuestion: questions[current],
    selected,
    showExplanation,
    handleSelect,
    nextQuestion,
    score,
    answers,
    isComplete,
    progress: `${current + 1}/${questions.length}`,
    reset  // Expose reset method
  };
}