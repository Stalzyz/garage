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
  darkModeDefault: boolean;
  supportEmail?: string | null;
  billingAddress?: string | null;
  website?: string | null;
  phone?: string | null;
}

const defaultOrg: Organization = {
  id: "",
  name: "Grekam Academy",
  logoUrl: "/visuals-logo.png",
  academyLogoUrl: "/academy-logo.png",
  faviconUrl: "/favicon.ico",
  academyFaviconUrl: "/favicon.ico",
  primaryColor: "#4f46e5",
  darkModeDefault: true,
  supportEmail: "academy@grekam.in",
  billingAddress: "Coimbatore, Tamil Nadu, India",
  website: "https://academy.grekam.in",
  phone: null,
};

const OrganizationContext = createContext<Organization>(defaultOrg);

export function useOrganization() {
  return useContext(OrganizationContext);
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
              primaryColor: orgData.primaryColor || "#4f46e5",
            };
            setOrg(finalOrg);

            // Inject primary color as CSS variable globally
            if (typeof document !== "undefined") {
              const root = document.documentElement;
              root.style.setProperty("--org-primary", finalOrg.primaryColor || "#4f46e5");

              // Update page title
              if (orgData.name) {
                document.title = `${orgData.name} Academy`;
              }

              // Update Academy Favicon dynamically in browser tab
              const activeFavicon = orgData.academyFaviconUrl || orgData.faviconUrl;
              if (activeFavicon) {
                let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
                if (!link) {
                  link = document.createElement('link');
                  link.rel = 'icon';
                  document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = activeFavicon;
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
