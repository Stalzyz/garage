# Grekam — Escalation SOP
### Version 1.0 | Internal Operations Document | August 2026

---

> An escalation handled well builds more trust than a project that never had a problem.
> Customers do not expect perfection. They expect honesty, speed, and resolution.

---

# THE CORE RULE

**Every escalation must be owned by one person.**

When an issue arises, the first question is not "what happened?"
It is "who owns this?"

Until ownership is assigned, nothing gets resolved.

---

# SEVERITY CLASSIFICATION

Classify every escalation before responding. This determines timeline and who handles it.

| Level | Definition | Response Time | Handled By |
|---|---|---|---|
| **L1 — Routine** | General usage question or minor confusion | Within 4 hours | Support / Account Manager |
| **L2 — Service Issue** | Feature not working as expected, minor delay | Within 24 hours | Account Manager + Tech if needed |
| **L3 — Client Complaint** | Customer is frustrated, formal complaint, deadline missed | Within 4 hours | BDM + Account Manager |
| **L4 — High Risk** | Refund demand, threat to leave, major scope dispute | Immediately | BDM + Management |
| **L5 — Critical** | Legal threat, significant financial claim, public reputation risk | Immediately | Founder / Management only |

---

# STEP 1 — RECEIVE THE ESCALATION

When a customer raises a complaint through any channel:

**Do not:**
- Forward it immediately to management without investigation
- Argue or defend the company position before understanding the issue
- Make any promise about resolution before investigating
- Ignore it or delay acknowledging it

**Do:**
- Acknowledge within the response time above
- Log it in Grekam OS immediately (linked to the customer record)
- Classify it (L1 through L5)
- Assign an owner

**Immediate acknowledgement script:**

> "Hi [Name], I've received your message and I want you to know I'm looking into this personally. I'll come back to you with a proper update by [specific time]. Thank you for bringing this to my attention."

Do not offer an apology before you understand what happened. Do not offer a solution before you know what the problem is.

---

# STEP 2 — INVESTIGATE BEFORE RESPONDING

Before making any commitment or response:

### Checklist — What to Check

- [ ] Read the full customer record in Grekam OS (history, previous issues, notes)
- [ ] Review the original proposal / scope document
- [ ] Check the signed agreement or payment record
- [ ] Read all previous communication logs (WhatsApp, email, notes)
- [ ] Check project status in Grekam OS
- [ ] Speak to the responsible developer / designer / account manager
- [ ] Understand exactly what was promised vs. what was delivered
- [ ] Identify who is responsible for the gap (us / client / third party)

### Categorise the Issue

After investigation, classify the root cause:

| Category | Definition |
|---|---|
| **Training issue** | Customer doesn't know how to use the product correctly |
| **Support issue** | A technical problem that can be fixed |
| **Product issue** | A bug or missing feature in our product |
| **Scope issue** | Customer expected something not in the agreed scope |
| **Delivery issue** | We committed to a deadline and missed it |
| **Communication issue** | A misunderstanding between what was said and what was understood |
| **Customer error** | Customer did something incorrectly (handle with care — never blame the customer directly) |
| **Third-party issue** | A payment gateway, hosting provider, or Meta caused the problem |

---

# STEP 3 — FORMULATE THE RESPONSE

Once you understand the issue, prepare your response before contacting the customer.

### Response Framework

Answer these five questions before calling or messaging the customer:

