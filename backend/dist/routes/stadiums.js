import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
const router = Router();
router.get('/', async (_req, res) => {
    try {
        const stadiums = await prisma.stadium.findMany({
            include: {
                sportsPlayed: true,
            },
            orderBy: {
                capacity: 'desc',
            },
        });
        res.json(stadiums);
    }
    catch (error) {
        console.error('GET /api/stadiums failed:', error);
        res.status(500).json({ error: 'Failed to fetch stadiums' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const stadium = await prisma.stadium.findUnique({
            where: { id: req.params.id },
            include: {
                sportsPlayed: true,
                players: true,
            },
        });
        if (!stadium) {
            return res.status(404).json({ error: 'Stadium not found' });
        }
        return res.json(stadium);
    }
    catch (error) {
        console.error('GET /api/stadiums/:id failed:', error);
        return res.status(500).json({ error: 'Failed to fetch stadium' });
    }
});
export default router;
