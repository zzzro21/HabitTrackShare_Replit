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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black relative overflow-hidden px-4">
      {/* 배경 이미지 (타원형) */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120%] h-[60vh] rounded-full bg-orange-50 -translate-y-1/4">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 메인 이미지 (원 안의 사람) */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?q=80&w=1287&auto=format&fit=crop"
              alt="습관 관리"
              className="w-full h-full object-cover"
            />
            
            {/* 메시지 버블 */}
            <div className={`absolute left-0 bottom-24 bg-white rounded-full shadow-md flex items-center p-2 px-3 transform transition-all duration-500 ${showAnimation ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998L10 2 2.003 5.884zM10 11.618l-8-4v6.664l8 4 8-4V7.618l-8 4z" />
                </svg>
              </div>
              <span className="text-sm font-medium">메시지</span>
            </div>
            
            {/* 명상 버블 */}
            <div className={`absolute right-0 top-16 bg-white rounded-full shadow-md flex items-center p-2 px-3 transform transition-all duration-500 ${showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'} delay-300`}>
              <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">메디테이션</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 텍스트 영역 */}
      <div className="mt-[52vh] text-center">
        <h1 className={`text-4xl font-bold mb-0 transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Create Reminders<br />in <span className="bg-orange-400 px-2 text-white rounded-md">Seconds</span>
        </h1>

        <div className="flex items-center justify-center space-x-2 mt-6">
          <span className={`text-red-500 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-300`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <p className={`text-gray-700 text-lg transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} delay-300`}>
            "Just a few taps, and we'll<br />remind you exactly when you need it!"
          </p>
          <span className={`text-gray-800 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-300`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </span>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleBeginClick}
          className={`mt-12 bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'} delay-500`}
        >
          Lets Begin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;