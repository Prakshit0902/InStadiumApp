import { Router } from 'express';
import { requireNeonAuth } from '../lib/neon-auth.js';

const router = Router();

router.get('/', requireNeonAuth, (_req, res) => {
  res.json({ success: true });
});

export default router;
