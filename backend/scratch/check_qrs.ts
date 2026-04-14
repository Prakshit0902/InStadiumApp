import '../src/lib/load-env.js';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  const mappings = await prisma.qRMapping.findMany({
    take: 5,
    select: {
      qrCode: true,
      stadiumId: true,
      appDeepLink: true,
      scanUrl: true,
      qrPayload: true,
    }
  });

  console.log(JSON.stringify(mappings, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
