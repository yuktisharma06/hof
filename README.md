# InterviewMesh 🧠⚡

> AI-Powered Peer-to-Peer Mock Interview Platform

A production-ready web application where users get matched with ideal peers using ML, practice coding in real-time collaboratively, receive adaptive learning roadmaps, and get intelligent feedback on their performance.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![Stack](https://img.shields.io/badge/Node.js-Express-green) ![Stack](https://img.shields.io/badge/Python-FastAPI-blue) ![Stack](https://img.shields.io/badge/ML-XGBoost%20%7C%20IsolationForest%20%7C%20BKT-purple)

---

## 🏗️ Architecture

```
interviewmesh/
├── frontend/          # Next.js 15 + Tailwind + Framer Motion
├── backend/           # Node.js + Express + Socket.io
│   └── data/          # JSON file-based database (zero setup)
└── ml-service/        # Python + FastAPI + scikit-learn + XGBoost
    └── models/        # ML model implementations
```

## 🧠 ML Features

| Feature | Model | Description |
|---------|-------|-------------|
| Peer Matching | XGBoost Classifier | Learning-to-rank for optimal partner selection |
| Anomaly Detection | Isolation Forest | Detects cheating: typing speed, paste behavior, tab switches |
| Knowledge Tracing | Bayesian KT (BKT) | Tracks mastery probability per topic |
| Code Evaluation | AST Parsing | Analyzes correctness, efficiency, and coding style |
| Feedback Generator | NLP Templates | Human-like post-session reviews |
| Resume Parser | Regex NLP | Extracts skills and maps to interview topics |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
# → http://localhost:3001
```

### 3. ML Service (optional — backend has fallback responses)
```bash
cd ml-service
pip install -r requirements.txt
python main.py
# → http://localhost:8000
```

> **Note:** The backend has built-in fallback responses for all ML endpoints, so the app works even without the ML service running.

## 💻 Features

- **Landing Page** — Animated hero with particle effects and typewriter code demo
- **Dashboard** — Skill radar, progress charts, topic mastery bars, session timeline
- **Collaborative Session** — Monaco Editor with live cursor tracking, chat, timer
- **Peer Matching** — XGBoost-ranked matches with compatibility breakdown
- **AI Interviewer** — Adaptive questioning with follow-up based on your code
- **Resume Parser** — NLP skill extraction mapped to interview prep topics
- **Code Evaluation** — AST-based analysis with efficiency and style scoring
- **Integrity Monitor** — Isolation Forest anomaly detection with explanations

## 🎨 Design

- Glassmorphism + dark mode
- Inter typography
- Framer Motion animations
- Deep indigo/cyan gradient palette
- Loading skeletons (no spinners)

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, Tailwind CSS, Framer Motion, Monaco Editor, Recharts |
| Backend | Node.js, Express, Socket.io |
| ML Service | Python, FastAPI, scikit-learn, XGBoost |
| Database | JSON files (zero-setup) |
