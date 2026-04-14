import { Router } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma.js';
import { requireClerkAdmin, requireClerkAuth } from '../lib/clerk-auth.js';

const router = Router();

function getAppScheme() {
  return process.env.APP_DEEPLINK_SCHEME || 'instadiumapp';
}

function getPublicBaseUrl() {
  const value = process.env.PUBLIC_API_BASE_URL || process.env.PUBLIC_APP_BASE_URL || 'https://instadiumapp.onrender.com';
  return value.replace(/\/$/, '');
}

function getFallbackWebUrl() {
  return (process.env.PUBLIC_WEB_FALLBACK_URL || '').trim();
}

function buildAppDeepLink(stadiumId: string) {
  // Use three slashes for maximum Android/iOS compatibility in some contexts, 
  // though the app handler is robust to both.
  return `${getAppScheme()}://stadium/${encodeURIComponent(stadiumId)}?welcome=1`;
}

function buildWebFallbackUrl(stadiumId: string) {
  const base = getFallbackWebUrl().replace(/\/$/, '');
  if (!base) {
    return '';
  }

  return `${base}/stadium/${encodeURIComponent(stadiumId)}`;
}

function buildScanUrl(qrCode: string) {
  const base = getPublicBaseUrl();
  if (!base) {
    return '';
  }

  return `${base}/api/qr/open/${encodeURIComponent(qrCode)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildQrCodeValue(stadiumId: string) {
  return `stadium-${stadiumId}`;
}

function dataUrlToPngBuffer(dataUrl: string) {
  const prefix = 'data:image/png;base64,';
  if (!dataUrl.startsWith(prefix)) {
    return null;
  }

  return Buffer.from(dataUrl.slice(prefix.length), 'base64');
}

async function ensureQrPngBuffer(mapping: {
  qrImageData: string | null;
  qrPayload: string | null;
  scanUrl: string | null;
  appDeepLink: string | null;
  stadiumId: string;
  qrCode: string;
}) {
  if (mapping.qrImageData) {
    const existing = dataUrlToPngBuffer(mapping.qrImageData);
    if (existing) {
      return existing;
    }
  }

  const fallbackPayload =
    mapping.qrPayload || mapping.scanUrl || mapping.appDeepLink || buildAppDeepLink(mapping.stadiumId);

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

router.get('/mappings', async (_req, res) => {
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
  } catch (error) {
    console.error('GET /api/qr/mappings failed:', error);
    return res.status(500).json({ error: 'Failed to fetch QR mappings' });
  }
});

router.post('/generate-all', async (_req, res) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      select: {
        id: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const upserted = await Promise.all(
      stadiums.map(async (stadium: { id: string }) => {
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
      })
    );

    return res.json({
      generatedCount: upserted.length,
      mappings: upserted,
    });
  } catch (error) {
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
  } catch (error) {
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
    <title>InStadium Venue Access</title>
    <!-- Modern font from Google -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #810000;
        --primary-light: #a31d1d;
        --bg: #faf8f3;
        --text: #281f1f;
        --secondary: #5b4d4d;
        --rose: #e7deda;
      }
      * { box-sizing: border-box; }
      body { 
        font-family: 'Plus Jakarta Sans', sans-serif; 
        background-color: var(--bg); 
        color: var(--text);
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        overflow-x: hidden;
      }
      .container {
        max-width: 480px;
        width: 100%;
        padding: 24px;
        animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .card {
        background: #ffffff;
        padding: 48px 32px;
        border-radius: 40px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.03), 0 0 1px rgba(0,0,0,0.1);
        border: 1px solid var(--rose);
      }
      .logo-icon {
        width: 64px;
        height: 64px;
        background: var(--primary);
        color: #fff;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 32px;
        font-size: 32px;
        font-weight: 800;
        box-shadow: 0 8px 16px rgba(129,0,0,0.2);
      }
      h1 { font-size: 32px; margin: 0 0 8px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; }
      .venue-name { color: var(--secondary); font-size: 18px; margin-bottom: 40px; opacity: 0.8; }
      .btn {
        display: block;
        width: 100%;
        padding: 18px 24px;
        border-radius: 20px;
        font-weight: 700;
        text-decoration: none;
        margin-bottom: 14px;
        transition: all 0.2s ease;
        cursor: pointer;
        border: none;
        font-size: 15px;
        letter-spacing: 0.01em;
      }
      .btn:active { transform: scale(0.98); opacity: 0.9; }
      .btn-primary { background: var(--primary); color: #fff; }
      .btn-primary:hover { background: var(--primary-light); }
      .btn-secondary { background: #f2ebe8; color: var(--text); }
      .btn-secondary:hover { background: #e9e0dd; }
      
      .status-text {
        font-size: 14px;
        color: var(--secondary);
        margin-bottom: 24px;
        min-height: 20px;
      }
      
      .warning-box {
        background: #fdf2f2;
        border: 1px solid #fee2e2;
        color: #991b1b;
        padding: 16px;
        border-radius: 20px;
        font-size: 14px;
        margin-bottom: 32px;
        display: none;
        animation: fadeIn 0.4s ease;
        line-height: 1.5;
        text-align: left;
      }
      .warning-title { font-weight: 800; margin-bottom: 4px; display: block; }
      
      @keyframes fadeIn { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
      }
      
      .footer {
        margin-top: 32px;
        font-size: 12px;
        color: #b5a4a4;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      
      /* Troubleshoot UI */
      .debug-toggle {
        margin-top: 24px;
        font-size: 13px;
        color: var(--primary);
        text-decoration: underline;
        cursor: pointer;
        background: none;
        border: none;
        padding: 8px;
        font-family: inherit;
      }
      .debug-area {
        display: block; /* Forced visible */
        margin-top: 16px;
        padding: 16px;
        background: #fdf2f2;
        border-radius: 16px;
        text-align: left;
        font-size: 10px;
        line-height: 1.4;
        border: 1px dashed var(--primary);
        color: var(--secondary);
      }
      .debug-title { font-weight: 800; margin-bottom: 8px; display: block; color: var(--primary); }
      .debug-link {
        display: block;
        padding: 8px;
        background: rgba(129,0,0,0.05);
        border-radius: 8px;
        margin-bottom: 8px;
        word-break: break-all;
        color: var(--primary);
        text-decoration: none;
        font-weight: 600;
        border: 1px solid rgba(129,0,0,0.1);
      }
      .debug-link:active { background: rgba(129,0,0,0.1); }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="logo-icon">IN<span style="font-size: 8px; vertical-align: super; opacity: 0.6; margin-left: 2px;">v3.1</span></div>
        <h1>Welcome to Venue</h1>
        <p class="venue-name">${escapeHtml(stadiumName)}</p>
        
        <div id="loading-area">
          <p id="status-msg" class="status-text">Attempting to open in app...</p>
        </div>

        <div id="warning-box" class="warning-box">
          <span class="warning-title">Mobile App Not Found</span>
          It looks like you haven't installed the <b>InStadium</b> app yet. You can still continue on our mobile website.
        </div>
        
        <button id="btn-app" class="btn btn-primary" onclick="handleAppClick()">Open App Manually</button>
        <a class="btn btn-secondary" href="${escapeHtml(fallbackUrl)}">Continue on Web</a>

        <div id="debug-area" class="debug-area">
          <span class="debug-title">Link Diagnostics (Dev Only)</span>
          <div id="debug-info">Initializing diagnostics...</div>
          <p style="margin: 8px 0;">Test link variations manually:</p>
          <a id="link-v1" class="debug-link" href="#">Standard Link (//)</a>
          <a id="link-v2" class="debug-link" href="#">Legacy Link (///)</a>
          <a id="link-v3" class="debug-link" href="#">Intent Link (Chrome Format)</a>
        </div>

        <div class="footer">InStadium Platform</div>
      </div>
    </div>
    
    <script>
      // Global Error Catcher for Mobile
      window.onerror = function(msg, url, line) {
        alert('Script Error: ' + msg + '\nLine: ' + line);
        return false;
      };

      // Diagnostic Data
      const appLink = ${JSON.stringify(appDeepLink)};
      const webLink = ${JSON.stringify(fallbackUrl)};
      const stadiumId = ${JSON.stringify(mapping.stadiumId)};
      const androidPackage = 'com.instadium.app';
      const isAndroid = /Android/i.test(navigator.userAgent);

      // DOM Elements
      const statusMsg = document.getElementById('status-msg');
      const warningBox = document.getElementById('warning-box');
      const btnApp = document.getElementById('btn-app');
      const debugArea = document.getElementById('debug-area');
      const debugInfo = document.getElementById('debug-info');

      function getDeepLink() {
        if (isAndroid) {
          return 'intent://stadium/' + stadiumId + '?welcome=1#Intent;scheme=instadiumapp;package=' + androidPackage + ';S.browser_fallback_url=' + encodeURIComponent(webLink) + ';end';
        }
        return appLink;
      }

      function tryOpenApp() {
        window.location.href = getDeepLink();
      }

      function initDiagnostics() {
          const v1 = 'instadiumapp://stadium/' + stadiumId + '?welcome=1';
          const v2 = 'instadiumapp:///stadium/' + stadiumId + '?welcome=1';
          const v3 = getDeepLink();

          document.getElementById('link-v1').href = v1;
          document.getElementById('link-v2').href = v2;
          document.getElementById('link-v3').href = v3;
          
          debugInfo.innerHTML = '<strong>Version:</strong> 3.1 &bull; <strong>OS:</strong> ' + (isAndroid ? 'Android' : 'iOS/Other') + '<br>' +
                                '<strong>ID:</strong> ' + stadiumId + '<br>' +
                                '<strong>Active:</strong> ' + v3.substring(0, 40) + '...';
      }

      function handleAppClick() {
        statusMsg.style.display = 'block';
        statusMsg.innerText = 'Retrying app...';
        tryOpenApp();
        
        setTimeout(() => {
          if (!document.hidden) {
            showFallback();
          }
        }, 2000);
      }

      function showFallback() {
        statusMsg.style.display = 'none';
        warningBox.style.display = 'block';
        btnApp.style.display = 'none';
      }

      window.onload = () => {
        initDiagnostics();
        setTimeout(() => {
          tryOpenApp();
          setTimeout(() => {
            if (!document.hidden) {
              showFallback();
            }
          }, 4500); // Increased timeout for easier debugging
        }, 500);
      };
    </script>
  </body>
</html>`;

    return res.status(200).type('html').send(html);
  } catch (error) {
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
  } catch (error) {
    console.error('GET /api/qr/download/:code.png failed:', error);
    return res.status(500).json({ error: 'Failed to download QR image' });
  }
});

router.get('/download/stadium/:stadiumId.png', async (req, res) => {
  const stadiumId = req.params.stadiumId;

  try {
    const code = buildQrCodeValue(stadiumId);
    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId }, select: { id: true } });
    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }

    const appDeepLink = buildAppDeepLink(stadiumId);
    const scanUrl = buildScanUrl(code);
    const qrPayload = scanUrl || appDeepLink;

    await prisma.qRMapping.upsert({
      where: { qrCode: code },
      create: {
        qrCode: code,
        stadiumId,
        appDeepLink,
        scanUrl,
        qrPayload,
        qrImageData: await QRCode.toDataURL(qrPayload, {
          margin: 1,
          width: 480,
          errorCorrectionLevel: 'M',
        }),
      },
      update: {
        appDeepLink,
        scanUrl,
        qrPayload,
      },
    });

    return res.redirect(302, `/api/qr/download/${encodeURIComponent(code)}.png`);
  } catch (error) {
    console.error('GET /api/qr/download/stadium/:stadiumId.png failed:', error);
    return res.status(500).json({ error: 'Failed to download stadium QR image' });
  }
});

export default router;
