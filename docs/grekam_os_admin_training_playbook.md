# Grekam OS (Garage Admin) Master Staff Training Playbook
### The Complete Operational Guide & Hands-On Training Tasks

Welcome to the definitive **Grekam OS Garage Admin Dashboard Training Playbook**. This consolidated manual is designed to get operations, administrative, and management team members fully comfortable handling workflows on our platform. 

---

## 🗺️ Module Overview Index
Use this checklist to track your progress:
- [ ] **CRM & Sales** (Leads, Contacts, Proposals, Dialer, Calls)
- [ ] **Products Catalog** (Agency Services, Subscriptions)
- [ ] **Project Management** (Projects, Tasks, Shared Assets)
- [ ] **Drive** (Asset Storage & File Management)
- [ ] **Finance** (Invoices, Estimates, Expenses, PnL, Taxes, Vendors)
- [ ] **Marketing** (Prospects, Campaigns, Scheduler, Email, Marketing Calendar)
- [ ] **Automations** (Flows & Webhook Triggers)
- [ ] **Recruitment & HR** (ATS, Onboarding, Leaves, Payroll, Attendance, Commissions)
- [ ] **ESS** (Employee Self-Service Portal)
- [ ] **CMS & Academy** (Agency Editor, Courses, Events, Placements, Portfolio)
- [ ] **Customer Support** (Tickets desk, KB, Chat)
- [ ] **Settings** (Integrations, Audit Logs, Roles, Email Templates)

---

## 🏁 PART 1: Core Operations Warm-ups

### Task 1: Onboard a New Lead and Schedule a Video Consultation
* **Objective:** Learn CRM registration, lead pipelines, and scheduling meetings.
* **Steps:**
  1. Go to **CRM** in the sidebar. Click **Add Lead**.
  2. Fill out the details:
     * *Name:* Test E-commerce Client
     * *Email:* testclient@grekam.in
     * *Phone:* +91 99999 88888
     * *Company:* Trendz Retail India
     * *Estimated Value:* ₹65,000
  3. Locate the lead card in the **Lead** column of the Kanban Board. Drag it to **Negotiation**.
  4. Click the **Calendar (Schedule Meeting)** icon on their card:
     * Select **Meeting** as the Activity Type.
     * Title: *"E-commerce Project Briefing"*.
     * Pick a time slot for tomorrow.
     * Click **Save**.
* **Verification:** Open the lead's card and confirm the scheduled meeting is logged in the Activity History.

### Task 2: Create a Milestone Client Invoice
* **Objective:** Learn invoicing, GST tax calculation, and payment registration.
* **Steps:**
  1. Navigate to **Finance → Invoices**. Click **New Invoice**.
  2. Select **Trendz Retail India** as the client.
  3. Add a line item:
     * *Item:* E-commerce UI/UX Design Stage (Milestone 1)
     * *Amount:* ₹32,500
     * *Tax Rate:* Select **18% GST**
  4. Save the invoice as a **Draft**, double-check the totals, and update the status to **Sent**.
  5. Once paid, open the invoice, click **Record Payment**, and enter the full payment amount.
* **Verification:** Navigate to **Finance → Revenue** and confirm the recorded payment is reflected in your graphs.

### Task 3: Add a Team Member and Apply Leave
* **Objective:** Learn directory configuration, leaf policy tracking, and approval flows.
* **Steps:**
  1. Navigate to **HR → Team Hub**. Click **Add Employee**:
     * *Name:* Aarav Kumar
     * *Email:* aarav@grekam.in
     * *Role:* Designer | Department: Design & Creative
  2. Go to **HR → Leaves**. Click **Apply Leave** on Aarav's behalf:
     * *Type:* Casual Leave
     * *Duration:* 2 Days (Pick dates next week)
     * *Reason:* Personal work
  3. Find the pending request in the list and click **Approve**.
* **Verification:** Open **HR → Attendance** calendar and confirm Aarav's leaves display as approved absence blocks.

---

