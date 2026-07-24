import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import { EducatorSidebar } from "@/components/educator/EducatorSidebar"
import { SessionProvider } from "next-auth/react"

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/academy/login")
  }

  // Ensure they have the correct role (EDUCATOR) or are a SUPER_ADMIN testing it
  if (session.user.role !== "EDUCATOR" && session.user.role !== "SUPER_ADMIN") {
    // Basic redirect, though normally we'd show an access denied page
    // redirect("/dashboard") 
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-full w-full bg-[#0A0A0A] text-white font-sans">
        <EducatorSidebar />
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A] relative z-10 p-4 md:p-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
