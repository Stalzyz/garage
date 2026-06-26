import { auth } from "../../auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import PortalLayoutClient from "./portal-layout-client"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <SessionProvider session={session}>
      <PortalLayoutClient>
        {children}
      </PortalLayoutClient>
    </SessionProvider>
  )
}
