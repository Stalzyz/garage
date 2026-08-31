import type { Metadata } from "next"
import LegalLayout from "../LegalLayout"
import { PolicyPageHeader, PolicySection, PolicyList, PolicyHighlight, PolicyWarning } from "../PolicyPage"

export const metadata: Metadata = {
  title: "Payment & Billing Policy | Grekam Visuals",
  description: "Payment terms, billing methods, GST, milestones and invoice policy for Grekam Visuals.",
}

export default function PaymentPage() {
  return (
    <LegalLayout>
      <PolicyPageHeader
        title="Payment & Billing Policy"
        subtitle="This policy outlines our payment terms, accepted methods, billing practices, and milestone payment structure for all Grekam Visuals projects and services."
        lastUpdated="1 August 2025"
      />

      <PolicySection title="1. Accepted Payment Methods">
        <PolicyList items={[
          "Bank Transfer (NEFT / RTGS / IMPS) — preferred for large transactions",
          "UPI (GPay, PhonePe, Paytm, BHIM) — for amounts up to ₹1,00,000",
          "Razorpay payment link (Cards, Net Banking, UPI, EMI)",
          "Cheque (subject to clearance — work commences after cheque is cleared)",
        ]} />
        <PolicyHighlight>
          All payments must be made in Indian Rupees (INR) unless a separate currency arrangement is agreed in writing.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="2. Payment Structure">
        <p><strong className="text-white/80">Standard Payment Milestones:</strong></p>
        <PolicyHighlight>
          <strong>Projects below ₹50,000:</strong><br />
          — 50% advance before work begins<br />
          — 50% before final delivery / handover<br /><br />
          <strong>Projects above ₹50,000:</strong><br />
          — Milestone-based payments as specified in the project proposal<br />
          — Typically: 40% advance → 30% mid-project → 30% before delivery
        </PolicyHighlight>
        <p>Specific payment milestones are defined in each project proposal or quotation. The proposal terms take precedence over these general guidelines.</p>
      </PolicySection>

      <PolicySection title="3. Advance Payment Requirement">
        <PolicyList items={[
          "Work will NOT commence until the agreed advance payment is received and confirmed",
          "Project kickoff calls and design briefings are scheduled only after advance clearance",
          "In the case of bank transfers, payment confirmation (screenshot/UTR reference) may be accepted to begin planning — full clearance required before delivery of any files",
        ]} />
        <PolicyWarning>
          Booking slots or project timelines cannot be reserved without advance payment. Delayed advance payments may push your project start date.
        </PolicyWarning>
      </PolicySection>

      <PolicySection title="4. GST & Taxes">
        <PolicyList items={[
          "Grekam Visuals is registered under GST. Applicable GST (18%) will be added to all invoices",
          "Clients requiring a GST invoice must provide their GSTIN at the time of quotation",
          "GST invoices are issued for all transactions above ₹50,000 automatically",
          "TDS deductions (if applicable) — please share TDS certificates within the same financial year",
        ]} />
      </PolicySection>

      <PolicySection title="5. Invoice Generation">
        <PolicyList items={[
          "Invoices are generated at the start of each payment milestone and sent to the registered email",
          "Invoice due date is 7 days from the date of issue unless otherwise specified",
          "Invoices include project details, milestone description, amount, GST, and payment instructions",
        ]} />
      </PolicySection>

      <PolicySection title="6. Late Payment">
        <PolicyList items={[
          "Work delivery, file handover, or project progression will be paused if payment is overdue by more than 7 days",
          "A late payment fee of 2% per month may be applied to outstanding balances beyond 30 days",
          "Hosting, domain, or third-party services cannot be renewed on behalf of the Client during payment disputes",
        ]} />
      </PolicySection>

      <PolicySection title="7. Additional Work Charges">
        <PolicyList items={[
          "Work outside the agreed project scope is billed at ₹1,500–₹3,000/hour based on complexity",
          "Additional pages beyond the agreed scope: from ₹2,000 per page",
          "Rush/urgent delivery (within 48 hours): 30–50% premium on quoted price",
          "All additional work requires written approval before commencement",
        ]} />
      </PolicySection>

      <PolicySection title="8. Third-Party Expenses">
        <p>Third-party costs are NOT included in our design/development fees unless explicitly stated in the proposal:</p>
        <PolicyList items={[
          "Domain registration and renewal",
          "Web hosting and server costs",
          "Premium plugins, themes, or software licences",
          "Stock photography and video licensing",
          "Google Ads, Meta Ads, or other advertising budgets",
          "SMS / WhatsApp API usage charges",
          "SSL certificates (if not bundled with hosting)",
        ]} />
      </PolicySection>

      <PolicySection title="9. Payment Confirmation">
        <PolicyList items={[
          "Share payment confirmation (screenshot or UTR/transaction reference) to admin@grekam.in",
          "Please use your name and project reference in the payment remarks/description",
          "Official receipt is issued within 24 business hours of confirmed payment",
        ]} />
        <PolicyHighlight>
          Bank details and UPI IDs are shared on invoice documents only. Do not make payments to unverified numbers or accounts. Verify with us directly if in doubt.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="10. Contact for Billing">
        <PolicyHighlight>
          For billing queries: admin@grekam.in | +91 98431 99556<br />
          Grekam Visuals, Coimbatore, Tamil Nadu, India
        </PolicyHighlight>
      </PolicySection>
    </LegalLayout>
  )
}
