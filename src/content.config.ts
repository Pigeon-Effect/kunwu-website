import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { programIds } from './config/booking';

/** Entry ids are `<lang>/<slug>` (or just `<lang>` for single-file collections). */

/** Masters are not a collection: see src/data/masters.ts (both languages in one typed file). */

const programs = defineCollection({
  loader: glob({ pattern: '{en,zh}/*.md', base: './src/content/programs' }),
  schema: z.object({
    program: z.enum(programIds),
    /** 1–2 characters for the program's seal */
    seal: z.string().max(2),
    title: z.string(),
    nameZh: z.string(),
    order: z.number(),
    summary: z.string(),
    focus: z.array(z.string()),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '{en,zh}/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    topic: z.enum(['before', 'training', 'life', 'booking']),
    order: z.number(),
  }),
});

export const collections = { programs, faq };
