import './src/lib/load-env.ts';
import { prisma } from './src/lib/prisma.ts';
import QRCode from 'qrcode';

async function forceFix() {
  console.log('--- Forcing QR Fix ---');
  
  // The definitive URL and scheme
  const CORRECT_BASE_URL = 'https://instadiumapp.onrender.com';
  const CORRECT_APP_SCHEME = 'instadiumapp';

  console.log(`Forcing PUBLIC_API_BASE_URL to: ${CORRECT_BASE_URL}`);

  const mappings = await prisma.qRMapping.findMany();
  console.log(`Found ${mappings.length} mappings to process.`);

  let updatedCount = 0;

  for (const mapping of mappings) {
    const newScanUrl = `${CORRECT_BASE_URL}/api/qr/open/${encodeURIComponent(mapping.qrCode)}`;
    const newAppDeepLink = `${CORRECT_APP_SCHEME}://stadium/${encodeURIComponent(mapping.stadiumId)}?welcome=1`;
    const newPayload = newScanUrl; // The QR payload is the web URL

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

  console.log(`--- Fix Complete ---`);
  console.log(`Updated ${updatedCount} records.`);
}

forceFix()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
