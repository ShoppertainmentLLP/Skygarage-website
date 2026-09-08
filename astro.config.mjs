// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

/*
  Server secrets are read from process.env at runtime, never via import.meta.env — Vite
  replaces import.meta.env.X with the build machine's literal value, which then shadows
  whatever the host sets and silently ships local credentials in the bundle. This puts the
  local .env into process.env for dev and build only; a deployed server sees the host's own.
*/
try {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) process.env[match[1]] ??= match[2].trim().replace(/^["']|["']$/g, '');
  }
} catch {
  // No .env here: the host supplies the real environment.
}

// https://astro.build/config
export default defineConfig({
  site: 'https://www.cars911.co',
  trailingSlash: 'always',
  output: 'server',
  compressHTML: false,
  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  })
});
