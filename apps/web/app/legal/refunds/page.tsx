import type { Metadata } from "next"
import LegalLayout from "../LegalLayout"
import { PolicyPageHeader, PolicySection, PolicyList, PolicyHighlight, PolicyWarning } from "../PolicyPage"

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Grekam Visuals",
  description: "Cancellation and refund terms for Grekam Visuals services.",
}

export default function RefundsPage() {
  return (
    <LegalLayout>
      <PolicyPageHeader
        title="Cancellation & Refund Policy"
        subtitle="We understand that circumstances change. This policy explains how project cancellations are handled and what refunds, if any, are applicable."
        lastUpdated="1 August 2025"
      />

      <PolicyWarning>
        Digital creative services differ fundamentally from physical product purchases. Time, expertise, and resources are committed the moment work begins. Please review this policy carefully before engaging our services.
      </PolicyWarning>

      <PolicySection title="1. Cancellation Before Work Begins">
        <PolicyHighlight>
          If you cancel the project before any work has commenced (i.e., before the kickoff call or design briefing) and within 48 hours of advance payment, a refund of up to 80% of the advance may be considered, subject to any administrative/processing charges.
        </PolicyHighlight>
        <PolicyList items={[
          "Cancellation request must be submitted in writing to admin@grekam.in",
          "Processing charges and payment gateway fees are non-refundable",
          "Refunds are processed within 7–14 business days",
        ]} />
      </PolicySection>

      <PolicySection title="2. Cancellation After Work Has Begun">
        <p>Once project work has commenced, refunds are calculated based on work completed:</p>
        <PolicyList items={[
          "Work completed up to the point of cancellation will be charged at the agreed project rate (pro-rated)",
          "Advance payments will be adjusted against the value of work delivered",
          "Any outstanding amount (if work value exceeds advance) must be settled before file handover",
          "Files and deliverables for paid and completed milestones will be shared; unpaid milestone work remains with Grekam Visuals",
        ]} />
        <PolicyWarning>
          Strategy, planning, research, design concepting, and internal review cycles are billable even if no visual output has been formally shared with you.
        </PolicyWarning>
      </PolicySection>

      <PolicySection title="3. Completed Milestones">
        <p>Payments for completed and approved milestones are non-refundable, regardless of the reason for cancellation. This includes:</p>
        <PolicyList items={[
          "Approved logo or brand design concepts",
          "Completed and approved web design mockups",
          "Developed and staged website pages",
          "Published content or live campaigns",
          "Completed video productions or edited footage",
        ]} />
      </PolicySection>

      <PolicySection title="4. Third-Party & Committed Costs">
        <PolicyList items={[
          "Domain registrations, hosting setup fees, premium plugin purchases, and stock asset licenses made on your behalf are non-refundable",
          "Advertising budgets (Google Ads, Meta Ads) spent on campaigns are non-refundable — ad spend is governed by platform policies",
          "WhatsApp API credits or SMS gateway charges are non-refundable once consumed",
        ]} />
      </PolicySection>

      <PolicySection title="5. Monthly Retainer & Subscription Cancellations">
        <PolicyList items={[
          "Monthly retainer services (SEO, social media, maintenance) can be cancelled with 30 days written notice",
          "Current month billing is non-refundable once the service period has begun",
          "Setup fees for retainer services are non-refundable",
          "Annual subscription packages cancelled mid-year: refund calculated on unused months minus a 15% administration charge",
        ]} />
      </PolicySection>

      <PolicySection title="6. Project Pause & Resumption">
        <PolicyHighlight>
          If a project is paused by the Client for more than 60 days, it may be deprioritised. Resumption is subject to team availability and may incur a re-engagement fee of 10–20% of the remaining project value.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="7. Refund Processing">
        <PolicyList items={[
          "All refunds are processed to the original payment method",
          "Refund processing time: 7–14 business days after approval",
          "Bank transfer refunds may take additional time based on banking processes",
          "Refunds are subject to deduction of actual payment gateway/transaction charges",
        ]} />
      </PolicySection>

      <PolicySection title="8. How to Request Cancellation">
        <PolicyHighlight>
          Submit your cancellation request in writing to admin@grekam.in with:<br />
          — Your name and project reference number<br />
          — Reason for cancellation<br />
          — Preferred refund method and bank details (if applicable)<br /><br />
          We will acknowledge within 2 business days and provide a cancellation settlement statement.
        </PolicyHighlight>
      </PolicySection>
    </LegalLayout>
  )
}
