import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
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
import JourneyVisualization from "@/pages/JourneyVisualization";
import SuperSimpleLoginPage from "@/pages/SuperSimpleLoginPage";
import SimpleModeNavbar from "@/components/SimpleModeNavbar";

// 인증이 필요한 라우트를 위한 컴포넌트
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; path?: string }) {
  const [, setLocation] = useLocation();
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  
  // 인증되지 않았으면 로그인 페이지로 이동
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);
  
  // 인증 확인 중이거나 인증되지 않았으면 로딩 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-700 dark:text-gray-300">로그인이 필요합니다...</p>
        </div>
      </div>
    );
  }
  
  // 인증되었으면 요청된 컴포넌트 렌더링 (네비게이션 바와 함께)
  return (
    <div>
      <SimpleModeNavbar />
      <Component {...rest} />
    </div>
  );
}

// APP 라우터 구성
function Router() {
  return (
    <Switch>
      {/* 공개 라우트 */}
      <Route path="/login">{() => <SuperSimpleLoginPage />}</Route>
      <Route path="/">{() => <SuperSimpleLoginPage />}</Route>
      
      {/* 보호된 라우트 - 로컬 스토리지 기반 인증 */}
      <Route path="/home">{() => <ProtectedRoute component={Home} />}</Route>
      <Route path="/morning">{() => <ProtectedRoute component={MorningPage} />}</Route>
      <Route path="/friends">{() => <ProtectedRoute component={FriendsPage} />}</Route>
      <Route path="/ranking">{() => <ProtectedRoute component={RankingPage} />}</Route>
      <Route path="/insights">{() => <ProtectedRoute component={InsightsPage} />}</Route>
      <Route path="/journey">{() => <ProtectedRoute component={JourneyVisualization} />}</Route>
      <Route path="/settings">{() => <ProtectedRoute component={SettingsPage} />}</Route>
      <Route path="/notes">{() => <ProtectedRoute component={NotePage} />}</Route>
      
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
