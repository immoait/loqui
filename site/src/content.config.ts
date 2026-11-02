import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Gemeinsame Felder aller Inhaltsseiten. `kurz` ist der zitierfähige Faktenblock (GEO),
// `faq` erzeugt sichtbare Fragen und FAQPage-Schema, `draft` hält Seiten aus der Produktion.
const base = z.object({
  title: z.string(),
  description: z.string().max(170),
  kurz: z.string(),
  updated: z.coerce.date(),
  draft: z.boolean().default(false),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  related: z.array(z.string()).default([]),
});

const vergleich = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/vergleich' }),
  schema: base.extend({
    competitor: z.string(),
    rows: z.array(z.object({ label: z.string(), loqui: z.string(), other: z.string() })),
  }),
});

const einwaende = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/einwaende' }),
  schema: base.extend({ quote: z.string() }),
});

const ratgeber = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ratgeber' }),
  schema: base,
});

const glossar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/glossar' }),
  schema: base.extend({ term: z.string() }),
});

const integrationen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/integrationen' }),
  schema: base.extend({ app: z.string() }),
});

export const collections = { vergleich, einwaende, ratgeber, glossar, integrationen };
