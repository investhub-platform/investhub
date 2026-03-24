# Test Guide — structure, run commands, and CI

This document explains the test layout, how to run each test type, naming and mocking conventions, CI suggestions, and common troubleshooting for the repository's test suites.

**Where tests live**

- `tests/frontend` — frontend unit and integration tests (Jest + React Testing Library).
- `tests/backend` — backend unit, integration, and performance tests (Jest + Supertest + mongodb-memory-server + autocannon).
- `e2e` — Playwright end-to-end specs (`*.spec.js`) executed from the frontend context.

**Key configs**

- Frontend Jest: [frontend/jest.config.cjs](frontend/jest.config.cjs)
- Frontend Babel: [frontend/babel.config.cjs](frontend/babel.config.cjs)
- Frontend Jest setup (polyfills): [frontend/jest.setup.js](frontend/jest.setup.js)
- Backend Jest (ESM tests): [backend/jest.config.cjs](backend/jest.config.cjs)
- Playwright config: [e2e/playwright.config.js](e2e/playwright.config.js)
- Top-level ESM marker for tests: [tests/package.json](tests/package.json)

## Install dependencies

Install frontend and backend deps from the repository root:

```bash
cd frontend
npm install

cd ../backend
npm install
```

Notes:
- Playwright browser binaries are installed via `npx playwright install` (see E2E section).

## Running tests — quick commands

Frontend unit & integration (Jest):

```bash
cd frontend
npm test
# watch mode
npm run test:watch
# coverage
npm run test:coverage
```

Backend unit, integration, and performance:

```bash
cd backend
npm test
# coverage
npm run test:coverage
```

Run all backend tests locally from repo root (example):

```bash
cd backend && npm test
```

Playwright E2E (optional — requires the dev server to be running and env vars):

```bash
cd frontend
npx playwright install
npm run test:e2e
```

When running Playwright, ensure the frontend app is accessible at `E2E_BASE_URL` (default `http://localhost:5173`) or set `E2E_BASE_URL` before running.

## Environment variables for tests

- Backend integration tests set several env vars inside tests but for local runs you may need:
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (when stubbing not used)
  - `NODE_ENV=test` (optional)
- E2E tests require (only when exercising real auth flows):
  - `E2E_BASE_URL` — base URL for the running frontend (default: `http://localhost:5173`)
  - `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` — real test account credentials (the Playwright test will skip if not set)

## Naming & placement conventions

- Unit tests: `tests/<frontend|backend>/unit/**/*.test.js`
- Integration tests: `tests/<frontend|backend>/integration/**/*.test.js`
- Performance tests: `tests/backend/performance/**/*.test.js`
- E2E specs: `e2e/**/*.spec.js`

File naming should use `.test.js` for Jest suites and `.spec.js` for Playwright specs.

## Mocking patterns and tips

- For frontend component/unit tests use `jest.mock()` and the module path aliases defined in `frontend/jest.config.cjs`.
- For backend ESM tests, the repository uses `jest.unstable_mockModule()` to mock named ESM imports. Example in `tests/backend/integration/auth-flow.test.js`.
- Mock external services (email, payment, third-party APIs) so tests remain deterministic. The current integration tests mock `emailService`.

## Performance tests

- Performance tests use `autocannon` and spin up the backend app on an ephemeral port. They are intended as smoke/perf checks, not a full benchmarking suite.
- Run them with `npm test` from `backend` (they are included in the Jest run under `tests/backend/performance`).

## CI example — GitHub Actions (recommended)

This example runs frontend and backend tests and collects coverage. Save as `.github/workflows/tests.yml`.

```yaml
name: Tests
on: [push, pull_request]

jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x]
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install frontend deps
        working-directory: frontend
        run: npm ci

      - name: Run frontend tests
        working-directory: frontend
        run: npm test --silent

      - name: Install backend deps
        working-directory: backend
        run: npm ci

      - name: Run backend tests
        working-directory: backend
        run: npm test --silent

      # Optional: run Playwright only when secrets are available
      - name: Run Playwright E2E (optional)
        if: ${{ secrets.E2E_USER_EMAIL && secrets.E2E_USER_PASSWORD }}
        working-directory: frontend
        env:
          E2E_USER_EMAIL: ${{ secrets.E2E_USER_EMAIL }}
          E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
          E2E_BASE_URL: ${{ secrets.E2E_BASE_URL || 'http://localhost:5173' }}
        run: |
          npx playwright install --with-deps
          npm run test:e2e
```

## Troubleshooting — common issues and fixes

- Jest cannot find modules for tests under `/tests`: ensure `moduleDirectories`/`modulePaths` are set in the corresponding `jest.config.cjs` files and that `tests/package.json` contains `"type": "module"` for ESM tests.
- `TextEncoder` / `TextDecoder` errors in jsdom: the frontend setup file [frontend/jest.setup.js](frontend/jest.setup.js) registers polyfills.
- Playwright fails to run with `Error: Browser is not installed`: run `npx playwright install` or `npx playwright install chromium` before `npm run test:e2e`.
- Backend integration tests that need Mongo: the tests use `mongodb-memory-server`; if connections fail, check Node version and network access for binary downloads.

## Adding new tests — checklist

1. Put unit tests beside the unit test folder and name with `.test.js`.
2. For integration tests, prefer using in-memory resources (`mongodb-memory-server`) and mock external side effects (emails/payments).
3. Run the relevant suite locally (`cd frontend && npm test` or `cd backend && npm test`).
4. Add a short entry to this README explaining intent and any env required.

## Contributing guidance

- Keep tests small and deterministic. Avoid long timers or flaky waits.
- Use `jest.setTimeout()` sparingly for slow integration scenarios.
- When adding E2E coverage, include an option for the test to `skip()` when secrets or external systems are not available.

---

If you'd like, I can also:

- Add the CI workflow file to `.github/workflows/tests.yml`.
- Create a small CONTRIBUTING test checklist file.

Want me to add the GitHub Actions workflow now?
