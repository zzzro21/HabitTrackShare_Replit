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
  
  // 카테고리 정의
  const categories = ['독서', '동영상', '제품애용', '미팅참석', '소비자관리'];
  
  // 카테고리별 블루→민트 그라데이션 색상
  const categoryColors = {
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
      const totalScore = weeklyScores.reduce((a, b) => a + b, 0);
      
      // 각 카테고리별 점수
      const categoryScores = {
        독서: weeklyScores[0],
        동영상: weeklyScores[1], 
        제품애용: weeklyScores[2],
        미팅참석: weeklyScores[3],
        소비자관리: weeklyScores[4],
      };
      
      // 표시 모드 설정 (점수가 있는 경우에만 표시)
      let displayMode = totalScore > 0 ? 'bar' : 'none';
      
      return {
        week: `${week + 1}w`,           // 주차 표시 (1w, 2w, 3w 형식)
        score: totalScore,              // 실제 점수 총합
        displayMode,                    // 표시 모드 (bar 또는 none)
        categoryScores,                 // 카테고리별 점수
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
      <div className="flex flex-col space-y-0 pt-3 px-6 pb-1">
        <h3 className="text-xl font-bold text-gray-800">8Weeks Growth</h3>
      </div>
      
      <CardContent className="p-3 pb-6">
        
        <div className="h-44 w-full relative">
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
                
                {/* 점수가 있을 때만 컬러 막대 표시 */}
                {item.displayMode === 'bar' && item.score > 0 && (
                  <div className="absolute bottom-0 w-full z-10 overflow-hidden" style={{ 
                    height: `${Math.min(100, (item.score / MAX_SCORE) * 90)}%`,
                    borderRadius: '20px',
                  }}>
                    {/* 카테고리별로 쌓인 스택 막대 구현 */}
                    {Object.entries(item.categoryScores).map(([category, score], catIdx) => {
                      // 이전 카테고리들의 총 점수 비율 계산
                      const previousCategoriesTotal = Object.entries(item.categoryScores)
                        .slice(0, catIdx)
                        .reduce((sum, [_, val]) => sum + val, 0);
                      
                      // 현재 카테고리의 비율 계산
                      const categoryPercentage = score > 0 ? (score / item.score) * 100 : 0;
                      const bottomPercentage = previousCategoriesTotal > 0 ? 
                        (previousCategoriesTotal / item.score) * 100 : 0;
                      
                      return score > 0 ? (
                        <div 
                          key={`${idx}-${category}`}
                          className="absolute w-full"
                          style={{
                            height: `${categoryPercentage}%`,
                            bottom: `${bottomPercentage}%`,
                            backgroundColor: categoryColors[category as keyof typeof categoryColors],
                            borderRadius: catIdx === 0 ? '0 0 20px 20px' : 
                                        catIdx === 4 ? '20px 20px 0 0' : '0',
                          }}
                        />
                      ) : null;
                    })}
                  </div>
                )}
                
                {/* 툴팁 */}
                {hoveredWeek === idx && (
                  <div className="absolute bottom-full mb-2 z-20 bg-white p-2 rounded-lg shadow-md text-xs whitespace-nowrap">
                    <div className="font-bold mb-1">{item.week} - 총 {item.score}점</div>
                    {Object.entries(item.categoryScores)
                      .filter(([_, score]) => score > 0)
                      .map(([category, score]) => (
                        <div key={`tooltip-${idx}-${category}`} className="flex items-center gap-1.5 mb-0.5">
                          <div className="w-2 h-2 rounded-sm" style={{ 
                            backgroundColor: categoryColors[category as keyof typeof categoryColors] 
                          }}></div>
                          <span>{category}: {score}점</span>
                        </div>
                      ))
                    }
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
      
      {/* 색상 범례 */}
      <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mb-2 text-xs text-gray-500">
        {categories.map(category => (
          <div key={category} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ 
              backgroundColor: categoryColors[category as keyof typeof categoryColors] 
            }}></div>
            <span>{category}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default GrowthGraph;