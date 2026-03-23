# PayHere Sandbox Setup (Wallet + Investing)

This guide explains how to configure and test the implemented PayHere sandbox flow for wallet top-up, transaction history, and wallet-based investing.

## What Is Implemented

- Wallet top-up starts from frontend and opens a PayHere checkout popup.
- PayHere notify webhook verifies signature and credits wallet balance on successful payment.
- Failed/dismissed checkout updates pending deposit as `Failed`.
- Frontend can poll deposit status and show user-friendly status/error messages.
- Investing now calls wallet transfer API and records transactions instantly.

## Backend Environment Variables

Set these in `backend/.env`.

```env
# Existing app config
PORT=5000
MONGO_URI=mongodb://localhost:27017/investhub
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# PayHere
PAYHERE_MERCHANT_ID=121xxxx
PAYHERE_SECRET=your_payhere_merchant_secret
PAYHERE_CURRENCY=LKR
PAYHERE_SANDBOX=true

# URLs used in PayHere payload
BACKEND_URL=https://your-public-backend.example
FRONTEND_URL=http://localhost:5173
```

Important notes:
- `BACKEND_URL` must be publicly reachable by PayHere for webhook notifications.
- For local testing, use a tunnel (for example ngrok or cloudflared) and set `BACKEND_URL` to that public HTTPS URL.
- `PAYHERE_SECRET` must match your sandbox merchant account secret exactly.

## Frontend Environment Variables

Set these in `frontend/.env`.

```env
VITE_API_BASE=http://localhost:5000
VITE_PAYHERE_CHECKOUT_URL=https://sandbox.payhere.lk/pay/checkout
```

If `VITE_PAYHERE_CHECKOUT_URL` is not set, the app defaults to sandbox checkout URL.

## PayHere Dashboard Configuration (Sandbox)

In your PayHere sandbox merchant dashboard:

1. Use your sandbox merchant credentials.
2. Keep checkout in sandbox mode.
3. Ensure the notify URL can reach backend:
   - `https://<public-backend>/api/v1/wallets/notify`
4. If your dashboard requests Return/Cancel URL defaults, set them to frontend wallet page.

## Run Locally

1. Start backend:

```powershell
cd backend
npm install
npm run dev
```

2. Start frontend:

```powershell
cd frontend
npm install
npm run dev
```

3. Login as an investor user.
4. Open wallet page and top up.

## Payment Flow Endpoints

- Initiate deposit: `POST /api/v1/wallets/deposit/initiate`
- Mark failed deposit (frontend popup error/dismiss): `POST /api/v1/wallets/deposit/fail`
- Poll deposit status: `GET /api/v1/wallets/deposit/status/:orderId`
- PayHere webhook notify: `POST /api/v1/wallets/notify`
- Execute investment transfer: `POST /api/v1/wallets/invest`
- Transaction history: `GET /api/v1/wallets/transactions`

## Test Checklist

1. Top-up success
- Start top-up from wallet page.
- Complete checkout in PayHere sandbox.
- Verify wallet balance increases.
- Verify transaction status changes from `Pending` to `Completed`.

2. Top-up dismissed
- Start checkout and close popup.
- Verify transaction marked `Failed`.
- Verify user sees failure message.

3. Top-up error
- Trigger invalid checkout details (sandbox side).
- Verify error message and failed transaction status.

4. Investing
- Ensure investor wallet has sufficient funds.
- Invest from startup details modal/page.
- Verify investor transaction (`Investment`) and startup owner transaction (`Deposit`) are created.
- Verify investor wallet balance decreases.

## Troubleshooting

- Webhook not updating balance:
  - Check `BACKEND_URL` is public HTTPS.
  - Verify firewall/tunnel allows POST to `/api/v1/wallets/notify`.
  - Check backend logs for signature mismatch.

- Signature mismatch:
  - Confirm `PAYHERE_MERCHANT_ID` and `PAYHERE_SECRET` are correct sandbox values.
  - Confirm backend is using the same account as checkout.

- Payment popup not loading:
  - The page attempts PayHere JS popup first.
  - If SDK load fails, it falls back to form-based checkout in a new tab.

## Security Notes

- Never commit real merchant secrets.
- Keep `PAYHERE_SECRET` only in server environment.
- Do not trust frontend payment completion alone; wallet is credited only after verified webhook signature.
