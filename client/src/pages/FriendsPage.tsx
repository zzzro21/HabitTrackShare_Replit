import React, { useState } from 'react';
import { useHabit } from '@/lib/HabitContext';
import AppLayout from '@/components/AppLayout';

const FriendsPage: React.FC = () => {
  const { getRankings, users, calculateCompletionRate, calculateGrandTotal, isLoading } = useHabit();
  const [activeTab, setActiveTab] = useState<'ranking' | 'friends'>('ranking');

  return (
    <AppLayout
      title="친구들 현황"
      subtitle="친구들의 순위와 습관 진행상황"
      showBackButton={true}
    >
      {/* 탭 버튼 */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'ranking'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('ranking')}
        >
          순위
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'friends'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('friends')}
        >
          상세 현황
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'ranking' ? (
            // 랭킹 탭 내용
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
                      <div className="text-lg font-bold text-blue-500">{user.totalScore.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">점수</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // 상세 현황 탭 내용
            <div className="space-y-4">
              {users.map(user => {
                const completionRate = calculateCompletionRate(user.id);
                const totalScore = calculateGrandTotal(user.id);
                
                return (
                  <div key={user.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">{user.avatar}</span>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>습관 완료율</span>
                        <span className="font-medium text-blue-500">{completionRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-2 rounded-md">
                        <span className="block text-gray-500 text-xs">총점</span>
                        <span className="font-bold text-blue-500 text-lg">{totalScore.toFixed(1)}점</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <span className="block text-gray-500 text-xs">완료 습관</span>
                        <span className="font-bold text-blue-500 text-lg">{(completionRate / 100 * 5).toFixed(1)}개</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default FriendsPage;
