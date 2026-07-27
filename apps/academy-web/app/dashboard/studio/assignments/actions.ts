"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createAssignment(data: { title: string, brief: string, maxScore: number }) {
  const assignment = await prisma.assignment.create({
    data: {
      title: data.title,
      brief: data.brief,
      maxScore: data.maxScore
    }
  })

  revalidatePath(`/dashboard/studio/assignments`)
  return assignment
}

export async function getAssignments() {
  return await prisma.assignment.findMany({
    orderBy: { createdAt: 'desc' }
  })
}
