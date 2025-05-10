// 커스텀 정적 서버 실행
const { spawn } = require('child_process');

console.log('정적 파일 서버를 시작합니다...');
const server = spawn('node', ['server.cjs']);

server.stdout.on('data', (data) => {
  console.log(`서버 출력: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`서버 오류: ${data}`);
});

server.on('close', (code) => {
  console.log(`서버가 종료되었습니다. 코드: ${code}`);
});