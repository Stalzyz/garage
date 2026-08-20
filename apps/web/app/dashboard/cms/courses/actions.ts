"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { LessonType } from "@grekam/db"

export async function createModule(lmsCourseId: string, title: string) {
  // Find max sortOrder
  const existingModules = await prisma.lMSModule.findMany({
    where: { lmsCourseId },
    orderBy: { sortOrder: 'desc' },
    take: 1
  })
  
  const sortOrder = existingModules.length > 0 ? existingModules[0].sortOrder + 1 : 0

  await prisma.lMSModule.create({
    data: {
      lmsCourseId,
      title,
      sortOrder,
    }
  })

  revalidatePath(`/dashboard/cms/courses/${lmsCourseId}`)
}

export async function updateModule(id: string, title: string) {
  const module = await prisma.lMSModule.update({
    where: { id },
    data: { title }
  })
  revalidatePath(`/dashboard/cms/courses/${module.lmsCourseId}`)
}

export async function deleteModule(id: string) {
  const module = await prisma.lMSModule.delete({
    where: { id }
  })
  revalidatePath(`/dashboard/cms/courses/${module.lmsCourseId}`)
}

export async function reorderModules(courseId: string, orderedModuleIds: string[]) {
  // Use transaction to update all sort orders
  const operations = orderedModuleIds.map((id, index) => 
    prisma.lMSModule.update({
      where: { id },
      data: { sortOrder: index }
    })
  )
  
  await prisma.$transaction(operations)
  revalidatePath(`/dashboard/cms/courses/${courseId}`)
}

// Lessons

export async function createLesson(moduleId: string, title: string, type: string) {
  const mod = await prisma.lMSModule.findUnique({ where: { id: moduleId }})
  if (!mod) return

  const existingLessons = await prisma.lMSLesson.findMany({
    where: { moduleId },
    orderBy: { sortOrder: 'desc' },
    take: 1
  })
  
  const sortOrder = existingLessons.length > 0 ? existingLessons[0].sortOrder + 1 : 0

  await prisma.lMSLesson.create({
    data: {
      moduleId,
      title,
      type: type as LessonType,
      sortOrder
    }
  })

  revalidatePath(`/dashboard/cms/courses/${mod.lmsCourseId}`)
}

export async function updateLesson(id: string, data: { title?: string, type?: LessonType, contentUrl?: string, description?: string }) {
  const lesson = await prisma.lMSLesson.update({
    where: { id },
    data,
    include: { module: true }
  })
  revalidatePath(`/dashboard/cms/courses/${lesson.module.lmsCourseId}`)
}

export async function deleteLesson(id: string) {
  const lesson = await prisma.lMSLesson.delete({
    where: { id },
    include: { module: true }
  })
  revalidatePath(`/dashboard/cms/courses/${lesson.module.lmsCourseId}`)
}

export async function reorderLessons(courseId: string, orderedLessonIds: string[]) {
  const operations = orderedLessonIds.map((id, index) => 
    prisma.lMSLesson.update({
      where: { id },
      data: { sortOrder: index }
    })
  )
  
  await prisma.$transaction(operations)
  revalidatePath(`/dashboard/cms/courses/${courseId}`)
}
