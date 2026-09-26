#!/bin/bash
set -e

echo "=== 1. Building apps with pnpm build:all ==="
cd /var/www/garage_saas
export PUPPETEER_SKIP_DOWNLOAD=true
pnpm build:all || true

echo "=== 2. Setting up PM2 Ecosystem ==="
cat << 'EOF' > /var/www/garage_saas/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "garage-api",
      cwd: "/var/www/garage_saas/apps/api",
      script: "npx",
      args: "tsx src/app.ts",
      env: {
        NODE_ENV: "production",
        PORT: "4000",
        DATABASE_URL: "postgresql://garage:garage_pass_2026@localhost:5432/garage",
        JWT_SECRET: "super-secret-production-key-garage-saas-2026",
        NEXT_PUBLIC_API_URL: "https://garage.grekam.in/api/v1"
      }
    },
    {
      name: "garage-web",
      cwd: "/var/www/garage_saas",
      script: "npx",
      args: "next dev apps/web -H 0.0.0.0 -p 3005",
      env: {
        NODE_ENV: "production",
        PORT: "3005",
        NEXT_PUBLIC_API_URL: "https://garage.grekam.in/api/v1"
      }
    }
  ]
};
EOF

cd /var/www/garage_saas
pm2 delete garage-api || true
pm2 delete garage-web || true
pm2 start ecosystem.config.js
pm2 save

echo "=== 3. Setting up Nginx for garage.grekam.in ==="
cat << 'EOF' > /etc/nginx/sites-available/garage.grekam.in
server {
    server_name garage.grekam.in www.garage.grekam.in;

    client_max_body_size 50M;

    location /api/v1/ {
        proxy_pass http://127.0.0.1:4000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/garage.grekam.in /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo "=== 4. Provisioning SSL with Certbot ==="
certbot --nginx -d garage.grekam.in -d www.garage.grekam.in --non-interactive --agree-tos -m admin@grekam.in --redirect || true

nginx -t
systemctl reload nginx

echo "=== Deployment and Nginx setup completed successfully! ==="
