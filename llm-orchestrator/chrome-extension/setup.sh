#!/bin/zsh
# Writes config.js (relay URL + token) from ~/.config/llm-orchestrator/config.json. Never commit config.js.
set -euo pipefail
cd "$(dirname "$0")"
python3 - <<'PY'
import json, os
c = json.load(open(os.path.expanduser('~/.config/llm-orchestrator/config.json')))
open('config.js', 'w').write(f"export const RELAY_URL = {json.dumps(c['relayUrl'])};\nexport const RELAY_TOKEN = {json.dumps(c['token'])};\n")
PY
chmod 600 config.js
echo "config.js written; load this folder in chrome://extensions (Developer mode → Load unpacked)"
