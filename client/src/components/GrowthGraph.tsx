import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useHabit } from '@/lib/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GrowthGraphProps {
  userId: number;
}

function GrowthGraph({ userId }: GrowthGraphProps) {
  const { calculateWeekScores } = useHabit();
  
  // 최대 점수 상수 설정
  const MAX_SCORE = 77;
  
  // 카테고리 정의
  const categories = ['독서', '동영상', '제품애용', '미팅참석', '소비자관리'];
  
  // 카테고리별 블루→민트 그라데이션 색상
  const colors = {
    독서: '#3B82F6', // 밝은 블루
    동영상: '#38BDF8', // 라이트 블루
    제품애용: '#22D3EE', // 밝은 틸
    미팅참석: '#2DD4BF', // 틸민트
    소비자관리: '#6CDFCB', // 파스텔 민트
  };
  
  // 각 주차별 데이터를 생성
  const data = useMemo(() => {
    const weeks = Array.from({ length: 8 }, (_, i) => i);
    
    return weeks.map(week => {
      const weeklyScores = calculateWeekScores(userId, week);
      
      // 각 주차별로 카테고리별 데이터 유지
      const result = {
        week: `${week + 1}w`,
        // 카테고리별 실제 점수
        독서: weeklyScores[0],
        동영상: weeklyScores[1], 
        제품애용: weeklyScores[2],
        미팅참석: weeklyScores[3],
        소비자관리: weeklyScores[4],
        // 배경 막대 (전체 너비를 차지하는 최대 값)
        background: MAX_SCORE,
        // 모든 카테고리 합계
        total: weeklyScores.reduce((a, b) => a + b, 0),
      };
      
      return result;
    });
  }, [userId, calculateWeekScores]);

  // 배경 막대 색상
  const backgroundBarColor = 'rgba(226, 232, 240, 0.6)'; // 연한 회색 배경

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
              barSize={40}
              barGap={-40} // 그래프 겹치기 위한 음수값
              barCategoryGap={20}
            >
              <CartesianGrid strokeDasharray="5 5" vertical={false} />
              <XAxis dataKey="week" fontSize={10} />
              <YAxis fontSize={10} domain={[0, MAX_SCORE]} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'background') return ['77', '최대 점수'];
                  return [value, name];
                }}
                itemStyle={{ color: '#666' }}
              />
              
              {/* 배경 막대 (모든 카테고리를 합친 최대 점수) */}
              <Bar 
                dataKey="background" 
                fill={backgroundBarColor}
                radius={[5, 5, 0, 0]}
              />
              
              {/* 스택 형태로 카테고리별 막대 표시 - 배경과 동일한 위치에 배치 */}
              <Bar 
                dataKey="독서"
                stackId="actual"
                name="독서"
                fill={colors['독서']}
              />
              <Bar 
                dataKey="동영상"
                stackId="actual"
                name="동영상"
                fill={colors['동영상']}
              />
              <Bar 
                dataKey="제품애용"
                stackId="actual"
                name="제품애용" 
                fill={colors['제품애용']}
              />
              <Bar 
                dataKey="미팅참석"
                stackId="actual"
                name="미팅참석"
                fill={colors['미팅참석']}
              />
              <Bar 
                dataKey="소비자관리"
                stackId="actual"
                name="소비자관리"
                fill={colors['소비자관리']}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 색상 범례 */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-600">
          {categories.map(category => (
            <div key={category} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ 
                backgroundColor: colors[category as keyof typeof colors] 
              }}></div>
              <span>{category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default GrowthGraph;