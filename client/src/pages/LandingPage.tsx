import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

// 동기부여 문장
const motivationalQuotes = [
  "\"작은 습관이 인생을 바꿉니다.\n오늘 한 마음이 결과 세상입니다.\n그것이 성공의 가장 큽니다.\"",
  "\"작은 행동을 시작하고 인내하면,\n그것이 큰 미래를 만들어냅니다.\"",
  "\"오늘 하루, 미래를 위한 투자입니다.\n작은 시작이 큰 변화를 만듭니다.\"",
  "\"꾸준함이 천재를 이깁니다.\n매일의 작은 행동이 미래를 결정합니다.\"",
  // 추가 명언들을 여기에 넣을 수 있습니다
];

// 프로필 이미지 갤러리
const profileImages = [
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=1770&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?q=80&w=1770&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1770&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1771&auto=format&fit=crop"
];

const LandingPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showAnimation, setShowAnimation] = useState(false);
  const [selectedImage, setSelectedImage] = useState(profileImages[0]);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 음성 인식 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // API 키 설정 모달 상태
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [notionPageUrl, setNotionPageUrl] = useState('');
  
  // API 키 저장 처리 함수
  const handleSaveApiKeys = async () => {
    if (!user?.id) {
      toast({
        title: "로그인 필요",
        description: "API 키를 저장하려면 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await apiRequest(
        'POST', 
        `/api/users/${user.id}/api-keys`, 
        { geminiApiKey, notionToken, notionPageUrl }
      );
      
      toast({
        title: "API 키 저장 성공",
        description: "API 키와 노션 토큰이 저장되었습니다."
      });
      setShowApiSettings(false);
    } catch (error) {
      console.error('API 키 저장 실패:', error);
      toast({
        title: "API 키 저장 실패",
        description: "API 키를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // 초기 애니메이션 표시
    setTimeout(() => {
      setShowAnimation(true);
    }, 300);
    
    // 로그인 상태 확인 후 API 키 설정 필요 여부 체크
    if (isAuthenticated && user?.id) {
      // API 키 설정 상태 확인
      apiRequest(`/api/users/${user.id}/api-keys`)
        .then(response => {
          // API 키나 노션 토큰이 없으면 설정 모달 표시
          if (!response.hasGeminiApiKey || !response.hasNotionToken) {
            setShowApiSettings(true);
            toast({
              title: "API 키 설정 필요",
              description: "Gemini API 키와 Notion 토큰을 설정해주세요.",
            });
          }
        })
        .catch(error => {
          console.error('API 키 상태 확인 실패:', error);
        });
    }
    
    // 음성 인식 초기화
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ko-KR'; // 한국어 설정
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
        toast({
          title: "음성 인식 오류",
          description: `오류가 발생했습니다: ${event.error}`,
          variant: "destructive"
        });
      };
      
      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current.start();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, toast]);

  const handleBeginClick = () => {
    if (isAuthenticated) {
      // 이미 로그인된 상태라면 메인 페이지로 이동
      setLocation('/');
    } else {
      // 로그인이 필요한 상태라면 로그인 페이지로 이동
      setLocation('/login');
      toast({
        title: "로그인 필요",
        description: "서비스를 이용하려면 로그인이 필요합니다.",
      });
    }
  };

  const handleChangeProfileImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  // 음성 인식 토글 함수
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      // 녹음 중지
      recognitionRef.current?.stop();
      setIsRecording(false);
      
      // 녹음이 끝나면 Gemini API로 보냄
      if (transcript.trim()) {
        handleSpeechInput(transcript);
      }
    } else {
      // 녹음 시작
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
      toast({
        title: "음성 인식 시작",
        description: "말씀하시면 텍스트로 변환됩니다.",
      });
    }
  };
  
  // Gemini API로 음성 입력 처리
  const handleSpeechInput = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await apiRequest('POST', '/api/assistant/classify', { input: text });
      
      toast({
        title: "음성 입력 처리 완료",
        description: `"${response.type}" 타입으로 분류되었습니다. 인사이트에서 확인하세요.`,
      });
      
      // 음성 인식 결과를 localStorage에 저장 (인사이트 페이지에서 사용)
      const storedResults = localStorage.getItem('moriResults');
      const parsedResults = storedResults ? JSON.parse(storedResults) : [];
      parsedResults.push({
        ...response,
        timestamp: new Date().toISOString(),
        inputText: text
      });
      localStorage.setItem('moriResults', JSON.stringify(parsedResults));
      
    } catch (error) {
      console.error('음성 입력 처리 오류:', error);
      toast({
        title: "처리 실패",
        description: "음성 입력을 처리하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 max-w-[390px] mx-auto">
      
      {/* API 키 설정 모달 */}
      {showApiSettings && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">API 설정</h2>
            <p className="text-sm text-gray-600 mb-4">
              음성 기능과 인사이트 기능을 사용하려면 다음 API 키를 설정해주세요.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gemini API 키</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notion 통합 토큰</label>
                <input
                  type="password"
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  placeholder="secret_..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notion 페이지 URL</label>
                <input
                  type="text"
                  value={notionPageUrl}
                  onChange={(e) => setNotionPageUrl(e.target.value)}
                  placeholder="https://www.notion.so/..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowApiSettings(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveApiKeys}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      
      {/* 메인 콘텐츠 */}
      <div className="relative flex flex-col items-center px-8 pt-6 pb-12 z-10 flex-grow">
        {/* 타원형 이미지 컨테이너 */}
        <div className={`w-full max-w-[250px] relative mt-2 mb-4 transition-all duration-500 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Vibes 버블 - 좌측 */}
          <div className={`absolute -left-14 top-[60%] bg-white rounded-full shadow-lg flex items-center p-1.5 px-3 transform transition-all duration-500 z-10 ${showAnimation ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <div className="bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
            <span className="text-sm font-medium">Vibes</span>
          </div>
          
          {/* AI 비서 버블 - 우측 */}
          <div className={`absolute -right-14 top-[30%] bg-white rounded-full shadow-lg flex items-center p-1.5 px-3 transform transition-all duration-500 z-10 ${showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'} delay-200`}>
            <button
              onClick={toggleSpeechRecognition}
              disabled={isProcessing}
              className={`bg-orange-400 rounded-full w-8 h-8 flex items-center justify-center mr-3 transition-all ${isRecording ? 'animate-pulse bg-red-500' : ''} ${isProcessing ? 'opacity-70' : 'hover:bg-orange-500'}`}
            >
              {isRecording ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
            <span className="text-sm font-medium">
              {isRecording ? '녹음 중...' : (isProcessing ? '처리 중...' : 'Mori')}
            </span>
          </div>
          <div className="w-full overflow-hidden bg-orange-100 shadow-md relative" style={{ height: '270px', width: '250px', borderRadius: '50% / 40%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <img
              src={selectedImage}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const imageUrl = URL.createObjectURL(file);
                  setSelectedImage(imageUrl);
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button 
                className="bg-white p-2 rounded-full shadow-lg z-10 opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowGallery(!showGallery)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </button>
              <button 
                className="bg-white p-2 rounded-full shadow-lg z-10 opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18 2l4 4-10 10H8v-4L18 2z"></path>
                </svg>
              </button>
            </div>
            
            {/* 갤러리 모달 */}
            {showGallery && (
              <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 w-[90%] max-h-[90%] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">갤러리에서 선택</h3>
                    <button onClick={() => setShowGallery(false)} className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {profileImages.map((img, index) => (
                      <div 
                        key={index} 
                        className={`aspect-square overflow-hidden rounded-lg cursor-pointer border-2 ${selectedImage === img ? 'border-blue-500' : 'border-transparent'}`}
                        onClick={() => {
                          handleChangeProfileImage(img);
                          setShowGallery(false);
                        }}
                      >
                        <img src={img} alt={`갤러리 이미지 ${index+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 메인 텍스트 영역 */}
        <div className="w-full text-center mt-4">
          <h1 className={`text-2xl font-bold leading-tight transition-all duration-500 tracking-wide ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            "Little actions, <span className="inline-block bg-blue-500 px-2 py-0.5 text-white rounded-md">Big results</span>,<br />
            <span className="text-xl">Set it, Do it, Repeat.</span>"
          </h1>

          <div className="flex items-center mt-6 justify-center relative">
            <span className={`text-red-500 mr-3 absolute -top-2 left-6 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-200`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            {/* 명언 가이드라인 영역 */}
            <div className="w-full max-w-[260px] mx-auto px-3 py-2 mt-2">
              <p className={`text-black text-center transition-all duration-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} delay-300 whitespace-pre-line`} style={{ fontSize: '1.3rem' }}>
                "{quote}"
              </p>
            </div>
            <span className={`text-gray-800 ml-3 absolute -top-2 right-6 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-400`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
          </div>
        </div>

        {/* 음성 인식 중 텍스트 표시 영역 */}
        {isRecording && transcript && (
          <div className="mt-4 p-3 bg-white rounded-lg shadow-md border border-orange-200 w-full max-w-sm mx-auto animate-pulse">
            <p className="text-gray-700 text-sm">{transcript}</p>
          </div>
        )}
        
        {/* 시작하기 버튼 - Let's Begin으로 변경 및 파란색 적용 */}
        <button 
          onClick={handleBeginClick}
          className={`w-full max-w-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-md transform transition-all duration-500 tracking-wider ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} mt-6 delay-500`}
        >
          Let's Begin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;