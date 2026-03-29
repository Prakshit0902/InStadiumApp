import { Router } from 'express';
import { getClerkAuthContext, requireClerkAuth } from '../lib/clerk-auth.js';

const router = Router();

router.get('/me', requireClerkAuth, (req, res) => {
  const auth = getClerkAuthContext(req);

  if (!auth) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const emailClaim = auth.payload.email ?? auth.payload.email_address;
  const givenName = typeof auth.payload.given_name === 'string' ? auth.payload.given_name : '';
  const familyName = typeof auth.payload.family_name === 'string' ? auth.payload.family_name : '';
  const computedName = `${givenName} ${familyName}`.trim();

  return res.json({
    user: {
      sub: typeof auth.payload.sub === 'string' ? auth.payload.sub : null,
      email: typeof emailClaim === 'string' ? emailClaim : null,
      name: typeof auth.payload.name === 'string' ? auth.payload.name : computedName || null,
      claims: auth.payload,
    },
  });
});

export default router;
