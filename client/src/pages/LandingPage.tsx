import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// 동기부여 문장
const motivationalQuotes = [
  "\"작은 습관이 인생을 바꿉니다.\n오늘 한 마음이 결과 세상입니다.\n그것이 성공의 가장 큽니다.\"",
  "\"작은 행동을 시작하고 인내하면,\n그것이 큰 미래를 만들어냅니다.\"",
  "\"오늘 하루, 미래를 위한 투자입니다.\n작은 시작이 큰 변화를 만듭니다.\"",
  "\"꾸준함이 천재를 이깁니다.\n매일의 작은 행동이 미래를 결정합니다.\"",
  // 추가 명언들을 여기에 넣을 수 있습니다
];

const LandingPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    // 초기 애니메이션 표시
    setTimeout(() => {
      setShowAnimation(true);
    }, 300);
  }, []);

  const handleBeginClick = () => {
    setLocation('/');
  };

  // 현재 날짜를 기준으로 명언 선택
  const [quote] = useState(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % motivationalQuotes.length;
    
    return motivationalQuotes[quoteIndex];
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 max-w-[420px] mx-auto">
      {/* 상단 네비게이션 바 */}
      <header className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <div className="text-xl font-semibold">습관 트래커</div>
        <div className="flex space-x-2">
          <div className="text-xs px-2 py-1 bg-blue-700 rounded-md">김한나 님 🔔</div>
          <div className="text-xs px-2 py-1 bg-blue-500 rounded-md">사용자 변경</div>
        </div>
      </header>
      
      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-between p-4">
        {/* 원형 이미지 */}
        <div className="relative w-[280px] h-[280px] mt-6">
          <div className="absolute inset-0 rounded-full overflow-hidden bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=1770&auto=format&fit=crop" 
              alt="Office chair"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 왼쪽 하단 동그란 아이콘 */}
          <div className="absolute bottom-10 left-0 transform -translate-x-1/2 bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
            <span>V</span>
          </div>
          
          {/* 오른쪽 상단 동그란 아이콘 */}
          <div className="absolute top-10 right-0 transform translate-x-1/2 bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
            <span>M</span>
          </div>
        </div>
        
        {/* 문구 섹션 */}
        <div className="text-center mt-6 mb-12">
          <h1 className="text-2xl font-bold text-black">
            "Little actions,<br />
            <span className="inline-block bg-blue-500 px-3 py-1 text-white rounded-md mb-1">Big results!</span>"
          </h1>
          <p className="text-2xl font-bold text-black mt-1">Set it, Do it, Repeat.</p>
          
          {/* 인용문 */}
          <div className="mt-8 px-6 text-gray-600 text-sm whitespace-pre-line">
            {quote}
          </div>
        </div>
        
        {/* 하단 아이콘 */}
        <div className="flex justify-between w-full px-8 mb-4">
          <button className="text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <button className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* 시작하기 버튼 */}
        <button 
          onClick={handleBeginClick}
          className={`w-full max-w-sm bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-md transform transition-all duration-500 tracking-wider ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-500`}
        >
          시작하기
        </button>
      </main>
      
      {/* MORI 비서 버튼 - 화면 우측 하단에 고정 */}
      <div className="fixed bottom-20 right-4 z-20">
        <button 
          onClick={() => setLocation('/notes')}
          className="bg-orange-500 text-white rounded-full p-3 shadow-lg"
        >
          <div className="flex flex-col items-center">
            <span className="text-xl">🤖</span>
            <span className="text-xs font-semibold">Mori</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;