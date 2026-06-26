import { auth } from "../../auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import StudentLayoutClient from "./student-layout-client"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <SessionProvider session={session}>
      <StudentLayoutClient>
        {children}
      </StudentLayoutClient>
    </SessionProvider>
  )
}
