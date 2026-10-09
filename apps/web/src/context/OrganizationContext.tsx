"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface OrganizationFeatures {
  crmEnabled: boolean;
  powerDialerEnabled: boolean;
  hrmEnabled: boolean;
  projectsEnabled: boolean;
  financeEnabled: boolean;
  marketingEnabled: boolean;
  automationsEnabled: boolean;
  portalEnabled: boolean;
  customDomainAllowed: boolean;
  whiteLabelPdfAllowed: boolean;
  aiAssistantAllowed: boolean;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string | null;
  academyLogoUrl?: string | null;
  faviconUrl?: string | null;
  academyFaviconUrl?: string | null;
  primaryColor: string;
  secondaryColor?: string | null;
  accentColor?: string | null;
  darkModeDefault: boolean;
  supportEmail?: string | null;
  billingAddress?: string | null;
  website?: string | null;
  phone?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  companyName?: string | null;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  bankAccountNo?: string | null;
  ifscCode?: string | null;
  bankIfsc?: string | null;
  swiftCode?: string | null;
  bankBranch?: string | null;
  features?: OrganizationFeatures;
}

const defaultFeatures: OrganizationFeatures = {
  crmEnabled: true,
  powerDialerEnabled: true,
  hrmEnabled: true,
  projectsEnabled: true,
  financeEnabled: true,
  marketingEnabled: true,
  automationsEnabled: true,
  portalEnabled: true,
  customDomainAllowed: false,
  whiteLabelPdfAllowed: false,
  aiAssistantAllowed: false,
};

const defaultOrg: Organization = {
  id: "",
  name: "Grekam Garage OS",
  logoUrl: null,
  academyLogoUrl: null,
  faviconUrl: null,
  academyFaviconUrl: null,
  primaryColor: "#2563eb",
  secondaryColor: "#7c3aed",
  accentColor: "#10b981",
  darkModeDefault: true,
  supportEmail: "support@grekam.in",
  billingAddress: null,
  website: "https://grekam.in",
  phone: "+91 99000 00000",
  gstNumber: null,
  panNumber: null,
  companyName: "Grekam Garage & Technologies Pvt Ltd",
  bankName: null,
  accountName: null,
  accountNumber: null,
  bankAccountNo: null,
  ifscCode: null,
  bankIfsc: null,
  swiftCode: null,
  bankBranch: null,
  features: defaultFeatures,
};

const OrganizationContext = createContext<Organization>(defaultOrg);

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  return ctx || defaultOrg;
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<Organization>(defaultOrg);

  useEffect(() => {
    const API_BASE = typeof window !== "undefined" ? "/api/v1" : (process.env.NEXT_PUBLIC_API_URL || "/api/v1");

    const fetchOrg = async () => {
      try {
        // Try user organization settings first (for logged-in sessions)
        let res = await fetch(`${API_BASE}/settings/organization`).catch(() => null);
        let data: any = null;
        if (res && res.ok) {
          data = await res.json();
        }

        // If unauthenticated or no data returned, fallback to public domain branding resolver
        if (!data || data.error) {
          const publicRes = await fetch(`/api/public/branding`).catch(() => null);
          if (publicRes && publicRes.ok) {
            data = await publicRes.json();
          }
        }

        if (data) {
          const orgData = data.data || data;
          const finalOrg: Organization = {
            ...defaultOrg,
            ...orgData,
            features: orgData.features ? {
              ...defaultFeatures,
              ...orgData.features,
            } : defaultFeatures,
            logoUrl: orgData.logoUrl || null,
            academyLogoUrl: orgData.academyLogoUrl || null,
            faviconUrl: orgData.faviconUrl || null,
            primaryColor: orgData.primaryColor || "#2563eb",
          };
          setOrg(finalOrg);

          // Inject primary color as CSS variable globally
          if (typeof document !== "undefined") {
            const root = document.documentElement;
            root.style.setProperty("--org-primary", finalOrg.primaryColor || "#2563eb");

            // Update page title
            if (orgData.name && orgData.name !== "Inertia creations" && orgData.name !== "Automated CRM") {
              document.title = `${orgData.name} | Garage OS`;
            }

            // Update Agency Favicon dynamically in browser tab
            if (orgData.faviconUrl) {
              let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
              if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
              }
              link.href = orgData.faviconUrl;
            }
          }
        }
      } catch {}
    };

    fetchOrg();

    const handleUpdate = () => fetchOrg();
    window.addEventListener("organization-updated", handleUpdate);
    return () => window.removeEventListener("organization-updated", handleUpdate);
  }, []);

  return (
    <OrganizationContext.Provider value={org}>
      {children}
    </OrganizationContext.Provider>
  );
}
