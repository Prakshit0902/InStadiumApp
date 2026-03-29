import { Router } from 'express';
import { sql } from '../lib/db.js';
const router = Router();
router.get('/', async (_req, res) => {
    try {
        const events = await sql `
      SELECT e.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ei.id,
              'url', ei.url,
              'alt', ei.alt,
              'is_primary', ei.is_primary,
              'display_order', ei.display_order
            ) ORDER BY ei.display_order
          ) FILTER (WHERE ei.id IS NOT NULL),
          '[]'::json
        ) AS event_images
      FROM events e
      LEFT JOIN event_images ei ON ei.event_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `;
        res.json(events);
    }
    catch (error) {
        console.error('GET /api/events failed:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { title, slug, description, date, location, category, status, featured, client_name, testimonial } = req.body ?? {};
        const [event] = await sql `
      INSERT INTO events (title, slug, description, date, location, category, status, featured, client_name, testimonial)
      VALUES (${title}, ${slug}, ${description}, ${date}, ${location}, ${category}, ${status ?? 'draft'}, ${featured ?? false}, ${client_name}, ${testimonial})
      RETURNING *
    `;
        res.status(201).json(event);
    }
    catch (error) {
        console.error('POST /api/events failed:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const [event] = await sql `
      SELECT e.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ei.id,
              'url', ei.url,
              'alt', ei.alt,
              'is_primary', ei.is_primary,
              'display_order', ei.display_order
            ) ORDER BY ei.display_order
          ) FILTER (WHERE ei.id IS NOT NULL),
          '[]'::json
        ) AS event_images
      FROM events e
      LEFT JOIN event_images ei ON ei.event_id = e.id
      WHERE e.id = ${req.params.id}
      GROUP BY e.id
    `;
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        return res.json(event);
    }
    catch (error) {
        console.error('GET /api/events/:id failed:', error);
        return res.status(500).json({ error: 'Failed to fetch event' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { title, slug, description, date, location, category, status, featured, client_name, testimonial } = req.body ?? {};
        const [event] = await sql `
      UPDATE events SET
        title = COALESCE(${title}, title),
        slug = COALESCE(${slug}, slug),
        description = COALESCE(${description}, description),
        date = COALESCE(${date}, date),
        location = COALESCE(${location}, location),
        category = COALESCE(${category}, category),
        status = COALESCE(${status}, status),
        featured = COALESCE(${featured}, featured),
        client_name = COALESCE(${client_name}, client_name),
        testimonial = COALESCE(${testimonial}, testimonial),
        updated_at = NOW()
      WHERE id = ${req.params.id}
      RETURNING *
    `;
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        return res.json(event);
    }
    catch (error) {
        console.error('PUT /api/events/:id failed:', error);
        return res.status(500).json({ error: 'Failed to update event' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        await sql `DELETE FROM events WHERE id = ${req.params.id}`;
        res.json({ success: true });
    }
    catch (error) {
        console.error('DELETE /api/events/:id failed:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});
export default router;
