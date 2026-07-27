import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CourseBuilderClient } from "./CourseBuilderClient"
import { Button } from "@grekam/ui/components/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CourseCurriculumPage({ params }: { params: { id: string } }) {
  const lmsCourse = await prisma.lMSCourse.findUnique({
    where: { id: params.id },
    include: {
      course: true,
      modules: {
        orderBy: { sortOrder: 'asc' },
        include: {
          lessons: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      }
    }
  })

  if (!lmsCourse) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cms/courses">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{lmsCourse.course.name}</h2>
          <p className="text-muted-foreground">Curriculum Builder</p>
        </div>
      </div>

      <CourseBuilderClient 
        courseId={lmsCourse.id} 
        initialModules={lmsCourse.modules} 
      />
    </div>
  )
}
