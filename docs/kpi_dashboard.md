# Grekam — KPI Dashboard Design
### What to Measure, How Often, and What to Do With It | August 2026

---

> A number without an action is noise.
> Every KPI you track must answer one of two questions:
> "Are we on track?" or "What do we need to change?"

---

# THE MEASUREMENT PRINCIPLE

Track fewer things, but track them consistently.

Do not build a dashboard with 40 metrics that nobody reads.
Build one with 12 metrics that drive decisions every week.

---

# LAYER 1 — INDIVIDUAL SALESPERSON (Daily)

Each salesperson tracks their own daily activity and reviews it with their manager weekly.

## Daily Activity Metrics

| Metric | What It Measures | Target (Per Day) |
|---|---|---|
| **New leads created** | Pipeline input | Minimum [X] |
| **Calls made** | Outreach volume | Minimum [X] |
| **WhatsApp messages sent** | Follow-up activity | Minimum [X] |
| **Follow-ups completed** | Pipeline hygiene | 100% of scheduled |
| **CRM updated** | Discipline and data quality | 100% of interactions |

## Daily Quality Metrics

| Metric | What It Measures |
|---|---|
| **Leads qualified today** | Are calls converting to real opportunities? |
| **Demos conducted** | Pipeline progress |
| **Proposals sent** | Sales momentum |
| **Deals closed** | Revenue output |
| **Collections received** | Cash conversion |

## Daily Review Template (End of Day)

```
Date:
Salesperson:

New leads:           ___
Calls made:          ___
WhatsApp messages:   ___
Leads qualified:     ___
Demos conducted:     ___
Proposals sent:      ___
Deals closed:        ___
Revenue closed:      ₹___
Collections today:   ₹___

CRM fully updated:   [ ] Yes  [ ] No
All follow-ups done: [ ] Yes  [ ] No — Reason: ___

Tomorrow's top 3:
  1.
  2.
  3.
```

---

# LAYER 2 — SALES TEAM (Weekly)

Reviewed every Monday morning by the Business Development Manager.

## Weekly Sales KPIs

| Metric | Formula / Source | Target |
|---|---|---|
| **New leads (total)** | Count of leads created last week | [X] minimum |
| **Qualification rate** | Qualified / Total new leads × 100 | Target: [X]% |
| **Demo rate** | Demos / Qualified leads × 100 | Target: [X]% |
| **Proposal conversion** | Proposals / Demos × 100 | Target: [X]% |
| **Close rate** | Closed Won / Proposals × 100 | Target: [X]% |
| **Revenue closed** | Sum of Closed Won deals | Target: ₹[X] |
| **Collections** | Cash received | Target: ₹[X] |
| **Pipeline value** | Sum of all active deal values | Review vs. target |
| **Avg deal size** | Revenue / Number of deals | Track trend |
| **Lost deals** | Count + reasons | Review patterns |

## What to Action From Weekly Review

| Signal | What It Means | Action |
|---|---|---|
| Low qualification rate | Calls not converting to real conversations | Review calling script, role-play sessions |
| High demo rate, low close rate | Demo is good, proposal or follow-up is weak | Review proposal quality and follow-up cadence |
| Pipeline growing, revenue flat | Deals not moving through pipeline | Audit stale deals — are they real? |
| Collections below closed deals | Deals closing but money not arriving | Strengthen payment process and terms |
| One salesperson consistently outperforming | Something is working | Study their process, replicate it |
| One salesperson consistently underperforming | Process or skill gap | Review call recordings, identify specific issue |

## Weekly Sales Report Template (BDM to Management)

```
WEEKLY SALES REPORT
Week of: [Date range]
Prepared by: [BDM Name]

SUMMARY
Total new leads:        ___
Qualified leads:        ___
Demos conducted:        ___
Proposals sent:         ___
Deals closed:           ___
Revenue closed:         ₹___
Collections received:   ₹___
Pipeline value (total): ₹___

BY SALESPERSON
[Name 1]: Leads ___ | Demos ___ | Closed ___ | Revenue ₹___
[Name 2]: Leads ___ | Demos ___ | Closed ___ | Revenue ₹___

LOST DEALS (THIS WEEK)
[Deal name] — Reason: ___
[Deal name] — Reason: ___

TOP ISSUES
  1.
  2.

RECOMMENDED ACTIONS
  1.
  2.

PIPELINE FORECAST (NEXT 2 WEEKS)
Expected to close: ₹___
Deals at risk: [list]
```

---

# LAYER 3 — DELIVERY AND PROJECTS (Weekly)

Reviewed weekly by the BDM / Project Manager.

## Project Health Metrics

| Metric | What It Measures |
|---|---|
| **Projects On Track** | Count of active projects with no delay risk |
| **Projects At Risk** | Count flagged for potential delay |
| **Projects Delayed** | Count past original delivery date |
| **Overdue Tasks** | Developer/designer tasks past deadline |
| **Average delivery time** | Actual days vs. promised days (per project type) |

