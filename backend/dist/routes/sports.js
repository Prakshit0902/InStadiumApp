import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
const router = Router();
router.get('/', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    try {
        const sports = await prisma.sport.findMany({
            where: q
                ? {
                    OR: [
                        {
                            name: {
                                contains: q,
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: q,
                                mode: 'insensitive',
                            },
                        },
                    ],
                }
                : undefined,
            include: {
                _count: {
                    select: { stadiums: true },
                },
            },
            take: q ? 20 : undefined,
        });
        res.json(sports);
    }
    catch (error) {
        console.error('GET /api/sports failed:', error);
        res.status(500).json({ error: 'Failed to fetch sports' });
    }
});
export default router;
