# Kun Khmer API (Node.js)
#   docker compose uses the "dev" target (source mounted, auto-reload).
#   The default (last) target is a production image: `docker build .`

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
COPY . .
ENV NODE_ENV=development PORT=3001 PRISMA_HIDE_UPDATE_MESSAGE=true
EXPOSE 3001
ENTRYPOINT ["/app/docker/entrypoint.sh"]

FROM deps AS build
COPY . .
RUN npx prisma generate && npx tsc

FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production PORT=3001 PRISMA_HIDE_UPDATE_MESSAGE=true
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY docker ./docker
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3001
ENTRYPOINT ["/app/docker/entrypoint.sh"]
