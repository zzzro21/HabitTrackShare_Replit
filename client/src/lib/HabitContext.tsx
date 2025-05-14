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
  currentUserId: number | null; // 현재 로그인한 사용자 ID
  setActiveUser: (userId: number) => void;
  setActiveWeek: (week: number) => void;
  updateHabitEntry: (habitId: number, day: number, value: number) => Promise<void>;
  updateDailyFeedback: (userId: number, day: number, feedback: string) => Promise<void>;
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
  canModifyUserData: (userId: number) => boolean;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [habits, setHabits] = useState<HabitWithScoring[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [activeUser, setActiveUser] = useState<number>(1);
  const [activeWeek, setActiveWeek] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load users, habits, and get user from noauth
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users first to get valid user IDs
        const usersResponse = await fetch('/api/users');
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
        // 유효한 사용자 ID 목록 추출 (10부터 17까지)
        const validUserIds = usersData.map((u: User) => u.id);
        
        // 로컬 스토리지/noauth에서 사용자 정보 가져오기
        let localUser;
        try {
          // noauth 모듈에서 현재 사용자 가져오기
          const { getCurrentUser } = await import('../noauth');
          localUser = getCurrentUser();
          
          if (localUser && localUser.id) {
            // 서버의 유효한 사용자 ID인지 확인
            if (validUserIds.includes(localUser.id)) {
              console.log('사용자 정보 로드:', localUser.name);
              setCurrentUserId(localUser.id);
              setActiveUser(localUser.id);
            } else {
              console.warn('로컬 스토리지에 저장된 사용자 ID가 유효하지 않습니다:', localUser.id);
              localUser = null; // 유효하지 않은 ID는 무시하고 기본값 사용
              localStorage.removeItem('user-auth-storage'); // 잘못된 정보 삭제
            }
          }
        } catch (e) {
          console.error('사용자 정보 액세스 오류:', e);
        }
        
        // Set user if not set from local storage or if local user is invalid
        if (!localUser && usersData.length > 0) {
          // 기본 사용자로 김유나 (ID: 15) 사용
          const defaultUser = usersData.find((u: User) => u.id === 15) || usersData[0];
          console.log('기본 사용자로 설정:', defaultUser.name, defaultUser.id);
          setActiveUser(defaultUser.id);
          setCurrentUserId(defaultUser.id);
          
          // noauth 설정 업데이트
          const { setupNoAuth } = await import('../noauth');
          setupNoAuth();
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
        
        // 활성 사용자의 기록 가져오기
        const activeUserId = localUser?.id || (usersData.find((u: User) => u.id === 15)?.id || usersData[0].id);
        console.log('활성 사용자의 기록 가져오기:', activeUserId);
        await fetchEntriesForUser(activeUserId);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
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
      
      // 모든 사용자 데이터에 접근 가능 - 인증 우회
      const entriesResponse = await fetch(`/api/users/${userId}/entries`);
      
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setHabitEntries(entriesData);
      } else {
        console.info('데이터 로드 오류: 서버에서 사용자 데이터를 가져올 수 없습니다.');
        setHabitEntries([]);
      }
    } catch (error) {
      console.error(`사용자 ${userId}의 데이터 로드 오류:`, error);
      setHabitEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateHabitEntry = async (habitId: number, day: number, value: number) => {
    try {
      // 현재 선택된 사용자 ID 사용 (로그인 필요 없음)
      if (!currentUserId) {
        console.info('사용자가 선택되지 않았습니다');
        return;
      }
      
      console.log(`습관 항목 업데이트 시도: userId=${currentUserId}, habitId=${habitId}, day=${day}, value=${value}`);
      
      // 서버 측 habitId는 10부터 시작하지만 클라이언트에서는 1부터 시작할 수 있음
      // 따라서 실제 서버 ID로 변환 필요 (1->10, 2->11, 3->12, 4->13, 5->14)
      const serverHabitId = habitId < 10 ? habitId + 9 : habitId;
      
      const requestData = {
        userId: currentUserId,
        habitId: serverHabitId, // 서버 ID로 변환
        day,
        value
      };
      
      console.log('요청 데이터:', requestData);
      
      const response = await apiRequest<HabitEntry>('POST', '/api/entries', requestData);
      
      console.log('서버 응답:', response);
      
      // Update local state with the new entry
      setHabitEntries(prev => {
        const existingIndex = prev.findIndex(
          entry => entry.userId === currentUserId && entry.habitId === habitId && entry.day === day
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
      const err = error as any;
      if (err?.response?.status === 401) {
        console.info('로그인이 필요합니다');
      } else if (err?.response?.status === 403) {
        console.info('다른 사용자의 데이터를 수정할 권한이 없습니다');
      } else {
        console.error('습관 항목 업데이트 오류:', error);
        // 자세한 오류 정보 출력
        if (error instanceof Error) {
          console.error('오류 메시지:', error.message);
          console.error('오류 스택:', error.stack);
        } else {
          console.error('알 수 없는 오류 형식:', error);
        }
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
  
  // 사용자 데이터를 수정할 수 있는지 확인 (자신의 데이터만)
  const canModifyUserData = (userId: number): boolean => {
    return currentUserId === userId;
  };
  
  // 데일리 피드백 업데이트 (친구에게도 작성 가능)
  const updateDailyFeedback = async (userId: number, day: number, feedback: string) => {
    try {
      // 인증 필요 없음
      const response = await apiRequest('POST', '/api/feedback', {
        userId,
        day,
        feedback
      });
      
      return response;
    } catch (error) {
      console.error('피드백 업데이트 오류:', error);
    }
  };

  return (
    <HabitContext.Provider
      value={{
        users,
        habits,
        habitEntries,
        activeUser,
        activeWeek,
        currentUserId,
        setActiveUser,
        setActiveWeek,
        updateHabitEntry,
        updateDailyFeedback,
        isLoading,
        calculateCompletionRate,
        calculateWeekScores,
        calculateTotalScores,
        calculateGrandTotal,
        calculateCompletedHabits,
        calculateUserRank,
        getRankings,
        canModifyUserData
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
