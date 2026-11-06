// Toute adresse interne passe par url() : la base change à la mise en ligne réelle (GitHub Pages puis domaine du client).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (chemin = '/') => {
  if (/^(https?:|mailto:|tel:|#)/.test(chemin)) return chemin;
  const [p, ancre] = chemin.split('#');
  const avecBarre = /\.[a-z0-9]+$/i.test(p) || p.endsWith('/') ? p : p + '/';
  return BASE + (avecBarre.startsWith('/') ? avecBarre : '/' + avecBarre) + (ancre ? '#' + ancre : '');
};
export const SITE = 'https://charlusminus.github.io';
export const absolu = (chemin: string) => SITE + url(chemin);
export const EN_LIGNE = import.meta.env.PUBLIC_EN_LIGNE === 'oui';
export const euro = (n: number | null | undefined) =>
  n == null ? 'Sur devis' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n).replace(/ | /g, ' ') + ' €';
