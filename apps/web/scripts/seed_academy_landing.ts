import { PrismaClient } from "@grekam/db"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding Academy landing page dynamic content...")

  // 1. Hiring Partners
  await prisma.placementCompany.createMany({
    data: [
      { name: "Google", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", industry: "Tech" },
      { name: "Meta", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg", industry: "Tech" },
      { name: "Netflix", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", industry: "Entertainment" },
      { name: "Adobe", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Adobe_Corporate_logo.svg", industry: "Design" },
      { name: "Stripe", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg", industry: "Fintech" }
    ],
    skipDuplicates: true
  })
  console.log("✅ Seeded Hiring Partners")

  // 2. Instructors
  const defaultPassword = await bcrypt.hash("Password123!", 10)
  
  const instructor1 = await prisma.user.upsert({
    where: { email: "johndoe@example.com" },
    update: {},
    create: {
      email: "johndoe@example.com",
      passwordHash: defaultPassword,
      role: "EDUCATOR",
      firstName: "John",
      lastName: "Doe",
      avatarUrl: "https://i.pravatar.cc/300?u=johndoe",
      educator: {
        create: {
          designation: "Senior UI/UX Designer",
          company: "Grekam Agency",
          bio: "John brings 10+ years of product design experience, having shipped products used by millions. He specializes in design systems and micro-interactions."
        }
      }
    }
  })

  const instructor2 = await prisma.user.upsert({
    where: { email: "sarahsmith@example.com" },
    update: {},
    create: {
      email: "sarahsmith@example.com",
      passwordHash: defaultPassword,
      role: "EDUCATOR",
      firstName: "Sarah",
      lastName: "Smith",
      avatarUrl: "https://i.pravatar.cc/300?u=sarahsmith",
      educator: {
        create: {
          designation: "Creative Director",
          company: "Studio X",
          bio: "An award-winning creative director blending strategy with cutting-edge visual design. Sarah mentors students to think beyond pixels."
        }
      }
    }
  })

  const instructor3 = await prisma.user.upsert({
    where: { email: "mikechen@example.com" },
    update: {},
    create: {
      email: "mikechen@example.com",
      passwordHash: defaultPassword,
      role: "EDUCATOR",
      firstName: "Mike",
      lastName: "Chen",
      avatarUrl: "https://i.pravatar.cc/300?u=mikechen",
      educator: {
        create: {
          designation: "Frontend Architect",
          company: "TechFlow",
          bio: "Mike bridges the gap between design and code. He teaches advanced frontend architectures using React, Next.js, and WebGL."
        }
      }
    }
  })
  console.log("✅ Seeded Instructors")

  // 3. Student Showcase
  const studentUser = await prisma.user.upsert({
    where: { email: "topstudent@example.com" },
    update: {},
    create: {
      email: "topstudent@example.com",
      passwordHash: defaultPassword,
      role: "STUDENT",
      firstName: "Alex",
      lastName: "Rivera",
      student: {
        create: {
          studentCode: "STU-001",
          portfolioProfile: {
            create: {
              bio: "Passionate about creating digital experiences.",
              projects: {
                create: [
                  {
                    title: "Fintech Dashboard Redesign",
                    description: "A complete overhaul of a legacy fintech application, focusing on accessibility and data visualization.",
                    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
                    linkUrl: "https://github.com"
                  },
                  {
                    title: "E-Commerce App",
                    description: "A high-performance mobile app for an emerging fashion brand with complex animations.",
                    imageUrl: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&q=80&w=1000",
                    linkUrl: "https://github.com"
                  }
                ]
              }
            }
          }
        }
      }
    }
  })
  console.log("✅ Seeded Student Showcase")

}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
