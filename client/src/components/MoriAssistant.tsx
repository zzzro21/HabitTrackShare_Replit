import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('고객관리');
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

  const getCurrentDate = () => {
    return format(new Date(), 'yyyy. MM. dd');
  };

  const categories = [
    '고객관리', 
    '상담내역', 
    '수당시뮬레이션', 
    '메모', 
    '스케쥴', 
    '상품'
  ];
  
  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case '고객관리':
        return (
          <div className="p-4 bg-yellow-50 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-800">고객 관리</h3>
              <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                <span>3</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">김철수</span>
                  <span className="text-sm text-gray-500">최근 연락: 3일 전</span>
                </div>
                <div className="text-sm text-gray-600">생명보험 상담 완료, 가입 고려 중</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">박영희</span>
                  <span className="text-sm text-gray-500">최근 연락: 오늘</span>
                </div>
                <div className="text-sm text-gray-600">자녀 교육보험 상담 예정</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">이지은</span>
                  <span className="text-sm text-gray-500">최근 연락: 1주일 전</span>
                </div>
                <div className="text-sm text-gray-600">연금보험 추가 설명 필요</div>
              </div>
            </div>
          </div>
        );
      case '상담내역':
        return (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h3 className="font-bold text-lg text-gray-800 mb-2">상담 내역</h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">김철수 (생명보험)</span>
                  <span className="text-sm text-blue-500">2025.05.10</span>
                </div>
                <div className="text-sm text-gray-600">월 보험료 15만원 제안, 추가 검토 요청</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">이지은 (연금보험)</span>
                  <span className="text-sm text-blue-500">2025.05.05</span>
                </div>
                <div className="text-sm text-gray-600">노후 설계 중요성 설명, 상품 비교 자료 전달</div>
              </div>
            </div>
          </div>
        );
      case '수당시뮬레이션':
        return (
          <div className="p-4 bg-green-50 rounded-xl">
            <h3 className="font-bold text-lg text-gray-800 mb-2">수당 시뮬레이션</h3>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">이번 달 예상 수당</span>
                <span className="font-bold text-green-600">1,250,000원</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>계약 수당</span>
                  <span>850,000원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>유지 수당</span>
                  <span>320,000원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>추가 인센티브</span>
                  <span>80,000원</span>
                </div>
              </div>
            </div>
          </div>
        );
      case '메모':
        return (
          <div className="p-4 bg-purple-50 rounded-xl">
            <h3 className="font-bold text-lg text-gray-800 mb-2">메모</h3>
            <div className="space-y-3">
              {categorizedResults.memos.length > 0 ? (
                categorizedResults.memos.map((memo, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-600">{memo.content}</div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-400">메모를 추가하려면 음성버튼을 누르고 말하세요</div>
                </div>
              )}
            </div>
          </div>
        );
      case '스케쥴':
        return (
          <div className="p-4 bg-orange-50 rounded-xl">
            <h3 className="font-bold text-lg text-gray-800 mb-2">오늘의 스케쥴</h3>
            <div className="space-y-3">
              {categorizedResults.schedules.length > 0 ? (
                categorizedResults.schedules.map((schedule, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">{schedule.event}</span>
                      <span className="text-sm text-orange-500">{schedule.time}</span>
                    </div>
                    <div className="text-sm text-gray-600">{schedule.date}</div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-400">오늘 예정된 일정이 없습니다</div>
                </div>
              )}
            </div>
          </div>
        );
      case '상품':
        return (
          <div className="p-4 bg-indigo-50 rounded-xl">
            <h3 className="font-bold text-lg text-gray-800 mb-2">상품 정보</h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="font-semibold mb-1">종신보험 프리미엄</div>
                <div className="text-sm text-gray-600 mb-1">100세까지 보장, 중대질병 특약 가능</div>
                <div className="flex justify-between text-sm">
                  <span>월 납입금</span>
                  <span className="font-semibold">15만원~</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="font-semibold mb-1">무배당 연금보험</div>
                <div className="text-sm text-gray-600 mb-1">안정적인 노후 준비, 10년 이상 유지 시 세제혜택</div>
                <div className="flex justify-between text-sm">
                  <span>월 납입금</span>
                  <span className="font-semibold">10만원~</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-center text-gray-500">
              카테고리를 선택해주세요
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="bg-white p-0 rounded-xl border shadow-md">
      {/* 상단 날짜 표시 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <button className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-center text-blue-600">{getCurrentDate()}</h2>
          <div className="w-6"></div> {/* 균형을 맞추기 위한 더미 요소 */}
        </div>
      </div>
      
      {/* 카테고리 버튼 */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`py-2 px-3 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-black text-white'
                : 'bg-white border border-yellow-300 text-gray-800 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
        <button
          className="py-2 px-3 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800"
        >
          +
        </button>
      </div>
      
      {/* 선택된 카테고리 내용 표시 */}
      <div className="p-4">
        {renderCategoryContent()}
      </div>
      
      {/* 하단 음성 입력 부분 */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메모를 입력하세요..."
            className="flex-1 border-gray-300"
            disabled={isLoading || isRecording}
          />
          <Button
            type="button"
            onClick={toggleRecording}
            variant="ghost"
            className={`ml-2 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 text-white'}`}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isRecording || !input.trim()}
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Button>
        </form>
      </div>
      
      {/* API 키 설정 모달 */}
      {showApiSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">API 설정</h3>
              <button onClick={() => setShowApiSettings(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Gemini API 키
                </label>
                <Input
                  id="geminiApiKey"
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Gemini API 키를 입력하세요"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowApiSettings(false)}>
                  취소
                </Button>
                <Button onClick={handleSaveApiKeys} disabled={isSavingApiKeys}>
                  {isSavingApiKeys ? "저장 중..." : "저장"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 음성 인식 중일 때 오버레이 표시 */}
      {isRecording && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-xs w-full mx-4 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-2">음성 인식 중...</h3>
            <p className="text-gray-600 mb-4">{transcript || "말씀하신 내용이 여기에 표시됩니다"}</p>
            <Button onClick={toggleRecording} variant="destructive">
              중지하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoriAssistant;