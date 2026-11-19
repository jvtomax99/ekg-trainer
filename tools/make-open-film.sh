#!/usr/bin/env bash
# Cuts the opening film (img/film/open.mp4) and the start menu's picture (img/film/open.webp,
# the film's first frame) from the generated shots.
#   tools/make-open-film.sh <folder with the source clips>
# Needs ffmpeg. The source clips and the music take are not in the repo (CREDITS.md says where
# they came from). The folder needs v1 (hands push the unit doors open), v2 (the nurse walks the
# hallway), v3 (at the station), v4 (the dash to the lit room) as .mp4, and music.mp3.
# The cut: 14.5 s, 720 by 1280, 24 frames a second. From 6.8 to 10.1 s the picture is only the
# station, blurred: js/start.js draws the strip and every word over the film as real text.
# The music's big hit is at 10.1 s of the take, which is where the dash starts.
# If a time here changes, change FILM in js/start.js to match.
set -euo pipefail
SRC="${1:?give the folder with the source clips}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/img/film"
mkdir -p "$OUT"
LEN=14.5
FIT="fps=24,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,format=yuv420p"

# name, start in the source, length taken from the source, length in the film, blurred (1) or not (0)
SHOTS=(
  "v1 0.00 2.40 2.40 0"
  "v2 0.60 2.80 2.80 0"
  "v3 0.20 1.60 1.60 0"
  "v3 1.80 3.20 3.30 1"
  "v4 2.20 2.80 2.60 0"
)
inputs=(); filter=""; n=0; labels=""
for row in "${SHOTS[@]}"; do
  read -r name ss len out blur <<<"$row"
  frames=$(awk "BEGIN{printf \"%d\", $out*24+0.5}")
  speed=$(awk "BEGIN{print $out/$len}")
  extra=""; [ "$blur" = 1 ] && extra=",boxblur=18:2,eq=brightness=-0.06"
  inputs+=(-ss "$ss" -t "$len" -i "$SRC/$name.mp4")
  filter+="[$n:v]setpts=(PTS-STARTPTS)*$speed,$FIT$extra,tpad=stop_mode=clone:stop_duration=4,trim=end_frame=$frames,setpts=PTS-STARTPTS[v$n];"
  labels+="[v$n]"; n=$((n+1))
done
# join; the last frame is held under the title, and the end fades to the dark
filter+="${labels}concat=n=$n:v=1:a=0,tpad=stop_mode=clone:stop_duration=4,trim=duration=$LEN,fade=t=out:st=$(awk "BEGIN{print $LEN-0.5}"):d=0.5:color=0x05090d[v];"
inputs+=(-i "$SRC/music.mp3")
filter+="[$n:a]atrim=0:$LEN,loudnorm=I=-18:TP=-1.5,afade=t=out:st=$(awk "BEGIN{print $LEN-1.3}"):d=1.3[a]"

ffmpeg -v error -y "${inputs[@]}" -filter_complex "$filter" -map "[v]" -map "[a]" \
  -c:v libx264 -profile:v high -level 3.1 -pix_fmt yuv420p -preset slow -crf "${CRF:-23}" -maxrate 2000k -bufsize 4000k \
  -g 48 -c:a aac -b:a 112k -ar 44100 -movflags +faststart -t $LEN "$OUT/open.mp4"
ffmpeg -v error -y -i "$OUT/open.mp4" -frames:v 1 -c:v libwebp -quality 62 "$OUT/open.webp"
ls -l "$OUT"
