import React from 'react';
import { useHabit } from '@/lib/HabitContext';

const WeekSelector: React.FC = () => {
  const { activeWeek, setActiveWeek, isLoading } = useHabit();

  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="flex border rounded-lg overflow-hidden animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 py-2 bg-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div className="flex border rounded-lg overflow-hidden">
        {[...Array(4)].map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveWeek(index)}
            className={`flex-1 py-1 font-medium border-b-2 transition-colors ${
              activeWeek === index
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xs">{index*2 + 1}-{index*2 + 2}주차</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeekSelector;
