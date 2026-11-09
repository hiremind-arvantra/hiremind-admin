# hiremind-admin — Next.js standalone server (SSR + /api/* rewrites proxy the backends).
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js evaluates rewrites() at BUILD time, so the backend URLs must be present here —
# runtime env is too late. Compose passes these as build args (Compose hostnames).
ARG USERS_API_URL
ARG COMPANY_API_URL
ENV USERS_API_URL=$USERS_API_URL \
    COMPANY_API_URL=$COMPANY_API_URL
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Standalone output bundles only what the server needs, which keeps this image small
# enough to sit beside the JVMs and the AI stack on an 8GB box.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
