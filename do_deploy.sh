#!/bin/bash
set -e
echo "Starting deploy..." > /root/deploy.log
cd /root/grekam-os
git pull origin main >> /root/deploy.log 2>&1
pnpm install >> /root/deploy.log 2>&1
pnpm --filter=web build >> /root/deploy.log 2>&1
pnpm --filter=academy-web build >> /root/deploy.log 2>&1
pm2 restart grekam-os-web >> /root/deploy.log 2>&1
pm2 restart grecakam-os-academy >> /root/deploy.log 2>&1
echo "DEPLOY FINISHED" >> /root/deploy.log
