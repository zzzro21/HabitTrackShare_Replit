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
    isLoading 
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

  // Calculate start day for the current week
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

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-800">{activeWeek*2 + 1}-{activeWeek*2 + 2}주차 습관 기록</h3>
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
      
      {/* First week part - days 1-7 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse mb-2">
          <thead>
            <tr>
              <th className="border px-1 py-1 w-1/3 bg-gray-50 text-left">습관</th>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="border px-1 py-1 bg-gray-50 text-center">{startDay + i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                <td className="border px-1 py-1 text-xs font-medium">{habit.label}</td>
                {[...Array(7)].map((_, i) => {
                  const day = startDay + i;
                  const value = getValue(habit.id, day);
                  
                  let bgColor = 'bg-white';
                  if (value === 1) bgColor = 'bg-blue-50';
                  if (value === 2) bgColor = 'bg-green-100';
                  
                  return (
                    <td key={i} className="border p-0 text-center">
                      <select
                        value={value}
                        onChange={(e) => handleValueChange(habit.id, day, parseInt(e.target.value))}
                        className={`w-full text-xs py-1 text-center appearance-none focus:outline-none focus:ring-0 ${bgColor}`}
                      >
                        <option value="0">-</option>
                        <option value="1">△</option>
                        {habit.scoreType !== 'binary' && <option value="2">○</option>}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Second week part - days 8-14 */}
      <div className="overflow-x-auto mt-1">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border px-1 py-1 w-1/3 bg-gray-50 text-left">습관</th>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="border px-1 py-1 bg-gray-50 text-center">{startDay + i + 8}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                <td className="border px-1 py-1 text-xs font-medium">{habit.label}</td>
                {[...Array(7)].map((_, i) => {
                  const day = startDay + i + 7;
                  const value = getValue(habit.id, day);
                  
                  let bgColor = 'bg-white';
                  if (value === 1) bgColor = 'bg-blue-50';
                  if (value === 2) bgColor = 'bg-green-100';
                  
                  return (
                    <td key={i} className="border p-0 text-center">
                      <select
                        value={value}
                        onChange={(e) => handleValueChange(habit.id, day, parseInt(e.target.value))}
                        className={`w-full text-xs py-1 text-center appearance-none focus:outline-none focus:ring-0 ${bgColor}`}
                      >
                        <option value="0">-</option>
                        <option value="1">△</option>
                        {habit.scoreType !== 'binary' && <option value="2">○</option>}
                      </select>
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
