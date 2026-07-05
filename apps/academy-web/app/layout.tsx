import type { Metadata } from "next"
import { Inter, Caveat } from "next/font/google"
import "./globals.css"
import { SmoothScroll } from "@/components/SmoothScroll"
import { OrganizationProvider } from "@/context/OrganizationContext"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" })

export const metadata: Metadata = {
  title: "Grekam Design Academy",
  description: "Master Design & Tech with Grekam Academy",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C] font-sans antialiased">
        <OrganizationProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </OrganizationProvider>
      </body>
    </html>
  )
}
