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
echo "==> [2.5/6] Building apps/api (TypeScript -> dist)..."
pnpm --filter=@grekam/api build 2>&1 | tail -5

echo ""
echo "==> [3/6] Building apps/web..."
pnpm --filter=web build 2>&1 | tail -5

echo ""
echo "==> [4/6] Building apps/academy-web..."
pnpm --filter=academy-web build 2>&1 | tail -5

echo ""
echo "==> [5/6] Managing PM2 processes..."
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/ 2>/dev/null || true
cp -r apps/web/.next/static apps/web/.next/standalone/grekam-os/apps/web/.next/ 2>/dev/null || true
cp -r apps/web/public apps/web/.next/standalone/apps/web/ 2>/dev/null || true
cp -r apps/web/public apps/web/.next/standalone/grekam-os/apps/web/ 2>/dev/null || true

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
  PORT=3006 pm2 start "pnpm --filter=academy-web start" --name academy-web
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
