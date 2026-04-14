import '../src/lib/load-env.js';
import { prisma } from '../src/lib/prisma.js';
import QRCode from 'qrcode';

// Sync helpers from qr.ts
function getAppScheme() {
  return process.env.APP_DEEPLINK_SCHEME || 'instadiumapp';
}

function getPublicBaseUrl() {
  const value = process.env.PUBLIC_API_BASE_URL || process.env.PUBLIC_APP_BASE_URL || '';
  return value ? value.replace(/\/$/, '') : '';
}

function buildAppDeepLink(stadiumId: string) {
  return `${getAppScheme()}:///stadium/${encodeURIComponent(stadiumId)}?welcome=1`;
}

function buildScanUrl(qrCode: string) {
  const base = getPublicBaseUrl();
  if (!base) {
    return '';
  }
  return `${base}/api/qr/open/${encodeURIComponent(qrCode)}`;
}

async function repair() {
  console.log('--- Starting QR Repair ---');
  const baseUrl = getPublicBaseUrl();
  console.log(`Current PUBLIC_API_BASE_URL: ${baseUrl}`);

  if (!baseUrl) {
    console.error('ERROR: PUBLIC_API_BASE_URL is not set in .env. Cannot repair.');
    process.exit(1);
  }

  const mappings = await prisma.qRMapping.findMany();
  console.log(`Found ${mappings.length} mappings to process.`);

  let updatedCount = 0;

  for (const mapping of mappings) {
    const newScanUrl = buildScanUrl(mapping.qrCode);
    const newAppDeepLink = buildAppDeepLink(mapping.stadiumId);
    const newPayload = newScanUrl || newAppDeepLink;

    // Check if update is needed
    const needsUpdate = 
      mapping.scanUrl !== newScanUrl || 
      mapping.qrPayload !== newPayload ||
      mapping.appDeepLink !== newAppDeepLink;

    if (needsUpdate || !mapping.qrImageData) {
      console.log(`Updating [${mapping.qrCode}] -> ${newPayload}`);
      
      const newImageData = await QRCode.toDataURL(newPayload, {
        margin: 1,
        width: 480,
        errorCorrectionLevel: 'M',
      });

      await prisma.qRMapping.update({
        where: { id: mapping.id },
        data: {
          scanUrl: newScanUrl,
          qrPayload: newPayload,
          appDeepLink: newAppDeepLink,
          qrImageData: newImageData,
        }
      });
      updatedCount++;
    }
  }

  console.log(`--- Repair Complete ---`);
  console.log(`Updated ${updatedCount} records.`);
}

repair()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
