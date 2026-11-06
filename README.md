# Site Évidence Spa (maquette) et simulateur intégré

**Dépôt public** (GitHub Pages) : il ne contient que le front. Le backend (workflows n8n), le relevé, le design system
et le suivi vivent dans le dépôt privé de Paktiz (`paktiz-assets`, dossier `2-Areas/clients/evidence-spa/`).

## Structure
```
src/pages/              pages Astro (accueil, spas, spas de nage, Bullfrog, accessoires, showrooms, villes, livraison,
                        SAV, conseils, FAQ, réalisations, rendez-vous, contact, légal, plan, 404, sitemap, robots, llms.txt)
src/components/         CarteProduit, FicheProduit (fiche + simulateur intégré), Simulateur (cadre), Formulaire, ListePlaces
src/data/               produits.json (généré), site.ts (réglages, showrooms, livraison, villes, formulaires), realisations.ts
src/content/conseils/   guides en Markdown (collection Astro)
src/lib/                chemins (base d'URL), produits, référencement (JSON-LD)
public/simulateur/app/  le simulateur (HTML/JS autonome), intégré en cadre avec ?integre=1&spa=<clé>
tools/                  build-donnees.py (catalogue → produits.json + visuels), build-catalogue.py, autonome.py
scripts/                check-liens, check-plan (lancés par npm run build), deployer.sh
```
Les données ont déjà la forme des futurs documents Sanity (`produit`, `réglages`, `article`, `réalisation`).

## Règles
- **Aucun secret** : seules les adresses de webhook et la clé publique Turnstile sont ici. Secrets dans les credentials n8n.
- **Aucun contenu business** (tarifs Paktiz, notes internes, sources ou noms fournisseurs) et aucun nom de modèle d'image.
- **Zéro tiret cadratin**. Français, vouvoiement, prix « hors livraison et installation ».
- Toute adresse interne passe par `url()` (la base change à la mise en ligne). `npm run build` échoue sur un lien mort
  ou une page absente du plan du site.
- Bandeau « maquette » et `noindex` tant que `PUBLIC_EN_LIGNE` n'est pas `oui` ; `robots.txt` fermé de même.
- Contrastes mesurés au rendu (`qa-contrastes-site.mjs` du dépôt privé) : 4,5 pour le texte, 3,0 au-dessus de 24 px.
- Simulateur : bumper `?v=` de `app.css` et `app.js` dans `public/simulateur/app/index.html` à chaque changement.

## Déploiement
Sources sur `main` ; `scripts/deployer.sh` construit et publie `dist/` sur la branche `dev`, servie par GitHub Pages
(https://charlusminus.github.io/evidence-spa-simulateur/). Tant que rien n'est en ligne chez le client, publication directe.
