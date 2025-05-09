import React from 'react';
import { useHabit } from '@/lib/HabitContext';

const UserSelector: React.FC = () => {
  const { users, activeUser, setActiveUser, isLoading } = useHabit();

  if (isLoading) {
    return (
      <div className="mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-2">사용자 선택</h2>
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 animate-pulse rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h2 className="text-sm font-medium text-gray-700 mb-2">사용자 선택</h2>
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setActiveUser(user.id)}
            className={`flex items-center px-3 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors ${
              activeUser === user.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1 text-lg">{user.avatar}</span>
            <span>{user.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSelector;
