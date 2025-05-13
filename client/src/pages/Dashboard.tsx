import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useHabit } from '@/lib/HabitContext';
import { useAuth } from '@/hooks/useAuth';
import TabNavigation from '@/components/TabNavigation';
import MoriAssistant from '@/components/MoriAssistant';

const Dashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { calculateCompletionRate, calculateGrandTotal } = useHabit();
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantGender, setAssistantGender] = useState<'male' | 'female'>('female');

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
  
  // 비서 성별 전환
  const toggleAssistantGender = () => {
    setAssistantGender(prev => prev === 'male' ? 'female' : 'male');
  };
  
  // 비서 표시 토글
  const toggleAssistant = () => {
    setShowAssistant(prev => !prev);
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
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-lg pb-16 relative">
      {/* MORI AI 비서 버튼 */}
      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 z-10">
        <button 
          className="flex items-center justify-center bg-black/80 text-white rounded-full px-4 py-2 shadow-lg"
          onClick={() => {
            toggleAssistantGender();
            toggleAssistant();
          }}
        >
          <span className="text-sm font-bold tracking-wider">MORI</span>
        </button>
      </div>
      
      {/* 일주일 캘린더와 타이틀 카드 */}
      <div className="mx-2 p-5 pb-6 bg-blue-100/80 rounded-3xl border border-blue-200 shadow-sm w-[98%]">
        <h2 className="text-2xl font-bold mb-1">
          Hello, {user?.name || "친구"}
        </h2>
        <p className="text-xl mb-4 text-gray-700">
          Manage your Tasks
        </p>
        
        {/* 일주일 캘린더 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
              // 오늘 날짜 계산
              const today = new Date();
              const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ...
              
              // 이번 주 시작일 (일요일)로 설정
              const startOfWeek = new Date(today);
              startOfWeek.setDate(today.getDate() - currentDay);
              
              // 표시할 날짜 계산
              const dateToShow = new Date(startOfWeek);
              dateToShow.setDate(startOfWeek.getDate() + index);
              
              // 오늘 날짜인지 확인
              const isToday = dateToShow.getDate() === today.getDate() && 
                              dateToShow.getMonth() === today.getMonth() &&
                              dateToShow.getFullYear() === today.getFullYear();
              
              // 일정이 있는 날짜 (예시 데이터: 수요일과 금요일에 일정이 있다고 가정)
              const hasSchedule = index === 3 || index === 5; // 수요일(3)과 금요일(5)
              
              return (
                <div key={index} className="flex flex-col items-center w-[14.28%]">
                  <div className={`text-xs font-medium mb-1 w-full text-center ${isToday ? 'text-orange-500 font-bold' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className={`flex items-center justify-center w-10 h-10 text-sm 
                    ${isToday 
                      ? 'bg-orange-400 text-white font-bold rounded-full' 
                      : 'bg-gray-100 text-gray-700 rounded-full'}`}>
                    {dateToShow.getDate()}
                  </div>
                  {/* 일정 표시 점 - 일정이 있을 때만 표시 */}
                  <div className="h-1.5 mt-1">
                    {hasSchedule && (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mx-auto"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 일정 목록 */}
          <div className="space-y-3">
            {/* 오전 8:00 일정 */}
            <div className="flex items-center">
              <div className="text-xs text-gray-500 w-16">8:00 AM</div>
              <div className="flex-1 bg-red-100 rounded-xl p-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-400 w-8 h-8 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Meditate for 10 minutes</div>
                    <div className="text-xs text-gray-500">Today 8:00 AM</div>
                    <div className="text-sm mt-1">Meditation to calm your body and mind</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 오전 9:30 일정 */}
            <div className="flex items-center">
              <div className="text-xs text-gray-500 w-16">9:30 AM</div>
              <div className="flex-1 bg-purple-100 rounded-xl p-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Respond to Emma</div>
                    <div className="text-xs text-gray-500">Today 9:30 AM</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 오전 10:00 일정 */}
            <div className="flex items-center">
              <div className="text-xs text-gray-500 w-16">10:00 AM</div>
              <div className="flex-1 bg-yellow-100 rounded-xl p-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-400 w-8 h-8 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Complete project</div>
                    <div className="text-xs text-gray-500">Today 10:00 AM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      
      {/* AI 비서 모달 */}
      {showAssistant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white rounded-xl w-[90%] max-w-md p-4 relative max-h-[80vh] overflow-auto">
            <button 
              className="absolute top-2 right-2 bg-gray-200 rounded-full p-1"
              onClick={toggleAssistant}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                {assistantGender === 'female' ? (
                  <span className="text-2xl">👩</span>
                ) : (
                  <span className="text-2xl">👨</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl">MORI Assistant</h3>
                <p className="text-sm text-gray-500">AI 음성인식 및 일정관리 도우미</p>
              </div>
            </div>
            <MoriAssistant />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;