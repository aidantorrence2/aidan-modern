#!/bin/bash
set -e

IMG_DIR="/Users/aidantorrence/Documents/aidan-modern/public/images/large"
OUT_DIR="/Users/aidantorrence/Documents/aidan-modern/marketing/purple-reels"
W=1080
H=1920
FPS=30

P1="$IMG_DIR/manila-gallery-purple-001-cropped.jpg"
P2="$IMG_DIR/manila-gallery-purple-002-cropped.jpg"
P3="$IMG_DIR/manila-gallery-purple-003-cropped.jpg"
P4="$IMG_DIR/manila-gallery-purple-004-cropped.jpg"
P5="$IMG_DIR/manila-gallery-purple-005-cropped.jpg"
P6="$IMG_DIR/manila-gallery-purple-006-cropped.jpg"

echo "=== Reel 1: Slow Zoom Reveal ==="
# Each photo starts zoomed in 1.4x, slowly pulls to 1.0x over 3s
ffmpeg -y \
  -loop 1 -i "$P2" -loop 1 -i "$P1" -loop 1 -i "$P3" -loop 1 -i "$P5" -loop 1 -i "$P4" -loop 1 -i "$P6" \
  -filter_complex "
    [0:v]scale=${W}*2:${H}*2,zoompan=z='1.4-0.4*on/(3*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v0];
    [1:v]scale=${W}*2:${H}*2,zoompan=z='1.4-0.4*on/(3*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v1];
    [2:v]scale=${W}*2:${H}*2,zoompan=z='1.4-0.4*on/(3*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v2];
    [3:v]scale=${W}*2:${H}*2,zoompan=z='1.4-0.4*on/(3*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v3];
    [4:v]scale=${W}*2:${H}*2,zoompan=z='1.4-0.4*on/(3*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v4];
    [5:v]scale=${W}*2:${H}*2,zoompan=z='1.4-0.4*on/(3*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v5];
    [v0][v1]xfade=transition=fade:duration=0.5:offset=2.5[x01];
    [x01][v2]xfade=transition=fade:duration=0.5:offset=5.0[x02];
    [x02][v3]xfade=transition=fade:duration=0.5:offset=7.5[x03];
    [x03][v4]xfade=transition=fade:duration=0.5:offset=10.0[x04];
    [x04][v5]xfade=transition=fade:duration=0.5:offset=12.5[out]
  " -map "[out]" -c:v libx264 -pix_fmt yuv420p -t 15 "$OUT_DIR/reel_01_zoom_reveal.mp4"

echo "=== Reel 2: Slide Carousel ==="
# Photos slide in from alternating directions
ffmpeg -y \
  -loop 1 -i "$P3" -loop 1 -i "$P5" -loop 1 -i "$P1" -loop 1 -i "$P2" -loop 1 -i "$P6" -loop 1 -i "$P4" \
  -filter_complex "
    [0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v0];
    [1:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v1];
    [2:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v2];
    [3:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v3];
    [4:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v4];
    [5:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v5];
    [v0][v1]xfade=transition=slideleft:duration=0.4:offset=1.6[x01];
    [x01][v2]xfade=transition=slideright:duration=0.4:offset=3.2[x02];
    [x02][v3]xfade=transition=slideleft:duration=0.4:offset=4.8[x03];
    [x03][v4]xfade=transition=slideright:duration=0.4:offset=6.4[x04];
    [x04][v5]xfade=transition=slideleft:duration=0.4:offset=8.0[out]
  " -map "[out]" -c:v libx264 -pix_fmt yuv420p -t 10 "$OUT_DIR/reel_02_slide_carousel.mp4"

