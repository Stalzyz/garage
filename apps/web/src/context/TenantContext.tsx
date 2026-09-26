"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface TenantBranding {
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  isCustomBranded: boolean
}

interface TenantContextType {
  tenantSlug: string | null
  customDomain: string | null
  branding: TenantBranding
  setBranding: (branding: Partial<TenantBranding>) => void
}

const defaultBranding: TenantBranding = {
  name: "Grekam Garage OS",
  logo: "/logo.png",
  primaryColor: "#3b82f6",
  secondaryColor: "#8b5cf6",
  isCustomBranded: false,
}

const TenantContext = createContext<TenantContextType>({
  tenantSlug: null,
  customDomain: null,
  branding: defaultBranding,
  setBranding: () => {},
})

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [customDomain, setCustomDomain] = useState<string | null>(null)
  const [branding, setBrandingState] = useState<TenantBranding>(defaultBranding)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      if (hostname.endsWith(".grekam.in") && !hostname.startsWith("www.") && !hostname.startsWith("app.")) {
        const slug = hostname.replace(".grekam.in", "")
        setTenantSlug(slug)
        setBrandingState({
          name: `${slug.toUpperCase()} Garage Hub`,
          logo: "/logo.png",
          primaryColor: "#8b5cf6",
          secondaryColor: "#3b82f6",
          isCustomBranded: true,
        })
      } else if (!["localhost", "127.0.0.1", "grekam.in"].includes(hostname)) {
        setCustomDomain(hostname)
        setBrandingState({
          name: `${hostname.split(".")[0].toUpperCase()} Auto Care`,
          logo: "/logo.png",
          primaryColor: "#ec4899",
          secondaryColor: "#8b5cf6",
          isCustomBranded: true,
        })
      }
    }
  }, [])

  const setBranding = (newBranding: Partial<TenantBranding>) => {
    setBrandingState((prev) => ({ ...prev, ...newBranding }))
  }

  return (
    <TenantContext.Provider value={{ tenantSlug, customDomain, branding, setBranding }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}
