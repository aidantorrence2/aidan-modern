#!/bin/zsh
S=/private/tmp/claude-501/-Users-aidantorrence/d85b8e28-4cd0-42d6-a9cd-9e6f183a3bc2/scratchpad/versions
i=10
for c in 1badccc f31a055 987991a 978e7b4 a7caf8e 3545bf9 4300d37; do
  i=$((i+1)); p=$((3100+i))
  (cd $S/$c && env -u CLAUDE_CODE_CHILD_SESSION npx next dev -p $p > $S/$c.log 2>&1 &)
  echo "started $c on $p"
done
wait
