// Simple Express server for our habit tracker app
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory data store
const users = [
  { id: 1, name: "사용자1", avatar: "👤" },
  { id: 2, name: "사용자2", avatar: "👩" },
  { id: 3, name: "사용자3", avatar: "👨" },
  { id: 4, name: "사용자4", avatar: "👧" },
  { id: 5, name: "사용자5", avatar: "👦" },
  { id: 6, name: "사용자6", avatar: "👵" },
  { id: 7, name: "사용자7", avatar: "👴" },
  { id: 8, name: "사용자8", avatar: "👮" }
];

const habits = [
  { id: 1, label: "독서", scoreType: "binary", scoreValue: 1 },
  { id: 2, label: "동영상 시청", scoreType: "binary", scoreValue: 1 },
  { id: 3, label: "제품 사용", scoreType: "graded", scoreValue: 2 },
  { id: 4, label: "미팅 참석", scoreType: "binary", scoreValue: 5 },
  { id: 5, label: "소비자 관리", scoreType: "graded", scoreValue: 2 }
];

let habitEntries = [];
let habitNotes = [];

// API endpoints
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Habit Tracker</title>
        <style>
          body { 
            font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          h1 { color: #333; }
          .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 20px;
            margin-bottom: 20px;
          }
          .user-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          .user-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 10px;
            border-radius: 6px;
            background: #f8f9fa;
            cursor: pointer;
          }
          .user-card:hover {
            background: #e9ecef;
          }
          .avatar {
            font-size: 2rem;
            margin-bottom: 8px;
          }
          .habits {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .habit-item {
            background: #f1f3f5;
            padding: 12px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
          }
          .btn {
            display: inline-block;
            padding: 6px 12px;
            background: #4263eb;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .btn:hover {
            background: #364fc7;
          }
          .btn-small {
            padding: 3px 6px;
            font-size: 0.8rem;
          }
        </style>
      </head>
      <body>
        <h1>습관 추적기</h1>
        
        <div class="card">
          <h2>사용자</h2>
          <div class="user-grid">
            ${users.map(user => `
              <div class="user-card">
                <div class="avatar">${user.avatar}</div>
                <div>${user.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="card">
          <h2>습관</h2>
          <div class="habits">
            ${habits.map(habit => `
              <div class="habit-item">
                <div>${habit.label}</div>
                <div>
                  <button class="btn btn-small">기록</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="card">
          <h2>성장 그래프</h2>
          <p>8주간의 성장 과정을 시각적으로 보여주는 그래프가 이곳에 표시됩니다.</p>
          <div style="height: 200px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            그래프 영역
          </div>
        </div>
        
        <div class="card">
          <h2>오늘의 메모</h2>
          <textarea style="width: 100%; height: 100px; padding: 10px; border-radius: 6px; border: 1px solid #dee2e6;"></textarea>
          <div style="margin-top: 10px;">
            <button class="btn">저장</button>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/habits', (req, res) => {
  res.json(habits);
});

// Parse JSON request bodies
app.use(express.json());

// Create entries
app.post('/api/entries', (req, res) => {
  const { userId, habitId, day, value } = req.body;
  const id = habitEntries.length + 1;
  const entry = { id, userId, habitId, day, value };
  habitEntries.push(entry);
  res.status(201).json(entry);
});

// Create notes
app.post('/api/notes', (req, res) => {
  const { userId, habitId, day, note } = req.body;
  const id = habitNotes.length + 1;
  const noteEntry = { id, userId, habitId, day, note };
  habitNotes.push(noteEntry);
  res.status(201).json(noteEntry);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});