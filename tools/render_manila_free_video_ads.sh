#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/aidantorrence/Documents/aidan-modern"
OUT_DIR="$ROOT/marketing/manila-free-ads/v4/videos"
WORK_DIR="$OUT_DIR/.work"
BASE_DIR="$WORK_DIR/base"
VOICE_DIR="$WORK_DIR/voice"
SUB_DIR="$WORK_DIR/subtitles"

mkdir -p "$OUT_DIR" "$WORK_DIR" "$BASE_DIR" "$VOICE_DIR" "$SUB_DIR"

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
AD_LENGTH="18"

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

make_voice() {
  local voice_id="$1"
  local speech_rate="$2"
  local text="$3"

  say -v Samantha -r "$speech_rate" -o "$VOICE_DIR/${voice_id}.aiff" -- "$text"
  "$FFMPEG_BIN" -y -v error -i "$VOICE_DIR/${voice_id}.aiff" -ar 48000 -ac 2 "$VOICE_DIR/${voice_id}.wav"
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

    filter_parts+=("[$i:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.08:saturation=1.13:brightness=0.02,unsharp=5:5:0.35,setsar=1,format=yuv420p[v$i]")
    filter_parts+=("[$i:a]atrim=0:$dur,asetpts=PTS-STARTPTS,volume=0.68[a$i]")
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
    -t "$AD_LENGTH" \
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
  local voice_wav="$2"
  local subtitle_file="$3"
  local hook_text="$4"
  local promise_text="$5"
  local cta_text="$6"
  local output_file="$7"

  "$FFMPEG_BIN" -y \
    -i "$base_video" \
    -i "$voice_wav" \
    -filter_complex "
      [0:v]drawbox=x=0:y=0:w=iw:h=214:color=black@0.34:t=fill,
      drawbox=x=0:y=1635:w=iw:h=285:color=black@0.56:t=fill,
      drawtext=fontfile='${FONT_FILE}':text='${hook_text}':fontcolor=white:fontsize=62:x=(w-text_w)/2:y=52:shadowcolor=black@0.92:shadowx=2:shadowy=2,
      drawtext=fontfile='${FONT_FILE}':text='${promise_text}':fontcolor=white:fontsize=39:x=(w-text_w)/2:y=1712:shadowcolor=black@0.9:shadowx=2:shadowy=2,
      drawtext=fontfile='${FONT_FILE}':text='${cta_text}':fontcolor=white:fontsize=33:x=(w-text_w)/2:y=1788:shadowcolor=black@0.92:shadowx=2:shadowy=2,
      subtitles=filename='${subtitle_file}'[vout];
      [0:a]volume=0.31,acompressor=threshold=-22dB:ratio=2.5:attack=20:release=200[bed];
      [1:a]volume=1.95,highpass=f=120,lowpass=f=7600,acompressor=threshold=-17dB:ratio=3.0:attack=10:release=120[vo];
      [bed][vo]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-14:TP=-1.5:LRA=8[aout]
    " \
    -map "[vout]" \
    -map "[aout]" \
    -t "$AD_LENGTH" \
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
00:00:00,000 --> 00:00:03,000
Manila creators this is a free photo shoot collab.

2
00:00:03,000 --> 00:00:06,000
No experience needed and no awkward guessing.

3
00:00:06,000 --> 00:00:09,000
I direct your pose angle and expression live.

4
00:00:09,000 --> 00:00:12,000
You get edited photos ready for Instagram.

5
00:00:12,000 --> 00:00:15,000
Free slots are limited this month in Manila.

6
00:00:15,000 --> 00:00:18,000
Apply now at aidantorrence dot com slash manila free.
SRT

cat > "$SUB_DIR/adB.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Are you a first time model in Manila.

2
00:00:03,000 --> 00:00:06,000
This free shoot is built for beginners.

3
00:00:06,000 --> 00:00:09,000
I give clear direction from first frame to last.

4
00:00:09,000 --> 00:00:12,000
You walk away with polished content fast.

5
00:00:12,000 --> 00:00:15,000
This is a limited free offer in Manila.

6
00:00:15,000 --> 00:00:18,000
Send your application now.
SRT

cat > "$SUB_DIR/adC.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Need content for your portfolio and socials.

2
00:00:03,000 --> 00:00:06,000
Book this free Manila shoot while slots are open.

3
00:00:06,000 --> 00:00:09,000
You get full direction and easy coaching.

4
00:00:09,000 --> 00:00:12,000
We build looks that match your personal brand.

5
00:00:12,000 --> 00:00:15,000
Edited finals are ready to post quickly.

6
00:00:15,000 --> 00:00:18,000
Apply now before this batch closes.
SRT

cat > "$SUB_DIR/adD.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
This month I opened a few free shoots in Manila.

2
00:00:03,000 --> 00:00:06,000
If your photos feel outdated this is your move.

3
00:00:06,000 --> 00:00:09,000
I plan the look and direct everything on shoot day.

4
00:00:09,000 --> 00:00:12,000
You get edited photos built to stop the scroll.

5
00:00:12,000 --> 00:00:15,000
Only limited free slots are available.

6
00:00:15,000 --> 00:00:18,000
Apply now to reserve your date.
SRT

cat > "$SUB_DIR/adE.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
If you want better photos do not wait.

2
00:00:03,000 --> 00:00:06,000
This is a free Manila photo shoot application.

3
00:00:06,000 --> 00:00:09,000
I direct poses lighting and styling with you.

4
00:00:09,000 --> 00:00:12,000
You get edited images ready to publish.

5
00:00:12,000 --> 00:00:15,000
Slots are limited and close fast.

6
00:00:15,000 --> 00:00:18,000
Apply now at aidantorrence dot com slash manila free.
SRT

make_voice adA 173 "Manila creators, this is a free photo shoot collab with pro direction. Even if you are new, I guide every pose and angle. You get edited photos ready for Instagram. I only open a few free slots each month. Apply now at aidantorrence dot com slash manila free."
make_voice adB 172 "If you are a first time model in Manila, this is for you. Free shoot, clear direction, and no awkward posing. We build content you can post right away. The free offer has limited slots. Send your application now."
make_voice adC 170 "Need better portfolio content in Manila. This free shoot gives you full creative direction and polished edits. We build looks that match your personal brand. If you want in, apply now before this batch closes."
make_voice adD 170 "This month I opened limited free shoots in Manila. If your photos feel outdated, this is your chance. I plan the look, direct the session, and deliver edited images fast. Apply now to reserve your date."
make_voice adE 171 "If you want better photos, do not wait. This is a free Manila photo shoot application. I direct the poses, lighting, and styling with you. You get edited images ready to publish. Apply now at aidantorrence dot com slash manila free."

build_base "$BASE_DIR/base_A.mp4" \
  "1|0.8|2.25" "2|6.6|2.25" "3|12.4|2.25" "4|18.2|2.25" "5|24.0|2.25" "6|29.8|2.25" "1|35.6|2.25" "2|41.4|2.25"
build_base "$BASE_DIR/base_B.mp4" \
  "2|1.0|2.25" "3|6.8|2.25" "4|12.6|2.25" "5|18.4|2.25" "6|24.2|2.25" "1|30.0|2.25" "2|35.8|2.25" "3|41.6|2.25"
build_base "$BASE_DIR/base_C.mp4" \
  "3|1.2|2.25" "4|7.0|2.25" "5|12.8|2.25" "6|18.6|2.25" "1|24.4|2.25" "2|30.2|2.25" "3|36.0|2.25" "4|41.8|2.25"
build_base "$BASE_DIR/base_D.mp4" \
  "4|1.4|2.25" "5|7.2|2.25" "6|13.0|2.25" "1|18.8|2.25" "2|24.6|2.25" "3|30.4|2.25" "4|36.2|2.25" "5|42.0|2.25"
build_base "$BASE_DIR/base_E.mp4" \
  "5|1.6|2.25" "6|7.4|2.25" "1|13.2|2.25" "2|19.0|2.25" "3|24.8|2.25" "4|30.6|2.25" "5|36.4|2.25" "6|42.2|2.25"

finalize_ad "$BASE_DIR/base_A.mp4" "$VOICE_DIR/adA.wav" "$SUB_DIR/adA.srt" "MANILA FREE SHOOT" "PRO DIRECTION NO EXPERIENCE NEEDED" "APPLY NOW AIDANTORRENCE DOT COM MANILA FREE" "$OUT_DIR/manila_free_A.mp4"
finalize_ad "$BASE_DIR/base_B.mp4" "$VOICE_DIR/adB.wav" "$SUB_DIR/adB.srt" "FIRST TIME MODEL" "BEGINNER FRIENDLY FREE COLLAB" "SEND APPLICATION NOW" "$OUT_DIR/manila_free_B.mp4"
finalize_ad "$BASE_DIR/base_C.mp4" "$VOICE_DIR/adC.wav" "$SUB_DIR/adC.srt" "PORTFOLIO UPGRADE" "FREE MANILA SHOOT FOR CREATORS" "LIMITED BATCH APPLY NOW" "$OUT_DIR/manila_free_C.mp4"
finalize_ad "$BASE_DIR/base_D.mp4" "$VOICE_DIR/adD.wav" "$SUB_DIR/adD.srt" "LIMITED FREE SLOTS" "FULLY DIRECTED PHOTO SESSION" "RESERVE YOUR DATE TODAY" "$OUT_DIR/manila_free_D.mp4"
finalize_ad "$BASE_DIR/base_E.mp4" "$VOICE_DIR/adE.wav" "$SUB_DIR/adE.srt" "DO NOT WAIT" "FREE SHOOT APPLICATION OPEN" "APPLY NOW BEFORE CLOSING" "$OUT_DIR/manila_free_E.mp4"

for f in "$OUT_DIR"/manila_free_*.mp4; do
  bn="$(basename "$f")"
  duration="$("$FFPROBE_BIN" -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")"
  printf 'Rendered %s (duration: %.2fs)\n' "$bn" "$duration"
done

echo "Done. Videos saved to $OUT_DIR"
