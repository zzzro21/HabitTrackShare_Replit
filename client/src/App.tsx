import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HabitProvider } from "@/lib/HabitContext";
import { useAuth } from "./hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FriendsPage from "@/pages/FriendsPage";
import RankingPage from "@/pages/RankingPage";
import SettingsPage from "@/pages/SettingsPage";
import NotePage from "@/pages/NotePage";
import InsightsPage from "@/pages/InsightsPage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import TabNavigation from "@/components/TabNavigation";

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
function PrivateRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  // 인증 확인 중이면 로딩 표시
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  // 인증되지 않았으면 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // 인증되었으면 요청한 컴포넌트 렌더링
  return <Component {...rest} />;
}

// 라우터 컴포넌트
function Router() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Switch>
      {/* 인트로 화면 (메인 랜딩 페이지) */}
      <Route path="/welcome" component={LandingPage} />
      
      {/* 로그인 페이지 */}
      <Route path="/login" component={LoginPage} />
      
      {/* 메인 대시보드 페이지 (인증 필요) */}
      <Route path="/" component={Dashboard} />
      
      {/* 인증이 필요한 습관 트래커 페이지들 */}
      <Route path="/checklist">
        <PrivateRoute component={Home} />
      </Route>
      <Route path="/friends">
        <PrivateRoute component={FriendsPage} />
      </Route>
      <Route path="/ranking">
        <PrivateRoute component={RankingPage} />
      </Route>
      <Route path="/insights">
        <PrivateRoute component={InsightsPage} />
      </Route>
      <Route path="/settings">
        <PrivateRoute component={SettingsPage} />
      </Route>
      <Route path="/notes">
        <PrivateRoute component={NotePage} />
      </Route>
      
      {/* 404 페이지 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// 네비게이션 바 컴포넌트 - 로그인 사용자 표시
function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // 로그아웃 처리
  const handleLogout = () => {
    // Zustand 스토어에서 로그아웃
    logout();
    
    // 로그인 페이지로 리디렉션
    setLocation('/login');
  };
  
  // 사용자 정보 없으면 빈 화면 또는 로그인 버튼 표시
  if (!isAuthenticated || !user) {
    return (
      <div className="bg-blue-600 text-white p-2 flex justify-between items-center max-w-[390px] mx-auto">
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold">Habit Tracker</span>
        </div>
        <div>
          <button
            onClick={() => setLocation('/login')}
            className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 text-sm"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-blue-600 text-white p-2 flex justify-between items-center max-w-[390px] mx-auto">
      <div className="flex items-center gap-1">
        <span className="text-lg font-semibold">Habit Tracker</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">{user.name} 님</span>
          <span className="text-2xl">{user.avatar}</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 text-sm"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

function App() {
  const [location, setLocation] = useLocation();
  const isLandingPage = location === '/' || location === '/landing';
  const isLoginPage = location === '/login';
  const isWelcomePage = location === '/welcome';
  
  // 어플리케이션 초기화 시 로그인 페이지로 리디렉션
  useEffect(() => {
    if (location === '/') {
      setLocation('/login');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* 랜딩 페이지, 웰컴 페이지, 로그인 페이지에서는 네비게이션 바를 표시하지 않음 */}
        {!isLandingPage && !isLoginPage && !isWelcomePage && <NavBar />}
        <HabitProvider>
          <Router />
          {/* 랜딩 페이지, 웰컴 페이지, 로그인 페이지에서는 탭 네비게이션을 표시하지 않음 */}
          {!isLandingPage && !isLoginPage && !isWelcomePage && <TabNavigation />}
        </HabitProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
