import type { Metadata } from "next"
import { Barlow_Condensed } from "next/font/google"
import "./globals.css"
import { SmoothScroll } from "@/components/SmoothScroll"
import { OrganizationProvider } from "@/context/OrganizationContext"

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
})

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${barlowCondensed.variable}`}>
        <OrganizationProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </OrganizationProvider>
      </body>
    </html>
  )
}
