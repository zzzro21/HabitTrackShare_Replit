// 테스트 로그인 서버
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 로그인 페이지 내용 가져오기
let loginHtml;
try {
  loginHtml = fs.readFileSync(path.join(__dirname, 'login-view.html'), 'utf8');
} catch (err) {
  console.error('로그인 페이지를 읽을 수 없습니다:', err);
  loginHtml = `
    <html>
      <head><title>오류</title></head>
      <body>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>로그인 페이지를 로드하는 중 오류가 발생했습니다.</p>
      </body>
    </html>
  `;
}

// 홈 페이지 내용
const homeHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>홈 - 습관 추적기</title>
  <style>
    body {
      font-family: 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif;
      margin: 0;
      padding: 0;
      background: #f8f9fa;
      color: #333;
    }
    header {
      background: white;
      padding: 15px 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 20px;
      font-weight: bold;
      color: #4c6ef5;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .avatar {
      font-size: 24px;
    }
    .username {
      font-weight: bold;
    }
    .logout {
      background: none;
      border: none;
      color: #868e96;
      cursor: pointer;
      padding: 5px 10px;
    }
    .logout:hover {
      text-decoration: underline;
    }
    .container {
      max-width: 800px;
      margin: 30px auto;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    .welcome {
      margin-bottom: 30px;
    }
    .habit-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .habit-item {
      background: #f1f3f5;
      padding: 15px;
      border-radius: 5px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .habit-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 10px rgba(0,0,0,0.05);
    }
    .habit-icon {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .habit-title {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: bold;
    }
    .habit-desc {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    button.primary {
      background: #4c6ef5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 10px;
    }
    button.primary:hover {
      background: #364fc7;
    }
    .stats {
      background: #edf2ff;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
    }
    .stats-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .progress-bar {
      height: 8px;
      background: #dee2e6;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 5px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4c6ef5, #748ffc);
      border-radius: 4px;
      width: 70%;
    }
    .progress-text {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #495057;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">습관 추적기</div>
    <div class="user-info">
      <div class="avatar" id="user-avatar">👤</div>
      <div class="username" id="user-name">관리자</div>
      <form action="/api/auth/logout" method="POST">
        <button type="submit" class="logout">로그아웃</button>
      </form>
    </div>
  </header>
  
  <div class="container">
    <div class="welcome">
      <h1>안녕하세요, <span id="greeting-name">관리자</span>님!</h1>
      <p>오늘도 습관을 관리하고 친구들과 성장하세요.</p>
    </div>
    
    <div class="stats">
      <div class="stats-title">이번 주 진행률: 70%</div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div class="progress-text">
        <span>14 / 20 습관 완료</span>
        <span>+12 포인트</span>
      </div>
    </div>
    
    <h2>나의 습관 현황</h2>
    <div class="habit-grid">
      <div class="habit-item">
        <div class="habit-icon">📚</div>
        <h3 class="habit-title">독서</h3>
        <p class="habit-desc">오늘의 독서 기록하기</p>
        <button class="primary">기록하기</button>
      </div>
      
      <div class="habit-item">
        <div class="habit-icon">🎬</div>
        <h3 class="habit-title">영상 시청</h3>
        <p class="habit-desc">학습 영상 시청 기록하기</p>
        <button class="primary">기록하기</button>
      </div>
      
      <div class="habit-item">
        <div class="habit-icon">🔍</div>
        <h3 class="habit-title">제품 사용</h3>
        <p class="habit-desc">사용한 제품 기록하기</p>
        <button class="primary">기록하기</button>
      </div>
      
      <div class="habit-item">
        <div class="habit-icon">👥</div>
        <h3 class="habit-title">미팅 참석</h3>
        <p class="habit-desc">미팅 참석 여부 기록하기</p>
        <button class="primary">기록하기</button>
      </div>
      
      <div class="habit-item">
        <div class="habit-icon">🎯</div>
        <h3 class="habit-title">제품 배송</h3>
        <p class="habit-desc">제품 배송 내역 기록하기</p>
        <button class="primary">기록하기</button>
      </div>
    </div>
  </div>
  
  <script>
    // 로그인한 사용자 정보를 페이지에 표시
    document.addEventListener('DOMContentLoaded', function() {
      const urlParams = new URLSearchParams(window.location.search);
      const username = urlParams.get('username') || '관리자';
      
      document.getElementById('user-name').textContent = username;
      document.getElementById('greeting-name').textContent = username;
    });
  </script>
</body>
</html>
`;

// Express 앱 생성
const app = express();
const port = 8080;

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secretkey123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // 개발 환경에서는 secure: false
}));

// 임시 사용자 데이터 (테스트용)
const users = [
  {
    id: 9,
    username: 'admin',
    password: '$2b$10$HGY4MyF5Gegk4HqKB7J1RuaHZny3IjcJiWt.HogcT/jjxEqy.nTqi', // password123
    name: '관리자',
    email: 'admin@example.com',
    avatar: '👤'
  },
  {
    id: 1,
    username: 'user1',
    password: '$2b$10$HGY4MyF5Gegk4HqKB7J1RuaHZny3IjcJiWt.HogcT/jjxEqy.nTqi', // password123
    name: '사용자1',
    email: 'user1@example.com',
    avatar: '🙂'
  }
];

// 라우트 정의
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/home');
  }
  res.send(loginHtml);
});

app.get('/home', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.send(homeHtml);
});

// API 엔드포인트
// 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`로그인 시도: ${username}`);
    
    // 사용자 찾기
    const user = users.find(u => u.username === username);
    
    if (!user) {
      console.log(`사용자를 찾을 수 없음: ${username}`);
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 비밀번호 확인
    console.log(`비밀번호 검증 시도: ${username}`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`비밀번호 검증 결과: ${isPasswordValid ? '성공' : '실패'}`);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 세션에 사용자 ID 저장
    req.session.userId = user.id;
    console.log(`로그인 성공: ${username}, 세션 ID 설정: ${user.id}`);
    
    // 응답
    return res.redirect('/home?username=' + encodeURIComponent(user.name));
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
    });
  }
});

// 로그아웃
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('로그아웃 오류:', err);
    }
    res.redirect('/login');
  });
});

// 현재 로그인한 사용자 정보
app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '로그인이 필요합니다.'
    });
  }
  
  const user = users.find(u => u.id === req.session.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '사용자를 찾을 수 없습니다.'
    });
  }
  
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    }
  });
});

// 서버 시작
app.listen(port, '0.0.0.0', () => {
  console.log(`테스트 로그인 서버가 http://localhost:${port}에서 실행 중입니다.`);
});