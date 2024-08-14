# syntax=docker/dockerfile:1.7-labs
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY --parents packages/backend/package.json ./
RUN npm ci
COPY --parents packages/backend ./
RUN npm run -w backend build && npm prune --omit=dev
RUN find

FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder --parents /app/./packages/backend ./

CMD ["node", "packages/backend/index.js"]
EXPOSE 3000
