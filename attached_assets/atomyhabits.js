import React, { useState, useEffect } from 'react';

// Firebase와 유사한 형태로 데이터 구조 예시
const dummyUsers = [
  { id: 1, name: '사용자1', avatar: '👤' },
  { id: 2, name: '사용자2', avatar: '👤' },
  { id: 3, name: '사용자3', avatar: '👤' },
  { id: 4, name: '사용자4', avatar: '👤' },
  { id: 5, name: '사용자5', avatar: '👤' },
  { id: 6, name: '사용자6', avatar: '👤' },
  { id: 7, name: '사용자7', avatar: '👤' },
  { id: 8, name: '사용자8', avatar: '👤' },
];

const habits = [
  {
    label: "책 읽기 (30분 이상)",
    scoring: (value) => value === 2 ? 1 : value === 1 ? 0.5 : 0
  },
  {
    label: "동영상 시청 및 소감 작성",
    scoring: (value) => value ? 1 : 0
  },
  {
    label: "제품 애용 및 후기 작성",
    scoring: (value) => value === 2 ? 2 : value === 1 ? 1 : 0
  },
  {
    label: "미팅 참석 및 소감 작성",
    scoring: (value) => value ? 5 : 0
  },
  {
    label: "소비자 제품 전달/설명 및 추천",
    scoring: (value) => value === 2 ? 2 : value === 1 ? 1 : 0
  }
];

