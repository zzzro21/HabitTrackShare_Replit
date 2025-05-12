import { 
  habits, 
  users, 
  habitEntries, 
  habitNotes,
  dailyFeedbacks,
  habitInsights,
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
  predefinedHabits
} from "@shared/schema";
import { db } from './db';
import { eq, and } from 'drizzle-orm';

// Storage interface with required CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Habit methods
  getHabit(id: number): Promise<Habit | undefined>;
  getAllHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  
  // Habit entry methods
  getHabitEntry(userId: number, habitId: number, day: number): Promise<HabitEntry | undefined>;
  getUserHabitEntries(userId: number): Promise<HabitEntry[]>;
  createOrUpdateHabitEntry(entry: InsertHabitEntry): Promise<HabitEntry>;
  
  // Habit note methods
  getHabitNote(userId: number, habitId: number, day: number): Promise<HabitNote | undefined>;
  getUserHabitNotes(userId: number, day: number): Promise<HabitNote[]>;
  createOrUpdateHabitNote(note: InsertHabitNote): Promise<HabitNote>;
  
  // Daily feedback methods
  getDailyFeedback(userId: number, day: number): Promise<DailyFeedback | undefined>;
  createOrUpdateDailyFeedback(feedback: InsertDailyFeedback): Promise<DailyFeedback>;
  
  // Habit insights methods
  getUserHabitInsight(userId: number): Promise<HabitInsight | undefined>;
  createOrUpdateHabitInsight(insight: InsertHabitInsight): Promise<HabitInsight>;
  
  // Initialize predefined data
  initializePredefinedData(): Promise<void>;
}

