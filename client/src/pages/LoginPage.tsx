import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username) {
      setError('사용자 이름을 입력해주세요.');
      return;
    }

    try {
      const defaultPassword = "password123";
      await login(username, defaultPassword);
      setLocation('/'); // 로그인 성공 시 홈 페이지로 이동
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.message) {
        setError(`로그인에 실패했습니다: ${err.message}`);
      } else {
        setError('로그인에 실패했습니다. 사용자 이름을 확인해주세요.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">습관 트래커 로그인</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              사용자 이름
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="사용자 이름 입력 (예: user1)"
            />
          </div>
          
          <input
            id="password"
            type="hidden"
            value={password || "password123"}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">
            계정 아이디: <span className="font-medium">user1</span>부터 <span className="font-medium">user8</span>까지 이용 가능합니다.
          </p>
          <p className="text-gray-600">
            (비밀번호는 모든 계정 동일)
          </p>
        </div>
      </div>
    </div>
  );
}