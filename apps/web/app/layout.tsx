import type { Metadata } from "next"
import { Barlow_Condensed, Inter } from "next/font/google"
import "./globals.css"
import { SmoothScroll } from "@/components/SmoothScroll"
import { OrganizationProvider } from "@/context/OrganizationContext"
import { Toaster } from "sonner"

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
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
      <body className={`min-h-screen bg-background font-sans antialiased ${barlowCondensed.variable} ${inter.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: `window.addEventListener("error", function(e) { var el = document.createElement("div"); el.style.cssText = "position:fixed;top:0;left:0;z-index:99999;background:red;color:white;padding:20px;font-size:20px;max-width:100vw;word-wrap:break-word;"; el.innerHTML = e.message + "<br>" + e.filename + ":" + e.lineno; document.body.appendChild(el); }); window.addEventListener("unhandledrejection", function(e) { var el = document.createElement("div"); el.style.cssText = "position:fixed;top:0;left:0;z-index:99999;background:red;color:white;padding:20px;font-size:20px;max-width:100vw;word-wrap:break-word;"; el.innerHTML = "Unhandled Promise: " + (e.reason ? e.reason.message : e.reason); document.body.appendChild(el); });` }} /><OrganizationProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <Toaster position="bottom-right" theme="dark" />
        </OrganizationProvider>
      </body>
    </html>
  )
}
