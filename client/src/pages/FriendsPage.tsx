import React from 'react';
import { useHabit } from '@/lib/HabitContext';
import TabNavigation from '@/components/TabNavigation';

const FriendsPage: React.FC = () => {
  const { users, calculateCompletionRate, calculateGrandTotal, isLoading } = useHabit();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-center">친구들 현황</h1>
          <p className="text-xs text-center text-gray-500">함께하는 친구들의 습관 형성 진행상황</p>
        </div>
      </header>
      
      <main className="p-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => {
              const completionRate = calculateCompletionRate(user.id);
              const totalScore = calculateGrandTotal(user.id);
              
              return (
                <div key={user.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{user.avatar}</span>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>습관 완료율</span>
                      <span className="font-medium">{completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full">
                      <div 
                        className="bg-primary h-1.5 rounded-full" 
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>총점:</span>
                    <span className="font-bold text-primary">{totalScore.toFixed(1)}점</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      <TabNavigation />
    </div>
  );
};

export default FriendsPage;
