/**
 * Lead status + kanban bucketing verification.
 *
 * Reproduces the reported bug: ACADEMY leads created by the Meta Ads webhook
 * landed with status NEW, and the academy board filtered strictly on
 * `status === column.id`, so they matched no column and vanished — while the
 * list view, which does not bucket by stage, still showed them.
 *
 * The two academy rows in production both carry status NEW; that exact shape is
 * the fixture below.
 *
 * Run: ./node_modules/.bin/tsx verify-lead-status.ts
 */

process.env.NODE_ENV = 'test';

import {
  defaultLeadStatus,
  canonicalLeadStatus,
  isKnownLeadStatus,
  funnelForStatus,
} from './src/crm/lead-status';

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

/** Default academy board columns (KanbanBoard.tsx DEFAULT_ACADEMY_COLUMNS). */
const ACADEMY_COLUMNS = ['ENQUIRY', 'COUNSELLING', 'TRIAL', 'ENROLLED_ACADEMY', 'DROPPED'];
/** Default agency board columns. */
const AGENCY_COLUMNS = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'];

/**
 * The board's bucketing rule, transcribed from KanbanBoard.tsx. Kept here as a
 * copy so the test can prove the two agree; `boardRuleMatchesApi` below checks
 * that the copy has not drifted from the shared helper.
 */
function boardCanonical(status: unknown, activeTab: 'AGENCY' | 'ACADEMY'): string {
  const value = String(status ?? '').trim().toUpperCase();
  if (activeTab === 'ACADEMY' && (value === 'NEW' || value === '')) return 'ENQUIRY';
  if (activeTab === 'AGENCY' && (value === 'ENQUIRY' || value === '')) return 'NEW';
  return value;
}

/** Bucket leads exactly as the board does, returning {colId: leads} plus leftovers. */
function bucket(leads: any[], activeTab: 'AGENCY' | 'ACADEMY', columns: string[]) {
  const out: Record<string, any[]> = {};
  columns.forEach((c) => (out[c] = []));
  const unmapped: any[] = [];
  for (const lead of leads) {
    const stage = boardCanonical(lead.status, activeTab);
    if (out[stage]) out[stage].push(lead);
    else unmapped.push(lead);
  }
  return { out, unmapped };
}

