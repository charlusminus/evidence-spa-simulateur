// Plan du site : toutes les pages publiques (le simulateur nu /simulateur/app/ et la 404 en sont exclus).
import { absolu } from '../lib/chemins';
const pages = import.meta.glob('./**/*.astro', { eager: true });
import { SPAS, NAGE, lienProduit } from '../lib/produits';
import { VILLES, SHOWROOMS } from '../data/site';
import { getCollection } from 'astro:content';
export async function GET() {
  const statiques = Object.keys(pages).filter((k) => !k.includes('[') && !k.includes('404'))
    .map((k) => k.replace(/^\.\//, '/').replace(/index\.astro$/, '').replace(/\.astro$/, '/'));
  const conseils = (await getCollection('conseils')).map((a) => `/conseils/${a.id}/`);
  const toutes = [...new Set([...statiques, ...SPAS.map(lienProduit), ...NAGE.map(lienProduit),
    ...VILLES.map((v) => `/${v.slug}/`), ...SHOWROOMS.map((s) => `/showrooms/${s.slug}/`), ...conseils])].sort();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${toutes.map((u) => `  <url><loc>${absolu(u)}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
