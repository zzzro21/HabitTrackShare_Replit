// Simple HTTP server to start quickly
import http from 'http';
import fs from 'fs';
import path from 'path';

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Habit Tracker</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      text-align: center;
      background-color: #f8f9fa;
      color: #333;
    }
    .container {
      max-width: 500px;
      margin: 40px auto;
      padding: 30px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0 0 20px;
      font-size: 28px;
      font-weight: 600;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
    .loading {
      margin: 30px 0;
    }
    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0,0,0,0.1);
      border-radius: 50%;
      border-top: 4px solid #3498db;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>습관 추적기</h1>
    <p>8주간의 성장 추적, 친구들과 함께 만드는 변화</p>
    
    <div class="loading">
      <div class="spinner"></div>
      <p>서버가 시작되고 있습니다...</p>
    </div>
  </div>
</body>
</html>
`;

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

// Start listening on port 8080 (commonly allowed in Replit)
server.listen(8080, '0.0.0.0', () => {
  console.log('Simple HTTP server running at http://0.0.0.0:8080');
});