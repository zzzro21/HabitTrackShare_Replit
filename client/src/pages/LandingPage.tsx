import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';

// 사용자가 선택할 수 있는 이미지 목록
const profileImages = [
  "https://images.unsplash.com/photo-1596079890744-c1a0462d0975?auto=format&fit=crop&q=80", // 기본 이미지
  "/attached_assets/KakaoTalk_20250509_131525036.jpg",
  "/attached_assets/KakaoTalk_20250511_022622360_03.jpg",
  "/attached_assets/sample.jpg",
  "/attached_assets/스크린샷 2025-05-09 170854.png",
  "/attached_assets/스크린샷 2025-05-09 182446.png"
];

// 동기부여 문장 배열 (한국어)
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
  "자신을 믿으세요, 당신은 생각보다 강합니다.",
  "성공의 비결은 시작하는 용기입니다.",
  "불가능은 단지 의견일 뿐입니다.",
  "계획 없는 목표는 단지 소원일 뿐입니다.",
  "꿈을 현실로 만드는 것은 당신의 행동입니다.",
  "습관은 제2의 천성입니다.",
  "하루의 반복이 인생을 결정합니다.",
  "쉬운 길이 아닌 옳은 길을 선택하세요.",
  "당신의 한계는 당신의 생각에서 시작됩니다.",
  "작은 변화가 큰 차이를 만듭니다.",
  "시간은 기다려주지 않습니다.",
  "오늘이 인생에서 가장 젊은 날입니다.",
  "자신을 위한 투자가 가장 큰 수익을 가져옵니다.",
  "목표를 세우고 그것을 이루기 위해 매일 노력하세요.",
  "위대한 성취는 작은 시작에서 비롯됩니다.",
  "매일 조금씩, 꾸준히 나아가세요.",
  "당신의 습관이 당신의 미래를 만듭니다.",
  "오늘의 노력이 내일의 결실을 맺습니다.",
  "지금 당장 시작하세요, 완벽한 때는 없습니다.",
  "내일의 당신에게 고마움을 느끼게 하세요.",
  "매일이 새로운 기회입니다.",
  "성공은 준비된 자의 몫입니다.",
  "가장 어두운 밤이 지나면 해가 뜹니다.",
  "불가능을 가능으로 바꾸는 것은 당신의 의지입니다.",
  "천천히 가더라도 멈추지 마세요.",
  "꿈은 이루어질 때까지 꿈이 아닙니다.",
  "행복은 습관입니다.",
  "변화는 당신에게서 시작됩니다.",
  "성공의 열쇠는 시작하는 것입니다.",
  "매일 작은 도전을 하세요.",
  "당신의 미래는 오늘 만들어집니다.",
  "실패를 두려워하지 마세요, 시도하지 않는 것을 두려워하세요.",
  "가장 큰 위험은 위험을 감수하지 않는 것입니다.",
  "작은 목표를 이루면 큰 목표도 이룰 수 있습니다.",
  "자신에게 투자하는 것은 가장 현명한 선택입니다.",
  "어제보다 나은 오늘을 살아가세요.",
  "성공의 비결은 실패에서 배우는 것입니다.",
  "당신의 습관이 당신의 성공을 결정합니다.",
  "포기하고 싶을 때가 가장 노력해야 할 때입니다.",
  "습관은 인생의 설계도입니다.",
  "매일 작은 변화가 큰 변화를 만듭니다.",
  "실패는 끝이 아니라 새로운 시작입니다.",
  "꿈을 크게 가지고 작게 시작하세요.",
  "당신의 한계를 시험해보세요.",
  "오늘의 선택이 미래를 결정합니다.",
  "나를 넘어서는 작은 도전을 매일 하세요.",
  "자기관리가 성공의 첫걸음입니다.",
  "하루 하루가 새로운 시작입니다.",
  "목표를 향한 작은 걸음도 진전입니다.",
  "성공은 매일의 작은 노력의 합입니다.",
  "자신을 믿고 계속 나아가세요.",
  "행동이 변하면 결과도 변합니다.",
  "당신의 꿈은 당신만큼 크게 자랍니다.",
  "지금 심는 씨앗이 미래의 열매가 됩니다.",
  "매일 조금씩 더 나아지세요.",
  "습관은 당신의 두 번째 본성입니다.",
  "당신의 태도가 당신의 고도를 결정합니다.",
  "작은 승리를 축하하세요.",
  "실패에서 배우고 성공을 향해 나아가세요.",
  "당신이 변하면 세상도 변합니다.",
  "행동이 말보다 큰 소리로 말합니다.",
  "오늘 할 수 있는 일에 집중하세요.",
  "내일은 오늘 당신이 내린 결정에 달려있습니다.",
  "당신의 잠재력은 무한합니다.",
  "습관이 운명을, 운명이 인생을 만듭니다.",
  "끝까지 가는 사람이 승리합니다.",
  "매일의 작은 선택이 인생을 결정합니다.",
  "진정한 성공은 자신과의 경쟁에서 이기는 것입니다.",
  "오늘의 습관이 내일의 당신을 만듭니다.",
  "시작하는 용기가 성공의 절반입니다.",
  "당신의 생각이 현실이 됩니다.",
  "목표를 위해 오늘 한 가지를 실천하세요.",
  "작은 변화가 큰 차이를 만듭니다.",
  "인내는 쓰지만 그 열매는 달콤합니다.",
  "포기는 항상 실패보다 더 쉽습니다. 그러나 더 어려운 길을 선택하세요.",
  "꿈을 믿고, 계획하고, 행동하세요.",
  "당신의 미래는 당신의 손에 달려 있습니다.",
  "오늘 하루가 인생의 작은 조각입니다.",
  "습관의 힘을 무시하지 마세요.",
  "성공은 준비와 기회의 만남입니다.",
  "매일의 작은 진보가 큰 성공을 이룹니다.",
  "오늘의 노력이 내일의 당신을 만듭니다.",
  "가장 중요한 투자는 자신에 대한 투자입니다.",
  "지금 당장 할 수 있는 일부터 시작하세요.",
  "계획이 있는 열정은 성공으로 이어집니다.",
  "습관은 당신의 운명을 만드는 힘입니다."
];

const LandingPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [showAnimation, setShowAnimation] = useState(false);
  const [quote, setQuote] = useState("");
  const [selectedImage, setSelectedImage] = useState(profileImages[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // FHD+ 해상도(1080x2340)에 맞는 비율 계산
  const aspectRatio = 2340 / 1080;

  useEffect(() => {
    // 애니메이션을 위한 딜레이 추가
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 100);

    // 긴 문장 예시를 보여주기 위해 임시로 특정 긴 문장 선택
    // 실제 배포 시에는 날짜 기반 랜덤 선택으로 복원할 것
    // setQuote(motivationalQuotes[quoteIndex]);
    
    // 긴 문장 예시 - 각 문장 끝에 줄바꿈 추가
    setQuote("포기는 항상 실패보다 더 쉽습니다.\n그러나 더 어려운 길을 선택하세요.\n그것이 성공으로 가는 길입니다.");

    return () => clearTimeout(timer);
  }, []);

  // 습관 트래커로 이동
  const handleBeginClick = () => {
    navigate('/home'); // 홈 페이지 경로로 이동
  };
  
  // 프로필 이미지 선택 함수
  const handleChangeProfileImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  // 갤러리 이미지 선택 모달 표시
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div 
      className="flex flex-col relative overflow-hidden px-0 font-sans mx-auto aurora-gradient"
      style={{ 
        maxWidth: '1080px', /* FHD+ 6.2인치 화면 너비 */
        minHeight: '90vh',
        height: 'auto',
        aspectRatio: '1080 / 2200' /* 세로 비율 약간만 줄임 */
      }}
    >
      {/* 배경 */}
      <div className="absolute top-0 left-0 w-full h-full"></div>

      {/* 메인 콘텐츠 */}
      <div className="relative flex flex-col items-center px-8 pt-10 pb-16 z-10 flex-grow">
        {/* 타원형 이미지 컨테이너 */}
        <div className={`w-full max-w-[288px] relative mt-0 mb-8 transition-all duration-500 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Vibes 버블 - 좌측 */}
          <div className={`absolute -left-14 top-[60%] bg-white rounded-full shadow-lg flex items-center p-2.5 px-5 transform transition-all duration-500 z-10 ${showAnimation ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
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
          <div className={`absolute -right-14 top-[30%] bg-white rounded-full shadow-lg flex items-center p-2.5 px-5 transform transition-all duration-500 z-10 ${showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'} delay-200`}>
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
          <div className="w-full overflow-hidden bg-orange-100 shadow-xl relative" style={{ height: '360px', width: '288px', borderRadius: '50% / 38%' }}>
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
        <div className="w-full text-center mt-8">
          <h1 className={`text-4xl font-bold leading-tight transition-all duration-500 font-poppins tracking-wide ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            "Little actions, <span className="inline-block bg-blue-500 px-3 py-1 text-white rounded-md">Big results</span>,<br />
            <span className="text-3xl">Set it, Do it, Repeat.</span>"
          </h1>

          <div className="flex items-center mt-10 justify-center relative">
            <span className={`text-red-500 mr-3 absolute -top-2 left-16 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-200`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            {/* 명언 가이드라인 영역 */}
            <div className="w-full max-w-[260px] mx-auto px-3 py-3">
              <p className={`text-black text-center transition-all duration-500 font-pen ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} delay-300 whitespace-pre-line`} style={{ fontSize: '1.6rem' }}>
                "{quote}"
              </p>
            </div>
            <span className={`text-gray-800 ml-3 absolute right-16 transition-opacity duration-500 ${showAnimation ? 'opacity-100' : 'opacity-0'} delay-400`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="w-full mt-auto">
          <div className="flex justify-center mt-16">
            <button
              onClick={handleBeginClick}
              className={`w-4/5 max-w-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-2xl shadow-xl transform transition-all duration-500 font-poppins tracking-wider ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-500`}
            >
              Let's Begin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;