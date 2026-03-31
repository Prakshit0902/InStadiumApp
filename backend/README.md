# InStadium React Native Backend

This backend lives inside the React Native app workspace and serves real Neon data for mobile consumption.

## Stack
- Express + TypeScript
- Prisma Client
- Neon Postgres

## Implemented Endpoints
- GET /health
- GET /api/stadiums
- GET /api/stadiums/:id
- GET /api/sports
- GET /api/players
- GET /api/qr/resolve
- GET /api/qr/mappings
- POST /api/qr/generate-all
- GET /api/qr/open/:code
- GET /api/qr/download/:code.png
- GET /api/qr/download/stadium/:stadiumId.png
- GET /api/inquiries
- POST /api/inquiries
- PUT /api/inquiries/:id
- GET /api/press
- POST /api/press
- GET /api/events
- POST /api/events
- GET /api/events/:id
- PUT /api/events/:id
- DELETE /api/events/:id
- POST /api/chat
- GET /api/debug
- GET /api/client-portal/:clientId

These endpoint shapes mirror the existing web backend patterns.

## Setup
1. Copy `backend/.env.example` to `backend/.env`
2. Set valid Neon `DATABASE_URL` and `DIRECT_URL`
3. Configure Sarvam AI for chatbot extraction (optional but recommended):
   - `SARVAM_API_KEY`
   - Optional: `SARVAM_MODEL` (default `sarvam-m`)
   - Optional: `SARVAM_CHAT_URL` (default `https://api.sarvam.ai/v1/chat/completions`)
   - Optional: `CHAT_TELEMETRY_ENABLED=true` (logs redacted resolver telemetry for confidence debugging)
4. Configure Clerk JWT verification for protected routes:
   - `CLERK_ISSUER`
   - Optional: `CLERK_JWKS_URL` (auto-derived from issuer if omitted)
   - Optional: `CLERK_AUDIENCE`
   - Optional: `CLERK_AUTHORIZED_PARTIES` (comma-separated `azp` values)
   - Optional: `CLERK_ADMIN_EMAILS` (comma-separated)
5. Install dependencies:
   - `cd instadium-app/backend`
   - `npm install`
6. Generate Prisma client:
   - `npm run prisma:generate`
7. Start backend:
   - `npm run dev`

## Run from App Root
From `instadium-app`:
- `npm run backend:dev`
- `npm run backend:build`
- `npm run backend:start`

## Mobile App Base URL
In `instadium-app/.env`:
- Android emulator: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:4010`
- Physical device: `EXPO_PUBLIC_API_BASE_URL=http://<laptop-ip>:4010`

## Notes
- Keep backend and Expo app running at the same time during integration.
- Prisma v7 reads CLI datasource connection from `prisma.config.ts`.
- Prisma Client runtime uses adapter connection from `DATABASE_URL` in application code.
- For migration tooling, `DIRECT_URL` is recommended (non-pooled connection).
- `/api/inquiries`, `/api/press`, and `/api/events` depend on SQL tables that are separate from Prisma models and should exist in Neon before use.

## Clerk Auth Protection
- Public routes remain open for browsing data (`/api/stadiums`, `/api/sports`, `/api/players`, `/api/qr/resolve`, `/api/chat`).
- Protected routes now require a valid Bearer token signed by Clerk:
   - `/api/auth/me`
   - `/api/debug`
   - `/api/client-portal/:clientId`
   - `POST|PUT|DELETE /api/events`
   - `GET|PUT /api/inquiries`
   - `POST /api/press`
   - `GET /api/qr/mappings`
   - `POST /api/qr/generate-all`
- If `CLERK_ADMIN_EMAILS` is set, write/admin routes are restricted to listed emails.

## QR Mapping Flow
- Call `POST /api/qr/generate-all` to create mapped QR entries for every stadium.
- Generated mappings are stored in Neon via Prisma table `QRMapping`.
- `qrImageData` stores full QR image as a base64 data URL (works without Cloudinary setup).
- Generated QR payload uses `PUBLIC_API_BASE_URL/api/qr/open/:code` so scanning from a normal camera can open the app via deep link.
- Use `GET /api/qr/download/stadium/:stadiumId.png` for one-click QR download for a specific stadium.
