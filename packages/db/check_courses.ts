import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const courses = await prisma.course.findMany({
    select: { name: true, code: true }
  })
  const landingPages = await prisma.landingPage.findMany({
    select: { title: true, slug: true }
  })
  
  console.log("=== COURSES ===")
  console.log(courses)
  
  console.log("=== LANDING PAGES ===")
  console.log(landingPages)
}

main().catch(console.error).finally(() => prisma.$disconnect())
