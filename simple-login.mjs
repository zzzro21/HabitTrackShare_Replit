import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

// ES 모듈에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 간단한 로그인 테스트를 위한 Express 앱
const app = express();

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'simple-login-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// 간단한 인메모리 사용자 스토리지
const users = new Map();

// 초기 admin 사용자 생성
async function createAdminUser() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  users.set('admin', {
    id: 1,
    username: 'admin',
    password: hashedPassword,
    name: '관리자',
    email: 'admin@example.com'
  });
  
  console.log('관리자 계정이 생성되었습니다: admin/password123');
}

// 로그인 페이지 HTML
const loginPageHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>로그인 테스트</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .login-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 30px;
      width: 350px;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      color: #666;
    }
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    button {
      background-color: #4f46e5;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 12px 20px;
      width: 100%;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    button:hover {
      background-color: #4338ca;
    }
    .error-message {
      color: #e53e3e;
      margin-top: 15px;
      text-align: center;
    }
    .success-message {
      color: #10b981;
      margin-top: 15px;
      text-align: center;
    }
    .profile-container {
      text-align: center;
    }
    .logout-btn {
      margin-top: 20px;
      background-color: #ef4444;
    }
    .logout-btn:hover {
      background-color: #dc2626;
    }
    .api-key-form {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .info {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 10px;
      margin-bottom: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>로그인 테스트</h1>
    
    <div class="info">
      테스트 계정: admin / password123
    </div>
    
    <div id="login-form">
      <div class="form-group">
        <label for="username">아이디</label>
        <input type="text" id="username" placeholder="아이디 입력">
      </div>
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" placeholder="비밀번호 입력">
      </div>
      <button id="login-btn">로그인</button>
      <div id="error-message" class="error-message"></div>
    </div>
    
    <div id="profile" style="display: none;">
      <div class="profile-container">
        <h2 id="user-name">사용자명</h2>
        <p id="user-email">이메일</p>
        
        <div class="api-key-form">
          <div class="form-group">
            <label for="api-key">API 키 설정</label>
            <input type="text" id="api-key" placeholder="API 키 입력">
          </div>
          <button id="save-api-key">API 키 저장</button>
          <div id="api-message" class="success-message"></div>
        </div>
        
        <button id="logout-btn" class="logout-btn">로그아웃</button>
      </div>
    </div>
  </div>
  
  <script>
    // DOM 요소
    const loginForm = document.getElementById('login-form');
    const profileSection = document.getElementById('profile');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiKeyInput = document.getElementById('api-key');
    const errorMessage = document.getElementById('error-message');
    const apiMessage = document.getElementById('api-message');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    
    // 페이지 로드 시 현재 로그인 상태 확인
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success && data.user) {
          // 로그인 상태면 프로필 표시
          showProfile(data.user);
        }
      } catch (error) {
        console.error('로그인 상태 확인 오류:', error);
      }
    });
    
    // 로그인 버튼 클릭 이벤트
    loginBtn.addEventListener('click', async () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
      
      if (!username || !password) {
        errorMessage.textContent = '아이디와 비밀번호를 입력해주세요.';
        return;
      }
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // 로그인 성공
          errorMessage.textContent = '';
          showProfile(data.user);
        } else {
          // 로그인 실패
          errorMessage.textContent = data.message || '로그인에 실패했습니다.';
        }
      } catch (error) {
        errorMessage.textContent = '로그인 중 오류가 발생했습니다.';
        console.error('로그인 오류:', error);
      }
    });
    
    // 로그아웃 버튼 클릭 이벤트
    logoutBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
          // 로그아웃 성공
          showLoginForm();
        }
      } catch (error) {
        console.error('로그아웃 오류:', error);
      }
    });
    
    // API 키 저장 버튼 클릭 이벤트
    saveApiKeyBtn.addEventListener('click', async () => {
      const googleApiKey = apiKeyInput.value.trim();
      
      if (!googleApiKey) {
        apiMessage.textContent = 'API 키를 입력해주세요.';
        apiMessage.className = 'error-message';
        return;
      }
      
      try {
        const response = await fetch('/api/auth/api-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ googleApiKey })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // 저장 성공
          apiMessage.textContent = 'API 키가 저장되었습니다.';
          apiMessage.className = 'success-message';
        } else {
          // 저장 실패
          apiMessage.textContent = data.message || 'API 키 저장에 실패했습니다.';
          apiMessage.className = 'error-message';
        }
      } catch (error) {
        apiMessage.textContent = 'API 키 저장 중 오류가 발생했습니다.';
        apiMessage.className = 'error-message';
        console.error('API 키 저장 오류:', error);
      }
    });
    
    // 프로필 표시 함수
    function showProfile(user) {
      loginForm.style.display = 'none';
      profileSection.style.display = 'block';
      
      userName.textContent = user.name || user.username;
      userEmail.textContent = user.email || '이메일 없음';
      apiKeyInput.value = user.googleApiKey || '';
    }
    
    // 로그인 폼 표시 함수
    function showLoginForm() {
      loginForm.style.display = 'block';
      profileSection.style.display = 'none';
      
      usernameInput.value = '';
      passwordInput.value = '';
      errorMessage.textContent = '';
    }
  </script>
</body>
</html>
`;

// 홈 및 로그인 페이지 라우트
app.get('/', (req, res) => {
  res.send(loginPageHtml);
});

// API 엔드포인트

// 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`로그인 시도: ${username}`);
    
    // 사용자 조회
    const user = users.get(username);
    
    if (!user) {
      console.log(`사용자를 찾을 수 없음: ${username}`);
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`비밀번호 불일치: ${username}`);
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 세션에 사용자 정보 저장
    req.session.userId = user.id;
    
    console.log(`로그인 성공: ${username}`);
    
    // 민감한 정보 제외하고 응답
    const { password: _, ...userInfo } = user;
    
    return res.json({
      success: true,
      message: '로그인 성공',
      user: userInfo
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    return res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.'
    });
  }
});

// 로그아웃
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('로그아웃 오류:', err);
      return res.status(500).json({
        success: false,
        message: '로그아웃 중 오류가 발생했습니다.'
      });
    }
    
    return res.json({
      success: true,
      message: '로그아웃 성공'
    });
  });
});

// 현재 사용자 정보 조회
app.get('/api/auth/me', (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.json({
        success: false,
        message: '로그인이 필요합니다.'
      });
    }
    
    // 사용자 ID로 사용자 조회
    const user = Array.from(users.values()).find(u => u.id === userId);
    
    if (!user) {
      return res.json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 민감한 정보 제외하고 응답
    const { password, ...userInfo } = user;
    
    return res.json({
      success: true,
      user: userInfo
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '사용자 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

// API 키 설정
app.post('/api/auth/api-key', (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다.'
      });
    }
    
    const { googleApiKey } = req.body;
    
    // 사용자 ID로 사용자 조회
    for (const [username, user] of users.entries()) {
      if (user.id === userId) {
        // API 키 업데이트
        user.googleApiKey = googleApiKey;
        users.set(username, user);
        
        console.log(`API 키 업데이트 완료: ${username}`);
        
        return res.json({
          success: true,
          message: 'API 키가 저장되었습니다.'
        });
      }
    }
    
    return res.status(404).json({
      success: false,
      message: '사용자를 찾을 수 없습니다.'
    });
  } catch (error) {
    console.error('API 키 설정 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'API 키 설정 중 오류가 발생했습니다.'
    });
  }
});

// 서버 시작
const PORT = process.env.PORT || 5000;

// admin 계정 생성 후 서버 시작
createAdminUser().then(() => {
  app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT}에서 접속 가능합니다.`);
  });
});