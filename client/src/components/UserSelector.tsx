import React from 'react';
import { useHabit } from '@/lib/HabitContext';

const UserSelector: React.FC = () => {
  const { users, activeUser, setActiveUser, isLoading, currentUserId } = useHabit();

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

  // 사용자 목록이 비어 있는 경우 처리
  if (!users || users.length === 0) {
    return (
      <div className="mb-3 px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
        데이터를 불러오는 중입니다...
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
        {users.map(user => (
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
            {user.username}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSelector;
