const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedDemoAndPartner() {
  console.log("🚀 Creating Demo Garage Account & Whitelabel Partner Account...");

  try {
    // 1. Create / Upsert Demo Garage Account (demo@grekam.in / demo123)
    const demoPasswordHash = await bcrypt.hash("demo123", 10);
    
    // Check if user exists
    let demoUser = await prisma.user.findUnique({ where: { email: "demo@grekam.in" } });
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          email: "demo@grekam.in",
          passwordHash: demoPasswordHash,
          firstName: "Demo",
          lastName: "Garage Owner",
          role: "ADMIN",
          status: "ACTIVE",
          phone: "+91 98765 43210",
        },
      });
      console.log("✅ Demo user created: demo@grekam.in");
    } else {
      demoUser = await prisma.user.update({
        where: { email: "demo@grekam.in" },
        data: {
          passwordHash: demoPasswordHash,
          role: "ADMIN",
          status: "ACTIVE",
        },
      });
      console.log("✅ Demo user updated: demo@grekam.in");
    }

    // Create Tenant / Organization for Demo Garage
    let demoTenant = await prisma.tenant.findFirst({
      where: { name: "Demo Garage" },
    });

    if (!demoTenant) {
      demoTenant = await prisma.tenant.create({
        data: {
          name: "Demo Garage",
          slug: "demo-garage",
          workspaceId: "ws_demo_garage",
          status: "ACTIVE",
          plan: "ENTERPRISE",
          branding: {
            create: {
              companyName: "Demo Auto Garage",
              primaryColor: "#2563eb",
              secondaryColor: "#1e40af",
              accentColor: "#10b981",
              logoUrl: "/garage-crm-logo.svg",
            },
          },
          features: {
            create: {
              crmEnabled: true,
              hrmEnabled: true,
              projectsEnabled: true,
              financeEnabled: true,
              portalEnabled: true,
              customDomainAllowed: false,
              whiteLabelPdfAllowed: false,
              aiAssistantAllowed: true,
            },
          },
        },
      });
      console.log("✅ Demo tenant created: Demo Garage");
    }

    // Link user to tenant
    await prisma.tenantMember.upsert({
      where: {
        userId_tenantId: {
          userId: demoUser.id,
          tenantId: demoTenant.id,
        },
      },
      create: {
        userId: demoUser.id,
        tenantId: demoTenant.id,
        role: "OWNER",
      },
      update: {
        role: "OWNER",
      },
    });

    await prisma.user.update({
      where: { id: demoUser.id },
      data: {
        activeTenantId: demoTenant.id,
        workspaceId: demoTenant.workspaceId,
      },
    });


    // 2. Create / Upsert Whitelabel Partner Account (partner@grekam.in / partner123)
    const partnerPasswordHash = await bcrypt.hash("partner123", 10);
    
    let partnerUser = await prisma.user.findUnique({ where: { email: "partner@grekam.in" } });
    if (!partnerUser) {
      partnerUser = await prisma.user.create({
        data: {
          email: "partner@grekam.in",
          passwordHash: partnerPasswordHash,
          firstName: "Partner",
          lastName: "Agency",
          role: "PARTNER",
          status: "ACTIVE",
          phone: "+91 99887 76655",
        },
      });
      console.log("✅ Partner user created: partner@grekam.in");
    } else {
      partnerUser = await prisma.user.update({
        where: { email: "partner@grekam.in" },
        data: {
          passwordHash: partnerPasswordHash,
          role: "PARTNER",
          status: "ACTIVE",
        },
      });
      console.log("✅ Partner user updated: partner@grekam.in");
    }

    // Create Partner profile for partnerUser
    let partnerProfile = await prisma.partner.findUnique({
      where: { userId: partnerUser.id },
    });

    if (!partnerProfile) {
      partnerProfile = await prisma.partner.create({
        data: {
          userId: partnerUser.id,
          companyName: "Grekam Whitelabel Partner",
          partnerType: "RESELLER",
          status: "ACTIVE",
          commissionPercent: 25.0,
          whiteLabelEnabled: true,
          maxPriceMultiplier: 2.0,
          wallet: {
            create: {
              balance: 10000.0,
              currency: "INR",
            },
          },
          whiteLabel: {
            create: {
              brandName: "Grekam Whitelabel Partner",
              customDomain: "partner.grekam.in",
              domainStatus: "VERIFIED",
            },
          },
        },
      });
      console.log("✅ Partner profile & whitelabel wallet created.");
    } else {
      await prisma.partner.update({
        where: { id: partnerProfile.id },
        data: {
          companyName: "Grekam Whitelabel Partner",
          status: "ACTIVE",
          whiteLabelEnabled: true,
          commissionPercent: 25.0,
        },
      });
      console.log("✅ Partner profile updated.");
    }

    console.log("🎉 Account creation complete!");
    console.log("------------------------------------------");
    console.log("1. Demo Garage Owner:");
    console.log("   Email: demo@grekam.in");
    console.log("   Password: demo123");
    console.log("   Role: ADMIN (Garage Owner)");
    console.log("------------------------------------------");
    console.log("2. Whitelabel Partner:");
    console.log("   Email: partner@grekam.in");
    console.log("   Password: partner123");
    console.log("   Role: PARTNER (Whitelabel Reseller)");
    console.log("------------------------------------------");

  } catch (error) {
    console.error("❌ Error seeding accounts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoAndPartner();
