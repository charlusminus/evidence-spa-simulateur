// Échoue si une page construite pointe vers une adresse interne absente de dist/ (liens, images, scripts).
import fs from 'fs'; import path from 'path';
const DIST = 'dist', BASE = '/evidence-spa-simulateur';
const pages = []; const marche = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const p = path.join(d, e.name); e.isDirectory() ? marche(p) : p.endsWith('.html') && pages.push(p); });
marche(DIST);
const morts = new Set();
for (const p of pages) {
  const h = fs.readFileSync(p, 'utf8');
  for (const m of h.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) {
    for (let u of m[1].split(',').map((x) => x.trim().split(' ')[0])) {
      if (!u.startsWith(BASE)) continue;
      u = decodeURIComponent(u.split('#')[0].split('?')[0]).slice(BASE.length) || '/';
      const f = path.join(DIST, u, u.endsWith('/') ? 'index.html' : '');
      if (!fs.existsSync(f)) morts.add(`${u}  (dans ${p.slice(DIST.length)})`);
    }
  }
}
if (morts.size) { console.error(`check-liens : ${morts.size} lien(s) mort(s)\n` + [...morts].slice(0, 40).join('\n')); process.exit(1); }
console.log(`check-liens : ${pages.length} pages, aucun lien interne mort`);
