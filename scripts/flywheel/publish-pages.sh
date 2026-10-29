#!/usr/bin/env bash
# Export the offer pages and publish them to the gh-pages branch (GitHub Pages).
set -euo pipefail
cd "$(dirname "$0")/../.."
node scripts/flywheel/export-static.mjs
# post cards removed 18 Oct 2026: nothing is posted to social accounts, so no cards are rendered
WT="$(mktemp -d)"
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git fetch -q origin gh-pages
  git worktree add -q "$WT" -B gh-pages origin/gh-pages
else
  git worktree add -q --detach "$WT"
  (cd "$WT" && git checkout -q --orphan gh-pages && git rm -rfq . >/dev/null 2>&1 || true)
fi
(cd "$WT" && find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +) && cp -a static-offers/. "$WT"/
cd "$WT"
# Fail closed if an exporter change would re-enable Vercel for static output.
node - <<'NODE'
const fs = require('node:fs')
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
if (config.git?.deploymentEnabled?.['gh-pages'] !== false) {
  throw new Error('Refusing to publish: gh-pages must be excluded from Vercel deployments')
}
NODE
git add -A
if git commit -q -m "Publish offer pages $(date -u +%Y-%m-%dT%H:%MZ)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BE2vZDoxcNhjCqKZNiesJS"; then
  git push -q -u origin gh-pages
  echo "published to gh-pages"
else
  echo "gh-pages unchanged"
fi
cd - >/dev/null
git worktree remove --force "$WT"
