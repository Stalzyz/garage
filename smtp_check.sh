#!/bin/bash
# Check SMTP config and patch env on VPS
cat /root/grekam-os/apps/api/.env
echo "=== CHECKING SMTP IN DB ==="
cd /root/grekam-os/packages/db
node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.integrationKey.findMany({where:{service:'SMTP'}}).then(r=>{
  console.log('SMTP keys count:', r.length);
  r.forEach(k=>console.log(' -', k.keyName, ':', k.encryptedValue ? 'SET' : 'EMPTY'));
  return p.\$disconnect();
});
" 2>&1 | head -20
echo "=== RECENT API LOGS ==="
pm2 logs grekam-os-api --lines 50 --nostream 2>&1 | tail -50
