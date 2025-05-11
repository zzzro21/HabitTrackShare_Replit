import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import TabNavigation from '@/components/TabNavigation';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newName, setNewName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 사용자 정보 가져오기
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => apiRequest('/api/auth/me'),
    staleTime: 5 * 60 * 1000, // 5분
  });

  const user = userData?.success ? userData.user : null;
  
  // 이름 수정 뮤테이션
  const updateNameMutation = useMutation({
    mutationFn: (name: string) => 
      apiRequest('POST', '/api/auth/update-name', { name }),
    onSuccess: () => {
      setMessage({ type: 'success', text: '이름이 성공적으로 변경되었습니다.' });
      setIsEditingName(false);
      // 사용자 정보 리프레시
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      setMessage({ 
        type: 'error', 
        text: error.message || '이름 변경 중 오류가 발생했습니다.' 
      });
    }
  });

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      setMessage(null);
      
      const response = await apiRequest<{ success: boolean; message: string }>('POST', '/api/auth/logout');
      
      if (response.success) {
        // 캐시 초기화
        queryClient.clear();
        // 로그인 페이지로 이동
        setLocation('/login');
      } else {
        setMessage({ type: 'error', text: response.message || '로그아웃 중 오류가 발생했습니다.' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || '로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.' 
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleApiKeyUpdate = (newKey: string) => {
    // 사용자 정보 캐시 업데이트
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-center">설정</h1>
          <p className="text-xs text-center text-gray-500">습관 관리 앱 설정</p>
        </div>
      </header>
      
      <main className="p-4">
        <div className="space-y-6">
          {user && (
            <div>
              <h2 className="text-lg font-medium mb-3">계정 정보</h2>
              <div className="bg-white border rounded-lg divide-y">
                <div className="px-4 py-3 flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    <img 
                      src={user.avatar || '/default-avatar.png'} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    {isEditingName ? (
                      <div className="flex flex-col space-y-2">
                        <Input 
                          ref={nameInputRef}
                          type="text" 
                          value={newName} 
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="새 이름을 입력하세요"
                          className="text-sm"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => {
                              if (newName.trim().length >= 2) {
                                updateNameMutation.mutate(newName);
                              } else {
                                setMessage({ type: 'error', text: '이름은 2자 이상이어야 합니다.' });
                              }
                            }}
                            disabled={updateNameMutation.isPending}
                          >
                            {updateNameMutation.isPending ? '저장 중...' : '저장'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setIsEditingName(false);
                              setNewName('');
                              setMessage(null);
                            }}
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium flex items-center">
                          {user.name}
                          <button 
                            onClick={() => {
                              setIsEditingName(true);
                              setNewName(user.name);
                              setMessage(null);
                              // Focus the input after render
                              setTimeout(() => nameInputRef.current?.focus(), 0);
                            }}
                            className="ml-2 text-blue-500 text-xs"
                          >
                            수정
                          </button>
                        </div>
                        <div className="text-sm text-gray-500">{user.email || user.username}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* API 키 관리 섹션 */}
          {user && (
            <div>
              <h2 className="text-lg font-medium mb-3">API 키 관리</h2>
              <ApiKeyManager
                currentKey={user.googleApiKey}
                onKeyUpdated={handleApiKeyUpdate}
              />
            </div>
          )}

          <div>
            <h2 className="text-lg font-medium mb-3">앱 정보</h2>
            <div className="bg-white border rounded-lg divide-y">
              <div className="px-4 py-3">
                <div className="text-sm text-gray-500">버전</div>
                <div>1.0.0</div>
              </div>
              <div className="px-4 py-3">
                <div className="text-sm text-gray-500">앱 설명</div>
                <div className="text-sm">
                  자장격지 행동습관 점검표는 56일(8주) 동안의 습관 형성을 통해 성공의 기반을 다지는 앱입니다.
                  친구들과 함께 습관을 추적하고 진행 상황을 공유할 수 있습니다.
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-3">알림 설정</h2>
            <div className="bg-white border rounded-lg divide-y">
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">일일 습관 알림</div>
                  <div className="text-sm text-gray-500">매일 저녁 9시에 알림</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" id="toggle" className="sr-only" defaultChecked />
                  <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                </div>
              </div>
              
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">친구 진행상황 알림</div>
                  <div className="text-sm text-gray-500">친구가 습관을 완료했을 때 알림</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" id="toggle2" className="sr-only" />
                  <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-3">기타 기능</h2>
            <div className="bg-white border rounded-lg divide-y">
              <button 
                className="w-full px-4 py-3 text-left flex justify-between items-center"
                onClick={() => setLocation('/morning')}
              >
                <div className="font-medium">아침 명언</div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                className="w-full px-4 py-3 text-left flex justify-between items-center"
                onClick={() => setLocation('/journey')}
              >
                <div className="font-medium">여정 시각화</div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-3">계정</h2>
            <div className="bg-white border rounded-lg divide-y">
              <button 
                className="w-full px-4 py-3 text-left"
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                <div className="font-medium text-red-500">
                  {logoutLoading ? '로그아웃 중...' : '로그아웃'}
                </div>
              </button>
              <button className="w-full px-4 py-3 text-left">
                <div className="font-medium text-gray-500">도움말</div>
              </button>
              <button className="w-full px-4 py-3 text-left">
                <div className="font-medium text-gray-500">개인정보 처리방침</div>
              </button>
            </div>
          </div>
          
          {/* 메시지 표시 */}
          {message && (
            <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}
        </div>
      </main>
      
      <TabNavigation />
    </div>
  );
};

export default SettingsPage;
