import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useHabit } from '@/lib/HabitContext';
import { Card, CardContent } from '@/components/ui/card';

interface GrowthGraphProps {
  userId: number;
}

function GrowthGraph({ userId }: GrowthGraphProps) {
  const { calculateWeekScores } = useHabit();
  
  // 최대 점수 상수 설정
  const MAX_SCORE = 77;
  
  // 각 주차별 데이터를 생성
  const data = useMemo(() => {
    const weeks = Array.from({ length: 8 }, (_, i) => i);
    
    return weeks.map(week => {
      const weeklyScores = calculateWeekScores(userId, week);
      const totalScore = weeklyScores.reduce((a, b) => a + b, 0);
      
      return {
        week: `${week + 1}w`,  // 주차 표시 (1w, 2w, 3w 형식)
        value: totalScore,     // 실제 점수 총합
        maxValue: MAX_SCORE    // 최대 점수
      };
    });
  }, [userId, calculateWeekScores]);

  // 색상 설정
  const barColor = '#8B5CF6'; // 보라색 계열로 변경
  const backgroundBarColor = '#E5E7EB'; // 좀 더 진한 회색 배경

  return (
    <Card className="rounded-3xl shadow-md border-0 bg-white overflow-hidden">
      <div className="flex flex-col space-y-1 pt-6 px-6">
        <h3 className="text-xl font-bold text-gray-700">8Weeks Growth</h3>
      </div>
      
      <CardContent className="p-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 16, left: 16, bottom: 20 }}
              barSize={40}
              barGap={8} // 막대끼리는 겹치지 않음
              barCategoryGap={10} // 그래프 간격은 그래프 두께의 약 20%
            >
              {/* X축 스타일 */}
              <XAxis 
                dataKey="week" 
                fontSize={11}
                axisLine={false}
                tickLine={false}
                dy={10}
                tick={{ fill: '#888' }}
                interval={0}
                tickMargin={5}
                textAnchor="middle"
              />
              
              {/* Y축 제거 */}
              <YAxis hide />
              
              {/* 툴팁 */}
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '1px solid #eee',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
                formatter={(value) => [`${value}점`, '점수']}
              />
              
              {/* 배경 막대 먼저 그리기 */}
              <Bar 
                dataKey="maxValue" 
                fill={backgroundBarColor}
                radius={[12, 12, 12, 12]}
                isAnimationActive={false}
                style={{
                  // 배경 막대의 z-index를 낮게 설정
                  zIndex: 0,
                  opacity: 0.5,
                }}
              >
                {data.map((_, index) => (
                  <Cell key={`background-${index}`} fill={backgroundBarColor} />
                ))}
              </Bar>
              
              {/* 실제 값 막대를 나중에 그려서 맨 위에 위치하도록 함 */}
              <Bar 
                dataKey="value" 
                fill={barColor}
                radius={[12, 12, 12, 12]}
                animationDuration={1500}
                style={{
                  // 실제 막대의 z-index를 높게 설정해 위에 그려지도록 함
                  zIndex: 1
                }}
              >
                {data.map((_, index) => (
                  <Cell key={`actual-${index}`} fill={barColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Week 선택 버튼 - 오른쪽 상단에 배치 */}
        <div className="absolute top-6 right-6">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-full text-sm font-medium flex items-center gap-1">
            Week
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default GrowthGraph;