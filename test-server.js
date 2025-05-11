// 별도의 터미널에서 실행할 서버 스크립트
import { spawn } from 'child_process';
import { createServer } from 'http';

console.log('🚀 Replit 환경에서 앱 서버 실행 중...');

// 실제 앱 서버 실행 (8080 포트)
const appServer = spawn('node', ['--no-warnings', '--loader=tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '8080', NODE_ENV: 'development' }
});

appServer.on('close', (code) => {
  console.log(`앱 서버가 종료되었습니다. 종료 코드: ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('앱 서버를 종료합니다...');
  appServer.kill();
});