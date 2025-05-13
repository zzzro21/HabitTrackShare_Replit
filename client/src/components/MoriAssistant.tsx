import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface ClassifiedResponse {
  type: 'schedule' | 'memo' | 'idea' | 'task';
  date?: string;
  time?: string;
  event?: string;
  content?: string;
  title?: string;
}

const MoriAssistant: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [results, setResults] = useState<ClassifiedResponse[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<{
    schedules: ClassifiedResponse[];
    memos: ClassifiedResponse[];
    ideas: ClassifiedResponse[];
    tasks: ClassifiedResponse[];
  }>({
    schedules: [],
    memos: [],
    ideas: [],
    tasks: []
  });
  const { toast } = useToast();
  
  // Speech recognition
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState('');

  // 음성 인식 초기화
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ko-KR'; // 한국어 설정
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        setInput(finalTranscript || interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
        toast({
          title: "음성 인식 오류",
          description: `오류가 발생했습니다: ${event.error}`,
          variant: "destructive"
        });
      };
      
      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current.start();
        }
      };
    } else {
      toast({
        title: "음성 인식 미지원",
        description: "이 브라우저는 음성 인식을 지원하지 않습니다.",
        variant: "destructive"
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, toast]);
  
  // 음성 인식 시작/중지 토글
  const toggleRecording = () => {
    if (isRecording) {
      // 녹음 중지
      recognitionRef.current?.stop();
      setIsRecording(false);
      
      // 녹음이 끝나면 입력 내용을 분류
      if (transcript.trim()) {
        handleClassify(transcript);
      }
    } else {
      // 녹음 시작
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
      toast({
        title: "음성 인식 시작",
        description: "말씀하시면 텍스트로 변환됩니다.",
      });
    }
  };
  
  // 입력 분류 처리
  const handleClassify = async (textToClassify: string) => {
    if (!textToClassify.trim()) {
      toast({
        title: "입력이 필요합니다",
        description: "분류할 텍스트를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest<ClassifiedResponse>('POST', '/api/assistant/classify', { input: textToClassify });
      
      // 결과 추가
      const newResults = [...results, response];
      setResults(newResults);
      
      // 카테고리별로 결과 정리
      const newCategorized = {...categorizedResults};
      if (response.type === 'schedule') newCategorized.schedules.push(response);
      else if (response.type === 'memo') newCategorized.memos.push(response);
      else if (response.type === 'idea') newCategorized.ideas.push(response);
      else if (response.type === 'task') newCategorized.tasks.push(response);
      
      setCategorizedResults(newCategorized);
      setInput('');
      setTranscript('');
      
      toast({
        title: "분류 완료",
        description: `입력이 "${response.type}" 타입으로 분류되었습니다.`,
      });
    } catch (error) {
      console.error('AI 비서 분류 오류:', error);
      toast({
        title: "분류 실패",
        description: "AI 비서가 입력을 분류하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleClassify(input);
  };

  // 결과 타입에 따른 아이콘 선택
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule':
        return '📅';
      case 'memo':
        return '📝';
      case 'idea':
        return '💡';
      case 'task':
        return '✅';
      default:
        return '❓';
    }
  };

  // 결과 타입에 따른 배경색 선택
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'bg-blue-50 border-blue-200';
      case 'memo':
        return 'bg-green-50 border-green-200';
      case 'idea':
        return 'bg-yellow-50 border-yellow-200';
      case 'task':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // 결과 표시 컴포넌트 - 각 카테고리별로 표시
  const renderCategorizedResults = () => {
    return (
      <div className="mt-4 space-y-6">
        {/* 일정 목록 */}
        {categorizedResults.schedules.length > 0 && (
          <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">{getTypeIcon('schedule')}</span>
              <h3 className="font-semibold">일정</h3>
            </div>
            <div className="space-y-2">
              {categorizedResults.schedules.map((schedule, idx) => (
                <div key={idx} className="text-sm p-2 bg-white rounded-lg">
                  <div className="font-medium text-blue-800">{schedule.event}</div>
                  <div className="text-gray-600 flex justify-between">
                    <div>{schedule.date}</div>
                    <div>{schedule.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 할 일 목록 */}
        {categorizedResults.tasks.length > 0 && (
          <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">{getTypeIcon('task')}</span>
              <h3 className="font-semibold">할 일</h3>
            </div>
            <div className="space-y-2">
              {categorizedResults.tasks.map((task, idx) => (
                <div key={idx} className="flex items-center text-sm p-2 bg-white rounded-lg">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  <div className="font-medium">{task.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 아이디어 목록 */}
        {categorizedResults.ideas.length > 0 && (
          <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">{getTypeIcon('idea')}</span>
              <h3 className="font-semibold">아이디어</h3>
            </div>
            <div className="space-y-2">
              {categorizedResults.ideas.map((idea, idx) => (
                <div key={idx} className="text-sm p-2 bg-white rounded-lg">
                  <div className="font-medium text-amber-800">{idea.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 메모 목록 */}
        {categorizedResults.memos.length > 0 && (
          <div className="border border-green-200 rounded-lg p-3 bg-green-50">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">{getTypeIcon('memo')}</span>
              <h3 className="font-semibold">메모</h3>
            </div>
            <div className="space-y-2">
              {categorizedResults.memos.map((memo, idx) => (
                <div key={idx} className="text-sm p-2 bg-white rounded-lg">
                  <div className="font-medium text-green-800">{memo.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 모든 카테고리가 비어있는 경우 */}
        {categorizedResults.schedules.length === 0 && 
         categorizedResults.tasks.length === 0 && 
         categorizedResults.ideas.length === 0 && 
         categorizedResults.memos.length === 0 && (
          <div className="text-center text-gray-500 p-3">
            음성 명령을 통해 일정, 할 일, 아이디어, 메모를 추가해보세요.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm my-4">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <span className="text-lg">🤖</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Mori</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        당신의 똑똑한 AI 비서입니다. 음성으로 명령하면 일정, 메모, 아이디어, 할 일 중 하나로 분류하여 정리해 드립니다.
      </p>
      
      {/* 음성 인식 상태 표시 */}
      {isRecording && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <div className="text-sm font-medium">음성 인식 중...</div>
          </div>
          <div className="text-xs text-gray-500">말하고 있는 내용: "{transcript}"</div>
        </div>
      )}
      
      {/* 음성 인식 버튼 또는 텍스트 입력 폼 */}
      <div className="mb-4 flex space-x-2">
        <Button
          onClick={toggleRecording}
          variant={isRecording ? "destructive" : "default"}
          className={`flex-shrink-0 ${isRecording ? 'animate-pulse' : ''}`}
          disabled={isLoading}
        >
          {isRecording ? (
            <>
              <span className="mr-2">◼</span> 녹음 중지
            </>
          ) : (
            <>
              <span className="mr-2">🎤</span> 음성으로 말하기
            </>
          )}
        </Button>
        
        <form onSubmit={handleSubmit} className="flex-1 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="또는 여기에 직접 입력하세요"
            className="flex-1 border rounded-l-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading || isRecording}
          />
          <Button
            type="submit"
            disabled={isLoading || isRecording}
            variant="outline"
            className="rounded-l-none"
          >
            {isLoading ? "처리 중..." : "분석"}
          </Button>
        </form>
      </div>
      
      {/* 도움말 */}
      <div className="text-xs text-gray-500 mb-4 px-2 py-1 bg-gray-50 rounded-lg">
        <p className="font-medium mb-1">이렇게 말해보세요:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>"토요일 오후 2시에 엄마랑 병원 예약 있어"</li>
          <li>"이 앱에 AI 요약 기능도 추가하면 좋겠다"</li>
          <li>"오늘 회의에서 나왔던 키워드는 자율성, 몰입, 피드백이야"</li>
          <li>"내일까지 디자인 시안 완성하기"</li>
        </ul>
      </div>
      
      {/* 카테고리별로 정리된 결과 표시 */}
      {renderCategorizedResults()}
    </div>
  );
};

export default MoriAssistant;