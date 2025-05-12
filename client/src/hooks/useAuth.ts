import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type AuthUser = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  hasChangedUsername?: boolean;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [isAuthReady, setIsAuthReady] = useState(false);

  // 현재 로그인 상태 확인
  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ['/api/auth/status'],
    staleTime: 0, // 항상 최신 값 가져오기
    retry: false,
    refetchOnWindowFocus: true // 윈도우 포커스 시 다시 가져오기
  });

  // 로그인 중인지 확인 (안전한 기본값 설정)
  const authData = data || { isAuthenticated: false, user: undefined };
  
  // 로컬 스토리지 및 세션 스토리지 인증 정보 확인
  const localAuthStr = localStorage.getItem('userAuth');
  const sessionAuthStr = sessionStorage.getItem('userAuth');
  
  // 둘 중 하나라도 있으면 사용
  const authStr = localAuthStr || sessionAuthStr;
  const localAuth = authStr ? JSON.parse(authStr) : null;
  const isLocallyAuthenticated = localAuth?.isLoggedIn || false;
  const localUser = localAuth?.user;
  const isAuthenticated = Boolean(authData.isAuthenticated);
  const user = authData.user as AuthUser | undefined;

  // 로그인 Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest<{ message: string; user: AuthUser }>('POST', '/api/auth/login', credentials);
      // 로그인 성공 시 로컬 스토리지와 세션 스토리지에 인증 정보 저장
      if (response && response.user) {
        const authData = {
          isLoggedIn: true,
          user: response.user
        };
        
        // 로컬 스토리지와 세션 스토리지 모두 사용 (이중 안전장치)
        localStorage.setItem('userAuth', JSON.stringify(authData));
        sessionStorage.setItem('userAuth', JSON.stringify(authData));
        
        console.log("로그인 성공: 로컬 및 세션 스토리지에 저장됨", response.user.username);
      }
      return response;
    },
    onSuccess: () => {
      // 로그인 성공 시 인증 상태 및 사용자 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    }
  });

  // 로그아웃 Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest<{ message: string }>('POST', '/api/auth/logout');
      return response;
    },
    onSuccess: () => {
      // 로그아웃 성공 시 인증 상태 및 사용자 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.clear(); // 모든 쿼리 캐시 초기화
    }
  });

  // 로그인 함수
  const login = async (username: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ username, password });
      return result;
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      // 서버 로그아웃 요청
      const result = await logoutMutation.mutateAsync();
      
      // 모든 클라이언트 저장소에서 로그인 정보 제거
      localStorage.removeItem('userAuth');
      sessionStorage.removeItem('userAuth');
      
      console.log("로그아웃 완료: 모든 저장소 정리됨");
      
      // 로그아웃 성공 후 강제 페이지 새로고침 (지연 적용)
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
      
      return result;
    } catch (error) {
      console.error("로그아웃 오류:", error);
      
      // 오류 발생시에도 모든 저장소 정리
      localStorage.removeItem('userAuth');
      sessionStorage.removeItem('userAuth');
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
      
      throw error;
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    if (!isLoading) {
      setIsAuthReady(true);
    }
  }, [isLoading]);

  // 실제 인증 상태는 서버 세션과 로컬 스토리지 둘 중 하나라도 인증된 상태이면 인증됨
  const effectiveIsAuthenticated = isAuthenticated || isLocallyAuthenticated;
  const effectiveUser = user || localUser;
  
  return {
    isAuthenticated: effectiveIsAuthenticated,
    user: effectiveUser,
    login,
    logout,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error || logoutMutation.error,
    isAuthReady,
  };
}