import { useEffect } from 'react';

export default function DirectLoginPage() {
  useEffect(() => {
    // 선택한 아이디에 따른 사용자 정보 매핑
    const userMap: Record<string, any> = {
      'user1': { id: 1, name: '곽완신', username: 'user1', avatar: '👨‍💼' },
      'user2': { id: 2, name: '유은옥', username: 'user2', avatar: '👩‍💼' },
      'user3': { id: 3, name: '이경희', username: 'user3', avatar: '👨‍🦱' },
      'user4': { id: 4, name: '임용녀', username: 'user4', avatar: '👩‍🦰' },
      'user5': { id: 5, name: '박혜경', username: 'user5', avatar: '👱‍♀️' },
      'user6': { id: 6, name: '김유나', username: 'user6', avatar: '👩‍🦳' },
      'user7': { id: 7, name: '최지혜', username: 'user7', avatar: '👩‍🦱' },
      'user8': { id: 8, name: '김미희', username: 'user8', avatar: '👧' },
      'zzzro': { id: 6, name: '김유나', username: 'zzzro', avatar: '👩‍🦳' }
    };

    // URL에서 사용자 ID 가져오기 (예: /direct-login?user=user1)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    
    if (userId && userMap[userId]) {
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('userAuth', JSON.stringify({
        isLoggedIn: true,
        user: userMap[userId]
      }));
      
      console.log(`${userId} 사용자로 자동 로그인 됨`);
      
      // 홈으로 리디렉션
      window.location.href = '/';
    } else {
      // 사용자 ID가 없거나 잘못된 경우 로그인 페이지로 리디렉션
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">자동 로그인 중...</h1>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}