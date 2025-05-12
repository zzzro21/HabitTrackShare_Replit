import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

// 동기부여 문장 배열
const motivationalQuotes = [
  "Just a few taps, and we'll remind you exactly when you need it!",
  "Small steps today, big achievements tomorrow!",
  "Every habit you build is a brick in your success wall.",
  "Track today, transform tomorrow!",
  "Your habits define your future. Start now!",
  "One check at a time towards your best self.",
  "Consistency is the secret ingredient to success.",
  "Growth happens outside your comfort zone.",
  "Today's discipline creates tomorrow's achievements.",
  "Turn your goals into daily actions and watch the magic happen!"
];

const LandingPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [showAnimation, setShowAnimation] = useState(false);
  const [quote, setQuote] = useState("");
  
  // FHD+ 해상도(1080x2340)에 맞는 비율 계산
  const aspectRatio = 2340 / 1080;

  useEffect(() => {
    // 애니메이션을 위한 딜레이 추가
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 100);

    // 랜덤 동기부여 문장 선택
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);

    return () => clearTimeout(timer);
  }, []);

  // 습관 트래커로 이동
  const handleBeginClick = () => {
    navigate('/home'); // 홈 페이지 경로로 이동
  };

  return (
    <div 
      className="flex flex-col bg-white relative overflow-hidden px-0 font-sans mx-auto"
      style={{ 
        maxWidth: '1080px', 
        minHeight: '100vh',
        height: 'auto',
        aspectRatio: '1080 / 2340'
      }}
    >
      {/* Status Bar (모바일 디바이스 스타일) */}
      <div className="relative z-10 w-full bg-gray-100 px-8 py-4 flex justify-between items-center">
        <div className="text-black font-semibold text-lg">9:41</div>
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 10a6 6 0 00-12 0v4M5 18h14a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div className="w-5 h-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 5h22M1 12h22M1 19h22" />
            </svg>
          </div>
          <div className="w-8 h-3.5 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* 배경 (핑크 그라데이션) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-pink-50 to-white"></div>

      {/* 메인 콘텐츠 */}
      <div className="relative flex flex-col items-center px-8 pt-6 pb-24 z-10 flex-grow">
        {/* 타원형 이미지 컨테이너 */}
        <div className={`w-full max-w-[304px] relative mt-8 mb-10 transition-all duration-500 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="w-full overflow-hidden bg-orange-100 border-4 border-white shadow-xl" style={{ height: '384px', borderRadius: '100% / 69%' }}>
            <img
              src="https://images.unsplash.com/photo-1596079890744-c1a0462d0975?auto=format&fit=crop&q=80"
              alt="여성이 노트북을 사용하는 모습"
              className="w-full h-full object-cover"
            />

            {/* Vibes 버블 - 좌측 */}
            <div className={`absolute -left-12 top-2/3 bg-white rounded-full shadow-lg flex items-center p-2.5 px-5 transform transition-all duration-500 ${showAnimation ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="bg-purple-500 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <span className="text-base font-medium">Vibes</span>
            </div>
            
            {/* AI 비서 버블 - 우측 */}
            <div className={`absolute -right-12 top-1/4 bg-white rounded-full shadow-lg flex items-center p-2.5 px-5 transform transition-all duration-500 ${showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'} delay-200`}>
              <div className="bg-orange-400 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <span className="text-base font-medium">Mori</span>
            </div>
          </div>
        </div>

        {/* 메인 텍스트 영역 */}
        <div className="w-full text-center mt-8">
          <h1 className={`text-4xl font-bold leading-tight transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            "Little actions, <span className="inline-block bg-orange-400 px-3 py-1 text-white rounded-md">Big results</span>,<br />
            Set it, Do it, Repeat."
          </h1>

          <div className="flex items-center mt-8 justify-center">
            <span className={`text-red-500 mr-3 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-200`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p className={`text-gray-700 text-xl transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} delay-300`}>
              "{quote}"
            </p>
            <span className={`text-gray-800 ml-3 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-400`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="w-full mt-auto">
          <button
            onClick={handleBeginClick}
            className={`w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-6 px-8 rounded-full text-2xl shadow-xl transform transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-500`}
          >
            Lets Begin
          </button>
          
          {/* 홈 인디케이터 (iOS 스타일) */}
          <div className="w-full flex justify-center mt-8">
            <div className="w-40 h-1.5 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;