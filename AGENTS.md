# Front du simulateur Évidence Spa

**Dépôt public** (GitHub Pages) : il ne contient que le front. Le backend (workflow n8n), le relevé, le design system
et le suivi vivent dans le dépôt privé de Paktiz : s'y référer pour tout ce qui n'est pas la page.

## Structure
```
index.html                  parcours : accueil, photo, spa, accès, coordonnées, rendu
assets/css/app.css          jetons du design system relevé sur evidence-spa.fr (aucune couleur hors :root)
assets/js/app.js            logique, navigation par étapes, envoi au webhook, mode démonstration
assets/js/config.js         adresse du webhook et clé publique Turnstile (publiques par nature)
assets/data/catalogue.json  catalogue public, généré par tools/build-catalogue.py
assets/img/                 visuels réduits des modèles, jardin et rendus d'exemple
tools/autonome.py           démo hors ligne en un seul fichier (images incluses, rien n'est envoyé)
```

## Règles
- **Aucun secret** : seules l'adresse du webhook et la clé publique Turnstile sont ici. Le secret Turnstile et les
  clés vivent dans des credentials n8n.
- **Aucun contenu business** (tarifs Paktiz, notes internes, sources fournisseurs) et **aucun nom de modèle d'image**
  côté client : page, e-mails, feuille.
- **Zéro tiret cadratin**. Français, vouvoiement, ton du site d'Évidence (« moment », prix « hors livraison et installation »).
- Bandeau « Démonstration proposée par Paktiz pour Évidence Spa » toujours visible ; `noindex` et `robots.txt` en Disallow.
- Contrastes mesurés au rendu (4,5 pour le texte, 3,0 au-dessus de 24 px), y compris le texte posé sur photo, au pixel.
- Bumper `?v=` de `app.css` et `app.js` dans `index.html` à chaque changement.

## Déploiement
Pages sert la branche `dev` (version de travail). Le passage sur `main` se fait par pull request, avec le feu vert de Charles.
