FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.mjs suggest.mjs ./
ENV PORT=8787 ORCH_DATA=/data/data.json
VOLUME /data
EXPOSE 8787
CMD ["node", "server.mjs"]
