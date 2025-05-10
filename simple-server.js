import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// __dirname 설정 (ES 모듈용)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 서버 생성
const app = express();
const port = process.env.PORT || 5000;
const host = '0.0.0.0';

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// API 라우트 - 간단한 로그인 체크
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (password === 'password123') {
    const userId = username === 'admin' ? 1 : 
                  username.startsWith('user') ? parseInt(username.replace('user', '')) || 2 : 
                  Math.floor(Math.random() * 100) + 10;
    
    return res.json({
      success: true,
      message: '로그인되었습니다.',
      user: {
        id: userId,
        name: username,
        username: username,
        email: `${username}@example.com`,
        avatar: '👤'
      }
    });
  }
  
  res.status(401).json({
    success: false,
    message: '아이디 또는 비밀번호가 올바르지 않습니다.'
  });
});

// API 라우트 - 현재 사용자 정보
app.get('/api/auth/me', (req, res) => {
  // 클라이언트 측 인증을 사용하므로 항상 성공 응답
  res.json({
    success: true,
    user: {
      id: 1,
      name: 'Guest User',
      username: 'guest',
      email: 'guest@example.com',
      avatar: '👤'
    }
  });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ultimate-login.html'));
});

// 홈 페이지 라우트
app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// 모든 경로 - React 앱으로 리다이렉트 (클라이언트 라우팅)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API 엔드포인트를 찾을 수 없습니다.' });
  }
  
  res.sendFile(path.join(__dirname, 'public', 'ultimate-login.html'));
});

// 서버 시작
app.listen(port, host, () => {
  console.log(`서버가 http://${host}:${port}에서 실행 중입니다.`);
});