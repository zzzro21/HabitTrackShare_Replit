import React, { useMemo } from 'react';
import { useHabit } from '@/lib/HabitContext';

interface GrowthGraphProps {
  userId: number;
}

function GrowthGraph({ userId }: GrowthGraphProps) {
  const { calculateWeekScores } = useHabit();
  
  // 최대 점수 상수 설정
  const MAX_SCORE = 77;
  
  // 카테고리 정의
  const categories = ['독서', '동영상', '제품애용', '미팅참석', '소비자관리'];
  
  // 카테고리 표시명 간소화 - 모바일에서도 잘 보이도록 더 짧게 조정
  const categoryDisplayNames = {
    독서: '독서',
    동영상: '영상',
    제품애용: '제품',
    미팅참석: '미팅',
    소비자관리: '소비자'
  };
  
  // 카테고리별 블루→민트 그라데이션 색상
  const categoryColors = {
    독서: '#3B82F6', // 밝은 블루
    동영상: '#38BDF8', // 라이트 블루
    제품애용: '#22D3EE', // 밝은 틸
    미팅참석: '#2DD4BF', // 틸민트
    소비자관리: '#6CDFCB', // 파스텔 민트
  };
  
  // 각 주차별 데이터를 생성
  const weekData = useMemo(() => {
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
      
      return {
        week: `${week + 1}w`,
        score: totalScore,
        categoryScores,
      };
    });
  }, [userId, calculateWeekScores]);

  return (
    <div className="bg-blue-50 rounded-2xl shadow-md mb-4">
      <div className="pt-3 px-4 pb-2">
        <h3 className="text-base font-bold text-gray-800 mb-3 text-center">8Weeks Growth</h3>
        
        {/* 그래프 영역 */}
        <div className="h-36 relative mb-0">
          <div className="flex h-full items-end justify-between">
            {weekData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center w-[10%]">
                {/* 배경 막대 */}
                <div className="w-full h-32 bg-white rounded-lg relative">
                  {/* 데이터 막대 */}
                  {item.score > 0 && (
                    <div 
                      className="absolute bottom-0 w-full rounded-lg overflow-hidden"
                      style={{ height: `${Math.min(100, (item.score / MAX_SCORE) * 75)}%` }}
                    >
                      {/* 카테고리별 색상 세그먼트 */}
                      {Object.entries(item.categoryScores).map(([category, score], catIdx) => {
                        if (score <= 0) return null;
                        
                        // 이전 카테고리들의 총합 계산
                        const prevTotal = Object.entries(item.categoryScores)
                          .slice(0, catIdx)
                          .reduce((sum, [_, val]) => sum + val, 0);
                        
                        // 현재 카테고리의 비율과 위치 계산
                        const height = (score / item.score) * 100;
                        const bottom = (prevTotal / item.score) * 100;
                        
                        return (
                          <div 
                            key={`${idx}-${category}`}
                            className="absolute w-full"
                            style={{
                              height: `${height}%`,
                              bottom: `${bottom}%`,
                              backgroundColor: categoryColors[category as keyof typeof categoryColors],
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* 주차 라벨 */}
                <div className="text-xs text-gray-500 mt-1">{item.week}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 범례 섹션 - 심플한 인라인 표시 */}
        <div className="pt-0 pb-2 px-1 mt-0">
          <div className="grid grid-cols-5 gap-1">
            {categories.map(category => (
              <div key={category} className="flex flex-col items-center">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0 mb-0.5" 
                  style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] }}
                />
                <p className="text-[10px] font-medium text-gray-600">{categoryDisplayNames[category as keyof typeof categoryDisplayNames]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrowthGraph;