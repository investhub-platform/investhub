import { Router } from 'express';

const router = Router();

// Redirect endpoint for PayHere return
// Accepts an optional `target` query parameter (encoded frontend path), e.g. ?target=/app/wallet
router.get('/return', (req, res) => {
  const frontend = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const target = req.query.target ? String(req.query.target) : '/';
  const redirectTo = frontend ? `${frontend}${target}` : target;
  return res.redirect(redirectTo);
});

// Redirect endpoint for PayHere cancel
router.get('/cancel', (req, res) => {
  const frontend = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const target = req.query.target ? String(req.query.target) : '/';
  const redirectTo = frontend ? `${frontend}${target}` : target;
  return res.redirect(redirectTo);
});

export default router;
