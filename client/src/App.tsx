import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HabitProvider } from "@/lib/HabitContext";
import { setupNoAuth } from "./noauth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FriendsPage from "@/pages/FriendsPage";
import RankingPage from "@/pages/RankingPage";
import SettingsPage from "@/pages/SettingsPage";
import NotePage from "@/pages/NotePage";
import InsightsPage from "@/pages/InsightsPage";
import LandingPage from "@/pages/LandingPage";

// 라우터 컴포넌트 - 모든 페이지는 즉시 접근 가능
function Router() {
  return (
    <Switch>
      {/* 메인 경로에 랜딩 페이지 표시 */}
      <Route path="/" component={LandingPage} />
      
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

// 네비게이션 바 컴포넌트 - 단순화된 버전
function NavBar() {
  const defaultUser = setupNoAuth();
  
  return (
    <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold">습관 트래커</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">{defaultUser.name} 님</span>
          <span className="text-2xl">{defaultUser.avatar}</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [location] = useLocation();
  const isLandingPage = location === '/';
  
  // 앱 시작 시 기본 사용자 설정
  useEffect(() => {
    setupNoAuth();
  }, []);

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
