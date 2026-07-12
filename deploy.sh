#!/bin/bash

# Exit on any error
set -e

echo "======================================"
echo "🚀 Starting Grekam OS Deployment (PM2)"
echo "======================================"

# 1. Pull latest code (if applicable)
echo "📦 Pulling latest code..."
git pull origin main || echo "No git repo or up to date."

# 2. Install dependencies
echo "🔧 Installing dependencies..."
pnpm install

# 3. Database Schema Push & Client Generation
echo "🗄️ Pushing Prisma schema and generating client..."
cd packages/db
npx prisma db push --accept-data-loss
npx prisma generate
cd ../..

# 4. Build API
echo "⚙️ Building API..."
pnpm --filter @grekam/api build

# 5. Build Web
echo "🌐 Building Web App..."
pnpm --filter @grekam/web build

# 6. Setup Standalone Static Files for Next.js
echo "📂 Copying Next.js static files to standalone directory..."
# Remove old static files if they exist
rm -rf apps/web/.next/standalone/grekam-os/apps/web/.next/static
# Copy new static files and public assets
cp -r apps/web/.next/static apps/web/.next/standalone/grekam-os/apps/web/.next/
cp -r apps/web/public apps/web/.next/standalone/grekam-os/apps/web/

# 7. Restart PM2 processes
echo "🔄 Restarting PM2 processes..."
pm2 restart grekam-os-api grekam-os-web

echo "======================================"
echo "✅ Deployment completed successfully!"
echo "======================================"
