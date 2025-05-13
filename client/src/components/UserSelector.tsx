import React from 'react';
import { useHabit } from '@/lib/HabitContext';

const UserSelector: React.FC = () => {
  const { users, activeUser, setActiveUser, isLoading } = useHabit();

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

  // 로그인한 사용자 정보 가져오기
  const currentUser = users.find(u => u.id === activeUser);

  if (!currentUser) {
    return (
      <div className="mb-3 px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
        로그인이 필요합니다
      </div>
    );
  }

  return (
    <div className="mb-2">
      <h2 className="text-xs md:text-sm font-medium text-gray-700 mb-0.5">사용자 선택</h2>
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
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSelector;
