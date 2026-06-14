/**
 * Local content dashboard for the site. Runs only on your machine — it edits
 * the files in this repo directly (content markdown, site/resume JSON, model
 * uploads). Never deploy this; the public site is the static build in dist/.
 *
 * Start with: npm run dashboard   (then open http://localhost:5151)
 */
import http from 'node:http';
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  unlinkSync,
  statSync,
  mkdirSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import YAML from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 5151;

const PATHS = {
  site: join(ROOT, 'src', 'data', 'site.json'),
  resume: join(ROOT, 'src', 'data', 'resume.json'),
  fabrication: join(ROOT, 'src', 'data', 'fabrication.json'),
  checklist: join(ROOT, 'dashboard', 'checklist.json'),
  secrets: join(ROOT, 'dashboard', 'secrets.json'),
  models: join(ROOT, 'public', 'models'),
  fabImages: join(ROOT, 'public', 'images', 'fabrication'),
  resumePdf: join(ROOT, 'public', 'resume.pdf'),
  ui: join(ROOT, 'dashboard', 'ui.html'),
  content: {
    projects: join(ROOT, 'src', 'content', 'projects'),
    papers: join(ROOT, 'src', 'content', 'papers'),
  },
};

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const MODEL_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}\.stl$/i;
const IMAGE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}\.(jpe?g|png|webp|gif)$/i;

// ---------------------------------------------------------------- helpers

function readJSON(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(body);
}

function readBody(req, limit = 100 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Body too large'));
        req.destroy();
      } else {
        chunks.push(chunk);
      }
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/** Split a markdown file into { data, body }. */
function parseMarkdown(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: raw };
  const data = YAML.parse(match[1]) ?? {};
  // Normalize YAML dates to YYYY-MM-DD strings for clean editing.
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) data[key] = value.toISOString().slice(0, 10);
  }
  return { data, body: raw.slice(match[0].length).replace(/^\r?\n/, '') };
}

/** Serialize { data, body } back into a markdown file. */
function serializeMarkdown(data, body) {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === '' || value === null || value === undefined) continue;
    clean[key] = value;
  }
  return `---\n${YAML.stringify(clean)}---\n\n${(body ?? '').trim()}\n`;
}

function listContent(collection) {
  const dir = PATHS.content[collection];
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, body } = parseMarkdown(readFileSync(join(dir, f), 'utf8'));
      return { slug: f.replace(/\.md$/, ''), data, body };
    });
}

function contentFile(collection, slug) {
  if (!PATHS.content[collection]) throw new Error('Unknown collection');
  if (!SLUG_RE.test(slug)) throw new Error('Invalid slug');
  return join(PATHS.content[collection], `${slug}.md`);
}

function listModels() {
  if (!existsSync(PATHS.models)) return [];
  return readdirSync(PATHS.models)
    .filter((f) => f.toLowerCase().endsWith('.stl'))
    .map((f) => ({ name: f, size: statSync(join(PATHS.models, f)).size }));
}

// ---------------------------------------------------------------- metrics

async function fetchMetrics() {
  const site = readJSON(PATHS.site, {});
  const code = site.analytics?.goatcounterCode;
  const token = readJSON(PATHS.secrets, {}).goatcounterToken;
  if (!code) return { configured: false, reason: 'no-code' };
  if (!token) return { configured: false, reason: 'no-token', code };

  const base = `https://${code}.goatcounter.com/api/v0`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const day = 24 * 60 * 60 * 1000;
  const fmt = (d) => new Date(d).toISOString().slice(0, 10);
  const now = Date.now();

  async function gc(path) {
    const res = await fetch(`${base}${path}`, { headers });
    if (!res.ok) throw new Error(`GoatCounter API ${res.status}: ${await res.text()}`);
    return res.json();
  }

  const [week, month, pages] = await Promise.all([
    gc(`/stats/total?start=${fmt(now - 7 * day)}&end=${fmt(now)}`),
    gc(`/stats/total?start=${fmt(now - 30 * day)}&end=${fmt(now)}`),
    gc(`/stats/hits?start=${fmt(now - 30 * day)}&end=${fmt(now)}&limit=10`),
  ]);

  return { configured: true, code, week, month, pages };
}

