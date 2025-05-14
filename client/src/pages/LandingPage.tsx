import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

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
  
  useEffect(() => {
    // 초기 애니메이션 표시
    setTimeout(() => {
      setShowAnimation(true);
    }, 300);
  }, []);

  const handleBeginClick = () => {
    setLocation('/');
  };

  const handleChangeProfileImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
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
            <div className="bg-orange-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <span className="text-sm font-medium">Mori</span>
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

        {/* 시작하기 버튼 */}
        <button 
          onClick={handleBeginClick}
          className={`w-full max-w-sm bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-md transform transition-all duration-500 tracking-wider ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} mt-10 delay-500`}
        >
          시작하기
        </button>
      </div>
      
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