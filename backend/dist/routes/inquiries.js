import { Router } from 'express';
import { sql } from '../lib/db.js';
import { requireClerkAdmin, requireClerkAuth } from '../lib/clerk-auth.js';
const router = Router();
router.get('/', requireClerkAuth, requireClerkAdmin, async (_req, res) => {
    try {
        const inquiries = await sql `
      SELECT * FROM inquiries
      ORDER BY created_at DESC
    `;
        res.json(inquiries);
    }
    catch (error) {
        console.error('GET /api/inquiries failed:', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, event_type, event_date, guest_count, budget_range, message, location } = req.body ?? {};
        const [inquiry] = await sql `
      INSERT INTO inquiries (name, email, phone, event_type, event_date, guest_count, budget_range, message, status, location)
      VALUES (${name}, ${email}, ${phone}, ${event_type}, ${event_date}, ${guest_count}, ${budget_range}, ${message}, 'new', ${location})
      RETURNING *
    `;
        res.status(201).json(inquiry);
    }
    catch (error) {
        console.error('POST /api/inquiries failed:', error);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
});
router.put('/:id', requireClerkAuth, requireClerkAdmin, async (req, res) => {
    try {
        const { status } = req.body ?? {};
        const [inquiry] = await sql `
      UPDATE inquiries SET
        status = ${status},
        updated_at = NOW()
      WHERE id = ${req.params.id}
      RETURNING *
    `;
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        return res.json(inquiry);
    }
    catch (error) {
        console.error('PUT /api/inquiries/:id failed:', error);
        return res.status(500).json({ error: 'Failed to update inquiry status' });
    }
});
export default router;
