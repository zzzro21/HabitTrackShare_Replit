import React from 'react';
import { useHabit } from '@/lib/HabitContext';

const Leaderboard: React.FC = () => {
  const { activeUser, getRankings, isLoading } = useHabit();

  if (isLoading) {
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">우리 모두의 순위</h3>
        <div className="bg-white rounded-lg border overflow-hidden animate-pulse">
          <div className="h-8 bg-gray-200 w-full"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  const rankings = getRankings();

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-800 mb-2">우리 모두의 순위</h3>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-3 text-left">순위</th>
              <th className="py-2 px-3 text-left">사용자</th>
              <th className="py-2 px-3 text-right">완료율</th>
              <th className="py-2 px-3 text-right">총점</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((user, index) => (
              <tr 
                key={user.id} 
                className={`border-b border-gray-100 ${user.id === activeUser ? 'bg-blue-50' : ''}`}
              >
                <td className="py-2 px-3 font-medium">{index + 1}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{user.avatar}</span>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right">{user.completionRate.toFixed(1)}%</td>
                <td className="py-2 px-3 text-right font-bold">{user.totalScore.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