// ---------------------------------------------------------------- server

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const route = `${req.method} ${url.pathname}`;

  try {
    // --- UI ---
    if (route === 'GET /') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(readFileSync(PATHS.ui, 'utf8'));
      return;
    }

    // --- read everything the UI needs ---
    if (route === 'GET /api/state') {
      sendJSON(res, 200, {
        site: readJSON(PATHS.site, {}),
        resume: readJSON(PATHS.resume, {}),
        fabrication: readJSON(PATHS.fabrication, { title: '', intro: '', gallery: [] }),
        checklist: readJSON(PATHS.checklist, []),
        projects: listContent('projects'),
        papers: listContent('papers'),
        models: listModels(),
        hasResumePdf: existsSync(PATHS.resumePdf),
        hasGoatcounterToken: Boolean(readJSON(PATHS.secrets, {}).goatcounterToken),
      });
      return;
    }

    if (route === 'GET /api/metrics') {
      sendJSON(res, 200, await fetchMetrics());
      return;
    }

    // --- simple JSON file writes ---
    if (
      route === 'PUT /api/site' ||
      route === 'PUT /api/resume' ||
      route === 'PUT /api/fabrication' ||
      route === 'PUT /api/checklist'
    ) {
      const key = url.pathname.split('/').pop();
      const parsed = JSON.parse((await readBody(req)).toString('utf8'));
      writeFileSync(PATHS[key], JSON.stringify(parsed, null, 2) + '\n');
      sendJSON(res, 200, { ok: true });
      return;
    }

    if (route === 'PUT /api/secrets') {
      const parsed = JSON.parse((await readBody(req)).toString('utf8'));
      writeFileSync(PATHS.secrets, JSON.stringify(parsed, null, 2) + '\n');
      sendJSON(res, 200, { ok: true });
      return;
    }

    // --- content CRUD: /api/content/:collection[/:slug] ---
    const contentMatch = url.pathname.match(/^\/api\/content\/(projects|papers)(?:\/([a-z0-9-]+))?$/);
    if (contentMatch) {
      const [, collection, slug] = contentMatch;

      if (req.method === 'POST' && !slug) {
        const { slug: newSlug, data, body } = JSON.parse((await readBody(req)).toString('utf8'));
        const file = contentFile(collection, newSlug);
        if (existsSync(file)) {
          sendJSON(res, 409, { error: `"${newSlug}" already exists` });
          return;
        }
        writeFileSync(file, serializeMarkdown(data, body));
        sendJSON(res, 200, { ok: true, slug: newSlug });
        return;
      }

      if (req.method === 'PUT' && slug) {
        const { data, body } = JSON.parse((await readBody(req)).toString('utf8'));
        writeFileSync(contentFile(collection, slug), serializeMarkdown(data, body));
        sendJSON(res, 200, { ok: true });
        return;
      }

      if (req.method === 'DELETE' && slug) {
        const file = contentFile(collection, slug);
        if (existsSync(file)) unlinkSync(file);
        sendJSON(res, 200, { ok: true });
        return;
      }
    }

    // --- uploads ---
    if (route === 'POST /api/upload/model') {
      const name = url.searchParams.get('name') ?? '';
      if (!MODEL_RE.test(name)) {
        sendJSON(res, 400, { error: 'Model filename must be a simple name ending in .stl' });
        return;
      }
      mkdirSync(PATHS.models, { recursive: true });
      writeFileSync(join(PATHS.models, name), await readBody(req));
      sendJSON(res, 200, { ok: true, path: `/models/${name}` });
      return;
    }

    const modelDelete = url.pathname.match(/^\/api\/model\/([A-Za-z0-9._-]+\.stl)$/i);
    if (req.method === 'DELETE' && modelDelete) {
      const file = join(PATHS.models, modelDelete[1]);
      if (existsSync(file)) unlinkSync(file);
      sendJSON(res, 200, { ok: true });
      return;
    }

    if (route === 'POST /api/upload/fabrication-image') {
      const name = url.searchParams.get('name') ?? '';
      if (!IMAGE_RE.test(name)) {
        sendJSON(res, 400, { error: 'Image must be a simple name ending in .jpg/.png/.webp/.gif' });
        return;
      }
      mkdirSync(PATHS.fabImages, { recursive: true });
      writeFileSync(join(PATHS.fabImages, name), await readBody(req));
      sendJSON(res, 200, { ok: true, path: `/images/fabrication/${name}` });
      return;
    }

    if (route === 'POST /api/upload/resume-pdf') {
      writeFileSync(PATHS.resumePdf, await readBody(req));
      sendJSON(res, 200, { ok: true });
      return;
    }

    sendJSON(res, 404, { error: `No route: ${route}` });
  } catch (err) {
    sendJSON(res, 500, { error: err.message });
  }
});

// Localhost only — this server has write access to the repo.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Dashboard running at http://localhost:${PORT}\n`);
  console.log('  Tip: run "npm run dev" in another terminal so "Open site" links work.\n');
});
