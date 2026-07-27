import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import BuilderClient from "./BuilderClient"

export default async function CourseBuilderPage({ params }: { params: { id: string } }) {
  const lmsCourse = await prisma.lMSCourse.findUnique({
    where: { id: params.id },
    include: {
      course: true,
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      }
    }
  })

  if (!lmsCourse) {
    notFound()
  }

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <BuilderClient initialCourse={lmsCourse} />
    </div>
  )
}
