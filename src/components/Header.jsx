// src/components/Header.jsx
import { Award, LogOut, User } from 'lucide-react';

export function Header({ user, signOut, setCurrentScreen }) {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('welcome')}
          className="flex items-center space-x-2 hover:opacity-80 transition"
        >
          <Award className="h-8 w-8 text-blue-600" />
          <span className="font-bold text-xl text-gray-900">CS Exit Exam</span>
        </button>

        {user && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentScreen('leaderboard')}
              className="text-gray-600 hover:text-purple-600 transition"
            >
              🏆 Leaderboard
            </button>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}