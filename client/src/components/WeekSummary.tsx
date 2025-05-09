import React from 'react';
import { useHabit } from '@/lib/HabitContext';

const WeekSummary: React.FC = () => {
  const { habits, activeUser, activeWeek, calculateWeekScores, isLoading } = useHabit();

  if (isLoading) {
    return (
      <div className="mb-5 p-3 bg-gray-50 rounded-lg animate-pulse">
        <h3 className="text-sm font-medium text-gray-800 mb-2">{activeWeek*2 + 1}-{activeWeek*2 + 2}주차 점수 요약</h3>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const weekScores = calculateWeekScores(activeUser, activeWeek);
  const totalWeekScore = weekScores.reduce((sum, score) => sum + score, 0);

  return (
    <div className="mb-5 p-3 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-800 mb-2">{activeWeek*2 + 1}-{activeWeek*2 + 2}주차 점수 요약</h3>
      <div className="grid grid-cols-5 gap-2">
        {habits.map((habit, index) => (
          <div key={habit.id} className="text-center">
            <div 
              className="text-xs text-gray-500 truncate" 
              title={habit.label}
            >
              {habit.label.substring(0, 4)}...
            </div>
            <div className="text-sm font-bold text-primary">
              {weekScores[index]?.toFixed(1) || '0.0'}
            </div>
          </div>
        ))}
      </div>
      {/* 총점 표시 제거 */}
    </div>
  );
};

export default WeekSummary;
