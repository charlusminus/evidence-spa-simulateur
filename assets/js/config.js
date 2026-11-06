/* Configuration publique du simulateur (aucun secret ici : dépôt public).
   webhook : workflow n8n « Évidence Spa · Simulateur (dev) ». Vide, ou ?demo=1 dans l'adresse : mode démonstration
   sans envoi (rendus d'exemple ou montage simple). */
window.ES_CONFIG = {
  webhook: 'https://charlusminus.app.n8n.cloud/webhook/evidence-spa-simulateur',
  timeoutMs: 150000,
  exemples: { a7d: 'assets/img/demo/rendu-exemple-a7d.jpg', opalia: 'assets/img/demo/rendu-exemple-opalia.jpg' },
  jardinExemple: 'assets/img/demo/jardin-exemple.jpg'
};
