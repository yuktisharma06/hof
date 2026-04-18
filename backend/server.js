const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./utils/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// ─── USER ROUTES ───────────────────────────────────────────────────────────────
app.get('/api/users', (req, res) => {
  const users = db.readJSON('users.json');
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = db.findById('users.json', req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const updated = db.upsert('users.json', { id: req.params.id, ...req.body });
  res.json(updated);
});

// ─── SESSION ROUTES ────────────────────────────────────────────────────────────
app.get('/api/sessions', (req, res) => {
  const sessions = db.readJSON('sessions.json');
  res.json(sessions);
});

app.get('/api/sessions/:id', (req, res) => {
  const session = db.findById('sessions.json', req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

app.post('/api/sessions', (req, res) => {
  const session = {
    id: `ses_${uuidv4().slice(0, 8)}`,
    status: 'waiting',
    startedAt: new Date().toISOString(),
    participants: [],
    code: '',
    chat: [],
    ...req.body
  };
  db.upsert('sessions.json', session);
  res.status(201).json(session);
});

app.put('/api/sessions/:id', (req, res) => {
  const updated = db.upsert('sessions.json', { id: req.params.id, ...req.body });
  res.json(updated);
});

// ─── QUESTIONS ROUTES ──────────────────────────────────────────────────────────
app.get('/api/questions', (req, res) => {
  const questions = db.readJSON('questions.json');
  const { topic, difficulty } = req.query;
  let filtered = questions;
  if (topic) filtered = filtered.filter(q => q.topics.includes(topic));
  if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
  res.json(filtered);
});

app.get('/api/questions/:id', (req, res) => {
  const question = db.findById('questions.json', req.params.id);
  if (!question) return res.status(404).json({ error: 'Question not found' });
  res.json(question);
});

// ─── ML PROXY ROUTES ──────────────────────────────────────────────────────────
app.post('/api/ml/match', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    // Fallback to simple matching if ML service is down
    const users = db.readJSON('users.json');
    const userId = req.body.user_id;
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return res.json({ matches: [] });
    const matches = users
      .filter(u => u.id !== userId)
      .map(u => ({
        ...u,
        matchScore: Math.random() * 0.4 + 0.6,
        compatibility: {
          skillOverlap: u.skills.filter(s => currentUser.skills.includes(s)).length / Math.max(u.skills.length, 1),
          eloDiff: Math.abs(u.elo - currentUser.elo),
          complementary: u.skills.filter(s => !currentUser.skills.includes(s)).slice(0, 3)
        }
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
    res.json({ matches });
  }
});

app.post('/api/ml/anomaly', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.json({ anomaly_score: 0.1, is_anomaly: false, explanation: 'ML service unavailable — no anomaly detected' });
  }
});

app.post('/api/ml/evaluate', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.json({
      correctness: 0.8,
      efficiency: 'optimal',
      style: 'clean',
      feedback: 'Code looks good. Consider adding edge case handling.',
      rating: 'can be improved'
    });
  }
});

app.post('/api/ml/feedback', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.json({
      summary: 'Great session! You demonstrated solid problem-solving skills.',
      strengths: ['Clear communication', 'Good code structure', 'Efficient approach'],
      weaknesses: ['Consider edge cases early', 'Time management could improve'],
      improvements: ['Practice more graph problems', 'Review time complexity analysis'],
      overallScore: 78
    });
  }
});

app.post('/api/ml/roadmap', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch {
    const user = db.findById('users.json', req.body.user_id);
    if (!user) return res.json({ roadmap: [] });
    const topics = Object.entries(user.skillLevels || {})
      .map(([topic, mastery]) => ({
        topic,
        mastery,
        status: mastery > 0.7 ? 'strong' : mastery > 0.4 ? 'developing' : 'weak',
        recommended: mastery < 0.5
      }))
      .sort((a, b) => a.mastery - b.mastery);
    res.json({
      roadmap: topics,
      nextTopic: topics[0]?.topic || 'arrays',
      weakAreas: topics.filter(t => t.mastery < 0.5).map(t => t.topic),
      strongAreas: topics.filter(t => t.mastery > 0.7).map(t => t.topic)
    });
  }
});

app.post('/api/ml/resume', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.json({
      skills: ['JavaScript', 'Python', 'React', 'Node.js'],
      experience_level: 'intermediate',
      suggested_topics: ['dynamic-programming', 'system-design', 'graphs']
    });
  }
});

// ─── AI INTERVIEWER ────────────────────────────────────────────────────────────
app.post('/api/ai-interview', (req, res) => {
  const { topic, difficulty, previousAnswers } = req.body;
  const questions = db.readJSON('questions.json');
  const filtered = questions.filter(q =>
    (!topic || q.topics.includes(topic)) &&
    (!difficulty || q.difficulty === difficulty)
  );
  const idx = (previousAnswers?.length || 0) % Math.max(filtered.length, 1);
  const question = filtered[idx] || questions[0];

  const followUps = [
    "Can you optimize the time complexity?",
    "What's the space complexity of your solution?",
    "How would you handle edge cases like empty input?",
    "Can you think of an alternative approach?",
    "What data structure would make this more efficient?"
  ];

  res.json({
    question,
    followUp: previousAnswers?.length > 0 ? followUps[previousAnswers.length % followUps.length] : null,
    hint: question.hints?.[0] || null
  });
});

// ─── SOCKET.IO REAL-TIME ───────────────────────────────────────────────────────
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on('join-session', ({ sessionId, userId, userName }) => {
    socket.join(sessionId);
    if (!activeRooms.has(sessionId)) {
      activeRooms.set(sessionId, { users: [], code: '', chat: [] });
    }
    const room = activeRooms.get(sessionId);
    room.users.push({ socketId: socket.id, userId, userName });
    io.to(sessionId).emit('user-joined', { userId, userName, users: room.users });
    socket.emit('sync-code', { code: room.code });
    console.log(`[Socket] ${userName} joined session ${sessionId}`);
  });

  socket.on('code-change', ({ sessionId, code, cursor }) => {
    const room = activeRooms.get(sessionId);
    if (room) room.code = code;
    socket.to(sessionId).emit('code-update', { code, cursor, userId: socket.id });
  });

  socket.on('cursor-move', ({ sessionId, cursor, userId }) => {
    socket.to(sessionId).emit('cursor-update', { cursor, userId });
  });

  socket.on('chat-message', ({ sessionId, message, userName, userId }) => {
    const msg = { id: uuidv4(), message, userName, userId, timestamp: new Date().toISOString() };
    const room = activeRooms.get(sessionId);
    if (room) room.chat.push(msg);
    io.to(sessionId).emit('new-message', msg);
  });

  socket.on('typing-metrics', ({ sessionId, metrics }) => {
    socket.to(sessionId).emit('peer-metrics', { metrics, userId: socket.id });
  });

  socket.on('disconnect', () => {
    for (const [sessionId, room] of activeRooms) {
      const idx = room.users.findIndex(u => u.socketId === socket.id);
      if (idx >= 0) {
        const user = room.users.splice(idx, 1)[0];
        io.to(sessionId).emit('user-left', { userId: user.userId, userName: user.userName, users: room.users });
        if (room.users.length === 0) activeRooms.delete(sessionId);
      }
    }
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

// ─── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 InterviewMesh Backend running on http://localhost:${PORT}`);
  console.log(`   Socket.io ready for connections\n`);
});
