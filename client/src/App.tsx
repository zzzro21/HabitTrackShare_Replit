import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
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
import IntroPage from "@/pages/IntroPage";
import ProfilePage from "@/pages/ProfilePage";
import { useAuth } from "@/hooks/useAuth";

// 인증이 필요한 라우트를 위한 컴포넌트
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; path?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation(); // useLocation 훅 사용

  useEffect(() => {
    // 로딩이 완료되고 인증되지 않은 경우에만 리다이렉트
    if (!isLoading && !isAuthenticated) {
      console.log("인증되지 않음, 로그인 페이지로 이동");
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);
  
  // 아직 로딩 중이면 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-700 dark:text-gray-300">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }
  
  // 인증되지 않았으면 로딩 화면 표시 (리다이렉트는 useEffect에서 처리)
  if (!isAuthenticated) {
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
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // 이미 인증된 상태에서 로그인 페이지에 접근 시 홈으로 리다이렉트
  useEffect(() => {
    const path = window.location.pathname;
    if (isAuthenticated && (path === '/login' || path === '/')) {
      console.log("이미 인증됨, 홈 페이지로 이동");
      setLocation('/home');
    }
  }, [isAuthenticated, setLocation]);
  
  // 처음 로딩시 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-700 dark:text-gray-300">앱 로딩 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/login">
        {/* 이미 인증된 상태면 useEffect에서 처리 */}
        <LoginPage />
      </Route>
      <Route path="/home">{() => <ProtectedRoute component={Home} />}</Route>
      <Route path="/">{() => <IntroPage />}</Route>
      <Route path="/morning">{() => <ProtectedRoute component={MorningPage} />}</Route>
      <Route path="/friends">{() => <ProtectedRoute component={FriendsPage} />}</Route>
      <Route path="/ranking">{() => <ProtectedRoute component={RankingPage} />}</Route>
      <Route path="/insights">{() => <ProtectedRoute component={InsightsPage} />}</Route>
      <Route path="/journey">{() => <ProtectedRoute component={JourneyVisualization} />}</Route>
      <Route path="/settings">{() => <ProtectedRoute component={SettingsPage} />}</Route>
      <Route path="/notes">{() => <ProtectedRoute component={NotePage} />}</Route>
      <Route path="/profile">{() => <ProtectedRoute component={ProfilePage} />}</Route>
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
