import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useHabit } from '@/lib/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GrowthGraphProps {
  userId: number;
}

const GrowthGraph: React.FC<GrowthGraphProps> = ({ userId }) => {
  const { calculateWeekScores } = useHabit();
  
  // 데이터 생성 - 단순화된 버전
  const data = useMemo(() => {
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
    const days = [];
    
    // 8주 데이터로 단순화
    for (let week = 0; week < 8; week++) {
      const weekScores = calculateWeekScores(userId, week);
      const totalScoreForWeek = weekScores.reduce((a, b) => a + b, 0);
      
      // 각 주에 하나의 막대만 표시
      days.push({
        id: week,
        name: `${week + 1}주차`,
        score: totalScoreForWeek,
        maxScore: 77,
        week: week + 1,
        display: `${week + 1}주`
      });
    }
    
    return days;
  }, [userId, calculateWeekScores]);
  
  // 블루 계열 색상
  const lightBlue = '#D6E6F2'; // 연한 블루 (배경)
  const darkBlue = '#3A6EA5';  // 진한 블루 (실제 값)
  
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
              barCategoryGap={2}
              barGap={0}
            >
              <XAxis 
                dataKey="display" 
                fontSize={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === 'score' ? '점수' : '최대점수'
                ]}
                labelFormatter={(label) => `${label}차 주`}
              />
              
              {/* 배경 막대 (최대값) */}
              <Bar 
                dataKey="maxScore" 
                fill={lightBlue}
                radius={[4, 4, 4, 4]} 
              />
              
              {/* 실제 점수 막대 */}
              <Bar 
                dataKey="score" 
                fill={darkBlue}
                radius={[4, 4, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthGraph;