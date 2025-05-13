// GitHub Pages와 같은 정적 호스팅에서 사용할 정적 데이터를 관리하는 함수들
import config from '../config';

/**
 * 정적 API 데이터를 가져오는 함수
 * @param {string} endpoint - 가져올 API 엔드포인트, 예: 'users', 'habits'
 * @returns {Promise} - 데이터를 포함한 프로미스
 */
export async function fetchStaticData(endpoint) {
  try {
    // config에서 설정된 API URL과 함께 정적 JSON 파일 경로 생성
    const apiUrl = config.isGitHubPages
      ? `./api/${endpoint}.json` // GitHub Pages는 상대 경로 사용
      : `${config.apiUrl}/${endpoint}`;
      
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching static data for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * GitHub Pages와 같은 정적 환경에서 apiRequest 함수의 동작을 대체하는 함수
 * @param {string} method - HTTP 메서드 (GET, POST 등)
 * @param {string} url - API 엔드포인트 URL
 * @param {object} data - 요청에 보낼 데이터 (POST 요청 등에 사용)
 * @returns {Promise} - 응답 데이터를 포함한 프로미스
 */
export async function staticApiRequest(method, url, data) {
  // URL에서 엔드포인트 추출 (예: '/api/users' -> 'users')
  let endpoint = url.split('/').pop();
  
  // 특수 케이스 처리
  if (url.includes('auth/status')) {
    endpoint = 'auth-status';
  } else if (url.includes('entries')) {
    // userId 추출 시도
    const userId = url.match(/users\/(\d+)\/entries/)?.[1] || '6';
    endpoint = `user-${userId}-entries`;
    
    // 해당 파일이 없는 경우 기본 더미 데이터 반환
    return [
      { userId: parseInt(userId), habitId: 1, day: 0, value: 30 },
      { userId: parseInt(userId), habitId: 1, day: 1, value: 25 },
      { userId: parseInt(userId), habitId: 2, day: 0, value: 1 },
      { userId: parseInt(userId), habitId: 3, day: 0, value: 1 },
      { userId: parseInt(userId), habitId: 4, day: 1, value: 1 },
      { userId: parseInt(userId), habitId: 5, day: 0, value: 2 },
    ];
  }
  
  try {
    // GET 요청이거나 정적 데이터를 사용하는 경우
    if (method.toUpperCase() === 'GET' || config.useStaticData) {
      return await fetchStaticData(endpoint);
    }
    
    // 정적 환경에서 POST, PUT, DELETE 요청은 console에 로깅하고 가짜 응답 반환
    console.log(`[Static API] ${method} 요청 시뮬레이션:`, url, data);
    
    // POST 요청에 대한 가짜 응답
    if (method.toUpperCase() === 'POST') {
      if (url.includes('login')) {
        return { message: '로그인 성공(정적)', user: { id: 6, name: '김유나', username: 'zeta', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' } };
      }
      
      if (data) {
        // ID 생성 (1-1000 사이의 랜덤 ID)
        const fakeId = Math.floor(Math.random() * 1000) + 1;
        return { ...data, id: fakeId, message: '생성 성공(정적)' };
      }
    }
    
    // 기본 응답
    return { success: true, message: '요청 처리됨(정적)', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error(`Static API request error:`, error);
    throw error;
  }
}