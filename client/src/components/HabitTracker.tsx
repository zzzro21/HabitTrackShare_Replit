import React from 'react';
import { useHabit } from '@/lib/HabitContext';
import { Link } from 'wouter';

const HabitTracker: React.FC = () => {
  const { 
    habits, 
    habitEntries, 
    activeUser, 
    activeWeek, 
    updateHabitEntry, 
    isLoading,
    canModifyUserData
  } = useHabit();

  // Get value for a specific habit and day
  const getValue = (habitId: number, day: number): number => {
    const entry = habitEntries.find(
      e => e.userId === activeUser && e.habitId === habitId && e.day === day
    );
    return entry ? entry.value : 0;
  };

  // Handle change in habit value
  const handleValueChange = async (habitId: number, day: number, value: number) => {
    try {
      // 자신의 데이터만 수정 가능
      if (!canModifyUserData(activeUser)) {
        console.info("다른 사용자의 데이터를 수정할 권한이 없습니다");
        return;
      }
      
      await updateHabitEntry(habitId, day, value);
    } catch (error) {
      console.error("습관 업데이트 중 오류 발생:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-800">{activeWeek + 1}주차 습관 기록</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate start day for the current week (각 주는 14일을 포함)
  const startDay = activeWeek * 14;

  // 각 습관의 상태 아이콘 렌더링 함수
  const renderValueOption = (value: number) => {
    switch(value) {
      case 0: return "-";
      case 1: return "△";  // 모든 습관에서 1 값은 삼각형으로 통일
      case 2: return "○";  // 모든 습관에서 2 값은 동그라미로 통일
      default: return "-";
    }
  };

  // 습관 상태 표시용 컴포넌트 - 자신의 데이터면 선택박스, 아니면 텍스트만 표시
  const HabitValueCell = ({ habitId, day, value, habitScoreType }: { habitId: number, day: number, value: number, habitScoreType: string }) => {
    let bgColor = 'bg-white';
    if (value === 1) bgColor = 'bg-blue-50';
    if (value === 2) bgColor = 'bg-green-100';
    
    // 자신의 데이터인 경우 수정 가능한 셀렉트 박스 표시
    if (canModifyUserData(activeUser)) {
      return (
        <select
          value={value}
          onChange={(e) => handleValueChange(habitId, day, parseInt(e.target.value))}
          className={`w-full text-[10px] py-0.5 text-center appearance-none focus:outline-none focus:ring-0 ${bgColor}`}
        >
          <option value="0">-</option>
          <option value="1">△</option>
          {habitScoreType !== 'binary' && <option value="2">○</option>}
        </select>
      );
    } 
    
    // 다른 사용자의 데이터인 경우 읽기 전용 표시
    return (
      <div className={`w-full h-full py-0.5 text-center text-[10px] ${bgColor}`}>
        {value === 0 ? '-' : value === 1 ? '△' : '○'}
      </div>
    );
  };

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-medium text-gray-800">{activeWeek*2 + 1}-{activeWeek*2 + 2}주차 습관 기록</h3>
        <div className="flex items-center">
          <Link to="/notes">
            <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-2 rounded-md mr-2">
              일지 작성
            </button>
          </Link>
          <div className="flex gap-1 text-xs">
            <span className="inline-flex items-center">
              <span className="inline-block w-3 h-3 bg-white border mr-1"></span>미완료
            </span>
            <span className="inline-flex items-center ml-2">
              <span className="inline-block w-3 h-3 bg-blue-50 border mr-1"></span>부분완료
            </span>
            <span className="inline-flex items-center ml-2">
              <span className="inline-block w-3 h-3 bg-green-100 border mr-1"></span>완료
            </span>
          </div>
        </div>
      </div>
      
      <div className="w-full">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border px-0.5 py-0.5 w-28 bg-gray-50 text-left text-[10px]">습관</th>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px] w-[5%]">{startDay + i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                <td className="border px-0.5 py-0.5 text-[10px] font-medium">{habit.label}</td>
                {[...Array(7)].map((_, i) => {
                  // day는 0부터 시작하지만 화면에 표시되는 숫자는 day+1
                  const day = startDay + i;
                  const value = getValue(habit.id, day);
                  
                  return (
                    <td key={i} className="border p-0 text-center">
                      <HabitValueCell 
                        habitId={habit.id} 
                        day={day} 
                        value={value} 
                        habitScoreType={habit.scoreType} 
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Second week part - days 8-14 */}
      <div className="w-full mt-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border px-0.5 py-0.5 w-28 bg-gray-50 text-left text-[10px]">습관</th>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px] w-[5%]">{startDay + i + 8}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                <td className="border px-0.5 py-0.5 text-[10px] font-medium">{habit.label}</td>
                {[...Array(7)].map((_, i) => {
                  // 고정된 간격으로 두 번째 주차의 날짜 계산 - 헤더 숫자와 일치하도록 수정
                  const day = startDay + i + 7; // 숫자가 8부터 시작하는 것을 맞추기 위해 7을 더함 (day+1이 화면에 표시되는 숫자)
                  const value = getValue(habit.id, day);
                  
                  return (
                    <td key={i} className="border p-0 text-center">
                      <HabitValueCell 
                        habitId={habit.id} 
                        day={day} 
                        value={value} 
                        habitScoreType={habit.scoreType} 
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HabitTracker;