// src/components/QuizScreen.jsx
import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function QuizScreen({
  currentQuestion,
  selected,
  showExplanation,
  onSelect,
  onNext,
  progress,
  score,
  totalQuestions,
  timeSpent,
  onComplete
}) {
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer logic
  useEffect(() => {
    if (showExplanation || !currentQuestion) return;
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showExplanation && !selected) {
      // Auto-submit incorrect answer
      onSelect(null);
    }
  }, [timeLeft, showExplanation, selected, currentQuestion, onSelect]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(30);
  }, [currentQuestion]);

  // Detect quiz completion
  {showExplanation && (
  <button
    onClick={() => {
      console.log('See Results button clicked');
      if (parseInt(progress.split('/')[0]) === parseInt(progress.split('/')[1])) {
        // This is the last question, call onComplete
        onComplete?.();
      } else {
        // Move to next question
        onNext();
      }
    }}
    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
  >
    {parseInt(progress.split('/')[0]) === parseInt(progress.split('/')[1]) 
      ? 'See Results 🎯' 
      : 'Next Question →'}
  </button>
)}

  if (!currentQuestion) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600">Question {progress}</span>
              <div className="text-2xl font-bold text-gray-900">{score}/{totalQuestions}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Time Spent</div>
              <div className="text-xl font-mono font-bold text-gray-900">
                {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-300"
              style={{ width: `${((parseInt(progress.split('/')[0]) - 1) / parseInt(progress.split('/')[1])) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer Card */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
              <span className={`font-mono text-2xl font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeLeft > 20 ? 'bg-green-600' : timeLeft > 10 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selected === option;
                const isCorrect = showExplanation && option === currentQuestion.correctAnswer;
                const isWrong = showExplanation && isSelected && option !== currentQuestion.correctAnswer;

                let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";
                
                if (showExplanation) {
                  if (isCorrect) {
                    buttonClass += "bg-green-50 border-green-500 text-green-800";
                  } else if (isWrong) {
                    buttonClass += "bg-red-50 border-red-500 text-red-800";
                  } else {
                    buttonClass += "bg-gray-50 border-gray-200 text-gray-600 opacity-50";
                  }
                } else {
                  if (isSelected) {
                    buttonClass += "bg-blue-50 border-blue-500 text-blue-800";
                  } else {
                    buttonClass += "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-800";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !showExplanation && onSelect(option)}
                    disabled={showExplanation}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {String.fromCharCode(65 + idx)}. {option}
                      </span>
                      {showExplanation && isCorrect && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {showExplanation && isWrong && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Explanation</h3>
                <p className="text-blue-800">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {showExplanation && (
          <button
            onClick={onNext}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {parseInt(progress.split('/')[0]) === parseInt(progress.split('/')[1]) 
              ? 'See Results 🎯' 
              : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizScreen;