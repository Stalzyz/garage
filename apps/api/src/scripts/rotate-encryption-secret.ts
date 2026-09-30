/**
 * Re-encrypt stored integration secrets under a new ENCRYPTION_SECRET.
 *
 * WHY: the vault used to fall back to a hardcoded key
 * (`grekam-os-default-secret-32bytes!`) that is committed to a PUBLIC GitHub
 * repository. Every value in `integration_keys` is therefore decryptable by
 * anyone who can obtain the table. Rotating the key makes all existing
 * ciphertext useless to them.
 *
 * SAFE BY DEFAULT: dry-run only. Nothing is written without `--apply`.
 *
 * Usage:
 *   # 1. Inspect what would change (writes nothing to the DB)
 *   tsx src/scripts/rotate-encryption-secret.ts
 *
 *   # 2. Commit the rotation, supplying the OLD key and a NEW key
 *   OLD_ENCRYPTION_SECRET='<current-or-legacy>' \
 *   NEW_ENCRYPTION_SECRET="$(openssl rand -hex 32)" \
 *   tsx src/scripts/rotate-encryption-secret.ts --apply
 *
 * Then set NEW_ENCRYPTION_SECRET in the API environment and restart.
 *
 * A timestamped JSON backup of the previous ciphertext is always written before
 * any change, so the rotation can be reversed.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../db';

const LEGACY_DEFAULT_KEY = 'grekam-os-default-secret-32bytes!';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function keyFrom(raw: string): Buffer {
  return Buffer.from(raw.slice(0, 32));
}

function encryptWith(text: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const out = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + out.toString('hex');
}

function decryptWith(payload: string, key: Buffer): string {
  const [ivHex, dataHex] = String(payload).split(':');
  if (!ivHex || !dataHex) throw new Error('malformed ciphertext');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
}

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

async function main() {
  const apply = process.argv.includes('--apply');
  const oldSecret = arg('old-key') || process.env.OLD_ENCRYPTION_SECRET || LEGACY_DEFAULT_KEY;
  const newSecret = arg('new-key') || process.env.NEW_ENCRYPTION_SECRET || crypto.randomBytes(32).toString('hex');

  const usingLegacy = oldSecret === LEGACY_DEFAULT_KEY;
  console.log('─'.repeat(64));
  console.log('ENCRYPTION SECRET ROTATION');
  console.log('─'.repeat(64));
  console.log(`mode          : ${apply ? 'APPLY (will write)' : 'DRY-RUN (no writes)'}`);
  console.log(`old key source: ${usingLegacy ? 'legacy hardcoded default' : '--old-key / OLD_ENCRYPTION_SECRET'}`);
  console.log(`new key       : ${apply || arg('new-key') || process.env.NEW_ENCRYPTION_SECRET ? 'provided' : 'generated for this run'}`);
  console.log('');

  const rows = await prisma.integrationKey.findMany({ orderBy: [{ service: 'asc' }, { keyName: 'asc' }] });
  console.log(`Found ${rows.length} integration key(s).\n`);

  const plan: Array<{ id: string; service: string; keyName: string; newCipher: string }> = [];
  const unreadable: string[] = [];

  for (const row of rows) {
    try {
      const plaintext = decryptWith(row.encryptedValue, keyFrom(oldSecret));
      const newCipher = encryptWith(plaintext, keyFrom(newSecret));
      // Verify before proposing the write.
      const verify = decryptWith(newCipher, keyFrom(newSecret));
      if (verify !== plaintext) throw new Error('round-trip mismatch');
      plan.push({ id: row.id, service: row.service, keyName: row.keyName, newCipher });
      console.log(`  ok   ${row.service}/${row.keyName}  (${plaintext.length} chars re-encrypted)`);
    } catch (err: any) {
      unreadable.push(`${row.service}/${row.keyName}`);
      console.log(`  FAIL ${row.service}/${row.keyName} — ${err.message}`);
    }
  }

  console.log('');
  if (unreadable.length) {
    console.log(`${unreadable.length} value(s) could NOT be decrypted with the supplied old key.`);
    console.log('These were most likely stored under a different key already. Re-enter them');
    console.log('in Settings → Integrations after rotating. Aborting without changes.\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  // Always write a backup of current ciphertext before any modification.
  const backupDir = path.resolve(process.cwd(), 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `integration_keys-${stamp}.json`);
  fs.writeFileSync(
    backupFile,
    JSON.stringify({ createdAt: new Date().toISOString(), oldKeyFingerprint: crypto.createHash('sha256').update(oldSecret).digest('hex').slice(0, 12), rows }, null, 2)
  );
  console.log(`Backup written: ${backupFile}`);

  if (!apply) {
    console.log('\nDRY-RUN complete — nothing was written.');
    console.log('Re-run with --apply to commit, then set ENCRYPTION_SECRET in the API environment.');
    await prisma.$disconnect();
    return;
  }

  console.log(`\nApplying ${plan.length} update(s)...`);
  await prisma.$transaction(
    plan.map((p) =>
      prisma.integrationKey.update({ where: { id: p.id }, data: { encryptedValue: p.newCipher } })
    )
  );

  // Post-write verification.
  const check = await prisma.integrationKey.findMany();
  let bad = 0;
  for (const row of check) {
    try {
      decryptWith(row.encryptedValue, keyFrom(newSecret));
    } catch {
      bad++;
      console.log(`  VERIFY FAIL ${row.service}/${row.keyName}`);
    }
  }

  console.log(`\nVerification: ${check.length - bad}/${check.length} values readable with the new key.`);
  if (bad > 0) {
    console.log('\nSome values failed verification. Restore from the backup and investigate.');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('\nRotation complete.');
  console.log(`Set this in the API environment and restart:\n  ENCRYPTION_SECRET=${newSecret}`);
  console.log('Then revoke and reissue every credential that was stored (they were decryptable).');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('ROTATION ERROR:', e);
  await prisma.$disconnect();
  process.exit(1);
});
