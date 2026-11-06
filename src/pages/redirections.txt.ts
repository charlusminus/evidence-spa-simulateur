// Plan de redirections 301 pour la bascule du domaine : ancienne adresse d'evidence-spa.fr → nouvelle page.
// Format « ancienne nouvelle », une ligne par adresse ; à traduire dans la configuration de l'hébergeur retenu.
import { PRODUITS, lienProduit } from '../lib/produits';
export function GET() {
  const pages: [string, string][] = [
    ['/accessoires.html', '/accessoires/'], ['/garanties/', '/entretien-sav/'], ['/sav/', '/entretien-sav/'],
    ['/entretien-de-spa/', '/entretien-sav/'], ['/reparation-de-spa/', '/entretien-sav/'], ['/installation-de-spa/', '/livraison-installation/'],
    ['/nos-realisations/', '/realisations/'], ['/contact/', '/contact/'], ['/mentions-legales/', '/mentions-legales/'],
    ['/politique-de-confidentialite/', '/confidentialite/'], ['/politique-de-cookies-ue/', '/confidentialite/'],
    ['/conseils-wellis/', '/conseils/'], ['/evidence-spa/', '/a-propos/'], ['/conditions-generales-de-vente/', '/conditions-generales-de-vente/'],
  ];
  const produits = PRODUITS.filter((p) => p.ancienneAdresse).map((p) => [p.ancienneAdresse, lienProduit(p)] as [string, string]);
  const lignes = [...pages, ...produits].map(([a, n]) => `${a} ${n}`).join('\n');
  return new Response(lignes + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
