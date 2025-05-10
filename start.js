// 서버 시작용 스크립트
import { exec } from 'child_process';

console.log('Starting simple server...');
exec('node simple-server.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`서버 실행 에러: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`서버 오류: ${stderr}`);
    return;
  }
  console.log(`서버 출력: ${stdout}`);
});