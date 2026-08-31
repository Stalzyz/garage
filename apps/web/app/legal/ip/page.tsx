import type { Metadata } from "next"
import LegalLayout from "../LegalLayout"
import { PolicyPageHeader, PolicySection, PolicyList, PolicyHighlight, PolicyWarning } from "../PolicyPage"

export const metadata: Metadata = {
  title: "Intellectual Property Policy | Grekam Visuals",
  description: "Ownership of designs, source code, assets, and when rights transfer to the client at Grekam Visuals.",
}

export default function IPPage() {
  return (
    <LegalLayout>
      <PolicyPageHeader
        title="Intellectual Property & Copyright Policy"
        subtitle="Clarity on who owns what — and when. This policy defines the ownership of creative work, source files, code, and assets produced by Grekam Visuals."
        lastUpdated="1 August 2025"
      />

      <PolicySection title="1. Ownership Transfer Principle">
        <PolicyHighlight>
          <strong>Final ownership of all custom-created work transfers to the Client upon receipt of full and final payment.</strong><br /><br />
          Until complete payment is received, all work — including concepts, designs, code, and deliverables — remains the intellectual property of Grekam Visuals.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="2. What the Client Owns (After Full Payment)">
        <PolicyList items={[
          "Final website design and layout",
          "Custom-written code and website files specific to your project",
          "Logo and brand identity assets in final delivered formats",
          "Marketing creatives and graphics designed exclusively for your brand",
          "Written content created specifically for your project by our team",
          "Video productions (final rendered files) created for your project",
        ]} />
      </PolicySection>

      <PolicySection title="3. What Grekam Visuals Retains">
        <PolicyList items={[
          "The right to display completed work in our portfolio, website, and marketing materials",
          "Ownership of design concepts, mockups, and drafts not selected or approved by the Client",
          "Underlying proprietary methodologies, workflows, and frameworks developed by our team",
          "Source files (PSD, AI, Figma, etc.) unless explicitly included in the proposal",
          "Internal project documentation and process materials",
        ]} />
      </PolicySection>

      <PolicySection title="4. Source Files">
        <p>Source file delivery (design source files such as .AI, .PSD, .FIG and code repositories) is not included by default in all projects. Source files are included only when:</p>
        <PolicyList items={[
          "Explicitly stated in the project proposal or quotation",
          "The Client has paid the applicable source file fee",
          "Full and final payment has been received",
        ]} />
        <PolicyHighlight>
          If you need source files, please specify this requirement before the project commences so it can be priced into the proposal.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="5. Third-Party Assets & Licences">
        <PolicyList items={[
          "Stock photography and video used in your project are licensed for your use via the applicable stock provider (Unsplash, Shutterstock, Adobe Stock, etc.)",
          "Premium fonts used in design are licensed separately — you will need to acquire your own licence for internal/commercial use",
          "WordPress themes, plugins, or SaaS tools used in your project remain subject to their provider's licence terms",
          "Open-source frameworks (React, Tailwind, etc.) are subject to their respective open-source licences",
          "We will inform you of any material third-party licences that affect your use of the delivered work",
        ]} />
        <PolicyWarning>
          Grekam Visuals is not liable for the Client's misuse of licensed third-party assets beyond the scope of the project delivery.
        </PolicyWarning>
      </PolicySection>

      <PolicySection title="6. Portfolio & Case Study Rights">
        <PolicyList items={[
          "Grekam Visuals reserves the right to feature completed client work in our portfolio, case studies, social media, and pitch materials",
          "We will not disclose confidential business information, financial data, or proprietary strategies in case studies",
          "If the Client requires work to remain confidential (NDA basis), this must be agreed in writing before project commencement",
          "Portfolio images may use the Client's publicly available branding and trademarks solely for the purpose of attribution",
        ]} />
      </PolicySection>

      <PolicySection title="7. Client Representations">
        <p>By engaging our services, the Client represents and warrants that:</p>
        <PolicyList items={[
          "All content, logos, images, and assets provided to us are owned by the Client or properly licensed for use",
          "The Client has the right to commission the work described in the project scope",
          "The delivered work will not infringe on any third party's intellectual property rights",
          "Grekam Visuals will not be held liable for IP infringement arising from Client-supplied materials",
        ]} />
      </PolicySection>

      <PolicySection title="8. Pre-existing IP">
        <p>Any intellectual property owned by Grekam Visuals prior to the commencement of a project (including our internal tools, libraries, frameworks, and design systems) remains our exclusive property, even if incorporated into your delivered project.</p>
      </PolicySection>

      <PolicySection title="9. Contact for IP Queries">
        <PolicyHighlight>
          admin@grekam.in | +91 98431 99556<br />
          Coimbatore, Tamil Nadu, India
        </PolicyHighlight>
      </PolicySection>
    </LegalLayout>
  )
}
