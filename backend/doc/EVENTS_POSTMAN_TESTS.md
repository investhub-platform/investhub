# Events API — Postman Test Cases

Base URL (adjust to your environment):
 Local dev (recommended): `http://localhost:5000/api/v1`

Notes on `baseUrl`:
- The API is mounted under `/api/v1` in the backend. You can either set `baseUrl` to include the `/api/v1` prefix (recommended), e.g. `http://localhost:5000/api/v1`, or set `baseUrl` to your host and include `/api/v1` in each request path.

Important:
- Ensure the backend server is running (`npm run dev` in the `backend` folder) and that `PORT` (default `5000`) matches the host/port used in Postman.

Notes:
- Auth: endpoints that modify data require a Bearer access token in `Authorization` header: `Bearer <access_token>`.
- The project mounts v1 routes under `/api/v1` in this example — adjust if your server mounts differently.

Collection overview
- POST /events — Create event (protected, Mentor role)
- GET /events — List upcoming events (public)
- POST /events/:id/rsvp — RSVP to event (protected)
 - PUT /events/:id — Update event (protected, organizer or admin)
 - DELETE /events/:id — Delete event (protected, organizer or admin)

---

## 1) Create Event

Request
- Method: POST
- URL: `{{baseUrl}}/events`  (If your `baseUrl` is `http://localhost:5000/api/v1`, this becomes `http://localhost:5000/api/v1/events`)
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{accessToken}}`

Body (JSON):
{
  "title": "Intro to Startup Fundraising",
  "description": "Overview of seed fundraising and term sheets.",
  "eventType": "Webinar",
  "date": "2026-03-10T15:00:00.000Z",
  "link": "https://zoom.us/j/123456789",
  "bannerImage": "https://cdn.example.com/events/fundraising.jpg"
}

Expected success response
- Status: 201 Created
- Body (example):
{
  "data": {
    "_id": "<eventId>",
    "organizerId": "<mentorUserId>",
    "title": "Intro to Startup Fundraising",
    "description": "Overview of seed fundraising and term sheets.",
    "eventType": "Webinar",
    "date": "2026-03-10T15:00:00.000Z",
    "link": "https://zoom.us/j/123456789",
    "bannerImage": "https://cdn.example.com/events/fundraising.jpg",
    "attendees": [],
    "createdAt": "...",
    "updatedAt": "...",
    "__v": 0
  }
}

Failure cases to test
- Missing required field (e.g., `title` or `date`) -> expect 4xx (400) with validation message.
- Missing/invalid token -> expect 401 Unauthorized.
- Token of non-mentor (if role check exists) -> expect 403 Forbidden (if role enforcement implemented).

---

## 2) Get Events (upcoming)

Request
- Method: GET
- URL: `{{baseUrl}}/events`  (If your `baseUrl` is `http://localhost:5000/api/v1`, this becomes `http://localhost:5000/api/v1/events`)
- Headers: none required (public)

Expected success response
- Status: 200 OK
- Body (example):
{
  "data": [
    {
      "_id": "<eventId>",
      "organizerId": { "_id": "<mentorId>", "name": "Mentor Name", "email": "mentor@example.com" },
      "title": "Intro to Startup Fundraising",
      "description": "...",
      "eventType": "Webinar",
      "date": "2026-03-10T15:00:00.000Z",
      "link": "https://zoom.us/j/123456789",
      "bannerImage": "...",
      "attendees": [],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}

Failure cases
- If DB error occurs -> 500 with message.

---

## 3) RSVP to an Event

Request
- Method: POST
- URL: `{{baseUrl}}/events/:id/rsvp` (replace `:id` with event `_id`) — e.g. `http://localhost:5000/api/v1/events/63a.../rsvp`
- Headers:
  - `Authorization: Bearer {{accessToken}}`

Body: none required

Expected success response
- Status: 200 OK
- Body (example):
{
  "message": "RSVP Successful",
  "attendeesCount": 1
}

Failure cases to test
- Event not found -> 404 with `{ message: "Event not found" }`.
- Already RSVP'd -> 400 with `{ message: "You have already registered" }`.
- Missing/invalid token -> 401 Unauthorized.

---

## 4) Update an Event

Request
- Method: PUT
- URL: `{{baseUrl}}/events/:id` (replace `:id` with event `_id`)
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{accessToken}}`

Body (JSON) - partial updates allowed (only include fields you want to change):
{
  "title": "Updated title",
  "date": "2026-03-11T15:00:00.000Z"
}

Expected success response
- Status: 200 OK
- Body (example):
{
  "data": { /* updated event object */ }
}

Failure cases to test
- Event not found -> 404
- Forbidden if not organizer or admin -> 403
- Missing/invalid token -> 401

---

## 5) Delete an Event

Request
- Method: DELETE
- URL: `{{baseUrl}}/events/:id` (replace `:id` with event `_id`)
- Headers:
  - `Authorization: Bearer {{accessToken}}`

Expected success response
- Status: 200 OK
- Body (example):
{
  "message": "Event deleted"
}

Failure cases to test
- Event not found -> 404
- Forbidden if not organizer or admin -> 403
- Missing/invalid token -> 401

---

## Postman environment variables recommended
- `baseUrl` — `http://localhost:3000/api/v1` (adjust)
- `accessToken` — Bearer token for authorized user (mentor for create)
- `mentorId` — (optional) ID of mentor user
- `eventId` — (optional) set from create response to use in RSVP

---

## Quick Postman workflow
1. Authenticate (use your project's auth endpoints) to obtain `accessToken`.
2. Create an event as a mentor (POST `/events`) — save `data._id` to `eventId`.
3. GET `/events` to confirm the event appears.
4. As an investor/startup user, set `accessToken` to that user's token and POST `/events/{{eventId}}/rsvp`.
5. Re-run GET `/events` and confirm `attendees` includes your user.

---

## Notes / Troubleshooting
- If `organizerId` population doesn't return `name`/`email`, confirm `User` model fields and population keys.
- Date and time: send ISO8601 timestamps (UTC) to avoid timezone issues.
- Adjust `baseUrl` path prefix based on how your server mounts v1 routes (some projects use `/api/v1`, others `/v1` or `/api`).

---

If you want, I can also generate a Postman Collection JSON for import with these requests. Let me know if you want that file generated in the repo.
