import React from 'react';
import UserSelector from '@/components/UserSelector';
import ProgressSummary from '@/components/ProgressSummary';
import WeekSelector from '@/components/WeekSelector';
import HabitTracker from '@/components/HabitTracker';
import WeekSummary from '@/components/WeekSummary';
import GrowthGraph from '@/components/GrowthGraph';
import AppLayout from '@/components/AppLayout';
import { useHabit } from '@/lib/HabitContext';

const Home: React.FC = () => {
  const { activeUser } = useHabit();

  return (
    <AppLayout 
      title="자장격지 행동습관 점검표"
      subtitle="56일(8주) 동안의 습관 형성을 통해 성공의 기반을 다집니다"
      showBackButton={true}
      onBackClick={() => window.location.href = '/'}
    >
      <UserSelector />
      <ProgressSummary />
      <WeekSelector />
      <HabitTracker />
      <WeekSummary />
      <GrowthGraph userId={activeUser} />
    </AppLayout>
  );
};

export default Home;
