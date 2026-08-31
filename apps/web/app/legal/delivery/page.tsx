import type { Metadata } from "next"
import LegalLayout from "../LegalLayout"
import { PolicyPageHeader, PolicySection, PolicyList, PolicyHighlight, PolicyWarning } from "../PolicyPage"

export const metadata: Metadata = {
  title: "Service Delivery Policy | Grekam Visuals",
  description: "How Grekam Visuals delivers projects, handles timelines, content requirements, and final handover.",
}

export default function DeliveryPage() {
  return (
    <LegalLayout>
      <PolicyPageHeader
        title="Service Delivery Policy"
        subtitle="This policy defines how we deliver projects, what we need from you, how timelines work, and what the final handover process looks like."
        lastUpdated="1 August 2025"
      />

      <PolicySection title="1. Project Commencement">
        <p>A project officially commences when all of the following are in place:</p>
        <PolicyList items={[
          "Advance payment has been received and confirmed",
          "Signed project proposal or formal written confirmation of scope",
          "Initial project brief completed or kickoff call completed",
          "All required access credentials have been shared (if applicable)",
        ]} />
        <PolicyHighlight>
          The project timeline clock starts from the date all commencement conditions are met — not from the date of the initial enquiry or proposal.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="2. Estimated Timelines">
        <p>Indicative timelines for common services:</p>
        <PolicyList items={[
          "Logo & Brand Identity: 7–14 business days",
          "Starter Website (5–6 pages): 14–21 business days",
          "Business Website (8–12 pages): 21–35 business days",
          "E-commerce Website: 30–60 business days depending on product count and complexity",
          "Landing Page: 5–10 business days",
          "Web Application (custom software): Timeline quoted individually",
          "Video Production: Timeline discussed at briefing",
        ]} />
        <p>These are estimates only. Final timelines are specified in the project proposal.</p>
      </PolicySection>

      <PolicySection title="3. Client Dependencies">
        <p>Timely project delivery depends on the Client providing the following without undue delay:</p>
        <PolicyList items={[
          "All website content (text, images, videos, documents)",
          "Brand assets (existing logo files in vector format, brand colours, fonts)",
          "Access credentials (hosting, domain, CMS, existing website backend)",
          "Timely feedback within the agreed review window (typically 48–72 business hours)",
          "Approval sign-offs at each project milestone",
          "Payments at each billing milestone",
        ]} />
        <PolicyWarning>
          If the Client fails to provide required materials within 14 days of a request, Grekam Visuals reserves the right to use placeholder content, adjust timelines, or pause the project.
        </PolicyWarning>
      </PolicySection>

      <PolicySection title="4. Review & Approval Windows">
        <PolicyList items={[
          "Client has 48–72 business hours to review and provide feedback on each deliverable",
          "If no feedback is received within 5 business days, the deliverable is considered approved and the project proceeds",
          "Approvals must be communicated in writing (email or project management tool)",
          "Verbal approvals are not binding — written confirmation is required",
        ]} />
      </PolicySection>

      <PolicySection title="5. Delays Caused by Client">
        <p>The following actions by the Client will result in timeline revision:</p>
        <PolicyList items={[
          "Late submission of required content or assets",
          "Delayed feedback beyond the agreed review window",
          "Scope changes after the project has commenced",
          "Delayed or missing milestone payments",
          "Repeated unavailability of the designated point of contact",
        ]} />
        <PolicyHighlight>
          For every 7 calendar days of Client-caused delay, the project deadline may be extended by an equivalent period. Significant delays may require a revised project schedule to be agreed in writing.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="6. Scope Changes">
        <PolicyList items={[
          "Any additions or changes to the agreed scope must be submitted in writing",
          "Scope changes are assessed for time and cost impact before approval",
          "Agreed scope changes are documented as addendums to the original proposal",
          "We reserve the right to decline scope changes that fundamentally alter the nature of the project",
        ]} />
      </PolicySection>

      <PolicySection title="7. Delivery Method">
        <PolicyList items={[
          "Website projects are delivered via staging environment for review before going live",
          "Design files are delivered via cloud link (Google Drive, WeTransfer, or similar)",
          "Source files are included only if explicitly specified in the proposal",
          "Final website files are transferred via FTP, hosting panel access, or Git repository",
          "Access credentials for delivered systems are shared only after full payment is received",
        ]} />
      </PolicySection>

      <PolicySection title="8. Final Handover">
        <p>At project completion, the Client receives:</p>
        <PolicyList items={[
          "Live website / deployed application",
          "Agreed design files and assets",
          "Source files (if included in proposal)",
          "Login credentials for CMS, admin panels, and hosting (if applicable)",
          "Basic usage documentation or walkthrough video (where applicable)",
          "30-day post-delivery bug support (see Maintenance Policy for extended support)",
        ]} />
        <PolicyHighlight>
          Final handover is initiated only after the final payment is received and cleared.
        </PolicyHighlight>
      </PolicySection>
    </LegalLayout>
  )
}
