import './lib/load-env.js';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth.js';
import chatRouter from './routes/chat.js';
import clientPortalRouter from './routes/client-portal.js';
import debugRouter from './routes/debug.js';
import eventsRouter from './routes/events.js';
import inquiriesRouter from './routes/inquiries.js';
import playersRouter from './routes/players.js';
import pressRouter from './routes/press.js';
import qrRouter from './routes/qr.js';
import sportsRouter from './routes/sports.js';
import stadiumsRouter from './routes/stadiums.js';
const app = express();
const rawOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);
app.use(helmet());
app.use(cors({
    origin: rawOrigins && rawOrigins.length > 0 ? rawOrigins : true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'instadium-rn-backend' });
});
app.use('/api/stadiums', stadiumsRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/players', playersRouter);
app.use('/api/auth', authRouter);
app.use('/api/qr', qrRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/press', pressRouter);
app.use('/api/events', eventsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/debug', debugRouter);
app.use('/api/client-portal', clientPortalRouter);
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    console.log(`InStadium RN backend listening on http://localhost:${port}`);
});
