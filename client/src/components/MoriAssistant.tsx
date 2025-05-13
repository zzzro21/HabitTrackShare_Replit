import React, { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  const [result, setResult] = useState<ClassifiedResponse | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      toast({
        title: "입력이 필요합니다",
        description: "분류할 텍스트를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest<ClassifiedResponse>('POST', '/api/assistant/classify', { input });
      setResult(response);
      setInput('');
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

  // 결과 표시 컴포넌트
  const renderResult = () => {
    if (!result) return null;

    return (
      <div className={`mt-4 p-3 rounded-lg border ${getTypeColor(result.type)}`}>
        <div className="flex items-center mb-2">
          <span className="text-xl mr-2">{getTypeIcon(result.type)}</span>
          <h3 className="font-semibold capitalize">{result.type}</h3>
        </div>
        
        {result.type === 'schedule' && (
          <div className="text-sm">
            <p><span className="font-medium">날짜:</span> {result.date}</p>
            <p><span className="font-medium">시간:</span> {result.time}</p>
            <p><span className="font-medium">이벤트:</span> {result.event}</p>
          </div>
        )}
        
        {result.type === 'memo' && (
          <div className="text-sm">
            <p><span className="font-medium">내용:</span> {result.content}</p>
          </div>
        )}
        
        {result.type === 'idea' && (
          <div className="text-sm">
            <p><span className="font-medium">내용:</span> {result.content}</p>
          </div>
        )}
        
        {result.type === 'task' && (
          <div className="text-sm">
            <p><span className="font-medium">할 일:</span> {result.title}</p>
          </div>
        )}
        
        <div className="mt-3 text-right">
          <pre className="bg-gray-800 text-white p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
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
        당신은 나의 똑똑한 AI 비서입니다. 입력하신 내용을 분석하여 일정, 메모, 아이디어, 할 일 중 하나로 분류해 드립니다.
      </p>
      
      <form onSubmit={handleSubmit} className="mb-2">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 토요일 오후 2시에 엄마랑 병원 예약 있어"
            className="flex-1 border rounded-l-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`bg-blue-600 text-white py-2 px-4 rounded-r-md text-sm ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "분석"}
          </button>
        </div>
      </form>
      
      <div className="text-xs text-gray-500">
        <p>예시 입력:</p>
        <ul className="list-disc list-inside">
          <li>토요일 오후 2시에 엄마랑 병원 예약 있어</li>
          <li>이 앱에 AI 요약 기능도 추가하면 좋겠다</li>
          <li>오늘 회의에서 나왔던 키워드: 자율성, 몰입, 피드백</li>
          <li>내일까지 디자인 시안 완성하기</li>
        </ul>
      </div>
      
      {renderResult()}
    </div>
  );
};

export default MoriAssistant;