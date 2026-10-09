import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userOrgId = (session.user as any).organizationId
    const userTenantId = (session.user as any).activeTenantId
    const userWsId = (session.user as any).workspaceId
    const userRole = (session.user as any).role

    // 1. Check Tenant Branding if user is attached to a Tenant
    if (userTenantId) {
      const tb = await prisma.tenantBranding.findUnique({
        where: { tenantId: userTenantId },
        include: { tenant: true }
      })
      if (tb) {
        return NextResponse.json({
          success: true,
          id: tb.id,
          name: tb.tenant.name,
          companyName: tb.companyName || tb.tenant.name,
          logoUrl: tb.logoUrl || null,
          faviconUrl: tb.faviconUrl || null,
          academyLogoUrl: tb.logoUrl || null,
          primaryColor: tb.primaryColor || "#2563eb",
          secondaryColor: tb.secondaryColor || "#7c3aed",
          accentColor: tb.accentColor || "#10b981",
          darkModeDefault: tb.darkModeDefault ?? true,
          supportEmail: tb.supportEmail || "support@grekam.in",
          phone: tb.supportPhone || "+91 99000 00000",
          website: tb.websiteUrl || "https://grekam.in",
          billingAddress: tb.billingAddress || "",
          gstNumber: tb.taxId || "",
          panNumber: tb.taxId || "",
          bankName: tb.bankName || "",
          accountName: tb.accountName || "",
          accountNumber: tb.accountNumber || "",
          bankAccountNo: tb.accountNumber || "",
          ifscCode: tb.ifscCode || "",
          bankIfsc: tb.ifscCode || "",
          swiftCode: tb.swiftCode || "",
          bankBranch: tb.bankBranch || "",
        })
      }
    }

    // 2. Check Organization by ID or Workspace ID or Master Org for Super Admin
    let org: any = null
    if (userRole === 'SUPER_ADMIN' || !userTenantId) {
      if (userOrgId) {
        org = await prisma.organization.findUnique({ where: { id: userOrgId } })
      }
      if (!org) {
        org = await prisma.organization.findFirst({
          where: {
            OR: [
              { workspaceId: "ws_default_admin" },
              { domain: "grekam.in" },
              { ownerEmail: { equals: "admin@grekam.in", mode: "insensitive" } },
            ]
          }
        })
      }
    }

    if (!org && userOrgId) {
      org = await prisma.organization.findUnique({ where: { id: userOrgId } })
    }
    if (!org && userWsId) {
      org = await prisma.organization.findUnique({ where: { workspaceId: userWsId } })
    }
    if (!org) {
      org = await prisma.organization.findFirst({
        where: {
          OR: [
            { workspaceId: "ws_default_admin" },
            { domain: "grekam.in" },
            { ownerEmail: { equals: "admin@grekam.in", mode: "insensitive" } },
          ]
        }
      })
    }
    if (!org) {
      org = await prisma.organization.findFirst()
    }

    if (!org) {
      org = await prisma.organization.create({
        data: {
          workspaceId: "ws_default_admin",
          name: "Grekam Garage OS",
          companyName: "Grekam Garage & Technologies Pvt Ltd",
          domain: "grekam.in",
          ownerEmail: "admin@grekam.in",
          primaryColor: "#2563eb",
          secondaryColor: "#7c3aed",
          accentColor: "#10b981",
          darkModeDefault: true,
          supportEmail: "support@grekam.in",
          phone: "+91 99000 00000",
          website: "https://grekam.in",
          billingAddress: "MG Road, Tech Park, Bangalore, Karnataka, India",
          gstNumber: "29AAAAA0000A1Z5",
          panNumber: "AAAAA0000A",
          bankName: "HDFC Bank Ltd",
          accountName: "Grekam Garage & Technologies Pvt Ltd",
          accountNumber: "50200012345678",
          ifscCode: "HDFC0000123",
          swiftCode: "HDFCINBB",
          bankBranch: "Indiranagar, Bangalore",
        }
      })
    }

    return NextResponse.json({
      success: true,
      ...org,
      name: org.name || "Grekam Garage OS",
      companyName: org.companyName || "Grekam Garage & Technologies Pvt Ltd",
      logoUrl: org.logoUrl || null,
      faviconUrl: org.faviconUrl || null,
      academyLogoUrl: org.academyLogoUrl || null,
      primaryColor: org.primaryColor || "#2563eb",
      secondaryColor: org.secondaryColor || "#7c3aed",
      accentColor: org.accentColor || "#10b981",
      darkModeDefault: org.darkModeDefault ?? true,
      supportEmail: org.supportEmail || "support@grekam.in",
      phone: org.phone || "+91 99000 00000",
      website: org.website || "https://grekam.in",
      billingAddress: org.billingAddress || "",
      gstNumber: org.gstNumber || "",
      panNumber: org.panNumber || "",
      bankName: org.bankName || "",
      accountName: org.accountName || "",
      accountNumber: org.accountNumber || "",
      bankAccountNo: org.accountNumber || "",
      ifscCode: org.ifscCode || "",
      bankIfsc: org.ifscCode || "",
      swiftCode: org.swiftCode || "",
      bankBranch: org.bankBranch || "",
    })
  } catch (error: any) {
    console.error("Fetch organization settings error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch organization settings" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const userOrgId = (session.user as any).organizationId
    const userTenantId = (session.user as any).activeTenantId
    const userWsId = (session.user as any).workspaceId
    const userRole = (session.user as any).role

    const accNumber = body.accountNumber || body.bankAccountNo
    const ifsc = body.ifscCode || body.bankIfsc

    if (userTenantId) {
      const updatedTb = await prisma.tenantBranding.upsert({
        where: { tenantId: userTenantId },
        create: {
          tenantId: userTenantId,
          companyName: body.companyName || body.name || null,
          logoUrl: body.logoUrl || null,
          faviconUrl: body.faviconUrl || null,
          primaryColor: body.primaryColor || "#2563eb",
          secondaryColor: body.secondaryColor || "#7c3aed",
          accentColor: body.accentColor || "#10b981",
          darkModeDefault: body.darkModeDefault ?? true,
          supportEmail: body.supportEmail || null,
          supportPhone: body.phone || null,
          websiteUrl: body.website || null,
          billingAddress: body.billingAddress || null,
          taxId: body.gstNumber || body.panNumber || null,
          bankName: body.bankName || null,
          accountName: body.accountName || null,
          accountNumber: accNumber || null,
          ifscCode: ifsc || null,
          swiftCode: body.swiftCode || null,
          bankBranch: body.bankBranch || null,
        },
        update: {
          ...(body.companyName !== undefined && { companyName: body.companyName }),
          ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl || null }),
          ...(body.faviconUrl !== undefined && { faviconUrl: body.faviconUrl || null }),
          ...(body.primaryColor && { primaryColor: body.primaryColor }),
          ...(body.secondaryColor && { secondaryColor: body.secondaryColor }),
          ...(body.accentColor && { accentColor: body.accentColor }),
          ...(body.darkModeDefault !== undefined && { darkModeDefault: Boolean(body.darkModeDefault) }),
          ...(body.supportEmail !== undefined && { supportEmail: body.supportEmail || null }),
          ...(body.phone !== undefined && { supportPhone: body.phone || null }),
          ...(body.website !== undefined && { websiteUrl: body.website || null }),
          ...(body.billingAddress !== undefined && { billingAddress: body.billingAddress || null }),
          ...(body.gstNumber !== undefined && { taxId: body.gstNumber || null }),
          ...(body.bankName !== undefined && { bankName: body.bankName || null }),
          ...(body.accountName !== undefined && { accountName: body.accountName || null }),
          ...(accNumber !== undefined && { accountNumber: accNumber || null }),
          ...(ifsc !== undefined && { ifscCode: ifsc || null }),
          ...(body.swiftCode !== undefined && { swiftCode: body.swiftCode || null }),
          ...(body.bankBranch !== undefined && { bankBranch: body.bankBranch || null }),
        }
      })

      if (body.name) {
        await prisma.tenant.update({
          where: { id: userTenantId },
          data: { name: body.name }
        }).catch(() => {})
      }

      return NextResponse.json({
        success: true,
        message: "Tenant branding updated successfully!",
        ...updatedTb
      })
    }

    let org: any = null
    if (userRole === 'SUPER_ADMIN' || !userTenantId) {
      if (userOrgId) {
        org = await prisma.organization.findUnique({ where: { id: userOrgId } })
      }
      if (!org) {
        org = await prisma.organization.findFirst({
          where: {
            OR: [
              { workspaceId: "ws_default_admin" },
              { domain: "grekam.in" },
              { ownerEmail: { equals: "admin@grekam.in", mode: "insensitive" } },
            ]
          }
        })
      }
    }

    if (!org && userOrgId) {
      org = await prisma.organization.findUnique({ where: { id: userOrgId } })
    }
    if (!org && userWsId) {
      org = await prisma.organization.findUnique({ where: { workspaceId: userWsId } })
    }
    if (!org) {
      org = await prisma.organization.findFirst({
        where: {
          OR: [
            { workspaceId: "ws_default_admin" },
            { domain: "grekam.in" },
            { ownerEmail: { equals: "admin@grekam.in", mode: "insensitive" } },
          ]
        }
      })
    }
    if (!org) {
      org = await prisma.organization.findFirst()
    }
    if (!org) {
      org = await prisma.organization.create({
        data: {
          workspaceId: userWsId || "ws_default_admin",
          name: body.name || "Grekam Garage OS",
          companyName: body.companyName || "Grekam Garage & Technologies Pvt Ltd",
          domain: "grekam.in",
          ownerEmail: "admin@grekam.in",
        }
      })
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: org.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl || null }),
        ...(body.faviconUrl !== undefined && { faviconUrl: body.faviconUrl || null }),
        ...(body.academyLogoUrl !== undefined && { academyLogoUrl: body.academyLogoUrl || null }),
        ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
        ...(body.secondaryColor !== undefined && { secondaryColor: body.secondaryColor }),
        ...(body.accentColor !== undefined && { accentColor: body.accentColor }),
        ...(body.darkModeDefault !== undefined && { darkModeDefault: Boolean(body.darkModeDefault) }),
        ...(body.supportEmail !== undefined && { supportEmail: body.supportEmail || null }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.website !== undefined && { website: body.website || null }),
        ...(body.billingAddress !== undefined && { billingAddress: body.billingAddress || null }),
        ...(body.gstNumber !== undefined && { gstNumber: body.gstNumber || null }),
        ...(body.panNumber !== undefined && { panNumber: body.panNumber || null }),
        ...(body.bankName !== undefined && { bankName: body.bankName || null }),
        ...(body.accountName !== undefined && { accountName: body.accountName || null }),
        ...(accNumber !== undefined && { accountNumber: accNumber || null }),
        ...(ifsc !== undefined && { ifscCode: ifsc || null }),
        ...(body.swiftCode !== undefined && { swiftCode: body.swiftCode || null }),
        ...(body.bankBranch !== undefined && { bankBranch: body.bankBranch || null }),
      }
    })

    return NextResponse.json({
      success: true,
      message: "Organization settings updated successfully!",
      ...updatedOrg
    })
  } catch (error: any) {
    console.error("Update organization settings error:", error)
    return NextResponse.json({ error: error.message || "Failed to update organization settings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return PATCH(req)
}

