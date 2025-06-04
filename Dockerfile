FROM node:20-bookworm-slim AS builder

WORKDIR /app
 
COPY package*.json .

RUN npm ci

COPY extensions/ extensions/
COPY tsconfig.json .
COPY src/ src/

RUN npm run build && \
    npm prune --production

FROM node:20-bookworm-slim

ARG PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono && \
    apt-get update && apt-get install -y ca-certificates

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/extensions /app/extensions
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

WORKDIR /app/dist

USER hono

EXPOSE ${PORT}
 
CMD ["node", "/app/dist/index.js"]