## 🔄 PART 2: Full-Module End-to-End Business Cycles

### Cycle A: The Client Acquisition & Project Kickoff Cycle
* **Objective:** See how Sales, Products, Proposals, Projects, Tasks, and File storage tie together.
* **Steps:**
  1. **Check Pricing Catalog (`Products`):** Go to **Products** and verify "Full Brand Identity Layout" exists with the correct standard pricing (₹20,000). Add it if it's missing.
  2. **Create Lead (`CRM`):** Go to **CRM → Leads** and add *Vanguard Retail India* (contact Rajesh Nair, rajesh@vanguard.in, ₹20,000).
  3. **Build Proposal (`CRM → Proposals`):** Go to **CRM → Proposals → New Proposal**. Link the lead, add the "Full Brand Identity Layout" product, and specify 50% advance / 50% on approval milestones. Save and send.
  4. **Launch Project (`Projects`):** Go to **Projects** and click **Create Project**. Name it *"Vanguard Brand Identity Redesign"*, link it to the client, and set a 3-week timeline.
  5. **Assign Checklist (`Tasks`):** Inside the project, go to the **Tasks** tab. Add:
     * *"Design Briefing Questionnaire Setup"* (High Priority)
     * *"Initial Moodboards & Style Scapes Design"* (Medium Priority)
  6. **Shared Files Folder (`Drive`):** Go to **Drive**, create a folder `Vanguard Shared Assets`, and upload a briefing template.

### Cycle B: Recruitment, Onboarding & Salaries
* **Objective:** Practice the HR hiring journey from application to monthly payroll generation.
* **Steps:**
  1. **Review Candidate (`HR → ATS`):** Open **HR → ATS**. Find the *Junior Creative Designer* job opening. Add a candidate profile, log evaluation notes, and move them from *Applied* to *Offered*.
  2. **Run Onboarding (`HR → Onboarding`):** Go to **HR → Onboarding**, create a checklist for the candidate, and assign standard IT setup tasks.
  3. **Check ESS Portal (`ESS`):** Log into **ESS** and apply for a mock training leave day next week.
  4. **Generate Payroll (`HR → Payroll`):** Go to **HR → Payroll** and run the monthly payslip generation for the team. Verify salary allocations, deductions, and final payouts.

---

## ⚡ PART 3: Advanced Operations Tasks

### Task 4: Set Up Recurring Retainer Billing (Finance & Products)
* **Steps:**
  1. Go to **Products → Add Product**. Create a service: *Monthly Brand Retainer* (₹15,000/month).
  2. Go to **Finance → Invoices**. Create an invoice linked to this product.
  3. Toggle frequency to **Recurring (Monthly)**, set start date, and save the profile.

### Task 5: Subcontractor Billing and TDS Deductions (Vendors & Finance)
* **Steps:**
  1. Go to **Vendors** and add: *Creative Motion Studios*.
  2. Go to **Finance → Expenses** and click **New Bill**.
  3. Enter *₹40,000*, set category to *Subcontractor Fees*.
  4. Apply **TDS Deduction (Section 194J - Professional Services @ 10%)** to deduct ₹4,000. 
  5. Verify net payable is ₹36,000 and save the bill.

### Task 6: Design a Proposal Template using the Interactive Builder (CRM & Builder)
* **Steps:**
  1. Go to **CRM → Proposals → Proposal Templates**. Click **Create Template**.
  2. Name it *Premium Web Design Proposal*.
  3. Drag and drop modules: Header, Scope of Work text block, Timeline Grid, and Milestone Payment Table. Save and exit.

### Task 7: Manage System Configurations & Roles (Settings & Integrations)
* **Steps:**
  1. Go to **Settings → Roles & Permissions**.
  2. Create a custom role: *Sales Intern*. 
  3. Set permissions: *CRM Leads - Read Only*, *Finance - No Access*, *HR - No Access*. Save.
  4. Go to **Settings → Audit Logs** to review the exact history logs of the roles and changes you've set up today.
