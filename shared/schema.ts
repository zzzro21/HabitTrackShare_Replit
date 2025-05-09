import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  avatar: true,
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  scoreType: text("score_type").notNull(), // "binary", "partial", "high_value"
  scoreValue: integer("score_value").notNull(), // The maximum score for this habit
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  label: true,
  scoreType: true,
  scoreValue: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export const habitEntries = pgTable("habit_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  habitId: integer("habit_id").notNull(),
  day: integer("day").notNull(), // 0-55 for the 56 days
  value: integer("value").notNull(), // 0 = not done, 1 = partial, 2 = completed
});

export const insertHabitEntrySchema = createInsertSchema(habitEntries).pick({
  userId: true,
  habitId: true,
  day: true,
  value: true,
});

export type InsertHabitEntry = z.infer<typeof insertHabitEntrySchema>;
export type HabitEntry = typeof habitEntries.$inferSelect;

// 습관 일지(노트) 스키마 추가
export const habitNotes = pgTable("habit_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  day: integer("day").notNull(), // 0-55 for the 56 days
  habitId: integer("habit_id").notNull(),
  note: text("note").notNull().default(""), // 습관에 대한 세부 내용
});

export const insertHabitNoteSchema = createInsertSchema(habitNotes).pick({
  userId: true,
  day: true,
  habitId: true,
  note: true,
});

export type InsertHabitNote = z.infer<typeof insertHabitNoteSchema>;
export type HabitNote = typeof habitNotes.$inferSelect;

export const predefinedHabits = [
  {
    label: "책 읽기 (30분 이상)",
    scoreType: "partial",
    scoreValue: 1,
    scoring: (value: number) => value === 2 ? 1 : value === 1 ? 0.5 : 0
  },
  {
    label: "동영상 시청 및 소감 작성",
    scoreType: "binary",
    scoreValue: 1,
    scoring: (value: number) => value ? 1 : 0
  },
  {
    label: "제품 애용 및 후기 작성",
    scoreType: "partial",
    scoreValue: 2,
    scoring: (value: number) => value === 2 ? 2 : value === 1 ? 1 : 0
  },
  {
    label: "미팅 참석 및 소감 작성",
    scoreType: "binary",
    scoreValue: 5,
    scoring: (value: number) => value ? 5 : 0
  },
  {
    label: "소비자 제품 전달/설명 및 추천",
    scoreType: "partial",
    scoreValue: 2,
    scoring: (value: number) => value === 2 ? 2 : value === 1 ? 1 : 0
  }
];
