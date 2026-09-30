import crypto from 'crypto';

/**
 * Shared secret vault.
 *
 * Replaces three copies of the same AES-256-CBC helper that each fell back to a
 * hardcoded default key (`grekam-os-default-secret-32bytes!`) committed to the
 * repository. With that key public, anyone able to read the `integration_keys`
 * table — via a backup, a stray SQL injection, or a leaked dump — could decrypt
 * every stored WhatsApp/SMTP/Meta/Razorpay secret.
 *
 * The key now comes only from ENCRYPTION_SECRET. Outside development there is
 * no default: the vault fails closed and says exactly what to do.
 */

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/** Kept only so local development works without extra setup. */
const DEV_FALLBACK = 'grekam-os-default-secret-32bytes!';

let warned = false;

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getKey(): Buffer {
  const configured = process.env.ENCRYPTION_SECRET;

  if (!configured) {
    if (!isProduction()) return Buffer.from(DEV_FALLBACK);
    if (!warned) {
      warned = true;
      console.error(
        '[secret-vault] ENCRYPTION_SECRET is not set. Refusing to encrypt/decrypt with a ' +
          'default key. Generate one with `openssl rand -hex 32`, set it in the API ' +
          'environment, then run `tsx src/scripts/rotate-encryption-secret.ts` to ' +
          're-encrypt existing values.'
      );
    }
    throw new Error('ENCRYPTION_SECRET is not configured');
  }

  if (configured === DEV_FALLBACK) {
    throw new Error('ENCRYPTION_SECRET is set to the well-known development default; rotate it');
  }

  return Buffer.from(configured.slice(0, 32));
}

export function encryptSecret(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/** Throws on malformed input or a wrong key — callers must handle it. */
export function decryptSecret(payload: string): string {
  const [ivHex, encryptedHex] = String(payload).split(':');
  if (!ivHex || !encryptedHex) throw new Error('Malformed encrypted value');

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/** Non-throwing variant for masked display. */
export function tryDecryptSecret(payload: string): string | null {
  try {
    return decryptSecret(payload);
  } catch {
    return null;
  }
}

export function maskSecret(value: string | null): string {
  if (!value) return '••••••';
  if (value.length <= 6) return '••••••';
  return value.slice(0, 4) + '••••' + value.slice(-4);
}

/** True when the vault is usable in this environment. */
export function isVaultConfigured(): boolean {
  return Boolean(process.env.ENCRYPTION_SECRET) && process.env.ENCRYPTION_SECRET !== DEV_FALLBACK;
}
