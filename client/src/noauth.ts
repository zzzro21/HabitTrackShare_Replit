/**
 * 로그인 없이 앱을 사용하기 위한 기본 사용자 설정
 */

// 기본 사용자 (김유나)
export const defaultUser = {
  id: 15,  // 서버의 사용자 ID (김유나는 ID 15)
  name: '김유나',
  username: 'kim',
  avatar: '👧🏻'
};

// Zustand 저장소와 호환되는 형식으로 로그인 설정 함수
export function setupNoAuth() {
  // 로컬 스토리지에 기본 사용자 정보 저장 (Zustand persist 형식으로)
  const authStateData = {
    state: {
      isAuthenticated: true,
      user: defaultUser,
      apiKey: '',
      notionToken: '',
      isLoading: false
    },
    version: 0
  };
  
  try {
    // Zustand 저장소 키 사용
    localStorage.setItem('user-auth-storage', JSON.stringify(authStateData));
    console.log('자동 로그인 설정 완료:', defaultUser.name);
  } catch (err) {
    console.error('로컬 스토리지 접근 오류:', err);
  }
  
  return defaultUser;
}

// 사용자 정보 가져오기 (사용자가 없으면 기본 사용자 리턴)
export function getCurrentUser() {
  try {
    // Zustand 저장소 키 사용
    const authStr = localStorage.getItem('user-auth-storage');
    if (authStr) {
      const parsedData = JSON.parse(authStr);
      if (parsedData?.state?.isAuthenticated && parsedData?.state?.user) {
        return parsedData.state.user;
      }
    }
  } catch (err) {
    console.error('사용자 정보 액세스 오류:', err);
  }
  
  // 로컬 스토리지에 데이터가 없으면 기본 사용자 리턴
  return setupNoAuth();
}