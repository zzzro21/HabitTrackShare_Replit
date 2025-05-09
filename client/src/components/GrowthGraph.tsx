import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useHabit } from '@/lib/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      
      // 각 주차별로 통합된 데이터 (한 주에 하나의 막대만 표시)
      return {
        week: `${week + 1}w`,
        actualScore: totalScore, // 실제 점수값
        placeholder: MAX_SCORE, // 배경 막대 (최대값)
      };
    });
  }, [userId, calculateWeekScores]);

  // 색상 지정
  const actualColor = '#3B82F6'; // 실제 점수 막대 색상 (밝은 블루)
  const placeholderColor = 'rgba(59, 130, 246, 0.15)'; // 배경 막대 색상 (연한 블루, 15% 투명도)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">나의 성장 그래프</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              maxBarSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" fontSize={10} />
              <YAxis fontSize={10} domain={[0, MAX_SCORE]} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'placeholder') return ['', '최대 점수'];
                  return [value, '점수'];
                }}
              />
              
              {/* 최대 점수 선 */}
              <ReferenceLine y={MAX_SCORE} stroke="#ddd" strokeDasharray="3 3" />
              
              {/* 배경 자리표시 막대 */}
              <Bar 
                dataKey="placeholder" 
                fill={placeholderColor}
                name="placeholder"
                radius={[4, 4, 0, 0]}
              />
              
              {/* 실제 점수 막대 */}
              <Bar 
                dataKey="actualScore" 
                fill={actualColor}
                name="score"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 색상 범례 */}
        <div className="flex justify-center items-center gap-6 mt-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: actualColor }}></div>
            <span>실제 점수</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: placeholderColor }}></div>
            <span>최대 점수 (77점)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GrowthGraph;