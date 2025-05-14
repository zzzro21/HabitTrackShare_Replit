// 환경별 API 엔드포인트 설정
const config = {
  apiUrl: '/api', // 기본 API 경로
  
  // GitHub Pages 배포를 감지하여 상대 경로 사용
  isGitHubPages: window.location.hostname.includes('github.io'), // GitHub Pages에서 자동 감지
  
  // 정적 배포에 사용할 예시 데이터 활성화 여부
  useStaticData: false, // 기본적으로 false, GitHub Pages에서는 true로 자동 설정
};

// GitHub Pages에 배포된 경우 상대 경로 설정
if (config.isGitHubPages) {
  config.apiUrl = './api'; // 상대 경로로 API를 참조
  config.useStaticData = true; // 정적 데이터 사용
}

export default config;