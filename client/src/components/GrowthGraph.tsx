import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useHabit } from '@/lib/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GrowthGraphProps {
  userId: number;
}

function GrowthGraph({ userId }: GrowthGraphProps) {
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

  // 밝은 블루에서 파스텔 민트로 그라데이션 지정
  const colors = {
    독서: '#3B82F6', // 밝은 블루 (글자색 정도)
    동영상: '#38BDF8', // 라이트 블루
    제품애용: '#22D3EE', // 밝은 틸
    미팅참석: '#2DD4BF', // 틸민트
    소비자관리: '#6CDFCB', // 파스텔 민트
  };

  // 스택 차트에서 표시될 카테고리 순서 (아래쪽부터 위쪽 순으로)
  const categories = ['독서', '동영상', '제품애용', '미팅참석', '소비자관리'];

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
              <Tooltip />
              {categories.map((category) => (
                <Bar 
                  key={category} 
                  dataKey={category} 
                  stackId="a"
                  fill={colors[category as keyof typeof colors]}
                  name={category}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default GrowthGraph;