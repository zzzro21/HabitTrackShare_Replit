import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export default function SuperSimpleLoginPage() {
  const [, setLocation] = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // 이미 로그인되어 있으면 홈으로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      setLocation('/home');
    }
  }, [isLoggedIn, setLocation]);

  const handleOneClickLogin = (role: string) => {
    // 간단한 사용자 정보 저장
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', role);
    localStorage.setItem('userId', role === 'admin' ? '1' : '2');
    localStorage.setItem('loginTime', new Date().toISOString());
    
    // 홈으로 이동
    setLocation('/home');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            원클릭 로그인
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            간단한 클릭으로 로그인하세요!
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleOneClickLogin('admin')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg focus:outline-none"
          >
            관리자로 로그인
          </button>
          
          <button
            onClick={() => handleOneClickLogin('user1')}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg focus:outline-none"
          >
            사용자 1로 로그인
          </button>
          
          <button
            onClick={() => handleOneClickLogin('user2')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg focus:outline-none"
          >
            사용자 2로 로그인
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          클릭 한 번으로 로그인이 완료됩니다.<br/>
          서버 연결 없이 로컬 스토리지만 사용하는 방식입니다.
        </div>
      </div>
    </div>
  );
}