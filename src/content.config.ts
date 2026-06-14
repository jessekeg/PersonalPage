import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cadEmbed = z.object({
  /** 'stl' renders an interactive 3D viewer; 'onshape' renders an iframe embed. */
  kind: z.enum(['stl', 'onshape']),
  /** For 'stl': a path under /public (e.g. /models/part.stl). For 'onshape': the share/embed URL. */
  src: z.string(),
  title: z.string().optional(),
  caption: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    /** Display date, free-form (e.g. "Winter 2026"). */
    date: z.string(),
    /** Machine-sortable date used for ordering. */
    sortDate: z.coerce.date(),
    status: z.enum(['completed', 'in-progress', 'ongoing']).default('completed'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    role: z.string().optional(),
    repo: z.string().optional(),
    /** Short headline facts shown in a "Key results" box on the detail page. */
    highlights: z.array(z.string()).default([]),
    cad: z.array(cadEmbed).default([]),
  }),
});

const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/papers' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    venue: z.string().optional(),
    date: z.string(),
    sortDate: z.coerce.date(),
    draft: z.boolean().default(false),
    /** Path to a PDF under /public (e.g. /papers/report.pdf) or an external URL. */
    pdf: z.string().optional(),
    link: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, papers };
