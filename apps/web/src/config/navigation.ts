import {
  Building2,
  ShieldCheck,
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
  Globe,
  CheckSquare,
  Trophy,
  PlusCircle,
  Wallet,
  FileText,
} from "lucide-react"

export type Role = "SUPER_ADMIN" | "PARTNER" | "RESELLER_ADMIN" | "ADMIN" | "GARAGE_ADMIN" | "MANAGER" | "STAFF" | "CLIENT" | "VENDOR" | "INTERN" | "STUDENT"

export interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: Role[]
  resource?: string
  children?: { title: string; href: string }[]
}

// -------------------------------------------------------------
// 1. GREKAM SUPER ADMIN NAVIGATION (Platform Control Plane)
// -------------------------------------------------------------
export const superAdminNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Garages",
    href: "/dashboard/admin/garages",
    icon: Building2,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Partners",
    href: "/dashboard/admin/partners",
    icon: Users,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "KYC Compliance",
    href: "/dashboard/admin/kyc",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Plans",
    href: "/dashboard/admin/plans",
    icon: DollarSign,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Payments",
    href: "/dashboard/admin/payments",
    icon: DollarSign,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "White Label",
    href: "/dashboard/admin/whitelabel",
    icon: Globe,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Activity",
    href: "/dashboard/admin/activity",
    icon: Workflow,
    roles: ["SUPER_ADMIN"],
  },
]

// -------------------------------------------------------------
// 2. RESELLER & WHITE-LABEL PARTNER NAVIGATION
// -------------------------------------------------------------
export const partnerNavigation: NavItem[] = [
  {
    title: "Partner Overview",
    href: "/dashboard/partner",
    icon: LayoutDashboard,
    roles: ["PARTNER", "RESELLER_ADMIN", "VENDOR", "SUPER_ADMIN"],
  },
  {
    title: "Garages & Customers",
    href: "/dashboard/partner/customers",
    icon: Building2,
    roles: ["PARTNER", "RESELLER_ADMIN", "VENDOR", "SUPER_ADMIN"],
  },
  {
    title: "Prepaid Wallet",
    href: "/dashboard/partner/wallet",
    icon: Wallet,
    roles: ["PARTNER", "RESELLER_ADMIN", "VENDOR", "SUPER_ADMIN"],
  },
  {
    title: "Packages & Pricing",
    href: "/dashboard/partner/packages",
    icon: Layers,
    roles: ["PARTNER", "RESELLER_ADMIN", "VENDOR", "SUPER_ADMIN"],
  },
  {
    title: "White-Label Brand",
    href: "/dashboard/partner/whitelabel",
    icon: Globe,
    roles: ["PARTNER", "RESELLER_ADMIN", "VENDOR", "SUPER_ADMIN"],
  },
  {
    title: "Invoices",
    href: "/dashboard/partner/invoices",
    icon: FileText,
    roles: ["PARTNER", "RESELLER_ADMIN", "VENDOR", "SUPER_ADMIN"],
  },
  {
    title: "Earnings & Margins",
    href: "/dashboard/partner/earnings",
    icon: Trophy,
    roles: ["PARTNER", "RESELLER_ADMIN", "VENDOR", "SUPER_ADMIN"],
  },
  {
    title: "Partner Support",
    href: "/dashboard/partner/support",
    icon: LifeBuoy,
    roles: ["PARTNER", "RESELLER_ADMIN", "VENDOR", "SUPER_ADMIN"],
  },
  {
    title: "Settings & KYC",
    href: "/dashboard/partner/settings",
    icon: Settings,
    roles: ["PARTNER", "RESELLER_ADMIN", "VENDOR", "SUPER_ADMIN"],
  },
]

// Legacy alias for backwards compatibility
export const resellerAdminNavigation: NavItem[] = partnerNavigation

