import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HabitProvider } from "@/lib/HabitContext";
import { getCurrentUser } from "./noauth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FriendsPage from "@/pages/FriendsPage";
import RankingPage from "@/pages/RankingPage";
import SettingsPage from "@/pages/SettingsPage";
import NotePage from "@/pages/NotePage";
import InsightsPage from "@/pages/InsightsPage";
import LandingPage from "@/pages/LandingPage";

// 라우터 컴포넌트 - 모든 페이지는 로그인 없이 바로 접근 가능
function Router() {
  return (
    <Switch>
      {/* 메인 경로에 직접 Home 컴포넌트 표시 */}
      <Route path="/" component={Home} />
      
      {/* 랜딩 페이지는 별도 경로로 유지 */}
      <Route path="/landing" component={LandingPage} />
      
      {/* 습관 트래커 페이지들 */}
      <Route path="/home" component={Home} />
      <Route path="/friends" component={FriendsPage} />
      <Route path="/ranking" component={RankingPage} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/notes" component={NotePage} />
      
      {/* 404 페이지 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// 네비게이션 바 컴포넌트 - 로그인 없이 사용
function NavBar() {
  const [user, setUser] = useState<{ id: number; name: string; username: string; avatar: string } | null>(null);
  
  // 사용자 정보 불러오기 - 항상 최신 데이터로 초기화
  useEffect(() => {
    try {
      // 로컬 스토리지 기존 데이터 삭제
      localStorage.removeItem('userAuth');
      
      // 강제로 새 데이터 생성
      import('./noauth').then(({ setupNoAuth }) => {
        const defaultUser = setupNoAuth();
        setUser(defaultUser);
        console.log('사용자 정보 초기화:', defaultUser.name);
      });
    } catch (err) {
      console.error('사용자 정보 초기화 오류:', err);
    }
  }, []);
  
  // 사용자 리셋 기능
  const handleResetUser = () => {
    try {
      // 기본 사용자로 다시 설정
      import('./noauth').then(({ setupNoAuth }) => {
        const defaultUser = setupNoAuth();
        setUser(defaultUser);
        window.location.reload(); // 앱 새로고침
      });
    } catch (error) {
      console.error('사용자 재설정 실패:', error);
    }
  };
  
  // 사용자 정보 없으면 빈 화면
  if (!user) {
    return null;
  }
  
  return (
    <div className="bg-blue-600 text-white p-3 flex justify-between items-center max-w-[420px] mx-auto lg:max-w-[800px]">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold">습관 트래커</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">{user.name} 님</span>
          <span className="text-2xl">{user.avatar}</span>
        </div>
        <button
          onClick={handleResetUser}
          className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 text-sm"
        >
          사용자 변경
        </button>
      </div>
    </div>
  );
}

function App() {
  const [location] = useLocation();
  const isLandingPage = location === '/landing';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* 랜딩 페이지에서는 네비게이션 바를 표시하지 않음 */}
        {!isLandingPage && <NavBar />}
        <HabitProvider>
          <Router />
        </HabitProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
