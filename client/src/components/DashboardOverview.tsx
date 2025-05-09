import React, { useState, useEffect } from 'react';
import { useHabit } from '@/lib/HabitContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { ChevronRight, Award, TrendingUp, Lightbulb } from 'lucide-react';

interface HabitInsightPreview {
  id: number;
  userId: number;
  summary: string;
  date: string;
}

const DashboardOverview: React.FC = () => {
  const { activeUser, users, habits, habitEntries, calculateCompletionRate, calculateGrandTotal, calculateUserRank } = useHabit();
  const [todayStats, setTodayStats] = useState({ completed: 0, inProgress: 0, notStarted: 0 });
  const [insightPreview, setInsightPreview] = useState<HabitInsightPreview | null>(null);
  const [loading, setLoading] = useState(false);
  
  const today = new Date();
  // Normalize date to day 0-55 (8 weeks) for the habit tracking system
  const currentDay = Math.min(55, Math.floor((today.getTime() - new Date(2025, 4, 1).getTime()) / (1000 * 60 * 60 * 24)));
  
  const activeUserData = users.find(user => user.id === activeUser);
  
  // Get today's stats
  useEffect(() => {
    if (!activeUser) return;
    
    const todayEntries = habitEntries.filter(entry => entry.userId === activeUser && entry.day === currentDay);
    
    const completed = todayEntries.filter(entry => entry.value > 0).length;
    const notStarted = habits.length - todayEntries.length;
    const inProgress = todayEntries.filter(entry => entry.value === 0).length;
    
    setTodayStats({
      completed,
      inProgress,
      notStarted
    });
  }, [activeUser, habitEntries, habits, currentDay]);
  
  // Fetch insight preview
  useEffect(() => {
    const fetchInsightPreview = async () => {
      if (!activeUser) return;
      
      try {
        setLoading(true);
        
        // Try to get the existing insight without generating a new one
        const data = await apiRequest<HabitInsightPreview>(`/api/users/${activeUser}/insights`);
        setInsightPreview(data);
      } catch (error) {
        console.error('Error fetching insight preview:', error);
        setInsightPreview(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsightPreview();
  }, [activeUser]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{activeUserData?.name || '사용자'}님 안녕하세요!</h2>
          <p className="text-gray-500 text-sm">오늘도 좋은 습관을 만들어 보세요.</p>
        </div>
        <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1">
          <div className="bg-white rounded-full p-0.5">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-[2px] h-10 w-10 flex items-center justify-center text-white font-bold">
              {calculateCompletionRate(activeUser).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium text-gray-500">완료</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold">{todayStats.completed}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium text-gray-500">진행 중</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold">{todayStats.inProgress}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-gray-400">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium text-gray-500">미시작</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold">{todayStats.notStarted}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-500" />
                나의 현황
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">총 점수</p>
                <p className="text-xl font-bold">{calculateGrandTotal(activeUser)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">전체 순위</p>
                <p className="text-xl font-bold">{calculateUserRank(activeUser)} / {users.length}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">진행된 날짜</p>
                <p className="text-xl font-bold">{currentDay + 1} / 56</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">습관 완료율</p>
                <p className="text-xl font-bold">{calculateCompletionRate(activeUser).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/ranking">
              <Button variant="ghost" className="w-full justify-between">
                순위 보기
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                AI 인사이트
              </CardTitle>
            </div>
            {insightPreview && (
              <CardDescription>
                {formatDate(insightPreview.date)} 업데이트됨
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pb-2">
            {insightPreview ? (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="line-clamp-3 text-blue-800">
                  {insightPreview.summary}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-center text-gray-500">아직 인사이트가 없습니다.</p>
                <p className="text-center text-gray-500 text-sm">인사이트 페이지에서 생성해보세요.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/insights">
              <Button variant="ghost" className="w-full justify-between">
                인사이트로 이동
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              오늘의 습관
            </CardTitle>
          </div>
          <CardDescription>
            {currentDay}일차, {new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(today)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-3">
            {habits.length > 0 ? (
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => {
                  // Find the habits tab element and click it
                  const habitsTab = document.querySelector('[value="habits"]') as HTMLElement;
                  if (habitsTab) {
                    habitsTab.click();
                  }
                }}
              >
                오늘의 습관 체크하기
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <p className="text-center text-gray-500">습관이 없습니다.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;