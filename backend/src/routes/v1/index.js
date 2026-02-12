import { Router } from 'express';
import { listStartups, createStartup } from '../../controllers/startupController.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

router.get('/startups', listStartups);
router.post('/startups', createStartup);

export default router;
