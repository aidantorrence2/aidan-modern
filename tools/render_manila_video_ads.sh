#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/aidantorrence/Documents/aidan-modern"
IMAGE_DIR="$ROOT/public/images/large"
AD_ROOT="$ROOT/marketing/manila-video-ads"
WORK_DIR="$AD_ROOT/work"
OUTPUT_DIR="$AD_ROOT/videos"
SUB_DIR="$AD_ROOT/subtitles"
if [[ -x /opt/homebrew/opt/ffmpeg-full/bin/ffmpeg ]]; then
  FFMPEG_BIN="/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg"
else
  FFMPEG_BIN="$(command -v ffmpeg || true)"
fi

mkdir -p "$WORK_DIR" "$OUTPUT_DIR" "$SUB_DIR"

if [[ -z "$FFMPEG_BIN" ]]; then
  echo "ffmpeg is required. Install with: brew install ffmpeg-full" >&2
  exit 1
fi

make_base_video() {
  local base_out="$1"
  shift
  local -a image_ids=("$@")
  local -a input_args=()
  local -a filter_parts=()
  local concat_inputs=""

  local i
  for i in "${!image_ids[@]}"; do
    local image_path="$IMAGE_DIR/${image_ids[$i]}.jpg"
    input_args+=( -loop 1 -t 3 -i "$image_path" )
    filter_parts+=("[$i:v]fps=30,scale=1180:2100:force_original_aspect_ratio=increase,crop=1080:1920:x='(in_w-out_w)/2+40*sin(t*0.8)':y='(in_h-out_h)/2+30*cos(t*0.9)',setsar=1,trim=duration=3,setpts=PTS-STARTPTS,format=yuv420p[v$i]")
    concat_inputs+="[v$i]"
  done

  local joined_filters
  joined_filters="$(IFS=';'; echo "${filter_parts[*]}")"
  local filter_complex="$joined_filters;${concat_inputs}concat=n=${#image_ids[@]}:v=1:a=0[v]"

  "$FFMPEG_BIN" -y \
    "${input_args[@]}" \
    -filter_complex "$filter_complex" \
    -map "[v]" \
    -r 30 \
    -pix_fmt yuv420p \
    "$base_out"
}

finalize_ad() {
  local base_video="$1"
  local subtitle_file="$2"
  local hook_text="$3"
  local output_file="$4"

  "$FFMPEG_BIN" -y \
    -i "$base_video" \
    -f lavfi -t 18 -i anullsrc=channel_layout=stereo:sample_rate=48000 \
    -vf "drawbox=x=0:y=0:w=iw:h=180:color=black@0.35:t=fill,drawbox=x=0:y=1690:w=iw:h=230:color=black@0.45:t=fill,drawtext=font='Arial Bold':text='$hook_text':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=58:shadowcolor=black@0.8:shadowx=3:shadowy=3,drawtext=font='Arial Bold':text='Book now  aidantorrence.com/manila':fontcolor=white:fontsize=44:x=(w-text_w)/2:y=1775:shadowcolor=black@0.85:shadowx=2:shadowy=2,subtitles=$subtitle_file" \
    -map 0:v:0 \
    -map 1:a:0 \
    -c:v libx264 \
    -preset medium \
    -crf 18 \
    -c:a aac \
    -b:a 128k \
    -ar 48000 \
    -shortest \
    "$output_file"
}

cat > "$SUB_DIR/ad01.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Manila creators this is for you.

2
00:00:03,000 --> 00:00:06,000
Studio and outdoor sessions with full direction.

3
00:00:06,000 --> 00:00:09,000
No awkward posing. No guesswork.

4
00:00:09,000 --> 00:00:12,000
Editorial color and premium retouching.

5
00:00:12,000 --> 00:00:15,000
Finals delivered in 7 days.

6
00:00:15,000 --> 00:00:18,000
Limited monthly slots in Manila.
SRT

cat > "$SUB_DIR/ad02.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Not a model? Perfect.

2
00:00:03,000 --> 00:00:06,000
Every pose is guided live.

3
00:00:06,000 --> 00:00:09,000
Natural confidence on camera.

