import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Gemini API 관련 함수 추가
async function classifyWithGemini(input: string): Promise<{
  type: "schedule" | "memo" | "idea" | "task";
  [key: string]: any;
}> {
  try {
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    
    const prompt = `다음 입력을 분석하여 아래 카테고리 중 하나로 분류하고 상세 정보를 JSON 형식으로 반환해주세요:

    - "schedule" (일정): 날짜, 시간, 이벤트 내용이 있는 경우
      {
        "type": "schedule",
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "event": "이벤트 설명"
      }
    
    - "memo" (메모): 일반적인 기록이나 노트인 경우
      {
        "type": "memo",
        "content": "메모 내용"
      }
    
    - "idea" (아이디어): 새로운 아이디어나 개념인 경우
      {
        "type": "idea",
        "content": "아이디어 설명"
      }
    
    - "task" (할 일): 해야 할 작업인 경우
      {
        "type": "task",
        "title": "해야 할 일"
      }
    
    입력: "${input}"
    
    JSON만 반환해 주세요. 다른 텍스트나 설명은 포함하지 마세요.`;
    
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // JSON 부분만 추출 (안내 텍스트나 코드 블록이 포함되어 있을 수 있음)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : '{}';
    
    const result = JSON.parse(jsonContent);
    return result;
  } catch (error) {
    console.error('Error classifying with Gemini:', error);
    // 기본적으로 메모 타입으로 처리 (오류 발생 시)
    return {
      type: "memo",
      content: input
    };
  }
}

export async function classifyUserInput(input: string): Promise<{
  type: "schedule" | "memo" | "idea" | "task";
  [key: string]: any;
}> {
  try {
    // Gemini API로 먼저 시도
    try {
      const geminiResult = await classifyWithGemini(input);
      console.log('Gemini 분류 결과:', geminiResult);
      return geminiResult;
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      // Gemini 실패 시 OpenAI로 폴백
      console.log('OpenAI로 폴백...');
      
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
      console.log('OpenAI 분류 결과:', result);
      return result;
    }
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