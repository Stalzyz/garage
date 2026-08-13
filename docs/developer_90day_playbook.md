# Developer — 90-Day Onboarding Playbook
### Version 1.0 | Internal HR & Training Document | August 2026

---

# YOUR MISSION

You are joining Grekam as a developer.

Your first 90 days are not primarily about writing code.

They are about learning how to build software that the business can depend on — delivered on time, handed over correctly, and documented so the next person can understand it.

A developer who writes great code and delivers it late, undocumented, or without communication creates more damage than a developer who writes average code and delivers reliably.

---

# YOUR 90-DAY PATH

```
FIRST 30 DAYS
Environment Setup → Codebase Learning → First Bug Fixes → Small Features
        ↓
MONTH 2
Own Feature Modules → Client Deliveries → Independent Scoping
        ↓
MONTH 3
Code Quality → Documentation → Architecture Decisions → Team Contribution
        ↓
MONTH 4+
Technical Lead → Code Reviews → System Design → Junior Mentoring
```

---

# 1. THE MOST IMPORTANT PRINCIPLE

## You are expected to unblock yourself.

When you hit a problem, the expected sequence is:

1. Read the error carefully.
2. Check the codebase for similar patterns.
3. Check the documentation.
4. Search relevant resources (docs, Stack Overflow, GitHub issues).
5. Spend a reasonable amount of time (30–60 minutes) attempting to resolve it.
6. If still blocked — bring the problem to a senior with: what you tried, what you found, and your hypothesis.

### Do not approach with:
> "It's not working."

### Approach with:
> "The [specific function] is returning [specific error] when I pass [specific input]. I checked [X] and tried [Y]. I think the issue is [Z]. Can you confirm before I proceed?"

---

# 2. THE DELIVERY STANDARD

A task is not done when the code is written.

A task is done when:

- [ ] The feature works as specified
- [ ] It has been tested on your local environment
- [ ] Edge cases have been considered and handled or documented
- [ ] The code has been reviewed (by you first, then by a peer if available)
- [ ] It is deployed to the correct environment (staging / production)
- [ ] The task in Grekam OS is updated to Completed with notes
- [ ] If client-facing — the account manager or PM has been informed

**A task marked Complete in Grekam OS means all of the above — not just "code pushed."**

---

# 3. DAYS 1–7 — ENVIRONMENT AND ORIENTATION

## Day 1–2: Setup

- [ ] Local development environment running
- [ ] Repository access confirmed
- [ ] All required credentials received
- [ ] Development, staging, and production environments understood
- [ ] Git workflow confirmed (branching, commit conventions, PR process)
- [ ] Communication channels confirmed (Slack/WhatsApp/email — which for what)

## Day 3–5: Codebase Orientation

Do not write production code this week.

Read and understand:
- Overall architecture (frontend, backend, database, infrastructure)
- Folder structure and naming conventions
- Database schema — understand the data model
- Authentication and authorization approach
- Existing API structure and patterns
- Third-party integrations already in place
- Deployment process (how code goes from local to live)
- Environment variables and configuration management

**Produce at your own pace:** A one-page architecture summary in your own words. If it is wrong, someone will correct it. If you cannot write it, you do not yet understand the system.

## Day 6–7: First Tasks

Start with:
- Bug fixes (read existing code before touching it)
- Small UI adjustments
- Documentation improvements
- Test additions

No new feature development in Week 1.

---

# 4. DAYS 8–30 — LEARN BY DOING

## Your Learning Priorities

**Week 2–3:**
- Understand every API endpoint and what it does
- Understand the database schema deeply
- Complete at least 3 bug fixes independently
- Shadow a senior developer during a project delivery

**Week 4:**
- Take ownership of a small, isolated feature
- Write the task description yourself before building
- Test it completely before marking done
- Document what you built (a brief note, not a novel)

---

# 5. THE TASK OWNERSHIP RULE

Every task you own must be:

**Specific:** You understand exactly what needs to be built.
**Scoped:** You know what is included and what is not.
**Time-estimated:** You have given a realistic estimate before starting.
**Tracked:** Its status is current in Grekam OS at all times.
**Flagged early:** If something will delay it, the PM knows before the deadline.

**The number one developer failure is silent delay.**

A developer who is stuck and says nothing until the deadline is the most expensive kind of problem.

Say this early:

> "I estimated this at 2 days. I've hit a problem with [specific thing]. I think I need one more day. I wanted to flag it now rather than on the deadline."

That is professional. That is manageable. That is what we expect.

---

# 6. COMMUNICATION RULES FOR DEVELOPERS

You are not just writing code. You are contributing to a business that has customers waiting on your output.

### What you must communicate:

- **Start of day:** What are you working on today? (In Grekam OS — task status)
- **Blockers:** Raised the moment they appear — not at end of day
- **Delays:** Communicated proactively — not when the deadline arrives
- **Completion:** Every task marked complete with a short note on what was done
- **Questions:** Come with what you tried before asking

### What you must never do:

- Push to production without informing the PM or account manager
- Make scope assumptions without confirming them
- Mark a task complete when it is not fully tested
- Work on something not in the task list without logging it first

---

# 7. THE GIT AND CODE STANDARD

### Commit Messages

Every commit message must be human-readable.

**Bad:**
```
fix stuff
wip
update
```

**Good:**
```
fix: resolve null error in order total calculation when discount is applied
feat: add GST calculation to invoice generation
refactor: extract payment validation into reusable service
```

