"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

  // Company & legal identity
  companyName?: string | null;
  panNumber?: string | null;
  gstNumber?: string | null;

  // Public channels
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  facebookUrl?: string | null;
  whatsappNumber?: string | null;

  /**
   * Bank settlement details.
   *
   * Field names here match the Prisma `Organization` columns. The previous
   * interface declared bankAccountNo / bankIfsc, which no column or API
   * response ever populated — anything reading those got undefined.
   */
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  swiftCode?: string | null;
  bankBranch?: string | null;
}

const defaultOrg: Organization = {
  id: "",
  name: "Grekam Visuals",
  logoUrl: "/visuals-logo.png",
  academyLogoUrl: "/academy-logo.png",
  faviconUrl: "/favicon.ico",
  academyFaviconUrl: "/favicon.ico",
  primaryColor: "#2DA16D",
  secondaryColor: "#7c3aed",
  accentColor: "#10b981",
  darkModeDefault: true,
  supportEmail: "greeksacademy@gmail.com",
  billingAddress: "Coimbatore, Tamil Nadu, India",
  website: "https://grekam.in",
  phone: null,
  bankName: null,
  accountName: null,
  accountNumber: null,
  ifscCode: null,
  swiftCode: null,
  bankBranch: null,
};

const OrganizationContext = createContext<Organization>(defaultOrg);

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  return ctx || defaultOrg;
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<Organization>(defaultOrg);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

    const fetchOrg = () => {
      fetch(`${API_BASE}/settings/organization`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data) {
            const orgData = data.data || data;
            const finalOrg: Organization = {
              ...defaultOrg,
              ...orgData,
              logoUrl: orgData.logoUrl || "/visuals-logo.png",
              academyLogoUrl: orgData.academyLogoUrl || "/academy-logo.png",
              faviconUrl: orgData.faviconUrl || "/favicon.ico",
              primaryColor: orgData.primaryColor || "#2DA16D",
            };
            setOrg(finalOrg);

            // Inject primary color as CSS variable globally
            if (typeof document !== "undefined") {
              const root = document.documentElement;
              root.style.setProperty("--org-primary", finalOrg.primaryColor || "#2DA16D");

              // Keep Next.js page metadata titles intact

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
        })
        .catch(() => {});
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
