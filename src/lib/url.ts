/**
 * Prefix a root-absolute, internal path with the configured base path so links
 * and assets resolve when the site is served from a sub-path (e.g. GitHub Pages
 * project repo at /PersonalPage/). External URLs, mailto:, protocol-relative
 * (//) and in-page fragments (#…) are returned unchanged.
 *
 * import.meta.env.BASE_URL is '/PersonalPage/' or '/' depending on astro.config.
 */
const BASE = import.meta.env.BASE_URL;

export function withBase(path: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  return BASE.replace(/\/$/, '') + path;
}
