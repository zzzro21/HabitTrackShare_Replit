import { useLocation } from 'wouter';

export default function SimpleModeNavbar() {
  const [, setLocation] = useLocation();
  
  const handleLogout = () => {
    // 로그아웃 시 로컬 스토리지 정보 삭제
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('loginTime');
    
    // 로그인 페이지로 이동
    setLocation('/login');
  };
  
  const username = localStorage.getItem('username') || '사용자';

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          습관 트래커
        </span>
        
        <nav className="ml-10 space-x-4">
          <a 
            href="/home" 
            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1"
          >
            홈
          </a>
          <a 
            href="/friends" 
            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1"
          >
            친구
          </a>
          <a 
            href="/ranking" 
            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1"
          >
            랭킹
          </a>
          <a 
            href="/insights" 
            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1"
          >
            인사이트
          </a>
        </nav>
      </div>
      
      <div className="flex items-center">
        <span className="mr-4 text-gray-700 dark:text-gray-300">
          {username}님 환영합니다!
        </span>
        
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}