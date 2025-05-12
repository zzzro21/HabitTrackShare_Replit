import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

const LandingPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // 애니메이션을 위한 딜레이 추가
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 습관 트래커로 이동
  const handleBeginClick = () => {
    navigate('/home'); // 홈 페이지 경로로 이동
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative overflow-hidden px-0 font-sans">
      {/* Status Bar (모바일 디바이스 스타일) */}
      <div className="relative z-10 w-full bg-gray-100 px-6 py-3 flex justify-between items-center">
        <div className="text-black font-semibold">9:41</div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 10a6 6 0 00-12 0v4M5 18h14a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div className="w-4 h-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 5h22M1 12h22M1 19h22" />
            </svg>
          </div>
          <div className="w-6 h-3 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* 배경 (핑크 그라데이션) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-pink-50 to-white"></div>

      {/* 메인 콘텐츠 */}
      <div className="relative flex flex-col items-center px-6 pt-4 pb-16 z-10 flex-grow">
        {/* 타원형 이미지 컨테이너 */}
        <div className={`w-full max-w-[340px] relative mt-2 mb-6 transition-all duration-500 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="w-full overflow-hidden bg-orange-100 border-4 border-white shadow-xl" style={{ height: '440px', borderRadius: '50% / 65%' }}>
            <img
              src="https://images.unsplash.com/photo-1596079890744-c1a0462d0975?auto=format&fit=crop&q=80"
              alt="여성이 노트북을 사용하는 모습"
              className="w-full h-full object-cover"
            />

            {/* 메시지 버블 - 좌측 */}
            <div className={`absolute left-0 bottom-2/5 bg-white rounded-full shadow-md flex items-center p-1.5 px-3 transform transition-all duration-500 ${showAnimation ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="bg-purple-500 rounded-full w-7 h-7 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998L10 2 2.003 5.884z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Message</span>
            </div>
            
            {/* 명상 버블 - 우측 */}
            <div className={`absolute right-0 top-1/4 bg-white rounded-full shadow-md flex items-center p-1.5 px-3 transform transition-all duration-500 ${showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'} delay-200`}>
              <div className="bg-orange-400 rounded-full w-7 h-7 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Meditate</span>
            </div>
          </div>
        </div>

        {/* 메인 텍스트 영역 */}
        <div className="w-full text-center mt-4">
          <h1 className={`text-3xl font-bold leading-tight transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Little actions, <span className="inline-block bg-orange-400 px-2 py-0.5 text-white rounded-md">Big results</span>;<br />
            Set it; Do it; Repeat.
          </h1>

          <div className="flex items-center mt-6 justify-center">
            <span className={`text-red-500 mr-2 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-200`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p className={`text-gray-700 text-md transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} delay-300`}>
              "Just a few taps, and we'll<br />remind you exactly when you need it!"
            </p>
            <span className={`text-gray-800 ml-2 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-400`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="w-full mt-auto">
          <button
            onClick={handleBeginClick}
            className={`w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-500`}
          >
            Lets Begin
          </button>
          
          {/* 홈 인디케이터 (iOS 스타일) */}
          <div className="w-full flex justify-center mt-6">
            <div className="w-32 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;