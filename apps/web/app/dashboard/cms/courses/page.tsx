import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@grekam/ui/components/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@grekam/ui/components/table"
import { Badge } from "@grekam/ui/components/badge"
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lmsCourses.map((lms) => (
              <TableRow key={lms.id}>
                <TableCell className="font-medium">{lms.course.name}</TableCell>
                <TableCell>{lms.course.code}</TableCell>
                <TableCell>
                  <Badge variant={lms.isPublished ? "default" : "secondary"}>
                    {lms.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>{lms._count.modules}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/cms/courses/${lms.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="mr-2 h-4 w-4" /> Builder
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {lmsCourses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No courses found. Seed the database to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
