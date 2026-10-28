#!/bin/zsh
# Dev servers for data/collab-versions.html. Picker-era commits on :3101-3107 (fronted by the
# auto-advancing proxy on :3201-3207, scripts/collab-versions-proxy.mjs), form-era on :3111-3117.
# Worktrees live in the session scratchpad; recreate with `git worktree add --detach <dir> <sha>`
# + sparse-checkout if they are gone.
S=/private/tmp/claude-501/-Users-aidantorrence/d85b8e28-4cd0-42d6-a9cd-9e6f183a3bc2/scratchpad/versions
i=0
for c in fd1a6f0 38e9f67 78e2ace fb03148 3da2a5f efa0211 a4b11cc; do
  i=$((i+1)); (cd $S/$c && env -u CLAUDE_CODE_CHILD_SESSION npx next dev -p $((3100+i)) > $S/$c.log 2>&1 &); echo "started $c on $((3100+i))"
done
i=10
for c in 1badccc f31a055 987991a 978e7b4 a7caf8e 3545bf9 4300d37; do
  i=$((i+1)); (cd $S/$c && env -u CLAUDE_CODE_CHILD_SESSION npx next dev -p $((3100+i)) > $S/$c.log 2>&1 &); echo "started $c on $((3100+i))"
done
(cd $S && node "$(dirname "$0")/collab-versions-proxy.mjs" > $S/proxy.log 2>&1 &); echo "proxy :3201-3207"
wait

# v15: main checkout, /sign-up-collab-v7b
(cd /Users/aidantorrence/Documents/aidan-modern && npx next dev -p 3118 > /dev/null 2>&1 &); echo "started main on 3118"
