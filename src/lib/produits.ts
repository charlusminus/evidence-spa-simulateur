// Accès au catalogue (futurs documents « produit » de Sanity) et à leurs visuels optimisés au build.
import donnees from '../data/produits.json';
import type { ImageMetadata } from 'astro';

export type Produit = (typeof donnees.produits)[number];
const fichiers = import.meta.glob<{ default: ImageMetadata }>('../assets/catalogue/*', { eager: true });
export const visuel = (nom: string): ImageMetadata | undefined => fichiers[`../assets/catalogue/${nom}`]?.default;

// Une fiche sans visuel reste hors du site (avertissement au build), comme sur balinaisa.com
const publies = donnees.produits.filter((p) => {
  if (!p.visuels.length || !visuel(p.visuels[0].fichier)) { console.warn(`[catalogue] ${p.nomComplet} sans visuel : hors du site`); return false; }
  return true;
});
export const PRODUITS = publies;
export const SPAS = publies.filter((p) => p.gamme === 'spa');
export const EVIDENCE = SPAS.filter((p) => p.marque === 'Évidence');
export const BULLFROG = SPAS.filter((p) => p.marque === 'Bullfrog Spas');
export const NAGE = publies.filter((p) => p.gamme === 'spa-de-nage');
export const ACCESSOIRES = donnees.accessoires;
export const lienProduit = (p: Produit) => (p.gamme === 'spa-de-nage' ? `/spas-de-nage/${p.slug}/` : `/spas/${p.slug}/`);
export const caracteristiques = (p: Produit) => {
  const places = p.places ? `${p.places} places` + (p.allongees ? `, dont ${p.allongees} ${p.allongees > 1 ? 'allongées' : 'allongée'}` : ', tout assis') : null;
  return [places, `${p.longueur} × ${p.largeur} cm`].filter(Boolean).join(' · ');
};
export const visuelPrincipal = (p: Produit) => visuel(p.visuels.find((v) => !v.finition)?.fichier ?? p.visuels[0].fichier)!;
