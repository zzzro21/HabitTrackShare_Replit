import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 아이콘 컴포넌트
const MessageIcon = () => (
  <div className="bg-purple-500 p-3 rounded-full w-10 h-10 flex items-center justify-center text-white">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  </div>
);

const MeditateIcon = () => (
  <div className="bg-orange-500 p-3 rounded-full w-10 h-10 flex items-center justify-center text-white">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
    </svg>
  </div>
);

const AlarmIcon = () => (
  <div className="text-red-500">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  </div>
);

const BombIcon = () => (
  <div className="text-gray-700">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  </div>
);

const IntroPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // 이미 로그인되어 있으면 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation('/home');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // 시작하기 버튼 클릭 핸들러
  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation('/home');
    } else {
      setLocation('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 배경 이미지가 포함된 상단 영역 */}
      <div className="relative flex-grow flex justify-center items-center overflow-hidden">
        <div className="relative rounded-full w-72 h-72 md:w-80 md:h-80 overflow-hidden shadow-xl">
          <img
            src="/images/woman-laptop.jpg"
            alt="Woman using laptop"
            className="w-full h-full object-cover"
          />
          
          {/* 오버레이 아이콘들 */}
          <div className="absolute top-1/4 left-0 transform -translate-x-1/2">
            <MessageIcon />
          </div>
          
          <div className="absolute top-1/6 right-0 transform translate-x-1/2">
            <MeditateIcon />
          </div>
        </div>
      </div>
      
      {/* 텍스트 영역 */}
      <div className="px-8 py-10 flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Reminders in
          <span className="bg-orange-400 text-white px-2 py-1 inline-block mx-1">Seconds</span>
        </h1>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <AlarmIcon />
          <BombIcon />
        </div>
        
        <p className="text-gray-600 mb-10">
          "Just a few taps, and we'll remind you exactly when you need it!"
        </p>
        
        <Button 
          onClick={handleGetStarted}
          className="w-full py-6 text-lg font-semibold bg-orange-400 hover:bg-orange-500 text-white rounded-full"
        >
          Let's Begin
        </Button>
      </div>
    </div>
  );
};

export default IntroPage;