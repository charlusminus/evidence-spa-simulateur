// Échoue si une page indexable manque au plan du site (sitemap.xml généré par src/pages/sitemap.xml.ts).
import fs from 'fs'; import path from 'path';
const DIST = 'dist', BASE = '/evidence-spa-simulateur';
const plan = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const pages = []; const marche = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const p = path.join(d, e.name); e.isDirectory() ? marche(p) : e.name === 'index.html' && pages.push(p); });
marche(DIST);
const absentes = pages.map((p) => '/' + path.relative(DIST, path.dirname(p)).replace(/\\/g, '/')).map((u) => (u === '/.' || u === '/' ? '/' : u + '/'))
  .filter((u) => !u.startsWith('/simulateur/app') && !u.startsWith('/404') && !plan.includes(`${BASE}${u}<`));
if (absentes.length) { console.error('check-plan : pages absentes du plan du site\n' + absentes.join('\n')); process.exit(1); }
console.log(`check-plan : ${pages.length} pages, toutes au plan du site`);
