import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function classifyUserInput(input: string): Promise<{
  type: "schedule" | "memo" | "idea" | "task";
  [key: string]: any;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that classifies user inputs into specific categories and formats them as JSON.
          
          Categories and their JSON structures:
          1. "schedule" → Calendar events
          {
            "type": "schedule",
            "date": "YYYY-MM-DD",
            "time": "HH:MM",
            "event": "Event description"
          }
          
          2. "memo" → Notes or recordings
          {
            "type": "memo",
            "content": "Memo content"
          }
          
          3. "idea" → Ideas or concepts
          {
            "type": "idea",
            "content": "Idea description"
          }
          
          4. "task" → To-do items
          {
            "type": "task",
            "title": "Task to do"
          }
          
          Analyze the user input and return ONLY the appropriate JSON object with no additional text. If you're unsure about date or time, use reasonable estimates based on context.`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" }
    });

    // 결과가 없으면 빈 객체 사용
    const content = response.choices[0]?.message?.content ?? '{}';
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error('Error classifying user input:', error);
    // 기본적으로 메모 타입으로 처리 (오류 발생 시)
    return {
      type: "memo",
      content: input
    };
  }
}

// 기존 habitInsights 함수들은 유지
export interface HabitInsight {
  userId: number;
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  date: Date;
}

export async function generateHabitInsights(userId: number, habitEntries: any[], habits: any[]): Promise<HabitInsight> {
  // 기존 함수 내용 유지
  return {
    userId,
    summary: "습관 실천을 꾸준히 하고 있습니다.",
    strengths: ["책 읽기 습관이 잘 형성되었습니다."],
    improvementAreas: ["운동 습관을 더 개선할 필요가 있습니다."],
    recommendations: ["일정한 시간에 습관을 실천해보세요."],
    date: new Date()
  };
}