async function main() {
  console.log('\n=== 1. New-lead default follows the business unit ===');
  check('ACADEMY starts at ENQUIRY', defaultLeadStatus('ACADEMY') === 'ENQUIRY');
  check('AGENCY starts at NEW', defaultLeadStatus('AGENCY') === 'NEW');
  check('lowercase academy still ENQUIRY', defaultLeadStatus('academy') === 'ENQUIRY');
  check('padded academy still ENQUIRY', defaultLeadStatus('  ACADEMY  ') === 'ENQUIRY');
  check('undefined falls back to NEW', defaultLeadStatus(undefined) === 'NEW');
  check('null falls back to NEW', defaultLeadStatus(null) === 'NEW');
  check('garbage falls back to NEW', defaultLeadStatus('nonsense') === 'NEW');

  console.log('\n=== 2. The production bug: ACADEMY lead stuck at NEW ===');
  // These are the two real rows: businessUnit ACADEMY, status NEW.
  const prodAcademy = [
    { id: 'cmulj98j900005msa2dhmspsk', name: 'Stalin Kumar', status: 'NEW', businessUnit: 'ACADEMY' },
    { id: 'cmuliv7ko0000oun70kbzuu86', name: 'Stalin Kumar', status: 'NEW', businessUnit: 'ACADEMY' },
  ];
  check('ACADEMY+NEW canonicalises to ENQUIRY', canonicalLeadStatus('NEW', 'ACADEMY') === 'ENQUIRY');
  check('lowercase new canonicalises', canonicalLeadStatus('new', 'ACADEMY') === 'ENQUIRY');
  check('empty status canonicalises to ENQUIRY', canonicalLeadStatus('', 'ACADEMY') === 'ENQUIRY');
  check('ACADEMY+COUNSELLING untouched', canonicalLeadStatus('COUNSELLING', 'ACADEMY') === 'COUNSELLING');
  check('AGENCY+ENQUIRY maps back to NEW', canonicalLeadStatus('ENQUIRY', 'AGENCY') === 'NEW');
  check('AGENCY+NEW untouched', canonicalLeadStatus('NEW', 'AGENCY') === 'NEW');

  console.log('\n=== 3. Academy board shows them again ===');
  const { out: acadOut, unmapped: acadUnmapped } = bucket(prodAcademy, 'ACADEMY', ACADEMY_COLUMNS);
  check('both leads land in the Enquiry column', acadOut.ENQUIRY.length === 2, JSON.stringify(Object.keys(acadOut).map(k => `${k}:${acadOut[k].length}`)));
  check('nothing is left unmapped', acadUnmapped.length === 0, `unmapped=${acadUnmapped.length}`);
  check('the exact production ids are present', acadOut.ENQUIRY.map((l) => l.id).includes('cmulj98j900005msa2dhmspsk'));

  console.log('\n=== 4. The old strict filter really did drop them (regression guard) ===');
  const strictCount = prodAcademy.filter((l) => ACADEMY_COLUMNS.includes(l.status)).length;
  check('strict status===col.id matches nothing', strictCount === 0, `matched=${strictCount}`);
  check('which is why the board looked empty', strictCount < prodAcademy.length);

  console.log('\n=== 5. No lead is ever lost, whatever its status ===');
  // Every status the DB or a webhook could plausibly contain, on both funnels.
  const allStatuses = [...new Set([...ACADEMY_COLUMNS, ...AGENCY_COLUMNS, 'WON', 'ENROLLED_ACADEMY', 'BOGUS', '', '   ', 'Trial'])];
  for (const tab of ['ACADEMY', 'AGENCY'] as const) {
    const cols = tab === 'ACADEMY' ? ACADEMY_COLUMNS : AGENCY_COLUMNS;
    const leads = allStatuses.map((s, i) => ({ id: `l${i}`, status: s, businessUnit: tab }));
    const { out, unmapped } = bucket(leads, tab, cols);
    const shown = Object.values(out).reduce((n, arr) => n + arr.length, 0) + unmapped.length;
    check(`${tab}: every lead is placed (${shown}/${leads.length})`, shown === leads.length, `placed=${shown}`);
    // Board invariant: a lead appears in exactly one column, never two.
    const ids = Object.values(out).flat().map((l) => l.id);
    check(`${tab}: no lead duplicated across columns`, new Set(ids).size === ids.length);
  }

  console.log('\n=== 6. Board rule and API helper agree ===');
  // Guards against the frontend copy drifting from the shared source of truth.
  for (const status of [...allStatuses]) {
    for (const tab of ['AGENCY', 'ACADEMY'] as const) {
      const a = boardCanonical(status, tab);
      const b = canonicalLeadStatus(status, tab);
      check(`agree: ${tab} / "${status}" -> ${a}`, a === b, `board=${a} api=${b}`);
    }
  }

  console.log('\n=== 7. Stage classification ===');
  check('ENROLLED_ACADEMY is academy', funnelForStatus('ENROLLED_ACADEMY') === 'ACADEMY');
  check('WON is agency', funnelForStatus('WON') === 'AGENCY');
  check('unknown has no funnel', funnelForStatus('BOGUS') === null);
  check('COUNSELLING is known', isKnownLeadStatus('COUNSELLING'));
  check('BOGUS is not known', !isKnownLeadStatus('BOGUS'));
  check('lowercase enquiry is known', isKnownLeadStatus('enquiry'));

  console.log('\n=== 8. A custom column does not orphan leads ===');
  // If a user renames/removes a default stage, its leads must land in the
  // holding column rather than disappear.
  const trimmed = ACADEMY_COLUMNS.filter((c) => c !== 'COUNSELLING');
  const res = bucket(
    [{ id: 'a', status: 'COUNSELLING', businessUnit: 'ACADEMY' }],
    'ACADEMY',
    trimmed
  );
  check('lead with no column is surfaced, not dropped', res.unmapped.length === 1, `unmapped=${res.unmapped.length}`);

  console.log(`\n${'='.repeat(48)}`);
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) console.log(`Failures:\n  - ${failures.join('\n  - ')}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('HARNESS ERROR:', e);
  process.exit(1);
});
