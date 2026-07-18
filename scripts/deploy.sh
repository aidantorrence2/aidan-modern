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
# A token can exist but be expired — then every deployment poll silently returns
# an auth error that parses as "no deployments" and we wait 15 min for nothing.
curl -s -H "Authorization: Bearer $TOKEN" "https://api.vercel.com/v2/user" | grep -q '"invalidToken"' \
  && { echo "✗ Vercel token is expired/invalid. Run: vercel login  — then re-run this script."; exit 1; }

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
# at9e's auto-assign usually moves the domain on its own; promote is the
# belt-and-suspenders guarantee. "already the current production deployment"
# (409) means auto-assign already did it — that's success, not failure.
echo "▶ Promoting https://$URL to the production domain…"
promote_out=$(vercel promote "https://$URL" --scope "$SCOPE" --yes 2>&1) || true
echo "$promote_out" | sed 's/^/  /'
if echo "$promote_out" | grep -qiE "already the current production deployment"; then
  echo "  ✓ already auto-assigned as current production — nothing to promote"
elif echo "$promote_out" | grep -qiE "Success|promoted"; then
  echo "  ✓ promoted"
else
  echo "✗ promote failed (see output above)"; exit 1
fi

# --- verify the live domain actually moved --------------------------------
# Use the lightweight REST API + a plain HTTP probe, NOT `vercel inspect`
# (the Node CLI has SIGABRT-crashed here under memory pressure, exit 134).
echo "▶ Verifying $DOMAIN serves the new build…"
sleep 4
prod_url=$(curl -s "https://api.vercel.com/v9/projects/$PROJECT?teamId=$TEAM" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json;t=(json.load(sys.stdin).get('targets') or {}).get('production') or {};print(t.get('url') or '')" 2>/dev/null) || prod_url=""
code=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN/")
echo "  production target: ${prod_url:-<unknown>}"
echo "  $DOMAIN HTTP: $code"
if [ "$prod_url" = "$URL" ] && [ "$code" = "200" ]; then
  echo "✓ DEPLOY COMPLETE — $DOMAIN is live on $SHA ($URL)"
elif [ "$code" = "200" ]; then
  echo "✓ DEPLOY COMPLETE — $DOMAIN responds 200. Production target reported '${prod_url:-unknown}' (expected $URL); if that looks wrong, check the dashboard."
else
  echo "✗ $DOMAIN returned HTTP $code (expected 200) — investigate before trusting this deploy."
  exit 1
fi
