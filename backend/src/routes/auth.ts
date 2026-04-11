import { Router } from 'express';
import { getClerkAuthContext, requireClerkAuth } from '../lib/clerk-auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/me', requireClerkAuth, async (req, res) => {
  const auth = getClerkAuthContext(req);

  if (!auth) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const clerkId = typeof auth.payload.sub === 'string' ? auth.payload.sub : '';

  // Fetch the local user record with their visits
  const dbUser = clerkId
    ? await prisma.user.findUnique({
        where: { clerkId },
        include: {
          _count: {
            select: { visits: true },
          },
        },
      })
    : null;

  const emailClaim = auth.payload.email ?? auth.payload.email_address;
  const givenName = typeof auth.payload.given_name === 'string' ? auth.payload.given_name : '';
  const familyName = typeof auth.payload.family_name === 'string' ? auth.payload.family_name : '';
  const computedName = `${givenName} ${familyName}`.trim();

  return res.json({
    user: {
      id: dbUser?.id ?? null,
      sub: clerkId || null,
      email: typeof emailClaim === 'string' ? emailClaim : null,
      name: typeof auth.payload.name === 'string' ? auth.payload.name : computedName || null,
      imageUrl: dbUser?.imageUrl || null,
      visitCount: dbUser?._count.visits ?? 0,
      claims: auth.payload,
    },
  });
});

export default router;
