import { 
  habits, 
  users, 
  habitEntries, 
  habitNotes,
  dailyFeedbacks,
  habitInsights,
  inviteCodes,
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
  type InviteCode,
  type InsertInviteCode,
  predefinedHabits
} from "@shared/schema";

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
  
  // Invite code methods
  createInviteCode(code: InsertInviteCode): Promise<InviteCode>;
  getInviteCodeByCode(code: string): Promise<InviteCode | undefined>;
  useInviteCode(code: string, userId: number): Promise<boolean>;
  getUserInviteCodes(userId: number): Promise<InviteCode[]>;
  
  // Initialize predefined data
  initializePredefinedData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private habitEntries: HabitEntry[];
  private habitNotes: HabitNote[];
  private userIdCounter: number;
  private habitIdCounter: number;
  private habitEntryIdCounter: number;
  private habitNoteIdCounter: number;

  private dailyFeedbacks: DailyFeedback[];
  private dailyFeedbackIdCounter: number;
  
  private habitInsights: Map<number, HabitInsight>;
  private habitInsightIdCounter: number;

  private inviteCodes: InviteCode[];
  private inviteCodeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitEntries = [];
    this.habitNotes = [];
    this.dailyFeedbacks = [];
    this.habitInsights = new Map();
    this.inviteCodes = [];
    this.userIdCounter = 1;
    this.habitIdCounter = 1;
    this.habitEntryIdCounter = 1;
    this.habitNoteIdCounter = 1;
    this.dailyFeedbackIdCounter = 1;
    this.habitInsightIdCounter = 1;
    this.inviteCodeIdCounter = 1;
    
    // Skip data initialization in constructor - we'll do this after server starts
    // This allows the server to start and listen quickly
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Ensure googleApiKey is never undefined
    const user: User = { 
      ...insertUser, 
      id,
      googleApiKey: insertUser.googleApiKey ?? null 
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Habit methods
  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async getAllHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.habitIdCounter++;
    const habit: Habit = { ...insertHabit, id };
    this.habits.set(id, habit);
    return habit;
  }

  // Habit entry methods
  async getHabitEntry(userId: number, habitId: number, day: number): Promise<HabitEntry | undefined> {
    return this.habitEntries.find(
      (entry) => entry.userId === userId && entry.habitId === habitId && entry.day === day
    );
  }

  async getUserHabitEntries(userId: number): Promise<HabitEntry[]> {
    return this.habitEntries.filter((entry) => entry.userId === userId);
  }

  async createOrUpdateHabitEntry(insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    // Check if entry exists already
    const existingEntryIndex = this.habitEntries.findIndex(
      (entry) => 
        entry.userId === insertEntry.userId && 
        entry.habitId === insertEntry.habitId && 
        entry.day === insertEntry.day
    );

    if (existingEntryIndex !== -1) {
      // Update existing entry
      this.habitEntries[existingEntryIndex].value = insertEntry.value;
      return this.habitEntries[existingEntryIndex];
    } else {
      // Create new entry
      const id = this.habitEntryIdCounter++;
      const entry: HabitEntry = { ...insertEntry, id };
      this.habitEntries.push(entry);
      return entry;
    }
  }

  // Habit note methods
  async getHabitNote(userId: number, habitId: number, day: number): Promise<HabitNote | undefined> {
    return this.habitNotes.find(
      (note) => note.userId === userId && note.habitId === habitId && note.day === day
    );
  }

  async getUserHabitNotes(userId: number, day: number): Promise<HabitNote[]> {
    return this.habitNotes.filter(
      (note) => note.userId === userId && note.day === day
    );
  }

  async createOrUpdateHabitNote(insertNote: InsertHabitNote): Promise<HabitNote> {
    // Make sure note is never undefined
    const noteContent = insertNote.note || '';
    
    // Check if note exists already
    const existingNoteIndex = this.habitNotes.findIndex(
      (note) => 
        note.userId === insertNote.userId && 
        note.habitId === insertNote.habitId && 
        note.day === insertNote.day
    );

    if (existingNoteIndex !== -1) {
      // Update existing note
      this.habitNotes[existingNoteIndex].note = noteContent;
      return this.habitNotes[existingNoteIndex];
    } else {
      // Create new note
      const id = this.habitNoteIdCounter++;
      const note: HabitNote = { 
        ...insertNote, 
        id,
        note: noteContent
      };
      this.habitNotes.push(note);
      return note;
    }
  }
  
  // Daily feedback methods
  async getDailyFeedback(userId: number, day: number): Promise<DailyFeedback | undefined> {
    return this.dailyFeedbacks.find(
      (feedback) => feedback.userId === userId && feedback.day === day
    );
  }
  
  async createOrUpdateDailyFeedback(insertFeedback: InsertDailyFeedback): Promise<DailyFeedback> {
    // Make sure feedback is never undefined
    const feedbackContent = insertFeedback.feedback || '';
    
    // Check if feedback exists already
    const existingFeedbackIndex = this.dailyFeedbacks.findIndex(
      (feedback) => 
        feedback.userId === insertFeedback.userId && 
        feedback.day === insertFeedback.day
    );
    
    if (existingFeedbackIndex !== -1) {
      // Update existing feedback
      this.dailyFeedbacks[existingFeedbackIndex].feedback = feedbackContent;
      return this.dailyFeedbacks[existingFeedbackIndex];
    } else {
      // Create new feedback
      const id = this.dailyFeedbackIdCounter++;
      const feedback: DailyFeedback = { 
        ...insertFeedback, 
        id,
        feedback: feedbackContent
      };
      this.dailyFeedbacks.push(feedback);
      return feedback;
    }
  }
  
  // Habit insights methods
  async getUserHabitInsight(userId: number): Promise<HabitInsight | undefined> {
    // Find the most recent insight for this user
    const insights = Array.from(this.habitInsights.values())
      .filter(insight => insight.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return insights.length > 0 ? insights[0] : undefined;
  }
  
  async createOrUpdateHabitInsight(insertInsight: InsertHabitInsight): Promise<HabitInsight> {
    const id = this.habitInsightIdCounter++;
    
    // Ensure date is always a Date object
    const date = insertInsight.date || new Date();
    
    const insight: HabitInsight = {
      ...insertInsight,
      id,
      date
    };
    
    // Store by ID, not by user ID (to allow multiple insights per user over time)
    this.habitInsights.set(id, insight);
    return insight;
  }

  // Invite code methods
  async createInviteCode(insertCode: InsertInviteCode): Promise<InviteCode> {
    const id = this.inviteCodeIdCounter++;
    
    const inviteCode: InviteCode = {
      ...insertCode,
      id,
      isUsed: false,
      usedBy: null,
      createdAt: new Date(),
      expiresAt: insertCode.expiresAt || null
    };
    
    this.inviteCodes.push(inviteCode);
    return inviteCode;
  }
  
  async getInviteCodeByCode(code: string): Promise<InviteCode | undefined> {
    return this.inviteCodes.find(inviteCode => inviteCode.code === code);
  }
  
  async useInviteCode(code: string, userId: number): Promise<boolean> {
    const inviteCodeIndex = this.inviteCodes.findIndex(inviteCode => inviteCode.code === code);
    
    if (inviteCodeIndex === -1) {
      return false; // 코드가 존재하지 않음
    }
    
    const inviteCode = this.inviteCodes[inviteCodeIndex];
    
    // 이미 사용된 코드인지 확인
    if (inviteCode.isUsed) {
      return false;
    }
    
    // 만료 날짜가 지났는지 확인
    if (inviteCode.expiresAt && new Date(inviteCode.expiresAt) < new Date()) {
      return false;
    }
    
    // 코드 사용 처리
    this.inviteCodes[inviteCodeIndex] = {
      ...inviteCode,
      isUsed: true,
      usedBy: userId
    };
    
    return true;
  }
  
  async getUserInviteCodes(userId: number): Promise<InviteCode[]> {
    return this.inviteCodes.filter(inviteCode => inviteCode.createdBy === userId);
  }

  // Initialize predefined data
  async initializePredefinedData(): Promise<void> {
    // Create 8 demo users if they don't exist
    if (this.users.size === 0) {
      const defaultPassword = "password123"; // In a real app, this would be properly hashed
      
      for (let i = 1; i <= 8; i++) {
        await this.createUser({
          name: `사용자${i}`,
          avatar: "👤",
          username: `user${i}`,
          password: defaultPassword,
          email: `user${i}@example.com`,
          googleApiKey: null
        });
      }
    }

    // Create predefined habits if they don't exist
    if (this.habits.size === 0) {
      for (const habit of predefinedHabits) {
        await this.createHabit({
          label: habit.label,
          scoreType: habit.scoreType,
          scoreValue: habit.scoreValue
        });
      }
    }
  }
}

export const storage = new MemStorage();
