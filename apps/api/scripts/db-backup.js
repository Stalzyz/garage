#!/usr/bin/env node
/**
 * Grekam OS — Automated Database Backup Script
 * 
 * Usage:
 *   node scripts/db-backup.js
 * 
 * Or add to crontab for daily 2 AM backups:
 *   0 2 * * * cd /path/to/grekam-os && node apps/api/scripts/db-backup.js >> /var/log/db-backup.log 2>&1
 * 
 * Requires:
 *   - pg_dump on PATH
 *   - R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME in .env
 *   - DATABASE_URL in .env
 */

const { execSync } = require('child_process');
const { createReadStream, unlinkSync, existsSync } = require('fs');
const path = require('path');
const os = require('os');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const DB_URL = process.env.DATABASE_URL;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'grekam-backups';

if (!DB_URL) {
  console.error('[Backup] ERROR: DATABASE_URL not set');
  process.exit(1);
}

async function runBackup() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const filename = `db-backup-${timestamp}.sql.gz`;
  const tmpPath = path.join(os.tmpdir(), filename);

  console.log(`[Backup] Starting backup: ${filename}`);

  // Step 1: Dump + compress
  try {
    execSync(`pg_dump "${DB_URL}" | gzip > "${tmpPath}"`, { stdio: 'inherit' });
    console.log('[Backup] pg_dump complete ✓');
  } catch (err) {
    console.error('[Backup] pg_dump failed:', err.message);
    process.exit(1);
  }

  // Step 2: Upload to Cloudflare R2 (S3-compatible API)
  if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
    try {
      const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
      
      // Use aws-sdk v3 (S3Client) compatible with R2
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      const fs = require('fs');
      
      const client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
      });

      const fileStream = fs.createReadStream(tmpPath);
      
      await client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: `backups/${filename}`,
        Body: fileStream,
        ContentType: 'application/gzip',
        Metadata: { 'backup-date': now.toISOString(), 'source': 'grekam-os-auto' },
      }));

      console.log(`[Backup] Uploaded to R2: ${R2_BUCKET_NAME}/backups/${filename} ✓`);
    } catch (err) {
      console.error('[Backup] R2 upload failed:', err.message);
    }
  } else {
    console.warn('[Backup] R2 credentials not set — backup saved locally only at:', tmpPath);
    return; // Keep local file if no R2
  }

  // Step 3: Clean up temp file
  try {
    unlinkSync(tmpPath);
    console.log('[Backup] Temp file cleaned up ✓');
  } catch {}

  console.log('[Backup] Complete ✓');
}

runBackup().catch(err => {
  console.error('[Backup] Unhandled error:', err);
  process.exit(1);
});
