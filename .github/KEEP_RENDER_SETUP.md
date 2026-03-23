# Keep Render Awake — GitHub Secrets & Usage

Add these repository secrets at: Settings → Secrets and variables → Actions

- `RENDER_APP_URL` (required): your app's health URL, e.g. `https://your-app.onrender.com/health`
- `RENDER_HEALTH_TOKEN` (optional): bearer token if your health endpoint requires auth

Notes
- The workflow file is `.github/workflows/keep-render-awake.yml` and runs every 5 minutes.
- Make sure the health path returns HTTP 200 quickly and does minimal work.
- To test immediately: go to the Actions tab → "Keep Render Awake" → "Run workflow" → choose branch → Run.

Example minimal health endpoint (Express):

```js
// GET /health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

If you protect the endpoint with a token, accept it in an `Authorization: Bearer <token>` header.

If you want, I can also add UptimeRobot setup steps or create a lightweight unauthenticated `/ping` route.
