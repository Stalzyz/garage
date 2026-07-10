import { auth } from "../../auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import PortalLayoutClient from "./portal-layout-client"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  // Authentication check is handled by middleware (auth.config.ts)
  // for all routes under /portal/ (except /portal itself)

  return (
    <SessionProvider session={session}>
      <PortalLayoutClient>
        {children}
      </PortalLayoutClient>
    </SessionProvider>
  )
}
