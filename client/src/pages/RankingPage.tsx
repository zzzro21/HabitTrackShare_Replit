import React from 'react';
import { useHabit } from '@/lib/HabitContext';
import AppLayout from '@/components/AppLayout';

const RankingPage: React.FC = () => {
  const { getRankings, isLoading } = useHabit();

  return (
    <AppLayout
      title="친구들 순위"
      subtitle="함께 성장하는 우리 모두의 순위표"
      showBackButton={true}
    >
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 mb-6 text-white">
            <h2 className="text-lg font-bold mb-2">이번 주 랭킹</h2>
            <p className="text-sm opacity-90">함께 노력하는 친구들과 선의의 경쟁을 통해 더 나은 습관을 만들어 보세요!</p>
          </div>
          
          <div className="space-y-3">
            {getRankings().map((user, index) => (
              <div 
                key={user.id} 
                className={`flex items-center p-3 rounded-lg border ${
                  index === 0 ? 'bg-yellow-50 border-yellow-200' : 
                  index === 1 ? 'bg-gray-50 border-gray-200' : 
                  index === 2 ? 'bg-amber-50 border-amber-200' : 
                  'bg-white border-gray-100'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 text-white ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-500' : 
                  index === 2 ? 'bg-amber-500' : 
                  'bg-gray-200 text-gray-800'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{user.avatar}</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <div className="flex items-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                      <span>{user.completionRate.toFixed(1)}% 완료</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{user.totalScore.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">점수</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default RankingPage;
