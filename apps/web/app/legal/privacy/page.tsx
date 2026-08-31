import type { Metadata } from "next"
import LegalLayout from "../LegalLayout"
import { PolicyPageHeader, PolicySection, PolicyList, PolicyHighlight, PolicyWarning } from "../PolicyPage"

export const metadata: Metadata = {
  title: "Privacy Policy | Grekam Visuals",
  description: "How Grekam Visuals collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <LegalLayout>
      <PolicyPageHeader
        title="Privacy Policy"
        subtitle="Grekam Visuals is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data."
        lastUpdated="1 August 2025"
      />

      <PolicySection title="1. Information We Collect">
        <p>We collect information in the following ways:</p>
        <p><strong className="text-white/80">Information You Provide Directly:</strong></p>
        <PolicyList items={[
          "Name, email address, phone number when you fill our contact or enquiry forms",
          "Company name and business details when requesting a project quotation",
          "Project briefs, files, and documents shared during project collaboration",
          "Payment information (processed through secure payment gateways — we do not store card details)",
        ]} />
        <p><strong className="text-white/80">Information Collected Automatically:</strong></p>
        <PolicyList items={[
          "IP address, browser type, and device information when you visit our website",
          "Pages viewed, time spent, and navigation patterns (via analytics tools)",
          "Cookies and similar tracking technologies",
          "Referral source (how you arrived at our website)",
        ]} />
        <p><strong className="text-white/80">WhatsApp & Communication Channels:</strong></p>
        <PolicyList items={[
          "If you contact us via WhatsApp, we receive your WhatsApp number and message content",
          "WhatsApp Business API communications are subject to Meta's Privacy Policy",
        ]} />
      </PolicySection>

      <PolicySection title="2. How We Use Your Information">
        <PolicyList items={[
          "To respond to your enquiries and project requests",
          "To prepare and deliver project proposals and quotations",
          "To execute and manage your project",
          "To send invoices, project updates, and relevant communications",
          "To send marketing communications (only with your consent; you may opt out anytime)",
          "To improve our website, services, and user experience",
          "To comply with legal and tax obligations (GST records, etc.)",
          "To prevent fraud and ensure the security of our systems",
        ]} />
      </PolicySection>

      <PolicySection title="3. Cookies & Analytics">
        <p>Our website uses cookies for the following purposes:</p>
        <PolicyList items={[
          "Essential cookies: Required for website functionality (e.g., session management)",
          "Analytics cookies: We use Google Analytics to understand how visitors use our site. This data is aggregated and anonymised",
          "Marketing cookies: Used for retargeting ads if you have interacted with our ads on Google or Meta platforms",
        ]} />
        <PolicyHighlight>
          You can manage cookie preferences through your browser settings. Disabling cookies may affect some website functionality.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="4. Data Sharing">
        <p>We do not sell, rent, or trade your personal information. We may share data with trusted third parties strictly for service delivery:</p>
        <PolicyList items={[
          "Payment processors (Razorpay, Stripe) for billing",
          "Cloud hosting providers (AWS, Vercel) for website infrastructure",
          "Email service providers for transactional and marketing emails",
          "Google Analytics for website traffic analysis",
          "WhatsApp Business API providers (Meta/Grafty) for messaging",
          "Project management and collaboration tools used internally",
        ]} />
        <p>We require all third-party service providers to maintain appropriate security and confidentiality standards.</p>
      </PolicySection>

      <PolicySection title="5. Data Security">
        <PolicyList items={[
          "All data is transmitted over HTTPS (TLS encrypted)",
          "We implement access controls — only authorised staff access your data",
          "We do not store payment card information — all payments are processed through PCI-DSS compliant gateways",
          "Project files are stored in secure cloud environments",
          "We regularly review and update our security practices",
        ]} />
        <PolicyWarning>
          While we take reasonable precautions, no method of internet transmission is 100% secure. We cannot guarantee absolute security of your data.
        </PolicyWarning>
      </PolicySection>

      <PolicySection title="6. Data Retention">
        <PolicyList items={[
          "Enquiry and contact form data: Retained for 12 months from last contact",
          "Client project data: Retained for 5 years post-project completion (for legal/tax purposes)",
          "Financial records (invoices, payments): Retained for 7 years as required by Indian tax law",
          "Marketing data: Retained until you opt out or request deletion",
        ]} />
      </PolicySection>

      <PolicySection title="7. Your Rights">
        <p>You have the following rights regarding your personal data:</p>
        <PolicyList items={[
          "Right to access: Request a copy of the personal data we hold about you",
          "Right to correction: Request correction of inaccurate or incomplete information",
          "Right to deletion: Request deletion of your personal data (subject to legal retention requirements)",
          "Right to opt out: Unsubscribe from marketing communications at any time",
          "Right to data portability: Request your data in a portable format",
        ]} />
        <PolicyHighlight>
          To exercise any of these rights, contact us at admin@grekam.in with subject: &quot;Data Privacy Request&quot;. We will respond within 30 days.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="8. Children's Privacy">
        <p>Our services are not directed at individuals under 18 years of age. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately.</p>
      </PolicySection>

      <PolicySection title="9. Policy Updates">
        <p>We may update this Privacy Policy periodically. Significant changes will be communicated via email to active clients. Continued use of our website or services after updates constitutes acceptance of the revised policy.</p>
      </PolicySection>

      <PolicySection title="10. Contact">
        <PolicyHighlight>
          <strong>Grekam Visuals — Privacy Officer</strong><br />
          Email: admin@grekam.in<br />
          Phone: +91 98431 99556<br />
          Coimbatore, Tamil Nadu, India
        </PolicyHighlight>
      </PolicySection>
    </LegalLayout>
  )
}