1. **What happened?** (From the customer's perspective — neutral, not defensive)
2. **Why did it happen?** (Root cause — honest assessment)
3. **What have we done so far?** (Or what are we doing right now)
4. **What is our proposed resolution?**
5. **What is the timeline for resolution?**

Do not communicate until you can answer all five.

---

# STEP 4 — RESPONSE BY ISSUE TYPE

---

## Training Issue

**Situation:** Customer is frustrated because the product is not working the way they expected — but the product is working correctly.

**Approach:**
> "I've reviewed your account and I can see the issue. This is actually a settings configuration that we can adjust together. Can we schedule a 20-minute call and I'll walk you through it? We'll also send you a quick reference guide so this doesn't happen again."

**Do not say:** "You're using it wrong." Say: "Let me show you the easier way."

**Resolution:** Remote session, follow-up documentation, check-in 48 hours later.

---

## Service / Technical Issue

**Situation:** A feature is not functioning as expected. A bug exists.

**Approach:**
> "I've confirmed the issue on our end. Our technical team is looking into it now. I'll update you by [specific time] with either a fix or a timeline. I appreciate your patience."

**What you must do:**
- Create a technical task in Grekam OS with Priority: Urgent
- Assign to the responsible developer
- Set a resolution deadline
- Update the customer at every milestone, even if just to say "still working on it"

**Resolution:** Fix deployed + confirmation to customer + check that the fix works for them.

---

## Delivery Issue (We Missed a Deadline)

**Situation:** We committed to a delivery date and did not meet it.

**This requires an immediate proactive call — do not wait for the customer to complain.**

Script:
> "[Name], I need to update you on [Project]. We had committed to [original date]. We're not going to hit that date, and I want to tell you directly before it arrives. The reason is [honest, specific explanation]. We are [specific action being taken]. Our new confirmed date is [date]. I take responsibility for this delay and I want to make sure we manage the rest of the project to your satisfaction."

**What you must never do:**
- Say "it's almost done" when it is not
- Blame the development team to the customer
- Miss the new committed date without another proactive call

**Resolution:** New confirmed date + delivery + post-delivery check-in + note in customer record explaining what caused the delay and what was changed to prevent recurrence.

---

## Scope Dispute

**Situation:** Customer expects a feature or deliverable that was not in the agreed scope.

**This is the most delicate situation. Handle carefully.**

**First — determine the truth:**
Was it in the proposal? Was it discussed verbally? Was it in the handoff form?

If it was verbally promised by sales but not documented — the company likely needs to honour it. This is a sales handoff failure.

If it was not discussed and is genuinely out of scope — handle this script:

> "[Name], I've reviewed the original proposal and the project brief from our kick-off call. [Feature X] wasn't included in the agreed scope — I want to be transparent about that so we can find the right way forward together. I have two options for you: we can either include [X] as an addition with a separate agreement, or I can suggest an alternative approach that works within what we've already agreed. Which would you prefer to discuss?"

**Never say:** "That was never in scope." It sounds accusatory.
**Always say:** "Looking at what we agreed, here is what I see..." and then offer a way forward.

**If it was a sales promise that wasn't documented:**
- Honour the commitment to protect the customer relationship
- Internally, document this as a sales handoff failure
- Use it to reinforce the handoff SOP for future deals

---

## Refund Request

**Situation:** Customer demands a full or partial refund.

**Do not:**
- Agree to a refund in the heat of the moment
- Refuse outright without investigating
- Make the customer feel like a problem

**Do:**
- Acknowledge: "I hear you and I take this seriously."
- Investigate: Read the full history before responding
- Classify: Is this a legitimate complaint? A scope misunderstanding? Buyer's remorse?

**Escalate to management (L4) before any refund decision.**

**Response while investigating:**
> "[Name], I want to make sure I handle this properly. Give me until [specific time] to review the full situation and come back to you with a proper response. I'm taking this seriously."

**After management review — response options:**

*Full refund (if we clearly failed):*
> "We accept full responsibility for what happened. We'd like to refund [amount] and we're committed to understanding what went wrong so it doesn't happen again."

*Partial resolution (if shared responsibility):*
> "After reviewing the situation, I'd like to propose [specific offer — partial refund / additional work / extension]. I believe this is fair given [reason]. What are your thoughts?"

*Refund declined (if scope was delivered):*
> "I've reviewed everything carefully. The work delivered matches what we agreed in [proposal date]. I understand your frustration and I want to find a way forward — but I'm not in a position to offer a refund for work that was completed as agreed. What I can offer is [alternative resolution]."

All refund decisions must be documented in the customer record with the reason and management approval noted.

---

## Threat of Legal Action

**Situation:** Customer uses language like "I'll take legal action," "I'm going to post this publicly," or "I'll report you."

**Immediate action — STOP and escalate to Founder/Management (L5).**

Do not:
- Argue or get emotional
- Make any admission of fault
- Offer anything without management approval
- Continue the conversation without management

Say:
> "I understand you feel strongly about this. I need to involve our senior management in this conversation to make sure we handle it appropriately. I'll come back to you within [X hours] with a response from the right person."

Then escalate immediately with:
- Full customer history
- The specific complaint
- All relevant documentation
- Your assessment of the situation

---

# STEP 5 — RESOLUTION AND DOCUMENTATION

After every escalation is resolved:

### Immediate Actions
- Confirm resolution with the customer in writing
- Update the customer record in Grekam OS with full escalation log
- Mark the escalation task as Resolved with notes

### Escalation Log Entry Template

```
Escalation Date: 
Customer: 
Severity: [L1 / L2 / L3 / L4 / L5]
Issue Category: [Training / Technical / Delivery / Scope / Refund / Legal]
What the customer reported:
Root cause identified:
How it was resolved:
Timeline (reported → acknowledged → resolved):
Was the resolution satisfactory to the customer? [Yes / No / Partial]
What could have prevented this?
Process change required? [Yes — action taken: ___ / No]
Resolved by:
Approved by (if L4/L5):
```

### Post-Resolution Follow-Up

48 hours after resolution, contact the customer:

> "[Name], I wanted to follow up and make sure everything is working well after we resolved [issue]. Is there anything else I can help with?"

This single touchpoint converts frustrated customers into loyal ones more reliably than any other action.

---

# THE ESCALATION MATRIX (QUICK REFERENCE)

| Situation | Owner | Timeline | Management Required? |
|---|---|---|---|
| Customer doesn't know how to use the product | Support / AM | 4 hours | No |
| Minor technical bug | Tech + AM | 24 hours | No |
| Feature not working | Tech + BDM | 4 hours | Only if not fixed in 24h |
| Deadline missed — small delay | BDM + PM | Immediate proactive call | Inform only |
| Deadline missed — major delay | BDM + Management | Immediate | Yes |
| Scope dispute — minor | BDM | 24 hours | Inform after resolution |
| Scope dispute — major | BDM + Management | Immediate | Yes |
| Refund request — any amount | BDM | Acknowledge in 2h, decide in 24h | Yes — always |
| Verbal threat of legal action | Founder | Immediately | Yes — founder handles |
| Public complaint or review | Founder | Within 2 hours | Yes — founder handles |
| Payment dispute with bank/gateway | Finance + Management | Immediately | Yes |

---

# WHAT GOOD ESCALATION MANAGEMENT LOOKS LIKE

A customer who complained and was handled well says:

> "I had an issue and they sorted it out quickly. They were honest about what happened and they followed up to make sure I was happy. I'd work with them again."

A customer who complained and was handled poorly says:

> "Nobody took responsibility. They kept passing it around. I had to follow up multiple times. I'll never use them again."

The difference is not always the outcome.

**It is the ownership, the honesty, and the follow-through.**

---

*Document Owner: Business Development & Operations Manager*
*Last Updated: August 2026*
*Version: 1.0*
