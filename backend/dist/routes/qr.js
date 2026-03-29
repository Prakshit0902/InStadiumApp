import { Router } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma.js';
import { requireClerkAdmin, requireClerkAuth } from '../lib/clerk-auth.js';
const router = Router();
function getAppScheme() {
    return process.env.APP_DEEPLINK_SCHEME || 'instadiumapp';
}
function getPublicBaseUrl() {
    const value = process.env.PUBLIC_API_BASE_URL || process.env.PUBLIC_APP_BASE_URL || '';
    return value ? value.replace(/\/$/, '') : '';
}
function getFallbackWebUrl() {
    return (process.env.PUBLIC_WEB_FALLBACK_URL || '').trim();
}
function buildAppDeepLink(stadiumId) {
    return `${getAppScheme()}:///stadium/${encodeURIComponent(stadiumId)}?welcome=1`;
}
function buildWebFallbackUrl(stadiumId) {
    const base = getFallbackWebUrl().replace(/\/$/, '');
    if (!base) {
        return '';
    }
    return `${base}/stadium/${encodeURIComponent(stadiumId)}`;
}
function buildScanUrl(qrCode) {
    const base = getPublicBaseUrl();
    if (!base) {
        return '';
    }
    return `${base}/api/qr/open/${encodeURIComponent(qrCode)}`;
}
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function buildQrCodeValue(stadiumId) {
    return `stadium-${stadiumId}`;
}
function dataUrlToPngBuffer(dataUrl) {
    const prefix = 'data:image/png;base64,';
    if (!dataUrl.startsWith(prefix)) {
        return null;
    }
    return Buffer.from(dataUrl.slice(prefix.length), 'base64');
}
async function ensureQrPngBuffer(mapping) {
    if (mapping.qrImageData) {
        const existing = dataUrlToPngBuffer(mapping.qrImageData);
        if (existing) {
            return existing;
        }
    }
    const fallbackPayload = mapping.qrPayload || mapping.scanUrl || mapping.appDeepLink || buildAppDeepLink(mapping.stadiumId);
    const freshDataUrl = await QRCode.toDataURL(fallbackPayload, {
        margin: 1,
        width: 480,
        errorCorrectionLevel: 'M',
    });
    await prisma.qRMapping.update({
        where: { qrCode: mapping.qrCode },
        data: {
            qrImageData: freshDataUrl,
            qrPayload: fallbackPayload,
        },
    });
    return Buffer.from(freshDataUrl.replace('data:image/png;base64,', ''), 'base64');
}
router.get('/mappings', requireClerkAuth, requireClerkAdmin, async (_req, res) => {
    try {
        const mappings = await prisma.qRMapping.findMany({
            include: {
                stadium: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.json(mappings);
    }
    catch (error) {
        console.error('GET /api/qr/mappings failed:', error);
        return res.status(500).json({ error: 'Failed to fetch QR mappings' });
    }
});
router.post('/generate-all', requireClerkAuth, requireClerkAdmin, async (_req, res) => {
    try {
        const stadiums = await prisma.stadium.findMany({
            select: {
                id: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        const upserted = await Promise.all(stadiums.map(async (stadium) => {
            const qrCode = buildQrCodeValue(stadium.id);
            const appDeepLink = buildAppDeepLink(stadium.id);
            const scanUrl = buildScanUrl(qrCode);
            const qrPayload = scanUrl || appDeepLink;
            const qrImageData = await QRCode.toDataURL(qrPayload, {
                margin: 1,
                width: 480,
                errorCorrectionLevel: 'M',
            });
            return prisma.qRMapping.upsert({
                where: { qrCode },
                create: {
                    qrCode,
                    stadiumId: stadium.id,
                    appDeepLink,
                    scanUrl,
                    qrPayload,
                    qrImageData,
                },
                update: {
                    appDeepLink,
                    scanUrl,
                    qrPayload,
                    qrImageData,
                },
                include: {
                    stadium: true,
                },
            });
        }));
        return res.json({
            generatedCount: upserted.length,
            mappings: upserted,
        });
    }
    catch (error) {
        console.error('POST /api/qr/generate-all failed:', error);
        return res.status(500).json({ error: 'Failed to generate QR mappings' });
    }
});
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
        return res.json({
            ...mapping,
            appDeepLink: buildAppDeepLink(mapping.stadiumId),
            scanUrl: mapping.scanUrl || buildScanUrl(mapping.qrCode),
        });
    }
    catch (error) {
        console.error('GET /api/qr/resolve failed:', error);
        return res.status(500).json({ error: 'Failed to resolve QR' });
    }
});
router.get('/open/:code', async (req, res) => {
    const code = req.params.code;
    try {
        const mapping = await prisma.qRMapping.findUnique({
            where: { qrCode: code },
            include: {
                stadium: true,
            },
        });
        if (!mapping) {
            return res.status(404).send('QR mapping not found.');
        }
        const appDeepLink = buildAppDeepLink(mapping.stadiumId);
        const fallbackUrl = buildWebFallbackUrl(mapping.stadiumId) || appDeepLink;
        const stadiumName = mapping.stadium?.name || 'InStadium Venue';
        const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Open ${escapeHtml(stadiumName)} - InStadium</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #faf8f3; color: #281f1f; }
      .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      .card { max-width: 520px; width: 100%; background: #fff; border-radius: 18px; padding: 24px; border: 1px solid #e7deda; }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { margin: 0 0 18px; color: #5b4d4d; line-height: 1.5; }
      a { display: inline-block; margin-right: 10px; margin-bottom: 8px; text-decoration: none; border-radius: 999px; padding: 12px 16px; font-weight: 700; }
      .primary { background: #810000; color: #fff; }
      .ghost { background: #f2ebe8; color: #281f1f; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>Opening ${escapeHtml(stadiumName)}</h1>
        <p>If the app is installed, it should open now and take you directly to the stadium welcome page.</p>
        <a class="primary" href="${escapeHtml(fallbackUrl)}" onclick="openInStadiumApp(); return false;">Open InStadium App</a>
        <a class="ghost" href="${escapeHtml(fallbackUrl)}">Continue</a>
      </div>
    </div>
    <script>
      function openInStadiumApp() {
        window.location.href = ${JSON.stringify(appDeepLink)};
        setTimeout(function () {
          window.location.href = ${JSON.stringify(fallbackUrl)};
        }, 1200);
      }

      openInStadiumApp();
    </script>
  </body>
</html>`;
        return res.status(200).type('html').send(html);
    }
    catch (error) {
        console.error('GET /api/qr/open/:code failed:', error);
        return res.status(500).send('Failed to open QR destination.');
    }
});
router.get('/download/:code.png', async (req, res) => {
    const code = req.params.code;
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
        const pngBuffer = await ensureQrPngBuffer(mapping);
        const stadiumSlug = (mapping.stadium?.name || mapping.stadiumId)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const filename = `${stadiumSlug || 'stadium'}-qr.png`;
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(pngBuffer);
    }
    catch (error) {
        console.error('GET /api/qr/download/:code.png failed:', error);
        return res.status(500).json({ error: 'Failed to download QR image' });
    }
});
router.get('/download/stadium/:stadiumId.png', async (req, res) => {
    const stadiumId = req.params.stadiumId;
    try {
        const code = buildQrCodeValue(stadiumId);
        const mapping = await prisma.qRMapping.findUnique({
            where: { qrCode: code },
        });
        if (!mapping) {
            return res.status(404).json({ error: 'QR mapping not found for stadium' });
        }
        return res.redirect(302, `/api/qr/download/${encodeURIComponent(mapping.qrCode)}.png`);
    }
    catch (error) {
        console.error('GET /api/qr/download/stadium/:stadiumId.png failed:', error);
        return res.status(500).json({ error: 'Failed to download stadium QR image' });
    }
});
export default router;
