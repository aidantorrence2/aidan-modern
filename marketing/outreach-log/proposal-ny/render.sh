#!/bin/sh
# Renders proposal.html to the DRAFT PDF (A4 landscape) and page previews. Run from this folder.
set -e
CHROME=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
"$CHROME" --no-sandbox --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw \
  --virtual-time-budget=5000 --print-to-pdf="Aidan-Torrence_New-York-editorial-proposal_DRAFT.pdf" "file://$(pwd)/proposal.html"
