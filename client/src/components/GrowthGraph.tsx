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
      
      // 1-8주 모두에 자리표시 배경을 깔고, 실제 데이터도 표시
      return {
        week: `${week + 1}w`,
        // 실제 데이터
        독서: weeklyScores[0],
        동영상: weeklyScores[1],
        제품애용: weeklyScores[2],
        미팅참석: weeklyScores[3],
        소비자관리: weeklyScores[4],
        
        // 배경 자리표시 데이터 (고정값)
        독서_placeholder: 15,
        동영상_placeholder: 15,
        제품애용_placeholder: 16,
        미팅참석_placeholder: 16,
        소비자관리_placeholder: 15,
        
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
  
  // 자리표시용 반투명 색상
  const placeholderColors = {
    독서_placeholder: 'rgba(59, 130, 246, 0.3)', // 밝은 블루 반투명
    동영상_placeholder: 'rgba(56, 189, 248, 0.3)', // 라이트 블루 반투명
    제품애용_placeholder: 'rgba(34, 211, 238, 0.3)', // 밝은 틸 반투명
    미팅참석_placeholder: 'rgba(45, 212, 191, 0.3)', // 틸민트 반투명
    소비자관리_placeholder: 'rgba(108, 223, 203, 0.3)', // 파스텔 민트 반투명
  };

  // 스택 차트에서 표시될 카테고리 순서 (아래쪽부터 위쪽 순으로)
  const categories = ['독서', '동영상', '제품애용', '미팅참석', '소비자관리'];
  const placeholderCategories = categories.map(cat => `${cat}_placeholder`);

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
              maxBarSize={35}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" fontSize={10} />
              <YAxis fontSize={10} domain={[0, MAX_SCORE]} />
              <Tooltip />
              
              {/* 최대 점수 선 */}
              <ReferenceLine y={MAX_SCORE} stroke="#ddd" strokeDasharray="3 3" />
              
              {/* 자리표시 데이터 바 (먼저 렌더링하여 뒤에 배치) */}
              {placeholderCategories.map((category) => (
                <Bar 
                  key={category} 
                  dataKey={category} 
                  fill={placeholderColors[category as keyof typeof placeholderColors]}
                  name={category}
                  radius={[2, 2, 0, 0]}
                />
              ))}
              
              {/* 실제 데이터 바 (나중에 렌더링하여 앞에 배치) */}
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