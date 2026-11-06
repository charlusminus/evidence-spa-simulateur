"""Données du site : produits (spas, spas de nage, Bullfrog, accessoires) au format des futurs documents Sanity.

Lit le relevé privé (catalogue.json de paktiz-assets) et les visuels récupérés, écrit src/data/produits.json et
copie les visuels utiles dans src/assets/catalogue/ (JPEG aplati sur fond blanc). Ne garde que ce que le site d'Évidence Spa publie à ses
visiteurs : jamais les sources fournisseurs, noms fournisseurs ni notes de travail du relevé.
Usage : python3 -I tools/build-donnees.py <catalogue.json> <dossier des visuels récupérés>
"""
import json, os, re, shutil, sys, unicodedata
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT, VIS = sys.argv[1], sys.argv[2]
DEST = os.path.join(ROOT, 'src', 'assets', 'catalogue')

def slug(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')

def hauteur(h):
    n = [int(x) for x in re.findall(r'\d+', str(h or ''))]
    return max(n) if n else None

d = json.load(open(CAT, encoding='utf-8'))
idx = json.load(open(os.path.join(VIS, 'index.json'), encoding='utf-8'))
os.makedirs(DEST, exist_ok=True)

def visuels(cle):
    """Visuels d'un modèle dans l'ordre publié, copiés sous un nom neutre (aucun nom de fournisseur)."""
    out = []
    for nom in sorted(k for k in idx if k.startswith(f'spas/{cle}-')):
        src = os.path.join(VIS, nom)
        if not os.path.exists(src) or os.path.getsize(src) < 2000:
            continue
        fin = re.search(r'-finition-([a-z]+)', nom)
        neutre = f"{cle}-{'finition-' + fin.group(1) if fin else len(out) + 1}.jpg"
        # Aplati sur fond blanc en JPEG : le format de secours reste léger (un PNG de 63 Ko sortait à 474 Ko)
        im = ImageOps.exif_transpose(Image.open(src)).convert('RGBA')
        fond = Image.new('RGBA', im.size, 'white'); fond.alpha_composite(im)
        im = fond.convert('RGB'); im.thumbnail((1600, 1600)); im.save(os.path.join(DEST, neutre), quality=88)
        out.append({'fichier': neutre, 'finition': fin.group(1) if fin else None})
    return out

produits = []
for s in d['spas']:
    bull = s['marque'].startswith('Bullfrog')
    nage = s['gamme'] == 'spa de nage'
    nom = s['nom'] if bull else s['nom'].replace('Évidence ', '')
    v = visuels(s['cle'])
    produits.append({
        '_type': 'produit',
        'cle': s['cle'],                       # identité stable (clé du simulateur et du workflow)
        'slug': slug(nom),
        'nom': nom,
        'nomComplet': s['nom'],
        'marque': 'Bullfrog Spas' if bull else 'Évidence',
        'gamme': 'spa-de-nage' if nage else 'spa',
        'places': s['places'],
        'allongees': s['places_allongees'] or 0,
        'longueur': s['longueur_cm'], 'largeur': s['largeur_cm'],
        'hauteur': hauteur(s['hauteur_cm']), 'hauteurTexte': str(s['hauteur_cm']).replace('–', ' à '),
        'jets': s['jets'], 'jetpak': s['jetpak'], 'pompes': s['pompes'],
        'alimentation': s['alimentation'], 'isolation': s['isolation'],
        'forme': 'ronde' if s.get('forme') == 'round' else 'rectangulaire',
        'equipements': [e for e in s['equipements'] if not re.search(r'confirmer', e, re.I)],
        'finitions': [{'cle': f['cle'], 'nom': f['nom'], 'jetpak': f['jetpak'], 'description': f['description']} for f in s['finitions']],
        'prix': s['prix_ttc_eur'],
        'accroche': s['accroche'],
        'pourQui': s['pour_qui'],
        'aSavoir': s['a_prendre_en_compte'],
        'visuels': v,
        'ancienneAdresse': s['url_fiche'].replace('https://evidence-spa.fr', ''),
    })

accessoires = [{'_type': 'accessoire', 'cle': a['cle'], 'nom': a['nom'], 'prix': a['prix_ttc_eur'], 'disponible': a['disponible']} for a in d['accessoires']]
json.dump({'releve': d['releve_le'], 'produits': produits, 'accessoires': accessoires},
          open(os.path.join(ROOT, 'src', 'data', 'produits.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
sans = [p['cle'] for p in produits if not p['visuels']]
print(len(produits), 'produits,', len(accessoires), 'accessoires ; sans visuel :', sans)
