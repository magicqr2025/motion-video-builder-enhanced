# System tools only. The app code is mounted from the repo (see docker-compose.yml), so `git pull` updates it without a rebuild.
FROM node:20-bookworm-slim

# Chrome Headless Shell (downloaded by Remotion on the first render) needs these libraries; ffmpeg is bundled with Remotion.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl git ffmpeg python3 \
      libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libasound2 libxrandr2 libxkbcommon0 libxfixes3 \
      libxcomposite1 libxdamage1 libgbm1 libcups2 libpango-1.0-0 libcairo2 libxshmfence1 \
      fonts-liberation fonts-noto-color-emoji fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

# Claude Code CLI: used once for `claude login`; the studio itself talks to Claude through the Agent SDK.
RUN npm install -g @anthropic-ai/claude-code && npm cache clean --force

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV HOME=/home/node
WORKDIR /app
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "studio/server/index.mjs", "--no-open"]
