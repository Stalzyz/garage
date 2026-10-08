import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const { id } = await params

    // Check if ID matches Tenant or Organization
    let tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        branding: true,
        features: true,
        members: {
          include: {
            user: true
          }
        }
      }
    })

    let org = await prisma.organization.findUnique({
      where: { id }
    })

    if (!tenant && !org) {
      // Try finding by workspaceId or slug
      tenant = await prisma.tenant.findFirst({
        where: { OR: [{ workspaceId: id }, { slug: id }] },
        include: { branding: true, features: true, members: { include: { user: true } } }
      })
      org = await prisma.organization.findFirst({
        where: { OR: [{ workspaceId: id }, { slug: id }] }
      })
    }

    if (!tenant && !org) {
      return NextResponse.json({ error: "Garage not found" }, { status: 404 })
    }

    const ownerUser = tenant?.members.find(m => m.role === "OWNER")?.user || tenant?.members[0]?.user

    const result = {
      id: tenant?.id || org?.id,
      name: tenant?.name || org?.name || "Garage",
      slug: tenant?.slug || org?.slug || "",
      domain: tenant?.customDomain || org?.domain || "",
      status: tenant?.status || org?.status || "ACTIVE",
      plan: tenant?.plan || org?.subscription || "GROWTH",
      renewalDate: org?.createdAt ? new Date(new Date(org.createdAt).setFullYear(new Date(org.createdAt).getFullYear() + 1)).toISOString() : null,
      owner: {
        name: ownerUser ? `${ownerUser.firstName || ''} ${ownerUser.lastName || ''}`.trim() : (org?.ownerName || "Garage Owner"),
        email: ownerUser?.email || org?.ownerEmail || "",
        phone: ownerUser?.phone || org?.ownerPhone || "",
      },
      branding: {
        logoUrl: tenant?.branding?.logoUrl || org?.logoUrl || "",
        faviconUrl: tenant?.branding?.faviconUrl || org?.faviconUrl || "",
        primaryColor: tenant?.branding?.primaryColor || org?.primaryColor || "#2563eb",
        secondaryColor: tenant?.branding?.secondaryColor || org?.secondaryColor || "#1e40af",
        accentColor: tenant?.branding?.accentColor || org?.accentColor || "#10b981",
        darkModeDefault: tenant?.branding?.darkModeDefault ?? org?.darkModeDefault ?? true,
        companyName: tenant?.branding?.companyName || org?.companyName || "",
        taxId: tenant?.branding?.taxId || org?.gstNumber || org?.panNumber || "",
        supportEmail: tenant?.branding?.supportEmail || org?.supportEmail || "",
        supportPhone: tenant?.branding?.supportPhone || org?.phone || "",
      },
      features: {
        crmEnabled: tenant?.features?.crmEnabled ?? true,
        powerDialerEnabled: tenant?.features?.powerDialerEnabled ?? true,
        hrmEnabled: tenant?.features?.hrmEnabled ?? true,
        projectsEnabled: tenant?.features?.projectsEnabled ?? true,
        financeEnabled: tenant?.features?.financeEnabled ?? true,
        marketingEnabled: tenant?.features?.marketingEnabled ?? true,
        automationsEnabled: tenant?.features?.automationsEnabled ?? true,
        portalEnabled: tenant?.features?.portalEnabled ?? true,
        customDomainAllowed: tenant?.features?.customDomainAllowed ?? true,
        whiteLabelPdfAllowed: tenant?.features?.whiteLabelPdfAllowed ?? true,
        aiAssistantAllowed: tenant?.features?.aiAssistantAllowed ?? true,
      }
    }

    return NextResponse.json({ success: true, garage: result })
  } catch (error: any) {
    console.error("Fetch garage details error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch garage details" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const { id } = await params
    const body = await req.json()
    const { 
      name, 
      plan, 
      status, 
      renewalDate, 
      ownerName, 
      ownerEmail, 
      ownerPhone, 
      features,
      branding 
    } = body

    // Locate Tenant and Organization. `members.user.email` is read below to find the
    // owner account, so members must be included here (the GET handler had it).
    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ id }, { workspaceId: id }] },
      include: { members: { include: { user: true } } }
    })
    const org = await prisma.organization.findFirst({
      where: { OR: [{ id }, { workspaceId: id }] }
    })

    if (!tenant && !org) {
      return NextResponse.json({ error: "Garage record not found." }, { status: 404 })
    }

    // 1. Update Tenant if exists
    if (tenant) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          ...(name && { name }),
          ...(plan && { plan: plan as any }),
          ...(status && { status: status as any }),
        }
      })

      // Update/Upsert Features
      if (features) {
        await prisma.tenantFeatures.upsert({
          where: { tenantId: tenant.id },
          create: {
            tenantId: tenant.id,
            crmEnabled: features.crmEnabled ?? true,
            powerDialerEnabled: features.powerDialerEnabled ?? true,
            hrmEnabled: features.hrmEnabled ?? true,
            projectsEnabled: features.projectsEnabled ?? true,
            financeEnabled: features.financeEnabled ?? true,
            marketingEnabled: features.marketingEnabled ?? true,
            automationsEnabled: features.automationsEnabled ?? true,
            portalEnabled: features.portalEnabled ?? true,
            customDomainAllowed: features.customDomainAllowed ?? true,
            whiteLabelPdfAllowed: features.whiteLabelPdfAllowed ?? true,
            aiAssistantAllowed: features.aiAssistantAllowed ?? true,
          },
          update: {
            ...(features.crmEnabled !== undefined && { crmEnabled: features.crmEnabled }),
            ...(features.powerDialerEnabled !== undefined && { powerDialerEnabled: features.powerDialerEnabled }),
            ...(features.hrmEnabled !== undefined && { hrmEnabled: features.hrmEnabled }),
            ...(features.projectsEnabled !== undefined && { projectsEnabled: features.projectsEnabled }),
            ...(features.financeEnabled !== undefined && { financeEnabled: features.financeEnabled }),
            ...(features.marketingEnabled !== undefined && { marketingEnabled: features.marketingEnabled }),
            ...(features.automationsEnabled !== undefined && { automationsEnabled: features.automationsEnabled }),
            ...(features.portalEnabled !== undefined && { portalEnabled: features.portalEnabled }),
            ...(features.customDomainAllowed !== undefined && { customDomainAllowed: features.customDomainAllowed }),
            ...(features.whiteLabelPdfAllowed !== undefined && { whiteLabelPdfAllowed: features.whiteLabelPdfAllowed }),
            ...(features.aiAssistantAllowed !== undefined && { aiAssistantAllowed: features.aiAssistantAllowed }),
          }
        })
      }

      // Update Branding
      if (branding) {
        await prisma.tenantBranding.upsert({
          where: { tenantId: tenant.id },
          create: {
            tenantId: tenant.id,
            logoUrl: branding.logoUrl || null,
            faviconUrl: branding.faviconUrl || null,
            primaryColor: branding.primaryColor || "#2563eb",
            secondaryColor: branding.secondaryColor || "#1e40af",
            accentColor: branding.accentColor || "#10b981",
            companyName: branding.companyName || null,
            taxId: branding.taxId || null,
            supportEmail: branding.supportEmail || null,
            supportPhone: branding.supportPhone || null,
          },
          update: {
            ...(branding.logoUrl !== undefined && { logoUrl: branding.logoUrl }),
            ...(branding.faviconUrl !== undefined && { faviconUrl: branding.faviconUrl }),
            ...(branding.primaryColor && { primaryColor: branding.primaryColor }),
            ...(branding.secondaryColor && { secondaryColor: branding.secondaryColor }),
            ...(branding.accentColor && { accentColor: branding.accentColor }),
            ...(branding.companyName !== undefined && { companyName: branding.companyName }),
            ...(branding.taxId !== undefined && { taxId: branding.taxId }),
            ...(branding.supportEmail !== undefined && { supportEmail: branding.supportEmail }),
            ...(branding.supportPhone !== undefined && { supportPhone: branding.supportPhone }),
          }
        })
      }
    }

    // 2. Update Organization if exists
    if (org) {
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          ...(name && { name }),
          ...(plan && { subscription: plan }),
          ...(status && { status }),
          ...(ownerName && { ownerName }),
          ...(ownerEmail && { ownerEmail }),
          ...(ownerPhone && { ownerPhone }),
          ...(branding?.logoUrl !== undefined && { logoUrl: branding.logoUrl }),
          ...(branding?.faviconUrl !== undefined && { faviconUrl: branding.faviconUrl }),
          ...(branding?.companyName !== undefined && { companyName: branding.companyName }),
          ...(branding?.taxId !== undefined && { gstNumber: branding.taxId }),
        }
      })
    }

    // 3. Update User email/name if provided
    if (ownerEmail || ownerName) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { activeTenantId: tenant?.id },
            { organizationId: org?.id },
            { email: tenant?.members[0]?.user?.email || org?.ownerEmail || "" }
          ]
        }
      })

      if (user) {
        const nameParts = (ownerName || "").trim().split(" ")
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(ownerEmail && { email: ownerEmail }),
            ...(nameParts[0] && { firstName: nameParts[0] }),
            ...(nameParts.length > 1 && { lastName: nameParts.slice(1).join(" ") }),
            ...(ownerPhone && { phone: ownerPhone }),
          }
        }).catch(() => {})
      }
    }

    return NextResponse.json({
      success: true,
      message: "Garage subscription plan, enabled modules, and controls updated successfully!"
    })
  } catch (error: any) {
    console.error("Update garage settings error:", error)
    return NextResponse.json({ error: error.message || "Failed to update garage" }, { status: 500 })
  }
}
