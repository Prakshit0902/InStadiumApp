import { Router } from 'express';
import { requireClerkAuth } from '../lib/clerk-auth.js';
const router = Router();
router.get('/:clientId', requireClerkAuth, (_req, res) => {
    res.json({ success: true });
});
export default router;
