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

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-lg pb-16">
      {/* 상단 여백 */}
      <div className="h-4"></div>

      {/* 일일 리플렉션 카드 */}
      <div className="mx-4 p-5 bg-amber-50 rounded-3xl shadow-sm">
        <div className="text-sm text-gray-600 mb-2">Daily reflection</div>
        <h2 className="text-2xl font-bold mb-1">
          Hello, {user?.name || "친구"}
        </h2>
        <p className="text-2xl mb-4">
          How do you feel about your <span className="font-bold">current emotions?</span>
        </p>
        
        <div 
          className="bg-amber-100 p-3 rounded-xl flex justify-between items-center cursor-pointer"
          onClick={() => setLocation('/notes')}
        >
          <span className="text-gray-500">Your reflection...</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* 일일 감정 로그 */}
      <div className="mt-6 mx-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Daily Mood Log</h3>
          <button className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>
        
        <div className="flex justify-between">
          {moods.map((mood, index) => (
            <button
              key={index}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                ${currentMood === index ? 'ring-2 ring-blue-500' : ''} ${mood.color}`}
              onClick={() => handleMoodSelect(index)}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* 진행 상황 */}
      <div className="mt-8 mx-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Your progress</h3>
          <button className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-6xl font-bold">{completionRate}%</div>
          <div className="text-right text-gray-500 text-sm">
            <p>Of the weekly</p>
            <p>plan completed</p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {renderProgressCircles()}
        </div>
        
        {/* 빠른 액션 버튼 */}
        <div className="flex justify-center mt-4 gap-4">
          <button 
            className="bg-black text-white p-4 rounded-full"
            onClick={() => setLocation('/checklist')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </button>
          
          <button 
            className="border border-gray-300 p-4 rounded-xl"
            onClick={() => setLocation('/insights')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <TabNavigation />
    </div>
  );
};

export default Dashboard;