# Always-on browser for chat services with no API (claude.ai, ChatGPT): a real Chromium on a virtual
# screen, signed in once by you through the noVNC remote view, plus poller.mjs which reads your chats
# from inside those tabs and types your replies into them. No automation flags, no bot-check tricks:
# it is an ordinary browser that a small program looks at through the DevTools protocol.
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium xvfb x11vnc novnc websockify fonts-liberation fonts-noto-color-emoji ca-certificates procps \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Build from llm-orchestrator/: docker build -f browser/Dockerfile -t orch-browser .
COPY browser/poller.mjs browser/entrypoint.sh ./
COPY connectors ./connectors
RUN chmod +x entrypoint.sh && ln -sf /usr/share/novnc/vnc.html /usr/share/novnc/index.html
ENV DISPLAY=:99
VOLUME /data
EXPOSE 6080
CMD ["/app/entrypoint.sh"]
