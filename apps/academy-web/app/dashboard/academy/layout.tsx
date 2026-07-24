import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import { AcademyAdminSidebar } from "@/components/layout/AcademyAdminSidebar"
import { SessionProvider } from "next-auth/react"

export default async function AcademyAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/academy/login")
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-full w-full bg-[#0A0A0A] text-white font-sans">
        <AcademyAdminSidebar />
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A] relative z-10 p-4 md:p-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
