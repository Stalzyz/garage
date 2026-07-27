import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Edit } from "lucide-react"

export default async function CoursesPage() {
  const lmsCourses = await prisma.lMSCourse.findMany({
    include: {
      course: true,
      _count: {
        select: { modules: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Courses & Curriculum</h2>
        <div className="flex items-center space-x-2">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" /> Create Course (Coming Soon)
          </Button>
        </div>
      </div>

      <div className="rounded-md border p-0 overflow-hidden bg-background">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-muted text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium border-b">Course Name</th>
              <th className="px-6 py-4 font-medium border-b">Code</th>
              <th className="px-6 py-4 font-medium border-b">Status</th>
              <th className="px-6 py-4 font-medium border-b">Modules</th>
              <th className="px-6 py-4 font-medium border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lmsCourses.map((lms) => (
              <tr key={lms.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">{lms.course.name}</td>
                <td className="px-6 py-4">{lms.course.code}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${lms.isPublished ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    {lms.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4">{lms._count.modules}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/dashboard/cms/courses/${lms.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="mr-2 h-4 w-4" /> Builder
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {lmsCourses.length === 0 && (
              <tr>
                <td colSpan={5} className="h-24 text-center text-muted-foreground px-6 py-4">
                  No courses found. Seed the database to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
