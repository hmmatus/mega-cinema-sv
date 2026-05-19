FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.0 turbo@2

# ---- prune: extract only packages needed by @cinema/api ----
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=@cinema/api --docker

# ---- deps: install pruned dependencies ----
FROM base AS deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# ---- build: compile TypeScript ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/ .
COPY --from=pruner /app/out/full/ .

RUN pnpm --filter @cinema/database db:generate
RUN pnpm --filter @cinema/api build

# ---- runner: lean production image (prod deps only) ----
FROM node:20-alpine AS runner
RUN npm install -g pnpm@9.15.0
WORKDIR /app

ENV NODE_ENV=production

# Reinstall only prod deps from pruned lock file — excludes devDependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output
COPY --from=builder /app/apps/api/dist ./apps/api/dist
# Copy Prisma generated client (runtime artifact, not in source)
COPY --from=builder /app/packages/database/src/generated ./packages/database/src/generated

WORKDIR /app/apps/api
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "dist/main"]
