#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/aidantorrence/Documents/aidan-modern"
AD_ROOT="$ROOT/marketing/manila-video-ads-v2"
WORK_DIR="$AD_ROOT/work"
VOICE_DIR="$AD_ROOT/voice"
SUB_DIR="$AD_ROOT/subtitles"
OUTPUT_DIR="$AD_ROOT/videos"

mkdir -p "$WORK_DIR" "$VOICE_DIR" "$SUB_DIR" "$OUTPUT_DIR"

if [[ -x /opt/homebrew/opt/ffmpeg-full/bin/ffmpeg ]]; then
  FFMPEG_BIN="/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg"
  FFPROBE_BIN="/opt/homebrew/opt/ffmpeg-full/bin/ffprobe"
else
  echo "ffmpeg-full is required. Install with: brew install ffmpeg-full" >&2
  exit 1
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

  local -a input_args=()
  local -a filter_parts=()
  local concat_inputs=""
  local i=0

  for seg in "${segs[@]}"; do
    IFS='|' read -r src start dur <<< "$seg"
    input_args+=( -ss "$start" -t "$dur" -i "$src" )

    filter_parts+=("[$i:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.08:saturation=1.12:brightness=0.02,unsharp=5:5:0.45,setsar=1,format=yuv420p[v$i]")
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
    -t 18 \
    -r 30 \
    -c:v libx264 \
    -preset medium \
    -crf 19 \
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
  local output_file="$6"

  "$FFMPEG_BIN" -y \
    -i "$base_video" \
    -i "$voice_wav" \
    -filter_complex "
      [0:v]drawbox=x=0:y=0:w=iw:h=210:color=black@0.32:t=fill,
      drawbox=x=0:y=1660:w=iw:h=260:color=black@0.48:t=fill,
      drawtext=font='Futura':text='$hook_text':fontcolor=white:fontsize=62:x=(w-text_w)/2:y=56:shadowcolor=black@0.8:shadowx=2:shadowy=2,
      drawtext=font='Avenir Next':text='$promise_text':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=1738:shadowcolor=black@0.8:shadowx=2:shadowy=2,
      drawtext=font='Avenir Next':text='Book now aidantorrence.com/manila':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=1802:shadowcolor=black@0.9:shadowx=2:shadowy=2,
      subtitles=filename='$subtitle_file'[vout];
      [0:a]volume=0.24,acompressor=threshold=-20dB:ratio=2.2:attack=20:release=200[bed];
      [1:a]volume=1.9,highpass=f=120,lowpass=f=7000,acompressor=threshold=-16dB:ratio=3.0:attack=10:release=150[vo];
      [bed][vo]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-14:TP=-1.5:LRA=10[aout]
    " \
    -map "[vout]" \
    -map "[aout]" \
    -t 18 \
    -r 30 \
    -c:v libx264 \
    -preset medium \
    -crf 18 \
    -c:a aac \
    -ar 48000 \
    -b:a 160k \
    "$output_file"
}

cat > "$SUB_DIR/ad01.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Manila creators, this is your visual upgrade.

2
00:00:03,000 --> 00:00:06,000
Studio or outdoor, fully directed from start to finish.

3
00:00:06,000 --> 00:00:09,000
No awkward posing. No random shots.

4
00:00:09,000 --> 00:00:12,000
Premium edits built to stop the scroll.

5
00:00:12,000 --> 00:00:15,000
Fast turnaround, ready for your socials.

6
00:00:15,000 --> 00:00:18,000
Book your Manila session now.
SRT

cat > "$SUB_DIR/ad02.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
You do not need to know how to model.

2
00:00:03,000 --> 00:00:06,000
I guide your pose, angle, and expression live.

3
00:00:06,000 --> 00:00:09,000
Every frame is coached for confidence.

4
00:00:09,000 --> 00:00:12,000
Studio precision with outdoor Manila energy.

5
00:00:12,000 --> 00:00:15,000
Results that look premium and natural.

6
00:00:15,000 --> 00:00:18,000
Claim your spot this month.
SRT

cat > "$SUB_DIR/ad03.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Two aesthetics. One powerful session.

2
00:00:03,000 --> 00:00:06,000
Start in studio for clean editorial portraits.

3
00:00:06,000 --> 00:00:09,000
Then go outdoor for cinematic street mood.

4
00:00:09,000 --> 00:00:12,000
More content from a single booking.

5
00:00:12,000 --> 00:00:15,000
Perfect for creators and personal brands.

6
00:00:15,000 --> 00:00:18,000
Reserve your Manila date today.
SRT

cat > "$SUB_DIR/ad04.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
BGC. Makati. Intramuros. Your choice.

2
00:00:03,000 --> 00:00:06,000
We match location and light to your style.

3
00:00:06,000 --> 00:00:09,000
Every setup is intentional and directed.

4
00:00:09,000 --> 00:00:12,000
So your photos look expensive and effortless.

