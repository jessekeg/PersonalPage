import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// Site settings (including the production URL) live in src/data/site.json so
// the dashboard can edit them without touching this file.
const site = JSON.parse(
  readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8'),
);

export default defineConfig({
  // Until siteUrl is set in site.json, canonical URLs and the sitemap are skipped.
  site: site.siteUrl || undefined,
  integrations: site.siteUrl ? [sitemap()] : [],
});
