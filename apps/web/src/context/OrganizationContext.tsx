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
  gstNumber?: string | null;
  panNumber?: string | null;
  companyName?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
}

const defaultOrg: Organization = {
  id: "",
  name: "Grekam Garage",
  logoUrl: null,
  academyLogoUrl: null,
  faviconUrl: null,
  academyFaviconUrl: null,
  primaryColor: "#4f46e5",
  secondaryColor: "#10b981",
  accentColor: "#f59e0b",
  darkModeDefault: true,
  supportEmail: null,
  billingAddress: null,
  website: null,
  phone: null,
  gstNumber: null,
  panNumber: null,
  companyName: "Grekam Garage",
  bankName: null,
  bankAccountNo: null,
  bankIfsc: null,
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

              // Update page title if set
              if (orgData.name) {
                document.title = orgData.name;
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
