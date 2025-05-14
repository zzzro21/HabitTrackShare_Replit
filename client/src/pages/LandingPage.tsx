import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// 인트로 슬라이드 이미지 파일 경로 (KakaoTalk 이미지들 사용)
import image1 from '@assets/KakaoTalk_20250511_022622360_03.jpg';
import image2 from '@assets/KakaoTalk_20250511_022622360_05.jpg';
import image3 from '@assets/KakaoTalk_20250511_022622360_06.jpg';
import image4 from '@assets/KakaoTalk_20250511_023022537_01.png';
import image5 from '@assets/KakaoTalk_20250509_131525036.jpg';

// 동기부여 문장 모음
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
  "하루 하루가 새로운 시작입니다."
];

// 랜덤 이미지와 인용구 가져오기
function getRandomImage() {
  const images = [image1, image2, image3, image4, image5];
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
}

const LandingPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [quote, setQuote] = useState<string>('');
  
  // 컴포넌트 마운트 시 랜덤 이미지와 인용구 설정
  useEffect(() => {
    setBackgroundImage(getRandomImage());
    setQuote(getRandomQuote());
    
    // 30초마다 인용구 변경
    const quoteInterval = setInterval(() => {
      setQuote(getRandomQuote());
    }, 30000);
    
    return () => clearInterval(quoteInterval);
  }, []);
  
  const handleGetStarted = () => {
    setLocation('/');
  };
  
  const handleLoginClick = () => {
    setLocation('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 z-0 opacity-70"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5)'
        }}
      />
      
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80 z-0"></div>
      
      {/* 콘텐츠 */}
      <div className="flex flex-col justify-between z-10 min-h-screen p-8 md:p-12">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              자기관리 습관 형성 <span className="text-orange-500">56일 챌린지</span>
            </h1>
            
            {/* 인용구 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl mb-8">
              <p className="text-xl md:text-2xl text-white font-light italic leading-relaxed">
                "{quote}"
              </p>
            </div>
            
            <p className="text-gray-300 mb-8 text-lg">
              8명의 친구들과 함께 56일(8주) 동안 습관을 기르고 서로 동기부여를 주고받으세요.
            </p>
          </div>
          
          <div className="w-full max-w-md space-y-4">
            <button 
              onClick={handleGetStarted}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-orange-500/20"
            >
              시작하기
            </button>
            
            <button 
              onClick={handleLoginClick}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-medium py-4 px-6 rounded-xl text-lg transition-all"
            >
              로그인
            </button>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            © 2025 주식회사 자장격지 | 모든 권리 보유
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;