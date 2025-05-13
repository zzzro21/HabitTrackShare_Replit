// 환경별 API 엔드포인트 설정
const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-api-url.com/api' // 프로덕션 API URL 설정
    : 'http://localhost:3000/api', // 개발용 API URL 설정
  
  // GitHub Pages 배포를 감지하여 상대 경로 사용
  isGitHubPages: window.location.hostname.includes('github.io'),
  
  // 정적 배포에 사용할 예시 데이터 활성화 여부
  useStaticData: true, // GitHub Pages 배포에서는 이 값을 true로 설정
};

// GitHub Pages에 배포된 경우 상대 경로 설정
if (config.isGitHubPages) {
  config.apiUrl = './api'; // 상대 경로로 API를 참조
  config.useStaticData = true; // 정적 데이터 사용
}

export default config;