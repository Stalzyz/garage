import type { Metadata } from "next"
import "./globals.css"
import { SmoothScroll } from "@/components/SmoothScroll"
import { OrganizationProvider } from "@/context/OrganizationContext"

export const metadata: Metadata = {
  title: "Grekam OS",
  description: "Unified Enterprise System for Agency and Academy",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <OrganizationProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </OrganizationProvider>
      </body>
    </html>
  )
}
