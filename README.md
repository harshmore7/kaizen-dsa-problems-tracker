# 改善 KAIZEN — Coding Problem Tracker

> *Kaizen (改善) — Japanese for "continuous improvement"*

A full-stack coding problem tracker built for serious competitive programmers. Track problems across LeetCode, GeeksForGeeks, Codeforces, CodeChef and more — with spaced repetition, XP gamification, a Monaco code editor, weakness detection, and rich analytics.

![Stack](https://img.shields.io/badge/Django-5.1-092E20?style=flat-square&logo=django)
![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)
![Stack](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![Stack](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=flat-square&logo=tailwindcss)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Auto-fetch** | Paste a LeetCode / GFG / Codeforces URL — title, difficulty & topics fill automatically |
| 🏷️ **Multi-topic tagging** | Tag each problem with multiple topics (70+ topics from LeetCode's full list) |
| 🧠 **Spaced Repetition** | SM-2 algorithm schedules revision — problems resurface exactly when you're about to forget |
| ⚡ **XP & Levels** | Earn XP for solving (Easy +10, Medium +25, Hard +50) and maintaining streaks |
| 🔥 **Streak Tracking** | Daily streak counter with longest streak record |
| 💻 **Monaco Code Editor** | VS Code-quality editor embedded per problem — supports 10 languages |
| ⏱️ **Time Tracking** | Built-in timer per problem — tracks total time invested |
| 📊 **Analytics** | Heatmap, weakness detector, difficulty progression, platform breakdown |
| 🎯 **Weakness Detector** | Identifies topics with lowest solve rates — tells you exactly where to focus |
| 🗂️ **Multi-platform** | LeetCode, GeeksForGeeks, Codeforces, CodeChef, HackerRank, Other |

---

## 🛠️ Tech Stack

```
Frontend    React 18 + Vite + Tailwind CSS 3 + Recharts + Monaco Editor
Backend     Django 5.1 + Django REST Framework
Database    MySQL 8.0
Container   Docker + Docker Compose
Proxy       Nginx (production)
```

---

## 📸 Screenshots

```
Problems Page    — filterable table with inline expand, timer, code editor
Analytics Page   — heatmap, charts, weakness detector, XP dashboard  
Add Problem      — URL auto-fill modal with multi-topic selector
Code Editor      — Monaco editor with 10 language options per problem
Review System    — spaced repetition modal with SM-2 algorithm
```

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites

Make sure you have these installed:

| Tool | Version | Check |
|------|---------|-------|
| Docker Desktop | Latest | `docker --version` |
| Git | Any | `git --version` |

That's it. Docker handles everything else.

### 1. Clone the repository

```bash
git clone https://github.com/harshmore7/kaizen-dsa-problems-tracker.git
cd kaizen
```

### 2. Create the backend environment file

```bash
# Create the .env file inside the backend folder
```

Create `backend/.env` with the following content:

```env
DEBUG=True
SECRET_KEY=your-secret-key-change-this-in-production
DB_NAME=kaizen_db
DB_USER=kaizen_user
DB_PASSWORD=kaizen_pass
DB_HOST=db
DB_PORT=3306
ALLOWED_HOSTS=localhost,127.0.0.1,backend
```

> ⚠️ **Important:** `DB_HOST=db` must stay as `db` — this is the Docker service name, not localhost.

### 3. Build and start all containers

```bash
docker-compose up --build
```

This will:
- Pull MySQL 8.0 image
- Build the Django backend container
- Build the React frontend via Nginx
- Run all database migrations automatically
- Start all 3 services

First build takes **3–5 minutes**. Subsequent starts take ~10 seconds.

### 4. Seed the topics

Open a new terminal and run:

```bash
docker exec -it kaizen_backend python manage.py shell -c "
from problems.models import Topic
topics = [
    'Array', 'String', 'Hash Table', 'Math', 'Dynamic Programming', 'Sorting', 'Greedy',
    'Depth-First Search', 'Binary Search', 'Database', 'Bit Manipulation', 'Matrix', 'Tree',
    'Breadth-First Search', 'Two Pointers', 'Prefix Sum', 'Heap (Priority Queue)', 'Simulation',
    'Counting', 'Graph Theory', 'Binary Tree', 'Stack', 'Sliding Window', 'Enumeration', 'Design',
    'Backtracking', 'Union-Find', 'Number Theory', 'Linked List', 'Ordered Set', 'Segment Tree',
    'Monotonic Stack', 'Divide and Conquer', 'Trie', 'Combinatorics', 'Bitmask', 'Queue',
    'Recursion', 'Geometry', 'Binary Indexed Tree', 'Memoization', 'Binary Search Tree',
    'Hash Function', 'Topological Sort', 'Shortest Path', 'String Matching', 'Rolling Hash',
    'Game Theory', 'Interactive', 'Data Stream', 'Monotonic Queue', 'Brainteaser',
    'Doubly-Linked List', 'Merge Sort', 'Randomized', 'Counting Sort', 'Iterator',
    'Concurrency', 'Quickselect', 'Suffix Array', 'Sweep Line', 'Probability and Statistics',
    'Minimum Spanning Tree', 'Bucket Sort', 'Shell', 'Reservoir Sampling',
    'Strongly Connected Component', 'Eulerian Circuit', 'Radix Sort', 'Rejection Sampling',
    'Biconnected Component'
]
for t in topics:
    Topic.objects.get_or_create(name=t)
print('Done —', Topic.objects.count(), 'topics loaded')
"
```

### 5. Create an admin account (optional)

```bash
docker exec -it kaizen_backend python manage.py createsuperuser
```

### 6. Open KAIZEN

| URL | What's there |
|-----|-------------|
| `http://localhost` | KAIZEN app (production build) |
| `http://localhost:8000/api/` | REST API browser |
| `http://localhost:8000/admin/` | Django admin panel |

---

## 💻 Local Development Setup

Use this if you want hot-reload for both frontend and backend while developing.

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| Docker Desktop | Latest | `docker --version` |
| Git | Any | `git --version` |

### 1. Clone the repository

```bash
git clone https://github.com/harshmore7/kaizen-dsa-problems-tracker.git
cd kaizen
```

### 2. Start the database only via Docker

```bash
docker-compose up db
```

Leave this running in a terminal.

### 3. Set up the backend

Open a new terminal:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DEBUG=True
SECRET_KEY=kaizen-dev-secret-key
DB_NAME=kaizen_db
DB_USER=kaizen_user
DB_PASSWORD=kaizen_pass
DB_HOST=127.0.0.1
DB_PORT=3307
ALLOWED_HOSTS=*
```

> Note: In local dev, `DB_HOST=127.0.0.1` and `DB_PORT=3307` because MySQL is exposed on your machine via Docker's port mapping.

```bash
# Run migrations
python manage.py migrate

# Seed topics
python manage.py shell -c "
from problems.models import Topic
topics = ['Array','String','Hash Table','Math','Dynamic Programming','Sorting','Greedy','Depth-First Search','Binary Search','Bit Manipulation','Matrix','Tree','Breadth-First Search','Two Pointers','Prefix Sum','Heap (Priority Queue)','Simulation','Counting','Graph Theory','Binary Tree','Stack','Sliding Window','Enumeration','Design','Backtracking','Union-Find','Number Theory','Linked List','Segment Tree','Monotonic Stack','Divide and Conquer','Trie','Combinatorics','Bitmask','Queue','Recursion','Binary Indexed Tree','Memoization','Binary Search Tree','Topological Sort','Shortest Path','String Matching','Merge Sort','Counting Sort','Quickselect','Suffix Array','Minimum Spanning Tree','Bucket Sort']
for t in topics:
    Topic.objects.get_or_create(name=t)
print(Topic.objects.count(), 'topics ready')
"

# Start Django dev server
python manage.py runserver
```

Backend is now live at `http://localhost:8000`

### 4. Set up the frontend

Open another new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend is now live at `http://localhost:5173` with hot-reload.

### 5. Verify everything works

```bash
# Should return the API root
curl http://localhost:8000/api/

# Should return empty problems list
curl http://localhost:8000/api/problems/
```

Open `http://localhost:5173` and start tracking!

---

## 📁 Project Structure

```
kaizen/
├── backend/                    # Django project
│   ├── core/                   # Django settings, URLs
│   │   ├── settings.py
│   │   └── urls.py
│   ├── problems/               # Main app
│   │   ├── models.py           # Problem, Topic, Solution, Revision, UserStats
│   │   ├── serializers.py      # DRF serializers
│   │   ├── views.py            # API views + business logic
│   │   ├── urls.py             # API routing
│   │   ├── scraper.py          # URL scraper (LC, GFG, CF)
│   │   └── admin.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/                   # React + Vite project
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProblemRow.jsx  # Expandable row with timer + code editor
│   │   │   ├── ProblemModal.jsx # Add/edit modal with auto-fill
│   │   │   ├── CodeEditor.jsx  # Monaco editor wrapper
│   │   │   ├── Timer.jsx       # Per-problem stopwatch
│   │   │   ├── ReviewBanner.jsx # Spaced repetition banner
│   │   │   ├── ReviewModal.jsx  # SM-2 review modal
│   │   │   └── XPBar.jsx       # Navbar XP + streak display
│   │   ├── pages/
│   │   │   ├── Problems.jsx    # Main problems page
│   │   │   └── Analytics.jsx   # Full analytics dashboard
│   │   ├── api.js              # Axios instance
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/problems/` | List all problems (supports `?search=`, `?topic=`, `?difficulty=`, `?status=`, `?platform=`) |
| `POST` | `/api/problems/` | Create a problem |
| `PATCH` | `/api/problems/:id/` | Update a problem |
| `DELETE` | `/api/problems/:id/` | Delete a problem |
| `POST` | `/api/problems/:id/mark_solved/` | Mark as solved + award XP |
| `POST` | `/api/problems/:id/revise/` | Mark for revision + schedule review |
| `POST` | `/api/problems/:id/solution/` | Save solution (brute force, optimized, code) |
| `POST` | `/api/problems/:id/review/` | Submit SM-2 review (quality 0–4) |
| `POST` | `/api/problems/:id/log_time/` | Log time spent in minutes |
| `GET` | `/api/topics/` | List all topics |
| `POST` | `/api/fetch-problem/` | Auto-fetch problem details from URL |
| `GET` | `/api/review-queue/` | Get problems due for review today |
| `GET` | `/api/stats/` | Get XP, level, streak data |
| `GET` | `/api/analytics/` | Full analytics data |

---

## 🧠 Spaced Repetition Algorithm

KAIZEN uses the **SM-2 algorithm** (same as Anki):

| Rating | Meaning | Next Review |
|--------|---------|-------------|
| 0 — Forgot | Complete blank | Tomorrow |
| 1 — Hard | Needed lots of help | 3 days |
| 2 — Okay | Got it with effort | 7 days |
| 3 — Easy | Minor hesitation | 14 days |
| 4 — Perfect | Instant recall | 30 days |

The interval grows each time you recall successfully. Forgetting resets the interval to 1 day.

---

## ⚡ XP System

| Action | XP Earned |
|--------|-----------|
| Solve Easy problem | +10 XP |
| Solve Medium problem | +25 XP |
| Solve Hard problem | +50 XP |
| Daily streak bonus | +5 XP |
| Mark for revision | +2 XP |
| Review (Okay) | +5 XP |
| Review (Easy) | +8 XP |
| Review (Perfect) | +10 XP |

Every **100 XP = 1 Level**. Level shown in the navbar with a live progress bar.

---

## 🐳 Docker Commands Reference

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Rebuild after code changes
docker-compose up --build

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f backend

# Run Django management commands
docker exec -it kaizen_backend python manage.py <command>

# Open Django shell
docker exec -it kaizen_backend python manage.py shell

# Reset the database (careful!)
docker-compose down -v
docker-compose up --build
```

---

## 🔧 Troubleshooting

**Port 3306 already in use**
```bash
# Change the MySQL host port in docker-compose.yml
ports:
  - "3307:3306"   # use 3307 instead
```

**Backend can't connect to database**
> Make sure `DB_HOST=db` in your `.env` when using Docker (not `localhost`)

**Frontend shows blank page after Docker build**
```bash
# Rebuild the frontend container
docker-compose build frontend
docker-compose up
```

**Topics not showing in the modal**
```bash
# Re-run the topic seeder
docker exec -it kaizen_backend python manage.py shell -c "
from problems.models import Topic
print(Topic.objects.count(), 'topics in database')
"
```

**Auto-fill not working for LeetCode**
> LeetCode's GraphQL API occasionally rate-limits. Wait a moment and try again.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feat/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify and distribute.

---

<div align="center">
  <strong>Built with 改善 — continuous improvement</strong><br/>
  <sub>Django · React · MySQL · Docker</sub>
</div>
