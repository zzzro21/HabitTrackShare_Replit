import { useState, useEffect } from 'react';

interface AuthUser {
  id: number;
  username: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
}

export function useSimpleAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    error: null,
    isLoading: true
  });

  // 초기화 시 로컬 스토리지에서 인증 정보 확인
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
      const username = localStorage.getItem('username') || '';
      const userId = parseInt(localStorage.getItem('userId') || '0');
      
      setAuthState({
        isAuthenticated: true,
        user: {
          id: userId,
          username: username,
          name: username === 'admin' ? '관리자' : username,
          avatar: '👤'
        },
        error: null,
        isLoading: false
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // 로그인 함수
  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 간소화된 인증 (개발용)
      if (password === 'password123') {
        // 기본 사용자 처리
        const isAdmin = username === 'admin';
        const isUser = username.startsWith('user');
        
        if (isAdmin || isUser) {
          const userId = isAdmin ? 1 : 
                       (parseInt(username.replace('user', '')) || 2);
          
          // 로컬 스토리지에 인증 정보 저장
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('userId', userId.toString());
          localStorage.setItem('loginTime', new Date().toISOString());
          
          // 상태 업데이트
          setAuthState({
            isAuthenticated: true,
            user: {
              id: userId,
              username: username,
              name: isAdmin ? '관리자' : username,
              avatar: '👤'
            },
            error: null,
            isLoading: false
          });
          
          return true;
        }
      }
      
      // 로그인 실패 처리
      setAuthState({
        isAuthenticated: false,
        user: null,
        error: '아이디 또는 비밀번호가 올바르지 않습니다.',
        isLoading: false
      });
      
      return false;
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        error: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
        isLoading: false
      });
      
      return false;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    // 로컬 스토리지에서 인증 정보 제거
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('loginTime');
    
    // 상태 업데이트
    setAuthState({
      isAuthenticated: false,
      user: null,
      error: null,
      isLoading: false
    });
  };

  return {
    ...authState,
    login,
    logout
  };
}