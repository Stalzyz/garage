const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

function decrypt(text) {
  if (!text) return '';
  if (!text.includes(':')) return text;
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const secret = process.env.ENCRYPTION_SECRET || 'default-secret-key-32-chars-minimum!!';
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return text;
  }
}

async function run() {
  const keys = await prisma.integrationKey.findMany({
    where: { service: { in: ['WHATSAPP', 'META'] } }
  });
  console.log('--- DB INTEGRATION KEYS ---');
  let graftyKey = '', graftyUrl = 'https://grafty.pro', graftyInstanceId = '';
  for (const k of keys) {
    console.log(k.keyName, '->', decrypt(k.encryptedValue).slice(0, 15) + '...');
    if (k.keyName === 'GRAFTY_API_KEY') graftyKey = decrypt(k.encryptedValue);
    if (k.keyName === 'GRAFTY_API_URL') graftyUrl = decrypt(k.encryptedValue);
    if (k.keyName === 'GRAFTY_INSTANCE_ID') graftyInstanceId = decrypt(k.encryptedValue);
  }

  console.log('\n--- TESTING GRAFTY API ENDPOINTS ---');
  const eps = [
    '/api/v1/instances',
    '/api/v1/channels',
    '/api/v1/phone-numbers',
    '/api/v1/whatsapp/instances',
    '/api/v1/templates',
    '/api/v1/me'
  ];

  for (const ep of eps) {
    try {
      const res = await fetch(graftyUrl + ep, {
        headers: { 'Authorization': `Bearer ${graftyKey}`, 'x-api-key': graftyKey }
      });
      const txt = await res.text();
      console.log(ep, '-> Status:', res.status);
      console.log('Response:', txt.slice(0, 250), '\n');
    } catch (e) {
      console.log(ep, '-> Error:', e.message);
    }
  }
  await prisma.$disconnect();
}
run();
