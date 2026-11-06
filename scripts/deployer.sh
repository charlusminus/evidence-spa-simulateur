#!/usr/bin/env bash
# Construit le site et publie dist/ sur la branche dev (servie par GitHub Pages). Sources : branche main.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
COMMIT=$(git rev-parse --short HEAD)
DEV=../es-dev
[ -d "$DEV" ] || git worktree add -f "$DEV" dev
cd "$DEV"
git fetch -q origin dev && git reset -q --hard origin/dev
git rm -rq --ignore-unmatch . >/dev/null
cp -a ../evidence-spa-simulateur/dist/. .
touch .nojekyll
git add -A
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "Site construit depuis main@$COMMIT" -m "Claude-Session: https://claude.ai/code/session_01Hi66YcDWLw8c5TK16TaPmD" || { echo "rien à publier"; exit 0; }
git push -q origin dev
echo "publié : main@$COMMIT"
