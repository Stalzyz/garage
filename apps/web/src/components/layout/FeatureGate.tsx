"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useOrganization } from "@/context/OrganizationContext"
import { useCurrentUser } from "@/context/CurrentUserContext"
import { useSession } from "next-auth/react"
import { Lock, ArrowLeft, ShieldAlert, Sparkles, Building2, MessageCircle } from "lucide-react"

interface FeatureGateProps {
  children: React.ReactNode
}

export function FeatureGate({ children }: FeatureGateProps) {
  const pathname = usePathname()
  const router = useRouter()
  const org = useOrganization()
  const { data: session } = useSession()
  const currentUser = useCurrentUser()

  const rawRole = (session?.user?.role || currentUser?.role || "").toUpperCase()
  const isSuperAdmin = rawRole === "SUPER_ADMIN" || rawRole === "SUPER ADMIN"
  const isPartnerOrReseller = rawRole === "PARTNER" || rawRole === "RESELLER_ADMIN" || rawRole === "RESELLER"

  // Super Admin always bypasses all feature locks
  if (isSuperAdmin) {
    return <>{children}</>
  }

  // Partner / SuperAdmin route check
  if (pathname.startsWith("/dashboard/admin")) {
    return (
      <LockedScreen
        title="Super Admin Control Plane Required"
        moduleName="Platform Super Admin"
        description="This administrative area is strictly reserved for Platform Super Administrators."
        onBack={() => router.push("/dashboard")}
      />
    )
  }

  if (pathname.startsWith("/dashboard/partner") && !isPartnerOrReseller) {
    return (
      <LockedScreen
        title="Whitelabel Partner Access Required"
        moduleName="Partner Portal"
        description="This area is reserved for registered Whitelabel Partners and Reseller Accounts."
        onBack={() => router.push("/dashboard")}
      />
    )
  }

  const features = org?.features

  if (features) {
    // 1. Power Dialer & Calls check
    if (
      (pathname.startsWith("/dashboard/crm/dialer") || pathname.startsWith("/dashboard/crm/calls")) &&
      (features.powerDialerEnabled === false || features.crmEnabled === false)
    ) {
      return (
        <LockedScreen
          title="AI Power Dialer & Call Intel Locked"
          moduleName="AI Power Dialer"
          planName={org.subscription || (org as any).plan || "Current Tier"}
          description="Power dialer and call intelligence features are not enabled on your garage's current subscription plan."
          onBack={() => router.push("/dashboard/crm")}
        />
      )
    }

    // 2. CRM & Sales check
    if (pathname.startsWith("/dashboard/crm") && features.crmEnabled === false) {
      return (
        <LockedScreen
          title="CRM & Sales Pipeline Locked"
          moduleName="CRM & Lead Pipeline"
          planName={org.subscription || (org as any).plan || "Current Tier"}
          description="The CRM & Sales Pipeline module is not included in your active garage plan tier."
          onBack={() => router.push("/dashboard")}
        />
      )
    }

    // 2.5. Tasks & Work Allocation check
    if (
      pathname.startsWith("/dashboard/tasks") &&
      (features.tasksEnabled === false || features.projectsEnabled === false)
    ) {
      return (
        <LockedScreen
          title="Staff Tasks & Work Allocation Locked"
          moduleName="Task & Work Allocation: Staff Tasks"
          planName={org.subscription || (org as any).plan || "Current Tier"}
          description="Staff task allocation and work assignments are not included in your active garage plan tier."
          onBack={() => router.push("/dashboard")}
        />
      )
    }

    // 3. Projects & Kanban & Drive check
    if (
      (pathname.startsWith("/dashboard/projects") || pathname.startsWith("/dashboard/drive")) &&
      features.projectsEnabled === false
    ) {
      return (
        <LockedScreen
          title="Projects & Job Cards Locked"
          moduleName="Kanban Projects & Asset Hub"
          planName={org.subscription || (org as any).plan || "Current Tier"}
          description="Project management and job card tracking are not included in your active garage plan tier."
          onBack={() => router.push("/dashboard")}
        />
      )
    }

    // 4. Finance, Invoicing & P&L check
    if (
      (pathname.startsWith("/dashboard/finance") || pathname.startsWith("/dashboard/subscriptions") || pathname.startsWith("/dashboard/products")) &&
      features.financeEnabled === false
    ) {
      return (
        <LockedScreen
          title="Finance & Invoicing Locked"
          moduleName="Finance, Invoicing & P&L"
          planName={org.subscription || (org as any).plan || "Current Tier"}
          description="Invoicing, revenue tracking, and financial ledgers are not included in your active garage plan tier."
          onBack={() => router.push("/dashboard")}
        />
      )
    }

    // 5. HRM, Payroll & Identity check
    if (
      (pathname.startsWith("/dashboard/hr") || pathname.startsWith("/dashboard/team-hub") || pathname.startsWith("/dashboard/ess")) &&
      features.hrmEnabled === false
    ) {
      return (
        <LockedScreen
          title="HRM & Payroll Locked"
          moduleName="HR, Payroll & Attendance"
          planName={org.subscription || (org as any).plan || "Current Tier"}
          description="Employee identity, attendance tracking, and payroll modules are disabled for your current plan tier."
          onBack={() => router.push("/dashboard")}
        />
      )
    }

    // 6. Marketing Hub check
    if (pathname.startsWith("/dashboard/marketing") && features.marketingEnabled === false) {
      return (
        <LockedScreen
          title="Marketing Hub Locked"
          moduleName="Marketing & Campaign Scheduler"
          planName={org.subscription || (org as any).plan || "Current Tier"}
          description="Marketing campaigns and prospect outreach tools are disabled on your current plan tier."
          onBack={() => router.push("/dashboard")}
        />
      )
    }

    // 7. Automations Engine check
    if (pathname.startsWith("/dashboard/automations") && features.automationsEnabled === false) {
      return (
        <LockedScreen
          title="Automations Engine Locked"
          moduleName="Automations & Webhooks"
          planName={org.subscription || (org as any).plan || "Current Tier"}
          description="Workflow automation and webhook triggers are disabled for your current plan tier."
          onBack={() => router.push("/dashboard")}
        />
      )
    }
  }

  return <>{children}</>
}

function LockedScreen({
  title,
  moduleName,
  planName,
  description,
  onBack,
}: {
  title: string
  moduleName: string
  planName?: string
  description: string
  onBack: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto px-4 text-center font-sans">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 mb-5 shadow-sm">
        <Lock className="w-5 h-5 text-zinc-300" />
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-2">
        {moduleName} is available on Pro
      </h2>

      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6 max-w-sm">
        {description}
      </p>

      <div className="flex items-center gap-3">
        <a
          href={`https://wa.me/919789359407?text=${encodeURIComponent(`Hi Grekam Garage Support, I would like to upgrade my plan to unlock the "${moduleName}" module.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-medium text-xs transition-all shadow-sm active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Upgrade via WhatsApp</span>
        </a>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white font-medium text-xs transition-all border border-white/[0.08] active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return</span>
        </button>
      </div>
    </div>
  )
}
