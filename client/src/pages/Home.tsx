import React from 'react';
import UserSelector from '@/components/UserSelector';
import ProgressSummary from '@/components/ProgressSummary';
import WeekSelector from '@/components/WeekSelector';
import HabitTracker from '@/components/HabitTracker';
import WeekSummary from '@/components/WeekSummary';
import GrowthGraph from '@/components/GrowthGraph';
import TabNavigation from '@/components/TabNavigation';
import { useHabit } from '@/lib/HabitContext';

const Home: React.FC = () => {
  const { activeUser } = useHabit();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-2">
          <h1 className="text-lg font-bold text-center">자장격지 행동습관 점검표</h1>
          <p className="text-xs text-center text-gray-500">56일(8주) 동안의 습관 형성을 통해 성공의 기반을 다집니다</p>
        </div>
      </header>
      
      <main className="p-3">
        <UserSelector />
        <ProgressSummary />
        <WeekSelector />
        <HabitTracker />
        <WeekSummary />
        <GrowthGraph userId={activeUser} />
      </main>
      
      <TabNavigation />
    </div>
  );
};

export default Home;
