import { Router } from 'express';
import { listStartups } from '../../controllers/startupController';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

router.get('/startups', listStartups);

export default router;
