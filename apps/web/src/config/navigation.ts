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
  Zap,
  MessageSquare,
  HardDrive,
  Globe,
  CheckSquare,
  Trophy,
} from "lucide-react"

export type Role = "SUPER_ADMIN" | "MANAGER" | "STAFF" | "CLIENT" | "STUDENT" | "VENDOR" | "INTERN"

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
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN", "STUDENT"],
  },
  {
    title: "Staff Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "INTERN"],
  },
  {
    title: "Team Culture & Wins",
    href: "/dashboard/team-hub",
    icon: Trophy,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "INTERN"],
  },

  {
    title: "My Workspace (ESS)",
    href: "/dashboard/ess",
    icon: UserCheck,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "INTERN"],
  },
  {
    title: "CRM & Sales",
    href: "/dashboard/crm",
    icon: Layers,
    resource: "CRM & Sales",
    roles: ["SUPER_ADMIN", "MANAGER"],
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
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN"],
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
    roles: ["SUPER_ADMIN", "MANAGER"],
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
    roles: ["SUPER_ADMIN", "MANAGER"],
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
    roles: ["SUPER_ADMIN", "MANAGER"],
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing/calendar",
    icon: Radio,
    resource: "Marketing Hub",
    roles: ["SUPER_ADMIN", "MANAGER"],
    children: [
      { title: "AI Prospects",     href: "/dashboard/marketing/prospects" },
      { title: "Content Scheduler",href: "/dashboard/marketing/scheduler" },
      { title: "Email Campaigns",  href: "/dashboard/marketing/email" },
      { title: "Ad Campaigns",     href: "/dashboard/marketing/campaigns" },
    ],
  },
  {
    title: "CMS & Website",
    href: "/dashboard/cms",
    icon: Globe,
    resource: "CMS",
    roles: ["SUPER_ADMIN", "MANAGER"],
    children: [
      { title: "Pages Builder",  href: "/dashboard/cms" },
      { title: "Hiring Partners",href: "/dashboard/cms/placements" },
      { title: "Student Portfolios", href: "/dashboard/cms/portfolio" },
      { title: "Events & Demos", href: "/dashboard/cms/events" },
      { title: "Announcements",  href: "/dashboard/cms/announcements" },
      { title: "Instructors",    href: "/dashboard/cms/educators" },
      { title: "Blog Posts",     href: "/dashboard/cms/blog" },
      { title: "Media Library",  href: "/dashboard/cms/media" },
      { title: "SEO Settings",   href: "/dashboard/cms/seo" },
    ],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart2,
    roles: ["SUPER_ADMIN", "MANAGER"],
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: LifeBuoy,
    resource: "Support Helpdesk",
    roles: ["SUPER_ADMIN", "MANAGER"],
  },
  {
    title: "Automations",
    href: "/dashboard/automations",
    icon: Zap,
    roles: ["SUPER_ADMIN", "MANAGER"],
  },
  {
    title: "Chat Hub",
    href: "/dashboard/chat",
    icon: MessageSquare,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "INTERN", "STUDENT", "CLIENT", "VENDOR"],
  },
  {
    title: "Asset Drive",
    href: "/dashboard/drive",
    icon: HardDrive,
    roles: ["SUPER_ADMIN", "MANAGER"],
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "CLIENT", "VENDOR", "INTERN", "STUDENT"],
  },
  {
    title: "Knowledge Base",
    href: "/dashboard/kb",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "VENDOR", "INTERN"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    resource: "System Settings",
    roles: ["SUPER_ADMIN"],
    children: [
      { title: "General", href: "/dashboard/settings" },
      { title: "Roles & Permissions", href: "/dashboard/settings/roles" },
      { title: "Finance & Currency", href: "/dashboard/settings/finance" },
      { title: "Integrations", href: "/dashboard/settings/integrations" },
    ],
  },
]

export const getNavItemsByRole = (role: string, customPermissions?: string[]) => {
  return navigation.filter((item) => {
    if (customPermissions && customPermissions.length > 0 && item.resource) {
      return customPermissions.includes(item.resource)
    }
    return item.roles.includes(role as Role)
  })
}
