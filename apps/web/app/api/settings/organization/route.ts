import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let org = await prisma.organization.findFirst()

    if (!org) {
      org = await prisma.organization.create({
        data: {
          workspaceId: "ws_default_admin",
          name: "Grekam Garage OS",
          companyName: "Grekam Garage & Technologies Pvt Ltd",
          primaryColor: "#2563eb",
          secondaryColor: "#7c3aed",
          accentColor: "#10b981",
          darkModeDefault: true,
          supportEmail: "support@grekam.in",
          phone: "+91 99000 00000",
          website: "https://garage.grekam.in",
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
      website: org.website || "https://garage.grekam.in",
      billingAddress: org.billingAddress || "",
      gstNumber: org.gstNumber || "",
      panNumber: org.panNumber || "",
      bankName: org.bankName || "",
      accountName: org.accountName || "",
      accountNumber: org.accountNumber || "",
      ifscCode: org.ifscCode || "",
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

    let org = await prisma.organization.findFirst()
    if (!org) {
      org = await prisma.organization.create({
        data: {
          workspaceId: "ws_default_admin",
          name: body.name || "Grekam Garage OS",
          companyName: body.companyName || "Grekam Garage & Technologies Pvt Ltd",
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
        ...(body.accountNumber !== undefined && { accountNumber: body.accountNumber || null }),
        ...(body.ifscCode !== undefined && { ifscCode: body.ifscCode || null }),
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
