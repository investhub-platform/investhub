# InvestHub

InvestHub is a web application that connects startups with technical mentors and investors. The project uses a MERN stack (MongoDB, Express, React, Node) and is split into `backend` and `frontend` folders.

**Quick Overview**
- **Project:** InvestHub
- **Purpose:** Connect startups with technical mentors and investors
- **Tech stack:** MERN (MongoDB, Express, React, Node)

InvestHub is a crowdfunding / startup-investment platform composed of two main services:

- `frontend` — React + Vite application (deployed to Vercel) - https://investhub-seven.vercel.app/
- `backend` — Node.js (Express) API with MongoDB (deployed to Render) - https://investhub-backend.onrender.com

This README explains the architecture, how to run locally, important environment variables, deployment notes for Vercel (frontend) and Render (backend), and common troubleshooting steps.

## Project overview

InvestHub allows users to discover startups and startup ideas, top-up wallets via PayHere, invest in startups (platform collects a configurable platform fee), and manage funds. The admin panel surfaces platform revenue and fee transactions.

Key features:
- User accounts, JWT auth
- Wallets + transactions
- PayHere integration for wallet top-ups
- Investment requests (investor -> founder flow) with platform fee split
- Admin dashboard for revenue and fee monitoring
- Static uploads for avatars, posts, and startup images

## Architecture

- Frontend: React (Vite). Routes include Explore, Portfolio, Wallet, Deals, Admin.
- Backend: Express, Mongoose, transaction/wallet services handle business rules (atomic transfers, fee handling).
- Database: MongoDB Atlas (connection via `MONGO_URI`).
- Deployments: Frontend on Vercel, Backend on Render. Static uploads served from `backend/uploads` (see storage notes).

## API documentation

The backend API is documented using Postman-based test guides and the included Postman environment export in `backend/doc`.

Documentation files:
- [backend/doc/USER_AND_WALLET_TESTS.md](backend/doc/USER_AND_WALLET_TESTS.md)
- [backend/doc/EVALUATIONS_POSTMAN_TESTS.md](backend/doc/EVALUATIONS_POSTMAN_TESTS.md)
- [backend/doc/EVENTS_POSTMAN_TESTS.md](backend/doc/EVENTS_POSTMAN_TESTS.md)
- [backend/doc/investhub_postman_environment.json](backend/doc/investhub_postman_environment.json)

These files cover the primary backend flows, request payloads, headers, and Postman environment values required to test authentication, wallet payments, events, and evaluations.

Swagger/OpenAPI is not generated in the repository at this time, so Postman is the main API documentation source.

## Local development

Prereqs:
- Node.js 18+ (tested with Node 20+)
- npm
- MongoDB instance (Atlas recommended)

Backend

1. Copy and edit `backend/.env` with your values (example provided in repository).
2. From repo root:

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:5000` by default (see `PORT`). It loads `backend/.env` relative to the service folder.

Frontend

1. Update `frontend/.env` with frontend-specific env values if any.
2. From repo root:

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` by default.

## Important environment variables

Backend (high level):

