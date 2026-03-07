#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/aidantorrence/Documents/aidan-modern"
OUT_DIR="$ROOT/marketing/manila-free-ads/v5/videos"
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

SRC1="/Users/aidantorrence/Downloads/Copy of Copy of Copy of Copy of Copy of best ph (1080 x 1080 px) (Mobile Video).mp4"
SRC2="/Users/aidantorrence/Downloads/Copy of Copy of IMG_1430-VEED (1).mp4"
SRC3="/Users/aidantorrence/Downloads/Copy of Copy of IMG_1430-VEED (2).mp4"
SRC4="/Users/aidantorrence/Downloads/Copy of Copy of IMG_1430-VEED (3).mp4"
SRC5="/Users/aidantorrence/Downloads/Copy of Copy of IMG_1430-VEED (4).mp4"
SRC6="/Users/aidantorrence/Downloads/Copy of Copy of Copy of Copy of Copy of Copy of best ph (1080 x 1080 px).mp4"

AD_LENGTH="18"

for src in "$SRC1" "$SRC2" "$SRC3" "$SRC4" "$SRC5" "$SRC6"; do
  if [[ ! -f "$src" ]]; then
    echo "Missing source video: $src" >&2
    exit 1
  fi
done

clip_by_id() {
  case "$1" in
    1) echo "$SRC1" ;;
    2) echo "$SRC2" ;;
    3) echo "$SRC3" ;;
    4) echo "$SRC4" ;;
    5) echo "$SRC5" ;;
    6) echo "$SRC6" ;;
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

    filter_parts+=("[$i:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=luma_radius=24:luma_power=1:chroma_radius=12:chroma_power=1[bg$i]")
    filter_parts+=("[$i:v]fps=30,scale=1080:1920:force_original_aspect_ratio=decrease[fg$i]")
    filter_parts+=("[bg$i][fg$i]overlay=(W-w)/2:(H-h)/2,eq=contrast=1.08:saturation=1.16:brightness=0.01,unsharp=5:5:0.36,setsar=1,format=yuv420p[v$i]")
    filter_parts+=("[$i:a]atrim=0:$dur,asetpts=PTS-STARTPTS,volume=0.52[a$i]")
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
  local offer_text="$5"
  local cta_text="$6"
  local output_file="$7"

  "$FFMPEG_BIN" -y \
    -i "$base_video" \
    -i "$voice_wav" \
    -filter_complex "
      [0:v]drawbox=x=0:y=0:w=iw:h=205:color=black@0.34:t=fill,
      drawbox=x=0:y=1600:w=iw:h=320:color=black@0.6:t=fill,
      drawbox=x=64:y=1666:w=952:h=92:color=0xFFC233@0.26:t=fill,
      drawtext=fontfile='${FONT_FILE}':text='${hook_text}':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=48:shadowcolor=black@0.9:shadowx=2:shadowy=2,
      drawtext=fontfile='${FONT_FILE}':text='${offer_text}':fontcolor=white:fontsize=35:x=(w-text_w)/2:y=1688:shadowcolor=black@0.9:shadowx=2:shadowy=2,
      drawtext=fontfile='${FONT_FILE}':text='${cta_text}':fontcolor=white:fontsize=32:x=(w-text_w)/2:y=1798:shadowcolor=black@0.95:shadowx=2:shadowy=2,
      subtitles=filename='${subtitle_file}'[vout];
      [0:a]volume=0.26,acompressor=threshold=-22dB:ratio=2.4:attack=20:release=220[bed];
      [1:a]volume=2.0,highpass=f=120,lowpass=f=7600,acompressor=threshold=-17dB:ratio=3.2:attack=10:release=130[vo];
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

cat > "$SUB_DIR/new01.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Manila new faces this is open now.

2
00:00:03,000 --> 00:00:06,000
Free photo shoot application for this month.

3
00:00:06,000 --> 00:00:09,000
No experience required I direct everything.

4
00:00:09,000 --> 00:00:12,000
You get edited photos ready for social posting.

5
00:00:12,000 --> 00:00:15,000
Only limited slots are available in Manila.

6
00:00:15,000 --> 00:00:18,000
Apply now at aidantorrence dot com slash manila free.
SRT

cat > "$SUB_DIR/new02.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Creators if your content feels stale watch this.

2
00:00:03,000 --> 00:00:06,000
This is a free Manila collab shoot.

3
00:00:06,000 --> 00:00:09,000
I coach pose, movement, and camera presence.

4
00:00:09,000 --> 00:00:12,000
We plan looks that match your personal brand.

5
00:00:12,000 --> 00:00:15,000
You get polished edited images fast.

6
00:00:15,000 --> 00:00:18,000
Apply now before this batch closes.
SRT

cat > "$SUB_DIR/new03.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
First shoot nerves are normal.

2
00:00:03,000 --> 00:00:06,000
That is why this free session is fully directed.

3
00:00:06,000 --> 00:00:09,000
You do not need to know how to pose.

4
00:00:09,000 --> 00:00:12,000
I guide every frame from start to finish.

5
00:00:12,000 --> 00:00:15,000
Limited Manila slots are still open right now.

6
00:00:15,000 --> 00:00:18,000
Apply today and claim your date.
SRT

cat > "$SUB_DIR/new04.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Need a stronger model portfolio in Manila.

2
00:00:03,000 --> 00:00:06,000
I am taking a few free collab applications.

