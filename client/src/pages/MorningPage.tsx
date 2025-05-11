import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import WeatherIcon from '@/components/WeatherIcon';

// 명언 데이터
const morningQuotes = [
  "오늘 하루도 힘차게 시작하세요. 긍정적인 마음가짐이 행복의 시작입니다.",
  "작은 변화가 큰 성장을 이끕니다. 오늘 하루도 발전하는 하루가 되길 바랍니다.",
  "당신이 변화시킬 수 있는 건 오직 자신뿐입니다. 오늘도 한걸음 더 나아가세요.",
  "습관은 인생을 만들고, 당신은 습관을 만듭니다. 좋은 습관을 가꾸세요.",
  "성공한 사람이 되려고 노력하기보다 가치 있는 사람이 되려고 노력하세요.",
  "인생에서 가장 큰 영광은 결코 넘어지지 않는 것이 아니라 넘어질 때마다 다시 일어서는 데에 있습니다.",
  "어제와 똑같이 살면서 다른 미래를 기대하는 것은 어리석은 일입니다.",
  "당신의 하루 하루가 당신의 인생을 만들어갑니다. 후회 없는 하루를 보내세요.",
  "좋은 성과는 잘 다듬어진 습관에서 나옵니다. 꾸준함이 당신을 성공으로 이끌 것입니다.",
  "당신이 생각하는 대로 당신은 그렇게 됩니다. 긍정적인 생각으로 하루를 시작하세요."
];

const MorningPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 18, condition: 'sunny' as 'sunny' | 'cloudy' | 'rainy' | 'snowy' });
  const [dailyQuote, setDailyQuote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isQuoteRead, setIsQuoteRead] = useState(false);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const micRef = useRef<HTMLButtonElement>(null);
  
  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트
    
    return () => clearInterval(timer);
  }, []);
  
  // 앱의 "오늘" 날짜 계산 (오전 6시 기준)
  const getAppDay = () => {
    const now = new Date();
    const today = new Date();
    
    // 현재 시간이 오전 6시 이전이면, 어제 날짜로 계산
    if (now.getHours() < 6) {
      today.setDate(today.getDate() - 1);
    }
    
    return today.toDateString();
  };
  
  // 오늘의 명언 가져오기
  useEffect(() => {
    const getTodaysQuote = () => {
      // 앱의 "오늘" (오전 6시 기준)
      const appDay = getAppDay();
      
      // 로컬 스토리지에서 오늘의 명언과 날짜 가져오기
      const savedQuote = localStorage.getItem('morningQuote');
      const savedDate = localStorage.getItem('morningQuoteDate');
      
      // 저장된 명언이 있고 오늘 날짜와 같다면 그대로 사용
      if (savedQuote && savedDate === appDay) {
        setDailyQuote(savedQuote);
      } else {
        // 새로운 랜덤 명언 선택
        const randomIndex = Math.floor(Math.random() * morningQuotes.length);
        const newQuote = morningQuotes[randomIndex];
        
        // 로컬 스토리지에 저장
        localStorage.setItem('morningQuote', newQuote);
        localStorage.setItem('morningQuoteDate', appDay);
        
        setDailyQuote(newQuote);
      }
    };
    
    getTodaysQuote();
  }, []);
  
  // 이 페이지가 오늘 이미 완료되었는지 확인
  useEffect(() => {
    const checkIfCompleted = () => {
      const appDay = getAppDay(); // 앱의 "오늘" (오전 6시 기준)
      const completedDate = localStorage.getItem('morningCompletedDate');
      
      // 오늘 이미 완료했다면 완료 상태로 표시
      if (completedDate === appDay) {
        setIsQuoteRead(true);
      } else {
        // 3초 후에 마이크 프롬프트 표시
        const timer = setTimeout(() => {
          setShowMicPrompt(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    };
    
    checkIfCompleted();
  }, []);
  
  // 마이크 녹음 시작
  const startRecording = () => {
    setIsRecording(true);
    
    // 실제 음성 인식 구현 (SpeechRecognition API 사용)
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        console.log('음성 인식 시작');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('인식된 텍스트:', transcript);
        
        // 간단한 검증: 최소 몇 글자 이상 말했는지 확인
        if (transcript.length > 10) {
          completeQuoteReading();
        } else {
          setIsRecording(false);
          alert('명언을 완전히 읽어주세요.');
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        console.log('음성 인식 종료');
        setIsRecording(false);
      };
      
      recognition.start();
    } else {
      // SpeechRecognition을 지원하지 않는 브라우저 처리
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. 버튼을 눌러 계속 진행하세요.');
      
      // 개발 테스트를 위해 3초 후 인식 완료로 처리
      setTimeout(() => {
        completeQuoteReading();
      }, 3000);
    }
  };
  
  // 명언 읽기 완료 처리
  const completeQuoteReading = () => {
    setIsQuoteRead(true);
    setIsRecording(false);
    
    // 오늘 완료했음을 저장 (앱의 "오늘" 기준)
    localStorage.setItem('morningCompletedDate', getAppDay());
    
    // 성공 애니메이션 후 홈으로 이동
    setTimeout(() => {
      setLocation('/home');
    }, 3000);
  };
  
  // 완료 후 다른 페이지로 이동
  const navigateToHome = () => {
    setLocation('/home');
  };
  
  // 사용자 프로필 이미지
  const userProfileImage = '/images/woman-laptop.jpg';
  
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-teal-50">
      {/* 날씨 및 시간 정보 */}
      <div className="absolute top-0 left-0 right-0 z-10 p-5 flex justify-between items-center">
        <div className="flex items-center space-x-2 bg-white/80 p-2 px-4 rounded-full shadow-sm">
          <WeatherIcon condition={weather.condition} />
          <span className="text-lg font-semibold">{weather.temp}°C</span>
        </div>
        
        <div className="bg-white/80 p-2 px-4 rounded-full shadow-sm">
          <span className="text-lg font-semibold">
            {format(currentTime, 'a h:mm', { locale: ko })}
          </span>
        </div>
      </div>
      
      {/* 배경 이미지 */}
      <div className="flex-grow flex flex-col items-center">
        <div className="relative w-full h-screen max-h-[70vh] overflow-hidden">
          <img 
            src={userProfileImage} 
            alt="Morning inspiration" 
            className="w-full h-full object-cover"
          />
          
          {/* 이미지 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-50/90"></div>
        </div>
      </div>
      
      {/* 명언 섹션 */}
      <div className="relative -mt-32 pb-20 px-6 flex flex-col items-center">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">오늘의 명언</h2>
          
          <p className="text-lg text-gray-700 italic mb-6">
            "{dailyQuote}"
          </p>
          
          {showMicPrompt && !isQuoteRead && (
            <div className="flex flex-col items-center">
              <button
                ref={micRef}
                onClick={startRecording}
                disabled={isRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition ${
                  isRecording 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                  />
                </svg>
              </button>
              
              <p className="mt-4 text-sm text-gray-600 text-center">
                {isRecording 
                  ? '듣고 있어요...' 
                  : '마이크를 누르고 명언을 소리내어 읽어주세요.'}
              </p>
            </div>
          )}
          
          {isQuoteRead && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <p className="mt-4 text-green-600 font-medium">
                완료! 오늘 하루도 힘차게 시작하세요.
              </p>
              
              <button
                onClick={navigateToHome}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full"
              >
                앱 사용하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MorningPage;