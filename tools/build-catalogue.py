"""Construit assets/data/catalogue.json (public) depuis le relevé privé paktiz-assets.

Ne garde que ce que le site evidence-spa.fr affiche à ses visiteurs : noms, places, dimensions,
prix publiés, finitions. Retire les sources fournisseurs et les notes internes du relevé.
Usage : python3 -I tools/build-catalogue.py <chemin vers paktiz-assets>/2-Areas/clients/evidence-spa/data/catalogue.json
"""
import json, os, re, sys

SRC = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'img', 'spas')

def hauteur(h):
    if isinstance(h, (int, float)):
        return h
    nums = [int(x) for x in re.findall(r'\d+', str(h or ''))]
    return max(nums) if nums else None

d = json.load(open(SRC, encoding='utf-8'))
out = []
for s in d['spas']:
    if s['gamme'] != 'spa':
        continue  # spas de nage : étude dédiée, hors simulateur
    k = s['cle']
    bull = s['marque'].startswith('Bullfrog')
    nom = s['nom'].replace('Évidence ', '') if not bull else s['nom']
    out.append({
        'cle': k,
        'nom': nom,
        'nom_complet': s['nom'],
        'collection': 'bullfrog' if bull else 'evidence',
        'places': s['places'],
        'allongees': s['places_allongees'] or 0,
        'longueur': s['longueur_cm'],
        'largeur': s['largeur_cm'],
        'hauteur': hauteur(s['hauteur_cm']),
        'hauteur_affichee': str(s['hauteur_cm']).replace('–', ' à '),
        'jets': s['jets'],
        'jetpak': s['jetpak'],
        'forme': 'ronde' if s.get('forme') == 'round' else 'rectangulaire',
        'prix': s['prix_ttc_eur'],
        'accroche': s['accroche'],
        'pour_qui': s['pour_qui'],
        'url_fiche': s['url_fiche'],
        'finitions': [{'cle': f['cle'], 'nom': f['nom'], 'jetpak': f['jetpak'], 'description': f['description']} for f in s['finitions']],
        'img': {
            'vignette': f'assets/img/spas/{k}-vignette.jpg',
            'dessus': f'assets/img/spas/{k}-dessus.jpg',
            'trois_quarts': f'assets/img/spas/{k}-34.jpg' if os.path.exists(os.path.join(IMG, f'{k}-34.jpg')) else None,
        },
    })
out.sort(key=lambda x: (x['collection'] != 'evidence', x['prix'] or 99999, x['nom']))
json.dump({
    'releve': d['releve_le'],
    'source': 'https://evidence-spa.fr/ (prix publiés TTC, hors livraison et installation)',
    'livraison': [
        {'cle': 'retrait', 'nom': 'Retrait au dépôt', 'prix': 0, 'detail': 'Vous venez chercher le spa avec un véhicule et le matériel adaptés.'},
        {'cle': 'transporteur', 'nom': 'Livraison par transporteur', 'prix': 499, 'detail': 'Déposé au plus près de l’emplacement, dans la limite des accès praticables au transpalette. Installation non comprise.'},
        {'cle': 'installation', 'nom': 'Livraison, installation et mise en service', 'prix': 990, 'detail': 'Manutention jusqu’à l’emplacement, mise en service, prise en main et conseils sur l’eau. Accès validé, sans grutage.'},
        {'cle': 'levage', 'nom': 'Livraison avec levage', 'prix': None, 'detail': 'Étude de l’accès et moyens de levage adaptés, sur devis.'},
    ],
    'showrooms': [
        {'cle': 'coueron', 'nom': 'Couëron', 'adresse': '6 impasse des Artisans, ZI Les Hauts de Couëron, 44220 Couëron', 'lat': 47.2163, 'lon': -1.7095},
        {'cle': 'saint-brevin', 'nom': 'Saint-Brevin-les-Pins', 'adresse': 'Avenue des 20 Moulins, 44250 Saint-Brevin-les-Pins', 'lat': 47.2470, 'lon': -2.1680},
    ],
    'telephone': '02 85 52 22 59',
    'spas': out,
}, open(os.path.join(ROOT, 'assets', 'data', 'catalogue.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'spas')
