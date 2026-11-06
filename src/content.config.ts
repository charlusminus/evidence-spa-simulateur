// Guides (futurs documents « article » de Sanity) : Markdown, auteur, date de mise à jour, FAQ en fin d'article.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const conseils = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/conseils' }),
  schema: z.object({
    titre: z.string(), description: z.string(), resume: z.string(), maj: z.string(), ordre: z.number(),
    rubrique: z.enum(['Choisir', 'Budget', 'Installer', 'Entretenir', 'Local']),
    faq: z.array(z.object({ q: z.string(), r: z.string() })).default([]),
    produits: z.array(z.string()).default([]),
  }),
});
export const collections = { conseils };