// -------------------------------------------------------------
// 3. VENDOR / AGENCY TENANT NAVIGATION (Tenant Scope)
// -------------------------------------------------------------
export const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "STAFF", "CLIENT", "INTERN"],
  },
  {
    title: "Vendor Storefront Portal",
    href: "/vendor/dashboard",
    icon: Building2,
    roles: ["VENDOR"],
  },
  {
    title: "Staff Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    roles: ["ADMIN", "MANAGER", "STAFF", "INTERN"],
  },
  {
    title: "Team Culture & Wins",
    href: "/dashboard/team-hub",
    icon: Trophy,
    roles: ["ADMIN", "MANAGER", "STAFF", "INTERN"],
  },

  {
    title: "My Workspace (ESS)",
    href: "/dashboard/ess",
    icon: UserCheck,
    roles: ["ADMIN", "MANAGER", "STAFF", "INTERN"],
  },
  {
    title: "CRM & Sales",
    href: "/dashboard/crm",
    icon: Layers,
    resource: "CRM & Sales",
    roles: ["ADMIN", "MANAGER"],
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
    roles: ["ADMIN", "MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN"],
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
    roles: ["ADMIN", "MANAGER"],
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
    roles: ["ADMIN", "MANAGER"],
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
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing/calendar",
    icon: Radio,
    resource: "Marketing Hub",
    roles: ["ADMIN", "MANAGER"],
    children: [
      { title: "AI Prospects",     href: "/dashboard/marketing/prospects" },
      { title: "Content Scheduler",href: "/dashboard/marketing/scheduler" },
      { title: "Email Campaigns",  href: "/dashboard/marketing/email" },
      { title: "Ad Campaigns",     href: "/dashboard/marketing/campaigns" },
      { title: "AI Backlink Hub",  href: "/dashboard/marketing/backlinks" },
    ],
  },
  {
    title: "CMS & Website",
    href: "/dashboard/cms",
    icon: Globe,
    resource: "CMS",
    roles: ["ADMIN", "MANAGER"],
    children: [
      { title: "Agency Visual Editor", href: "/dashboard/cms/agency-editor" },
      { title: "Pages Builder",  href: "/dashboard/cms" },
      { title: "Blog Posts",     href: "/dashboard/cms/blog" },
      { title: "Media Library",  href: "/dashboard/cms/media" },
      { title: "SEO Settings",   href: "/dashboard/cms/seo" },
    ],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart2,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: LifeBuoy,
    resource: "Support Helpdesk",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Automations",
    href: "/dashboard/automations",
    icon: Workflow,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Chat Hub",
    href: "/dashboard/chat",
    icon: MessageSquare,
    roles: ["ADMIN", "MANAGER", "STAFF", "INTERN", "CLIENT", "VENDOR"],
  },
  {
    title: "Asset Drive",
    href: "/dashboard/drive",
    icon: HardDrive,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["ADMIN", "MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN"],
  },
  {
    title: "Knowledge Base",
    href: "/dashboard/kb",
    icon: BookOpen,
    roles: ["ADMIN", "MANAGER", "STAFF", "VENDOR", "INTERN"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    resource: "System Settings",
    roles: ["ADMIN", "MANAGER"],
    children: [
      { title: "General", href: "/dashboard/settings" },
      { title: "Organization & Branding", href: "/dashboard/settings/organization" },
      { title: "Tenants & Whitelabel", href: "/dashboard/settings/tenants" },
      { title: "Roles & Permissions", href: "/dashboard/settings/roles" },
      { title: "Finance & Currency", href: "/dashboard/settings/finance" },
      { title: "Email Templates", href: "/dashboard/settings/email-templates" },
      { title: "Integrations", href: "/dashboard/settings/integrations" },
    ],
  },
]

export const getNavItemsByRole = (role: string, customPermissions?: string[], pathname?: string) => {
  if (role === "SUPER_ADMIN" || pathname?.startsWith("/dashboard/admin")) {
    return superAdminNavigation
  }
  if (
    role === "PARTNER" || 
    role === "RESELLER_ADMIN" || 
    role === "RESELLER" || 
    pathname?.startsWith("/dashboard/partner") || 
    pathname?.startsWith("/dashboard/reseller")
  ) {
    return partnerNavigation
  }

  // Normalize ADMIN, GARAGE_ADMIN, TENANT_ADMIN to MANAGER/ADMIN so garage owners see all workspace features
  const isTenantAdmin = role === "ADMIN" || role === "GARAGE_ADMIN" || role === "TENANT_ADMIN" || role === "Admin" || role === "Garage Owner"
  const effectiveRole = isTenantAdmin ? "MANAGER" : role

  return navigation.filter((item) => {
    if (customPermissions && customPermissions.length > 0 && item.resource) {
      return customPermissions.includes(item.resource)
    }
    return item.roles.includes(effectiveRole as Role) || item.roles.includes(role as Role) || (isTenantAdmin && item.roles.includes("MANAGER"))
  })
}

