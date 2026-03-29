import { Router } from 'express';
import { getNeonAuthContext, requireNeonAuth } from '../lib/neon-auth.js';
const router = Router();
router.get('/me', requireNeonAuth, (req, res) => {
    const auth = getNeonAuthContext(req);
    if (!auth) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    return res.json({
        user: {
            sub: auth.payload.sub,
            email: typeof auth.payload.email === 'string' ? auth.payload.email : null,
            name: typeof auth.payload.name === 'string' ? auth.payload.name : null,
            claims: auth.payload,
        },
    });
});
export default router;
