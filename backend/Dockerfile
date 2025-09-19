# backend/Dockerfile（Debian 版，节选）
FROM node:20-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=4000
ENV SQLITE_PATH=/data/todos.db

RUN useradd -m -r -s /usr/sbin/nologin app \
 && mkdir -p /data \
 && chown -R app:app /data

USER app
EXPOSE 4000
CMD ["node", "src/index.js"]