4
00:00:09,000 --> 00:00:12,000
Studio quality plus outdoor energy.

5
00:00:12,000 --> 00:00:15,000
Your photos should open doors.

6
00:00:15,000 --> 00:00:18,000
Book your Manila session now.
SRT

cat > "$SUB_DIR/ad03.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Why choose one look?

2
00:00:03,000 --> 00:00:06,000
Start in studio for clean editorial frames.

3
00:00:06,000 --> 00:00:09,000
Then go outdoor for Manila street mood.

4
00:00:09,000 --> 00:00:12,000
One session. Multiple campaign-ready sets.

5
00:00:12,000 --> 00:00:15,000
Built for Instagram and personal brands.

6
00:00:15,000 --> 00:00:18,000
Reserve your date before slots close.
SRT

cat > "$SUB_DIR/ad04.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
BGC. Makati. Intramuros.

2
00:00:03,000 --> 00:00:06,000
Your look deserves the right location.

3
00:00:06,000 --> 00:00:09,000
We map light and styling before the shoot.

4
00:00:09,000 --> 00:00:12,000
Every frame is designed to stop the scroll.

5
00:00:12,000 --> 00:00:15,000
Premium edits. Fast turnaround.

6
00:00:15,000 --> 00:00:18,000
Message now for available dates.
SRT

cat > "$SUB_DIR/ad05.srt" <<'SRT'
1
00:00:00,000 --> 00:00:03,000
Still thinking about booking?

2
00:00:03,000 --> 00:00:06,000
Slots are intentionally limited each month.

3
00:00:06,000 --> 00:00:09,000
You get guided posing and moodboard support.

4
00:00:09,000 --> 00:00:12,000
Studio and outdoor options across Manila.

5
00:00:12,000 --> 00:00:15,000
This is built to elevate your brand image.

6
00:00:15,000 --> 00:00:18,000
Secure your session today.
SRT

make_base_video "$WORK_DIR/ad01_base.mp4" \
  000032-8 aidantorre000579-000029 000023580035 r1-05459-0015 000048780009 000027-6
make_base_video "$WORK_DIR/ad02_base.mp4" \
  000024-7 aidantorre000579-000033 000010-3 aidanto-r2-023-10 000049660027 000032-8
make_base_video "$WORK_DIR/ad03_base.mp4" \
  000023580032 000048750032 r1-05459-0021 aidantorre000579-000024 000039-7 aidanto-r4-071-34
make_base_video "$WORK_DIR/ad04_base.mp4" \
  000027-6 000024-7 000040-10 000048780009 aidanto-r4-065-31 r1-05459-0034
make_base_video "$WORK_DIR/ad05_base.mp4" \
  aidantorre000579-000029 000049660027 000023580035 000032-8 000024-7 000010-3

finalize_ad "$WORK_DIR/ad01_base.mp4" "$SUB_DIR/ad01.srt" "SCROLL STOPPING FASHION PORTRAITS" "$OUTPUT_DIR/ad01_scroll_stopping_fashion_portraits.mp4"
finalize_ad "$WORK_DIR/ad02_base.mp4" "$SUB_DIR/ad02.srt" "NOT A MODEL  PERFECT" "$OUTPUT_DIR/ad02_not_a_model_perfect.mp4"
finalize_ad "$WORK_DIR/ad03_base.mp4" "$SUB_DIR/ad03.srt" "STUDIO AND OUTDOOR  ONE SESSION" "$OUTPUT_DIR/ad03_studio_outdoor_combo.mp4"
finalize_ad "$WORK_DIR/ad04_base.mp4" "$SUB_DIR/ad04.srt" "MANILA LOCATIONS THAT CONVERT" "$OUTPUT_DIR/ad04_manila_locations.mp4"
finalize_ad "$WORK_DIR/ad05_base.mp4" "$SUB_DIR/ad05.srt" "LIMITED SLOTS THIS MONTH" "$OUTPUT_DIR/ad05_limited_slots_retargeting.mp4"

rm -f "$WORK_DIR"/*_base.mp4

echo "Rendered ads to: $OUTPUT_DIR"
