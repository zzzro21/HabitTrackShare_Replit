// 환경별 API 엔드포인트 설정
const config = {
  apiUrl: '/api', // 기본 API 경로
  
  // GitHub Pages 배포를 감지하여 상대 경로 사용
  // Replit에서 테스트할 때는 강제로 false로 설정
  isGitHubPages: false, // 실제 배포 시에는 window.location.hostname.includes('github.io')로 변경
  
  // 정적 배포에 사용할 예시 데이터 활성화 여부
  // Replit에서 테스트할 때는 강제로 false로 설정
  useStaticData: false, // GitHub Pages 배포에서는 이 값을 true로 설정
};

// GitHub Pages에 배포된 경우 상대 경로 설정
if (config.isGitHubPages) {
  config.apiUrl = './api'; // 상대 경로로 API를 참조
  config.useStaticData = true; // 정적 데이터 사용
}

export default config;