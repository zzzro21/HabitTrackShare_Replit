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
  // 클라이언트 측 인증 확인 로직
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 인증 정보 확인
    const checkAuth = () => {
      const authStr = localStorage.getItem('userAuth');
      const auth = authStr ? JSON.parse(authStr) : null;
      setIsAuthenticated(Boolean(auth?.isLoggedIn));
      setIsChecking(false);
    };
    
    checkAuth();
  }, []);

  // 인증 확인 중이면 로딩 표시
  if (isChecking) {
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
  return (
    <Switch>
      {/* 랜딩 페이지 (인트로 화면) */}
      <Route path="/landing" component={LandingPage} />
      
      {/* 로그인 페이지 */}
      <Route path="/login" component={LoginPage} />
      
      {/* 인증이 필요한 메인 대시보드 페이지 */}
      <Route path="/">
        <PrivateRoute component={Dashboard} />
      </Route>
      
      {/* 인증이 필요한 습관 트래커 페이지들 */}
      <Route path="/home">
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
      
      {/* 메인 경로에서 인증되지 않았을 경우 랜딩 페이지로 이동 */}
      <Route path="/welcome" component={LandingPage} />
      
      {/* 404 페이지 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// 네비게이션 바 컴포넌트 - 로그인 사용자 표시
function NavBar() {
  // 로컬 스토리지에서 사용자 정보 가져오기 
  const [user, setUser] = useState<{ id: number; name: string; username: string; avatar: string } | null>(null);
  const [, setLocation] = useLocation();
  
  // 로그인 정보 불러오기
  useEffect(() => {
    const checkUserAuth = () => {
      const authStr = localStorage.getItem('userAuth');
      if (authStr) {
        try {
          const auth = JSON.parse(authStr);
          if (auth?.isLoggedIn && auth?.user) {
            setUser(auth.user);
          } else {
            // 인증 정보가 없으면 null 설정
            setUser(null);
          }
        } catch (error) {
          console.error('인증 정보 파싱 오류:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    
    // 초기 로드 시 확인
    checkUserAuth();
    
    // 로컬 스토리지 변경 감지 (다른 탭에서 로그인/로그아웃 시)
    const handleStorageChange = () => {
      checkUserAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 로그아웃 처리
  const handleLogout = () => {
    // 로컬 스토리지에서 인증 정보 제거
    localStorage.removeItem('userAuth');
    sessionStorage.removeItem('userAuth');
    
    // 사용자 상태 초기화
    setUser(null);
    
    // 서버에 로그아웃 요청 (실패해도 계속 진행)
    fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    }).catch(err => {
      console.error('로그아웃 요청 실패:', err);
    }).finally(() => {
      // 로그인 페이지로 리디렉션
      setLocation('/login');
    });
  };
  
  // 사용자 정보 없으면 빈 화면 또는 로그인 버튼 표시
  if (!user) {
    return (
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center max-w-[420px] mx-auto lg:max-w-[800px]">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold">습관 트래커</span>
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
  const [location] = useLocation();
  const isLandingPage = location === '/' || location === '/landing';
  const isLoginPage = location === '/login';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* 랜딩 페이지와 로그인 페이지에서는 네비게이션 바를 표시하지 않음 */}
        {!isLandingPage && !isLoginPage && <NavBar />}
        <HabitProvider>
          <Router />
          {/* 랜딩 페이지와 로그인 페이지에서는 탭 네비게이션을 표시하지 않음 */}
          {!isLandingPage && !isLoginPage && <TabNavigation />}
        </HabitProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