- `PORT` — backend port
- `MONGO_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — auth secrets
- `ADMIN_USER_ID` — ObjectId of the admin platform user (used as platform wallet owner). **Required in production**.
- `PLATFORM_FEE_PERCENT` — platform fee percent (default `5`)
- PayHere related:
  - `PAYHERE_MERCHANT_ID`
  - `PAYHERE_SECRET`
  - `PAYHERE_CURRENCY` (e.g., `LKR` or `USD`)
  - `PAYHERE_ALLOW_LOCAL`, `PAYHERE_SANDBOX`, `PAYHERE_ALLOW_CLIENT_CONFIRM`
- Email (SMTP): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Frontend (high level):
- `VITE_API_BASE_URL` — API base URL for the frontend
- Any runtime flags for feature toggles

Note: Keep secrets out of Git and set them in the host's environment settings (Vercel / Render dashboard).

## Deployment notes

### Deployment section

This section contains the deployment details required for the project submission.

#### Backend deployment platform and setup steps

- Platform: Render
- Live backend API: https://investhub-backend.onrender.com
- Setup steps:
  1. Create a new Render Web Service from the backend repository.
  2. Set the root directory to `backend`.
  3. Use `npm install` during build if required by the Render configuration.
  4. Use `npm start` as the start command.
  5. Set the backend environment variables in the Render dashboard.
  6. Configure MongoDB Atlas network access so Render can connect to the database.
  7. Deploy and confirm the backend starts successfully in the Render logs.

#### Frontend deployment platform and setup steps

- Platform: Vercel
- Live frontend application: https://investhub-seven.vercel.app/
- Setup steps:
  1. Create a new Vercel project from the frontend repository.
  2. Set the root directory to `frontend`.
  3. Use `npm run build` as the build command.
  4. Use `dist` as the output directory.
  5. Set the frontend environment variables in Vercel.
  6. Deploy and verify the app loads correctly in production.

#### Environment variables used

The following environment variables are used by the deployed application. Secrets are intentionally not shown.

Backend variables:
- `PORT`
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_EXPIRES`
- `REFRESH_TOKEN_EXPIRES`
- `COOKIE_SECURE`
- `PAYHERE_MERCHANT_ID`
- `PAYHERE_SECRET`
- `PAYHERE_CURRENCY`
- `PAYHERE_ALLOW_LOCAL`
- `PAYHERE_SANDBOX`
- `PAYHERE_ALLOW_CLIENT_CONFIRM`
- `PAYHERE_SECRET_HASH`
- `PAYHERE_TRUST_SECRET_HASH`
- `PAYHERE_DEFAULT_PHONE`
- `PAYHERE_DEFAULT_ADDRESS`
- `PAYHERE_DEFAULT_CITY`
- `PAYHERE_DEFAULT_COUNTRY`
- `BACKEND_URL`
- `FRONTEND_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `OPENROUTER_API_KEY`
- `ADMIN_USER_ID`
- `PLATFORM_FEE_PERCENT`

Frontend variables:
- `VITE_API_BASE_URL`
- Other `VITE_*` values used by the frontend

#### Screenshots or evidence of successful deployment

Deployment evidence is included in the repository workspace:
- Frontend deployed screenshot: [deployment/frontend-vercel.png](deployment/frontend-vercel.png)
- Backend deployed screenshot: [deployment/render-deployment.png](deployment/render-deployment.png)

#### Static uploads in production

Uploaded files are served from `backend/uploads`. In a production environment, the storage must be persistent. If the deployment platform uses ephemeral storage, uploaded images can be lost after a restart or redeploy unless persistent storage or cloud object storage is configured.

Frontend (Vercel)

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables to set in Vercel: `VITE_API_BASE_URL`, `VITE_OTHER_KEYS` (if used)
- Rewrites: ensure API calls are targeted to the Render backend base URL.

Backend (Render)

- Service type: Web Service
- Runtime: Node
- Start command: `npm start` (or `npm run dev` for staging)
- Environment variables: set all backend env vars listed above in the Render dashboard.
- Health check: configure a simple HTTP health check such as `/` or `/api/health` if you add one.

Static uploads & persistent storage

- The app serves uploads from `backend/uploads`. On simple deployments this folder must exist and be writable by the service. For durable, scalable deployments use cloud object storage (S3, GCS, or similar) and serve files from there. The codebase includes a small change that ensures `backend/uploads` exists at startup, but uploaded files will not persist across ephemeral instances unless a persistent volume or cloud storage is used.

Recommended: configure uploads to use an S3 bucket and change file upload/serve code to generate signed URLs for production.

## Admin & platform config

- `ADMIN_USER_ID` must point to an existing admin user's `_id` in MongoDB. The platform wallet and fee transactions are associated with this user. If `ADMIN_USER_ID` is missing the backend will throw an error when attempting to execute investment fee flows.
- `PLATFORM_FEE_PERCENT` controls the percentage collected from investments (default 5%).

## Min investment amount

- The frontend enforces a minimum investment amount (now set to `$1,000`). For production safety you should also enforce the same minimum on the backend (server-side validation) to avoid bypass by manipulated clients.

## Troubleshooting

- 500 errors referencing `ADMIN_USER_ID is not configured` — ensure `ADMIN_USER_ID` is defined in the environment and corresponds to a valid MongoDB user id.
- Images 404 in production — verify that `backend/uploads` exists on the host or move uploads to persistent cloud storage; verify URLs are `/uploads/<filename>`.
- PayHere errors — verify `PAYHERE_MERCHANT_ID`, `PAYHERE_SECRET`, and the derived secret hash are correct. Use sandbox settings for local testing.

## Recommended improvements (next steps)

- Add backend server-side validation for minimum investment amount (configurable via env).
- Integrate durable cloud storage for uploads (S3/GCS) and update frontend URLs accordingly.
- Add an automated admin user creation script (optional) for first-time deployments.
- Add end-to-end tests for core payment and investment flows.

## Useful commands

From `backend`:

```bash
npm run dev   # start backend in dev (nodemon)
npm start     # start production server
```

From `frontend`:

```bash
npm run dev   # vite dev
npm run build # build for production
```

## Contact / Maintainers

If you need help with deployment or want me to add S3-backed uploads or server-side min-investment enforcement, tell me and I will implement the recommended changes.

---

README generated and tailored for this repository on April 5, 2026.
