import { Router } from 'express';
const router = Router();
router.get('/:clientId', (_req, res) => {
    res.json({ success: true });
});
export default router;
