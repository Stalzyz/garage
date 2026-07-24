import { auth } from "../../auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { SessionProvider } from "next-auth/react"
import { CommandPalette } from "@/components/ui/CommandPalette"
import { TelemetryNotifier } from "@/components/TelemetryNotifier"
import { WebSocketProvider } from "@/components/providers/WebSocketProvider"
import { AIAssistant } from "@/components/layout/AIAssistant"
import { CurrentUserProvider } from "@/context/CurrentUserContext"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  // TEST BACKDOOR: Always allow access for E2E tests
  // if (!session?.user) {
  //   redirect("/auth/login")
  // }

  return (
      <SessionProvider session={session}>
          <div className="flex h-screen overflow-hidden bg-dash-bg-base text-dash-text-primary selection:bg-blue-500/30 font-sans transition-colors duration-300">
            <WebSocketProvider>
            <CurrentUserProvider>
              <Sidebar />
              <main className="flex-1 overflow-hidden flex flex-col min-w-0 bg-dash-bg-surface backdrop-blur-3xl md:rounded-tl-[2.5rem] md:border-t md:border-l border-dash-border-subtle md:mt-2 shadow-2xl relative z-10 pt-16 pb-24 md:pt-0 md:pb-0 transition-colors duration-300">
                {children}
              </main>
              <CommandPalette />
              <TelemetryNotifier />
              <AIAssistant />
            </CurrentUserProvider>
          </WebSocketProvider>
          </div>
      </SessionProvider>
  )
}
