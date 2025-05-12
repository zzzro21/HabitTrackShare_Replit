/**
 * 로그인 없이 앱을 사용하기 위한 기본 사용자 설정
 */

// 기본 사용자 (김유나)
export const defaultUser = {
  id: 6,
  name: '김유나',
  username: 'zzzro',
  avatar: '👩‍🦳'
};

// 로그인 설정 함수
export function setupNoAuth() {
  // 로컬 스토리지에 기본 사용자 정보 저장
  const authData = {
    isLoggedIn: true,
    user: defaultUser
  };
  
  try {
    localStorage.setItem('userAuth', JSON.stringify(authData));
    console.log('자동 로그인 설정 완료:', defaultUser.name);
  } catch (err) {
    console.error('로컬 스토리지 접근 오류:', err);
  }
  
  return defaultUser;
}

// 사용자 정보 가져오기 (사용자가 없으면 기본 사용자 리턴)
export function getCurrentUser() {
  try {
    const authStr = localStorage.getItem('userAuth');
    if (authStr) {
      const authData = JSON.parse(authStr);
      if (authData && authData.user) {
        return authData.user;
      }
    }
  } catch (err) {
    console.error('사용자 정보 액세스 오류:', err);
  }
  
  // 로컬 스토리지에 데이터가 없으면 기본 사용자 리턴
  return setupNoAuth();
}