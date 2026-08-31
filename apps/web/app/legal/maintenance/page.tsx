import type { Metadata } from "next"
import LegalLayout from "../LegalLayout"
import { PolicyPageHeader, PolicySection, PolicyList, PolicyHighlight, PolicyWarning } from "../PolicyPage"

export const metadata: Metadata = {
  title: "Maintenance & Support Policy | Grekam Visuals",
  description: "Website maintenance, support plans, response times and what's included or excluded at Grekam Visuals.",
}

export default function MaintenancePage() {
  return (
    <LegalLayout>
      <PolicyPageHeader
        title="Maintenance & Support Policy"
        subtitle="What to expect from our ongoing support and maintenance plans — including what's covered, response times, and how to raise a support request."
        lastUpdated="1 August 2025"
      />

      <PolicySection title="1. Post-Delivery Bug Support">
        <PolicyHighlight>
          All projects include a <strong>30-day post-delivery bug support window</strong> at no additional charge.<br /><br />
          This covers bugs and defects in the delivered work that are not caused by Client modifications, third-party plugin updates, or hosting changes.
        </PolicyHighlight>
        <PolicyList items={[
          "Bug reports must be submitted within the 30-day window",
          "Support response within 2 business days during this period",
          "This period does not cover new feature requests, content changes, or additional pages",
        ]} />
      </PolicySection>

      <PolicySection title="2. Monthly Maintenance Plans">
        <p>After the 30-day post-delivery window, ongoing support is available through our monthly maintenance plans:</p>
        <PolicyHighlight>
          <strong>Basic Plan — ₹4,999/month:</strong><br />
          Security monitoring, plugin/CMS updates, monthly backup, up to 1 hour of minor content edits<br /><br />
          <strong>Standard Plan — ₹8,999/month:</strong><br />
          All Basic features + performance monitoring, up to 3 hours of content/design edits, priority support<br /><br />
          <strong>Advanced Plan — ₹14,999/month:</strong><br />
          All Standard features + up to 6 hours of development work, bi-weekly security audits, emergency support
        </PolicyHighlight>
        <p>Custom maintenance agreements are available for enterprise and complex web applications.</p>
      </PolicySection>

      <PolicySection title="3. What Maintenance Includes">
        <PolicyList items={[
          "WordPress / CMS core updates",
          "Plugin and theme updates (testing included)",
          "Monthly website backup and secure off-site storage",
          "Security monitoring and malware scanning",
          "SSL certificate renewal monitoring",
          "Minor content updates (text, images, contact information) within included hours",
          "Monthly performance check and basic speed optimisation",
          "Uptime monitoring with alerts",
        ]} />
      </PolicySection>

      <PolicySection title="4. What Maintenance Excludes">
        <PolicyList items={[
          "New page creation or structural layout changes",
          "Design overhauls or rebrandings",
          "New feature development or major functionality additions",
          "Third-party platform integrations",
          "E-commerce product management and order fulfilment support",
          "SEO campaign management (separate service)",
          "Recovery from damage caused by Client or third-party modifications",
          "Hosting or server infrastructure changes",
        ]} />
        <PolicyWarning>
          Work outside the included hours or scope is billed at our standard hourly rate.
        </PolicyWarning>
      </PolicySection>

      <PolicySection title="5. Support Hours & Response Times">
        <PolicyList items={[
          "Standard support hours: Monday–Friday, 10:00 AM – 6:00 PM IST",
          "Support requests submitted on weekends/holidays are processed the next business day",
          "Basic Plan response SLA: Within 3 business days",
          "Standard Plan response SLA: Within 1 business day",
          "Advanced Plan response SLA: Within 4 business hours",
          "Emergency support (site down): Within 4 hours for Advanced Plan clients",
        ]} />
      </PolicySection>

      <PolicySection title="6. How to Raise a Support Request">
        <PolicyHighlight>
          Email: admin@grekam.in with subject: [SUPPORT] Your Website/Project Name<br />
          WhatsApp: +91 98431 99556<br /><br />
          Please include: a clear description of the issue, screenshots, and the URL where the issue occurs.
        </PolicyHighlight>
      </PolicySection>

      <PolicySection title="7. Hosting & Domain">
        <PolicyList items={[
          "Hosting and domain management are separate from maintenance plans unless bundled",
          "We can manage your hosting on your behalf for an additional monthly fee",
          "Domain renewals are the Client's responsibility unless a domain management add-on is subscribed",
          "We recommend using reputable hosting providers such as Hostinger, SiteGround, AWS, or Vercel",
        ]} />
      </PolicySection>

      <PolicySection title="8. Maintenance Plan Terms">
        <PolicyList items={[
          "Maintenance plans are billed monthly in advance",
          "Minimum commitment: 3 months",
          "Cancellation requires 30 days written notice",
          "Plans auto-renew unless cancelled in writing",
          "Unused support hours do not roll over to the following month",
        ]} />
      </PolicySection>

      <PolicySection title="9. Limitation of Liability">
        <p>While we make every effort to keep your website secure and functional, Grekam Visuals is not liable for:</p>
        <PolicyList items={[
          "Data loss due to hosting provider failures",
          "Security breaches caused by Client-installed plugins or third-party scripts",
          "Service disruptions caused by domain/hosting provider outages",
          "Issues arising from Client-made changes outside of agreed maintenance scope",
        ]} />
      </PolicySection>
    </LegalLayout>
  )
}
