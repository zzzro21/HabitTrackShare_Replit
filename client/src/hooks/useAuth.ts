import { useState, useEffect } from 'react';
import { getCurrentUser } from '../noauth';

export type AuthUser = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  hasChangedUsername?: boolean;
};

// 간소화된 useAuth 훅 - 로그인 기능 없이 로컬 스토리지에서만 사용자 정보를 가져옴
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // noauth 모듈에서 기본 사용자 정보 가져오기
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
    console.log('사용자 정보 로드:', currentUser.name);
  }, []);

  return {
    user,
    isAuthenticated: true, // 항상 인증됨
    isLoading,
    isAuthReady: !isLoading
  };
}