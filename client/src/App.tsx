import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HabitProvider } from "@/lib/HabitContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FriendsPage from "@/pages/FriendsPage";
import RankingPage from "@/pages/RankingPage";
import SettingsPage from "@/pages/SettingsPage";
import NotePage from "@/pages/NotePage";
import InsightsPage from "@/pages/InsightsPage";
import MorningPage from "@/pages/MorningPage";
import LoginPage from "@/pages/LoginPage";

// 인증 상태 확인을 위한 Hook
function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => apiRequest('/api/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
  });
  
  return {
    user: user?.success ? user.user : null,
    isLoading,
    isAuthenticated: user?.success === true,
    error
  };
}

// 인증이 필요한 라우트를 위한 컴포넌트
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; path?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }
  
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }
  
  return <Component {...rest} />;
}

// APP 라우터 구성
function Router() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? (() => { 
          window.location.href = '/';
          return null;
        })() : <LoginPage />}
      </Route>
      <Route path="/" component={(props) => <ProtectedRoute component={Home} {...props} />} />
      <Route path="/morning" component={(props) => <ProtectedRoute component={MorningPage} {...props} />} />
      <Route path="/friends" component={(props) => <ProtectedRoute component={FriendsPage} {...props} />} />
      <Route path="/ranking" component={(props) => <ProtectedRoute component={RankingPage} {...props} />} />
      <Route path="/insights" component={(props) => <ProtectedRoute component={InsightsPage} {...props} />} />
      <Route path="/settings" component={(props) => <ProtectedRoute component={SettingsPage} {...props} />} />
      <Route path="/notes" component={(props) => <ProtectedRoute component={NotePage} {...props} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HabitProvider>
          <Router />
        </HabitProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
