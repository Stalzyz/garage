/**
 * Secret vault verification — the vault is fail-closed, so the failure paths
 * matter as much as the happy path.
 *
 * Run: ./node_modules/.bin/tsx verify-secret-vault.ts
 */

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function main() {
  // Load with a known key.
  process.env.ENCRYPTION_SECRET = 'a'.repeat(32);
  process.env.NODE_ENV = 'production';

  // Fresh module instance so env is read at call time.
  const { encryptSecret, decryptSecret, tryDecryptSecret, maskSecret, isVaultConfigured } =
    await import(`./src/utils/secret-vault?t=${Date.now()}`);

  console.log('\n=== 1. Round trip ===');
  const secret = 'EAAB-super-secret-meta-token-value';
  const blob = encryptSecret(secret);
  check('ciphertext differs from plaintext', blob !== secret);
  check('ciphertext has iv:payload shape', /^[0-9a-f]{32}:[0-9a-f]+$/.test(blob), blob.slice(0, 40));
  check('decrypts back to the original', decryptSecret(blob) === secret);
  check('tryDecryptSecret returns the value', tryDecryptSecret(blob) === secret);
  check('ciphertext is non-deterministic (fresh IV)', encryptSecret(secret) !== blob);

  console.log('\n=== 2. Wrong key cannot decrypt ===');
  const { decryptSecret: decrypt2 } = await import(`./src/utils/secret-vault?t=${Date.now()}x`);
  process.env.ENCRYPTION_SECRET = 'b'.repeat(32);
  const { decryptSecret: decryptWithWrongKey } = await import(
    `./src/utils/secret-vault?t=${Date.now()}y`
  );
  let rejected = false;
  try {
    decryptWithWrongKey(blob);
  } catch {
    rejected = true;
  }
  check('a different ENCRYPTION_SECRET fails to decrypt', rejected);
  check('tryDecryptSecret swallows it and returns null', tryDecryptSecret(blob) === null);
  void decrypt2;

  console.log('\n=== 3. Fail-closed in production ===');
  process.env.ENCRYPTION_SECRET = '';
  const { encryptSecret: encNoKey, isVaultConfigured: configuredNoKey } = await import(
    `./src/utils/secret-vault?t=${Date.now()}z`
  );
  check('isVaultConfigured() is false with no key', configuredNoKey() === false);
  let threwOnEncrypt = false;
  try {
    encNoKey('anything');
  } catch {
    threwOnEncrypt = true;
  }
  check('encrypt throws rather than using the default key', threwOnEncrypt);

  console.log('\n=== 4. Known default key is rejected even if configured ===');
  process.env.ENCRYPTION_SECRET = 'grekam-os-default-secret-32bytes!';
  const { encryptSecret: encDefault, isVaultConfigured: configuredDefault } = await import(
    `./src/utils/secret-vault?t=${Date.now()}w`
  );
  check('isVaultConfigured() is false for the public default', configuredDefault() === false);
  let threwOnDefault = false;
  try {
    encDefault('anything');
  } catch {
    threwOnDefault = true;
  }
  check('encrypt refuses the well-known default key', threwOnDefault);

  console.log('\n=== 5. Masking never reveals the middle ===');
  check('masks a normal secret', maskSecret('ABCDEFGHIJKLMNOP') === 'ABCD••••MNOP', maskSecret('ABCDEFGHIJKLMNOP'));
  check('masks a short secret entirely', maskSecret('abc') === '••••••');
  check('masks null', maskSecret(null) === '••••••');
  check('mask does not leak full value', !maskSecret('ABCDEFGHIJKLMNOP').includes('EFGHIJKL'));

  console.log(`\n${'='.repeat(46)}`);
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) console.log(`Failures:\n  - ${failures.join('\n  - ')}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('HARNESS ERROR:', e);
  process.exit(1);
});