3
00:00:06,000 --> 00:00:09,000
You get direction, styling input, and clear coaching.

4
00:00:09,000 --> 00:00:12,000
Final edits are ready for casting and social.

5
00:00:12,000 --> 00:00:15,000
Free slots are limited this cycle.

6
00:00:15,000 --> 00:00:18,000
Apply now before the queue fills.
SRT

cat > "$SUB_DIR/new05.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Last call for this month free Manila shoots.

2
00:00:03,000 --> 00:00:06,000
If you want better photos now is the time.

3
00:00:06,000 --> 00:00:09,000
I direct the session and keep it beginner friendly.

4
00:00:09,000 --> 00:00:12,000
You get edited images built to convert attention.

5
00:00:12,000 --> 00:00:15,000
Only a few free dates remain.

6
00:00:15,000 --> 00:00:18,000
Apply at aidantorrence dot com slash manila free.
SRT

make_voice new01 171 "Manila new faces, this is open now. I am taking applications for a free photo shoot this month. No experience required, I direct everything. You get edited photos ready for social posting. Slots are limited. Apply now at aidantorrence dot com slash manila free."
make_voice new02 170 "Creators, if your content feels stale, this is for you. Free Manila collab shoot with full coaching. I direct pose, movement, and camera presence, then deliver polished edits fast. This batch is limited. Apply now before it closes."
make_voice new03 170 "If this is your first shoot, do not stress. This free Manila session is fully directed and beginner friendly. You do not need to know how to pose. I guide every frame. Limited slots are still open. Apply today and claim your date."
make_voice new04 171 "Need a stronger model portfolio in Manila. I am taking a few free collab applications now. You get direction, styling input, and polished edits for casting and social. Free slots are limited this cycle. Apply now before the queue fills."
make_voice new05 170 "Last call for this month free Manila shoots. If you want better photos, now is the time. I direct the full session and keep it simple for beginners. You get edited images built to convert attention. Apply now at aidantorrence dot com slash manila free."

build_base "$BASE_DIR/new01.mp4" \
  "1|2.0|2.25" "2|7.0|2.25" "3|12.0|2.25" "4|17.0|2.25" "5|22.0|2.25" "6|27.0|2.25" "1|33.0|2.25" "2|38.0|2.25"
build_base "$BASE_DIR/new02.mp4" \
  "2|3.0|2.25" "3|8.0|2.25" "4|13.0|2.25" "5|18.0|2.25" "6|23.0|2.25" "1|29.0|2.25" "2|34.0|2.25" "3|39.0|2.25"
build_base "$BASE_DIR/new03.mp4" \
  "3|4.0|2.25" "4|9.0|2.25" "5|14.0|2.25" "6|19.0|2.25" "1|25.0|2.25" "2|30.0|2.25" "3|35.0|2.25" "4|40.0|2.25"
build_base "$BASE_DIR/new04.mp4" \
  "4|5.0|2.25" "5|10.0|2.25" "6|15.0|2.25" "1|21.0|2.25" "2|26.0|2.25" "3|31.0|2.25" "4|36.0|2.25" "5|41.0|2.25"
build_base "$BASE_DIR/new05.mp4" \
  "5|6.0|2.25" "6|11.0|2.25" "1|16.0|2.25" "2|22.0|2.25" "3|27.0|2.25" "4|32.0|2.25" "5|37.0|2.25" "6|42.0|2.25"

finalize_ad "$BASE_DIR/new01.mp4" "$VOICE_DIR/new01.wav" "$SUB_DIR/new01.srt" "MANILA NEW FACE CALL" "FREE SHOOT APPLICATION OPEN" "APPLY NOW AIDANTORRENCE DOT COM MANILA FREE" "$OUT_DIR/manila_free_new_01.mp4"
finalize_ad "$BASE_DIR/new02.mp4" "$VOICE_DIR/new02.wav" "$SUB_DIR/new02.srt" "CREATOR CONTENT BOOST" "FREE COLLAB WITH DIRECTION" "LIMITED BATCH APPLY NOW" "$OUT_DIR/manila_free_new_02.mp4"
finalize_ad "$BASE_DIR/new03.mp4" "$VOICE_DIR/new03.wav" "$SUB_DIR/new03.srt" "FIRST SHOOT FRIENDLY" "NO EXPERIENCE NEEDED" "CLAIM YOUR FREE DATE" "$OUT_DIR/manila_free_new_03.mp4"
finalize_ad "$BASE_DIR/new04.mp4" "$VOICE_DIR/new04.wav" "$SUB_DIR/new04.srt" "PORTFOLIO UPGRADE" "FREE MANILA MODEL COLLAB" "APPLY BEFORE QUEUE FILLS" "$OUT_DIR/manila_free_new_04.mp4"
finalize_ad "$BASE_DIR/new05.mp4" "$VOICE_DIR/new05.wav" "$SUB_DIR/new05.srt" "LAST CALL THIS MONTH" "FREE SLOTS ALMOST GONE" "APPLY NOW BEFORE CLOSING" "$OUT_DIR/manila_free_new_05.mp4"

for f in "$OUT_DIR"/manila_free_new_*.mp4; do
  bn="$(basename "$f")"
  duration="$("$FFPROBE_BIN" -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")"
  printf 'Rendered %s (duration: %.2fs)\n' "$bn" "$duration"
done

echo "Done. New videos saved to $OUT_DIR"
