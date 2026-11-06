// Site Évidence Spa (maquette Paktiz) : Astro statique, servi par GitHub Pages sous /evidence-spa-simulateur/.
// À la mise en ligne réelle : site = domaine du client, base = '/', PUBLIC_EN_LIGNE=oui (lève noindex et bandeau).
import { defineConfig } from 'astro/config';
const BASE = '/evidence-spa-simulateur';
// Liens internes des guides en Markdown (« /spas/luma/ ») : préfixés par la base du site au build
function liensInternes() {
  const visite = (n) => { if (n.type === 'link' && n.url.startsWith('/') && !n.url.startsWith(BASE)) n.url = BASE + n.url; (n.children || []).forEach(visite); };
  return (arbre) => visite(arbre);
}
export default defineConfig({
  site: 'https://charlusminus.github.io',
  base: BASE,
  markdown: { remarkPlugins: [liensInternes] },
  trailingSlash: 'always',
  build: { format: 'directory', assets: '_actifs' },
  cacheDir: './.cache-astro',
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
