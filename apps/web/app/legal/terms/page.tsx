import type { Metadata } from "next"
import LegalLayout from "../LegalLayout"
import { PolicyPageHeader, PolicySection, PolicyList, PolicyHighlight, PolicyWarning } from "../PolicyPage"

export const metadata: Metadata = {
  title: "Terms & Conditions | Grekam Visuals",
  description: "Terms and conditions governing the use of Grekam Visuals website and services.",
}

export default function TermsPage() {
  return (
    <LegalLayout>
      <PolicyPageHeader
        title="Terms & Conditions"
        subtitle="Please read these terms carefully before engaging our services. By using our website or entering into a service agreement with Grekam Visuals, you agree to be bound by these terms."
        lastUpdated="1 August 2025"
      />

      <PolicySection title="1. Acceptance of Terms">
        <p>By accessing this website or engaging Grekam Visuals (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) for any service, you (&quot;Client&quot;, &quot;you&quot;) acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, along with our Privacy Policy and any additional service-specific agreements or proposals.</p>
        <p>If you do not agree with any part of these terms, please do not use our website or services.</p>
      </PolicySection>

      <PolicySection title="2. Our Services">
        <p>Grekam Visuals provides the following services:</p>
        <PolicyList items={[
          "Web Design & Development (corporate websites, landing pages, e-commerce platforms)",
          "Brand Identity & Graphic Design (logos, brand guidelines, print and digital assets)",
          "Digital Marketing (SEO, Google Ads, Meta Ads, social media management)",
          "WhatsApp Automation & Chatbot Development",
          "Video Production & Motion Graphics",
          "Software & Web Application Development"
        ]} />
        <p>Specific deliverables, timelines, milestones, and pricing are defined in individual project proposals/quotations. These Terms govern all services unless a separate written agreement supersedes them.</p>
      </PolicySection>

      <PolicySection title="3. Client Responsibilities">
        <p>To ensure successful project delivery, the Client agrees to:</p>
        <PolicyList items={[
          "Provide accurate, complete, and timely information required for the project",
          "Supply all necessary content (text, images, logos, brand assets) within agreed timelines",
          "Provide timely feedback and approvals within the agreed review windows",
          "Ensure a designated point of contact is available for project communication",
          "Provide necessary credentials, access rights, and permissions in a timely manner",
          "Inform us promptly of any changes to project scope, budget, or timelines",
        ]} />
        <PolicyWarning>
          Delays caused by the Client's failure to meet the above responsibilities may result in revised delivery timelines and/or additional charges.
        </PolicyWarning>
      </PolicySection>

      <PolicySection title="4. Project Timelines">
        <p>Estimated timelines are provided in good faith based on information available at the time of quotation. Final timelines are mutually agreed upon in writing prior to project commencement.</p>
        <PolicyList items={[
          "Timelines commence from the date advance payment is received and all required project materials are submitted by the Client",
          "Delays caused by late content submission, delayed feedback, or scope changes will extend the timeline proportionally",
          "Grekam Visuals will communicate timeline revisions promptly in writing",
          "Force majeure events (illness, technical failures, natural disasters) may also affect timelines",
        ]} />
      </PolicySection>

      <PolicySection title="5. Revisions & Approvals">
        <p>Each project proposal specifies the number of revision rounds included. Standard inclusions unless otherwise stated:</p>
        <PolicyHighlight>
          <strong>Design projects:</strong> 2 rounds of revisions per design stage.<br />
          <strong>Development projects:</strong> 1 round of revisions post-staging review.<br />
          Additional revisions are billed at ₹2,000 per round or as specified in the proposal.
        </PolicyHighlight>
        <PolicyList items={[
          "Client approval at each milestone is required before proceeding to the next stage",
          "Once a milestone is approved, rework requested on approved elements constitutes a new revision",
          "Design changes requested after development has commenced may attract additional charges",
        ]} />
      </PolicySection>

      <PolicySection title="6. Intellectual Property">
        <p>Upon receipt of full and final payment:</p>
        <PolicyList items={[
          "The Client receives full ownership of the final delivered website, design, or application",
          "Source files are transferred as specified in the proposal (not all projects include source file delivery)",
          "Grekam Visuals retains the right to display the work in our portfolio, case studies, and marketing materials",
          "Third-party assets (stock images, premium fonts, plugins, frameworks) remain subject to their respective licenses",
        ]} />
        <PolicyWarning>
          Ownership does not transfer until full payment has been received. Work delivered during unpaid milestones remains the property of Grekam Visuals.
        </PolicyWarning>
      </PolicySection>

      <PolicySection title="7. Third-Party Services">
        <p>Projects may involve third-party tools including hosting providers, domain registrars, payment gateways, stock libraries, and marketing platforms. The Client acknowledges that:</p>
        <PolicyList items={[
          "Costs for third-party services are the Client's responsibility unless explicitly included in the project quote",
          "Grekam Visuals is not liable for third-party service outages, pricing changes, or policy modifications",
          "Client is responsible for maintaining active subscriptions for any third-party services used in their project",
        ]} />
      </PolicySection>

      <PolicySection title="8. Payment Terms">
        <p>See our <a href="/legal/payment" className="text-emerald-400 underline">Payment & Billing Policy</a> for full details. In summary:</p>
        <PolicyList items={[
          "Projects below ₹50,000: 50% advance + 50% before final delivery",
          "Projects above ₹50,000: milestone-based payments as per proposal",
          "All invoices include applicable GST",
          "Work will not commence without receipt of advance payment",
        ]} />
      </PolicySection>

      <PolicySection title="9. Cancellation & Refunds">
        <p>See our <a href="/legal/refunds" className="text-emerald-400 underline">Cancellation & Refund Policy</a> for full details. Work completed, committed resources, and third-party costs are non-refundable.</p>
      </PolicySection>

      <PolicySection title="10. Limitation of Liability">
        <p>Grekam Visuals&apos; total liability for any claim arising out of or related to our services shall not exceed the total amount paid by the Client for the specific service in dispute.</p>
        <p>We are not liable for:</p>
        <PolicyList items={[
          "Indirect, incidental, or consequential damages",
          "Loss of revenue, profit, or business opportunity",
          "Data loss caused by Client-side infrastructure failures",
          "Third-party platform outages or policy changes",
          "Marketing results (rankings, conversions, ROI) — see Digital Marketing Policy",
        ]} />
      </PolicySection>

      <PolicySection title="11. Confidentiality">
        <p>Both parties agree to maintain confidentiality of all non-public information shared during the project. Grekam Visuals will not disclose Client business information to third parties without written consent, except as required by law.</p>
      </PolicySection>

      <PolicySection title="12. Dispute Resolution">
        <p>In the event of a dispute, both parties agree to first attempt resolution through good-faith negotiation. If unresolved within 30 days:</p>
        <PolicyList items={[
          "Disputes shall be subject to mediation/arbitration before escalating to litigation",
          "Governing jurisdiction: Courts of Coimbatore, Tamil Nadu, India",
          "Governing law: Laws of India, including the Indian Contract Act, 1872",
        ]} />
      </PolicySection>

      <PolicySection title="13. Right to Modify">
        <p>Grekam Visuals reserves the right to update these Terms at any time. Changes are effective immediately upon publication on this page. Continued use of our services after changes constitutes acceptance of revised terms. For active project agreements, terms in the signed proposal/quotation take precedence.</p>
      </PolicySection>

      <PolicySection title="14. Contact">
        <p>For questions about these Terms, contact us:</p>
        <PolicyHighlight>
          <strong>Grekam Visuals</strong><br />
          Email: admin@grekam.in<br />
          Phone: +91 98431 99556<br />
          Coimbatore, Tamil Nadu, India
        </PolicyHighlight>
      </PolicySection>
    </LegalLayout>
  )
}
