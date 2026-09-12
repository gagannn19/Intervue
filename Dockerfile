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

# Build-time public configuration — Vite bakes all of these into the static
# bundle. Firebase web config ships in the client bundle by design (see
# .env.example); none of this is secret, it's just sourced from Secret
# Manager (cuecast-intervue-frontend) at build time for convenience of
# having one place to manage per-environment values. See cloudbuild.yaml.
ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_API_URL=$VITE_API_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

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
