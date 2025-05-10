import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 얻기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 서버 생성
const app = express();
const port = process.env.PORT || 5000;
const host = '0.0.0.0';

// 정적 파일 제공
app.use(express.static('public'));
app.use(express.static('.'));

// 기본 경로
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 헬스체크 경로
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 모든 경로를 index.html로 라우팅 (SPA 스타일)
app.get('*', (req, res) => {
  // API 요청이면 404 반환
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API 경로를 찾을 수 없습니다.' });
  }
  
  // 그 외에는 index.html 제공
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(port, host, () => {
  console.log(`초간단 서버가 http://${host}:${port}에서 실행 중입니다.`);
  console.log(`다음 URL로 접속해보세요: http://localhost:${port}/`);
});