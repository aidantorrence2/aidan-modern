#!/bin/bash
# Render all reel content pieces from the calendar.
#
# City reveal reels: pieces 1, 6, 11, 14, 19, 23, 28
# Direction reels:   pieces 3, 8, 22, 30
# POV reels:         pieces 5, 15, 26
#
# Hero posts (2, 7, 10, 12, 16, 18, 20, 24, 27) and
# carousels (4, 9, 13, 17, 21, 25, 29) use static images
# directly from /public/images/large/ — no rendering needed.
#
# Usage: bash render-all.sh

set -e
cd "$(dirname "$0")"

echo "=== Rendering City Reveal Reels ==="
for id in 1 6 11 14 19 23 28; do
  echo "--- Piece $id ---"
  node render-city-reveal.mjs --piece $id
done

echo ""
echo "=== Rendering Direction Reels ==="
for id in 3 8 22 30; do
  echo "--- Piece $id ---"
  node render-direction-reel.mjs --piece $id
done

echo ""
echo "=== Rendering POV Reels ==="
for id in 5 15 26; do
  echo "--- Piece $id ---"
  node render-pov-reel.mjs --piece $id
done

echo ""
echo "=== Done! ==="
echo "All reels rendered to ./reels/"
echo ""
echo "Static content (hero posts + carousels) uses images directly from:"
echo "  /public/images/large/{image-id}.jpg"
echo ""
echo "See content-calendar.ts for captions, hashtags, and geotags."
