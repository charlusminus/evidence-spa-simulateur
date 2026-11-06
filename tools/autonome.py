"""Démo autonome : un seul fichier HTML, CSS, JS, catalogue et images inclus, toujours en mode démonstration
(aucun envoi, pas de Turnstile). À ouvrir sur téléphone sans réseau.
Usage : python3 -I tools/autonome.py <fichier de sortie>
"""
import base64, json, os, re, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lire = lambda p: open(os.path.join(R, p), encoding='utf-8').read()
def data(p):
    ext = os.path.splitext(p)[1].lower().strip('.')
    mime = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}[ext]
    return f'data:{mime};base64,' + base64.b64encode(open(os.path.join(R, p), 'rb').read()).decode()
cat = json.loads(lire('assets/data/catalogue.json'))
for s in cat['spas']:
    s['img']['vignette'] = data(s['img']['vignette'])
    s['img']['dessus'] = s['img']['vignette']
    s['img']['trois_quarts'] = data(s['img']['trois_quarts']) if s['img']['trois_quarts'] else None
h = lire('index.html')
h = h.replace('<link rel="stylesheet" href="assets/css/app.css?v=2">', '<style>' + lire('assets/css/app.css') + '</style>')
h = re.sub(r'<script src="https://challenges\.cloudflare\.com[^>]*></script>\n', '', h)
cfg = {'webhook': '', 'timeoutMs': 1, 'exemples': {'a7d': data('assets/img/demo/rendu-exemple-a7d.jpg'), 'opalia': data('assets/img/demo/rendu-exemple-opalia.jpg')},
       'jardinExemple': data('assets/img/demo/jardin-exemple.jpg')}
h = re.sub(r'<script src="assets/js/config\.js[^"]*"></script>', '<script>window.ES_CONFIG=' + json.dumps(cfg) + ';window.ES_CATALOGUE=' + json.dumps(cat, ensure_ascii=False) + ';</script>', h)
h = re.sub(r'<script src="assets/js/app\.js[^"]*"></script>', lambda m: '<script>' + lire('assets/js/app.js') + '</script>', h)
for p in sorted(set(re.findall(r'(?:src|href)="(assets/img/[^"]+)"', h))):
    h = h.replace(f'"{p}"', '"' + data(p) + '"')
h = h.replace('Ce n\'est pas le site d\'Évidence Spa ; les demandes faites ici ne leur sont pas transmises.', 'Ce n\'est pas le site d\'Évidence Spa. Version hors ligne : rien n\'est envoyé.')
open(sys.argv[1], 'w', encoding='utf-8').write(h)
print(sys.argv[1], round(os.path.getsize(sys.argv[1]) / 1024), 'Ko')
