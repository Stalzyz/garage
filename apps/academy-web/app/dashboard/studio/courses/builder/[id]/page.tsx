import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import BuilderClient from "./BuilderClient"

export default async function CourseBuilderPage({ params }: { params: { id: string } }) {
  let lmsCourse = await prisma.lMSCourse.findUnique({
    where: { courseId: params.id },
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
    const baseCourse = await prisma.course.findUnique({ where: { id: params.id } })
    if (!baseCourse) {
      notFound()
    }
    
    lmsCourse = await prisma.lMSCourse.create({
      data: {
        courseId: baseCourse.id,
        draftStatus: "DRAFT"
      },
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
  }

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <BuilderClient initialCourse={lmsCourse} />
    </div>
  )
}
