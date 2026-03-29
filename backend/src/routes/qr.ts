import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/resolve', async (req, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';

  if (!code) {
    return res.status(400).json({ error: 'QR code required' });
  }

  try {
    const mapping = await prisma.qRMapping.findUnique({
      where: { qrCode: code },
      include: {
        stadium: true,
      },
    });

    if (!mapping) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    return res.json(mapping);
  } catch (error) {
    console.error('GET /api/qr/resolve failed:', error);
    return res.status(500).json({ error: 'Failed to resolve QR' });
  }
});

export default router;
