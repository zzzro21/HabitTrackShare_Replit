import React from 'react';
import { useLocation } from 'wouter';

const TabNavigation: React.FC = () => {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-1 px-0 max-w-[420px] mx-auto lg:max-w-[800px]">
      <div className="flex justify-start items-center pl-5 pr-1 gap-0">
        <a 
          href="/" 
          className={`flex flex-col items-center justify-center w-[7%] ${location === '/' ? 'text-primary' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span className="text-[7px] mt-0.5 truncate text-center">홈</span>
        </a>
        
        <a 
          href="/friends" 
          className={`flex flex-col items-center justify-center w-[7%] ${location === '/friends' ? 'text-primary' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className="text-[7px] mt-0.5 truncate text-center">친구들</span>
        </a>
        
        <a 
          href="/ranking" 
          className={`flex flex-col items-center justify-center w-[7%] ${location === '/ranking' ? 'text-primary' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span className="text-[7px] mt-0.5 truncate text-center">순위</span>
        </a>
        
        <a 
          href="/insights" 
          className={`flex flex-col items-center justify-center w-[7%] ${location === '/insights' ? 'text-primary' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span className="text-[7px] mt-0.5 truncate text-center">인사이트</span>
        </a>
        
        <a 
          href="/notes" 
          className={`flex flex-col items-center justify-center w-[7%] ${location === '/notes' ? 'text-primary' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span className="text-[7px] mt-0.5 truncate text-center">일지</span>
        </a>
        
        <a 
          href="/settings" 
          className={`flex flex-col items-center justify-center w-[7%] ${location === '/settings' ? 'text-primary' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21v-13a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v13" />
            <path d="M12 7v4" />
            <path d="M8 3v4" />
            <path d="M16 3v4" />
          </svg>
          <span className="text-[7px] mt-0.5 truncate text-center">설정</span>
        </a>
      </div>
    </nav>
  );
};

export default TabNavigation;
