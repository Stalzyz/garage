import type { Metadata } from "next"
import { Inter, Caveat, Space_Grotesk, Playfair_Display } from "next/font/google"
import "./globals.css"
import { SmoothScroll } from "@/components/SmoothScroll"
import { OrganizationProvider } from "@/context/OrganizationContext"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

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
    <html lang="en" className={`${inter.variable} ${caveat.variable} ${spaceGrotesk.variable} ${playfair.variable}`}>
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
