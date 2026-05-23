# GoalFlow — Full-Stack Productivity OS

A modern goal tracking web application built with **React + Vite**, **Node.js + Express**, and **MongoDB**.

---

## 🚀 Features

- **Dashboard** — Stats overview, active goals, today's tasks, weekly chart
- **Goals** — CRUD goals with categories, priorities, progress tracking
- **Tasks** — Full task management with search, filters, goal linking
- **Analytics** — Bar/Line/Doughnut charts, activity heatmap, monthly trends
- **Streaks & Habits** — Habit tracking with 14-day streak grids, log system
- **Calendar** — Monthly calendar with goal deadlines & task due dates
- **Auth** — JWT login/register with bcrypt password hashing

---

## 📁 Project Structure

```
goalflow/
├── backend/
│   ├── models/         # Mongoose schemas (User, Goal, Task, Habit)
│   ├── routes/         # Express routers (auth, goals, tasks, habits, analytics)
│   ├── middleware/     # JWT auth middleware
│   ├── server.js       # Express app entry point
│   ├── .env.example    # Environment variable template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/      # Dashboard, Goals, Tasks, Analytics, Streaks, Calendar, Login, Register
    │   ├── components/ # Layout (sidebar + nav)
    │   ├── context/    # AuthContext (JWT state)
    │   ├── api.js      # Axios instance with auth interceptor
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 1. Backend Setup

```bash
cd goalflow/backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/goalflow
JWT_SECRET=your_secret_key_here_make_it_long
NODE_ENV=development
```

Start the server:
```bash
npm run dev        # development (with nodemon)
npm start          # production
```

Server runs at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd goalflow/frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

> The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically.

---

### 3. MongoDB Atlas (Cloud)

Replace `MONGO_URI` in `.env` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/goalflow?retryWrites=true&w=majority
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Goals
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/goals` | List goals (filter: `status`, `category`) |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |
| PATCH | `/api/goals/:id/progress` | Update progress % |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | List tasks (filter: `status`, `priority`, `dueToday`) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/toggle` | Toggle complete/pending |
| DELETE | `/api/tasks/:id` | Delete task |

### Habits
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/habits` | List active habits |
| POST | `/api/habits` | Create habit |
| PATCH | `/api/habits/:id/log` | Log/unlog today |
| DELETE | `/api/habits/:id` | Archive habit |

### Analytics
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics/summary` | Stats + weekly data + category breakdown |
| GET | `/api/analytics/monthly` | 6-month completion trend |

---

## 🏗️ Production Build

```bash
# Build frontend
cd frontend && npm run build

# Serve with Express (add static serving to server.js)
# Or deploy frontend to Vercel/Netlify, backend to Railway/Render
```



## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Charts | Chart.js + react-chartjs-2 |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Notifications | react-hot-toast |

---

## 👤 Default Demo Credentials

After running locally, register a new account at `/register`.

---

Built by Aditya Yadav · GoalFlow v1.0
