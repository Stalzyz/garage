FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

FROM base AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @grekam/db db:generate
RUN pnpm --filter @grekam/api build

FROM base AS runner
WORKDIR /app

# Copy the full node_modules (monorepo root + all packages)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Copy API app
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# If api has its own node_modules (hoisted differently), copy that too
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 4000
CMD ["node", "apps/api/dist/app.js"]
