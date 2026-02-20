# User Management, Wallet & Transactions — Testing Guide

This guide shows how to test the user/auth flows and wallet/payment flows (PayHere) using Postman or curl.

Pre-checks
- Start the backend: `cd backend && npm run dev`
- Ensure `backend/.env` contains: `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PAYHERE_MERCHANT_ID`, `PAYHERE_SECRET`, `BACKEND_URL`, `FRONTEND_URL`.
- MongoDB reachable.

- Postman environment variables (recommended)
- set `baseUrl` to include the API prefix for convenience:
- `baseUrl` = http://localhost:5000/api/v1
- `accessToken` = (set after login)
- `refreshToken` = (cookie; optional)
- `PAYHERE_MERCHANT_ID`, `PAYHERE_SECRET`

Notes
- Protected endpoints require header: `Authorization: Bearer {{accessToken}}`.
- Webhook endpoint `/api/v1/wallets/notify` must be public so PayHere can post to it.

1) Register user
- Endpoint: POST `{{baseUrl}}/api/v1/auth/register`
- Body (JSON):
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
  }
- Expected: 201 created; user object returned (or email verification flow depending on app).

2) Login (get access token)
- Endpoint: POST `{{baseUrl}}/api/v1/auth/login`
- Body (JSON):
  { "email": "test@example.com", "password": "Password123!" }
- Response: `{ success: true, data: { accessToken, user } }` and a `refreshToken` cookie.
- Save `accessToken` to environment variable `accessToken`.

3) Refresh token (if needed)
- Endpoint: POST `{{baseUrl}}/api/v1/auth/refresh`
- Cookie: send `refreshToken` cookie returned on login (Postman will store cookie automatically if you use Chrome cookie jar).
- Response: new tokens; update `accessToken` in Postman.

- 4) Get current user
- GET `{{baseUrl}}/users/me` (protected) or use `data.user` from login response
- Header: `Authorization: Bearer {{accessToken}}`

5) Get / Create Wallet
- GET `{{baseUrl}}/api/v1/wallets/me`
- Header: `Authorization: Bearer {{accessToken}}`
- Behavior: creates a wallet for the authenticated user if none exists. Response: wallet object with `balance`.

6) View Transactions
- GET `{{baseUrl}}/api/v1/wallets/transactions`
- Header: `Authorization: Bearer {{accessToken}}`
- Response: array of transactions for the authenticated user.

7) Initiate Deposit (create Pending transaction + PayHere payload)
- POST `{{baseUrl}}/api/v1/wallets/deposit/initiate`
- Header: `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json`
- Body: `{ "amount": 1000 }` (amount in chosen currency)
- Response: object containing `order_id`, `amount` (formatted), `currency`, `hash`, `notify_url`, `return_url`.
- Save `order_id` for webhook test.

8) Simulate PayHere webhook (complete payment)
- Compute `md5sig` on your machine (Node snippet):

```javascript
import crypto from 'crypto';
const merchantSecret = process.env.PAYHERE_SECRET || 'your_secret';
const merchantId = 'YOUR_MERCHANT_ID';
const orderId = 'ORDER_...'; // from initiateDeposit
const amount = '1000.00';
const currency = 'LKR';
const status_code = '2'; // success
const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
const md5sig = crypto.createHash('md5')
  .update(merchantId + orderId + amount + currency + status_code + hashedSecret)
  .digest('hex')
  .toUpperCase();
console.log(md5sig);
```
- cd backend
node --env-file=.env script/simulate_payhere.js --orderId=ORDER_1771568280211 --amount=5000.00
 
- Webhook payload (Postman body):
  {
    "merchant_id": "YOUR_MERCHANT_ID",
    "order_id": "ORDER_...",
    "payhere_amount": "1000.00",
    "payhere_currency": "LKR",
    "status_code": "2",
    "md5sig": "<computed-md5sig>"
  }
 - POST to `{{baseUrl}}/wallets/notify` (no auth header required).
 - Expected: 200 OK. After that, GET `/wallets/me` and `/wallets/transactions` should show updated balance and a transaction with `status: Completed` and `completedAt` set (when using `baseUrl` that includes `/api/v1`).

Note: A convenience webhook simulator is provided at `backend/script/simulate_payhere.js` — you can run it against your local backend to avoid crafting the MD5 manually.

9) Invest in Startup (atomic transfer)
- POST `{{baseUrl}}/api/v1/wallets/invest`
- Header: `Authorization: Bearer {{accessToken}}`
- Body example:
  {
    "amount": 100,
    "startupId": "<startupObjectId>",
    "startupOwnerId": "<ownerUserId>"
  }
- Expected: 200, message `Investment successful`. Two transaction records created and balances updated atomically.

10) Admin / User management checks (if applicable)
- List users: GET `{{baseUrl}}/api/v1/users` (may require admin role)
- Create/update users via admin routes: see `backend/src/routes/v1/admin.routes.js` for endpoints

Troubleshooting
- 401 Unauthorized: verify `accessToken` and `JWT_ACCESS_SECRET` in `.env` match values used to sign tokens.
- 400 Invalid Signature (webhook): ensure `md5sig` generated with same `PAYHERE_SECRET`, exact formatting (two decimals).
- Wallet not created: ensure authenticated `accessToken` corresponds to a user in DB.

Quick checklist
- [ ] Start server
- [ ] Register user
- [ ] Login and save `accessToken`
- [ ] Call `GET /wallets/me` to create wallet
- [ ] POST `/deposit/initiate` and simulate webhook
- [ ] Verify transactions and balances

If you want, I can also add a ready-made Postman Collection JSON to `backend/doc` with the requests pre-filled.
