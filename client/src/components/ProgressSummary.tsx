import React from 'react';
import { useHabit } from '@/lib/HabitContext';

const ProgressSummary: React.FC = () => {
  const { 
    activeUser, 
    isLoading, 
    calculateCompletionRate, 
    calculateGrandTotal,
    calculateCompletedHabits,
    calculateUserRank
  } = useHabit();

  if (isLoading) {
    return (
      <div className="mb-5 p-3 bg-blue-50 rounded-lg animate-pulse">
        <div className="h-16 bg-gray-200 rounded mb-2"></div>
        <div className="h-2 bg-gray-200 rounded-full mb-3"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const completionRate = calculateCompletionRate(activeUser);
  const totalScore = calculateGrandTotal(activeUser);
  const completedHabits = calculateCompletedHabits(activeUser);
  const rank = calculateUserRank(activeUser);

  return (
    <div className="mb-2 p-3 bg-blue-50 rounded-lg">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h3 className="text-sm font-medium text-gray-800">나의 습관 현황</h3>
          <p className="text-xs text-gray-500">8주 프로그램 (56일)</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary">{completionRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">완료율</div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-2 rounded-full" 
          style={{ width: `${completionRate}%` }}
        ></div>
      </div>
      
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-white rounded shadow-sm">
          <div className="text-xs text-gray-500">총 점수</div>
          <div className="text-lg font-bold text-gray-800">{totalScore.toFixed(1)}</div>
        </div>
        <div className="p-2 bg-white rounded shadow-sm">
          <div className="text-xs text-gray-500">완료 습관</div>
          <div className="text-lg font-bold text-gray-800">{completedHabits}</div>
        </div>
        <div className="p-2 bg-white rounded shadow-sm">
          <div className="text-xs text-gray-500">현재 순위</div>
          <div className="text-lg font-bold text-gray-800">{rank}<span className="text-sm">위</span></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;
