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
    staleTime: 300000, // 5분
    retry: false
  });

  // 로그인 중인지 확인 (안전한 기본값 설정)
  const authData = data || { isAuthenticated: false, user: undefined };
  const isAuthenticated = Boolean(authData.isAuthenticated);
  const user = authData.user as AuthUser | undefined;

  // 로그인 Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest<{ message: string; user: AuthUser }>('POST', '/api/auth/login', credentials);
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
    const result = await loginMutation.mutateAsync({ username, password });
    
    // 로그인이 성공했으면 로컬 스토리지에 사용자 정보 임시 저장
    if (result && result.user) {
      localStorage.setItem('userAuth', JSON.stringify({
        isLoggedIn: true,
        user: result.user
      }));
    }
    
    // 로그인 성공 후 강제 페이지 새로고침
    window.location.href = '/';
    return result;
  };

  // 로그아웃 함수
  const logout = async () => {
    const result = await logoutMutation.mutateAsync();
    // 로그아웃 시 로컬 스토리지 정보 제거
    localStorage.removeItem('userAuth');
    // 로그아웃 성공 후 강제 페이지 새로고침
    window.location.href = '/login';
    return result;
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    if (!isLoading) {
      setIsAuthReady(true);
    }
  }, [isLoading]);

  return {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error || logoutMutation.error,
    isAuthReady,
  };
}