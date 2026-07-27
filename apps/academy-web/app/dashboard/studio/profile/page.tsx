import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "../../../../auth"
import ProfileBuilderClient from "./ProfileBuilderClient"

export default async function ProfileBuilderPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/academy/login")
  }

  const educator = await prisma.educator.findUnique({
    where: { userId: session.user.id },
    include: {
      batches: {
        include: {
          course: true
        }
      }
    }
  })

  if (!educator) {
    // If they aren't an educator, they shouldn't be here
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <ProfileBuilderClient initialEducator={educator} />
    </div>
  )
}