const SharedHabitTracker = () => {
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeUser, setActiveUser] = useState(1);
  const [usersData, setUsersData] = useState({});
  const [loaded, setLoaded] = useState(false);

  // 백엔드에서 데이터를 가져오는 것을 시뮬레이션
  useEffect(() => {
    // 실제로는 API 호출이 들어갈 자리
    const mockData = {};
    
    dummyUsers.forEach(user => {
      mockData[user.id] = habits.map(() => Array(14 * 4).fill(0))
    });
    
    // 약간의 데이터 채우기 (실제와 유사하게)
    for (let userId = 1; userId <= 8; userId++) {
      for (let habitIndex = 0; habitIndex < habits.length; habitIndex++) {
        for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
          // 랜덤하게 일부 값 채우기
          if (Math.random() > 0.6) {
            mockData[userId][habitIndex][dayIndex] = Math.floor(Math.random() * 3);
          }
        }
      }
    }
    
    setTimeout(() => {
      setUsersData(mockData);
      setLoaded(true);
    }, 500);
  }, []);

  // 데이터 업데이트 함수
  const updateValue = (habitIndex, dayIndex, value) => {
    const newData = {...usersData};
    newData[activeUser][habitIndex][dayIndex] = value;
    setUsersData(newData);
    
    // 실제로는 여기서 백엔드 API 호출하여 저장
    console.log(`사용자 ${activeUser}가 습관 ${habitIndex}의 ${dayIndex}일차를 ${value}로 업데이트`);
  };

  // 주차별 점수 계산
  const calculateWeekScores = (userId) => {
    if (!loaded || !usersData[userId]) return [];
    
    return [...Array(4)].map((_, weekIndex) => {
      const startDay = weekIndex * 14;
      const endDay = startDay + 14;
      
      return habits.map((habit, habitIndex) => {
        return usersData[userId][habitIndex]
          .slice(startDay, endDay)
          .reduce((sum, val) => sum + habit.scoring(val), 0);
      });
    });
  };

  // 습관별 총점 계산
  const calculateTotalScores = (userId) => {
    if (!loaded || !usersData[userId]) return [];
    
    return usersData[userId].map((habitData, i) =>
      habitData.reduce((sum, val) => sum + habits[i].scoring(val), 0)
    );
  };

  // 전체 총점
  const calculateGrandTotal = (userId) => {
    const totalScores = calculateTotalScores(userId);
    return totalScores.reduce((a, b) => a + b, 0);
  };

  // 완료율 계산
  const calculateCompletionRate = (userId) => {
    if (!loaded || !usersData[userId]) return 0;
    
    const flatData = usersData[userId].flat();
    return flatData.filter(val => val > 0).length / flatData.length * 100;
  };
  
  // 모바일 화면에 최적화된 테이블 렌더링
  const renderWeekTable = (weekIndex) => {
    if (!loaded) return <div className="text-center py-4">로딩 중...</div>;
    
    const startDay = weekIndex * 14;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border px-1 py-1 w-1/4 bg-gray-50">습관</th>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="border px-1 py-1 bg-gray-50">{startDay + i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, habitIndex) => (
              <tr key={habitIndex}>
                <td className="border px-1 py-1 text-xs font-medium">{habit.label}</td>
                {[...Array(7)].map((_, i) => (
                  <td key={i} className="border p-0 text-center">
                    <select
                      value={usersData[activeUser][habitIndex][startDay + i] || 0}
                      onChange={(e) => updateValue(habitIndex, startDay + i, Number(e.target.value))}
                      className="w-full text-xs py-1 text-center appearance-none focus:outline-none focus:ring-0"
                      style={{
                        backgroundColor: usersData[activeUser][habitIndex][startDay + i] === 2 ? '#d1fae5' : 
                                         usersData[activeUser][habitIndex][startDay + i] === 1 ? '#eff6ff' : 'white'
                      }}
                    >
                      <option value={0}>-</option>
                      <option value={1}>△</option>
                      <option value={2}>○</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <table className="w-full text-xs border-collapse mt-1">
          <thead>
            <tr>
              <th className="border px-1 py-1 w-1/4 bg-gray-50">습관</th>
              {[...Array(7)].map((_, i) => (
                <th key={i+7} className="border px-1 py-1 bg-gray-50">{startDay + i + 8}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, habitIndex) => (
              <tr key={habitIndex}>
                <td className="border px-1 py-1 text-xs font-medium">{habit.label}</td>
                {[...Array(7)].map((_, i) => (
                  <td key={i+7} className="border p-0 text-center">
                    <select
                      value={usersData[activeUser][habitIndex][startDay + i + 7] || 0}
                      onChange={(e) => updateValue(habitIndex, startDay + i + 7, Number(e.target.value))}
                      className="w-full text-xs py-1 text-center appearance-none focus:outline-none focus:ring-0"
                      style={{
                        backgroundColor: usersData[activeUser][habitIndex][startDay + i + 7] === 2 ? '#d1fae5' : 
                                         usersData[activeUser][habitIndex][startDay + i + 7] === 1 ? '#eff6ff' : 'white'
                      }}
                    >
                      <option value={0}>-</option>
                      <option value={1}>△</option>
                      <option value={2}>○</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 사용자 순위 계산 및 정렬
  const calculateRankings = () => {
    if (!loaded) return [];
    
    const rankings = dummyUsers.map(user => ({
      ...user,
      totalScore: calculateGrandTotal(user.id),
      completionRate: calculateCompletionRate(user.id)
    }));
    
    return rankings.sort((a, b) => b.totalScore - a.totalScore);
  };

  return (
    <div className="p-2 pb-6 bg-white rounded shadow">
      <h1 className="text-lg font-bold text-center mb-2">자장격지 행동습관 점검표</h1>
      <p className="text-xs text-center text-gray-500 mb-2">56일(8주) 동안의 습관 형성을 통해 성공의 기반을 다집니다</p>
      
      {/* 사용자 선택 */}
      <div className="mb-4">
        <div className="flex flex-wrap justify-center gap-1 mb-2">
          {dummyUsers.map(user => (
            <button
              key={user.id}
              onClick={() => setActiveUser(user.id)}
              className={`px-2 py-1 text-xs rounded-full ${
                activeUser === user.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="mr-1">{user.avatar}</span>
              {user.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 주차 탭 메뉴 */}
      <div className="flex mb-2">
        {[...Array(4)].map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveWeek(i)}
            className={`flex-1 py-1 text-xs font-medium border-b-2 ${
              activeWeek === i 
                ? 'border-blue-500 text-blue-600' 
                : 'border-gray-200 text-gray-500'
            }`}
          >
            {i+1}주차
          </button>
        ))}
      </div>
      
      {/* 점수 요약 */}
      <div className="mb-3 p-2 bg-blue-50 rounded">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium">완료율:</span>
          <span className="text-xs font-bold">{loaded ? calculateCompletionRate(activeUser).toFixed(1) : '0'}%</span>
        </div>
        <div className="w-full bg-gray-200 h-1.5 rounded-full">
          <div 
            className="bg-blue-500 h-1.5 rounded-full"
            style={{ width: `${loaded ? calculateCompletionRate(activeUser) : 0}%` }}
          ></div>
        </div>
      </div>
      
      {/* 현재 주차 테이블 */}
      {renderWeekTable(activeWeek)}
      
      {/* 현재 주차 점수 */}
      {loaded && (
        <div className="mt-3 mb-3 p-2 bg-gray-50 rounded">
          <h3 className="text-xs font-medium mb-1">{activeWeek + 1}주차 점수</h3>
          <div className="grid grid-cols-5 gap-1">
            {habits.map((habit, i) => {
              const weekScores = calculateWeekScores(activeUser);
              return (
                <div key={i} className="text-center">
                  <div className="text-xs font-medium truncate" title={habit.label}>
                    {habit.label.substring(0, 4)}...
                  </div>
                  <div className="text-xs font-bold text-blue-600">
                    {weekScores[activeWeek] ? weekScores[activeWeek][i].toFixed(1) : '0'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 랭킹/순위표 */}
      <div className="mt-4">
        <h3 className="text-xs font-medium mb-1">우리 모두의 순위</h3>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1 bg-gray-50">순위</th>
              <th className="border px-2 py-1 bg-gray-50">사용자</th>
              <th className="border px-2 py-1 bg-gray-50">완료율</th>
              <th className="border px-2 py-1 bg-gray-50">총점</th>
            </tr>
          </thead>
          <tbody>
            {loaded && calculateRankings().map((user, index) => (
              <tr key={user.id} className={user.id === activeUser ? 'bg-blue-50' : ''}>
                <td className="border px-2 py-1 text-center">{index + 1}</td>
                <td className="border px-2 py-1">
                  <span className="mr-1">{user.avatar}</span>
                  {user.name}
                </td>
                <td className="border px-2 py-1 text-right">{user.completionRate.toFixed(1)}%</td>
                <td className="border px-2 py-1 text-right font-medium">{user.totalScore.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs">
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 bg-white border mr-1"></span>
          <span>미완료 (0점)</span>
        </span>
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-50 border mr-1"></span>
          <span>보통 (항목별 0.5~1점)</span>
        </span>
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 bg-green-100 border mr-1"></span>
          <span>완료 (항목별 1~5점)</span>
        </span>
      </div>
    </div>
  );
};

export default SharedHabitTracker;