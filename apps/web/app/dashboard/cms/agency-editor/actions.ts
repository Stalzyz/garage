"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveAgencyData(jsonStr: string) {
  try {
    const data = JSON.parse(jsonStr)

    // Ensure the array structure is somewhat valid
    if (!Array.isArray(data)) {
      throw new Error("Data must be a JSON array of cards")
    }

    const page = await prisma.landingPage.findUnique({
      where: { slug: 'agency' },
      include: { sections: { where: { sectionId: 'agency-main-data' } } }
    })

    if (!page || !page.sections || page.sections.length === 0) {
      throw new Error("Agency landing page record not found in database. Please seed it first.")
    }

    await prisma.pageSection.update({
      where: { id: page.sections[0].id },
      data: { content: data }
    })

    revalidatePath("/agency")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save JSON" }
  }
}
