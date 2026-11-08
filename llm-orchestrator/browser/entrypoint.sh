#!/bin/sh
# Virtual screen → Chromium (persistent profile in /data/profile) → VNC (localhost only) → noVNC on :6080.
set -e
rm -f /tmp/.X99-lock /data/profile/SingletonLock /data/profile/SingletonSocket /data/profile/SingletonCookie
Xvfb :99 -screen 0 1280x860x24 -nolisten tcp &
sleep 1
chromium --no-first-run --no-default-browser-check --disable-dev-shm-usage --no-sandbox \
  --user-data-dir=/data/profile --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 \
  --renderer-process-limit=3 --disable-features=Translate,MediaRouter --window-position=0,0 --window-size=1280,860 \
  --password-store=basic https://claude.ai/login https://chatgpt.com/ &
x11vnc -display :99 -localhost -nopw -forever -shared -quiet &
websockify --web /usr/share/novnc 6080 localhost:5900 &
exec node /app/poller.mjs
