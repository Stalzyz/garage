import { whatsappService } from './apps/api/src/integrations/whatsapp.service';

async function test() {
  const creds = await whatsappService.getCredentials();
  console.log("Creds:", { ...creds, metaToken: !!creds.metaToken, graftyKey: !!creds.graftyKey });
}
test();
