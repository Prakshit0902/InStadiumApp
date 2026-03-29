import { Router } from 'express';
import { requireClerkAuth } from '../lib/clerk-auth.js';
const router = Router();
router.get('/', requireClerkAuth, (_req, res) => {
    res.json({ success: true });
});
export default router;