// MemStorage는 더 이상 사용하지 않습니다.
// 대신 DatabaseStorage를 사용하여 PostgreSQL에 데이터를 저장합니다.

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Habit methods
  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }

  async getAllHabits(): Promise<Habit[]> {
    return await db.select().from(habits);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await db
      .insert(habits)
      .values(insertHabit)
      .returning();
    return habit;
  }

  // Habit entry methods
  async getHabitEntry(userId: number, habitId: number, day: number): Promise<HabitEntry | undefined> {
    const [entry] = await db
      .select()
      .from(habitEntries)
      .where(
        and(
          eq(habitEntries.userId, userId),
          eq(habitEntries.habitId, habitId),
          eq(habitEntries.day, day)
        )
      );
    return entry;
  }

  async getUserHabitEntries(userId: number): Promise<HabitEntry[]> {
    return await db
      .select()
      .from(habitEntries)
      .where(eq(habitEntries.userId, userId));
  }

  async createOrUpdateHabitEntry(insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    // 기존 항목 찾기
    const existingEntry = await this.getHabitEntry(
      insertEntry.userId,
      insertEntry.habitId,
      insertEntry.day
    );
    
    if (existingEntry) {
      // 존재하면 업데이트
      const [updatedEntry] = await db
        .update(habitEntries)
        .set({ value: insertEntry.value })
        .where(eq(habitEntries.id, existingEntry.id))
        .returning();
      return updatedEntry;
    } else {
      // 없으면 새로 생성
      const [entry] = await db
        .insert(habitEntries)
        .values(insertEntry)
        .returning();
      return entry;
    }
  }

  // Habit note methods
  async getHabitNote(userId: number, habitId: number, day: number): Promise<HabitNote | undefined> {
    const [note] = await db
      .select()
      .from(habitNotes)
      .where(
        and(
          eq(habitNotes.userId, userId),
          eq(habitNotes.habitId, habitId),
          eq(habitNotes.day, day)
        )
      );
    return note;
  }

  async getUserHabitNotes(userId: number, day: number): Promise<HabitNote[]> {
    return await db
      .select()
      .from(habitNotes)
      .where(
        and(
          eq(habitNotes.userId, userId),
          eq(habitNotes.day, day)
        )
      );
  }

  async createOrUpdateHabitNote(insertNote: InsertHabitNote): Promise<HabitNote> {
    // 노트가 undefined가 아니게 함
    const noteContent = insertNote.note || '';
    const noteWithContent = { ...insertNote, note: noteContent };
    
    // 기존 노트 찾기
    const existingNote = await this.getHabitNote(
      insertNote.userId,
      insertNote.habitId,
      insertNote.day
    );
    
    if (existingNote) {
      // 존재하면 업데이트
      const [updatedNote] = await db
        .update(habitNotes)
        .set({ note: noteContent })
        .where(eq(habitNotes.id, existingNote.id))
        .returning();
      return updatedNote;
    } else {
      // 없으면 새로 생성
      const [note] = await db
        .insert(habitNotes)
        .values(noteWithContent)
        .returning();
      return note;
    }
  }
  
  // Daily feedback methods
  async getDailyFeedback(userId: number, day: number): Promise<DailyFeedback | undefined> {
    const [feedback] = await db
      .select()
      .from(dailyFeedbacks)
      .where(
        and(
          eq(dailyFeedbacks.userId, userId),
          eq(dailyFeedbacks.day, day)
        )
      );
    return feedback;
  }
  
  async createOrUpdateDailyFeedback(insertFeedback: InsertDailyFeedback): Promise<DailyFeedback> {
    // 피드백이 undefined가 아니게 함
    const feedbackContent = insertFeedback.feedback || '';
    const feedbackWithContent = { ...insertFeedback, feedback: feedbackContent };
    
    // 기존 피드백 찾기
    const existingFeedback = await this.getDailyFeedback(
      insertFeedback.userId,
      insertFeedback.day
    );
    
    if (existingFeedback) {
      // 존재하면 업데이트
      const [updatedFeedback] = await db
        .update(dailyFeedbacks)
        .set({ feedback: feedbackContent })
        .where(eq(dailyFeedbacks.id, existingFeedback.id))
        .returning();
      return updatedFeedback;
    } else {
      // 없으면 새로 생성
      const [feedback] = await db
        .insert(dailyFeedbacks)
        .values(feedbackWithContent)
        .returning();
      return feedback;
    }
  }
  
  // Habit insights methods
  async getUserHabitInsight(userId: number): Promise<HabitInsight | undefined> {
    // 가장 최근 인사이트 찾기
    const insights = await db
      .select()
      .from(habitInsights)
      .where(eq(habitInsights.userId, userId))
      .orderBy(habitInsights.date, "desc");
    
    return insights.length > 0 ? insights[0] : undefined;
  }
  
  async createOrUpdateHabitInsight(insertInsight: InsertHabitInsight): Promise<HabitInsight> {
    // date가 항상 Date 객체가 되도록 함
    const date = insertInsight.date || new Date();
    const insightWithDate = { ...insertInsight, date };
    
    // 기존 인사이트 확인 (가장 최근 것이 있다면)
    const recentInsight = await this.getUserHabitInsight(insertInsight.userId);
    
    // 항상 새 인사이트 생성 (시간에 따른 변화를 추적)
    const [insight] = await db
      .insert(habitInsights)
      .values(insightWithDate)
      .returning();
    
    return insight;
  }

  // Initialize predefined data
  async initializePredefinedData(): Promise<void> {
    try {
      // 기존 사용자가 있는지 확인
      const existingUsers = await this.getAllUsers();
      
      // 8명의 데모 사용자 생성 (아직 없다면)
      if (existingUsers.length === 0) {
        const defaultPassword = "password123"; // 실제 앱에서는 해시 처리
        
        for (let i = 1; i <= 8; i++) {
          await this.createUser({
            name: `사용자${i}`,
            avatar: i === 1 ? "👤" : 
                   i === 2 ? "👩" : 
                   i === 3 ? "👨" : 
                   i === 4 ? "👦" : 
                   i === 5 ? "👧" : 
                   i === 6 ? "👵" : 
                   i === 7 ? "👴" : "🧓",
            username: `user${i}`,
            password: defaultPassword
          });
        }
        
        console.log("8명의 데모 사용자가 생성되었습니다.");
      }
      
      // 기존 습관이 있는지 확인
      const existingHabits = await this.getAllHabits();
      
      // 미리 정의된 습관 생성 (아직 없다면) 
      if (existingHabits.length === 0) {
        for (const habit of predefinedHabits) {
          await this.createHabit({
            label: habit.label,
            scoreType: habit.scoreType,
            scoreValue: habit.scoreValue
          });
        }
        
        console.log("사전 정의된 습관이 생성되었습니다.");
      }
    } catch (error) {
      console.error("초기 데이터 설정 중 오류 발생:", error);
    }
  }
}

export const storage = new DatabaseStorage();
