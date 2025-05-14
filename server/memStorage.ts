import { 
  type User, 
  type InsertUser, 
  type Habit, 
  type InsertHabit, 
  type HabitEntry, 
  type InsertHabitEntry,
  type HabitNote,
  type InsertHabitNote,
  type DailyFeedback,
  type InsertDailyFeedback,
  type HabitInsight,
  type InsertHabitInsight,
  type UserApiKey,
  type InsertUserApiKey,
  predefinedHabits
} from "@shared/schema";
import { IStorage } from "./storage";

// 인메모리 스토리지 클래스
export class MemStorage implements IStorage {
  private users: User[] = [];
  private habits: Habit[] = [];
  private habitEntries: HabitEntry[] = [];
  private habitNotes: HabitNote[] = [];
  private dailyFeedbacks: DailyFeedback[] = [];
  private habitInsights: HabitInsight[] = [];
  private userApiKeys: UserApiKey[] = [];
  private sequence = {
    users: 10, // 사용자 ID는 1부터 시작
    habits: 10, // 습관 ID는 1부터 시작
    habitEntries: 1,
    habitNotes: 1,
    habitInsights: 1,
    userApiKeys: 1
  };

  constructor() {
    // 샘플 데이터 초기화
    this.initializePredefinedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.sequence.users++,
      password: insertUser.password || '',
      email: insertUser.email || 'user@example.com',
    };
    this.users.push(user);
    return user;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    
    user.password = newPassword;
    user.updatedAt = new Date();
    return true;
  }

  async updateUsername(userId: number, newUsername: string): Promise<{ success: boolean; message: string }> {
    const existingUser = this.users.find(u => u.username === newUsername);
    if (existingUser) {
      return { success: false, message: "이미 사용 중인 사용자 이름입니다." };
    }

    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: "사용자를 찾을 수 없습니다." };
    }

    user.username = newUsername;
    user.updatedAt = new Date();
    return { success: true, message: "사용자 이름이 성공적으로 변경되었습니다." };
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  // Habit methods
  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.find(habit => habit.id === id);
  }

  async getAllHabits(): Promise<Habit[]> {
    return this.habits;
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const habit: Habit = {
      ...insertHabit,
      id: this.sequence.habits++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.habits.push(habit);
    return habit;
  }

  // Habit entry methods
  async getHabitEntry(userId: number, habitId: number, day: number): Promise<HabitEntry | undefined> {
    return this.habitEntries.find(entry => 
      entry.userId === userId && entry.habitId === habitId && entry.day === day
    );
  }

  async getUserHabitEntries(userId: number): Promise<HabitEntry[]> {
    return this.habitEntries.filter(entry => entry.userId === userId);
  }

  async createOrUpdateHabitEntry(insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    const existingEntry = await this.getHabitEntry(
      insertEntry.userId, 
      insertEntry.habitId, 
      insertEntry.day
    );

    if (existingEntry) {
      existingEntry.value = insertEntry.value;
      existingEntry.updatedAt = new Date();
      return existingEntry;
    }

    const newEntry: HabitEntry = {
      ...insertEntry,
      id: this.sequence.habitEntries++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.habitEntries.push(newEntry);
    return newEntry;
  }

  // Habit note methods
  async getHabitNote(userId: number, habitId: number, day: number): Promise<HabitNote | undefined> {
    return this.habitNotes.find(note => 
      note.userId === userId && note.habitId === habitId && note.day === day
    );
  }

  async getUserHabitNotes(userId: number, day: number): Promise<HabitNote[]> {
    return this.habitNotes.filter(note => note.userId === userId && note.day === day);
  }

  async createOrUpdateHabitNote(insertNote: InsertHabitNote): Promise<HabitNote> {
    const existingNote = await this.getHabitNote(
      insertNote.userId, 
      insertNote.habitId, 
      insertNote.day
    );

    if (existingNote) {
      existingNote.note = insertNote.note;
      existingNote.updatedAt = new Date();
      return existingNote;
    }

    const newNote: HabitNote = {
      ...insertNote,
      id: this.sequence.habitNotes++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.habitNotes.push(newNote);
    return newNote;
  }

  // Daily feedback methods
  async getDailyFeedback(userId: number, day: number): Promise<DailyFeedback | undefined> {
    return this.dailyFeedbacks.find(feedback => 
      feedback.userId === userId && feedback.day === day
    );
  }

  async createOrUpdateDailyFeedback(insertFeedback: InsertDailyFeedback): Promise<DailyFeedback> {
    const existingFeedback = await this.getDailyFeedback(
      insertFeedback.userId, 
      insertFeedback.day
    );

    if (existingFeedback) {
      existingFeedback.feedback = insertFeedback.feedback;
      existingFeedback.updatedAt = new Date();
      return existingFeedback;
    }

    const newFeedback: DailyFeedback = {
      ...insertFeedback,
      id: this.sequence.habitNotes++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.dailyFeedbacks.push(newFeedback);
    return newFeedback;
  }

  // Habit insights methods
  async getUserHabitInsight(userId: number): Promise<HabitInsight | undefined> {
    return this.habitInsights.find(insight => insight.userId === userId);
  }

  async createOrUpdateHabitInsight(insertInsight: InsertHabitInsight): Promise<HabitInsight> {
    const existingInsight = await this.getUserHabitInsight(insertInsight.userId);

    if (existingInsight) {
      existingInsight.summary = insertInsight.summary;
      existingInsight.strengths = insertInsight.strengths;
      existingInsight.improvementAreas = insertInsight.improvementAreas;
      existingInsight.recommendations = insertInsight.recommendations;
      existingInsight.date = new Date();
      existingInsight.updatedAt = new Date();
      return existingInsight;
    }

    const newInsight: HabitInsight = {
      ...insertInsight,
      id: this.sequence.habitInsights++,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.habitInsights.push(newInsight);
    return newInsight;
  }

  // User API keys methods
  async getUserApiKey(userId: number): Promise<UserApiKey | undefined> {
    return this.userApiKeys.find(apiKey => apiKey.userId === userId);
  }

  async createOrUpdateUserApiKey(insertApiKey: InsertUserApiKey): Promise<UserApiKey> {
    const existingApiKey = await this.getUserApiKey(insertApiKey.userId);

    if (existingApiKey) {
      if (insertApiKey.geminiApiKey !== undefined) {
        existingApiKey.geminiApiKey = insertApiKey.geminiApiKey;
      }
      if (insertApiKey.notionToken !== undefined) {
        existingApiKey.notionToken = insertApiKey.notionToken;
      }
      if (insertApiKey.notionDbId !== undefined) {
        existingApiKey.notionDbId = insertApiKey.notionDbId;
      }
      existingApiKey.updatedAt = new Date();
      return existingApiKey;
    }

    const newApiKey: UserApiKey = {
      ...insertApiKey,
      id: this.sequence.userApiKeys++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.userApiKeys.push(newApiKey);
    return newApiKey;
  }

  // 초기 데이터 설정
  async initializePredefinedData(): Promise<void> {
    console.log("인메모리 스토리지 초기화 중...");
    
    // 기존 데이터가 있는지 확인
    if (this.users.length > 0 || this.habits.length > 0) {
      console.log("이미 데이터가 초기화되어 있습니다.");
      return;
    }

    // 샘플 사용자 추가 (곽완신, 유은옥, 이경희, 임용녀, 박혜경, 김유나, 최지혜, 김미희)
    // ID는 10~17로 설정 (클라이언트와 서버 ID 통일)
    const sampleUsers: InsertUser[] = [
      { 
        id: 10, 
        name: "곽완신", 
        username: "gwak", 
        password: "password123", 
        email: "gwak@example.com", 
        avatar: "👨🏻" 
      },
      { 
        id: 11, 
        name: "유은옥", 
        username: "yoo", 
        password: "password123", 
        email: "yoo@example.com", 
        avatar: "👩🏻" 
      },
      { 
        id: 12, 
        name: "이경희", 
        username: "lee", 
        password: "password123", 
        email: "lee@example.com", 
        avatar: "👩🏻" 
      },
      { 
        id: 13, 
        name: "임용녀", 
        username: "lim", 
        password: "password123", 
        email: "lim@example.com", 
        avatar: "👩🏻" 
      },
      { 
        id: 14, 
        name: "박혜경", 
        username: "park", 
        password: "password123", 
        email: "park@example.com", 
        avatar: "👩🏻" 
      },
      { 
        id: 15, 
        name: "김유나", 
        username: "kim", 
        password: "password123", 
        email: "kim@example.com", 
        avatar: "👧🏻" 
      },
      { 
        id: 16, 
        name: "최지혜", 
        username: "choi", 
        password: "password123", 
        email: "choi@example.com", 
        avatar: "👩🏻" 
      },
      { 
        id: 17, 
        name: "김미희", 
        username: "mihi", 
        password: "password123", 
        email: "mihi@example.com", 
        avatar: "👩🏻" 
      }
    ];

    for (const userData of sampleUsers) {
      await this.createUser(userData);
    }

    // 사전 정의된 습관 추가
    for (const habitData of predefinedHabits) {
      await this.createHabit(habitData);
    }

    // 샘플 습관 항목 생성 (사용자 ID 10~17, 습관 ID 10~14 사용)
    for (let userId = 10; userId <= 17; userId++) {
      for (let habitId = 10; habitId <= 14; habitId++) {
        for (let day = 0; day < 56; day++) {
          // 랜덤 값 (0: 미완료, 1: 부분 완료, 2: 완료)
          const value = Math.floor(Math.random() * 3);
          
          if (Math.random() > 0.3) { // 70%의 확률로 데이터 생성
            await this.createOrUpdateHabitEntry({
              userId,
              habitId,
              day,
              value
            });
          }
        }
      }
    }

    // 기본 API 키 추가 (김유나 사용자에게만 Gemini API 키 설정, ID는 15)
    await this.createOrUpdateUserApiKey({
      userId: 15,
      geminiApiKey: process.env.GEMINI_API_KEY || "",
      notionToken: "",
      notionDbId: ""
    });

    console.log("인메모리 스토리지 초기화 완료!");
  }
}

// 인메모리 스토리지 인스턴스 생성
export const memStorage = new MemStorage();