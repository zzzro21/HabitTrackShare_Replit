// 정적 파일 서버
const http = require('http');
const fs = require('fs');
const path = require('path');

// 로그인 페이지 내용
let loginPageContent;
try {
  loginPageContent = fs.readFileSync('login-view.html', 'utf8');
} catch (err) {
  console.error('로그인 페이지 파일을 읽을 수 없습니다:', err);
  loginPageContent = `
    <html>
      <head><title>오류</title></head>
      <body>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>로그인 페이지를 로드하는 중 오류가 발생했습니다.</p>
      </body>
    </html>
  `;
}

// 서버 생성
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/login' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(loginPageContent);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 - 페이지를 찾을 수 없습니다</h1>');
  }
});

// 서버 포트 설정
const port = 8080;
server.listen(port, '0.0.0.0', () => {
  console.log(`정적 파일 서버가 http://localhost:${port}에서 실행 중입니다.`);
});