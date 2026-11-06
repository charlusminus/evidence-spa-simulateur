// Réalisations : installations faites par l'équipe, photos publiées sur evidence-spa.fr (futurs documents « réalisation » de Sanity).
// La photo 29 (spa d'une ancienne marque, logo visible) n'est pas reprise.
import type { ImageMetadata } from 'astro';
const fichiers = import.meta.glob<{ default: ImageMetadata }>('../assets/realisations/*.jpg', { eager: true });
const img = (n: number) => fichiers[`../assets/realisations/realisation-${String(n).padStart(2, '0')}.jpg`].default;

export type Realisation = { n: number; titre: string; alt: string; cadre: 'Terrasse bois' | 'Pergola et abri' | 'Jardin' | 'Livraison par levage' };
export const REALISATIONS: Realisation[] = [
  { n: 1, titre: 'Sous la pergola, sur damier', alt: 'Spa sous une pergola métallique, posé sur un dallage en damier au fond du jardin', cadre: 'Pergola et abri' },
  { n: 2, titre: 'Une terrasse faite pour ralentir', alt: 'Spa encastré dans une terrasse en bois, sous une voile d\'ombrage', cadre: 'Terrasse bois' },
  { n: 3, titre: 'Contre la clôture', alt: 'Spa à habillage gris le long d\'une clôture, couverture relevée', cadre: 'Jardin' },
  { n: 4, titre: 'Sur la terrasse en bois', alt: 'Spa posé sur une terrasse en bois devant une clôture, palmier en pot au premier plan', cadre: 'Terrasse bois' },
  { n: 5, titre: 'La maison vue depuis le spa', alt: 'Vue depuis le spa vers la maison et sa terrasse', cadre: 'Jardin' },
  { n: 6, titre: 'Un cocon habillé de bois', alt: 'Spa contre un bardage en bois clair', cadre: 'Terrasse bois' },
  { n: 7, titre: 'Les plaisirs de l\'eau au grand air', alt: 'Fontaines du spa en marche, jardin arboré en arrière-plan', cadre: 'Jardin' },
  { n: 8, titre: 'Prendre sa place, simplement', alt: 'Spa en cours de mise en place sous un abri, cuve blanche et habillage gris', cadre: 'Pergola et abri' },
  { n: 9, titre: 'Face au ciel', alt: 'Spa en marche sous un ciel bleu, devant un mur clair', cadre: 'Jardin' },
  { n: 10, titre: 'Une pause sous la pergola', alt: 'Spa sous une pergola en bois, marchepied et lève-couverture', cadre: 'Pergola et abri' },
  { n: 11, titre: 'Les jets en action', alt: 'Cuve grise en marche, jets et éclairage', cadre: 'Pergola et abri' },
  { n: 12, titre: 'Les places en détail', alt: 'Vue plongeante sur les places et les jets d\'un spa', cadre: 'Pergola et abri' },
  { n: 13, titre: 'Une bulle de verdure', alt: 'Spa entouré de bambous et de feuillages', cadre: 'Jardin' },
  { n: 14, titre: 'Une parenthèse parmi les feuillages', alt: 'Spa au pied d\'une haie de bambous', cadre: 'Jardin' },
  { n: 15, titre: 'De plain-pied', alt: 'Spa sur une dalle en pierre, couverture posée à côté', cadre: 'Jardin' },
  { n: 16, titre: 'Face au jardin', alt: 'Spa face à la pelouse, palmiers et clôture en bois', cadre: 'Jardin' },
  { n: 17, titre: 'Les fontaines en mouvement', alt: 'Fontaines en arc au-dessus de l\'eau du spa, verger en arrière-plan', cadre: 'Jardin' },
  { n: 18, titre: 'Un espace pour déconnecter', alt: 'Spa face à une grande pelouse bordée d\'arbres', cadre: 'Jardin' },
  { n: 19, titre: 'Sous la pergola en bois', alt: 'Spa sous une pergola en bois, sur gazon synthétique, contre une maison aux volets rouges', cadre: 'Pergola et abri' },
  { n: 20, titre: 'Deux façons de profiter de l\'eau', alt: 'Spa à côté de la piscine, sous une pergola voilée', cadre: 'Terrasse bois' },
  { n: 21, titre: 'L\'eau et les palmiers', alt: 'Spa sur une terrasse en bois entourée de palmiers et de cordylines', cadre: 'Terrasse bois' },
  { n: 22, titre: 'Au cœur du jardin', alt: 'Spa installé au milieu d\'un jardin planté, au pied d\'un arbre', cadre: 'Jardin' },
  { n: 23, titre: 'La détente à l\'abri', alt: 'Spa dans un abri vitré, proche de la maison', cadre: 'Pergola et abri' },
  { n: 24, titre: 'Au rythme de la lumière', alt: 'Spa intégré à une terrasse en bois sous pergola, vue sur le jardin', cadre: 'Terrasse bois' },
  { n: 25, titre: 'Son coin de bien-être', alt: 'Spa sous une pergola en bois, jardin sec en arrière-plan', cadre: 'Terrasse bois' },
  { n: 26, titre: 'Le levage au-dessus de la maison', alt: 'Spa soulevé par une grue au-dessus du toit d\'une maison', cadre: 'Livraison par levage' },
  { n: 27, titre: 'Du levage aux premiers moments dans l\'eau', alt: 'Le même spa installé et rempli, au pied de la maison', cadre: 'Livraison par levage' },
  { n: 28, titre: 'Le camion-grue en place', alt: 'Camion-grue levant un spa emballé au-dessus d\'un jardin', cadre: 'Livraison par levage' },
];
export const imageRealisation = (r: Realisation) => img(r.n);
