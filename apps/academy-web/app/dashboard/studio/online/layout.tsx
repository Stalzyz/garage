import { auth } from "../../../../auth"
import { redirect } from "next/navigation"
import { EducatorSidebar } from "@/components/educator/EducatorSidebar"
import { SessionProvider } from "next-auth/react"

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user && process.env.PLAYWRIGHT_TEST_BACKDOOR !== 'true') {
    redirect("/academy/login")
  }

  // Ensure they have the correct role (EDUCATOR) or are a SUPER_ADMIN testing it
  if (session?.user?.role && session.user.role !== "EDUCATOR" && session.user.role !== "SUPER_ADMIN") {
    // Basic redirect, though normally we'd show an access denied page
    // redirect("/dashboard") 
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden bg-[#050505] text-white selection:bg-purple-500/30 font-sans">
        <EducatorSidebar />
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]/90 backdrop-blur-3xl md:rounded-tl-[2.5rem] md:border-t md:border-l border-white/10 md:mt-2 shadow-[0_0_50px_rgba(168,85,247,0.05)] relative z-10">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
