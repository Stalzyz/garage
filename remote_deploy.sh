#!/bin/bash
set -euo pipefail

echo ""
echo "==> [1/6] Pulling latest code..."
cd /root/grekam-os
git pull origin main

echo ""
echo "==> [2/6] Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "==> [2.5/6] Building apps/api (TypeScript -> dist)..."
pnpm --filter=@grekam/api build

echo ""
echo "==> [3/6] Building apps/web..."
pnpm --filter=@grekam/web build

echo ""
echo "==> [4/6] Building apps/academy-web..."
pnpm --filter=@grekam/academy-web build

echo ""
echo "==> [4.5/6] Checking database schema drift..."
# This repo has NO migration history at all (no prisma/migrations directory --
# migration SQL is gitignored, and the schema has only ever been managed with
# `prisma db push`). Two consequences:
#
#   * `prisma migrate deploy` is a no-op, so the PasswordResetToken table added
#     for password recovery would NOT exist and /api/auth/{forgot,reset}-password
#     would 500.
#   * `prisma db push` would create that table, but the live DB has known schema
#     drift, and `db push` DROPS anything present in the DB but absent from
#     schema.prisma. Running it unattended against production is not safe.
#
# So: always print the exact SQL diff (read-only), and only apply when the
# operator explicitly sets APPLY_SCHEMA=1 after reviewing that output.
cd /root/grekam-os
echo "--- pending schema changes (review before applying) ---"
pnpm --filter=@grekam/db exec prisma migrate diff \
  --from-url "$(grep -m1 '^DATABASE_URL=' packages/db/.env | cut -d= -f2- | tr -d '\"' || true)" \
  --to-schema-datamodel prisma/schema.prisma \
  --script || echo "  (could not diff -- check DATABASE_URL manually)"

if [ "${APPLY_SCHEMA:-0}" = "1" ]; then
  echo "!!! APPLY_SCHEMA=1 set -- running prisma db push against production !!!"
  pnpm --filter=@grekam/db exec prisma db push --accept-data-loss
else
  echo "APPLY_SCHEMA != 1 -- schema NOT modified."
  echo "If the diff above shows only CREATE TABLE PasswordResetToken, re-run with APPLY_SCHEMA=1"
fi

echo ""
echo "==> [5/6] Managing PM2 processes..."
rm -rf apps/web/.next/standalone/apps/web/.next/static
mkdir -p apps/web/.next/standalone/apps/web/.next/
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/ 2>/dev/null || true
cp -r apps/web/public apps/web/.next/standalone/apps/web/ 2>/dev/null || true

cat > /root/start_web.sh << 'WEBEOF'
#!/bin/bash
cd /root/grekam-os/apps/web/.next/standalone/apps/web
export AUTH_SECRET="HVGc8f8axk68e0rBrBubq+GjZqTfoV1wZgde2qXt4vU="
export AUTH_TRUST_HOST=true
export NEXT_PUBLIC_API_URL="https://garage.grekam.in/api/v1"
export PORT=3000
export HOSTNAME=0.0.0.0
exec node server.js
WEBEOF
chmod +x /root/start_web.sh

pm2 restart grekam-os-web || pm2 restart 11 || echo "web process not found"
pm2 restart grekam-os-api || pm2 restart 2 || echo "api process not found"

if pm2 describe academy-web > /dev/null 2>&1; then
  echo "academy-web already exists — restarting..."
  pm2 restart academy-web
else
  echo "Starting academy-web on port 3006..."
  cd /root/grekam-os
  PORT=3006 pm2 start "pnpm --filter=@grekam/academy-web start" --name academy-web
fi

pm2 save

echo ""
echo "==> [6/6] Setting up Nginx for academy.grekam.in..."
cat > /etc/nginx/sites-available/academy.grekam.in << 'NGINXEOF'
server {
    listen 80;
    server_name academy.grekam.in;

    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/academy.grekam.in /etc/nginx/sites-enabled/academy.grekam.in
nginx -t && systemctl reload nginx

echo ""
echo "==> Final PM2 Status:"
pm2 status

echo ""
echo "======================================"
echo "  DEPLOYMENT COMPLETE!"
echo "  garage.grekam.in  -> updated (web)"
echo "  academy.grekam.in -> port 3006 (academy-web)"
echo "======================================"
