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
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center font-sans">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-[0_0_50px_rgba(244,63,94,0.15)]">
          <Lock className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-4 h-4" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-zinc-300 mb-3">
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span>Module Entitlement Gate</span>
        {planName && (
          <span className="text-zinc-500">| Tier: <strong className="text-white">{planName}</strong></span>
        )}
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
        {title}
      </h2>

      <p className="text-zinc-400 max-w-md text-sm leading-relaxed mb-6">
        {description}
      </p>

      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 max-w-md w-full mb-6 text-left space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Requested Module:</span>
          <span className="font-semibold text-white">{moduleName}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Status:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Disabled / Restricted
          </span>
        </div>
        <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-500 leading-normal">
          Click below to upgrade your plan via WhatsApp support to immediately unlock this module.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a
          href={`https://wa.me/919789359407?text=${encodeURIComponent(`Hi Grekam Garage Support, I would like to upgrade my plan to unlock the "${moduleName}" module.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
          <span>Upgrade on WhatsApp (+91 9789359407)</span>
        </a>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10 hover:border-white/20 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Workspace</span>
        </button>
      </div>
    </div>
  )
}
