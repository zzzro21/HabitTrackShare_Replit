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
    const currentWeek = Math.min(4, weeks.length); // 예시로 현재 주차를 4로 가정 (실제 앱에서는 현재 주차 계산 로직 필요)
    
    return weeks.map(week => {
      const weeklyScores = calculateWeekScores(userId, week);
      const isStarted = week < currentWeek; // 현재 주차보다 이전인지 확인
      
      // 각 카테고리별 실제 데이터 및 자리표시 데이터 생성
      return {
        week: `${week + 1}w`,
        독서: isStarted ? weeklyScores[0] : 0, // 실제 데이터
        독서_placeholder: isStarted ? 0 : 15, // 자리표시 데이터
        동영상: isStarted ? weeklyScores[1] : 0,
        동영상_placeholder: isStarted ? 0 : 15,
        제품애용: isStarted ? weeklyScores[2] : 0,
        제품애용_placeholder: isStarted ? 0 : 16,
        미팅참석: isStarted ? weeklyScores[3] : 0,
        미팅참석_placeholder: isStarted ? 0 : 16,
        소비자관리: isStarted ? weeklyScores[4] : 0,
        소비자관리_placeholder: isStarted ? 0 : 15,
        total: weeklyScores.reduce((a, b) => a + b, 0),
        isStarted // 주차가 시작되었는지 표시
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
              <Tooltip 
                formatter={(value, name) => {
                  // 자리표시용 바는 툴팁에서 표시하지 않음
                  if (name.includes('placeholder')) return [null, null];
                  return [value, name];
                }}
              />
              
              {/* 최대 점수 선 */}
              <ReferenceLine y={MAX_SCORE} stroke="#ddd" strokeDasharray="3 3" />
              
              {/* 실제 데이터 바 */}
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
              
              {/* 자리표시 데이터 바 */}
              {placeholderCategories.map((category) => (
                <Bar 
                  key={category} 
                  dataKey={category} 
                  stackId="placeholder"
                  fill={placeholderColors[category as keyof typeof placeholderColors]}
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