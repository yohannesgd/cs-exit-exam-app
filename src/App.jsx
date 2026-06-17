// src/App.jsx
import { Header } from './components/Header';
import { useState, useEffect } from 'react'

import { useAuth } from './hooks/useAuth'

import { useQuizEngine } from './hooks/useQuizEngine'
import { fetchCSQuestions } from './services/api'
import { supabase } from './services/supabase'
import { Login } from './components/Auth/Login'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { ForgotPassword } from './components/Auth/ForgotPassword'
import { ResetPassword } from './components/Auth/ResetPassword'



function App() {

  // 1. State declarations
  const { user, loading: authLoading, signOut } = useAuth()
  const [questions, setQuestions] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [quizComplete, setQuizComplete] = useState(false)
  const [quizKey, setQuizKey] = useState(0) // Force re-render
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome', 'leaderboard', 'quiz', 'results'
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  
  // 2. Custom hooks
  //const { user, signOut } = useAuth();

  const [showResetPassword, setShowResetPassword] = useState(() => {
  // Check if we're on the reset-password page on load
  return window.location.pathname === '/reset-password' || 
         window.location.hash.includes('access_token');
})
  const quizEngine = useQuizEngine(questions, () => {
    console.log('onComplete from useQuizEngine');
    handleQuizComplete();
  });

  // Check if we're on the reset password page and we have a session
  useEffect(() => {
  // Check URL path for reset-password
  const path = window.location.pathname
  if (path === '/reset-password') {
    setShowResetPassword(true)
    // Clean up the URL
    window.history.replaceState(null, '', '/reset-password')
  }
}, [])

// Also check for hash token (Supabase uses this)
useEffect(() => {
  // Check if we're on the reset password page
  const path = window.location.pathname;
  if (path === '/reset-password' || path === '/') {
    // Check URL hash for access_token (Supabase uses this)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      console.log('🔐 Reset password link detected');
      setShowResetPassword(true);
      // Clean up the URL
      window.history.replaceState(null, '', '/reset-password');
      return;
    }
  }
}, []);

// Also check for session after auth state change
// Add this useEffect
useEffect(() => {
  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth event:', event);
    
    if (event === 'PASSWORD_RECOVERY') {
      console.log('🔐 Password recovery detected!');
      setShowResetPassword(true);
      // Clean up the URL
      window.history.replaceState(null, '', '/reset-password');
    }
  });
  
  return () => subscription.unsubscribe();
}, []);

// Update your render logic - check reset password FIRST
if (showResetPassword) {
  return <ResetPassword onComplete={() => {
    setShowResetPassword(false);
    window.location.href = '/login';
  }} />;
}

// Force sign out when on reset-password page
useEffect(() => {
  if (window.location.pathname === '/reset-password') {
    // Optionally sign out to show reset page
    supabase.auth.signOut()
  }
}, [])

