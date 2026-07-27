"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function checkSlugAvailability(slug: string, currentEducatorId: string) {
  const existing = await prisma.educator.findUnique({
    where: { slug }
  })
  
  if (existing && existing.id !== currentEducatorId) {
    return false
  }
  return true
}

export async function updateEducatorProfile(
  educatorId: string, 
  data: {
    slug?: string
    tagline?: string
    bio?: string
    youtubeUrl?: string
    twitterUrl?: string
    instagramUrl?: string
    linkedInUrl?: string
    isPublic?: boolean
    profileLayout?: any
  }
) {
  
  if (data.slug) {
    const isAvailable = await checkSlugAvailability(data.slug, educatorId)
    if (!isAvailable) {
      throw new Error("Slug is already taken")
    }
  }

  const educator = await prisma.educator.update({
    where: { id: educatorId },
    data: {
      ...data,
      profileLayout: data.profileLayout ? JSON.parse(JSON.stringify(data.profileLayout)) : undefined
    }
  })

  revalidatePath(`/dashboard/studio/profile`)
  if (educator.slug) {
    revalidatePath(`/@${educator.slug}`)
  }

  return educator
}
