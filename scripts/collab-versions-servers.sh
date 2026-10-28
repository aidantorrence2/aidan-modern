#!/bin/zsh
S=/private/tmp/claude-501/-Users-aidantorrence/d85b8e28-4cd0-42d6-a9cd-9e6f183a3bc2/scratchpad/versions
i=0
for c in fd1a6f0 38e9f67 78e2ace fb03148 3da2a5f efa0211 a4b11cc; do
  i=$((i+1)); p=$((3100+i))
  (cd $S/$c && env -u CLAUDE_CODE_CHILD_SESSION npx next dev -p $p > $S/$c.log 2>&1 &)
  echo "started $c on $p"
done
wait
