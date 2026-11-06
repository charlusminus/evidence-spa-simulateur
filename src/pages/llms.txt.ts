// llms.txt : résumé Markdown du site pour les moteurs génératifs (H1, liens en [texte](url)), à jour à chaque build.
import { absolu, euro } from '../lib/chemins';
import { REGLAGES, SHOWROOMS, LIVRAISON, VILLES } from '../data/site';
import { EVIDENCE, BULLFROG, NAGE, lienProduit, caracteristiques } from '../lib/produits';
import { getCollection } from 'astro:content';
export async function GET() {
  const conseils = (await getCollection('conseils')).sort((a, b) => a.data.ordre - b.data.ordre);
  const l = (t: string, u: string, d = '') => `- [${t}](${absolu(u)})${d ? ': ' + d : ''}`;
  const md = `# ${REGLAGES.nom}

> Spas et spas de nage en Loire-Atlantique : collection Évidence à prix publiés (${euro(Math.min(...EVIDENCE.map((p) => p.prix!)))} à ${euro(Math.max(...EVIDENCE.map((p) => p.prix!)))} TTC), revendeur Bullfrog Spas, showrooms à ${SHOWROOMS.map((s) => s.nom).join(' et ')} sur rendez-vous, livraison et installation dans toute la France métropolitaine depuis Carquefou. Téléphone ${REGLAGES.telephone}.

## Faits clés
- Société : ${REGLAGES.societe.raison}, SIREN ${REGLAGES.societe.siren}, créée en ${REGLAGES.societe.creation}, siège ${REGLAGES.societe.siege}.
${SHOWROOMS.map((s) => `- ${s.titre} : ${s.rue}, ${s.cp} ${s.ville}, sur rendez-vous.`).join('\n')}
- Livraison : ${LIVRAISON.map((f) => `${f.nom.toLowerCase()} ${f.prix === 0 ? 'gratuit' : f.prix == null ? 'sur devis' : euro(f.prix)}`).join(' ; ')}. Prix des spas toujours hors livraison.
- Garantie commerciale : 2 ans électronique et pompes, 2 ans étanchéité de la cuve, 5 ans structure, en plus des garanties légales.
- Passage à prévoir pour livrer un spa : sa hauteur plus 15 cm environ (90 à 115 cm), sinon levage par grue sur devis.
- Simulateur gratuit : le spa choisi posé à sa vraie taille sur la photo du jardin, rendu envoyé par e-mail.

## Spas Évidence
${EVIDENCE.map((p) => l(p.nomComplet, lienProduit(p), `${caracteristiques(p)} · ${euro(p.prix)} TTC`)).join('\n')}

## Bullfrog Spas
${BULLFROG.map((p) => l(p.nomComplet, lienProduit(p), `${caracteristiques(p)} · sur proposition`)).join('\n')}

## Spas de nage
${NAGE.map((p) => l(p.nomComplet, lienProduit(p), `${p.longueur} × ${p.largeur} cm · sur proposition`)).join('\n')}

## Services
${l('Voir un spa dans mon jardin (simulateur)', '/simulateur/')}
${l('Livraison et installation', '/livraison-installation/')}
${l('Entretien, garanties et SAV', '/entretien-sav/')}
${l('Accessoires et filtres', '/accessoires/')}
${l('Prendre rendez-vous', '/rendez-vous/')}

## Showrooms et secteurs
${SHOWROOMS.map((s) => l(s.titre, `/showrooms/${s.slug}/`)).join('\n')}
${VILLES.map((v) => l(`Spa ${v.ville.replace(/^la /, '')}`, `/${v.slug}/`)).join('\n')}

## Conseils
${conseils.map((c) => l(c.data.titre, `/conseils/${c.id}/`, c.data.resume)).join('\n')}
${l('Questions fréquentes', '/faq/')}

## Entreprise
${l('À propos', '/a-propos/')}
${l('Réalisations', '/realisations/')}
${l('Contact', '/contact/')}
`;
  return new Response(md, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
