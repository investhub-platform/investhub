# InvestHub Platform

InvestHub is a web application that connects startups with technical mentors and investors. The project uses a MERN stack (MongoDB, Express, React, Node) and is split into `backend` and `frontend` folders.

**Quick Overview**
- **Project:** InvestHub
- **Purpose:** Connect startups with technical mentors and investors
- **Tech stack:** MERN (MongoDB, Express, React, Node)

**Prerequisites**
- **Node.js:** v16+ (install from https://nodejs.org/)
- **npm or yarn:** npm comes with Node.js
- **MongoDB:** Atlas or local MongoDB instance

**Getting Started (local)**
1. Clone the repository and open a terminal in the repository root.

2. Backend: install and run

```powershell
cd backend
npm install
# Create a `.env` file (see required variables below)
npm run dev
```

The backend will start on port `5000` by default (configurable via `PORT`). API routes are mounted under `/api` (for example `http://localhost:5000/api`).

3. Frontend: install and run

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs with Vite on port `5173` by default.

4. Open the app in your browser at `http://localhost:5173` and ensure the backend is available at `http://localhost:5000`.

**Environment variables (example keys)**
Create a `backend/.env` file with the values your environment requires. Example keys used by the backend:

- `PORT` (optional) — server port, default `5000`
- `MONGO_URI` — MongoDB connection string (required)
- `BACKEND_URL` — base backend URL (e.g. `http://localhost:5000`)
- `FRONTEND_URL` — frontend URL (e.g. `http://localhost:5173`)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — JWT secrets
- `ACCESS_TOKEN_EXPIRES`, `REFRESH_TOKEN_EXPIRES` — token expiry (e.g. `15m`, `7d`)
- SMTP settings: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Payment/dev keys used in repo: `PAYHERE_MERCHANT_ID`, `PAYHERE_SECRET`, `PAYHERE_CURRENCY`, `PAYHERE_SANDBOX`
- Optional AI keys: `GEMINI_API_KEY`, `GEMINI_MODEL` (if AI features are used)

Do not commit your real secrets. Use environment-specific secret stores for production.

**Run notes**
- Development backend: `npm run dev` (uses `nodemon` to restart on changes)
- Production backend: `npm start`
- Frontend dev: `npm run dev` (Vite)

**Database**
- Use a MongoDB URI for `MONGO_URI`. For local development you can use `mongodb://localhost:27017/investhub`.

**Common commands**
- Install all dependencies (from root):

```powershell
cd backend
npm install
cd ../frontend
npm install
```

**Troubleshooting**
- If the backend cannot connect to MongoDB, confirm `MONGO_URI` and network access (Atlas IP whitelist or local MongoDB running).
- If SMTP email fails, verify SMTP credentials and allow access if using Gmail (app passwords or less-secure settings may be required).

**Further work**
- Add a `backend/.env.example` file (recommended) with placeholder values.
- Add `docker-compose` for local dev (optional).

---
For backend-specific and frontend-specific setup notes, see `backend/README.md` and `frontend/README.md`.
