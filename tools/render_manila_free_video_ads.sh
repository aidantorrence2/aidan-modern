#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/aidantorrence/Documents/aidan-modern"
OUT_DIR="$ROOT/marketing/manila-free-ads/v4/videos"
WORK_DIR="$OUT_DIR/.work"
SUB_DIR="$WORK_DIR/subtitles"

mkdir -p "$OUT_DIR" "$WORK_DIR" "$SUB_DIR"

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

S1="/Users/aidantorrence/Downloads/reel-VEED.mp4"
S2="/Users/aidantorrence/Downloads/reel-VEED (1).mp4"
S3="/Users/aidantorrence/Downloads/reel-VEED (2).mp4"
S4="/Users/aidantorrence/Downloads/reel-VEED (3).mp4"
S5="/Users/aidantorrence/Downloads/reel-VEED (4).mp4"
S6="/Users/aidantorrence/Downloads/reel-VEED (5).mp4"

for src in "$S1" "$S2" "$S3" "$S4" "$S5" "$S6"; do
  if [[ ! -f "$src" ]]; then
    echo "Missing source video: $src" >&2
    exit 1
  fi
done

for target in "$OUT_DIR"/manila_free_*.mp4; do
  [[ -f "$target" ]] || continue
  rm -f "$target"
done

clip_by_id() {
  case "$1" in
    1) echo "$S1" ;;
    2) echo "$S2" ;;
    3) echo "$S3" ;;
    4) echo "$S4" ;;
    5) echo "$S5" ;;
    6) echo "$S6" ;;
    *)
      echo "Unknown source id: $1" >&2
      exit 1
      ;;
  esac
}

build_base() {
  local out_file="$1"
  shift
  local -a segs=("$@")
  local -a input_args
  local -a filter_parts
  local concat_inputs=""
  local i=0

  for seg in "${segs[@]}"; do
    IFS='|' read -r src_id start dur <<< "$seg"
    local src
    src="$(clip_by_id "$src_id")"

    input_args+=( -ss "$start" -t "$dur" -i "$src" )

    filter_parts+=("[$i:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.06:saturation=1.10:brightness=0.01,unsharp=5:5:0.32,setsar=1,format=yuv420p[v$i]")
    filter_parts+=("[$i:a]atrim=0:$dur,asetpts=PTS-STARTPTS,volume=0.72[a$i]")
    concat_inputs+="[v$i][a$i]"
    ((i+=1))
  done

  local joined
  joined="$(IFS=';'; echo "${filter_parts[*]}")"

  "$FFMPEG_BIN" -y \
    "${input_args[@]}" \
    -filter_complex "$joined;${concat_inputs}concat=n=$i:v=1:a=1[vout][aout]" \
    -map "[vout]" \
    -map "[aout]" \
    -r 30 \
    -c:v libx264 \
    -preset faster \
    -crf 18 \
    -pix_fmt yuv420p \
    -c:a aac \
    -b:a 160k \
    "$out_file"
}

finalize_ad() {
  local base_video="$1"
  local subtitle_file="$2"
  local hook_text="$3"
  local promise_text="$4"
  local cta_text="$5"
  local output_file="$6"

  "$FFMPEG_BIN" -y \
    -i "$base_video" \
    -filter_complex "
      [0:v]drawbox=x=0:y=0:w=iw:h=210:color=black@0.36:t=fill,
      drawbox=x=0:y=1660:w=iw:h=260:color=black@0.50:t=fill,
      drawtext=fontfile='${FONT_FILE}':text='${hook_text}':fontcolor=white:fontsize=64:x=(w-text_w)/2:y=56:shadowcolor=black@0.9:shadowx=2:shadowy=2,
      drawtext=fontfile='${FONT_FILE}':text='${promise_text}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=1734:shadowcolor=black@0.9:shadowx=2:shadowy=2,
      drawtext=fontfile='${FONT_FILE}':text='${cta_text}':fontcolor=white:fontsize=34:x=(w-text_w)/2:y=1802:shadowcolor=black@0.9:shadowx=2:shadowy=2,
      subtitles=filename='${subtitle_file}'[vout];
      [0:a]volume=0.88,acompressor=threshold=-19dB:ratio=2.0:attack=15:release=160,loudnorm=I=-14:TP=-1.5:LRA=10[aout]
    " \
    -map "[vout]" \
    -map "[aout]" \
    -t 15 \
    -r 30 \
    -c:v libx264 \
    -preset medium \
    -crf 18 \
    -pix_fmt yuv420p \
    -c:a aac \
    -ar 48000 \
    -b:a 160k \
    "$output_file"
}

cat > "$SUB_DIR/adA.srt" <<'SRT'
1
00:00:00,000 --> 00:00:02,500
Free Manila photo shoot slots are open.

2
00:00:02,500 --> 00:00:05,000
No modeling experience needed.

3
00:00:05,000 --> 00:00:07,500
I guide posing, angle, and expression.

4
00:00:07,500 --> 00:00:10,000
You get edited photos ready to post.

5
00:00:10,000 --> 00:00:12,500
Only a few free slots this round.

