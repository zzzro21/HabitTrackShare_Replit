import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

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
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [notionToken, setNotionToken] = useState<string>('');
  const [notionDbId, setNotionDbId] = useState<string>('');
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState<boolean>(false);
  const [isSavingApiKeys, setIsSavingApiKeys] = useState<boolean>(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    hasGeminiApiKey: boolean;
    hasNotionToken: boolean;
    hasNotionDbId: boolean;
  }>({
    hasGeminiApiKey: false,
    hasNotionToken: false,
    hasNotionDbId: false
  });
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
  const { user } = useAuth();
  
  // Speech recognition
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState('');

  // API 키 상태 로드
  useEffect(() => {
    const loadApiKeyStatus = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingApiKeys(true);
        const response = await apiRequest<typeof apiKeyStatus>(`/api/users/${user.id}/api-keys`);
        setApiKeyStatus(response);
      } catch (error) {
        console.error('API 키 상태 로드 실패:', error);
        toast({
          title: "API 키 정보 로드 실패",
          description: "API 키 상태를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingApiKeys(false);
      }
    };
    
    if (user?.id) {
      loadApiKeyStatus();
    }
  }, [user?.id, toast]);
  
  // API 키 저장
  const handleSaveApiKeys = async () => {
    if (!user?.id) {
      toast({
        title: "로그인 필요",
        description: "API 키를 저장하려면 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSavingApiKeys(true);
      const response = await apiRequest<{ success: boolean; message: string; }>(
        'POST', 
        `/api/users/${user.id}/api-keys`, 
        { geminiApiKey, notionToken, notionDbId }
      );
      
      if (response.success) {
        toast({
          title: "API 키 저장 성공",
          description: response.message
        });
        setApiKeyStatus({
          hasGeminiApiKey: !!geminiApiKey,
          hasNotionToken: !!notionToken,
          hasNotionDbId: !!notionDbId
        });
        setShowApiSettings(false); // 저장 후 설정 창 닫기
      } else {
        toast({
          title: "API 키 저장 실패",
          description: response.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('API 키 저장 실패:', error);
      toast({
        title: "API 키 저장 실패",
        description: "API 키를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSavingApiKeys(false);
    }
  };
  
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            <span className="text-lg">🤖</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Mori</h2>
        </div>
        <button 
          onClick={() => setShowApiSettings(!showApiSettings)}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-lg text-gray-700 flex items-center"
        >
          <span className="mr-1">⚙️</span> API 설정
        </button>
      </div>
      
      {/* API 키 설정 UI */}
      {showApiSettings && (
        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            <span className="mr-1">🔑</span> API 키 설정
          </h3>
          
          {/* Gemini API 키 설정 */}
          <div className="mb-3">
            <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span className="mr-1">✨</span> Gemini API 키
              {apiKeyStatus.hasGeminiApiKey && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">설정됨</span>
              )}
            </label>
            <Input
              id="geminiApiKey"
              type="password"
              placeholder="Gemini API 키를 입력하세요"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              <a 
                href="https://ai.google.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Gemini AI 사이트
              </a>
              에서 API 키를 발급받을 수 있습니다.
            </p>
          </div>
          
          {/* Notion 토큰 설정 */}
          <div className="mb-3">
            <label htmlFor="notionToken" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span className="mr-1">📝</span> Notion 토큰
              {apiKeyStatus.hasNotionToken && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">설정됨</span>
              )}
            </label>
            <Input
              id="notionToken"
              type="password"
              placeholder="Notion 토큰을 입력하세요"
              value={notionToken}
              onChange={(e) => setNotionToken(e.target.value)}
              className="text-sm"
            />
          </div>
          
          {/* Notion 데이터베이스 ID 설정 */}
          <div className="mb-3">
            <label htmlFor="notionDbId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span className="mr-1">🗄️</span> Notion 데이터베이스 ID
              {apiKeyStatus.hasNotionDbId && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">설정됨</span>
              )}
            </label>
            <Input
              id="notionDbId"
              type="text"
              placeholder="Notion 데이터베이스 ID를 입력하세요"
              value={notionDbId}
              onChange={(e) => setNotionDbId(e.target.value)}
              className="text-sm"
            />
          </div>
          
          {/* 저장 버튼 */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiSettings(false)}
              disabled={isSavingApiKeys}
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleSaveApiKeys}
              disabled={isSavingApiKeys}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSavingApiKeys ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-center mb-3 bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
          <span className="text-xl">🧠</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800">MORI AI</h3>
          <p className="text-xs text-gray-600">음성으로 명령하면 일정, 메모, 아이디어를 자동으로 정리해드립니다</p>
        </div>
      </div>
      
      {/* 음성 인식 상태 표시 */}
      {isRecording && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <div className="text-sm font-bold text-red-700">음성 인식 중...</div>
            </div>
            <div className="text-xs bg-black text-white px-2 py-1 rounded-full">LIVE</div>
          </div>
          <div className="text-sm bg-white p-2 rounded border border-gray-200 max-h-20 overflow-auto">
            {transcript || "말씀하시면 여기에 표시됩니다..."}
          </div>
        </div>
      )}
      
      {/* 음성 인식 버튼 또는 텍스트 입력 폼 */}
      <div className="mb-4 space-y-3">
        <Button
          onClick={toggleRecording}
          variant={isRecording ? "destructive" : "default"}
          className={`w-full py-3 ${isRecording ? 'animate-pulse bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}`}
          disabled={isLoading}
        >
          {isRecording ? (
            <div className="flex items-center justify-center">
              <span className="mr-2 text-lg">◼</span> 
              <span className="font-bold">녹음 중지하기</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2 text-lg">🎤</span> 
              <span className="font-bold">음성으로 말하기</span>
            </div>
          )}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg transform -rotate-1"></div>
          <form onSubmit={handleSubmit} className="relative bg-white rounded-lg p-2 border border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="예: 금요일 오후 3시 엄마랑 병원 가기"
              className="flex-1 py-2 px-3 text-sm focus:outline-none"
              disabled={isLoading || isRecording}
            />
            <Button
              type="submit"
              disabled={isLoading || isRecording}
              variant="default"
              className="ml-2 bg-green-500 hover:bg-green-600"
            >
              {isLoading ? 
                <div className="flex items-center"><span className="animate-spin mr-1">⏳</span> 처리중</div> : 
                <div className="flex items-center"><span className="mr-1">📤</span> 전송</div>
              }
            </Button>
          </form>
        </div>
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