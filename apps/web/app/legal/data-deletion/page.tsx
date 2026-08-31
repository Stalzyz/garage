import type { Metadata } from "next"
import LegalLayout from "../LegalLayout"
import { PolicyPageHeader, PolicySection, PolicyList, PolicyHighlight, PolicyWarning } from "../PolicyPage"

export const metadata: Metadata = {
  title: "Data Deletion Instructions | Grekam Visuals",
  description: "Instructions on how to request deletion of your personal data or disconnect your accounts from Grekam OS.",
}

export default function DataDeletionPage() {
  return (
    <LegalLayout>
      <PolicyPageHeader
        title="Data Deletion Instructions"
        subtitle="This guide provides step-by-step instructions on how you can request the deletion of your personal data, disconnect integrated services (such as Google Calendar or Meta Ads), or close your Grekam account."
        lastUpdated="31 August 2026"
      />

      <PolicySection title="1. Introduction to Data Privacy">
        <p>In accordance with data protection regulations (including GDPR, CCPA, and Indian Information Technology laws), Grekam Visuals respects your right to control your personal data. We provide clean options to disconnect third-party logins and purge your account profiles from our databases.</p>
      </PolicySection>

      <PolicySection title="2. Disconnecting Connected Apps (Google & Meta)">
        <p>If you have integrated your Google Calendar/Meet or Meta Advertising account with Grekam OS and wish to revoke access:</p>
        <PolicyList items={[
          "Log into your dashboard at garage.grekam.in.",
          "Navigate to Settings → Integrations.",
          "Find Google Calendar or Meta Ads in the list of connected services.",
          "Click the Disconnect / Revoke button next to the connected service.",
          "Our system will instantly delete all saved OAuth access tokens, refresh tokens, and synchronization configurations from our databases.",
        ]} />
      </PolicySection>

      <PolicySection title="3. Revoking Access Directly from Google/Meta Settings">
        <p>You can also remove Grekam OS permissions directly from your Google or Facebook account settings at any time:</p>
        <PolicyList items={[
          "For Google: Go to Google Account Security Settings (https://myaccount.google.com/permissions) → under 'Third-party apps with account access', select Grekam OS and click 'Remove Access'.",
          "For Meta/Facebook: Go to Apps and Websites Settings (https://www.facebook.com/settings?tab=applications) → find Grekam OS and click 'Remove'.",
        ]} />
      </PolicySection>

      <PolicySection title="4. Requesting Complete Data Deletion">
        <p>If you want us to completely delete your user profile, client files, and interaction logs from our databases:</p>
        <PolicyHighlight>
          Send an email to <strong>admin@grekam.in</strong> with the subject line <strong>&quot;Data Deletion Request&quot;</strong>.<br /><br />
          Please specify the email address associated with your Grekam account. We will process your request and completely purge all non-financial transactional data within 14 business days.
        </PolicyHighlight>
        <PolicyWarning>
          Please note that financial records (invoices, GST logs, billing transactions) cannot be deleted immediately, as they must be retained for 7 years to comply with Indian tax regulations.
        </PolicyWarning>
      </PolicySection>

      <PolicySection title="5. Automated Deletion Endpoint Callback">
        <p>If you are looking for our automated platform developer data deletion callback URL (required for Facebook/Meta developer compliance), you can submit programmatic deletion requests to our endpoint:</p>
        <p className="font-mono text-xs bg-white/5 p-3 rounded-lg border border-white/10 text-emerald-400">
          https://garage.grekam.in/api/auth/delete-data
        </p>
      </PolicySection>

      <PolicySection title="6. Contact for Privacy Officer">
        <PolicyHighlight>
          Email: admin@grekam.in<br />
          Phone: +91 98431 99556<br />
          Coimbatore, Tamil Nadu, India
        </PolicyHighlight>
      </PolicySection>
    </LegalLayout>
  )
}
