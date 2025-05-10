import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

export default function SimpleLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, error, isLoading } = useSimpleAuth();

  // 이미 로그인되어 있으면 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/home');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      await login(username, password);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !name || !inviteCode) {
      alert('모든 필드를 채워주세요.');
      return;
    }
    
    if (!inviteCode.startsWith('WELCOME')) {
      alert('유효하지 않은 초대 코드입니다. WELCOME으로 시작하는 코드를 입력하세요.');
      return;
    }
    
    // 간단한 회원가입 처리 (클라이언트 측에서만 처리)
    const userId = Math.floor(Math.random() * 1000) + 100;
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('userFullName', name);
    
    alert('회원가입이 완료되었습니다!');
    setLocation('/home');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-100 to-blue-100 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-800 p-10 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLogin ? '로그인' : '회원가입'}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {isLogin ? '습관 트래커에 오신 것을 환영합니다!' : '새 계정을 만들어보세요!'}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  아이디
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>
            
            <div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                테스트 계정: admin / password123
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  이름
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  아이디
                </label>
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  비밀번호
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  초대 코드
                </label>
                <input
                  id="invite-code"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="초대 코드를 입력하세요"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  힌트: WELCOME으로 시작하는 코드(예: WELCOME146A78)
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                회원가입
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-indigo-600 dark:text-blue-400 hover:text-indigo-500"
          >
            {isLogin ? '새 계정 만들기' : '이미 계정이 있으신가요? 로그인하기'}
          </button>
        </div>
      </div>
    </div>
  );
}