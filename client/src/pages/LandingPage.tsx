import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// 배경 이미지 목록
const backgroundImages = [
  'https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?q=80&w=1935&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543157145-f78c636d023d?q=80&w=1769&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531278107443-3dda3e4dbb36?q=80&w=1771&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1605106702734-205df224ecce?q=80&w=1770&auto=format&fit=crop',
];

// 동기부여 문장
const motivationalQuotes = [
  "작은 습관이 모여 인생을 바꿉니다.",
  "오늘 하루, 미래를 위한 투자입니다.",
  "꾸준함이 천재를 이깁니다.",
  "지금 당신의 선택이 미래를 결정합니다.",
  "시작이 반입니다. 지금 바로 시작하세요.",
  "포기하면 그 순간이 끝입니다.",
  "작은 성공이 큰 자신감을 만듭니다.",
  "매일 1%의 성장이 1년 후엔 37배의 차이를 만듭니다.",
  "습관은 인생의 나침반입니다.",
  "실패는 성공의 어머니입니다.",
  "노력은 배신하지 않습니다.",
  "오늘 할 수 있는 일을 내일로 미루지 마세요.",
  "위대한 여정도 한 걸음부터 시작합니다.",
];

const LandingPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    // 초기 애니메이션 표시
    setTimeout(() => {
      setShowAnimation(true);
    }, 300);
    
    // 백그라운드 이미지 자동 변경
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 7000);
    
    return () => {
      clearInterval(bgInterval);
    };
  }, []);

  const handleGetStarted = () => {
    setLocation('/');
  };

  // 랜덤 명언 가져오기
  const [quote] = useState(() => {
    const quoteIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[quoteIndex];
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 배경 이미지 컨테이너 */}
      <div className="fixed inset-0 z-0">
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              currentBgIndex === index ? 'opacity-30' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-blue-700/70" />
      </div>
      
      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col justify-center items-center flex-grow px-6 pt-12 pb-24 text-white">
        <div className="max-w-lg mx-auto text-center">
          <h1 className={`text-2xl font-bold leading-tight transition-all duration-500 font-poppins tracking-wide ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            "Little actions,<br />
            <span className="inline-block bg-blue-500 px-2 py-0.5 text-white rounded-md">Big results!</span>"<br />
            <span className="text-3xl font-semibold">Set it, Do it, Repeat.</span>
          </h1>
          
          <div className="flex items-center mt-6 justify-center relative">
            <div className={`transition-all duration-700 delay-100 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                시작하기
              </button>
            </div>
            
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className={`text-white/80 text-sm transition-all duration-700 delay-200 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {quote}
              </p>
            </div>
          </div>
        </div>
        
        {/* MORI 비서 버튼 */}
        <div className={`fixed bottom-8 right-8 transition-all duration-700 delay-300 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <button 
            onClick={() => setLocation('/notes')}
            className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl">🤖</span>
              <span className="text-xs font-semibold mt-1">MORI 비서</span>
              <span className="text-[10px] mt-0.5">Make your Day Productive</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;