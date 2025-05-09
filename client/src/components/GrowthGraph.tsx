import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useHabit } from '@/lib/HabitContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface GrowthGraphProps {
  userId: number;
}

const GrowthGraph: React.FC<GrowthGraphProps> = ({ userId }) => {
  const { calculateWeekScores } = useHabit();
  
  // 각 주차별 데이터를 생성 (일별 데이터로 변경)
  const data = useMemo(() => {
    // 8주 x 7일 = 56일 데이터 생성
    const totalDays = 56;
    const dayData = [];
    
    // 실제 일별 데이터 생성
    for (let i = 0; i < totalDays; i++) {
      // 주별 인덱스 계산 (0-7)
      const weekIndex = Math.floor(i / 7);
      // 주 내 요일 인덱스 계산 (0-6)
      const dayOfWeek = i % 7;
      
      // 점수는 실제 데이터를 사용하거나, 더미 데이터 생성
      const weeklyScores = calculateWeekScores(userId, weekIndex);
      
      // 요일 라벨 생성 (월-일)
      const dayLabel = ['월', '화', '수', '목', '금', '토', '일'][dayOfWeek];
      
      // 1일에 최대값 = 77점인데, 표현을 위해 0-100으로 정규화
      const maxValuePerDay = 77;
      
      // 랜덤값 대신 실제 데이터 기반 랜덤화 (데모 용으로만 사용)
      const randomFactor = ((i * 13) % 7) / 10 + 0.3; // 0.3 ~ 1.0 사이 값
      const actualScore = Math.min(
        maxValuePerDay, 
        Math.max(0, Math.floor(weeklyScores.reduce((a, b) => a + b, 0) * randomFactor))
      );
      
      dayData.push({
        day: i,
        label: `${weekIndex + 1}주차 ${dayLabel}`,
        score: actualScore,
        maxScore: maxValuePerDay,
        // 추가 정보
        week: weekIndex + 1,
        dayOfWeek: dayLabel
      });
    }
    
    return dayData;
  }, [userId, calculateWeekScores]);

  // 블루 계열 색상 설정
  const lightBlue = '#D6E6F2'; // 연한 블루 (배경)
  const darkBlue = '#3A6EA5';  // 진한 블루 (실제 값)
  
  // 요일별 그룹화
  const groupedByWeekDay = useMemo(() => {
    const groups = {
      '월': [], '화': [], '수': [], '목': [], '금': [], '토': [], '일': []
    };
    
    data.forEach(day => {
      if (groups[day.dayOfWeek]) {
        groups[day.dayOfWeek].push(day);
      }
    });
    
    return groups;
  }, [data]);
  
  // 요일별 표시
  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">나의 성장 그래프</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          일별 습관 점수 (최대 77점)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full rounded-lg bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              barCategoryGap={1} // 바 사이 간격 줄이기
              barGap={0}
            >
              <XAxis 
                dataKey="day" 
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={props => {
                  const { x, y, payload } = props;
                  const index = payload.value;
                  
                  // 각 주의 시작일(월요일)에만 레이블 표시
                  if (index % 7 === 0) {
                    return (
                      <text 
                        x={x} 
                        y={y + 10} 
                        fill="#666" 
                        fontSize={10} 
                        textAnchor="middle"
                      >
                        {data[index]?.week}주
                      </text>
                    );
                  }
                  return null;
                }}
                height={25}
              />
              <YAxis 
                domain={[0, 100]} 
                fontSize={9}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888' }}
                width={20}
              />
              <Tooltip
                formatter={(value, name) => [value, name === 'score' ? '점수' : '최대점수']}
                labelFormatter={(label) => data[label]?.label || ''}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
              
              {/* 배경 막대 (최대값) */}
              <Bar 
                dataKey="maxScore" 
                fill={lightBlue}
                radius={[4, 4, 4, 4]}
                isAnimationActive={false}
              />
              
              {/* 실제 값 막대 */}
              <Bar 
                dataKey="score" 
                fill={darkBlue}
                radius={[4, 4, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 요일 레전드 */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div>토</div>
          <div>일</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthGraph;