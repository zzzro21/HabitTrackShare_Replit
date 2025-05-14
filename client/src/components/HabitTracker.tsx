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
      
      // 디버깅용 로그
      console.log(`HabitTracker에서 업데이트 시도: habitId=${habitId}, day=${day}, value=${value}`);
      
      // 서버로 요청 전송 (ID 변환은 HabitContext의 updateHabitEntry에서 처리)
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
    
    // 디버깅: 현재 셀의 값 확인
    console.log(`HabitValueCell: habitId=${habitId}, day=${day}, value=${value}`);
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = parseInt(e.target.value);
      console.log(`값 변경: habitId=${habitId}, day=${day}, value=${newValue} (원래값: ${value}, 타입: ${habitScoreType})`);
      
      // binary 타입은 동그라미 선택시 value 2를 선택하지만, 서버에는 1로 저장
      // (binary 타입은 checkbox로 처리되므로 0 또는 1만 저장 가능)
      let valueToSave = newValue;
      if (habitScoreType === 'binary' && newValue === 2) {
        valueToSave = 1;
        console.log(`Binary 타입 습관을 위한 값 변환: ${newValue} -> ${valueToSave}`);
      }
      
      // 습관 ID는 현재 그대로 전달 (HabitContext에서 서버 ID로 변환됨)
      handleValueChange(habitId, day, valueToSave);
    };
    
    // 자신의 데이터인 경우 수정 가능한 셀렉트 박스 표시
    if (canModifyUserData(activeUser)) {
      // 동영상 시청과 미팅 참석은 binary로 설정되어 있고, 세모(△) 옵션이 없고 동그라미(○)만 표시
      if (habitScoreType === 'binary') {
        console.log(`Binary 타입 셀렉트박스 렌더링: value=${value}, habitId=${habitId}`);
        return (
          <select
            value={value > 0 ? 2 : 0} // 값이 있으면(1이상) 무조건 2로 처리해서 동그라미 표시
            onChange={handleChange}
            className={`w-full text-[10px] py-0.5 text-center appearance-none focus:outline-none focus:ring-0 ${value > 0 ? 'bg-green-100' : 'bg-white'}`}
          >
            <option value="0">-</option>
            <option value="2">○</option>
          </select>
        );
      } else {
        // 그 외 습관은 기존대로 세모(△)와 동그라미(○) 옵션 모두 사용
        return (
          <select
            value={value}
            onChange={handleChange}
            className={`w-full text-[10px] py-0.5 text-center appearance-none focus:outline-none focus:ring-0 ${bgColor}`}
          >
            <option value="0">-</option>
            <option value="1">△</option>
            <option value="2">○</option>
          </select>
        );
      }
    } 
    
    // 다른 사용자의 데이터인 경우 읽기 전용 표시
    const displayValue = value === 0 ? '-' : 
                        (habitScoreType === 'binary' && value > 0) ? '○' : // binary 타입은 값이 있으면 무조건 동그라미
                        (value === 1) ? '△' : '○'; // 일반 타입은 값에 따라 세모/동그라미
    
    // binary 타입은 값이 있으면 녹색 배경, 일반 타입은 기존과 동일
    const cellColor = value === 0 ? 'bg-white' : 
                     (habitScoreType === 'binary' && value > 0) ? 'bg-green-100' :
                     (value === 1) ? 'bg-blue-50' : 'bg-green-100';
    
    console.log(`읽기 전용 셀 렌더링: habitId=${habitId}, value=${value}, display=${displayValue}, color=${cellColor}`);
    
    return (
      <div className={`w-full h-full py-0.5 text-center text-[10px] ${cellColor}`}>
        {displayValue}
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
      
      {/* First week part - days 1-7 */}
      <div className="w-full">
        <table className="w-full text-xs border-collapse mb-2">
          <thead>
            <tr>
              <th className="border px-0.5 py-0.5 w-1/3 bg-gray-50 text-center text-[10px]">습관</th>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px]">{startDay + i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                <td className="border px-0.5 py-0.5 text-[10px] font-medium text-center">{habit.label}</td>
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
      <div className="w-full mt-2">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border px-0.5 py-0.5 w-1/3 bg-gray-50 text-center text-[10px]">습관</th>
              <th className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px] w-[9.52%]">{startDay + 8}</th>
              <th className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px] w-[9.52%]">{startDay + 9}</th>
              <th className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px] w-[9.52%]">{startDay + 10}</th>
              <th className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px] w-[9.52%]">{startDay + 11}</th>
              <th className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px] w-[9.52%]">{startDay + 12}</th>
              <th className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px] w-[9.52%]">{startDay + 13}</th>
              <th className="border px-0.5 py-0.5 bg-gray-50 text-center text-[10px] w-[9.52%]">{startDay + 14}</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                <td className="border px-0.5 py-0.5 text-[10px] font-medium text-center">{habit.label}</td>
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