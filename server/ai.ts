import OpenAI from 'openai';
import { User, Habit, HabitEntry, HabitNote } from '@shared/schema';
import { IStorage } from './storage';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export interface HabitInsight {
  userId: number;
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  date: Date;
}

export async function generateHabitInsights(
  userId: number,
  storage: IStorage
): Promise<HabitInsight> {
  try {
    // Fetch user data
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Fetch habit data
    const habits = await storage.getAllHabits();
    const userEntries = await storage.getUserHabitEntries(userId);
    
    // Get habit notes for context
    const habitNotes: HabitNote[] = [];
    for (const entry of userEntries) {
      const note = await storage.getHabitNote(userId, entry.habitId, entry.day);
      if (note) {
        habitNotes.push(note);
      }
    }

    // Prepare data for AI analysis
    const userData = {
      name: user.name,
      habits: habits.map(habit => ({
        id: habit.id,
        label: habit.label,
        scoreType: habit.scoreType,
        scoreValue: habit.scoreValue,
      })),
      entries: userEntries.map(entry => ({
        habitId: entry.habitId,
        day: entry.day,
        value: entry.value,
      })),
      notes: habitNotes.map(note => ({
        habitId: note.habitId,
        day: note.day,
        note: note.note,
      })),
    };

    // Calculate some basic statistics
    const habitCompletion = habits.map(habit => {
      const habitEntries = userEntries.filter(entry => entry.habitId === habit.id);
      const completedDays = habitEntries.filter(entry => entry.value > 0).length;
      const totalDays = [...new Set(userEntries.map(entry => entry.day))].length || 1;
      return {
        habitId: habit.id,
        label: habit.label,
        completionRate: (completedDays / totalDays) * 100,
        averageScore: habitEntries.reduce((sum, entry) => sum + entry.value, 0) / (habitEntries.length || 1),
      };
    });

    // Generate AI insights
    const prompt = `
You are an expert habit coach analyzing habit data for ${user.name}. 
Please analyze the user's habit data and provide personalized insights and recommendations.

Here's the user's habit data:
${JSON.stringify(userData, null, 2)}

Here are some statistics about their habit completion:
${JSON.stringify(habitCompletion, null, 2)}

Please generate personalized habit insights with the following sections:
1. A brief summary of the user's progress (max 3 sentences)
2. The user's top 3 strengths/achievements
3. The top 2-3 areas for improvement 
4. 3-5 specific, actionable recommendations for habit improvement

Respond in Korean language as the user is Korean.
Format your response as JSON with the following structure:
{
  "summary": "Brief overall assessment",
  "strengths": ["strength 1", "strength 2", ...],
  "improvementAreas": ["area 1", "area 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}
`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    const insights = JSON.parse(content);
    
    return {
      userId,
      summary: insights.summary,
      strengths: insights.strengths,
      improvementAreas: insights.improvementAreas,
      recommendations: insights.recommendations,
      date: new Date(),
    };
  } catch (error) {
    console.error('Error generating habit insights:', error);
    return {
      userId,
      summary: "분석에 실패했습니다. 다시 시도해 주세요.",
      strengths: ["데이터가 충분하지 않습니다."],
      improvementAreas: ["데이터가 충분하지 않습니다."],
      recommendations: ["더 많은 습관 데이터를 기록해 주세요."],
      date: new Date(),
    };
  }
}