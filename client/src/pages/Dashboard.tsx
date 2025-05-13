import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useHabit } from '@/lib/HabitContext';
import { useAuth } from '@/hooks/useAuth';
import TabNavigation from '@/components/TabNavigation';

const Dashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { calculateCompletionRate, calculateGrandTotal } = useHabit();
  const [currentMood, setCurrentMood] = useState<number | null>(null);

  // 현재 사용자가 로그인되어 있으면 그 ID를 가져오고, 아니면 기본값 6 사용
  const userId = user?.id || 6;
  
  // 완료율 계산
  const completionRate = Math.round(calculateCompletionRate(userId) * 100);
  
  // 총 점수 계산
  const totalScore = calculateGrandTotal(userId);

  // 감정 이모지 배열
  const moods = [
    { emoji: "😀", label: "행복", color: "bg-yellow-100" },
    { emoji: "😌", label: "평온", color: "bg-green-100" },
    { emoji: "😞", label: "슬픔", color: "bg-red-100" },
    { emoji: "😊", label: "즐거움", color: "bg-blue-100" },
    { emoji: "😐", label: "무감정", color: "bg-gray-100" },
    { emoji: "😔", label: "우울", color: "bg-indigo-100" }
  ];

  // 감정 선택 핸들러
  const handleMoodSelect = (index: number) => {
    setCurrentMood(index);
  };

  // 이번 주 프로그레스 원 생성
  const renderProgressCircles = () => {
    const circles = [];
    const completedCount = Math.floor((7 * completionRate) / 100);
    
    for (let i = 0; i < 7; i++) {
      circles.push(
        <div 
          key={i} 
          className={`w-6 h-6 rounded-full ${i < completedCount ? 'bg-teal-300' : 'bg-gray-200 border border-gray-300'}`}
        />
      );
    }
    
    return circles;
  };

  // 현재 날짜 정보 구하기
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNumber = today.getDate();
  const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ...
  
  // 주간 날짜 계산
  const weekDays: string[] = [];
  const weekDates: number[] = [];
  
  for (let i = -3; i <= 3; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    weekDays.push(days[day.getDay()]);
    weekDates.push(day.getDate());
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-lg pb-16">
      {/* 상단 프로필 영역 - 푸른색 배경 */}
      <div className="bg-blue-500 text-white p-4 rounded-b-3xl flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white overflow-hidden mr-3">
            <img 
              src={user?.profileImageUrl || "https://ui-avatars.com/api/?name=" + (user?.name || "User")} 
              alt="User avatar" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${user?.name || "User"}`;
              }}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              Hello, {user?.name || "친구"}
            </h2>
            <p className="text-sm text-blue-100">Welcome back!</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>
      
      {/* Manage your tasks 영역 */}
      <div className="mx-4 mt-4 p-5 bg-blue-500 text-white rounded-3xl shadow-sm">
        <h1 className="text-3xl font-bold mb-6">Manage<br/>your tasks</h1>
        
        {/* 주간 캘린더 */}
        <div className="flex justify-between mb-4">
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`text-center ${dayOfWeek === ((index + 4) % 7) ? 'bg-black rounded-lg' : ''} px-2 py-1`}
            >
              <div className="text-xs">{day}</div>
              <div className={`text-lg font-medium ${dayOfWeek === ((index + 4) % 7) ? 'text-white' : ''}`}>
                {weekDates[index]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 원형 스코어 영역 */}
      <div className="mt-6 mx-4">
        <div className="flex justify-between items-center">
          {[3, 4, 5].map((num, index) => (
            <div 
              key={index} 
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-light ${index === 2 ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-200 text-blue-500'}`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>
      
      {/* Annual Growth 차트 */}
      <div className="mt-6 mx-4 bg-white p-5 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Annual Growth</h2>
          <span className="bg-yellow-300 text-xs px-2 py-1 rounded-full font-bold">+19%</span>
        </div>
        
        {/* 간단한 그래프 구현 */}
        <div className="h-32 flex items-end justify-between">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
            // 랜덤 높이 계산 (실제로는 데이터 기반으로 설정하세요)
            const height = 20 + Math.floor(Math.random() * 80); 
            const isLastMonth = index === 11;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-1 rounded-full ${isLastMonth ? 'bg-black' : 'bg-gray-300'}`} 
                  style={{ height: `${height}%` }}
                >
                  {isLastMonth && (
                    <div className="w-3 h-3 bg-black rounded-full -mt-1.5 -ml-1"></div>
                  )}
                </div>
                <span className="text-[9px] mt-1 text-gray-500">{month.substring(0, 3)}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 일일 감정 로그 - 삭제하고 위의 차트로 대체 */}

      {/* 액션 버튼 영역 */}
      <div className="fixed bottom-[70px] right-6">
        <button 
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg"
          onClick={() => setLocation('/checklist')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <TabNavigation />
    </div>
  );
};

export default Dashboard;