import React, { useState, useEffect } from 'react';
import { useHabit } from '@/lib/HabitContext';
import TabNavigation from '@/components/TabNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, Minus, Award, Calendar, BarChart2, Star } from 'lucide-react';

export default function ProgressPage() {
  const { 
    activeUser, 
    users, 
    calculateCompletionRate, 
    calculateWeekScores, 
    calculateTotalScores,
    calculateGrandTotal,
    calculateUserRank,
    habits
  } = useHabit();
  
  const [selectedView, setSelectedView] = useState<'weekly' | 'overall'>('weekly');
  const user = users.find(u => u.id === activeUser);
  const completionRate = calculateCompletionRate(activeUser);
  const weeklyScores = calculateWeekScores(activeUser, 0); // 현재 활성 주의 점수
  const totalScores = calculateTotalScores(activeUser);
  const grandTotal = calculateGrandTotal(activeUser);
  const userRank = calculateUserRank(activeUser);
  
  // 주간 데이터 포맷팅
  const weeklyData = weeklyScores.map((score, index) => ({
    day: `${index + 1}일`, 
    점수: score
  }));
  
  // 전체 기간 데이터 포맷팅
  const overallData = totalScores.map((score, index) => ({
    week: `${index + 1}주`, 
    점수: score
  }));
  
  // 사용자 진행 상태 평가
  const getUserStatus = () => {
    if (completionRate >= 0.8) return { icon: <Award className="text-yellow-500" />, text: '우수', color: 'text-yellow-500' };
    if (completionRate >= 0.5) return { icon: <Star className="text-blue-500" />, text: '양호', color: 'text-blue-500' };
    if (completionRate >= 0.3) return { icon: <Minus className="text-orange-500" />, text: '노력 필요', color: 'text-orange-500' };
    return { icon: <ArrowDown className="text-red-500" />, text: '개선 필요', color: 'text-red-500' };
  };
  
  const status = getUserStatus();
  
  // 진행 중인 주차
  const currentWeek = Math.ceil(totalScores.filter(s => s > 0).length / 7) || 1;
  
  // 비교 지표 (전주 대비)
  const prevWeekTotal = currentWeek > 1 ? totalScores[currentWeek - 2] || 0 : 0;
  const currentWeekTotal = totalScores[currentWeek - 1] || 0;
  const improvement = currentWeekTotal - prevWeekTotal;
  
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-center">진행 상황</h1>
          <p className="text-xs text-center text-gray-500">{user?.name}님의 습관 여정</p>
        </div>
      </header>
      
      <main className="p-4 space-y-6">
        {/* 핵심 지표 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">완료율</div>
              <div className="text-2xl font-bold">{Math.round(completionRate * 100)}%</div>
              <Progress value={completionRate * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">전체 점수</div>
              <div className="text-2xl font-bold">{grandTotal}</div>
              <div className="flex items-center justify-center mt-2 text-xs">
                {improvement > 0 ? (
                  <><ArrowUp className="text-green-500 w-3 h-3 mr-1" /> <span className="text-green-500">+{improvement} 전주 대비</span></>
                ) : improvement < 0 ? (
                  <><ArrowDown className="text-red-500 w-3 h-3 mr-1" /> <span className="text-red-500">{improvement} 전주 대비</span></>
                ) : (
                  <><Minus className="text-gray-500 w-3 h-3 mr-1" /> <span className="text-gray-500">변동 없음</span></>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 현재 상태 카드 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">진행 상태</CardTitle>
            <CardDescription>현재 {currentWeek}주차 진행 중</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {status.icon}
              </div>
              <div>
                <div className="text-sm font-medium">현재 상태</div>
                <div className={`text-lg font-bold ${status.color}`}>{status.text}</div>
              </div>
              <div className="ml-auto">
                <div className="text-sm font-medium">순위</div>
                <div className="text-lg font-bold">{userRank}위</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 그래프 타입 선택 */}
        <div className="flex border rounded-lg overflow-hidden">
          <button 
            className={`flex-1 py-2 text-center text-sm font-medium ${selectedView === 'weekly' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
            onClick={() => setSelectedView('weekly')}
          >
            <Calendar className="inline-block w-4 h-4 mr-1" />
            주간 보기
          </button>
          <button 
            className={`flex-1 py-2 text-center text-sm font-medium ${selectedView === 'overall' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
            onClick={() => setSelectedView('overall')}
          >
            <BarChart2 className="inline-block w-4 h-4 mr-1" />
            전체 보기
          </button>
        </div>
        
        {/* 차트 영역 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {selectedView === 'weekly' ? '이번 주 진행 상황' : '전체 진행 상황'}
            </CardTitle>
            <CardDescription>
              {selectedView === 'weekly' ? '일별 점수 추이' : '주별 점수 추이'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedView === 'weekly' ? weeklyData : overallData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={selectedView === 'weekly' ? 'day' : 'week'} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="점수"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* 습관별 완료율 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">습관별 완료율</CardTitle>
            <CardDescription>각 습관의 완료 현황</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {habits.map((habit, index) => {
              // 이 부분은 실제 데이터에 따라 계산 필요
              // 예시 코드이므로 추후 수정 필요
              const randomRate = Math.random();
              return (
                <div key={habit.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{habit.label}</span>
                    <span className="font-medium">{Math.round(randomRate * 100)}%</span>
                  </div>
                  <Progress value={randomRate * 100} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
        
        {/* 가이드 및 팁 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">맞춤 가이드</CardTitle>
            <CardDescription>더 나은 결과를 위한 팁</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-700 mb-1">일관성이 중요해요!</p>
              <p className="text-blue-600">하루도 빠짐없이 습관을 기록하면 완료율이 크게 높아집니다.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-sm">
              <p className="font-medium text-green-700 mb-1">성공 요인 분석</p>
              <p className="text-green-600">주말에도 습관을 유지할 때 전체 점수가 25% 더 향상됩니다.</p>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <TabNavigation />
    </div>
  );
}