5
00:00:12,000 --> 00:00:15,000
Built for profile upgrades and brand growth.

6
00:00:15,000 --> 00:00:18,000
Message now for open slots.
SRT

cat > "$SUB_DIR/ad05.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
If you have been waiting, this is your sign.

2
00:00:03,000 --> 00:00:06,000
I only take limited Manila sessions monthly.

3
00:00:06,000 --> 00:00:09,000
You get full direction and premium editing.

4
00:00:09,000 --> 00:00:12,000
Studio and outdoor options are available.

5
00:00:12,000 --> 00:00:15,000
Your new photos can be live this week.

6
00:00:15,000 --> 00:00:18,000
Book now before this month fills.
SRT

make_voice ad01 172 "Manila creators, this is your visual upgrade. Studio or outdoor fashion sessions with full direction, premium edits, and photos built to stop the scroll. Book your Manila session now at aidantorrence dot com slash manila."
make_voice ad02 170 "Not a model? Perfect. I guide every pose, angle, and expression in real time so you look natural and confident. This is studio precision with outdoor Manila energy. Claim your slot now at aidantorrence dot com slash manila."
make_voice ad03 170 "Two aesthetics, one powerful session. Start in studio for clean editorial portraits, then move outdoor for cinematic street mood. More content from one booking, built for creators and personal brands. Reserve your Manila date today."
make_voice ad04 170 "BGC, Makati, or Intramuros. We match your location and light to your style, then direct every frame to look intentional and premium. If you want photos that convert attention, book now at aidantorrence dot com slash manila."
make_voice ad05 168 "If you have been waiting, this is your sign. Manila slots are intentionally limited each month. You get full direction, premium retouching, and delivery fast enough to post this week. Book now before the calendar fills."

build_base "$WORK_DIR/ad01_base.mp4" \
  "$S1|1|2.0" "$S2|8|2.2" "$S3|14|2.0" "$S4|21|2.4" "$S5|29|2.0" "$S6|36|2.4" "$S1|44|2.0" "$S2|48|3.0"
build_base "$WORK_DIR/ad02_base.mp4" \
  "$S3|2|2.0" "$S4|7|2.2" "$S5|13|2.0" "$S6|19|2.4" "$S1|25|2.0" "$S2|31|2.4" "$S3|39|2.0" "$S4|45|3.0"
build_base "$WORK_DIR/ad03_base.mp4" \
  "$S5|1|2.0" "$S6|9|2.2" "$S1|15|2.0" "$S2|22|2.4" "$S3|28|2.0" "$S4|34|2.4" "$S5|41|2.0" "$S6|46|3.0"
build_base "$WORK_DIR/ad04_base.mp4" \
  "$S2|3|2.0" "$S3|10|2.2" "$S4|16|2.0" "$S5|23|2.4" "$S6|30|2.0" "$S1|35|2.4" "$S2|42|2.0" "$S3|47|3.0"
build_base "$WORK_DIR/ad05_base.mp4" \
  "$S4|2|2.0" "$S5|8|2.2" "$S6|14|2.0" "$S1|20|2.4" "$S2|27|2.0" "$S3|33|2.4" "$S4|40|2.0" "$S5|46|3.0"

finalize_ad "$WORK_DIR/ad01_base.mp4" "$VOICE_DIR/ad01.wav" "$SUB_DIR/ad01.srt" "STOP SCROLLING" "Studio + Outdoor Fashion Sessions" "$OUTPUT_DIR/ad01_stop_scrolling_upgrade.mp4"
finalize_ad "$WORK_DIR/ad02_base.mp4" "$VOICE_DIR/ad02.wav" "$SUB_DIR/ad02.srt" "NOT A MODEL" "Guided Posing from Start to Finish" "$OUTPUT_DIR/ad02_not_a_model_guided.mp4"
finalize_ad "$WORK_DIR/ad03_base.mp4" "$VOICE_DIR/ad03.wav" "$SUB_DIR/ad03.srt" "ONE SESSION TWO LOOKS" "Studio Precision + Outdoor Energy" "$OUTPUT_DIR/ad03_one_session_two_looks.mp4"
finalize_ad "$WORK_DIR/ad04_base.mp4" "$VOICE_DIR/ad04.wav" "$SUB_DIR/ad04.srt" "MANILA LOCATIONS" "BGC Makati Intramuros" "$OUTPUT_DIR/ad04_manila_locations_premium.mp4"
finalize_ad "$WORK_DIR/ad05_base.mp4" "$VOICE_DIR/ad05.wav" "$SUB_DIR/ad05.srt" "LIMITED MONTHLY SLOTS" "Book Now Before Calendar Fills" "$OUTPUT_DIR/ad05_limited_slots_urgency.mp4"

for f in "$OUTPUT_DIR"/*.mp4; do
  echo "Rendered $(basename "$f")"
  "$FFPROBE_BIN" -v error -show_entries format=duration -of default=nw=1:nk=1 "$f"
done
