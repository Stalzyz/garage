#!/bin/bash
set -e

export PUPPETEER_SKIP_DOWNLOAD=true

echo "=== 1. Setting up Environment Variables ==="
cat << 'EOF' > /var/www/garage_saas/.env
DATABASE_URL="postgresql://garage:garage_pass_2026@localhost:5432/garage"
JWT_SECRET="super-secret-production-key-garage-saas-2026"
NEXT_PUBLIC_API_URL="https://garage.grekam.in/api/v1"
PORT=4000
WEB_PORT=3005
NODE_ENV="production"
RAZORPAY_KEY_ID="rzp_test_mock"
RAZORPAY_KEY_SECRET="mock_secret"
EOF

cp /var/www/garage_saas/.env /var/www/garage_saas/apps/api/.env
cp /var/www/garage_saas/.env /var/www/garage_saas/apps/web/.env

echo "=== 2. Pulling latest code & Installing pnpm dependencies ==="
cd /var/www/garage_saas
git pull origin main
PUPPETEER_SKIP_DOWNLOAD=true pnpm install --no-frozen-lockfile

echo "=== 3. Generating Prisma Client & Running Database Push ==="
npx prisma@5.22.0 generate --schema=packages/db/prisma/schema.prisma
npx prisma@5.22.0 db push --schema=packages/db/prisma/schema.prisma --accept-data-loss

echo "=== 4. Building Applications ==="
pnpm build || true

echo "=== Deployment script setup complete ==="
