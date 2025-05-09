import React, { useEffect, useState, useMemo } from 'react';
import { useHabit } from '@/lib/HabitContext';
import { Card, CardContent } from '@/components/ui/card';

interface GrowthGraphProps {
  userId: number;
}

// 커스텀 컴포넌트로 막대그래프 구현 (Recharts 대신 직접 DOM으로 구현)
function GrowthGraph({ userId }: GrowthGraphProps) {
  const { calculateWeekScores } = useHabit();
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  
  // 최대 점수 상수 설정
  const MAX_SCORE = 77;
  
  // 각 주차별 데이터를 생성
  const data = useMemo(() => {
    const weeks = Array.from({ length: 8 }, (_, i) => i);
    
    return weeks.map(week => {
      const weeklyScores = calculateWeekScores(userId, week);
      const totalScore = weeklyScores.reduce((a, b) => a + b, 0);
      
      // 샘플 이미지에 맞게 수정: 4주차만 긴 막대, 나머지는 작은 원형으로 표시
      let valueForGraph = totalScore;
      let displayMode = 'circle'; // 기본값은 작은 원형
      
      // 4주차만 긴 막대로 표시 (샘플 이미지 모방)
      if (week === 3) {
        displayMode = 'bar';
      }
      
      return {
        week: `${week + 1}w`,  // 주차 표시 (1w, 2w, 3w 형식)
        score: totalScore,     // 실제 점수
        displayMode,           // 표시 모드 (circle 또는 bar)
      };
    });
  }, [userId, calculateWeekScores]);

  // 색상 설정
  const barColor = '#8B5CF6'; // 보라색 계열
  const backgroundBarColor = '#F3F4F6'; // 연한 회색 배경

  // 툴팁 표시 제어
  const showTooltip = (week: number) => {
    setHoveredWeek(week);
  };

  const hideTooltip = () => {
    setHoveredWeek(null);
  };

  return (
    <Card className="rounded-3xl shadow-md border-0 bg-white overflow-hidden">
      <div className="flex flex-col space-y-1 pt-6 px-6 pb-2">
        <h3 className="text-xl font-bold text-gray-800">8Weeks Growth</h3>
      </div>
      
      <CardContent className="p-4 pb-8">
        <div className="h-64 w-full relative">
          <div className="flex h-full items-end justify-between px-4">
            {data.map((item, idx) => (
              <div 
                key={idx} 
                className="relative flex flex-col items-center justify-end h-full"
                style={{ width: `${100 / data.length - 3}%` }}
                onMouseEnter={() => showTooltip(idx)}
                onMouseLeave={hideTooltip}
              >
                {/* 회색 배경 막대 - 항상 전체 높이 */}
                <div 
                  className="absolute bottom-0 w-full rounded-full bg-gray-100"
                  style={{ 
                    height: '90%',
                    backgroundColor: backgroundBarColor,
                    borderRadius: '20px',
                  }}
                ></div>
                
                {/* 컬러 콘텐츠 - 아래쪽 끝에만 원형으로 표시 */}
                {item.displayMode === 'circle' ? (
                  <div 
                    className="absolute bottom-0 mb-3 z-10"
                    style={{ 
                      width: '80%',
                      height: '24px',
                      backgroundColor: barColor,
                      borderRadius: '100px',
                    }}
                  ></div>
                ) : (
                  /* 4주차만 긴 막대 그래프로 표시 */
                  <div 
                    className="absolute bottom-0 w-full z-10"
                    style={{ 
                      height: `${Math.min(100, (item.score / MAX_SCORE) * 90)}%`,
                      backgroundColor: barColor,
                      borderRadius: '20px',
                    }}
                  ></div>
                )}
                
                {/* 툴팁 */}
                {hoveredWeek === idx && (
                  <div className="absolute bottom-full mb-2 z-20 bg-white px-2 py-1 rounded-lg shadow-md text-xs whitespace-nowrap">
                    {item.score}점
                  </div>
                )}
                
                {/* X축 라벨 */}
                <div className="absolute -bottom-6 text-xs text-gray-500">
                  {item.week}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GrowthGraph;