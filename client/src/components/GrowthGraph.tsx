import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useHabit } from '@/lib/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GrowthGraphProps {
  userId: number;
}

const GrowthGraph: React.FC<GrowthGraphProps> = ({ userId }) => {
  const { calculateWeekScores } = useHabit();
  
  // 각 주차별 데이터를 생성
  const data = useMemo(() => {
    const weeks = Array.from({ length: 8 }, (_, i) => i);
    
    return weeks.map(week => {
      const weeklyScores = calculateWeekScores(userId, week);
      
      return {
        week: `${week + 1}w`,
        독서: weeklyScores[0], // 책 읽기
        동영상: weeklyScores[1], // 동영상 시청
        제품애용: weeklyScores[2], // 제품 애용
        미팅참석: weeklyScores[3], // 미팅 참석
        소비자관리: weeklyScores[4], // 제품 전달 및 소비자 관리
        total: weeklyScores.reduce((a, b) => a + b, 0)
      };
    });
  }, [userId, calculateWeekScores]);

  // 각 카테고리에 대한 파스텔톤 색상 지정
  const colors = {
    독서: '#9ED5A1', // 파스텔 그린
    동영상: '#FFB7A0', // 파스텔 코랄
    제품애용: '#A0C5E8', // 파스텔 블루
    미팅참석: '#D0A5D6', // 파스텔 퍼플
    소비자관리: '#FDDA9B', // 파스텔 옐로우
  };

  const categories = ['독서', '동영상', '제품애용', '미팅참석', '소비자관리'];

  // 스택 바 차트 설정을 위한 데이터 구성
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
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `${label}`}
              />
              {categories.map((category) => (
                <Bar 
                  key={category} 
                  dataKey={category} 
                  stackId="a"
                  fill={colors[category as keyof typeof colors]}
                  name={category}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthGraph;