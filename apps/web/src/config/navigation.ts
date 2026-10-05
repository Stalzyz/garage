import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  BookOpen,
  BarChart2,
  Bell,
  UserCheck,
  Settings,
  Layers,
  Radio,
  LifeBuoy,
  Workflow,
  MessageSquare,
  HardDrive,
  CheckSquare,
  Trophy,
  ShieldCheck,
  Building2,
} from "lucide-react"

export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "STAFF" | "CLIENT" | "STUDENT" | "VENDOR" | "INTERN" | "FREELANCER" | "PARTNER" | "RESELLER_ADMIN"

export interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: Role[]
  resource?: string
  children?: { title: string; href: string }[]
}

export const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN", "STUDENT", "FREELANCER", "PARTNER", "RESELLER_ADMIN"],
  },

  // ── SUPER ADMIN CONTROL PLANE (SaaS Owner) ──
  {
    title: "Super Admin Platform",
    href: "/dashboard/admin/dashboard",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN"],
    children: [
      { title: "Control Plane", href: "/dashboard/admin/dashboard" },
      { title: "Direct Garages", href: "/dashboard/admin/garages" },
      { title: "Partners & Resellers", href: "/dashboard/admin/partners" },
      { title: "Platform Plans", href: "/dashboard/admin/plans" },
      { title: "Revenue & Payments", href: "/dashboard/admin/payments" },
      { title: "Whitelabel Engine", href: "/dashboard/admin/whitelabel" },
      { title: "KYC Verification", href: "/dashboard/admin/kyc" },
      { title: "System Activity", href: "/dashboard/admin/activity" },
    ],
  },

  // ── WHITELABEL PARTNER PORTAL ──
  {
    title: "Whitelabel Partner",
    href: "/dashboard/partner",
    icon: Building2,
    roles: ["PARTNER", "RESELLER_ADMIN", "SUPER_ADMIN"],
    children: [
      { title: "Partner Overview", href: "/dashboard/partner" },
      { title: "Customer Garages", href: "/dashboard/partner/customers" },
      { title: "Float & Earnings", href: "/dashboard/partner/earnings" },
      { title: "Packages & Margins", href: "/dashboard/partner/packages" },
      { title: "Invoices", href: "/dashboard/partner/invoices" },
      { title: "Commission Wallet", href: "/dashboard/partner/wallet" },
      { title: "Custom Domain", href: "/dashboard/partner/whitelabel" },
      { title: "Partner Settings", href: "/dashboard/partner/settings" },
    ],
  },

  {
    title: "Staff Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "INTERN", "FREELANCER"],
  },
  {
    title: "Team Culture & Wins",
    href: "/dashboard/team-hub",
    icon: Trophy,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "INTERN", "FREELANCER"],
  },

  {
    title: "Employee Workspace (EOS / ESS)",
    href: "/dashboard/ess",
    icon: UserCheck,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "INTERN", "FREELANCER", "VENDOR"],
  },
  {
    title: "CRM & Sales",
    href: "/dashboard/crm",
    icon: Layers,
    resource: "CRM & Sales",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "FREELANCER", "VENDOR", "INTERN"],
    children: [
      { title: "Lead Pipeline",  href: "/dashboard/crm" },
      { title: "Contacts",       href: "/dashboard/crm/contacts" },
      { title: "Proposals",      href: "/dashboard/crm/proposals" },
      { title: "Power Dialer",   href: "/dashboard/crm/dialer" },
      { title: "Call Intel",     href: "/dashboard/crm/calls" },
      { title: "Products",       href: "/dashboard/products" },
      { title: "Subscriptions",  href: "/dashboard/subscriptions" },
    ],
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: Briefcase,
    resource: "Projects",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN"],
    children: [
      { title: "Kanban Board", href: "/dashboard/projects" },
      { title: "Asset Hub",    href: "/dashboard/projects/assets" },
    ],
  },
  {
    title: "Finance",
    href: "/dashboard/finance",
    icon: DollarSign,
    resource: "Finance",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
    children: [
      { title: "Overview",  href: "/dashboard/finance" },
      { title: "Revenue",   href: "/dashboard/finance/revenue" },
      { title: "P&L",       href: "/dashboard/finance/pnl" },
      { title: "Estimates", href: "/dashboard/finance/estimates" },
      { title: "Taxes",     href: "/dashboard/finance/taxes" },
    ],
  },
  {
    title: "HR & Identity",
    href: "/dashboard/hr",
    icon: Users,
    resource: "HR & Payroll",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
    children: [
      { title: "Employees",  href: "/dashboard/hr" },
      { title: "Time Track", href: "/dashboard/hr/time" },
      { title: "Attendance", href: "/dashboard/hr/attendance" },
      { title: "Leaves",     href: "/dashboard/hr/leaves" },
      { title: "Payroll",    href: "/dashboard/hr/payroll" },
      { title: "Documents",  href: "/dashboard/hr/documents" },
      { title: "Onboarding", href: "/dashboard/hr/onboarding" },
      { title: "ATS",        href: "/dashboard/hr/ats" },
      { title: "Meetings",   href: "/dashboard/hr/meetings" },
      { title: "Commissions",href: "/dashboard/hr/commissions" },
      { title: "Expenses",   href: "/dashboard/hr/expenses" },
      { title: "Requests Queue", href: "/dashboard/hr/requests" },
      { title: "Monitoring", href: "/dashboard/hr/monitoring" },
      { title: "Performance",href: "/dashboard/hr/performance" },
      { title: "Analytics",  href: "/dashboard/hr/analytics" },
    ],
  },
  {
    title: "Vendors",
    href: "/dashboard/vendors",
    icon: UserCheck,
    resource: "VENDORS",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing/calendar",
    icon: Radio,
    resource: "Marketing Hub",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
    children: [
      { title: "AI Prospects",     href: "/dashboard/marketing/prospects" },
      { title: "Content Scheduler",href: "/dashboard/marketing/scheduler" },
      { title: "Email Campaigns",  href: "/dashboard/marketing/email" },
      { title: "Ad Campaigns",     href: "/dashboard/marketing/campaigns" },
      { title: "AI Backlink Hub",  href: "/dashboard/marketing/backlinks" },
    ],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart2,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: LifeBuoy,
    resource: "Support Helpdesk",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "PARTNER", "RESELLER_ADMIN"],
  },
  {
    title: "Automations",
    href: "/dashboard/automations",
    icon: Workflow,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    title: "Chat Hub",
    href: "/dashboard/chat",
    icon: MessageSquare,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "INTERN", "STUDENT", "CLIENT", "VENDOR", "PARTNER", "RESELLER_ADMIN"],
  },
  {
    title: "Asset Drive",
    href: "/dashboard/drive",
    icon: HardDrive,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN", "STUDENT", "PARTNER", "RESELLER_ADMIN"],
  },
  {
    title: "Knowledge Base",
    href: "/dashboard/kb",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "VENDOR", "INTERN", "PARTNER", "RESELLER_ADMIN"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    resource: "System Settings",
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      { title: "General", href: "/dashboard/settings" },
      { title: "Roles & Permissions", href: "/dashboard/settings/roles" },
      { title: "Finance & Currency", href: "/dashboard/settings/finance" },
      { title: "Email Templates", href: "/dashboard/settings/email-templates" },
      { title: "Integrations", href: "/dashboard/settings/integrations" },
    ],
  },
]

export const getNavItemsByRole = (role: string, customPermissions?: string[]) => {
  let normRole = (role || "").toUpperCase()
  if (normRole === "FREELANCE") normRole = "FREELANCER"
  if (normRole === "GARAGE_OWNER" || normRole === "OWNER") normRole = "ADMIN"
  if (normRole === "RESELLER") normRole = "RESELLER_ADMIN"

  return navigation.filter((item) => {
    // Core workspace and productivity links are always available to roles that include them
    if (["/dashboard", "/dashboard/ess", "/dashboard/tasks", "/dashboard/team-hub", "/dashboard/notifications", "/dashboard/chat"].includes(item.href)) {
      return item.roles.includes(normRole as Role)
    }
    if (customPermissions && customPermissions.length > 0 && item.resource) {
      const hasExplicitPermission = customPermissions.some(cp => 
        cp.toLowerCase() === item.resource?.toLowerCase() ||
        cp.toLowerCase().includes(item.resource?.toLowerCase() || '') ||
        (item.resource && cp.toLowerCase().includes('crm') && item.resource.toLowerCase().includes('crm'))
      )
      if (hasExplicitPermission) return true
    }
    return item.roles.includes(normRole as Role)
  })
}
