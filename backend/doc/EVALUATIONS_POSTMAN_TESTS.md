# Evaluations API — Postman Test Cases

Base URL (adjust to your environment):
- Local dev (recommended): `http://localhost:5000/api/v1`

Notes:
- Auth: all evaluation endpoints are protected — include `Authorization: Bearer {{accessToken}}`.
- Admin role is required for update/delete by default (see implementation notes).
- Gemini integration: if `GEMINI_API_KEY` is set in your `.env` the service will call Gemini; otherwise a deterministic mock response is returned so tests do not fail.

Endpoints overview
- POST /evaluations/generate — Create/generate evaluation for a startup (protected)
- GET /evaluations/:startupId — Get evaluation for a startup (protected)
- PUT /evaluations/:startupId — Update evaluation (protected, admin)
- DELETE /evaluations/:startupId — Delete evaluation (protected, admin)

---

## 1) Generate Evaluation

Request
- Method: POST
- URL: `{{baseUrl}}/evaluations/generate`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{accessToken}}`

Body (JSON) — fields used for simulated AI logic; only `startupId` is required server-side:
{
  "startupId": "64a...",
  "description": "Short description of the startup",
  "budget": 150000,
  "category": "Fintech"
}

Expected success response
- Status: 201 Created (or 200 if evaluation already exists)
- Body (example):
{
  "data": {
    "_id": "<evalId>",
    "startupId": "<startupId>",
    "riskScore": 7,
    "swotAnalysis": {
      "strengths": "...",
      "weaknesses": "...",
      "opportunities": "...",
      "threats": "..."
    },
    "generatedAt": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}

Failure cases to test
- Missing `startupId` -> validation error (400) if model/controller enforces it.
- Missing/invalid token -> 401 Unauthorized.

---

## 2) Get Evaluation

Request
- Method: GET
- URL: `{{baseUrl}}/evaluations/:startupId` (replace `:startupId`)
- Headers:
  - `Authorization: Bearer {{accessToken}}`

Expected success response
- Status: 200 OK
- Body:
{
  "data": { /* evaluation object as above */ }
}

Failure cases
- Not found -> 404 with `{ message: "Evaluation not found" }`.
- Missing/invalid token -> 401.

---

## 3) Update Evaluation (admin)

Request
- Method: PUT
- URL: `{{baseUrl}}/evaluations/:startupId`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{accessToken}}` (must include `admin` in roles)

Body (JSON) — partial updates allowed. Examples:
{
  "riskScore": 5
}

Or to replace SWOT:
{
  "swotAnalysis": {
    "strengths": "New strengths",
    "weaknesses": "New weaknesses",
    "opportunities": "New opportunities",
    "threats": "New threats"
  }
}

Expected success response
- Status: 200 OK
- Body:
{
  "data": { /* updated evaluation */ }
}

Failure cases
- Forbidden (403) if user is not admin.
- Not found (404) if no evaluation exists for the `startupId`.
- Missing/invalid token -> 401.

---

## 4) Delete Evaluation (admin)

Request
- Method: DELETE
- URL: `{{baseUrl}}/evaluations/:startupId`
- Headers:
  - `Authorization: Bearer {{accessToken}}` (must be admin)

Expected success response
- Status: 200 OK
- Body:
{
  "message": "Evaluation deleted"
}

Failure cases
- Forbidden (403) if not admin.
- Not found -> 404.
- Missing/invalid token -> 401.

---

## Postman environment variables recommended
- `baseUrl` — `http://localhost:5000/api/v1`
- `accessToken` — Bearer token for authenticated user (admin for update/delete)
- `startupId` — example startup id to use

---

## Quick workflow
1. Obtain `accessToken` via your auth endpoints.
2. `POST /evaluations/generate` with `startupId` to create an evaluation.
3. `GET /evaluations/:startupId` to verify.
4. As admin, `PUT` to update and `DELETE` to remove.

---

## Notes / Troubleshooting
- The controller simulates AI output; real integration may require API keys and rate limits.
- If you prefer owner-based permissions (owner of startup or evaluator), we can add a `createdBy` field to the `Evaluation` model and update checks.

If you'd like, I can also:
- Add these test cases into the `EVENTS_POSTMAN_TESTS.md` or create a single Postman Collection JSON for import.
- Add simple integration tests that hit these endpoints using a test DB.
