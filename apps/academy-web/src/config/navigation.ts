import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Bell,
  Settings,
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
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "STUDENT", "INTERN"],
  },
  {
    title: "Academy Admin",
    href: "/dashboard/academy/admissions",
    icon: GraduationCap,
    resource: "ACADEMY",
    roles: ["SUPER_ADMIN", "MANAGER"],
    children: [
      { title: "Admissions CRM", href: "/dashboard/academy/admissions" },
      { title: "Form Builder", href: "/dashboard/academy/forms" },
      { title: "Walk-ins Kiosk", href: "/dashboard/academy/walk-ins" },
      { title: "Demo Sessions", href: "/dashboard/academy/demo-sessions" },
      { title: "Campus Students",   href: "/dashboard/academy/students/onsite" },
      { title: "Remote Students",   href: "/dashboard/academy/students/online" },
      { title: "Global Leaderboard", href: "/dashboard/academy/leaderboard" },
      { title: "Campus Faculty",   href: "/dashboard/academy/educators/onsite" },
      { title: "Office Hours", href: "/dashboard/academy/office-hours" },
      { title: "Remote Instructors",   href: "/dashboard/academy/educators/online" },
      { title: "Fee Collection",   href: "/dashboard/academy/fees" },
      { title: "Batches",    href: "/dashboard/academy/batches" },
      { title: "Live Projects", href: "/dashboard/academy/projects" },
      { title: "Internships", href: "/dashboard/academy/internships" },
      { title: "Placements", href: "/dashboard/academy/placements" },
      { title: "Marketplace", href: "/dashboard/academy/marketplace" },
      { title: "Campus Events", href: "/dashboard/academy/events" },
      { title: "Referrals", href: "/dashboard/academy/referrals" },
      { title: "AI Risk Engine", href: "/dashboard/academy/risk" },
    ],
  },

  {
    title: "Onsite Studio",
    href: "/dashboard/studio/onsite",
    icon: GraduationCap,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF"],
  },
  {
    title: "Online Studio",
    href: "/dashboard/studio/online",
    icon: GraduationCap,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF"],
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "STUDENT", "INTERN"],
  },
  {
    title: "Knowledge Base",
    href: "/dashboard/kb",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "MANAGER", "STAFF", "STUDENT", "INTERN"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
    children: [
      { title: "General", href: "/dashboard/settings" },
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
