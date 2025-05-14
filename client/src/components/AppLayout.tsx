import React, { ReactNode } from 'react';
import TabNavigation from './TabNavigation';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  hideHeader?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  onBackClick,
  hideHeader = false
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
    <div className="container mx-auto bg-white min-h-screen shadow-lg overflow-hidden max-w-[390px] lg:max-w-[800px] flex flex-col">
      {!hideHeader && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 h-[28px] flex items-center pt-0">
          <div className="w-full relative -mt-3">
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
            <h1 className="text-sm font-bold text-center -mt-1">{title}</h1>
            {subtitle && (
              <p className="text-[10px] text-center text-gray-500 -mt-1">{subtitle}</p>
            )}
          </div>
        </header>
      )}
      
      <main className={`flex-1 px-3 overflow-y-auto ${hideHeader ? 'pt-1' : 'pt-1 pb-2'}`} 
        style={{ height: hideHeader ? 'calc(100vh - 60px)' : 'calc(100vh - 106px)' }}>
        {children}
      </main>
      
      <TabNavigation />
    </div>
  );
};

export default AppLayout;