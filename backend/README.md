# Backend — InvestHub

This folder contains the Express + Node backend for InvestHub.

**Quick start**

```powershell
cd backend
npm install
# create backend/.env with required environment variables
npm run dev   # development (nodemon)
# or for production
npm start
```

**Main files**
- `src/server.js` — server entrypoint
- `src/app.js` — express app configuration and routes
- `src/config/db.js` — mongoose connection helper

**Important environment variables**
- `MONGO_URI` (required)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `BACKEND_URL`, `FRONTEND_URL`

**Notes**
- The backend exposes APIs under `/api`.
- The package `nodemon` is used for development (script `dev`).
