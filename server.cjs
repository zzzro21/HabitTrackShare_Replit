const express = require('express');
const path = require('path');

// 서버 생성
const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

// 정적 파일 제공
app.use(express.static('.'));
app.use(express.static('./public'));

// URL 매핑
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'direct-app.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'direct-app.html'));
});

app.get('/static', (req, res) => {
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

// 서버 시작
app.listen(port, host, () => {
  console.log(`정적 파일 서버가 http://${host}:${port}에서 실행 중입니다.`);
});