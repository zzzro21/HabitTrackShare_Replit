// 매우 단순한 테스트 웹 서버
const http = require('http');

// HTML 페이지 생성
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>테스트 서버</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    h1 { color: #4f46e5; }
    p { color: #6b7280; }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 20px 0;
    }
    input {
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }
    button {
      padding: 10px;
      background-color: #4f46e5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #4338ca;
    }
    .response {
      margin-top: 20px;
      padding: 10px;
      background-color: #f3f4f6;
      border-radius: 4px;
      min-height: 50px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>테스트 서버 작동 중</h1>
    <p>간단한 로그인 테스트</p>
    
    <div class="login-form">
      <input type="text" id="username" placeholder="아이디 (admin)">
      <input type="password" id="password" placeholder="비밀번호 (password123)">
      <button id="login-btn">로그인</button>
    </div>
    
    <div class="response" id="response">
      응답이 여기에 표시됩니다
    </div>
  </div>

  <script>
    document.getElementById('login-btn').addEventListener('click', function() {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const response = document.getElementById('response');
      
      if (username === 'admin' && password === 'password123') {
        response.innerHTML = '<span style="color: green">로그인 성공!</span><br>사용자: admin<br>테스트 서버가 정상적으로 작동 중입니다.';
      } else {
        response.innerHTML = '<span style="color: red">로그인 실패</span><br>올바른 아이디와 비밀번호를 입력하세요.';
      }
    });
  </script>
</body>
</html>
`;

// 서버 생성
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(html);
});

// 서버 시작
const port = 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`테스트 서버가 http://localhost:${port}에서 실행 중입니다.`);
});