### Branch Naming

```
feature/[feature-name]
fix/[bug-description]
hotfix/[urgent-fix]
```

### Before Pushing

- [ ] Code runs without console errors
- [ ] No hardcoded credentials or secrets
- [ ] No commented-out code blocks left in (unless with explanation)
- [ ] No unused imports or variables
- [ ] Tested on at least one browser / device

### Pull Requests

Every PR must include:
- What this does (one paragraph)
- How to test it
- Screenshots if UI-related
- Any known limitations or follow-up items

---

# 8. MONTH 2 — OWN YOUR MODULES

By Month 2, you should be independently owning full feature modules.

**What ownership means:**
- You understand the full requirement before starting
- You communicate timeline upfront
- You raise blockers early
- You test completely before saying it is done
- You update the client-facing team with status
- You document what you built

**Month 2 Deliverables:**
- At least 2 complete features delivered on time
- Zero silent delays (all delays flagged before deadline)
- All tasks accurately reflected in Grekam OS
- Able to explain any code you wrote to a colleague

---

# 9. MONTH 3 — BUILD LIKE AN ENGINEER, NOT JUST A CODER

### The Shift in Month 3

Month 1 and 2 are about delivering what is assigned.

Month 3 is about improving how things are built.

### Month 3 Responsibilities

**Code quality:**
- Identify one area of the codebase that needs refactoring
- Propose the improvement with a clear rationale
- Implement with review

**Documentation:**
- Every API you own has a readable description
- Every non-obvious piece of logic has a comment explaining why (not what)
- At least one technical decision is documented for the team

**Testing:**
- Add tests to your most critical modules
- Know which parts of the codebase have no test coverage and flag them

**Knowledge transfer:**
- Be able to onboard a new developer on the part of the codebase you own
- Record or write a brief walkthrough of your most complex module

---

# 10. THE NEVER-PROMISE LIST

You may never say to a client (directly or through sales):

| Never Say | Why |
|---|---|
| "Yes, that's easy — we can add that." | You don't know until you investigate |
| "It'll be done by [date]" without checking your current load | Overpromising creates distrust |
| "I can integrate with [third-party tool]" without checking their API | Integrations vary enormously in complexity |
| "The issue is fixed" before testing it on staging | Code that works locally may not work on the server |
| "It's almost done" | Meaningless. Give a specific date. |

---

# 11. SECURITY IS NOT OPTIONAL

From Day 1, the following are non-negotiable:

- No credentials, secrets, or API keys in the codebase (ever)
- All sensitive data uses environment variables
- No `.env` files committed to any repository
- User inputs are validated and sanitised before processing
- SQL queries use parameterised inputs — no raw string concatenation
- Authentication checks on every protected endpoint
- No production data used in local development

If you discover a security issue — report it immediately. There is no penalty for discovering a problem. There is a serious problem with hiding one.

---

# 12. YOUR DAILY OPERATING ROUTINE

### Morning
- Review tasks assigned to you in Grekam OS
- Identify what you will complete today
- Flag any tasks that are at risk before starting

### During the Day
- Update task status as you work (In Progress → Blocked → Completed)
- Commit regularly — do not work for hours without committing
- Raise blockers the moment they happen

### End of Day
- Every task in accurate status in Grekam OS
- No "In Progress" task with no update for more than 8 hours
- Tomorrow's priorities identified

---

# 13. YOUR 90-DAY SCORECARD

## Month 1 — LEARN

- [ ] Environment fully set up by Day 3
- [ ] Architecture understood and documented by Day 7
- [ ] 3+ bug fixes completed independently
- [ ] No silent delays — all blockers raised promptly
- [ ] All tasks accurately reflected in Grekam OS

## Month 2 — DELIVER

- [ ] 2+ complete features delivered on time
- [ ] Zero critical bugs in delivered code
- [ ] All PRs include proper descriptions
- [ ] Communication standard maintained consistently

## Month 3 — BUILD

- [ ] One codebase improvement proposed and implemented
- [ ] Documentation written for owned modules
- [ ] Tests written for critical paths
- [ ] Can explain your work to a new developer

---

# 14. THE FINAL TEST — MONTH 3

At the end of 90 days, you should be able to answer:

- Can I take a requirement from brief to deployed feature independently?
- Can I estimate accurately (within 20% of actual time)?
- Can I explain any code I own to a colleague?
- Can the team continue my work if I'm unavailable?
- Can I onboard a junior developer on my part of the system?

If yes to all — you are ready for the next phase.

---

# 15. YOUR OPERATING PHILOSOPHY

Ten rules for how we build at Grekam:

1. **Working code delivered on time beats perfect code delivered late.**
2. **A flagged problem is manageable. A hidden problem is a crisis.**
3. **Write code for the next developer, not just for the machine.**
4. **No task is done until it is tested, documented, and tracked.**
5. **Security is a first-class requirement, not an afterthought.**
6. **Never estimate in the moment. Think before you commit to a timeline.**
7. **Push to staging before you push to production. Always.**
8. **If something isn't in Grekam OS, it doesn't exist.**
9. **Communicate early. Communicate specifically. Never be vague.**
10. **Build systems that work without you. Document everything you know.**

---

*Document Owner: Business Development & Operations Manager / Tech Lead*
*Last Updated: August 2026*
*Version: 1.0*
