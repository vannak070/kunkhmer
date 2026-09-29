# Builds the fan site and the admin, then serves both with Caddy (automatic HTTPS).
FROM node:22-alpine AS public
WORKDIR /app
COPY frontend/public/package.json frontend/public/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/public/ ./
ARG SITE_DOMAIN
ARG SITE_INDEXING=false
# Share previews, robots.txt and the noindex switch are decided at build time.
RUN SITE_URL="https://${SITE_DOMAIN}" SITE_INDEXING="${SITE_INDEXING}" npx vite build

FROM node:22-alpine AS admin
WORKDIR /app
COPY frontend/admin/package.json frontend/admin/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/admin/ ./
RUN npx vite build

FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=public /app/dist /srv/public
COPY --from=admin /app/dist /srv/admin
