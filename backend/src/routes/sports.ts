import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const sports = await prisma.sport.findMany({
      include: {
        _count: {
          select: { stadiums: true },
        },
      },
    });

    res.json(sports);
  } catch (error) {
    console.error('GET /api/sports failed:', error);
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
});

export default router;
