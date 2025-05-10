const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log(`요청 처리: ${req.url}`);
  
  // 기본 경로로 리다이렉트
  let filePath = './no-auth-app.html';
  
  if (req.url !== '/') {
    // 요청 URL에 해당하는 파일 경로 설정
    filePath = '.' + req.url;
  }
  
  // 파일 확장자에 따른 Content-Type 설정
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  }[extname] || 'application/octet-stream';

  // 파일 읽기
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 파일이 존재하지 않는 경우, 404 페이지 제공
        fs.readFile('./no-auth-app.html', (err, data) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data, 'utf-8');
        });
      } else {
        // 서버 오류
        res.writeHead(500);
        res.end(`서버 오류: ${error.code}`);
      }
    } else {
      // 파일 내용 제공
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});