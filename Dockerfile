# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — build the static bundle
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first so this layer is cached until the lockfile
# actually changes.
COPY package.json package-lock.json ./
RUN npm ci

# Build-time public configuration. This is NOT a secret — it is the public
# base URL of the backend API and Vite bakes it into the static bundle.
# Passed in by Cloud Build from the _VITE_API_URL substitution.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — serve the bundle with nginx (non-root, listens on $PORT)
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Cloud Run routes traffic to $PORT. The stock nginx entrypoint renders
# every /etc/nginx/templates/*.template through envsubst on startup, so the
# listen directive picks this up. Cloud Run overrides PORT at runtime.
ENV PORT=8080

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# CMD / ENTRYPOINT are inherited from the base image (envsubst on templates,
# then `nginx -g 'daemon off;'`).
