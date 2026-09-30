/**
 * Normalise lead statuses that belong to the wrong funnel.
 *
 * WHY: the LeadStatus enum holds both funnels and the DB default is NEW. Lead
 * creation paths that passed businessUnit straight to Prisma — the Meta Ads and
 * WhatsApp webhooks, and both ad-ingestion branches in ads-webhook.router.ts —
 * wrote status NEW for ACADEMY leads too. Those rows are invisible to the
 * academy board and cannot be selected by the academy stage filter, which
 * offers ENQUIRY and not NEW.
 *
 * The API now sets the status correctly at creation time and the board maps
 * legacy values, so this script is about making the stored data consistent so
 * that filtering, exports and reports agree.
 *
 * Dry run by default. Pass --apply to write.
 *
 *   ./node_modules/.bin/tsx src/scripts/normalise-lead-status.ts
 *   ./node_modules/.bin/tsx src/scripts/normalise-lead-status.ts --apply
 */

import { prisma } from '../db';
import { canonicalLeadStatus } from '../crm/lead-status';

const APPLY = process.argv.includes('--apply');

async function main() {
  // Everything that could be cross-funnel: ACADEMY rows sitting on an agency
  // stage, or an agency row sitting on an academy stage. Columns are filtered
  // in the query so the scan stays small.
  const candidates = await prisma.lead.findMany({
    where: {
      OR: [
        { businessUnit: 'ACADEMY', status: { in: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'] } },
        { businessUnit: { not: 'ACADEMY' }, status: { in: ['ENQUIRY', 'COUNSELLING', 'TRIAL', 'ENROLLED_ACADEMY', 'DROPPED'] } },
      ],
    },
    select: { id: true, name: true, businessUnit: true, status: true, source: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  if (candidates.length === 0) {
    console.log('No cross-funnel lead rows found. Nothing to do.');
    return;
  }

  const updates: Array<{ id: string; from: any; to: any; row: any }> = [];
  for (const row of candidates) {
    const to = canonicalLeadStatus(row.status, row.businessUnit);
    if (to && to !== row.status) {
      updates.push({ id: row.id, from: row.status, to, row });
    }
  }

  if (updates.length === 0) {
    console.log(`${candidates.length} cross-funnel row(s) checked, none need changing.`);
    return;
  }

  console.log(`\n${updates.length} lead row(s) would change:\n`);
  for (const u of updates) {
    console.log(
      `  ${u.row.name} (${u.row.businessUnit}, source=${u.row.source ?? 'n/a'})\n` +
        `    ${String(u.from)}  ->  ${u.to}\n` +
        `    id=${u.id}`
    );
  }

  if (!APPLY) {
    console.log(`\nDry run. Re-run with --apply to write these ${updates.length} change(s).`);
    return;
  }

  for (const u of updates) {
    await prisma.lead.update({ where: { id: u.id }, data: { status: u.to } });
  }
  console.log(`\nApplied ${updates.length} update(s).`);
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
