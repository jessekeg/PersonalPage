# jessekegley — personal site

Personal portfolio site for Jesse Kegley: projects (with writeups), a fabrication/welding gallery, résumé, and embedded CAD (interactive STL viewer + Onshape embeds). Static site built with [Astro](https://astro.build), plus a local dashboard for editing content and tracking traffic.

## Quickstart

```bash
npm install
npm run dev          # site at http://localhost:4321
npm run dashboard    # content dashboard at http://localhost:5151 (separate terminal)
```

Run both at once and the dashboard's "Preview" / "Open site" links work. The dashboard edits the files in this repo directly, so changes appear live in the dev server.

## The dashboard

`npm run dashboard` → http://localhost:5151. **Local only — never deploy it.** Tabs:

- **Overview** — content counts + a launch checklist (pre-seeded with the open TODOs from your master resume).
- **Projects / Papers** — create, edit, publish/unpublish (draft toggle), delete. Drafts appear in `npm run dev` with a badge but are excluded from the deployed build. Papers (writeups) aren't a separate nav section — they're listed under **Writing & reports** at the bottom of the `/projects` page, since each one documents a project. Draft papers are teased publicly by title under "In the works."
- **Fabrication** — edit the welding/fabrication gallery (`src/data/fabrication.json`): title, intro, and captioned photos uploaded to `public/images/fabrication/`. Deliberately low-key — it lives behind a footer link and an About-section link, not the main nav. Until a photo is added, the page shows the welding narrative + AWS certs with a tasteful empty state.
- **Résumé** — edits `src/data/resume.json`, which drives `/resume` and the homepage skills/experience sections.
- **CAD Models** — upload STL files to `public/models/`; copy their paths into a project's CAD embeds.
- **Settings** — name, hero copy, availability pitch, contact, social links, hero stats, site URL, analytics code, résumé PDF upload.
- **Metrics** — GoatCounter traffic stats (see below).

No dashboard required, though — everything is plain markdown/JSON you can edit by hand:

```
src/content/projects/*.md   # one file per project (YAML frontmatter + markdown)
src/content/papers/*.md     # one file per paper/writeup (listed under /projects)
src/data/site.json          # identity, contact, hero, analytics
src/data/resume.json        # education, experience, skills, certs
src/data/fabrication.json   # welding/fabrication gallery (title, intro, photos)
```

## Showing CAD work

Each project's frontmatter takes a `cad` list:

```yaml
cad:
  - kind: stl            # interactive three.js viewer
    src: /models/gearbox.stl
    title: "Cycloidal gearbox"
    caption: "Drag to orbit, scroll to zoom."
  - kind: onshape        # iframe embed
    src: https://cad.onshape.com/documents/<id>/w/<id>/e/<id>
    title: "Full arm assembly"
```

- **STL**: in Onshape, right-click a Part Studio tab → Export → STL, then upload via the dashboard's CAD Models tab. Keep exports under ~10 MB for fast page loads (medium resolution is plenty).
- **Onshape**: Share the document → "Anyone with the link can view" → paste the document URL. The page also renders an "Open in Onshape" fallback link.

The current model on the 6-DOF arm page (`/models/cycloidal-disc-sample.stl`) is a generated placeholder — `npm run generate:sample-stl` recreates it.

## Metrics (GoatCounter)

Free, privacy-friendly analytics — no cookie banner needed.

1. Sign up at [goatcounter.com](https://www.goatcounter.com) and pick a code (e.g. `jessekegley`).
2. Enter the code in dashboard **Settings → GoatCounter code**, save, redeploy. The tracking script is injected automatically; it's omitted entirely while the code is empty.
3. Optional: GoatCounter → Settings → API → token with *read statistics*, paste into the **Metrics** tab to see pageviews/top pages inside the dashboard. The token is stored in `dashboard/secrets.json` (gitignored).

## Deploying

`npm run build` produces a fully static `dist/` — host it anywhere:

- **Netlify / Vercel / Cloudflare Pages**: connect the repo; build command `npm run build`, output `dist`. (Astro is auto-detected.)
- **GitHub Pages**: use [withastro/action](https://github.com/withastro/action).

After deploying, set the production URL in dashboard **Settings → Site URL** and redeploy once — that turns on canonical URLs and the sitemap (good for SEO, which matters for the job search).

This repo isn't a git repository yet — run `git init` and push to GitHub before connecting a host.

## Project layout

```
astro.config.mjs            # reads siteUrl from src/data/site.json
src/
  content.config.ts         # collection schemas (projects, papers)
  content/                  # markdown content
  data/                     # site.json, resume.json
  layouts/Base.astro        # head/meta/theme/analytics + header/footer
  components/               # Header, Footer, ProjectCard, CadViewer (three.js STL), OnshapeEmbed, …
  pages/                    # index, projects (+ writing), fabrication, resume, 404
  styles/global.css         # design tokens — edit :root vars to retheme
dashboard/
  server.mjs                # local Node server (no extra deps)
  ui.html                   # single-file dashboard UI
  checklist.json            # launch checklist data
public/
  models/                   # STL files
  images/fabrication/       # welding/fabrication gallery photos (upload via dashboard)
  resume.pdf                # (upload via dashboard) enables the download button
scripts/generate-sample-stl.mjs
```

## Status / roadmap

Work in progress by design. Ideas not yet built:

- Photo galleries on individual project pages (the `/fabrication` gallery already covers shop/weld photos)
- Open Graph preview image
- Tag filtering on the projects page
- Per-paper detail pages (papers currently list + link to PDFs)
- Print stylesheet for /resume

The launch checklist in the dashboard tracks the content gaps (links, dates, writeups) carried over from the master resume.
