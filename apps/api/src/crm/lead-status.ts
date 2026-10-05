/**
 * Lead status rules.
 *
 * WHY this exists: the LeadStatus enum carries both the agency funnel
 * (NEW -> CONTACTED -> QUALIFIED -> ...) and the academy funnel
 * (ENQUIRY -> COUNSELLING -> TRIAL -> ENROLLED_ACADEMY), and the DB default
 * is NEW. Several lead-creation paths passed the business unit straight
 * through to Prisma, so an ACADEMY lead created from a Meta Ads webhook landed
 * with status NEW — a value the academy kanban has no column for, which made
 * those leads invisible on the board.
 *
 * Centralising the rule means a new ingestion path cannot reintroduce it.
 */

import type { LeadStatus } from '@prisma/client';

/** Trim/upper-case a status coming from a request, webhook or database row. */
function normalise(status: unknown): string {
  return String(status ?? '').trim().toUpperCase();
}

function isAcademyUnit(businessUnit?: string | null): boolean {
  return normalise(businessUnit) === 'ACADEMY';
}

/** Stages that belong to the academy admissions funnel. */
const ACADEMY_STAGES = new Set<LeadStatus>([
  'ENQUIRY',
  'COUNSELLING',
  'TRIAL',
  'ENROLLED_ACADEMY',
  'DROPPED',
]);

/** Stages that belong to the agency sales funnel. */
const AGENCY_STAGES = new Set<LeadStatus>([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
  'FOLLOW_UP',
  'INTERESTED',
]);

/** Is this a known stage at all? */
export function isKnownLeadStatus(status: unknown): boolean {
  const s = normalise(status);
  return ACADEMY_STAGES.has(s as LeadStatus) || AGENCY_STAGES.has(s as LeadStatus);
}

/** Which funnel does this stage belong to? */
export function funnelForStatus(status: unknown): 'ACADEMY' | 'AGENCY' | null {
  const s = normalise(status);
  if (ACADEMY_STAGES.has(s as LeadStatus)) return 'ACADEMY';
  if (AGENCY_STAGES.has(s as LeadStatus)) return 'AGENCY';
  return null;
}

/**
 * The status a newly created lead should start in, given its business unit.
 *
 * Mirrors what the UI offers: academy enquiries begin at ENQUIRY, agency leads
 * at NEW. Use this instead of relying on the Prisma default, which is NEW for
 * every row regardless of business unit.
 */
export function defaultLeadStatus(businessUnit?: string | null): LeadStatus {
  return isAcademyUnit(businessUnit) ? 'ENQUIRY' : 'NEW';
}

/**
 * Map a status onto the stage its funnel actually uses.
 *
 * Handles the legacy rows that were written before this rule existed: an
 * ACADEMY lead sitting at NEW means the same thing as one at ENQUIRY, so it is
 * reported as ENQUIRY rather than being hidden from the board. Agency leads are
 * returned unchanged. Unknown values come back upper-cased and untouched so
 * callers can still surface them instead of discarding them.
 */
export function canonicalLeadStatus(
  status: unknown,
  businessUnit?: string | null
): string {
  const s = normalise(status);
  if (isAcademyUnit(businessUnit)) {
    if (s === 'NEW' || s === '') return 'ENQUIRY';
    return s;
  }
  if (s === 'ENQUIRY' || s === '') return 'NEW';
  return s;
}
