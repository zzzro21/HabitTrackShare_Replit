import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HabitProvider } from "@/lib/HabitContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FriendsPage from "@/pages/FriendsPage";
import RankingPage from "@/pages/RankingPage";
import SettingsPage from "@/pages/SettingsPage";
import NotePage from "@/pages/NotePage";
import InsightsPage from "@/pages/InsightsPage";
import MorningPage from "@/pages/MorningPage";
import LoginPage from "@/pages/LoginPage";
import JourneyVisualization from "@/pages/JourneyVisualization";

// 인증 상태 확인을 위한 Hook
function useAuth() {
  // 로컬 스토리지 기반의 인증 상태 확인 (개발 및 테스트용)
  const isDevLoginEnabled = true; // 개발 모드에서만 활성화
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => apiRequest('/api/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false, // 창 포커스 시 다시 요청하지 않음
    refetchInterval: false, // 주기적으로 다시 요청하지 않음
  });
  
  // 개발 모드에서는 로컬 스토리지의 로그인 상태를 우선 사용
  const isLocalStorageAuthenticated = isDevLoginEnabled && localStorage.getItem('isLoggedIn') === 'true';
  
  return {
    user: user?.success ? user.user : (isLocalStorageAuthenticated ? { username: localStorage.getItem('username') || 'user' } : null),
    isLoading: isLocalStorageAuthenticated ? false : isLoading,
    isAuthenticated: isLocalStorageAuthenticated || user?.success === true,
    error: isLocalStorageAuthenticated ? null : error
  };
}

// 인증이 필요한 라우트를 위한 컴포넌트
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; path?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // 아직 로딩 중이면 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-700 dark:text-gray-300">로딩 중...</p>
        </div>
      </div>
    );
  }
  
  // 인증되지 않았으면 로그인 페이지로 강제 이동
  if (!isAuthenticated) {
    // 즉시 해당 위치로 이동
    window.location.replace('/login');
    
    // 리다이렉트 중 표시할 UI
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-700 dark:text-gray-300">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }
  
  // 인증되었으면 요청된 컴포넌트 렌더링
  return <Component {...rest} />;
}

// APP 라우터 구성
function Router() {
  // 개발 모드 로그인 상태 확인
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [, setLocation] = useLocation();
  
  // 현재 주소가 / 또는 /login이 아니고, 로그인되지 않은 상태면 로그인 페이지로 이동
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== '/' && path !== '/login' && !isLoggedIn) {
      setLocation('/login');
    }
  }, [isLoggedIn, setLocation]);
  
  return (
    <Switch>
      {/* 공개 라우트 */}
      <Route path="/login">{() => <LoginPage />}</Route>
      <Route path="/">{() => <LoginPage />}</Route>
      
      {/* 보호된 라우트 - 로컬 스토리지 기반 인증 */}
      <Route path="/home">{() => isLoggedIn ? <Home /> : <LoginPage />}</Route>
      <Route path="/morning">{() => isLoggedIn ? <MorningPage /> : <LoginPage />}</Route>
      <Route path="/friends">{() => isLoggedIn ? <FriendsPage /> : <LoginPage />}</Route>
      <Route path="/ranking">{() => isLoggedIn ? <RankingPage /> : <LoginPage />}</Route>
      <Route path="/insights">{() => isLoggedIn ? <InsightsPage /> : <LoginPage />}</Route>
      <Route path="/journey">{() => isLoggedIn ? <JourneyVisualization /> : <LoginPage />}</Route>
      <Route path="/settings">{() => isLoggedIn ? <SettingsPage /> : <LoginPage />}</Route>
      <Route path="/notes">{() => isLoggedIn ? <NotePage /> : <LoginPage />}</Route>
      
      {/* 404 페이지 */}
      <Route>{() => <NotFound />}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <HabitProvider>
            <Router />
          </HabitProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
