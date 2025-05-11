// 프리뷰 서버 (5000 포트에서 실행)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5000;

// 메인 서버로 프록시
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  ws: true
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'client')));

// API 요청 프록시
app.use('/api', apiProxy);

// 모든 경로에 대해 index.html 반환 (SPA 지원)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`프리뷰 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`해빗 트렉커 앱을 프리뷰에서 확인할 수 있습니다`);
});