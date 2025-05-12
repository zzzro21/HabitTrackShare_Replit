import React from 'react';
import { useHabit } from '@/lib/HabitContext';
import { useAuth } from '@/hooks/useAuth';

const UserSelector: React.FC = () => {
  const { users, activeUser, isLoading } = useHabit();
  const { user: authUser } = useAuth();

  if (isLoading) {
    return (
      <div className="mb-3">
        <h2 className="text-sm font-medium text-gray-700 mb-1">현재 사용자</h2>
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
    <div className="mb-3">
      <h2 className="text-sm font-medium text-gray-700 mb-1">현재 사용자</h2>
      <div className="flex items-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-700">
        <span className="mr-1.5 text-xl">{currentUser.avatar}</span>
        <span className="font-medium">{currentUser.name}</span>
        <span className="ml-1.5 text-xs text-blue-500">({currentUser.username})</span>
      </div>
    </div>
  );
};

export default UserSelector;
