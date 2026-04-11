import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { getClerkAuthContext, requireClerkAuth } from '../lib/clerk-auth.js';

const router = Router();

/**
 * GET /api/visits
 * Returns the authenticated user's visit history
 */
router.get('/', requireClerkAuth, async (req, res) => {
  const auth = getClerkAuthContext(req);
  if (!auth) return res.status(401).json({ error: 'Auth required' });

  const clerkId = typeof auth.payload.sub === 'string' ? auth.payload.sub : '';

  try {
    const visits = await prisma.visit.findMany({
      where: {
        user: { clerkId },
      },
      include: {
        stadium: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(visits);
  } catch (error) {
    console.error('GET /api/visits failed:', error);
    return res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

/**
 * POST /api/visits
 * App-side: Records a visit to a stadium.
 * Body: { stadiumId: string }
 */
router.post('/', requireClerkAuth, async (req, res) => {
  const auth = getClerkAuthContext(req);
  if (!auth) return res.status(401).json({ error: 'Auth required' });

  const clerkId = typeof auth.payload.sub === 'string' ? auth.payload.sub : '';
  const { stadiumId } = req.body;

  if (!stadiumId) {
    return res.status(400).json({ error: 'Stadium ID is required' });
  }

  try {
    // We already sync the user in the middleware, but let's find the ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User record not found. Try logging in again.' });
    }

    const visit = await prisma.visit.create({
      data: {
        userId: user.id,
        stadiumId,
      },
      include: {
        stadium: true,
      },
    });

    return res.json({
      message: 'Visit recorded successfully',
      visit,
    });
  } catch (error) {
    console.error('POST /api/visits failed:', error);
    return res.status(500).json({ error: 'Failed to record visit' });
  }
});

export default router;
