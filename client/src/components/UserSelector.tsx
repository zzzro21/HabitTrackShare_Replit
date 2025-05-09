import React from 'react';
import { useHabit } from '@/lib/HabitContext';

const UserSelector: React.FC = () => {
  const { users, activeUser, setActiveUser, isLoading } = useHabit();

  if (isLoading) {
    return (
      <div className="mb-3">
        <h2 className="text-sm font-medium text-gray-700 mb-1">사용자 선택</h2>
        <div className="flex flex-wrap gap-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-7 w-16 bg-gray-200 animate-pulse rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <h2 className="text-sm font-medium text-gray-700 mb-1">사용자 선택</h2>
      <div className="flex flex-wrap gap-1.5">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setActiveUser(user.id)}
            className={`flex items-center px-2 py-0.5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-50 transition-colors ${
              activeUser === user.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-0.5 text-sm">{user.avatar}</span>
            <span className="truncate max-w-[3.5rem]">{user.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSelector;
