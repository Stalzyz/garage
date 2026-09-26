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
} from "lucide-react"

export type Role = "SUPER_ADMIN" | "RESELLER_ADMIN" | "MANAGER" | "STAFF" | "CLIENT" | "VENDOR" | "INTERN"

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
    title: "Resellers",
    href: "/dashboard/admin/resellers",
    icon: Users,
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
// 2. RESELLER ADMIN NAVIGATION (Reseller Scope)
// -------------------------------------------------------------
export const resellerAdminNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/reseller",
    icon: LayoutDashboard,
    roles: ["RESELLER_ADMIN", "VENDOR"],
  },
  {
    title: "Onboard Garage",
    href: "/dashboard/reseller/onboarding",
    icon: PlusCircle,
    roles: ["RESELLER_ADMIN", "VENDOR"],
  },
  {
    title: "Garages",
    href: "/dashboard/reseller/garages",
    icon: Building2,
    roles: ["RESELLER_ADMIN", "VENDOR"],
  },
  {
    title: "White Label",
    href: "/dashboard/reseller/whitelabel",
    icon: Globe,
    roles: ["RESELLER_ADMIN", "VENDOR"],
  },
  {
    title: "Sales",
    href: "/dashboard/reseller/sales",
    icon: DollarSign,
    roles: ["RESELLER_ADMIN", "VENDOR"],
  },
  {
    title: "Earnings",
    href: "/dashboard/reseller/earnings",
    icon: DollarSign,
    roles: ["RESELLER_ADMIN", "VENDOR"],
  },
  {
    title: "Support",
    href: "/dashboard/reseller/support",
    icon: LifeBuoy,
    roles: ["RESELLER_ADMIN", "VENDOR"],
  },
  {
    title: "Settings",
    href: "/dashboard/reseller/settings",
    icon: Settings,
    roles: ["RESELLER_ADMIN", "VENDOR"],
  },
]

// -------------------------------------------------------------
// 3. VENDOR / AGENCY TENANT NAVIGATION (Tenant Scope)
// -------------------------------------------------------------
export const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["MANAGER", "STAFF", "CLIENT", "INTERN"],
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
    roles: ["MANAGER", "STAFF", "INTERN"],
  },
  {
    title: "Team Culture & Wins",
    href: "/dashboard/team-hub",
    icon: Trophy,
    roles: ["MANAGER", "STAFF", "INTERN"],
  },

  {
    title: "My Workspace (ESS)",
    href: "/dashboard/ess",
    icon: UserCheck,
    roles: ["MANAGER", "STAFF", "INTERN"],
  },
  {
    title: "CRM & Sales",
    href: "/dashboard/crm",
    icon: Layers,
    resource: "CRM & Sales",
    roles: ["MANAGER"],
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
    roles: ["MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN"],
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
    roles: ["MANAGER"],
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
    roles: ["MANAGER"],
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
    roles: ["MANAGER"],
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing/calendar",
    icon: Radio,
    resource: "Marketing Hub",
    roles: ["MANAGER"],
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
    roles: ["MANAGER"],
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
    roles: ["MANAGER"],
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: LifeBuoy,
    resource: "Support Helpdesk",
    roles: ["MANAGER"],
  },
  {
    title: "Automations",
    href: "/dashboard/automations",
    icon: Workflow,
    roles: ["MANAGER"],
  },
  {
    title: "Chat Hub",
    href: "/dashboard/chat",
    icon: MessageSquare,
    roles: ["MANAGER", "STAFF", "INTERN", "CLIENT", "VENDOR"],
  },
  {
    title: "Asset Drive",
    href: "/dashboard/drive",
    icon: HardDrive,
    roles: ["MANAGER"],
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN"],
  },
  {
    title: "Knowledge Base",
    href: "/dashboard/kb",
    icon: BookOpen,
    roles: ["MANAGER", "STAFF", "VENDOR", "INTERN"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    resource: "System Settings",
    roles: ["MANAGER"],
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
  if (role === "RESELLER_ADMIN" || role === "VENDOR" || role === "RESELLER" || pathname?.startsWith("/dashboard/reseller")) {
    return resellerAdminNavigation
  }

  return navigation.filter((item) => {
    if (customPermissions && customPermissions.length > 0 && item.resource) {
      return customPermissions.includes(item.resource)
    }
    return item.roles.includes(role as Role)
  })
}
