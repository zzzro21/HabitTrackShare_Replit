import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from './queryClient';

type User = {
  id: number;
  name: string;
  avatar: string;
  username: string;
};

type Habit = {
  id: number;
  label: string;
  scoreType: string;
  scoreValue: number;
};

type HabitEntry = {
  id: number;
  userId: number;
  habitId: number;
  day: number;
  value: number;
};

// Extended habit type with scoring function for frontend use
type HabitWithScoring = Habit & {
  scoring: (value: number) => number;
};

const scoringFunctions = {
  "binary": (value: number, scoreValue: number) => value > 0 ? scoreValue : 0,
  "partial": (value: number, scoreValue: number) => value === 2 ? scoreValue : value === 1 ? scoreValue / 2 : 0,
  "high_value": (value: number, scoreValue: number) => value === 2 ? scoreValue : value === 1 ? scoreValue / 2 : 0,
};

interface HabitContextType {
  users: User[];
  habits: HabitWithScoring[];
  habitEntries: HabitEntry[];
  activeUser: number;
  activeWeek: number;
  setActiveUser: (userId: number) => void;
  setActiveWeek: (week: number) => void;
  updateHabitEntry: (habitId: number, day: number, value: number) => Promise<void>;
  isLoading: boolean;
  calculateCompletionRate: (userId: number) => number;
  calculateWeekScores: (userId: number, week: number) => number[];
  calculateTotalScores: (userId: number) => number[];
  calculateGrandTotal: (userId: number) => number;
  calculateCompletedHabits: (userId: number) => number;
  calculateUserRank: (userId: number) => number;
  getRankings: () => {
    id: number;
    name: string;
    avatar: string;
    totalScore: number;
    completionRate: number;
  }[];
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [habits, setHabits] = useState<HabitWithScoring[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [activeUser, setActiveUser] = useState<number>(1);
  const [activeWeek, setActiveWeek] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load users, habits, and auth status on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch auth status first to know who's logged in
        const authResponse = await fetch('/api/auth/status');
        const authData = await authResponse.json();
        
        // Fetch users
        const usersResponse = await fetch('/api/users');
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
        // Set active user to the logged in user
        if (authData.isAuthenticated && authData.user) {
          setActiveUser(authData.user.id);
        } else if (usersData.length > 0 && activeUser === 0) {
          // Fallback if not authenticated (this might not work due to auth requirements)
          setActiveUser(usersData[0].id);
        }
        
        // Fetch habits
        const habitsResponse = await fetch('/api/habits');
        const habitsData = await habitsResponse.json();
        
        // Add scoring functions to habits
        const habitsWithScoring = habitsData.map((habit: Habit) => ({
          ...habit,
          scoring: (value: number) => scoringFunctions[habit.scoreType as keyof typeof scoringFunctions](value, habit.scoreValue)
        }));
        
        setHabits(habitsWithScoring);
        
        // Fetch entries for active user (will only work if authenticated)
        if (authData.isAuthenticated && authData.user) {
          await fetchEntriesForUser(authData.user.id);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Fetch entries when active user changes - Note: With authentication,
  // this will only work for the authenticated user
  useEffect(() => {
    if (activeUser) {
      fetchEntriesForUser(activeUser);
    }
  }, [activeUser]);

  const fetchEntriesForUser = async (userId: number) => {
    try {
      setIsLoading(true);
      
      // 인증 상태 확인
      const authResponse = await fetch('/api/auth/status');
      const authData = await authResponse.json();
      
      if (authData.isAuthenticated && authData.user) {
        // 자신의 데이터는 접근 가능
        const entriesResponse = await fetch(`/api/users/${authData.user.id}/entries`);
        
        if (entriesResponse.ok) {
          const entriesData = await entriesResponse.json();
          setHabitEntries(entriesData);
        } else {
          console.info('자신의 데이터만 볼 수 있습니다.');
          // 다른 사용자의 데이터는 볼 수 없지만, UI 선택은 가능하게 함
          setHabitEntries([]);
        }
      } else {
        console.info('로그인이 필요합니다.');
        setHabitEntries([]);
      }
    } catch (error) {
      console.error(`Error fetching entries for user ${userId}:`, error);
      setHabitEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateHabitEntry = async (habitId: number, day: number, value: number) => {
    try {
      // 인증 상태 확인
      const authResponse = await fetch('/api/auth/status');
      const authData = await authResponse.json();
      
      if (!authData.isAuthenticated) {
        console.info('로그인이 필요합니다');
        return;
      }
      
      // 로그인한 사용자 ID 사용 (activeUser가 아님)
      const loggedInUserId = authData.user.id;
      
      const response = await apiRequest<HabitEntry>('POST', '/api/entries', {
        userId: loggedInUserId,
        habitId,
        day,
        value
      });
      
      // Update local state with the new entry
      setHabitEntries(prev => {
        const existingIndex = prev.findIndex(
          entry => entry.userId === loggedInUserId && entry.habitId === habitId && entry.day === day
        );
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = response;
          return updated;
        } else {
          return [...prev, response];
        }
      });
    } catch (error) {
      const err = error as { response?: { status: number } };
      if (err?.response?.status === 401) {
        console.info('로그인이 필요합니다');
      } else if (err?.response?.status === 403) {
        console.info('다른 사용자의 데이터를 수정할 권한이 없습니다');
      } else {
        console.error('Error updating habit entry:', error);
      }
    }
  };

  // Calculate the completion rate for a user (percentage of habits completed)
  const calculateCompletionRate = (userId: number): number => {
    const userEntries = habitEntries.filter(entry => entry.userId === userId);
    if (userEntries.length === 0) return 0;
    
    // Count entries with value > 0 (partial or complete)
    const completedEntries = userEntries.filter(entry => entry.value > 0).length;
    
    // Total possible entries
    const totalPossibleEntries = habits.length * 56; // 5 habits * 56 days
    
    return (completedEntries / totalPossibleEntries) * 100;
  };

  // Calculate scores for a specific week for a user
  const calculateWeekScores = (userId: number, week: number): number[] => {
    if (habits.length === 0) return [];
    
    return habits.map(habit => {
      // Calculate start and end day for the week
      const startDay = week * 14;
      const endDay = startDay + 13;
      
      // Get entries for this habit and this week
      const entries = habitEntries.filter(
        entry => 
          entry.userId === userId && 
          entry.habitId === habit.id && 
          entry.day >= startDay && 
          entry.day <= endDay
      );
      
      // Sum the scores for each entry
      return entries.reduce((total, entry) => total + habit.scoring(entry.value), 0);
    });
  };

  // Calculate total scores across all weeks for each habit
  const calculateTotalScores = (userId: number): number[] => {
    if (habits.length === 0) return [];
    
    return habits.map(habit => {
      const entries = habitEntries.filter(
        entry => entry.userId === userId && entry.habitId === habit.id
      );
      
      return entries.reduce((total, entry) => total + habit.scoring(entry.value), 0);
    });
  };

  // Calculate grand total score for a user
  const calculateGrandTotal = (userId: number): number => {
    const totalScores = calculateTotalScores(userId);
    return totalScores.reduce((sum, score) => sum + score, 0);
  };
  
  // Calculate the number of completed habits (entries with value > 0)
  const calculateCompletedHabits = (userId: number): number => {
    return habitEntries.filter(entry => entry.userId === userId && entry.value > 0).length;
  };
  
  // Calculate a user's rank based on total score
  const calculateUserRank = (userId: number): number => {
    const rankings = getRankings();
    const userRank = rankings.findIndex(user => user.id === userId);
    return userRank !== -1 ? userRank + 1 : users.length;
  };
  
  // Get all users ranked by total score
  const getRankings = () => {
    return users
      .map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        totalScore: calculateGrandTotal(user.id),
        completionRate: calculateCompletionRate(user.id)
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  return (
    <HabitContext.Provider
      value={{
        users,
        habits,
        habitEntries,
        activeUser,
        activeWeek,
        setActiveUser,
        setActiveWeek,
        updateHabitEntry,
        isLoading,
        calculateCompletionRate,
        calculateWeekScores,
        calculateTotalScores,
        calculateGrandTotal,
        calculateCompletedHabits,
        calculateUserRank,
        getRankings
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabit must be used within a HabitProvider');
  }
  return context;
};
