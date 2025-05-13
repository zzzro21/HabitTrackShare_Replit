import { 
  habits, 
  users, 
  habitEntries, 
  habitNotes,
  dailyFeedbacks,
  habitInsights,
  userApiKeys,
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
import { db } from './db';
import { eq, and } from 'drizzle-orm';

// Storage interface with required CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: number, newPassword: string): Promise<boolean>;
  updateUsername(userId: number, newUsername: string): Promise<{ success: boolean; message: string }>;
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
  
  // User API keys methods
  getUserApiKey(userId: number): Promise<UserApiKey | undefined>;
  createOrUpdateUserApiKey(apiKey: InsertUserApiKey): Promise<UserApiKey>;
  
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
  
  async updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ password: newPassword })
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error("비밀번호 업데이트 오류:", error as Error);
      return false;
    }
  }
  
  async updateUsername(userId: number, newUsername: string): Promise<{ success: boolean; message: string }> {
    try {
      // 현재 사용자 정보 확인
      const user = await this.getUser(userId);
      if (!user) {
        return { success: false, message: "사용자를 찾을 수 없습니다." };
      }
      
      // 사용자 이름 변경 제한은 일단 비활성화
      // 데이터베이스 스키마가 업데이트되면 다시 활성화할 수 있음
      /*
      if (user.hasChangedUsername) {
        return { success: false, message: "이미 사용자 이름을 변경하셨습니다. 한 번만 변경할 수 있습니다." };
      }
      */
      
      // 새 사용자 이름이 이미 사용 중인지 확인
      const existingUser = await this.getUserByUsername(newUsername);
      if (existingUser) {
        return { success: false, message: "이미 사용 중인 사용자 이름입니다." };
      }
      
      // 사용자 이름 변경
      await db
        .update(users)
        .set({ 
          username: newUsername
        })
        .where(eq(users.id, userId));
      
      return { success: true, message: "사용자 이름이 성공적으로 변경되었습니다." };
    } catch (error) {
      console.error("사용자 이름 업데이트 오류:", error as Error);
      return { success: false, message: "사용자 이름 변경 중 오류가 발생했습니다." };
    }
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
      .where(eq(habitInsights.userId, userId));
    
    // 날짜 기준으로 정렬 (최신순)
    insights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
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
  
  // 사용자별 API 키 관리 메서드
  async getUserApiKey(userId: number): Promise<UserApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, userId));
      
    return apiKey;
  }
  
  async createOrUpdateUserApiKey(insertApiKey: InsertUserApiKey): Promise<UserApiKey> {
    // 기존 API 키 찾기
    const [existingApiKey] = await db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, insertApiKey.userId));
    
    if (existingApiKey) {
      // 기존 API 키가 있으면 업데이트
      const [updatedApiKey] = await db
        .update(userApiKeys)
        .set({
          ...insertApiKey,
          updatedAt: new Date()
        })
        .where(eq(userApiKeys.id, existingApiKey.id))
        .returning();
      
      return updatedApiKey;
    } else {
      // 없으면 새로 생성
      const [apiKey] = await db
        .insert(userApiKeys)
        .values({
          ...insertApiKey,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return apiKey;
    }
  }

  // Initialize predefined data
  async initializePredefinedData(): Promise<void> {
    try {
      // 기존 사용자가 있는지 확인
      const existingUsers = await this.getAllUsers();
      
      // 기존 사용자 목록
      const existingUsernames = existingUsers.map(user => user.username);
      
      // 8명의 사용자 정의 (사람 캐릭터 이모티콘으로 변경)
      const demoUsers = [
        { id: 1, name: '곽완신', avatar: '👨‍💼', username: 'user1', email: 'user1@example.com' },
        { id: 2, name: '유은옥', avatar: '👩‍💼', username: 'user2', email: 'user2@example.com' },
        { id: 3, name: '이경희', avatar: '👨‍🦱', username: 'user3', email: 'user3@example.com' },
        { id: 4, name: '임용녀', avatar: '👩‍🦰', username: 'user4', email: 'user4@example.com' },
        { id: 5, name: '박혜경', avatar: '👱‍♀️', username: 'user5', email: 'user5@example.com' },
        { id: 6, name: '김유나', avatar: '👩‍🦳', username: 'user6', email: 'user6@example.com' },
        { id: 7, name: '최지혜', avatar: '👩‍🦱', username: 'user7', email: 'user7@example.com' },
        { id: 8, name: '김미희', avatar: '👧', username: 'user8', email: 'user8@example.com' }
      ];
      
      // 누락된 사용자 생성
      const defaultPassword = "password123"; // 실제 앱에서는 해시 처리
      
      for (const demoUser of demoUsers) {
        if (!existingUsernames.includes(demoUser.username)) {
          // 새 사용자 생성
          await this.createUser({
            name: demoUser.name,
            avatar: demoUser.avatar,
            username: demoUser.username,
            password: defaultPassword,
            email: demoUser.email
          });
          console.log(`사용자 '${demoUser.name}'가 생성되었습니다.`);
        } else {
          // 기존 사용자 이름 업데이트
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.username, demoUser.username));
            
          if (existingUser) {
            // 이름이나 아바타가 변경되었을 때만 업데이트
            if (existingUser.name !== demoUser.name || existingUser.avatar !== demoUser.avatar) {
              await db
                .update(users)
                .set({ 
                  name: demoUser.name,
                  avatar: demoUser.avatar
                })
                .where(eq(users.username, demoUser.username));
              console.log(`사용자 '${demoUser.username}'(${demoUser.name})의 정보가 업데이트되었습니다. 아바타: ${demoUser.avatar}`);
            }
          }
        }
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
      
      // 데이터베이스에 저장된 사용자와 습관 수를 확인하고 출력
      const allUsers = await this.getAllUsers();
      const allHabits = await this.getAllHabits();
      
      console.log(`데이터베이스 초기화 완료: ${allUsers.length}명의 사용자와 ${allHabits.length}개의 습관이 설정되었습니다.`);
      
    } catch (error) {
      console.error("초기 데이터 설정 중 오류 발생:", error as Error);
    }
  }
}

export const storage = new DatabaseStorage();
