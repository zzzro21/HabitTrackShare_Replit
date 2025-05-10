import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface ApiKeyManagerProps {
  currentKey: string | null;
  onKeyUpdated: (newKey: string) => void;
}

export function ApiKeyManager({ currentKey, onKeyUpdated }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      setMessage(null);
      
      const response = await apiRequest<{ success: boolean; message: string }>('POST', '/api/auth/api-key', {
        googleApiKey: apiKey.trim()
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'API 키가 성공적으로 저장되었습니다.' });
        onKeyUpdated(apiKey.trim());
      } else {
        setMessage({ type: 'error', text: response.message || 'API 키 저장 중 오류가 발생했습니다.' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'API 키 저장 중 오류가 발생했습니다. 다시 시도해주세요.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-medium text-gray-900">Google API 키 관리</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="api-key" className="mb-2 block text-sm font-medium text-gray-700">
            Google API 키
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={isVisible ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="API 키를 입력하세요"
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
            >
              {isVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Google API 키는 안전하게 저장되며 Google 서비스 연동에 사용됩니다.
          </p>
        </div>
        
        {message && (
          <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isUpdating ? '저장 중...' : '저장'}
          </button>
          
          {currentKey && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(currentKey);
                setMessage({ type: 'success', text: 'API 키가 클립보드에 복사되었습니다.' });
              }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              API 키 복사
            </button>
          )}
        </div>
      </form>
      
      <div className="mt-6">
        <h4 className="mb-2 text-sm font-medium text-gray-700">빠른 접근 링크</h4>
        <div className="flex flex-wrap gap-2">
          <a 
            href="https://console.cloud.google.com/apis/credentials" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-200"
          >
            Google Cloud Console
          </a>
          <a 
            href="https://developers.google.com/identity/protocols/oauth2" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-200"
          >
            Google OAuth 문서
          </a>
          <a 
            href="https://developers.google.com/calendar/api/guides/overview" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-200"
          >
            Calendar API 문서
          </a>
        </div>
      </div>
    </div>
  );
}