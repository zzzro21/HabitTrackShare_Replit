import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HabitProvider } from "@/lib/HabitContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FriendsPage from "@/pages/FriendsPage";
import RankingPage from "@/pages/RankingPage";
import SettingsPage from "@/pages/SettingsPage";
import NotePage from "@/pages/NotePage";
import InsightsPage from "@/pages/InsightsPage";
import LoginPage from "@/pages/LoginPage";

// 인증이 필요한 라우트를 보호하는 컴포넌트
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // 로컬 스토리지에서 인증 정보 확인
  const localAuth = localStorage.getItem('userAuth');
  const isLocallyAuthenticated = localAuth ? JSON.parse(localAuth).isLoggedIn : false;

  // 로딩 중일 때는 아무것도 표시하지 않음
  if (isLoading && !isLocallyAuthenticated) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  // 세션 인증이나 로컬 스토리지 인증 중 하나라도 성공한 경우
  if (isAuthenticated || isLocallyAuthenticated) {
    return <Component />;
  }
  
  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  return <Redirect to="/login" />;
}

function Router() {
  return (
    <Switch>
      {/* 공개 라우트 */}
      <Route path="/login" component={LoginPage} />
      
      {/* 보호된 라우트 */}
      <Route path="/">
        {() => <ProtectedRoute component={Home} />}
      </Route>
      <Route path="/friends">
        {() => <ProtectedRoute component={FriendsPage} />}
      </Route>
      <Route path="/ranking">
        {() => <ProtectedRoute component={RankingPage} />}
      </Route>
      <Route path="/insights">
        {() => <ProtectedRoute component={InsightsPage} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>
      <Route path="/notes">
        {() => <ProtectedRoute component={NotePage} />}
      </Route>
      
      {/* 404 페이지 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// 네비게이션 바 컴포넌트 - 로그인 상태에 따라 로그아웃 버튼 표시
function NavBar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // 로컬 스토리지에서 인증 정보 확인 (매 렌더링마다 새로 가져옴)
  const localAuth = localStorage.getItem('userAuth');
  const localUser = localAuth ? JSON.parse(localAuth).user : null;
  const isLocallyAuthenticated = !!localUser;
  
  // 실제 표시할 사용자 정보 (세션 또는 로컬 스토리지)
  const displayUser = user || localUser;
  
  // 배포 환경에서 로컬 스토리지 인증 정보가 있으면 사용
  useEffect(() => {
    // 서버 세션 인증이 없지만 로컬 스토리지에 인증 정보가 있으면 유지
    if (!isAuthenticated && isLocallyAuthenticated && localUser) {
      console.log("로컬 인증 정보 사용:", localUser.username);
    }
  }, [isAuthenticated, isLocallyAuthenticated, localUser]);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 세션 로그아웃에 실패해도 로컬 스토리지는 정리
      localStorage.removeItem('userAuth');
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  if (!isAuthenticated && !isLocallyAuthenticated) {
    return null;
  }
  
  return (
    <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold">습관 트래커</span>
      </div>
      <div className="flex items-center gap-4">
        {displayUser && (
          <div className="flex items-center gap-2">
            <span className="text-sm">{displayUser.name} 님</span>
            <span className="text-2xl">{displayUser.avatar}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50"
        >
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <NavBar />
        <HabitProvider>
          <Router />
        </HabitProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
