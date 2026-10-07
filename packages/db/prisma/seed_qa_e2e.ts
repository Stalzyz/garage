import { PrismaClient, UserRole, UserStatus, TenantStatus, TenantPlan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting QA_E2E seeding...');

  const prefix = 'QA_E2E_';
  const email = `${prefix}admin@grekam.in`.toLowerCase();
  
  // 1. Create or update the QA Admin User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      firstName: 'QA',
      lastName: 'Admin',
    },
  });
  console.log(`✅ Upserted User: ${user.email}`);

  // 2. Create or update QA Tenant
  const tenantSlug = `${prefix}TENANT`.toLowerCase();
  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: {
      name: `${prefix} Workspace`,
      status: TenantStatus.ACTIVE,
      plan: TenantPlan.ENTERPRISE,
    },
    create: {
      slug: tenantSlug,
      name: `${prefix} Workspace`,
      status: TenantStatus.ACTIVE,
      plan: TenantPlan.ENTERPRISE,
    },
  });
  console.log(`✅ Upserted Tenant: ${tenant.slug}`);

  // 3. Link User to Tenant (TenantMember)
  const tenantMember = await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: user.id,
      },
    },
    update: {
      role: 'OWNER',
    },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: 'OWNER',
    },
  });
  console.log(`✅ Linked User to Tenant as OWNER`);

  // 4. Also set activeTenantId for the user
  await prisma.user.update({
    where: { id: user.id },
    data: { activeTenantId: tenant.id },
  });

  // 5. Create an Employee record for testing leaves
  await prisma.employee.upsert({
    where: {
      userId: user.id
    },
    update: {
      employmentType: 'FULL_TIME',
    },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      employmentType: 'FULL_TIME',
      joiningDate: new Date(),
      currency: 'USD',
      jobTitle: 'QA Engineer',
      employeeCode: 'QA-001',
    }
  });
  console.log(`✅ Upserted Employee record for User`);

  console.log('🎉 QA_E2E Seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log(`Login Email: ${email}`);
  console.log(`Password:    Password123!`);
  console.log(`Tenant Slug: ${tenant.slug}`);
}

main()
  .catch((e) => {
    console.error('Error during QA seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
