import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

// 8명의 고정 사용자 목록 (ID는 서버 데이터베이스와 일치)
const defaultUsers = [
  { id: 10, name: '곽완신', username: 'gwak', avatar: '👨🏻' },
  { id: 11, name: '유은옥', username: 'yoo', avatar: '👩🏻' },
  { id: 12, name: '이경희', username: 'lee', avatar: '👩🏻' },
  { id: 13, name: '임용녀', username: 'lim', avatar: '👩🏻' },
  { id: 14, name: '박혜경', username: 'park', avatar: '👩🏻' },
  { id: 15, name: '김유나', username: 'kim', avatar: '👧🏻' },
  { id: 16, name: '최지혜', username: 'choi', avatar: '👩🏻' },
  { id: 17, name: '김미희', username: 'mihi', avatar: '👩🏻' }
];

const LoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [notionToken, setNotionToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 이미 로그인된 경우 체크리스트 페이지로 리디렉션
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/checklist');
    }
  }, [isAuthenticated, setLocation]);
  
  // 초기 비밀번호는 모두 'password123'으로 설정
  const handleLogin = async () => {
    if (!selectedUser) {
      toast({
        title: "사용자 선택 필요",
        description: "로그인할 사용자를 선택해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== 'password123') {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 선택된 사용자 찾기
      const user = defaultUsers.find(u => u.username === selectedUser);
      
      if (!user) {
        throw new Error("선택된 사용자를 찾을 수 없습니다.");
      }
      
      // Zustand store에 로그인 정보 저장
      login(user, apiKey.trim(), notionToken.trim());
      
      // 로그인 성공
      toast({
        title: "로그인 성공",
        description: `환영합니다, ${user.name}님!`
      });
      
      // 체크리스트 페이지로 리다이렉트 (메인 페이지 대신)
      setLocation('/checklist');
    } catch (error) {
      console.error('로그인 오류:', error);
      toast({
        title: "로그인 실패",
        description: "로그인 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 max-w-[390px] mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">보안 로그인</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">사용자</label>
              <select 
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="" disabled>사용자 선택</option>
                {defaultUsers.map(user => (
                  <option key={user.id} value={user.username}>
                    {user.name} {user.avatar}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Gemini API 키 (선택)</label>
              <input
                type="password"
                placeholder="API 키 입력"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Notion 토큰 (선택)</label>
              <input
                type="password"
                placeholder="Notion 토큰 입력"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-colors mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              모든 사용자의 기본 비밀번호는 'password123'입니다.
            </p>
            
            <div className="mt-4 border-t pt-4">
              <p className="text-xs text-gray-500 mb-2 text-center">
                로그인에 문제가 있나요?
              </p>
              <button
                onClick={() => {
                  localStorage.clear();
                  toast({
                    title: "초기화 완료",
                    description: "로컬 스토리지를 초기화했습니다. 페이지를 새로고침합니다."
                  });
                  setTimeout(() => window.location.reload(), 1000);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 px-4 rounded-md transition-colors"
              >
                로컬 스토리지 초기화
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;