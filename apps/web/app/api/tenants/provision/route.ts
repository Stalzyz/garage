import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      garageName, 
      ownerFirstName, 
      ownerLastName, 
      email, 
      phone, 
      subdomain, 
      plan = "Growth Garage",
      password,
      customDomain,
      customLogoUrl,
      brandColor
    } = body

    if (!garageName || !email) {
      return NextResponse.json(
        { error: "Garage Name and Owner Email are required" },
        { status: 400 }
      )
    }

    const slug = (subdomain || garageName).toLowerCase().replace(/[^a-z0-9]/g, "")
    const generatedPassword = password || `Garage@${Math.floor(1000 + Math.random() * 9000)}!`

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(generatedPassword, 10)

    // 1. Create or update User in PostgreSQL
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        status: "ACTIVE",
        role: "ADMIN",
        firstName: ownerFirstName || "Garage",
        lastName: ownerLastName || "Owner",
        phone: phone || null,
      },
      create: {
        email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        firstName: ownerFirstName || "Garage",
        lastName: ownerLastName || "Owner",
        phone: phone || null,
      }
    })

    // 2. Create Tenant / Organization record in PostgreSQL
    const tenant = await prisma.tenant.upsert({
      where: { slug },
      update: {
        name: garageName,
        plan,
        customDomain: customDomain || null,
        status: "ACTIVE",
      },
      create: {
        name: garageName,
        slug,
        plan,
        status: "ACTIVE",
        customDomain: customDomain || null,
        branding: {
          create: {
            companyName: garageName,
            logoUrl: customLogoUrl || null,
            primaryColor: brandColor || "#2563eb",
          }
        },
        features: {
          create: {
            crmEnabled: true,
            hrmEnabled: true,
            projectsEnabled: true,
            financeEnabled: true,
            portalEnabled: true,
            customDomainAllowed: plan.includes("Enterprise"),
            whiteLabelPdfAllowed: plan.includes("Enterprise") || plan.includes("Growth"),
          }
        }
      },
      include: {
        branding: true,
        features: true
      }
    })

    // 3. Link User to Tenant in tenantMember table
    await prisma.tenantMember.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: user.id
        }
      },
      update: { role: "OWNER" },
      create: {
        tenantId: tenant.id,
        userId: user.id,
        role: "OWNER"
      }
    })

    // 4. Update user activeTenantId
    await prisma.user.update({
      where: { id: user.id },
      data: { activeTenantId: tenant.id }
    })

    return NextResponse.json({
      success: true,
      message: `Garage "${garageName}" provisioned in database with real login credentials!`,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        customDomain: tenant.customDomain,
      },
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        tempPassword: generatedPassword,
      },
      loginUrl: `https://${tenant.slug}.grekam.in/login`
    })

  } catch (error: any) {
    console.error("Tenant provisioning error:", error)
    return NextResponse.json(
      { error: "Failed to provision tenant in database", details: error.message },
      { status: 500 }
    )
  }
}
