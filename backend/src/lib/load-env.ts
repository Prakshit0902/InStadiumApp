import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const globalKey = '__instadium_env_loaded__';
const envState = globalThis as typeof globalThis & { [globalKey]?: boolean };

if (!envState[globalKey]) {
  const currentFile = fileURLToPath(import.meta.url);
  const backendRoot = path.resolve(path.dirname(currentFile), '..', '..');

  const candidates = [
    process.env.DOTENV_CONFIG_PATH,
    path.join(backendRoot, '.env.local'),
    path.join(backendRoot, '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
  ].filter((value): value is string => Boolean(value));

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    dotenv.config({ path: filePath, override: false });
  }

  envState[globalKey] = true;
}
