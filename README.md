# 改善 KAIZEN — Coding Problem Tracker

> _Kaizen (改善) — Japanese for "continuous improvement"_

A full-stack coding problem tracker built for serious competitive programmers. Track problems across LeetCode, GeeksForGeeks, Codeforces, CodeChef and more — with spaced repetition, XP gamification, a Monaco code editor, weakness detection, platform profile integration, and rich analytics.

![Stack](https://img.shields.io/badge/Django-5.1-092E20?style=flat-square&logo=django)
![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)
![Stack](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![Stack](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=flat-square&logo=tailwindcss)

---

## ✨ Features

| Feature                    | Description                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| 🏠 **Landing Page**        | Clean hero page with live stats, feature highlights and CTA                                |
| 👤 **Profile Page**        | Connect LC, GFG and CF accounts — see live stats per platform                              |
| 🔍 **Auto-fetch**          | Paste a LeetCode / GFG / Codeforces URL — title, difficulty & topics fill automatically    |
| 🏷️ **Multi-topic tagging** | Tag each problem with multiple topics (70+ topics from LeetCode's full list)               |
| 🧠 **Spaced Repetition**   | SM-2 algorithm schedules revision — problems resurface exactly when you're about to forget |
| ⚡ **XP & Levels**         | Earn XP for solving (Easy +10, Medium +25, Hard +50) and maintaining streaks               |
| 🔥 **Streak Tracking**     | Daily streak counter with longest streak record                                            |
| 💻 **Monaco Code Editor**  | VS Code-quality editor embedded per problem — supports 10 languages                        |
| ⏱️ **Time Tracking**       | Built-in timer per problem — tracks total time invested                                    |
| 📊 **Analytics**           | Heatmap, weakness detector, difficulty progression, platform breakdown                     |
| 🎯 **Weakness Detector**   | Identifies topics with lowest solve rates — tells you exactly where to focus               |
| 🌙 **Light / Dark Mode**   | Toggle between themes — persists across sessions                                           |
| 🗂️ **Multi-platform**      | LeetCode, GeeksForGeeks, Codeforces, CodeChef, HackerRank, Other                           |

---

## 🛠️ Tech Stack

```
Frontend    React 18 + Vite + Tailwind CSS 3 + Recharts + Monaco Editor (CDN)
Backend     Django 5.1 + Django REST Framework
Database    MySQL 8.0
Container   Docker + Docker Compose
Proxy       Nginx (production)
```

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites

| Tool                    | Check              |
| ----------------------- | ------------------ |
| Docker Desktop (latest) | `docker --version` |
| Git                     | `git --version`    |

### 1. Clone the repository

```bash
git clone https://github.com/harshmore7/kaizen-dsa-problems-tracker.git
cd kaizen-dsa-problems-tracker
```

### 2. Create the backend environment file

Create `backend/.env`:

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

> ⚠️ `DB_HOST=db` must stay as `db` — this is the Docker service name, not localhost.

### 3. Build and start all containers

```bash
docker-compose up --build
```

This will:

- Pull MySQL 8.0 and configure it with memory limits
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

### 5. Open KAIZEN

| URL                            | What's there          |
| ------------------------------ | --------------------- |
| `http://localhost`             | Landing page          |
| `http://localhost/problems`    | Problems dashboard    |
| `http://localhost/analytics`   | Analytics dashboard   |
| `http://localhost/profile`     | Platform profile page |
| `http://localhost:8000/api/`   | REST API browser      |
| `http://localhost:8000/admin/` | Django admin panel    |

---

## 💻 Local Development Setup

Use this if you want hot-reload for both frontend and backend while developing.

### Prerequisites

| Tool           | Version | Check              |
| -------------- | ------- | ------------------ |
| Python         | 3.11+   | `python --version` |
| Node.js        | 18+     | `node --version`   |
| Docker Desktop | Latest  | `docker --version` |
| Git            | Any     | `git --version`    |

### 1. Clone the repository

```bash
git clone https://github.com/harshmore7/kaizen-dsa-problems-tracker.git
cd kaizen-dsa-problems-tracker
```

### 2. Start only the database via Docker

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

```bash
# Run migrations
python manage.py migrate

# Seed topics (run the shell command from Step 4 above)

# Start Django dev server
python manage.py runserver
```

Backend is now live at `http://localhost:8000`

### 4. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend is now live at `http://localhost:5173` with hot-reload.

---

## 📁 Project Structure

```
kaizen/
├── backend/                      # Django project
│   ├── core/                     # Django settings, URLs
│   │   ├── settings.py
│   │   └── urls.py
│   ├── problems/                 # Main app
│   │   ├── models.py             # Problem, Topic, Solution, Revision, UserStats, UserProfile
│   │   ├── serializers.py        # DRF serializers
│   │   ├── views.py              # API views + business logic
│   │   ├── urls.py               # API routing
│   │   ├── scraper.py            # URL scraper (LC, GFG, CF)
│   │   ├── platform_stats.py     # Live stats fetcher (LC GraphQL, GFG scrape, CF API)
│   │   └── admin.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/                     # React + Vite project
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Nav with tabs + theme toggle
│   │   │   ├── ProblemRow.jsx    # Expandable row with timer + code editor
│   │   │   ├── ProblemModal.jsx  # Add/edit modal with auto-fill
│   │   │   ├── CodeEditor.jsx    # Monaco editor (loaded from CDN)
│   │   │   ├── Timer.jsx         # Per-problem stopwatch
│   │   │   ├── ReviewBanner.jsx  # Spaced repetition banner
│   │   │   ├── ReviewModal.jsx   # SM-2 review modal
│   │   │   └── XPBar.jsx         # Navbar XP + streak display
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Landing page with hero + features
│   │   │   ├── Problems.jsx      # Main problems page
│   │   │   ├── Analytics.jsx     # Full analytics dashboard
│   │   │   └── Profile.jsx       # Platform stats + activity heatmap
│   │   ├── ThemeContext.jsx      # Light/dark mode context + localStorage
│   │   ├── api.js                # Axios instance
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

| Method   | Endpoint                         | Description                                                                                  |
| -------- | -------------------------------- | -------------------------------------------------------------------------------------------- |
| `GET`    | `/api/problems/`                 | List all problems (supports `?search=`, `?topic=`, `?difficulty=`, `?status=`, `?platform=`) |
| `POST`   | `/api/problems/`                 | Create a problem                                                                             |
| `PATCH`  | `/api/problems/:id/`             | Update a problem                                                                             |
| `DELETE` | `/api/problems/:id/`             | Delete a problem                                                                             |
| `POST`   | `/api/problems/:id/mark_solved/` | Mark as solved + award XP                                                                    |
| `POST`   | `/api/problems/:id/revise/`      | Mark for revision + schedule review                                                          |
| `POST`   | `/api/problems/:id/solution/`    | Save solution (brute force, optimized, code)                                                 |
| `POST`   | `/api/problems/:id/review/`      | Submit SM-2 review (quality 0–4)                                                             |
| `POST`   | `/api/problems/:id/log_time/`    | Log time spent in minutes                                                                    |
| `GET`    | `/api/topics/`                   | List all topics                                                                              |
| `POST`   | `/api/fetch-problem/`            | Auto-fetch problem details from URL                                                          |
| `GET`    | `/api/review-queue/`             | Get problems due for review today                                                            |
| `GET`    | `/api/stats/`                    | Get XP, level, streak data                                                                   |
| `GET`    | `/api/analytics/`                | Full analytics data                                                                          |
| `GET`    | `/api/profile/`                  | Get saved platform usernames                                                                 |
| `PUT`    | `/api/profile/`                  | Update platform usernames                                                                    |
| `GET`    | `/api/profile/stats/`            | Fetch live stats from LC, GFG and CF                                                         |

---

## 🧠 Spaced Repetition Algorithm

KAIZEN uses the **SM-2 algorithm** (same as Anki):

| Rating      | Meaning             | Next Review |
| ----------- | ------------------- | ----------- |
| 0 — Forgot  | Complete blank      | Tomorrow    |
| 1 — Hard    | Needed lots of help | 3 days      |
| 2 — Okay    | Got it with effort  | 7 days      |
| 3 — Easy    | Minor hesitation    | 14 days     |
| 4 — Perfect | Instant recall      | 30 days     |

The interval grows each time you recall successfully. Forgetting resets the interval to 1 day.

---

## ⚡ XP System

| Action               | XP Earned |
| -------------------- | --------- |
| Solve Easy problem   | +10 XP    |
| Solve Medium problem | +25 XP    |
| Solve Hard problem   | +50 XP    |
| Daily streak bonus   | +5 XP     |
| Mark for revision    | +2 XP     |
| Review (Okay)        | +5 XP     |
| Review (Easy)        | +8 XP     |
| Review (Perfect)     | +10 XP    |

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

# Rebuild a single service
docker-compose build --no-cache frontend

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
  - "3307:3306"
```

**Backend can't connect to database**

> Make sure `DB_HOST=db` in your `.env` when using Docker (not `localhost`)

**Frontend build fails with out of memory**

> Go to Docker Desktop → Settings → Resources → Memory and set to at least 4GB.
> Monaco editor loads from CDN at runtime — it is not bundled, so builds stay lean.

**`worker_processes` nginx error**

> Make sure `nginx.conf` is copied to `/etc/nginx/nginx.conf` (not `conf.d/default.conf`) in the frontend Dockerfile.

**Topics not showing in the modal**

```bash
docker exec -it kaizen_backend python manage.py shell -c "
from problems.models import Topic
print(Topic.objects.count(), 'topics in database')
"
```

**GFG auto-fill returns wrong title**

> The scraper uses `og:title` + URL slug as fallbacks. If GFG changes their HTML again, the slug fallback will always return something sensible.

**Profile stats not loading**

> Make sure your usernames are saved first via the Profile page. CF API is public — no auth needed. LC GraphQL requires the username to be public.

**Light mode text invisible**

> Make sure `index.css` has the `.light` CSS variable block and `ThemeContext.jsx` is wrapping the app in `main.jsx`.

---

## 🌿 Branches

| Branch                 | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `main`                 | Stable production build — core tracker             |
| `feat/profile-landing` | Landing page, Profile page, light/dark mode toggle |

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
