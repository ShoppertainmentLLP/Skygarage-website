import { defineConfig } from 'drizzle-kit';

/* Local convenience only: in production the environment comes from the host. */
try {
  process.loadEnvFile?.('.env');
} catch {
  // no .env here
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
