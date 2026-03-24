# Test Suite Guide

This repository now includes full-stack testing under two top-level folders:

- `/tests`: unit, integration, and performance tests
- `/e2e`: Playwright end-to-end tests (`*.spec.js`)

## Structure

- `tests/frontend/unit/**/*.test.js`
  - Auth page behavior (login success/failure/verification redirect)
  - Dashboard widgets/components rendering and prop handling
- `tests/frontend/integration/**/*.test.js`
  - Frontend page workflow tests with mocked API boundaries
- `tests/backend/unit/**/*.test.js`
  - Utility and service logic (validation and auth service behavior)
- `tests/backend/integration/**/*.test.js`
  - API + database flow tests using `mongodb-memory-server`
- `tests/backend/performance/**/*.test.js`
  - Basic backend load and stability checks with `autocannon`
- `e2e/**/*.spec.js`
  - User journey tests with Playwright

## Install dependencies

Run both commands from the repo root:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## Run tests

Frontend unit/integration:

```bash
cd frontend
npm test
npm run test:coverage
```

Backend unit/integration/performance:

```bash
cd backend
npm test
npm run test:coverage
```

Playwright E2E:

```bash
cd frontend
npx playwright install
npm run test:e2e
```

## E2E environment variables

Set these before running Playwright for real auth flow:

- `E2E_BASE_URL` (default: `http://localhost:5173`)
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

## Notes

- Integration tests mock outbound email sending to keep tests deterministic.
- Backend integration tests use in-memory MongoDB and do not require a local Mongo instance.
- Performance tests validate response time, concurrency behavior, and API stability on health endpoint.
