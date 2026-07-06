FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install OpenSSL for Prisma (if needed by NextAuth Prisma adapter)
RUN apt-get update -y && apt-get install -y openssl

FROM base AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @grekam/db db:generate
ENV DATABASE_URL="postgresql://postgres:Photoshop09%40@172.17.0.1:5432/grekam_os?schema=public"
RUN pnpm --filter @grekam/academy-web build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/apps/academy-web/public ./apps/academy-web/public
COPY --from=builder /app/apps/academy-web/.next/standalone ./
COPY --from=builder /app/apps/academy-web/.next/static ./apps/academy-web/.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/academy-web/server.js"]