6
00:00:12,500 --> 00:00:15,000
Message now to claim your shoot.
SRT

cat > "$SUB_DIR/adB.srt" <<'SRT'
1
00:00:00,000 --> 00:00:02,500
Want better photos for your feed?

2
00:00:02,500 --> 00:00:05,000
This is a real free collab in Manila.

3
00:00:05,000 --> 00:00:07,500
We plan the vibe and location together.

4
00:00:07,500 --> 00:00:10,000
Shoot day is simple and fully directed.

5
00:00:10,000 --> 00:00:12,500
You receive polished edits fast.

6
00:00:12,500 --> 00:00:15,000
DM now before slots are gone.
SRT

cat > "$SUB_DIR/adC.srt" <<'SRT'
1
00:00:00,000 --> 00:00:02,500
Build your portfolio for free in Manila.

2
00:00:02,500 --> 00:00:05,000
No stress, no guessing what to do.

3
00:00:05,000 --> 00:00:07,500
I coach every pose and movement.

4
00:00:07,500 --> 00:00:10,000
Studio or outdoor vibe, your choice.

5
00:00:10,000 --> 00:00:12,500
Edited shots delivered for your socials.

6
00:00:12,500 --> 00:00:15,000
Message now to lock your free slot.
SRT

cat > "$SUB_DIR/adD.srt" <<'SRT'
1
00:00:00,000 --> 00:00:02,500
This is your sign to update your photos.

2
00:00:02,500 --> 00:00:05,000
Free Manila sessions are limited.

3
00:00:05,000 --> 00:00:07,500
I direct you from first frame to last.

4
00:00:07,500 --> 00:00:10,000
You get content ready for posting.

5
00:00:10,000 --> 00:00:12,500
The process is fast and beginner friendly.

6
00:00:12,500 --> 00:00:15,000
Send a message to reserve your date.
SRT

cat > "$SUB_DIR/adE.srt" <<'SRT'
1
00:00:00,000 --> 00:00:02,500
Free photo shoot in Manila this month.

2
00:00:02,500 --> 00:00:05,000
Real direction so you look confident.

3
00:00:05,000 --> 00:00:07,500
Great for creators and personal brands.

4
00:00:07,500 --> 00:00:10,000
You get edited photos to publish fast.

5
00:00:10,000 --> 00:00:12,500
Only a handful of free spots left.

6
00:00:12,500 --> 00:00:15,000
Message now and claim your slot.
SRT

build_base "$WORK_DIR/base_A.mp4" \
  "1|1.0|2.5" "2|8.0|2.5" "3|14.0|2.5" "4|21.0|2.5" "5|28.0|2.5" "6|35.0|2.5"
build_base "$WORK_DIR/base_B.mp4" \
  "2|2.0|2.5" "3|9.0|2.5" "4|16.0|2.5" "5|23.0|2.5" "6|30.0|2.5" "1|37.0|2.5"
build_base "$WORK_DIR/base_C.mp4" \
  "3|1.0|2.5" "4|7.0|2.5" "5|13.0|2.5" "6|19.0|2.5" "1|25.0|2.5" "2|31.0|2.5"
build_base "$WORK_DIR/base_D.mp4" \
  "4|3.0|2.5" "5|10.0|2.5" "6|17.0|2.5" "1|24.0|2.5" "2|31.0|2.5" "3|38.0|2.5"
build_base "$WORK_DIR/base_E.mp4" \
  "5|2.0|2.5" "6|8.0|2.5" "1|14.0|2.5" "2|20.0|2.5" "3|26.0|2.5" "4|32.0|2.5"

finalize_ad "$WORK_DIR/base_A.mp4" "$SUB_DIR/adA.srt" "FREE MANILA SHOOT" "No experience needed" "Message to apply now" "$OUT_DIR/manila_free_A.mp4"
finalize_ad "$WORK_DIR/base_B.mp4" "$SUB_DIR/adB.srt" "WANT PHOTOS LIKE THIS" "Limited free collab slots" "DM for your free shoot" "$OUT_DIR/manila_free_B.mp4"
finalize_ad "$WORK_DIR/base_C.mp4" "$SUB_DIR/adC.srt" "BUILD YOUR PORTFOLIO" "Free session in Manila" "Claim your slot today" "$OUT_DIR/manila_free_C.mp4"
finalize_ad "$WORK_DIR/base_D.mp4" "$SUB_DIR/adD.srt" "YOUR SIGN TO START" "Beginner friendly shoot" "Reserve by message" "$OUT_DIR/manila_free_D.mp4"
finalize_ad "$WORK_DIR/base_E.mp4" "$SUB_DIR/adE.srt" "FREE PHOTO SHOOT" "Edited photos included" "Message before slots close" "$OUT_DIR/manila_free_E.mp4"

for f in "$OUT_DIR"/manila_free_*.mp4; do
  bn="$(basename "$f")"
  duration="$("$FFPROBE_BIN" -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")"
  printf 'Rendered %s (duration: %.2fs)\n' "$bn" "$duration"
done

echo "Done. Videos saved to $OUT_DIR"
