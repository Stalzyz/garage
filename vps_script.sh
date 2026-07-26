#!/bin/bash
set -e

echo ""
echo "==> [1/6] Pulling latest code..."
cd /root/grekam-os
git pull origin main

echo ""
echo "==> [2/6] Installing dependencies..."
pnpm install --frozen-lockfile 2>&1 | tail -3

echo ""
echo "==> [3/6] Building apps/web..."
pnpm --filter=web build 2>&1 | tail -5
# Copy static assets into the standalone output (required for Next.js standalone mode)
cp -rf apps/web/.next/static apps/web/.next/standalone/apps/web/.next/ 2>/dev/null || true
cp -rf apps/web/public apps/web/.next/standalone/apps/web/ 2>/dev/null || true
echo "Static assets copied to standalone."

echo ""
echo "==> [4/6] Building apps/academy-web..."
pnpm --filter=academy-web build 2>&1 | tail -5
# Copy static assets into the standalone output
cp -rf apps/academy-web/.next/static apps/academy-web/.next/standalone/apps/academy-web/.next/ 2>/dev/null || true
cp -rf apps/academy-web/public apps/academy-web/.next/standalone/apps/academy-web/ 2>/dev/null || true
echo "Academy static assets copied to standalone."

echo ""
echo "==> [5/6] Restarting PM2 processes..."
pm2 restart grekam-os-web || echo "grekam-os-web not found, skip"
pm2 restart grekam-os-api || echo "grekam-os-api not found, skip"

if pm2 describe academy-web > /dev/null 2>&1; then
  echo "academy-web exists, restarting..."
  pm2 restart academy-web
else
  echo "Starting academy-web on port 3006..."
  cd /root/grekam-os
  PORT=3006 pm2 start "pnpm --filter=academy-web start" --name academy-web
fi

pm2 save

echo ""
echo "==> [6/6] Setting up Nginx for academy.grekam.in..."
if [ ! -f /etc/nginx/sites-available/academy.grekam.in ]; then
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
fi

echo ""
echo "==> PM2 Status:"
pm2 status

echo ""
echo "======================================"
echo "  DEPLOYMENT COMPLETE!"
echo "  academy.grekam.in -> port 3006"
echo "  garage.grekam.in  -> updated"
echo "======================================"
