import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  const stadiumId = typeof req.query.stadiumId === 'string' ? req.query.stadiumId : null;

  try {
    const players = await prisma.player.findMany({
      where: stadiumId
        ? {
            stadiumsPlayed: {
              some: { id: stadiumId },
            },
          }
        : {},
      include: {
        sport: true,
      },
    });

    res.json(players);
  } catch (error) {
    console.error('GET /api/players failed:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

export default router;
