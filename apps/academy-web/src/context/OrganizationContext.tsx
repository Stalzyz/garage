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
  logoUrl: null,
  academyLogoUrl: null,
  faviconUrl: null,
  academyFaviconUrl: null,
  primaryColor: "#4f46e5",
  darkModeDefault: true,
  supportEmail: null,
  billingAddress: null,
  website: null,
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

    fetch(`${API_BASE}/settings/organization`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          const orgData = data.data || data;
          setOrg(orgData);

          // Inject primary color as CSS variable globally
          if (typeof document !== "undefined") {
            const root = document.documentElement;
            root.style.setProperty("--org-primary", orgData.primaryColor || "#4f46e5");

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
      .catch(() => {}); // Silently fail during dev if API is not up
  }, []);

  return (
    <OrganizationContext.Provider value={org}>
      {children}
    </OrganizationContext.Provider>
  );
}
