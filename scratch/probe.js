const { prisma } = require('./apps/api/dist/db');
const { decrypt } = require('./apps/api/dist/settings/integrations.router');

async function run() {
  const keys = await prisma.integrationKey.findMany({ where: { service: { in: ['WHATSAPP', 'META'] } } });
  let graftyKey = '', graftyUrl = 'https://grafty.pro', graftyInstanceId = '';
  for (const k of keys) {
    const val = decrypt(k.encryptedValue);
    if (k.keyName === 'GRAFTY_API_KEY') graftyKey = val;
    if (k.keyName === 'GRAFTY_API_URL') graftyUrl = val;
    if (k.keyName === 'GRAFTY_INSTANCE_ID') graftyInstanceId = val;
  }

  console.log('--- TESTING GRAFTY SEND WITH APPROVED grafty_proposals TEMPLATE ---');
  const payload = {
    instance_id: graftyInstanceId,
    phone: '919042583701',
    to: '919042583701',
    recipient: { phone: '919042583701', name: 'Stalin' },
    template: {
      name: 'grafty_proposals',
      language: 'en_US',
      components: []
    }
  };

  const res = await fetch(graftyUrl + '/api/v1/messages/send-template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + graftyKey,
      'x-api-key': graftyKey
    },
    body: JSON.stringify(payload)
  });
  console.log('Status:', res.status);
  console.log('Response body:', await res.text());
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
