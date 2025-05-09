import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 날씨 아이콘 컴포넌트 (간단한 일러스트로 구현)
const WeatherIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons = {
    sunny: (
      <div className="text-yellow-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </div>
    ),
    cloudy: (
      <div className="text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
        </svg>
      </div>
    ),
    rainy: (
      <div className="text-blue-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
          <path d="M16 14v6"/>
          <path d="M8 14v6"/>
          <path d="M12 16v6"/>
        </svg>
      </div>
    ),
    snowy: (
      <div className="text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
          <path d="M8 15h.01"/>
          <path d="M8 19h.01"/>
          <path d="M12 17h.01"/>
          <path d="M12 21h.01"/>
          <path d="M16 15h.01"/>
          <path d="M16 19h.01"/>
        </svg>
      </div>
    ),
  };

  return icons[type as keyof typeof icons] || icons.sunny;
};

// 명언 데이터 (실제로는 API나 DB에서 가져올 수 있음)
const quotes = [
  "하루를 시작하는 가장 좋은 방법은 어제 해결하지 못한 일을 생각하는 것이 아니라, 오늘 할 수 있는 일에 감사하는 것입니다.",
  "오늘 하루가 당신의 인생에서 가장 중요한 날이라고 생각하세요.",
  "가장 큰 영광은 한 번도 실패하지 않음이 아니라, 실패할 때마다 다시 일어서는 데에 있다. - 공자",
  "당신의 시간은 제한되어 있습니다. 다른 사람의 삶을 사느라 시간을 낭비하지 마세요. - 스티브 잡스",
  "노력 없이 얻을 수 있는 것은 아무것도 없습니다. 꿈을 이루기 위해 오늘도 한 걸음씩 나아가세요.",
  "불가능이란 단지 아직 해보지 않은 것일 뿐입니다.",
  "당신이 상상할 수 있다면, 당신은 그것을 이룰 수 있습니다. - 월트 디즈니",
  "삶이 있는 한 희망은 있다. - 키케로",
  "성공한 사람이 되려고 노력하기보다 가치있는 사람이 되려고 노력하라. - 알버트 아인슈타인",
  "오늘의 나는 어제 결정한 선택의 결과이고 내일의 나는 오늘 내가 선택한 결과다.",
];

const MorningPage: React.FC = () => {
  const [quote, setQuote] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [temperature, setTemperature] = useState<string>("23°C");
  const [weatherType, setWeatherType] = useState<string>("sunny");
  const [, setLocation] = useLocation();

  // 명언 랜덤 선택
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  // 현재 시간과 날짜 업데이트
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const goToMainPage = () => {
    setLocation('/');
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gradient-to-b from-pink-50 via-indigo-50 to-white">
      {/* 상단 날씨 및 시간 정보 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-2xl font-bold">{currentTime}</div>
          <div className="text-gray-500">{date}</div>
        </div>
        <div className="flex items-center gap-2">
          <WeatherIcon type={weatherType} />
          <span className="text-xl font-medium">{temperature}</span>
        </div>
      </div>
      
      {/* 사용자 이미지 */}
      <div className="mx-auto mb-8 w-full max-w-xs">
        <div className="relative">
          <div className="aspect-square rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img 
              src="https://via.placeholder.com/300x300.png?text=Profile" 
              alt="Morning Profile"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 행동 버튼 (이미지에서 본 디자인 요소) */}
          <div className="absolute top-5 right-0 flex items-center bg-white rounded-full px-3 py-1.5 shadow-md">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <span className="text-sm font-medium">명상하기</span>
          </div>
          
          {/* 행동 버튼 (이미지에서 본 또 다른 요소) */}
          <div className="absolute bottom-5 left-0 flex items-center bg-white rounded-full px-3 py-1.5 shadow-md">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l-3 -3 3 -3" />
                <path d="M21 11l3 -3 -3 -3" />
                <path d="M12 14l0 7" />
                <path d="M8 14l8 0" />
                <path d="M9 3l3 3 3 -3" />
              </svg>
            </div>
            <span className="text-sm font-medium">메시지</span>
          </div>
        </div>
      </div>
      
      {/* 명언 카드 */}
      <Card className="p-6 mb-8 text-center shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-3xl">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">오늘의 명언</h2>
        <p className="text-lg mb-6 leading-relaxed">{quote}</p>
      </Card>
      
      {/* 시작 버튼 */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center">
          <span className="block">습관을</span>
          <div className="flex justify-center items-center gap-2 my-1">
            <span className="bg-orange-500 text-white px-2 py-1 rounded">단 몇초 만에</span>
            <span>기록하기</span>
          </div>
        </h1>
        
        <p className="text-center text-gray-600 mb-4">
          "단 몇 번의 터치만으로 오늘의 습관을 기록하고<br />
          당신의 성장을 직접 확인하세요!"
        </p>
        
        <Button 
          className="w-full py-6 text-lg rounded-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 border-0 shadow-lg transition-all hover:shadow-xl" 
          onClick={goToMainPage}
        >
          시작하기
        </Button>
      </div>
    </div>
  );
};

export default MorningPage;