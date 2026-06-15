import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// Site settings (including the production URL) live in src/data/site.json so
// the dashboard can edit them without touching this file.
const site = JSON.parse(
  readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8'),
);

// Base path the site is served from.
//   • GitHub Pages *project* repo → https://<user>.github.io/<repo>/, so this
//     must be '/PersonalPage'.
//   • Custom domain / user-page repo (served at the root) → change this to '/'.
// Templates use the withBase() helper (src/lib/url.ts) and markdown images are
// rewritten by the rehype pass below, so flipping this one value is all it takes.
const BASE = '/PersonalPage';

// Astro doesn't base-prefix root-absolute URLs written by hand inside markdown
// (e.g. ![](/images/robot/x.jpg)). This build-time pass does. No-op when BASE='/'.
function rehypeBasePaths() {
  const prefix = BASE.replace(/\/$/, '');
  if (!prefix) return () => () => {};
  const fix = (node) => {
    if (node.type === 'element') {
      const attr = node.tagName === 'img' ? 'src' : node.tagName === 'a' ? 'href' : null;
      if (attr) {
        const v = node.properties?.[attr];
        if (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//')) {
          node.properties[attr] = prefix + v;
        }
      }
    }
    node.children?.forEach(fix);
  };
  return () => (tree) => fix(tree);
}

export default defineConfig({
  base: BASE,
  // Until siteUrl is set in site.json, canonical URLs and the sitemap are skipped.
  site: site.siteUrl || undefined,
  integrations: site.siteUrl ? [sitemap()] : [],
  markdown: {
    rehypePlugins: [rehypeBasePaths()],
  },
});
