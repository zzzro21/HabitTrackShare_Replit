import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 사용자 정보 인터페이스
export type AuthUser = {
  id: number;
  name: string;
  username: string;
  avatar: string;
};

// 인증 상태 인터페이스
interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  apiKey: string;
  notionToken: string;
  isLoading: boolean;
  
  // 로그인 함수
  login: (user: AuthUser, apiKey?: string, notionToken?: string) => void;
  // 로그아웃 함수
  logout: () => void;
  // API 키와 노션 토큰 설정 함수
  setApiKeys: (apiKey: string, notionToken: string) => void;
}

// 인증 저장소 생성 (Zustand + LocalStorage)
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      apiKey: '',
      notionToken: '',
      isLoading: false,
      
      login: (user: AuthUser, apiKey = '', notionToken = '') => {
        set({
          isAuthenticated: true,
          user,
          apiKey,
          notionToken,
          isLoading: false
        });
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          apiKey: '',
          notionToken: '',
          isLoading: false
        });
      },
      
      setApiKeys: (apiKey: string, notionToken: string) => {
        set((state) => ({
          apiKey,
          notionToken
        }));
      }
    }),
    {
      name: 'user-auth-storage'
    }
  )
);