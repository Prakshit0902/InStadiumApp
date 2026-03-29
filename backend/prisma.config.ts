import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Prisma CLI (generate/migrate/studio) reads the datasource URL from config in Prisma v7.
    url: env('DIRECT_URL'),
  },
});
