import './lib/load-env.js';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'node:http';
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
import visitsRouter from './routes/visits.js';

const app = express();

const rawOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);

app.use(
  helmet({
    // QR dashboard runs on a separate origin and embeds /api/qr PNGs in <img> tags.
    // Disable CORP so browser does not block cross-origin image rendering.
    crossOriginResourcePolicy: false,
  })
);
const allowedOrigins = rawOrigins && rawOrigins.length > 0 
  ? [...rawOrigins, 'https://instadiumqr.vercel.app'] 
  : true;

app.use(
  cors({
    origin: allowedOrigins,
  })
);
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
app.use('/api/visits', visitsRouter);
app.use('/api/client-portal', clientPortalRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const basePort = Number(process.env.PORT || 4000);
const maxPortAttempts = 10;

function listenWithRetry(server: http.Server, port: number, attempt = 0): void {
  server.listen(port);

  server.once('listening', () => {
    console.log(`InStadium RN backend listening on http://localhost:${port}`);
  });

  server.once('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && attempt < maxPortAttempts) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Retrying on port ${nextPort}...`);
      listenWithRetry(server, nextPort, attempt + 1);
      return;
    }

    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

const server = http.createServer(app);
listenWithRetry(server, basePort);
