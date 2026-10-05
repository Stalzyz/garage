"use client"

import React, { createContext, useContext } from "react"

// TenantContext – provides tenant/workspace info.
// This is a lightweight stub that passes through without any async logic.
// Extend as needed when multi-tenant features are built out.

interface TenantContextType {
  tenantId: string | null
  tenantSlug: string | null
}

const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  tenantSlug: null,
})

export const useTenant = () => useContext(TenantContext)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  return (
    <TenantContext.Provider value={{ tenantId: null, tenantSlug: null }}>
      {children}
    </TenantContext.Provider>
  )
}
