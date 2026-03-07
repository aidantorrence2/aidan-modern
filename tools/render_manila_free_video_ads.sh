#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/aidantorrence/Documents/aidan-modern"
SRC_ROOT="$ROOT/marketing/manila-free-ads/v4"
OUT_DIR="$SRC_ROOT/videos"
WORK_DIR="$OUT_DIR/.work"

mkdir -p "$OUT_DIR" "$WORK_DIR"

if [[ -x /opt/homebrew/opt/ffmpeg-full/bin/ffmpeg ]]; then
  FFMPEG_BIN="/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg"
  FFPROBE_BIN="/opt/homebrew/opt/ffmpeg-full/bin/ffprobe"
elif command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; then
  FFMPEG_BIN="ffmpeg"
  FFPROBE_BIN="ffprobe"
else
  echo "ffmpeg is required. Install with: brew install ffmpeg-full" >&2
  exit 1
fi

FONT_FILE="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
if [[ ! -f "$FONT_FILE" ]]; then
  FONT_FILE="/System/Library/Fonts/Supplemental/Arial.ttf"
fi

SLIDE_DURATION="3.00"
TRANSITION_DURATION="0.40"

render_variant() {
  local variant="$1"
  local dir="$SRC_ROOT/$variant"
  local out_file="$OUT_DIR/manila_free_${variant}.mp4"

  if [[ ! -d "$dir" ]]; then
    echo "Skipping $variant: missing folder $dir"
    return
  fi

  local -a slides
  while IFS= read -r slide; do
    slides+=("$slide")
  done < <(find "$dir" -maxdepth 1 -type f -name "${variant}_*.png" | sort)

  local count="${#slides[@]}"
  if [[ "$count" -eq 0 ]]; then
    echo "Skipping $variant: no PNG slides found"
    return
  fi

  local -a input_args
  local filter=""

  for i in "${!slides[@]}"; do
    input_args+=( -loop 1 -t "$SLIDE_DURATION" -i "${slides[$i]}" )
    filter+="[$i:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,trim=duration=${SLIDE_DURATION},setpts=PTS-STARTPTS,format=yuv420p,setsar=1[v$i];"
  done

  local current="[v0]"
  local offset
  offset=$(awk "BEGIN {printf \"%.2f\", $SLIDE_DURATION - $TRANSITION_DURATION}")

  if [[ "$count" -gt 1 ]]; then
    for ((i = 1; i < count; i++)); do
      local next="[x$i]"
      filter+="${current}[v$i]xfade=transition=fade:duration=${TRANSITION_DURATION}:offset=${offset}${next};"
      current="$next"
      offset=$(awk "BEGIN {printf \"%.2f\", $offset + $SLIDE_DURATION - $TRANSITION_DURATION}")
    done
  fi

  filter+="${current}drawbox=x=0:y=ih-170:w=iw:h=170:color=black@0.38:t=fill,drawtext=fontfile='${FONT_FILE}':text='FREE MANILA PHOTO SHOOT - MESSAGE TO APPLY':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=h-108:shadowcolor=black@0.85:shadowx=2:shadowy=2[vout]"

  "$FFMPEG_BIN" -y \
    "${input_args[@]}" \
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
    -filter_complex "$filter" \
    -map "[vout]" \
    -map "$count:a" \
    -shortest \
    -r 30 \
    -pix_fmt yuv420p \
    -c:v libx264 \
    -preset medium \
    -crf 19 \
    -c:a aac \
    -b:a 128k \
    "$out_file"

  local duration
  duration=$("$FFPROBE_BIN" -v error -show_entries format=duration -of default=nw=1:nk=1 "$out_file")
  printf 'Rendered %s (duration: %.2fs)\n' "$(basename "$out_file")" "$duration"
}

for v in A B C D E; do
  render_variant "$v"
done

echo "Done. Videos saved to $OUT_DIR"
