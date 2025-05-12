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

    try {
      await login(username, password);
      setLocation('/'); // 로그인 성공 시 홈 페이지로 이동
    } catch (err) {
      console.error('Login error:', err);
      setError('로그인에 실패했습니다. 사용자 이름과 비밀번호를 확인해주세요.');
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
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="비밀번호 입력"
            />
            <p className="text-xs text-gray-500 mt-1">기본 비밀번호: password123</p>
          </div>
          
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
        
        <div className="mt-4">
          <h2 className="text-lg font-medium mb-2">사용 가능한 계정:</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">이름</th>
                <th className="text-left py-2">사용자 이름</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1">1</td>
                <td className="py-1">곽완신</td>
                <td className="py-1">user1</td>
              </tr>
              <tr>
                <td className="py-1">2</td>
                <td className="py-1">유은옥</td>
                <td className="py-1">user2</td>
              </tr>
              <tr>
                <td className="py-1">3</td>
                <td className="py-1">이경희</td>
                <td className="py-1">user3</td>
              </tr>
              <tr>
                <td className="py-1">4</td>
                <td className="py-1">임용녀</td>
                <td className="py-1">user4</td>
              </tr>
              <tr>
                <td className="py-1">5</td>
                <td className="py-1">박혜경</td>
                <td className="py-1">user5</td>
              </tr>
              <tr>
                <td className="py-1">6</td>
                <td className="py-1">김유나</td>
                <td className="py-1">user6</td>
              </tr>
              <tr>
                <td className="py-1">7</td>
                <td className="py-1">최지혜</td>
                <td className="py-1">user7</td>
              </tr>
              <tr>
                <td className="py-1">8</td>
                <td className="py-1">김미희</td>
                <td className="py-1">user8</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}