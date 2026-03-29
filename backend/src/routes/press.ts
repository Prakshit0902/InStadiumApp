import { Router } from 'express';
import { sql } from '../lib/db.js';
import { requireNeonAdmin, requireNeonAuth } from '../lib/neon-auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const press = await sql`
      SELECT
        pf.*,
        COALESCE(
          (SELECT json_agg(pi ORDER BY pi.display_order)
           FROM press_images pi
           WHERE pi.press_id = pf.id),
          '[]'
        ) as images
      FROM press_features pf
      ORDER BY pf.published_date DESC
    `;

    res.json(press);
  } catch (error) {
    console.error('GET /api/press failed:', error);
    res.status(500).json({ error: 'Failed to fetch press features' });
  }
});

router.post('/', requireNeonAuth, requireNeonAdmin, async (req, res) => {
  try {
    const { publication, headline, url, logo_url, published_date, featured } = req.body ?? {};

    const [feature] = await sql`
      INSERT INTO press_features (publication, headline, url, logo_url, published_date, featured)
      VALUES (${publication}, ${headline}, ${url}, ${logo_url}, ${published_date}, ${featured ?? false})
      RETURNING *
    `;

    res.status(201).json(feature);
  } catch (error) {
    console.error('POST /api/press failed:', error);
    res.status(500).json({ error: 'Failed to create press feature' });
  }
});

export default router;
