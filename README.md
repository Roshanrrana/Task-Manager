# TaskPilot

TaskPilot is a MERN project and task management workspace for small teams. It keeps the original core idea intact: admins create projects, assign tasks, manage members, and team members track their own work.

The current version has a refreshed product identity, a lighter command-center interface, and a redesigned dashboard with practical focus tools.

## Live Demo

🚀 Live App: https://task-manager-production-56d1.up.railway.app

## Highlights

- JWT authentication with admin/member roles
- Project creation, editing, deletion, members, and deadlines
- Task assignment with status, priority, and due dates
- Dashboard command center with focus filters, workload mix, completion meter, weekly progress, and copyable daily summary
- Protected React routes and REST API backend
- MongoDB persistence through Mongoose

## Tech Stack

- React, Vite, Tailwind CSS
- Node.js, Express
- MongoDB, Mongoose
- JWT authentication
- Chart.js dashboard visuals

## Local Setup

Install dependencies:

```bash
npm run install:all
```

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/taskpilot
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Start MongoDB locally or replace `MONGO_URI` with a MongoDB Atlas connection string.

Run the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend health: `http://localhost:5000/api/health`

## Main Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/dashboard/stats`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/tasks`
- `POST /api/tasks`

## Repository

GitHub: https://github.com/Roshanrrana/Task-Manager
