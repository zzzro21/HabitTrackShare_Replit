import React, { ReactNode } from 'react';
import TabNavigation from './TabNavigation';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  onBackClick
}) => {
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      // 기본적으로 메인 페이지(홈)로 이동
      window.location.href = '/';
    }
  };

  return (
    <div className="container mx-auto bg-white min-h-screen shadow-lg overflow-hidden">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="pb-1 pt-2 relative">
          {showBackButton && (
            <button 
              onClick={handleBackClick} 
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="sr-only">뒤로 가기</span>
            </button>
          )}
          <h1 className="text-base font-bold text-center">{title}</h1>
          {subtitle && (
            <p className="text-xs text-center text-gray-500 -mt-0.5">{subtitle}</p>
          )}
        </div>
      </header>
      
      <main className="px-3 py-2 overflow-y-auto pb-16">
        {children}
        <div className="h-16"></div> {/* 하단 여백 (탭 네비게이션 공간) */}
      </main>
      
      <TabNavigation />
    </div>
  );
};

export default AppLayout;