echo "=== Reel 3: Ken Burns Pan ==="
# Slow horizontal pan across each photo
ffmpeg -y \
  -loop 1 -i "$P6" -loop 1 -i "$P2" -loop 1 -i "$P4" -loop 1 -i "$P1" -loop 1 -i "$P5" -loop 1 -i "$P3" \
  -filter_complex "
    [0:v]scale=$((W*2)):-1,zoompan=z=1.3:x='(iw-iw/zoom)*on/($((3*FPS)))':y='(ih-ih/zoom)/2':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v0];
    [1:v]scale=$((W*2)):-1,zoompan=z=1.3:x='(iw-iw/zoom)*(1-on/($((3*FPS))))':y='(ih-ih/zoom)/2':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v1];
    [2:v]scale=$((W*2)):-1,zoompan=z=1.3:x='(iw-iw/zoom)*on/($((3*FPS)))':y='(ih-ih/zoom)/2':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v2];
    [3:v]scale=$((W*2)):-1,zoompan=z=1.3:x='(iw-iw/zoom)*(1-on/($((3*FPS))))':y='(ih-ih/zoom)/2':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v3];
    [4:v]scale=$((W*2)):-1,zoompan=z=1.3:x='(iw-iw/zoom)*on/($((3*FPS)))':y='(ih-ih/zoom)/2':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v4];
    [5:v]scale=$((W*2)):-1,zoompan=z=1.3:x='(iw-iw/zoom)*(1-on/($((3*FPS))))':y='(ih-ih/zoom)/2':d=$((3*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v5];
    [v0][v1]xfade=transition=fadeblack:duration=0.3:offset=2.7[x01];
    [x01][v2]xfade=transition=fadeblack:duration=0.3:offset=5.4[x02];
    [x02][v3]xfade=transition=fadeblack:duration=0.3:offset=8.1[x03];
    [x03][v4]xfade=transition=fadeblack:duration=0.3:offset=10.8[x04];
    [x04][v5]xfade=transition=fadeblack:duration=0.3:offset=13.5[out]
  " -map "[out]" -c:v libx264 -pix_fmt yuv420p -t 16 "$OUT_DIR/reel_03_ken_burns.mp4"

echo "=== Reel 4: Flash Cut Montage ==="
# Very quick cuts with white flash transitions
ffmpeg -y \
  -loop 1 -i "$P2" -loop 1 -i "$P4" -loop 1 -i "$P6" -loop 1 -i "$P1" -loop 1 -i "$P3" -loop 1 -i "$P5" \
  -filter_complex "
    [0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=1.2[v0];
    [1:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=1.0[v1];
    [2:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=0.8[v2];
    [3:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=0.7[v3];
    [4:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=0.6[v4];
    [5:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2.0[v5];
    [v0][v1]xfade=transition=fadewhite:duration=0.15:offset=1.05[x01];
    [x01][v2]xfade=transition=fadewhite:duration=0.15:offset=1.9[x02];
    [x02][v3]xfade=transition=fadewhite:duration=0.15:offset=2.55[x03];
    [x03][v4]xfade=transition=fadewhite:duration=0.15:offset=3.1[x04];
    [x04][v5]xfade=transition=fadewhite:duration=0.15:offset=3.55[out]
  " -map "[out]" -c:v libx264 -pix_fmt yuv420p -t 6 "$OUT_DIR/reel_04_flash_cut.mp4"

echo "=== Reel 5: Polaroid Develop ==="
# Each photo fades from desaturated/bright to full color
ffmpeg -y \
  -loop 1 -i "$P1" -loop 1 -i "$P5" -loop 1 -i "$P3" -loop 1 -i "$P6" -loop 1 -i "$P2" -loop 1 -i "$P4" \
  -filter_complex "
    [0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},split[a0][b0];[a0]eq=brightness=0.4:saturation=0,trim=duration=0.5[w0];[b0]trim=duration=2.5,setpts=PTS-STARTPTS[c0];[w0][c0]xfade=transition=fade:duration=1.0:offset=0[v0];
    [1:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},split[a1][b1];[a1]eq=brightness=0.4:saturation=0,trim=duration=0.5[w1];[b1]trim=duration=2.5,setpts=PTS-STARTPTS[c1];[w1][c1]xfade=transition=fade:duration=1.0:offset=0[v1];
    [2:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},split[a2][b2];[a2]eq=brightness=0.4:saturation=0,trim=duration=0.5[w2];[b2]trim=duration=2.5,setpts=PTS-STARTPTS[c2];[w2][c2]xfade=transition=fade:duration=1.0:offset=0[v2];
    [3:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},split[a3][b3];[a3]eq=brightness=0.4:saturation=0,trim=duration=0.5[w3];[b3]trim=duration=2.5,setpts=PTS-STARTPTS[c3];[w3][c3]xfade=transition=fade:duration=1.0:offset=0[v3];
    [4:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},split[a4][b4];[a4]eq=brightness=0.4:saturation=0,trim=duration=0.5[w4];[b4]trim=duration=2.5,setpts=PTS-STARTPTS[c4];[w4][c4]xfade=transition=fade:duration=1.0:offset=0[v4];
    [5:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},split[a5][b5];[a5]eq=brightness=0.4:saturation=0,trim=duration=0.5[w5];[b5]trim=duration=2.5,setpts=PTS-STARTPTS[c5];[w5][c5]xfade=transition=fade:duration=1.0:offset=0[v5];
    [v0][v1]xfade=transition=fadeblack:duration=0.3:offset=2.2[x01];
    [x01][v2]xfade=transition=fadeblack:duration=0.3:offset=4.4[x02];
    [x02][v3]xfade=transition=fadeblack:duration=0.3:offset=6.6[x03];
    [x03][v4]xfade=transition=fadeblack:duration=0.3:offset=8.8[x04];
    [x04][v5]xfade=transition=fadeblack:duration=0.3:offset=11.0[out]
  " -map "[out]" -c:v libx264 -pix_fmt yuv420p -t 13 "$OUT_DIR/reel_05_polaroid_develop.mp4"

echo "=== Reel 6: Wipe Transitions ==="
# Clean wipe transitions alternating directions
ffmpeg -y \
  -loop 1 -i "$P5" -loop 1 -i "$P3" -loop 1 -i "$P2" -loop 1 -i "$P6" -loop 1 -i "$P1" -loop 1 -i "$P4" \
  -filter_complex "
    [0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v0];
    [1:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v1];
    [2:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v2];
    [3:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v3];
    [4:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v4];
    [5:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setpts=PTS-STARTPTS,trim=duration=2[v5];
    [v0][v1]xfade=transition=wiperight:duration=0.4:offset=1.6[x01];
    [x01][v2]xfade=transition=wipedown:duration=0.4:offset=3.2[x02];
    [x02][v3]xfade=transition=wipeleft:duration=0.4:offset=4.8[x03];
    [x03][v4]xfade=transition=wipeup:duration=0.4:offset=6.4[x04];
    [x04][v5]xfade=transition=wiperight:duration=0.4:offset=8.0[out]
  " -map "[out]" -c:v libx264 -pix_fmt yuv420p -t 10 "$OUT_DIR/reel_06_wipe.mp4"

echo "=== Reel 7: Zoom In + Fade (Cinematic) ==="
# Slow zoom IN (opposite of reel 1) with longer holds, more dramatic
ffmpeg -y \
  -loop 1 -i "$P2" -loop 1 -i "$P3" -loop 1 -i "$P5" -loop 1 -i "$P1" -loop 1 -i "$P6" -loop 1 -i "$P4" \
  -filter_complex "
    [0:v]scale=${W}*2:${H}*2,zoompan=z='1.0+0.3*on/(4*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((4*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v0];
    [1:v]scale=${W}*2:${H}*2,zoompan=z='1.0+0.3*on/(4*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((4*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v1];
    [2:v]scale=${W}*2:${H}*2,zoompan=z='1.0+0.3*on/(4*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((4*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v2];
    [3:v]scale=${W}*2:${H}*2,zoompan=z='1.0+0.3*on/(4*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((4*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v3];
    [4:v]scale=${W}*2:${H}*2,zoompan=z='1.0+0.3*on/(4*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((4*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v4];
    [5:v]scale=${W}*2:${H}*2,zoompan=z='1.0+0.3*on/(4*${FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((4*FPS)):s=${W}x${H}:fps=${FPS},setpts=PTS-STARTPTS[v5];
    [v0][v1]xfade=transition=fade:duration=0.8:offset=3.2[x01];
    [x01][v2]xfade=transition=fade:duration=0.8:offset=6.4[x02];
    [x02][v3]xfade=transition=fade:duration=0.8:offset=9.6[x03];
    [x03][v4]xfade=transition=fade:duration=0.8:offset=12.8[x04];
    [x04][v5]xfade=transition=fade:duration=0.8:offset=16.0[out]
  " -map "[out]" -c:v libx264 -pix_fmt yuv420p -t 20 "$OUT_DIR/reel_07_cinematic_zoom.mp4"

echo ""
echo "=== All 7 reels rendered! ==="
ls -lh "$OUT_DIR"/*.mp4
