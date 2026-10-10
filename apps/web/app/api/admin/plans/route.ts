import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"

const DEFAULT_PLANS = [
  {
    slug: "freelancers",
    name: "Freelancers",
    tagline: "Solo garage consultants, freelance automotive estimators & single-bay shops.",
    badge: null,
    monthlyPrice: 99,
    monthlyOfferPrice: 83,
    yearlyPrice: 1200,
    yearlyOfferPrice: 999,
    whitelabelMonthlyBasePrice: 49,
    whitelabelYearlyBasePrice: 499,
    resellerCommissionRate: 15,
    allowWhitelabelCustomMarkup: false,
    popular: false,
    ctaText: "Get Started",
    status: "Active",
    displayOrder: 1,
    maxUsers: 1,
    maxClients: 15,
    modules: [
      "CRM & Lead Pipeline",
      "Kanban Projects & Asset Hub",
      "Finance, Invoicing & P&L",
      "Support Helpdesk",
      "White Label & Custom Domain",
    ],
    features: [
      "1 Team Login & 15 Active Client Accounts",
      "Visual Kanban Sales Pipeline & Lead Tracking",
      "Interactive Digital Client Proposals",
      "Standard GST Invoicing & Payment Links",
      "Basic Client File & Asset Storage",
      "Email Support & Knowledge Base",
    ],
    missing: [
      "Automated WhatsApp Alerts & Cloud API",
      "Meta & Google Lead Ads Sync",
      "Client Self-Service Branded Portal",
      "Full HR & Payroll Attendance",
      "Custom Whitelabel Partner Domain",
    ]
  },
  {
    slug: "starter-studio",
    name: "Starter Studio",
    tagline: "Ideal for boutique agencies, freelance consultants & solo service businesses.",
    badge: null,
    monthlyPrice: 1899,
    monthlyOfferPrice: 1499,
    yearlyPrice: 19999,
    yearlyOfferPrice: 14999,
    whitelabelMonthlyBasePrice: 999,
    whitelabelYearlyBasePrice: 9999,
    resellerCommissionRate: 20,
    allowWhitelabelCustomMarkup: false,
    popular: false,
    ctaText: "Start Free Trial",
    status: "Active",
    displayOrder: 2,
    maxUsers: 3,
    maxClients: 25,
    modules: [
      "CRM & Sales (Leads, Proposals, Dialer)",
      "Finance, Invoicing & P&L",
      "Support Helpdesk",
      "Asset Drive Storage"
    ],
    features: [
      "Up to 3 Team Logins & 25 Active Client Accounts",
      "Visual Kanban Sales Pipeline & Lead Tracking",
      "Interactive Digital Client Proposals",
      "Standard GST Invoicing & Payment Links",
      "Basic Client File & Asset Storage",
      "Email Support & Knowledge Base",
    ],
    missing: [
      "Automated WhatsApp Client Notifications",
      "Client Self-Service Branded Portal",
      "Automated Recurring Retainer Invoicing",
      "Custom Whitelabel Partner Domain",
    ]
  },
  {
    slug: "growth-agency",
    name: "Growth Agency",
    tagline: "For scaling digital agencies, dev shops & B2B teams looking to close deals faster.",
    badge: "Most Popular",
    monthlyPrice: 4299,
    monthlyOfferPrice: 3499,
    yearlyPrice: 39999,
    yearlyOfferPrice: 29999,
    whitelabelMonthlyBasePrice: 1999,
    whitelabelYearlyBasePrice: 19999,
    resellerCommissionRate: 25,
    allowWhitelabelCustomMarkup: true,
    popular: true,
    ctaText: "Get Growth Plan",
    status: "Active",
    displayOrder: 3,
    maxUsers: 10,
    maxClients: 150,
    modules: [
      "CRM & Sales (Leads, Proposals, Dialer)",
      "Kanban Projects & Asset Hub",
      "Finance, Invoicing & P&L",
      "HR, Payroll & Attendance",
      "WhatsApp Automation & Alerts",
      "Analytics & Intelligence",
      "Support Helpdesk",
      "Asset Drive Storage"
    ],
    features: [
      "Unlimited Team Members & 150 Active Clients",
      "Automated WhatsApp Alerts (Proposals & Invoices)",
      "Interactive Proposals with E-Signatures",
      "Automated Monthly Recurring Retainer Billing",
      "Client Self-Service Web Portal",
      "Team Task & Sprint Milestone Tracking",
      "Team Time Logs & Commission Calculations",
      "Priority WhatsApp & Phone Support",
    ],
    missing: [
      "Multi-Organization Centralized Switcher",
      "Custom Whitelabel Partner Domain & Logo",
    ]
  },
  {
    slug: "pro-enterprise",
    name: "Pro Enterprise",
    tagline: "For high-volume digital firms, creative production houses & multi-brand agencies.",
    badge: "High Performance",
    monthlyPrice: 8499,
    monthlyOfferPrice: 4999,
    yearlyPrice: 69999,
    yearlyOfferPrice: 49999,
    whitelabelMonthlyBasePrice: 2999,
    whitelabelYearlyBasePrice: 29999,
    resellerCommissionRate: 30,
    allowWhitelabelCustomMarkup: true,
    popular: false,
    ctaText: "Upgrade to Pro",
    status: "Active",
    displayOrder: 4,
    maxUsers: 9999,
    maxClients: 9999,
    modules: [
      "CRM & Sales (Leads, Proposals, Dialer)",
      "Kanban Projects & Asset Hub",
      "Finance, Invoicing & P&L",
      "HR, Payroll & Attendance",
      "Marketing Hub & Campaign Scheduler",
      "CMS & Website Page Builder",
      "Analytics & Intelligence",
      "Support Helpdesk",
      "Automations Engine",
      "WhatsApp Automation & Alerts",
      "Asset Drive Storage",
      "White Label & Custom Domain"
    ],
    features: [
      "Unlimited Client Accounts & Team Members",
      "Multi-Organization & Multi-Brand Switcher",
      "Full HR & Payroll: Attendance, Time & Commissions",
      "Advanced P&L, Expense Ledgers & Profit Analytics",
      "Custom Contract Templates & Document Vault",
      "Custom Workflow Automations & API Access",
      "Dedicated Account Manager & Onboarding",
      "99.9% Uptime SLA Guarantee",
    ],
    missing: [
      "Custom Whitelabel Reseller Domain",
    ]
  },
  {
    slug: "whitelabel-partner",
    name: "Whitelabel Partner",
    tagline: "For IT resellers, SaaS distributors & networks offering CRM under their own brand.",
    badge: "White-Label",
    monthlyPrice: 17999,
    monthlyOfferPrice: 14999,
    yearlyPrice: 179999,
    yearlyOfferPrice: 149999,
    whitelabelMonthlyBasePrice: 4999,
    whitelabelYearlyBasePrice: 49999,
    resellerCommissionRate: 35,
    allowWhitelabelCustomMarkup: true,
    popular: false,
    ctaText: "Partner With Us",
    status: "Active",
    displayOrder: 5,
    maxUsers: 9999,
    maxClients: 9999,
    modules: [
      "CRM & Sales (Leads, Proposals, Dialer)",
      "Kanban Projects & Asset Hub",
      "Finance, Invoicing & P&L",
      "HR, Payroll & Attendance",
      "Marketing Hub & Campaign Scheduler",
      "CMS & Website Page Builder",
      "Analytics & Intelligence",
      "Support Helpdesk",
      "Automations Engine",
      "WhatsApp Automation & Alerts",
      "Asset Drive Storage",
      "White Label & Custom Domain"
    ],
    features: [
      "Unlimited Sub-Tenant Client Workspaces",
      "100% Custom Domain & Proprietary Branding",
      "Wholesale Reseller Dashboard & Margin Control",
      "Automated Tenant Provisioning & Billing",
      "Custom SMS & WhatsApp Gateway Integration",
      "Full Source Config & SLA Guarantee",
      "24/7 VIP Engineering Escalation",
    ],
    missing: []
  }
]

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    let plans = await prisma.systemPlan.findMany({
      orderBy: { displayOrder: "asc" }
    })

    // Seed default system plans if DB table is empty
    if (plans.length === 0) {
      for (const p of DEFAULT_PLANS) {
        await prisma.systemPlan.create({ data: p }).catch(() => {})
      }
      plans = await prisma.systemPlan.findMany({
        orderBy: { displayOrder: "asc" }
      })
    }

    return NextResponse.json({ success: true, plans })
  } catch (error: any) {
    console.error("GET /api/admin/plans error:", error)
    return NextResponse.json({ success: true, plans: DEFAULT_PLANS, fallback: true })
  }
}

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const body = await req.json()
    const {
      name,
      tagline,
      badge,
      monthlyPrice,
      monthlyOfferPrice,
      yearlyPrice,
      yearlyOfferPrice,
      whitelabelMonthlyBasePrice,
      whitelabelYearlyBasePrice,
      resellerCommissionRate,
      allowWhitelabelCustomMarkup,
      popular,
      ctaText,
      status = "Active",
      modules = [],
      features = [],
      missing = [],
      maxUsers = 5,
      maxClients = 100,
    } = body

    if (!name) {
      return NextResponse.json({ error: "Plan name is required" }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-")

    const newPlan = await prisma.systemPlan.create({
      data: {
        slug,
        name,
        tagline: tagline || null,
        badge: badge || null,
        monthlyPrice: parseFloat(monthlyPrice) || 0,
        monthlyOfferPrice: monthlyOfferPrice ? parseFloat(monthlyOfferPrice) : null,
        yearlyPrice: parseFloat(yearlyPrice) || 0,
        yearlyOfferPrice: yearlyOfferPrice ? parseFloat(yearlyOfferPrice) : null,
        whitelabelMonthlyBasePrice: whitelabelMonthlyBasePrice ? parseFloat(whitelabelMonthlyBasePrice) : null,
        whitelabelYearlyBasePrice: whitelabelYearlyBasePrice ? parseFloat(whitelabelYearlyBasePrice) : null,
        resellerCommissionRate: parseFloat(resellerCommissionRate) || 20,
        allowWhitelabelCustomMarkup: Boolean(allowWhitelabelCustomMarkup),
        popular: Boolean(popular),
        ctaText: ctaText || "Get Started",
        status,
        modules,
        features,
        missing,
        maxUsers: parseInt(String(maxUsers), 10) || 5,
        maxClients: parseInt(String(maxClients), 10) || 100,
      }
    })

    return NextResponse.json({ success: true, plan: newPlan })
  } catch (error: any) {
    console.error("POST /api/admin/plans error:", error)
    return NextResponse.json({ error: error.message || "Failed to create plan" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "Plan ID is required for update" }, { status: 400 })
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.tagline !== undefined) updateData.tagline = data.tagline
    if (data.badge !== undefined) updateData.badge = data.badge
    if (data.monthlyPrice !== undefined) updateData.monthlyPrice = parseFloat(data.monthlyPrice) || 0
    if (data.monthlyOfferPrice !== undefined) updateData.monthlyOfferPrice = data.monthlyOfferPrice ? parseFloat(data.monthlyOfferPrice) : null
    if (data.yearlyPrice !== undefined) updateData.yearlyPrice = parseFloat(data.yearlyPrice) || 0
    if (data.yearlyOfferPrice !== undefined) updateData.yearlyOfferPrice = data.yearlyOfferPrice ? parseFloat(data.yearlyOfferPrice) : null
    if (data.whitelabelMonthlyBasePrice !== undefined) updateData.whitelabelMonthlyBasePrice = data.whitelabelMonthlyBasePrice ? parseFloat(data.whitelabelMonthlyBasePrice) : null
    if (data.whitelabelYearlyBasePrice !== undefined) updateData.whitelabelYearlyBasePrice = data.whitelabelYearlyBasePrice ? parseFloat(data.whitelabelYearlyBasePrice) : null
    if (data.resellerCommissionRate !== undefined) updateData.resellerCommissionRate = parseFloat(data.resellerCommissionRate) || 20
    if (data.allowWhitelabelCustomMarkup !== undefined) updateData.allowWhitelabelCustomMarkup = Boolean(data.allowWhitelabelCustomMarkup)
    if (data.popular !== undefined) updateData.popular = Boolean(data.popular)
    if (data.ctaText !== undefined) updateData.ctaText = data.ctaText
    if (data.status !== undefined) updateData.status = data.status
    if (data.modules !== undefined) updateData.modules = data.modules
    if (data.features !== undefined) updateData.features = data.features
    if (data.missing !== undefined) updateData.missing = data.missing
    if (data.maxUsers !== undefined) updateData.maxUsers = parseInt(String(data.maxUsers), 10) || 5
    if (data.maxClients !== undefined) updateData.maxClients = parseInt(String(data.maxClients), 10) || 100

    const updatedPlan = await prisma.systemPlan.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, plan: updatedPlan })
  } catch (error: any) {
    console.error("PUT /api/admin/plans error:", error)
    return NextResponse.json({ error: error.message || "Failed to update plan" }, { status: 500 })
  }
}