## Project Health Dashboard (Weekly)

```
DELIVERY HEALTH — [Week of Date]

Active Projects:        ___
On Track:               ___
At Risk:                ___
Delayed:                ___

Project Detail:
┌─────────────────────┬──────────┬─────────────┬──────────┬───────────────────────┐
│ Project Name        │ Client   │ Deadline    │ Status   │ Note                  │
├─────────────────────┼──────────┼─────────────┼──────────┼───────────────────────┤
│                     │          │             │ On Track │                       │
│                     │          │             │ At Risk  │ Reason: ___           │
│                     │          │             │ Delayed  │ New date: ___         │
└─────────────────────┴──────────┴─────────────┴──────────┴───────────────────────┘

Overdue Tasks:          ___
Critical blockers:      [list any]

Client escalations open: ___
Client escalations resolved this week: ___
```

## What to Action From Delivery Review

| Signal | Action |
|---|---|
| Project moves to At Risk | Notify client immediately. Do not wait for missed deadline. |
| Same type of delay repeating | Fix the process — is it content? Design revisions? Integrations? |
| Developer missing multiple deadlines | One-on-one conversation, not public. Identify root cause. |
| Delivery time increasing over weeks | Capacity problem or scope creep — investigate |

---

# LAYER 4 — BUSINESS HEALTH (Monthly)

Reviewed by the founder / management at the start of each month.

## Monthly Business KPIs

### Revenue

| Metric | Formula |
|---|---|
| **Monthly Revenue** | Sum of all invoiced amounts |
| **Monthly Collections** | Cash actually received |
| **Outstanding Receivables** | Invoiced but not yet paid |
| **Overdue Receivables** | Past payment terms |
| **MoM Revenue Growth** | (This month − Last month) / Last month × 100 |
| **Revenue by Product** | Grafty / Atlas / Web / Grekam OS separately |

### Sales Performance

| Metric | Formula |
|---|---|
| **Total leads (month)** | Count |
| **Overall conversion rate** | Closed Won / Total Leads × 100 |
| **Average deal size** | Revenue / Deal count |
| **Sales cycle length** | Avg days from Lead Created to Closed Won |
| **Lead source performance** | Revenue / Deals by source |

### Profitability

| Metric | Formula |
|---|---|
| **Gross profit** | Revenue − Direct costs (dev, tools, hosting) |
| **Gross margin %** | Gross profit / Revenue × 100 |
| **Revenue per employee** | Revenue / Team size |
| **Customer acquisition cost** | Sales spend / New customers |

### Customer Health

| Metric | What to Track |
|---|---|
| **New customers (month)** | Count |
| **Churned customers** | Cancelled / not renewed |
| **Net customer growth** | New − Churned |
| **Retention rate** | Active customers / Total customers × 100 |
| **Upsell rate** | Customers who bought a second product |
| **Escalations (month)** | Count |
| **Resolved vs. pending** | Resolution rate |

## Monthly Management Report Template

```
MONTHLY BUSINESS REPORT
Month: [Month Year]
Prepared by: [BDM Name]

REVENUE
Total invoiced:          ₹___
Total collected:         ₹___
Outstanding:             ₹___
Overdue (>30 days):      ₹___

By product:
  Grafty:          ₹___
  Atlas:           ₹___
  Web:             ₹___
  Grekam OS:       ₹___
  Other:           ₹___

vs. Last month: +/- ₹___  ([+/- X]%)
vs. Target:     +/- ₹___

SALES
New leads:               ___
Qualified:               ___
Deals closed:            ___
Conversion rate:         ___%
Average deal size:       ₹___
Sales cycle (avg days):  ___

DELIVERY
Projects completed:      ___
On time:                 ___
Delayed:                 ___
On-time %:               ___%

CUSTOMERS
New customers:           ___
Churned:                 ___
Net growth:              ___
Total active customers:  ___
Retention rate:          ___%

PROFITABILITY (Internal)
Gross margin:            ___%
Revenue per employee:    ₹___

TOP 3 WINS THIS MONTH
  1.
  2.
  3.

TOP 3 PROBLEMS THIS MONTH
  1.
  2.
  3.

RECOMMENDED ACTIONS FOR NEXT MONTH
  1.
  2.
  3.
```

---

# THE ONE RULE ABOUT METRICS

**Never track a metric you are not prepared to act on.**

If you look at a number and it does not prompt a decision or a conversation — stop tracking it.

The purpose of measurement is not reporting. It is improvement.

When a number is below target:
1. Understand why
2. Identify what changed
3. Decide what to do differently
4. Test the change
5. Measure the result

That loop — measure, understand, decide, test, measure — is how a business actually improves.

---

*Document Owner: Business Development & Operations Manager*
*Last Updated: August 2026*
*Version: 1.0*
