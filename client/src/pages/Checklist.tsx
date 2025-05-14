import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import HabitTracker from '@/components/HabitTracker';
import { useLocation } from 'wouter';
import { useHabit } from '@/lib/HabitContext';

const Checklist: React.FC = () => {
  const [, setLocation] = useLocation();
  const { activeUser, habits, habitEntries, updateHabitEntry } = useHabit();
  const [activeDay, setActiveDay] = useState(0);
  
  useEffect(() => {
    console.log('현재 활성 사용자:', activeUser);
    console.log('습관 목록:', habits);
    console.log('습관 기록:', habitEntries);
  }, [activeUser, habits, habitEntries]);

  // 습관 상태 업데이트 함수
  const toggleHabitStatus = async (habitId: number) => {
    try {
      if (!activeUser) return;
      
      // 현재 습관의 상태 확인
      const entry = habitEntries.find(
        e => e.userId === activeUser && e.habitId === habitId && e.day === activeDay
      );
      
      // 기존 값이 없으면 0으로 간주
      const currentValue = entry ? entry.value : 0;
      
      // 상태 토글: 0 -> 1 -> 2 -> 0
      const newValue = (currentValue + 1) % 3;
      
      console.log(`습관 ${habitId} 업데이트: ${currentValue} -> ${newValue}`);
      
      // 값 업데이트
      await updateHabitEntry(habitId, activeDay, newValue);
    } catch (error) {
      console.error('Error updating habit entry:', error);
    }
  };

  return (
    <AppLayout
      title="습관 체크리스트"
      subtitle="Step 2: 습관 점검"
      showBackButton
      onBackClick={() => setLocation('/')}
    >
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">오늘의 습관 점검</h3>
          <p className="text-sm text-gray-600 mb-4">
            아래 목록에서 오늘 완료한 습관들을 체크해주세요.
          </p>
          
          <div className="space-y-3 mt-4">
            {habits.map((habit) => {
              // 현재 습관의 상태 확인
              const entry = habitEntries.find(
                e => e.userId === activeUser && e.habitId === habit.id && e.day === activeDay
              );
              const value = entry ? entry.value : 0;
              
              return (
                <div 
                  key={habit.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    value === 0 ? 'bg-white border-gray-200' : 
                    value === 1 ? 'bg-blue-50 border-blue-200' : 
                    'bg-green-100 border-green-300'
                  }`}
                  onClick={() => toggleHabitStatus(habit.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                          value === 0 ? 'bg-gray-100 text-gray-400' : 
                          value === 1 ? 'bg-blue-200 text-blue-600' : 
                          'bg-green-200 text-green-600'
                        }`}
                      >
                        {value === 0 ? '−' : value === 1 ? '△' : '○'}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{habit.label}</h4>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {habit.scoreType === 'binary' ? 
                        '완료/미완료' : 
                        '미완료/부분완료/완료'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-8 mb-4">
          <h3 className="text-lg font-bold mb-4">주간 습관 기록</h3>
          <HabitTracker />
        </div>
      </div>
    </AppLayout>
  );
};

export default Checklist;