// Timer effect
useEffect(() => {
  let interval;
  if (currentScreen === 'quiz' && !quizEngine.isComplete && startTime) {
    interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  }
  return () => clearInterval(interval);
  }, [currentScreen, quizEngine.isComplete, startTime]);

  // 3. Helper functions (add saveQuizResults here)
  const saveQuizResults = async () => {
  if (!user) {
    console.log('No user logged in, skipping save');
    return;
  }
  
  try {
    console.log('Saving quiz for user:', user.id);
    
    // 1. Save quiz attempt
    const { error: quizError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        score: quizEngine.score,
        total_questions: questions.length,
        correct_answers: quizEngine.score,
        time_taken: timeSpent,
        answers_data: quizEngine.answers,
        quiz_type: 'standard'
      });
    
    if (quizError) {
      console.error('Quiz save error:', quizError);
      throw quizError;
    }
    console.log('✅ Quiz saved successfully!');
    
    // 2. Update user stats
    const { error: statsError } = await supabase.rpc('update_user_stats', {
      p_user_id: user.id,
      p_correct: quizEngine.score,
      p_total: questions.length,
      p_time: timeSpent
    });
    
    if (statsError) {
      console.error('Stats update error:', statsError);
    } else {
      console.log('✅ User stats updated!');
    }
    
    // 3. Update streak
    const { error: streakError } = await supabase.rpc('update_streak_on_quiz', {
      user_uuid: user.id
    });
    
    if (streakError) {
      console.error('Streak update error:', streakError);
    } else {
      console.log('✅ Streak updated!');
    }
    
  } catch (error) {
    console.error('Error saving quiz results:', error);
  }
};

 // 4. Event handlers
 const startQuiz = async (difficulty) => {
  setLoading(true);
  try {
    const fetchedQuestions = await fetchCSQuestions(15, difficulty);
    setQuestions(fetchedQuestions);
    setCurrentScreen('quiz'); // 👈 navigate to quiz screen
    setStartTime(Date.now());
    setTimeSpent(0);
  } catch (error) {
    console.error('Error starting quiz:', error);
    alert('Failed to load questions. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Then your handleQuizComplete function
const handleQuizComplete = async () => {
  console.log('handleQuizComplete called');
  await saveQuizResults();
  console.log('Results saved, navigating to results screen');
  setCurrentScreen('results');
};

const resetQuiz = () => {
  console.log('Resetting quiz, going to welcome screen...');
  setQuestions([]);
  setTimeSpent(0);
  setStartTime(null);
  setQuizKey(prev => prev + 1);
  setCurrentScreen('welcome'); // 👈 back to welcome
};

 // 5. Render logic
const [loading, setLoading] = useState(false)

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
// Inside App component, after auth loading check and user check
if (!user) {
  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />
  }

  if (showResetPassword) {
    return (
      <ResetPassword
        onComplete={() => {
          setShowResetPassword(false)
          setShowForgotPassword(false)
        }}
      />
    )
  }

  return (
    <Login
      onLogin={() => window.location.reload()}
      onForgotPassword={() => setShowForgotPassword(true)}
    />
  )
}

// Render based on currentScreen
switch (currentScreen) {
  case 'leaderboard':
    return (
      <>
        <Header user={user} signOut={signOut} setCurrentScreen={setCurrentScreen} />
        <Leaderboard />
      </>
    );
  case 'quiz':
    return (
      <>
        <Header user={user} signOut={signOut} setCurrentScreen={setCurrentScreen} />
        <QuizScreen
          key={quizKey}
          currentQuestion={quizEngine.currentQuestion}
          selected={quizEngine.selected}
          showExplanation={quizEngine.showExplanation}
          onSelect={quizEngine.handleSelect}
          onNext={quizEngine.nextQuestion}
          progress={quizEngine.progress}
          score={quizEngine.score}
          totalQuestions={questions.length}
          timeSpent={timeSpent}
          onComplete={handleQuizComplete}  // ← ADD THIS LINE
          /*onComplete={() => {
            console.log('onComplete called from QuizScreen');
            setCurrentScreen('results');
          }}*/
        />
      </>
    );
  case 'results':
    return (
      <>
        <Header user={user} signOut={signOut} setCurrentScreen={setCurrentScreen} />
        <ResultsScreen
          score={quizEngine.score}
          totalQuestions={questions.length}
          answers={quizEngine.answers}
          questions={questions}
          onRestart={() => {
            resetQuiz();
            setCurrentScreen('welcome');
          }}
          timeSpent={timeSpent}
          user={user}
        />
      </>
    );
  default: // 'welcome' screen
    return (
      <>
        <Header user={user} signOut={signOut} setCurrentScreen={setCurrentScreen} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                CS Exit Exam Prep
              </h1>
              <p className="text-xl text-gray-600">
                Master Computer Science fundamentals with our comprehensive quizzes
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Test Your Knowledge?
              </h2>
              <p className="text-gray-600 mb-6">
                15 multiple-choice questions • 30 seconds per question • Instant feedback
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => startQuiz('easy')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Easy Mode 🌱
                </button>
                <button
                  onClick={() => startQuiz('medium')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Standard Mode ⚡
                </button>
                <button
                  onClick={() => startQuiz('hard')}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Hard Mode 🎯
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
}

  
}

export default App