import {
  LayoutDashboard,
  Users,
  Briefcase,
  GraduationCap,
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
} from "lucide-react"

export type Role = "Super Admin" | "Manager" | "Staff" | "Client" | "Student" | "Vendor" | "Intern"

export interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: Role[]
  children?: { title: string; href: string }[]
}

export const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Super Admin", "Manager", "Staff", "Client", "Student", "Vendor", "Intern"],
  },
  {
    title: "CRM & Sales",
    href: "/dashboard/crm",
    icon: Layers,
    roles: ["Super Admin", "Manager", "Staff"],
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
    roles: ["Super Admin", "Manager", "Staff", "Client", "Vendor", "Intern"],
    children: [
      { title: "Kanban Board", href: "/dashboard/projects" },
      { title: "Asset Hub",    href: "/dashboard/projects/assets" },
    ],
  },
  {
    title: "Finance",
    href: "/dashboard/finance",
    icon: DollarSign,
    roles: ["Super Admin", "Manager", "Client"],
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
    roles: ["Super Admin", "Manager", "Staff"],
    children: [
      { title: "Employees",  href: "/dashboard/hr" },
      { title: "Time Track", href: "/dashboard/hr/time" },
      { title: "Attendance", href: "/dashboard/hr/attendance" },
      { title: "Leaves",     href: "/dashboard/hr/leaves" },
      { title: "Payroll",    href: "/dashboard/hr/payroll" },
      { title: "Documents",  href: "/dashboard/hr/documents" },
      { title: "Onboarding", href: "/dashboard/hr/onboarding" },
      { title: "ATS",        href: "/dashboard/hr/ats" },
      { title: "Expenses",   href: "/dashboard/hr/expenses" },
    ],
  },
  {
    title: "Academy",
    href: "/dashboard/academy/admissions",
    icon: GraduationCap,
    roles: ["Super Admin", "Manager", "Staff"],
    children: [
      { title: "Admissions", href: "/dashboard/academy/admissions" },
      { title: "Students",   href: "/dashboard/academy/students" },
      { title: "Batches",    href: "/dashboard/academy/batches" },
      { title: "Attendance", href: "/dashboard/academy/attendance" },
      { title: "Schedule",   href: "/dashboard/academy/schedule" },
    ],
  },
  {
    title: "LMS",
    href: "/dashboard/lms",
    icon: BookOpen,
    roles: ["Super Admin", "Manager", "Staff", "Student", "Intern"],
    children: [
      { title: "My Courses",   href: "/dashboard/lms" },
      { title: "Assignments",  href: "/dashboard/lms/assignments" },
      { title: "Achievements", href: "/dashboard/lms/achievements" },
      { title: "Course Builder",href: "/dashboard/lms/builder" },
      { title: "Analytics",    href: "/dashboard/lms/analytics" },
    ],
  },
  {
    title: "Vendors",
    href: "/dashboard/vendors",
    icon: UserCheck,
    roles: ["Super Admin", "Manager"],
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing/calendar",
    icon: Radio,
    roles: ["Super Admin", "Manager", "Staff"],
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
    roles: ["Super Admin", "Manager", "Staff"],
    children: [
      { title: "Pages Builder",  href: "/dashboard/cms/pages" },
      { title: "Blog Posts",     href: "/dashboard/cms/blog" },
      { title: "Media Library",  href: "/dashboard/cms/media" },
      { title: "SEO Settings",   href: "/dashboard/cms/seo" },
    ],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart2,
    roles: ["Super Admin", "Manager"],
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: LifeBuoy,
    roles: ["Super Admin", "Manager", "Staff"],
  },
  {
    title: "Automations",
    href: "/dashboard/automations",
    icon: Zap,
    roles: ["Super Admin", "Manager"],
  },
  {
    title: "Chat Hub",
    href: "/dashboard/chat",
    icon: MessageSquare,
    roles: ["Super Admin", "Manager", "Staff", "Intern"],
  },
  {
    title: "Asset Drive",
    href: "/dashboard/drive",
    icon: HardDrive,
    roles: ["Super Admin", "Manager", "Staff"],
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["Super Admin", "Manager", "Staff", "Client", "Student", "Vendor", "Intern"],
  },
  {
    title: "Knowledge Base",
    href: "/dashboard/kb",
    icon: BookOpen,
    roles: ["Super Admin", "Manager", "Staff", "Client", "Student", "Vendor", "Intern"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["Super Admin"],
    children: [
      { title: "General", href: "/dashboard/settings" },
      { title: "Roles & Permissions", href: "/dashboard/settings/roles" },
      { title: "Finance & Currency", href: "/dashboard/settings/finance" },
      { title: "Integrations", href: "/dashboard/settings/integrations" },
    ],
  },
]

export const getNavItemsByRole = (role: string) => {
  return navigation.filter((item) => item.roles.includes(role as Role))
}
