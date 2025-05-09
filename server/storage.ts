import { 
  habits, 
  users, 
  habitEntries, 
  habitNotes,
  dailyFeedbacks,
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

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitEntries = [];
    this.habitNotes = [];
    this.dailyFeedbacks = [];
    this.userIdCounter = 1;
    this.habitIdCounter = 1;
    this.habitEntryIdCounter = 1;
    this.habitNoteIdCounter = 1;
    this.dailyFeedbackIdCounter = 1;
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
    const user: User = { ...insertUser, id };
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
          password: defaultPassword
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
