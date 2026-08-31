import type { Metadata } from "next"
import LegalLayout from "../LegalLayout"
import { PolicyPageHeader, PolicySection, PolicyList, PolicyHighlight, PolicyWarning } from "../PolicyPage"

export const metadata: Metadata = {
  title: "Revision & Scope Policy | Grekam Visuals",
  description: "What counts as a revision, how many are included, and how scope changes are handled at Grekam Visuals.",
}

export default function RevisionsPage() {
  return (
    <LegalLayout>
      <PolicyPageHeader
        title="Revision & Scope Policy"
        subtitle="Clear boundaries around what's included in your project, how revisions work, and what constitutes additional work — protecting both your investment and our team's time."
        lastUpdated="1 August 2025"
      />

      <PolicySection title="1. Standard Revision Inclusions">
        <PolicyHighlight>
          Unless otherwise specified in the project proposal:<br /><br />
          <strong>Logo & Brand Design:</strong> 2 initial concepts + 2 rounds of revisions<br />
          <strong>Web Design (UI):</strong> 2 rounds of revisions per page/screen design<br />
          <strong>Web Development:</strong> 1 round of revisions post-staging review<br />
          <strong>Marketing Creatives:</strong> 1 round of revisions per creative set<br />
          <strong>Video Editing:</strong> 1 round of revisions on the cut
        </PolicyHighlight>
        <p>Revision inclusions are specified per project in the proposal. When in doubt, the proposal document takes precedence.</p>
      </PolicySection>

      <PolicySection title="2. What Counts as a Revision">
        <p>A revision is a reasonable modification to an already-presented concept based on your feedback. Revisions include:</p>
        <PolicyList items={[
          "Adjusting colours, fonts, or layout within the agreed style direction",
          "Amending copy or content within the same section",
          "Resizing or repositioning design elements",
          "Minor spacing, alignment, or padding adjustments",
          "Correcting factual errors in content",
        ]} />
      </PolicySection>

      <PolicySection title="3. What Does NOT Count as a Revision">
        <PolicyWarning>
          The following are considered new work or scope changes, not revisions, and are billed separately:
        </PolicyWarning>
        <PolicyList items={[
          "Requesting a completely new design direction after a concept has been approved",
          "Adding new pages, sections, or features not included in the original scope",
          "Changing the core structure or navigation of a website after development has commenced",
          "Introducing new branding or style guidelines mid-project",
          "Requesting additional functionality (forms, integrations, animations) not in the brief",
          "Complete content overhauls after the design has been approved",
          "Requesting work from a previously rejected concept",
        ]} />
      </PolicySection>

      <PolicySection title="4. Additional Revision Rounds">
        <PolicyList items={[
          "Additional revision rounds beyond the included quota: ₹2,000 per round",
          "All additional revision requests must be submitted together in a single document — separate rounds of piecemeal feedback are not efficient and will be counted individually",
          "Additional revision requests must be approved and paid before work commences",
        ]} />
      </PolicySection>

      <PolicySection title="5. Scope Changes & Change Requests">
        <PolicyList items={[
          "All scope change requests must be submitted in writing via email",
          "We will provide a revised quote and timeline impact assessment within 2–3 business days",
          "Scope changes are formally approved via a written addendum to the original proposal",
          "Work on scope changes commences only after written approval and any required advance payment",
        ]} />
        <PolicyHighlight>
          We encourage clients to provide comprehensive briefs upfront. The more detail you provide at the start, the fewer scope change requests arise mid-project.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="6. Revision Turnaround Time">
        <PolicyList items={[
          "Standard revision turnaround: 2–5 business days depending on complexity",
          "Urgent revisions (within 24 hours): 30% rush premium on revision charge",
          "Revision turnaround time does not guarantee same-day responses — please plan review cycles accordingly",
        ]} />
      </PolicySection>

      <PolicySection title="7. Design Approval & Lock-In">
        <PolicyList items={[
          "Once a design stage is formally approved in writing, changes to that stage are treated as new work",
          "We recommend thorough review before approval — involve all stakeholders before signing off",
          "Partial approvals are not accepted — each stage must be fully approved or fully revised",
        ]} />
      </PolicySection>

      <PolicySection title="8. Additional Page Charges">
        <PolicyList items={[
          "Additional inner pages (simple content page): from ₹2,000",
          "Additional landing page: from ₹8,000",
          "Additional advanced/interactive page: from ₹20,000",
          "Prices vary based on complexity and content requirements",
        ]} />
      </PolicySection>
    </LegalLayout>
  )
}
