// src/components/Dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { StreakCard } from './StreakCard';
import { StatsChart } from './StatsChart';
import { QuizHistory } from './QuizHistory';
import { QuizBuilder } from '../CustomQuizzes/QuizBuilder';

export function Dashboard() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Get streak bonus
      const { data: bonus } = await supabase
        .rpc('get_streak_bonus', { user_uuid: user.id });
      
      return { ...data, streakBonus: bonus?.[0] };
    },
    enabled: !!user?.id
  });

  const { data: history } = useQuery({
    queryKey: ['quizHistory', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
    enabled: !!user?.id
  });

  if (isLoading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StreakCard 
          currentStreak={stats?.current_streak || 0}
          longestStreak={stats?.longest_streak || 0}
          bonus={stats?.streakBonus}
        />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total XP</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.total_xp || 0}</p>
          <p className="text-sm text-gray-500 mt-2">
            Next level: {(Math.ceil((stats?.total_xp || 0) / 100) * 100)} XP
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Accuracy</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats?.total_quizzes_taken > 0 
              ? Math.round((stats.total_correct_answers / (stats.total_quizzes_taken * 10)) * 100)
              : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats?.total_correct_answers || 0} / {(stats?.total_quizzes_taken || 0) * 10} correct
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StatsChart history={history} />
        <QuizBuilder />
      </div>

      <QuizHistory history={history} />
    </div>
  );
}