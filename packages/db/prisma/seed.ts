import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { fakerEN_IN as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting massive database seed engine...');

  const passwordHash = await bcrypt.hash('Photoshop09@', 10);

  // 1. Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@grekam.in' },
    update: { passwordHash },
    create: {
      email: 'admin@grekam.in',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      firstName: 'Stalin',
      lastName: 'Kumar',
    },
  });
  console.log('✅ Created Super Admin');

  // 2. Generate 20 Faculty / Educators
  console.log('👨‍🏫 Generating 20 Faculty members...');
  const facultyList = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        passwordHash,
        role: 'EDUCATOR',
        status: 'ACTIVE',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number({ style: 'national' }),
        educator: {
          create: {
            designation: faker.person.jobTitle(),
            bio: faker.lorem.paragraph(),
            skills: faker.helpers.arrayElements(['Design', 'Marketing', 'VFX', 'Code', 'Business', 'Finance'], 2),
            yearsExperience: faker.number.int({ min: 2, max: 15 }),
          }
        }
      },
      include: { educator: true }
    });
    facultyList.push(user);
  }
  console.log('✅ Created 20 Faculty members');

  // 3. Generate 15 Courses
  console.log('📚 Generating 15 Courses...');
  const courseList = [];
  for (let i = 0; i < 15; i++) {
    const course = await prisma.course.create({
      data: {
        name: faker.commerce.department() + ' Masterclass ' + faker.number.int({ min: 101, max: 599 }),
        code: faker.string.alphanumeric(6).toUpperCase(),
        description: faker.lorem.paragraphs(2),
        duration: faker.number.int({ min: 4, max: 24 }) + ' Months',
        fee: faker.number.int({ min: 15000, max: 85000 }),
        isPublished: true,
      }
    });
    courseList.push(course);
  }
  console.log('✅ Created 15 Courses');

  // 4. Generate 30 Batches
  console.log('🕒 Generating 30 Batches...');
  const batchList = [];
  for (let i = 0; i < 30; i++) {
    const course = faker.helpers.arrayElement(courseList);
    const educator = (faker.helpers.arrayElement(facultyList) as any).educator;
    
    const batch = await prisma.batch.create({
      data: {
        courseId: course.id,
        educatorId: educator.id,
        name: `${course.name} - ${faker.helpers.arrayElement(['Morning', 'Evening', 'Weekend'])} Batch`,
        type: faker.helpers.arrayElement(['MORNING', 'EVENING', 'WEEKEND', 'ONLINE']),
        startDate: faker.date.future(),
        endDate: faker.date.future({ years: 1 }),
        capacity: faker.number.int({ min: 15, max: 50 }),
      }
    });
    batchList.push(batch);
  }
  console.log('✅ Created 30 Batches');

  // 5. Generate 100 Students
  console.log('🎓 Generating 100 Students and Enrollments...');
  const studentList = [];
  for (let i = 0; i < 100; i++) {
    const batch = faker.helpers.arrayElement(batchList);
    
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number({ style: 'national' }),
        student: {
          create: {
            studentCode: faker.string.alphanumeric(10).toUpperCase(),
            deliveryMode: faker.helpers.arrayElement(['ONSITE', 'ONLINE', 'HYBRID']),
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            enrollments: {
              create: {
                batchId: batch.id,
                status: 'ACTIVE',
                totalFee: faker.number.int({ min: 15000, max: 85000 }),
                feePaid: faker.number.int({ min: 5000, max: 15000 }),
              }
            }
          }
        }
      },
      include: { student: { include: { enrollments: true } } }
    });
    studentList.push(user);
  }
  console.log('✅ Created 100 Students');

  // 6. Generate 20 Companies & 25 Placements
  console.log('🏢 Generating 20 Companies & Placements...');
  const companyList = [];
  for (let i = 0; i < 20; i++) {
    const company = await prisma.company.create({
      data: {
        name: faker.company.name(),
        website: faker.internet.url(),
        industry: faker.company.buzzNoun(),
        size: faker.helpers.arrayElement(['1-10', '11-50', '51-200', '201-500', '500+']),
      }
    });
    companyList.push(company);
  }
  console.log('✅ Created 20 Companies');

  // 7. Generate CRM Leads
  console.log('🎯 Generating CRM Leads...');
  for (let i = 0; i < 50; i++) {
    await prisma.lead.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'national' }),
        source: faker.helpers.arrayElement(['WEBSITE', 'LINKEDIN', 'REFERRAL', 'OTHER']),
        status: faker.helpers.arrayElement(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'LOST']),
        projectType: faker.commerce.department(),
        estimatedBudget: faker.number.int({ min: 10000, max: 200000 }),
      }
    });
  }
  console.log('✅ Created 50 CRM Leads');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
