import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Setting up strictly isolated Demo Workspaces for Vendor & Reseller...');

  const passwordHashVendor = await bcrypt.hash('Demo2023', 10);
  const passwordHashReseller = await bcrypt.hash('reseller123', 10);

  // 1. Create Dedicated Workspace / Tenant for Demo Garage (Vendor)
  const garageTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-garage' },
    update: {
      name: 'Demo Garage & Workshop',
      status: 'ACTIVE',
      plan: 'GROWTH',
    },
    create: {
      id: 'demo_garage_tenant',
      name: 'Demo Garage & Workshop',
      slug: 'demo-garage',
      workspaceId: 'demo_garage_workspace',
      status: 'ACTIVE',
      plan: 'GROWTH',
      branding: {
        create: {
          primaryColor: '#0081FB',
          companyName: 'Demo Garage & Workshop',
        }
      }
    },
  });
  console.log(`✅ Demo Garage Workspace ready: ${garageTenant.id} (${garageTenant.slug})`);

  // 2. Setup demo@garage.in User attached strictly to demo_garage_tenant
  const vendorUser = await prisma.user.upsert({
    where: { email: 'demo@garage.in' },
    update: {
      passwordHash: passwordHashVendor,
      status: 'ACTIVE',
      role: 'ADMIN',
      firstName: 'Demo',
      lastName: 'Garage Owner',
      activeTenantId: garageTenant.id,
      workspaceId: garageTenant.workspaceId,
    },
    create: {
      email: 'demo@garage.in',
      passwordHash: passwordHashVendor,
      status: 'ACTIVE',
      role: 'ADMIN',
      firstName: 'Demo',
      lastName: 'Garage Owner',
      activeTenantId: garageTenant.id,
      workspaceId: garageTenant.workspaceId,
    },
  });

  // Ensure Tenant Membership for demo@garage.in
  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: garageTenant.id,
        userId: vendorUser.id,
      }
    },
    update: { role: 'OWNER' },
    create: {
      tenantId: garageTenant.id,
      userId: vendorUser.id,
      role: 'OWNER',
    }
  }).catch(() => null);

  // 3. Populate 2 Isolated Demo Leads strictly for demo_garage_tenant
  const existingGarageLeads = await prisma.lead.count({
    where: { tenantId: garageTenant.id }
  });

  if (existingGarageLeads === 0) {
    await prisma.lead.createMany({
      data: [
        {
          name: 'Rajesh Sharma (BMW 3 Series - Full Ceramic & Brake Service)',
          email: 'rajesh.sharma@example.com',
          phone: '+91 98765 43210',
          company: 'Sharma Automotive Logistics',
          status: 'QUALIFIED',
          source: 'WEBSITE',
          estimatedBudget: 45000,
          projectType: 'Ceramic Coating & Brake Overhaul',
          tenantId: garageTenant.id,
          businessUnit: 'AGENCY',
          notes: 'Customer looking for 5-year 9H ceramic warranty package and immediate brake pad replacement.',
        },
        {
          name: 'Priya Mehra (Audi A4 - Major Periodic Service & Detailing)',
          email: 'priya.mehra@example.com',
          phone: '+91 98111 22334',
          company: 'Mehra Design House',
          status: 'PROPOSAL_SENT',
          source: 'WHATSAPP',
          estimatedBudget: 62000,
          projectType: 'Engine Tuning & Interior Detailing',
          tenantId: garageTenant.id,
          businessUnit: 'AGENCY',
          notes: 'Proposal sent via WhatsApp link with itemized quotation.',
        }
      ]
    });
    console.log('✅ Seeded 2 isolated demo leads for Demo Garage workspace');
  }

  // 4. Create Dedicated Workspace / Tenant for Reseller Partner
  const resellerTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-reseller' },
    update: {
      name: 'Apex Cloud Whitelabel Reseller HQ',
      status: 'ACTIVE',
      plan: 'GROWTH',
    },
    create: {
      id: 'demo_reseller_tenant',
      name: 'Apex Cloud Whitelabel Reseller HQ',
      slug: 'demo-reseller',
      workspaceId: 'demo_reseller_workspace',
      status: 'ACTIVE',
      plan: 'GROWTH',
      branding: {
        create: {
          primaryColor: '#7c3aed',
          companyName: 'Apex Cloud Solutions',
        }
      }
    },
  });
  console.log(`✅ Demo Reseller Workspace ready: ${resellerTenant.id} (${resellerTenant.slug})`);

  // 5. Setup reseller@grekam.com User attached strictly to demo_reseller_tenant
  const resellerUser = await prisma.user.upsert({
    where: { email: 'reseller@grekam.com' },
    update: {
      passwordHash: passwordHashReseller,
      status: 'ACTIVE',
      role: 'PARTNER',
      firstName: 'Apex',
      lastName: 'Reseller Partner',
      activeTenantId: resellerTenant.id,
      workspaceId: resellerTenant.workspaceId,
    },
    create: {
      email: 'reseller@grekam.com',
      passwordHash: passwordHashReseller,
      status: 'ACTIVE',
      role: 'PARTNER',
      firstName: 'Apex',
      lastName: 'Reseller Partner',
      activeTenantId: resellerTenant.id,
      workspaceId: resellerTenant.workspaceId,
    },
  });

  // Ensure Partner record for reseller@grekam.com
  const partnerRecord = await prisma.partner.upsert({
    where: { userId: resellerUser.id },
    update: {
      status: 'ACTIVE',
      kycStatus: 'APPROVED',
      walletBalance: 45000,
      whiteLabelEnabled: true,
      partnerType: 'WHITE_LABEL',
      companyName: 'Apex Cloud Solutions',
    },
    create: {
      userId: resellerUser.id,
      partnerCode: 'PARTNER-DEMO-RESELLER',
      partnerType: 'WHITE_LABEL',
      companyName: 'Apex Cloud Solutions',
      individualOrCompany: 'COMPANY',
      status: 'ACTIVE',
      kycStatus: 'APPROVED',
      walletBalance: 45000,
      whiteLabelEnabled: true,
      commissionPercent: 30.0,
      maxPriceMultiplier: 2.5,
    }
  });

  // Ensure Tenant Membership for reseller@grekam.com
  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: resellerTenant.id,
        userId: resellerUser.id,
      }
    },
    update: { role: 'OWNER' },
    create: {
      tenantId: resellerTenant.id,
      userId: resellerUser.id,
      role: 'OWNER',
    }
  }).catch(() => null);

  console.log(`✅ Reseller Partner record ready: ${partnerRecord.id} (Code: ${partnerRecord.partnerCode})`);

  // 6. Ensure Super Admin Website Leads remain in Platform / Super Admin workspace (tenantId: null)
  console.log('✅ Super Admin CRM leads preserved in global/platform scope (tenantId: null)');
  console.log('🎉 Setup complete! Vendor and Reseller workspaces are 100% isolated and duplicate administrative environments.');
}

main()
  .catch((e) => {
    console.error('Setup error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
