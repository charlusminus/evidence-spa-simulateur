// Données structurées (JSON-LD) : un module unique, comme sur les sites Paktiz précédents.
import { REGLAGES, SHOWROOMS } from '../data/site';
import { absolu } from './chemins';

export const organisation = () => ({
  '@context': 'https://schema.org', '@type': 'Organization', '@id': absolu('/') + '#organisation',
  name: REGLAGES.nom, legalName: REGLAGES.societe.raison, url: absolu('/'), logo: absolu('/favicon-192.png'),
  telephone: REGLAGES.telephoneLien, foundingDate: REGLAGES.societe.creation,
  address: { '@type': 'PostalAddress', streetAddress: '5 rue de la Rousselière', postalCode: '44120', addressLocality: 'Vertou', addressCountry: 'FR' },
  areaServed: { '@type': 'Country', name: 'France' },
  brand: [{ '@type': 'Brand', name: 'Évidence' }, { '@type': 'Brand', name: 'Bullfrog Spas' }],
  department: SHOWROOMS.map((s) => ({ '@id': absolu(`/showrooms/${s.slug}/`) + '#magasin' })),
});

export const magasin = (s: (typeof SHOWROOMS)[number]) => ({
  '@context': 'https://schema.org', '@type': 'HomeGoodsStore', '@id': absolu(`/showrooms/${s.slug}/`) + '#magasin',
  name: `${REGLAGES.nom}, showroom de ${s.nom}`, url: absolu(`/showrooms/${s.slug}/`), telephone: REGLAGES.telephoneLien,
  address: { '@type': 'PostalAddress', streetAddress: s.rue, postalCode: s.cp, addressLocality: s.ville, addressRegion: 'Pays de la Loire', addressCountry: 'FR' },
  geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lon },
  parentOrganization: { '@id': absolu('/') + '#organisation' },
  description: 'Showroom de spas et spas de nage, sur rendez-vous.',
  areaServed: s.secteur.map((v) => ({ '@type': 'City', name: v })),
});

export const ariane = (items: { nom: string; href: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.nom, item: absolu(it.href) })),
});

export const faq = (qr: { q: string; r: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: qr.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.r } })),
});
