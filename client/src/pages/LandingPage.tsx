import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// 인트로 슬라이드 데이터
const introSlides = [
  {
    title: "자기관리 습관 형성 56일 챌린지",
    description: "56일(8주) 동안의 습관 형성을 통해 성공의 기반을 다집니다",
    image: "bg-amber-100",
    icon: "🌱"
  },
  {
    title: "친구들과 함께하는 동기부여",
    description: "8명의 친구들과 함께 성장하고 서로에게 동기를 부여하세요",
    image: "bg-blue-100",
    icon: "👥"
  },
  {
    title: "AI 기반 습관 분석",
    description: "Mori AI 비서가 당신의 습관을 분석하고 맞춤형 조언을 제공합니다",
    image: "bg-purple-100",
    icon: "🤖"
  }
];

// 기존 코드는 동기부여 문장으로 유지
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
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // 자동 슬라이드 기능
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev < 2 ? prev + 1 : 0));
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentSlide]);

  // 랜덤 명언 가져오기
  const [quote] = useState(() => {
    const quoteIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[quoteIndex];
  });

  const handleLoginClick = () => {
    setLocation('/login');
  };

  const handleDirectStartClick = () => {
    setLocation('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* 슬라이드 부분 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          {introSlides.map((slide, index) => (
            <div 
              key={index}
              className={`transition-opacity duration-500 absolute inset-0 p-8 flex flex-col items-center justify-center
                ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className={`mb-8 w-24 h-24 rounded-full ${slide.image} flex items-center justify-center text-4xl`}>
                {slide.icon}
              </div>
              
              <h1 className="text-3xl font-bold text-center mb-4">
                {slide.title}
              </h1>
              
              <p className="text-gray-700 text-center mb-6">
                {slide.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* 슬라이드 인디케이터 */}
        <div className="flex space-x-2 mt-auto">
          {introSlides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors
                ${currentSlide === index ? 'bg-amber-600' : 'bg-amber-200'}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
      
      {/* 버튼 영역 */}
      <div className="p-6 bg-white rounded-t-3xl shadow-lg">
        <div className="max-w-md mx-auto space-y-3">
          <button 
            onClick={handleDirectStartClick}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl text-lg"
          >
            시작하기
          </button>
          
          <button 
            onClick={handleLoginClick}
            className="w-full border border-amber-300 text-amber-600 hover:bg-amber-50 font-bold py-3 px-4 rounded-xl text-lg"
          >
            로그인
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            © 2025 주식회사 자장격지 | 모든 권리 보유
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;