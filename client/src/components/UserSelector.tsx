import React from 'react';
import { useHabit } from '@/lib/HabitContext';

// 사용자 타입 정의
interface FixedUser {
  id: number;
  name: string;
  avatar: string;
}

const UserSelector: React.FC = () => {
  const { activeUser, setActiveUser, isLoading, currentUserId } = useHabit();

  // 8명의 사용자를 하드코딩 (곽완신, 유은옥, 이경희, 임용녀, 박혜경, 김유나, 최지혜, 김미희)
  const fixedUsers: FixedUser[] = [
    { id: 1, name: "곽완신", avatar: "👨🏻" },
    { id: 2, name: "유은옥", avatar: "👩🏻" },
    { id: 3, name: "이경희", avatar: "👩🏻" },
    { id: 4, name: "임용녀", avatar: "👩🏻" },
    { id: 5, name: "박혜경", avatar: "👩🏻" },
    { id: 6, name: "김유나", avatar: "👧🏻" },
    { id: 7, name: "최지혜", avatar: "👩🏻" },
    { id: 8, name: "김미희", avatar: "👩🏻" },
  ];

  if (isLoading) {
    return (
      <div className="mb-2">
        <h2 className="text-sm font-medium text-gray-700 mb-0.5">현재 사용자</h2>
        <div className="flex flex-wrap gap-1">
          <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
      </div>
    );
  }

  // 자동 로그인 강제 설정 (로컬 스토리지 확인)
  if (!currentUserId && typeof window !== 'undefined') {
    try {
      const { setupNoAuth } = require('../noauth');
      setupNoAuth();
      // 페이지 새로고침
      window.location.reload();
    } catch (e) {
      console.error('자동 로그인 설정 실패:', e);
    }
  }

  return (
    <div className="mb-1">
      <h2 className="text-xs font-medium text-gray-700 mb-0.5">사용자 선택</h2>
      <div className="flex flex-wrap gap-1">
        {fixedUsers.map(user => (
          <button
            key={user.id}
            onClick={() => setActiveUser(user.id)}
            className={`flex items-center px-1.5 py-0.5 rounded-full text-[10px] md:text-xs border transition-colors ${
              user.id === activeUser
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{user.avatar}</span>
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSelector;
