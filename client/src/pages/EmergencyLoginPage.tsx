import { useEffect } from 'react';

export default function EmergencyLoginPage() {
  const users = [
    { id: 1, name: '곽완신', username: 'user1', avatar: '👨‍💼' },
    { id: 2, name: '마정수', username: 'user2', avatar: '👩‍💼' },
    { id: 3, name: '조갑석', username: 'user3', avatar: '👨‍🦱' },
    { id: 4, name: '이경희', username: 'user4', avatar: '👩‍🦰' },
    { id: 5, name: '박경희', username: 'user5', avatar: '👱‍♀️' },
    { id: 6, name: '김철수', username: 'user6', avatar: '👩‍🦳' },
    { id: 7, name: '최지혜', username: 'user7', avatar: '👩‍🦱' },
    { id: 8, name: '김미희', username: 'user8', avatar: '👧' }
  ];

  const handleLogin = (user: typeof users[0]) => {
    try {
      const authData = {
        isLoggedIn: true,
        user: user
      };
      
      // 로컬 스토리지와 세션 스토리지 모두 저장
      localStorage.setItem('userAuth', JSON.stringify(authData));
      sessionStorage.setItem('userAuth', JSON.stringify(authData));
      
      // 홈으로 이동
      window.location.href = '/';
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 쿠키 확인 함수
  const checkCookies = () => {
    document.getElementById('cookieStatus')!.innerText = 
      `쿠키 사용 가능: ${navigator.cookieEnabled}`;
  };

  useEffect(() => {
    checkCookies();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>긴급 로그인</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <p>이 페이지는 모바일 환경에서 로그인 문제가 있을 때 사용하는 긴급 로그인 페이지입니다.</p>
        <p id="cookieStatus" style={{ fontWeight: 'bold', marginTop: '10px' }}></p>
      </div>
      
      <h2 style={{ marginBottom: '15px' }}>사용자 선택</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => handleLogin(user)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '15px',
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '24px', marginBottom: '5px' }}>{user.avatar}</span>
            <span style={{ fontWeight: 'bold' }}>{user.name}</span>
            <span style={{ fontSize: '12px', color: '#666' }}>{user.username}</span>
          </button>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff8e1', borderRadius: '5px' }}>
        <p><strong>참고:</strong> 이 로그인 방식은 일반 로그인이 작동하지 않을 때만 사용하세요.</p>
      </div>
    </div>
  );
}