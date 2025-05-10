import React from 'react';
import { useHabit } from '@/lib/HabitContext';
import TabNavigation from '@/components/TabNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart2, PieChart as PieChartIcon } from 'lucide-react';

export default function JourneyVisualization() {
  const { 
    activeUser, 
    users, 
    calculateCompletionRate,
    calculateGrandTotal,
    calculateCompletedHabits,
  } = useHabit();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const user = users.find(u => u.id === activeUser);
  const completionRate = calculateCompletionRate(activeUser);
  
  // 단순화된 데이터 세트
  const habitCompletion = [
    { name: '책 읽기', count: 15, value: 20 },
    { name: '영상 시청', count: 12, value: 18 },
    { name: '제품 사용', count: 10, value: 15 },
    { name: '미팅 참석', count: 8, value: 25 }
  ];
  
  const weeklyData = [
    { name: '1주', 점수: 10 },
    { name: '2주', 점수: 20 },
    { name: '3주', 점수: 30 },
    { name: '4주', 점수: 25 },
    { name: '5주', 점수: 35 },
    { name: '6주', 점수: 40 },
    { name: '7주', 점수: 45 },
    { name: '8주', 점수: 50 }
  ];
  
  const completedHabits = calculateCompletedHabits(activeUser);
  const totalHabits = completedHabits + 10; // 단순화
  const successRatio = (completedHabits / totalHabits) * 100;
  
  const successData = [
    { name: '완료', value: completedHabits },
    { name: '미완료', value: totalHabits - completedHabits }
  ];
  
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen pb-16">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-center">여정 시각화</h1>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {user?.name}님의 56일 습관 형성 여정
          </p>
        </div>
      </header>
      
      <main className="p-4 space-y-6">
        {/* 현재 진행 상황 요약 카드 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">진행 상황</CardTitle>
            <CardDescription>현재 완료율: {Math.round(completionRate * 100)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-500 dark:text-blue-400">총 점수</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{calculateGrandTotal(activeUser)}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-green-500 dark:text-green-400">완료한 습관</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">{calculateCompletedHabits(activeUser)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 시각화 탭 */}
        <Tabs defaultValue="progress">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="progress">
              <BarChart2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">진행</span>
            </TabsTrigger>
            <TabsTrigger value="habits">
              <PieChartIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">습관</span>
            </TabsTrigger>
          </TabsList>
          
          {/* 진행 탭 - 주차별 점수 바 차트 */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">주차별 진행 상황</CardTitle>
                <CardDescription>8주간의 점수 추이</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="점수" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 습관 탭 - 습관별 완료 현황 파이 차트 */}
          <TabsContent value="habits" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">습관별 완료 현황</CardTitle>
                <CardDescription>각 습관의 완료 비율</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={habitCompletion}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {habitCompletion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">습관별 점수</CardTitle>
                <CardDescription>각 습관에서 얻은 점수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habitCompletion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d">
                        {habitCompletion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <TabNavigation />
    </div>
  );
}