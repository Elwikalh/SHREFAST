# syntax=docker/dockerfile:1

FROM node:22-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS builder
COPY . .
# No pnpm-lock.yaml is committed yet, so this stays reproducible-but-not-frozen
# until the first local `pnpm install` generates and commits the lockfile.
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @el7bboB/web... build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
ENV PORT=3000
# Without this, the standalone server binds to localhost only, which Railway's
# external healthcheck cannot reach, causing "service unavailable" forever.
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
