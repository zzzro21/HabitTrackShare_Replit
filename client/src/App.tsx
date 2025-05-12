import { useState } from "react";
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

  // 로딩 중일 때는 아무것도 표시하지 않음
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // 인증된 경우 컴포넌트 렌더링
  return <Component />;
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
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold">습관 트래커</span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm">{user.name} 님</span>
            <span className="text-2xl">{user.avatar}</span>
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
