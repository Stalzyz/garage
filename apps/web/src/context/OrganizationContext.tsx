"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string | null;
  academyLogoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor: string;
  darkModeDefault: boolean;
  supportEmail?: string | null;
  billingAddress?: string | null;
  website?: string | null;
  phone?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
}

const defaultOrg: Organization = {
  id: "",
  name: "Grekam OS",
  logoUrl: null,
  academyLogoUrl: null,
  faviconUrl: null,
  primaryColor: "#2563eb",
  darkModeDefault: true,
  supportEmail: null,
  billingAddress: null,
  website: null,
  phone: null,
  bankName: null,
  bankAccountNo: null,
  bankIfsc: null,
  bankBranch: null,
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
          setOrg(data);

          // Inject primary color as CSS variable globally
          const root = document.documentElement;
          root.style.setProperty("--org-primary", data.primaryColor || "#2563eb");

          // Update page title
          if (data.name) {
            document.title = data.name;
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
