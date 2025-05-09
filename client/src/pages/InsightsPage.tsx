import { useState, useEffect } from 'react';
import { useHabit } from '@/lib/HabitContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { RefreshCw } from 'lucide-react';
import TabNavigation from '@/components/TabNavigation';

interface HabitInsight {
  id: number;
  userId: number;
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  date: string;
}

export default function InsightsPage() {
  const { activeUser } = useHabit();
  const { toast } = useToast();
  const [insights, setInsights] = useState<HabitInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [activeUser]);

  const fetchInsights = async (forceRefresh = false) => {
    if (!activeUser) return;
    
    try {
      setLoading(true);
      const url = forceRefresh 
        ? `/api/users/${activeUser}/insights?force=true` 
        : `/api/users/${activeUser}/insights`;
        
      const data = await apiRequest<HabitInsight>(url);
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: '인사이트 불러오기 실패',
        description: '습관 인사이트를 불러오는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights(true);
    
    toast({
      title: '인사이트 업데이트 중',
      description: '새로운 습관 인사이트를 생성 중입니다. 잠시만 기다려 주세요.',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 pb-20">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
        <TabNavigation />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>AI 습관 인사이트</CardTitle>
            <CardDescription>
              아직 습관 인사이트가 없습니다. 아래 버튼을 클릭하여 생성해 보세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  인사이트 생성 중...
                </>
              ) : (
                '인사이트 생성하기'
              )}
            </Button>
          </CardContent>
        </Card>
        <TabNavigation />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl md:text-2xl">AI 습관 인사이트</CardTitle>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  업데이트 중...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  새로고침
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            마지막 업데이트: {formatDate(insights.date)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-blue-800 text-lg font-medium leading-relaxed">{insights.summary}</p>
          </div>

          <Tabs defaultValue="strengths">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="strengths">강점</TabsTrigger>
              <TabsTrigger value="improvements">개선 영역</TabsTrigger>
              <TabsTrigger value="recommendations">추천 사항</TabsTrigger>
            </TabsList>
            
            <TabsContent value="strengths" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">당신의 강점</h3>
              <ul className="space-y-3">
                {insights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2 mt-1 whitespace-nowrap">강점 {index + 1}</Badge>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="improvements" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">개선 할 영역</h3>
              <ul className="space-y-3">
                {insights.improvementAreas.map((area, index) => (
                  <li key={index} className="flex items-start">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mr-2 mt-1 whitespace-nowrap">영역 {index + 1}</Badge>
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">맞춤 추천 사항</h3>
              <ul className="space-y-3">
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mr-2 mt-1 whitespace-nowrap">추천 {index + 1}</Badge>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <TabNavigation />
    </div>
  );
}