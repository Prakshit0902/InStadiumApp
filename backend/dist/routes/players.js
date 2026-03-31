import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
const router = Router();
router.get('/', async (req, res) => {
    const stadiumId = typeof req.query.stadiumId === 'string' ? req.query.stadiumId : null;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    try {
        const players = await prisma.player.findMany({
            where: {
                ...(stadiumId
                    ? {
                        stadiumsPlayed: {
                            some: { id: stadiumId },
                        },
                    }
                    : {}),
                ...(q
                    ? {
                        name: {
                            contains: q,
                            mode: 'insensitive',
                        },
                    }
                    : {}),
            },
            include: {
                sport: true,
            },
            take: q ? 20 : undefined,
        });
        res.json(players);
    }
    catch (error) {
        console.error('GET /api/players failed:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const player = await prisma.player.findUnique({
            where: { id: req.params.id },
            include: {
                sport: true,
                stadiumsPlayed: true,
            },
        });
        if (!player) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }
        res.json(player);
    }
    catch (error) {
        console.error('GET /api/players/:id failed:', error);
        res.status(500).json({ error: 'Failed to fetch player' });
    }
});
export default router;
