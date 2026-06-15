// src/components/Header.jsx
export function Header({ user, signOut, setCurrentScreen }) {
  return (
    <div className="bg-white shadow-sm p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button
          onClick={() => setCurrentScreen('welcome')}
          className="text-xl font-bold text-gray-900 hover:text-blue-600"
        >
          📚 CS Exit Exam
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen('leaderboard')}
            className="text-gray-600 hover:text-purple-600"
          >
            🏆 Leaderboard
          </button>
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button onClick={signOut} className="text-red-600 hover:text-red-700">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}