import { auth } from "../../auth"
import { redirect } from "next/navigation"
import { TopNav } from "@/components/layout/TopNav"
import { SessionProvider } from "next-auth/react"
import { CommandPalette } from "@/components/ui/CommandPalette"
import { TelemetryNotifier } from "@/components/TelemetryNotifier"
import { WebSocketProvider } from "@/components/providers/WebSocketProvider"

import { CurrentUserProvider } from "@/context/CurrentUserContext"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  return (
      <SessionProvider session={session}>
        <div className="flex flex-col h-screen overflow-hidden bg-[#0A0A0A] text-white selection:bg-blue-500/30 font-sans">
          <WebSocketProvider>
            <CurrentUserProvider>
              <TopNav />
              <main className="flex-1 overflow-hidden flex flex-row min-w-0 bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-2xl relative z-10">
                {children}
              </main>
              <CommandPalette />
              <TelemetryNotifier />

            </CurrentUserProvider>
          </WebSocketProvider>
        </div>
      </SessionProvider>
  )
}
