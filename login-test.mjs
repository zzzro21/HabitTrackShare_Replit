// 테스트 서버 - 로그인 기능 테스트용 (ES 모듈 형식)
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
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

// HTML 템플릿 (로그인 페이지)
const loginHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>로그인 - 습관 추적기</title>
  <style>
    body {
      font-family: 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    .login-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      padding: 30px;
      width: 100%;
      max-width: 400px;
    }
    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 20px;
    }
    form {
      display: flex;
      flex-direction: column;
    }
    label {
      margin-bottom: 5px;
      font-weight: bold;
      color: #555;
    }
    input {
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      background: #4c6ef5;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s;
    }
    button:hover {
      background: #364fc7;
    }
    .error {
      color: #e03131;
      margin-bottom: 15px;
      text-align: center;
    }
    .message {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #868e96;
    }
    .message a {
      color: #4c6ef5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>로그인</h1>
    <div id="error-message" class="error"></div>
    
    <form id="login-form">
      <label for="username">아이디</label>
      <input type="text" id="username" name="username" required>
      
      <label for="password">비밀번호</label>
      <input type="password" id="password" name="password" required>
      
      <button type="submit">로그인</button>
    </form>
    
    <p class="message">
      계정이 없으신가요? <a href="/register">회원가입</a>
    </p>
  </div>
  
  <script>
    document.getElementById('login-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorElement = document.getElementById('error-message');
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // 로그인 성공
          errorElement.textContent = '';
          window.location.href = '/home';
        } else {
          // 로그인 실패
          errorElement.textContent = data.message || '로그인에 실패했습니다.';
        }
      } catch (error) {
        errorElement.textContent = '서버 오류가 발생했습니다. 다시 시도해주세요.';
      }
    });
  </script>
</body>
</html>
`;

// HTML 템플릿 (홈 페이지)
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
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f8f9fa;
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
    .habit-status {
      margin-top: 20px;
    }
    .habit-item {
      background: #f1f3f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">습관 추적기</div>
    <div class="user-info">
      <div class="avatar" id="user-avatar"></div>
      <div class="username" id="user-name"></div>
      <button class="logout" id="logout-button">로그아웃</button>
    </div>
  </header>
  
  <div class="container">
    <div class="welcome">
      <h1>안녕하세요, <span id="greeting-name"></span>님!</h1>
      <p>오늘도 습관을 관리하고 친구들과 성장하세요.</p>
    </div>
    
    <div class="habit-status">
      <h2>나의 습관 현황</h2>
      <div class="habit-item">
        <h3>📚 독서</h3>
        <p>오늘의 독서를 기록하세요.</p>
      </div>
      <div class="habit-item">
        <h3>🎬 영상 시청</h3>
        <p>학습 영상을 시청하고 감상을 기록하세요.</p>
      </div>
      <div class="habit-item">
        <h3>🔍 제품 사용</h3>
        <p>오늘 사용한 제품을 기록하세요.</p>
      </div>
    </div>
  </div>
  
  <script>
    // 사용자 정보 가져오기
    async function fetchUserInfo() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success) {
          const user = data.user;
          document.getElementById('user-avatar').textContent = user.avatar;
          document.getElementById('user-name').textContent = user.name;
          document.getElementById('greeting-name').textContent = user.name;
        } else {
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 오류:', error);
      }
    }
    
    // 로그아웃 처리
    document.getElementById('logout-button').addEventListener('click', async function() {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('로그아웃 오류:', error);
      }
    });
    
    // 페이지 로드 시 사용자 정보 가져오기
    fetchUserInfo();
  </script>
</body>
</html>
`;

// 라우트 정의
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
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
    console.log(`비밀번호 검증 결과: ${isPasswordValid}`);
    
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
    res.json({
      success: true,
      message: '로그인되었습니다.',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
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
      return res.status(500).json({
        success: false,
        message: '로그아웃 중 오류가 발생했습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
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
  console.log(`테스트 서버가 http://localhost:${port}에서 실행 중입니다.`);
});