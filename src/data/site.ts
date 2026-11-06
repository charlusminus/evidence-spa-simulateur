// Réglages du site : futur document unique « Réglages » dans Sanity.
// Faits relevés sur evidence-spa.fr, les mentions légales et les registres publics le 06/11/2026.
export const REGLAGES = {
  nom: 'Évidence Spa',
  accroche: 'Spas et spas de nage, conseil en showroom, livraison et installation dans toute la France.',
  telephone: '02 85 52 22 59',
  telephoneLien: '+33285522259',
  societe: {
    raison: 'Évidence Spa SAS', forme: 'SAS au capital de 10 000 €', siren: '877 553 446', rcs: 'RCS Nantes',
    siege: '5 rue de la Rousselière, 44120 Vertou', creation: '2019', directeurPublication: 'Samir Bennaï',
  },
  depot: 'Carquefou (Loire-Atlantique)',
  delaiCommande: '1 à 2 mois sur commande, plus court pour un modèle en stock',
};

export const SHOWROOMS = [
  {
    cle: 'coueron', slug: 'coueron', nom: 'Couëron', titre: 'Showroom de Couëron',
    rue: '6 impasse des Artisans', complement: 'ZI Les Hauts de Couëron', cp: '44220', ville: 'Couëron',
    lat: 47.2163, lon: -1.7095,
    acces: 'À 15 minutes de Nantes par la route de Saint-Nazaire, dans la zone d\'activité des Hauts de Couëron.',
    secteur: ['Nantes', 'Saint-Herblain', 'Couëron', 'Indre', 'Orvault', 'Le Pellerin', 'Saint-Étienne-de-Montluc', 'Savenay'],
  },
  {
    cle: 'saint-brevin', slug: 'saint-brevin-les-pins', nom: 'Saint-Brevin-les-Pins', titre: 'Showroom de Saint-Brevin-les-Pins',
    rue: 'Avenue des 20 Moulins', complement: '', cp: '44250', ville: 'Saint-Brevin-les-Pins',
    lat: 47.2470, lon: -2.1680,
    acces: 'Au sud du pont de Saint-Nazaire, sur la côte de Jade, entre Saint-Nazaire et Pornic.',
    secteur: ['Saint-Brevin-les-Pins', 'Saint-Nazaire', 'Pornic', 'Paimbœuf', 'Saint-Michel-Chef-Chef', 'La Baule', 'Pornichet'],
  },
];

// Formules publiées sur la page livraison du site (prix TTC, hors prix du spa).
export const LIVRAISON = [
  { cle: 'retrait', nom: 'Retrait au dépôt', prix: 0, resume: 'Vous venez chercher votre spa avec un véhicule et le matériel adaptés ; nous aidons au chargement.' },
  { cle: 'transporteur', nom: 'Livraison par transporteur', prix: 499, resume: 'Le spa est déposé au plus près de l\'emplacement, dans la limite des accès praticables au transpalette. Installation non comprise.' },
  { cle: 'installation', nom: 'Livraison, installation et mise en service', prix: 990, recommandee: true, resume: 'Manutention jusqu\'à l\'emplacement, installation, mise en service, prise en main des commandes et conseils sur l\'eau. Accès validé, sans grutage.' },
  { cle: 'levage', nom: 'Livraison avec levage', prix: null, resume: 'Étude de l\'accès, visite si nécessaire et moyens de levage adaptés, sur devis.' },
];

export const NAVIGATION = [
  { libelle: 'Spas', href: '/spas/' },
  { libelle: 'Spas de nage', href: '/spas-de-nage/' },
  { libelle: 'Bullfrog', href: '/bullfrog-spas/' },
  { libelle: 'Accessoires', href: '/accessoires/' },
  { libelle: 'Livraison', href: '/livraison-installation/' },
  { libelle: 'Conseils', href: '/conseils/' },
  { libelle: 'Showrooms', href: '/showrooms/' },
];

export const VILLES = [
  { slug: 'spa-nantes', ville: 'Nantes', showroom: 'coueron', distance: '15 minutes', note: 'La métropole nantaise est à un quart d\'heure du showroom de Couëron.' },
  { slug: 'spa-saint-nazaire', ville: 'Saint-Nazaire', showroom: 'saint-brevin', distance: '10 minutes par le pont', note: 'Le showroom de Saint-Brevin est juste de l\'autre côté du pont de Saint-Nazaire.' },
  { slug: 'spa-la-baule', ville: 'La Baule', showroom: 'saint-brevin', distance: '30 minutes', note: 'Pour la presqu\'île guérandaise, le showroom de Saint-Brevin est le plus proche.' },
  { slug: 'spa-pornic', ville: 'Pornic', showroom: 'saint-brevin', distance: '20 minutes', note: 'La côte de Jade est servie depuis le showroom de Saint-Brevin-les-Pins.' },
  { slug: 'spa-vendee', ville: 'la Vendée', showroom: 'coueron', distance: '1 heure environ', note: 'Livraison et installation en Vendée, conseil en showroom ou à distance.' },
  { slug: 'spa-loire-atlantique', ville: 'Loire-Atlantique', showroom: 'coueron', distance: '', note: 'Deux showrooms dans le département, à Couëron et Saint-Brevin-les-Pins.' },
];

// Formulaires (rendez-vous, contact, SAV) : workflow n8n « Évidence Spa · Formulaires (dev) », Turnstile obligatoire.
// Clé publique Turnstile (visible par nature) ; le secret ne vit que dans le credential n8n.
export const FORMULAIRES = {
  webhook: 'https://charlusminus.app.n8n.cloud/webhook/evidence-spa-formulaires',
  turnstile: '0x4AAAAAAF2ZF6xTZSISh8py',
};
