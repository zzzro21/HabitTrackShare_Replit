import React, { useState } from 'react';
import UserSelector from '@/components/UserSelector';
import ProgressSummary from '@/components/ProgressSummary';
import WeekSelector from '@/components/WeekSelector';
import HabitTracker from '@/components/HabitTracker';
import WeekSummary from '@/components/WeekSummary';
import GrowthGraph from '@/components/GrowthGraph';
import TabNavigation from '@/components/TabNavigation';
import DashboardOverview from '@/components/DashboardOverview';
import { useHabit } from '@/lib/HabitContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, CheckSquare } from 'lucide-react';

const Home: React.FC = () => {
  const { activeUser } = useHabit();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-center">자장격지 행동습관 점검표</h1>
          <p className="text-xs text-center text-gray-500">56일(8주) 동안의 습관 형성을 통해 성공의 기반을 다집니다</p>
        </div>
      </header>
      
      <div className="px-4 pt-2">
        <UserSelector />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            대시보드
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            습관 체크
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="p-4 pt-2">
          <DashboardOverview />
        </TabsContent>
        
        <TabsContent value="habits" className="p-4 pt-2">
          <ProgressSummary />
          <WeekSelector />
          <HabitTracker />
          <WeekSummary />
          <GrowthGraph userId={activeUser} />
        </TabsContent>
      </Tabs>
      
      <TabNavigation />
    </div>
  );
};

export default Home;
