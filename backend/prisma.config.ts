import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const prismaUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/neondb?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Prisma CLI (generate/migrate/studio) reads the datasource URL from config in Prisma v7.
    url: prismaUrl,
  },
});
