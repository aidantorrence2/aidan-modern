#!/usr/bin/env bash
#
# deploy.sh — the ONLY supported way to ship aidan-modern to production.
#
# Why this exists: www.aidantorrence.com is served by the Vercel project
# `aidan-vercel/aidan-modern-at9e`. A git push builds a production deployment
# there, but historically that deployment reached "Ready" WITHOUT taking the
# domain alias — so the live site silently stayed on an old build for days.
# (There is also a stray duplicate project `aidan-vercel/aidan-modern` that
# rebuilds on push but serves nothing — ignore it.)
#
# This script makes promotion + live verification an inseparable part of
# deploying, so a deploy can never silently leave the site stale again.
# It ships ONLY committed git HEAD (never the dirty working tree, which on
# this repo contains ~9GB of marketing assets + tracked deletions that
# `vercel --prod` would upload as production 404s).
#
# Usage:  scripts/deploy.sh
set -euo pipefail

TEAM="team_Nk9LiyT60gQEZ07vpJ1c3GaJ"
PROJECT="prj_IprqbRdPN7RV4OpOzzAYPhGHTvAr"   # aidan-modern-at9e
SCOPE="aidan-vercel"
DOMAIN="www.aidantorrence.com"
AUTH="$HOME/Library/Application Support/com.vercel.cli/auth.json"

cd "$(dirname "$0")/.."

# --- guards ---------------------------------------------------------------
branch=$(git branch --show-current)
[ "$branch" = "main" ] || { echo "✗ Not on main (on '$branch'). Aborting."; exit 1; }
grep -q "aidan-modern-at9e" .vercel/project.json \
  || { echo "✗ .vercel/project.json is NOT linked to aidan-modern-at9e. Run: vercel link --project aidan-modern-at9e --scope $SCOPE --yes"; exit 1; }
[ -f "$AUTH" ] || { echo "✗ Vercel CLI not authenticated ($AUTH missing). Run: vercel login"; exit 1; }
TOKEN=$(python3 -c "import json;print(json.load(open('$AUTH'))['token'])")

# --- build sanity (catches the missing-env / type errors early) ----------
echo "▶ Building locally to catch errors before pushing…"
npx next build >/tmp/aidan-modern_deploy_build.log 2>&1 \
  || { echo "✗ Local build failed — see /tmp/aidan-modern_deploy_build.log"; tail -20 /tmp/aidan-modern_deploy_build.log; exit 1; }
echo "  ✓ build ok"

# --- push committed HEAD --------------------------------------------------
echo "▶ Pushing committed HEAD to origin/main (working-tree changes are NOT shipped)…"
git push origin main
SHA=$(git rev-parse HEAD)
echo "  ✓ deploying commit $SHA"

api() { curl -s -H "Authorization: Bearer $TOKEN" "$@"; }

# --- wait for the production build of THIS commit to reach Ready ----------
echo "▶ Waiting for at9e to build $SHA …"
URL=""
for i in $(seq 1 90); do
  resp=$(api "https://api.vercel.com/v6/deployments?projectId=$PROJECT&teamId=$TEAM&limit=20&target=production")
  read -r state durl < <(printf '%s' "$resp" | SHA="$SHA" python3 -c '
import sys,json,os
sha=os.environ["SHA"]
ds=json.load(sys.stdin).get("deployments",[])
m=[d for d in ds if (d.get("meta") or {}).get("githubCommitSha")==sha]
print((m[0].get("state") if m else "NONE"), (m[0].get("url") if m else "-"))')
  echo "  [$((i*10))s] state=$state"
  case "$state" in
    READY) URL="$durl"; break;;
    ERROR|CANCELED) echo "✗ Build $state for $SHA. Check the Vercel dashboard."; exit 1;;
  esac
  sleep 10
done
[ -n "$URL" ] || { echo "✗ Timed out waiting for a Ready production build of $SHA."; exit 1; }
echo "  ✓ build Ready: https://$URL"

# --- promote it onto the live domain --------------------------------------
echo "▶ Promoting https://$URL to the production domain…"
vercel promote "https://$URL" --scope "$SCOPE" --yes

# --- verify the live domain actually moved --------------------------------
echo "▶ Verifying $DOMAIN now resolves to the new deployment…"
sleep 4
target=$(vercel inspect "https://$DOMAIN" --scope "$SCOPE" 2>&1 | grep -m1 -E '^\s+url' | awk '{print $NF}')
echo "  $DOMAIN -> $target"
if echo "$target" | grep -q "$URL"; then
  echo "✓ DEPLOY COMPLETE — $DOMAIN is live on $SHA"
else
  echo "✗ Alias mismatch: domain still points to $target (expected $URL)."
  echo "  Re-run, or promote manually: vercel promote https://$URL --scope $SCOPE --yes"
  exit 1
fi
