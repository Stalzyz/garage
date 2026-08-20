import { auth } from "../../auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import PortalLayoutClient from "./portal-layout-client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  let session = null
  try {
    session = await auth()
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('DYNAMIC_SERVER_USAGE')) {
      throw err
    }
    console.warn("Session check in PortalLayout failed gracefully:", err)
  }
  
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
