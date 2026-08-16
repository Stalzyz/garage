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
  metadataBase: new URL('https://grekam.in'),
  title: {
    default: 'Grekam OS — Enterprise Operating System',
    template: '%s | Grekam OS'
  },
  description: 'Enterprise operational system and client portal for Grekam Visuals Agency and Grekam Academy.',
  openGraph: {
    title: 'Grekam OS — Agency & Academy Enterprise operational platform',
    description: 'Unified operational system for managing clients, CRM proposals, student LMS coursework, and finance payrolls.',
    url: 'https://grekam.in',
    siteName: 'Grekam OS',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Grekam OS Dashboard Preview',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grekam OS',
    description: 'Operational engine for creative teams.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${barlowCondensed.variable} ${inter.variable}`}>
        <OrganizationProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <Toaster position="bottom-right" theme="dark" />
        </OrganizationProvider>
      </body>
    </html>
  )
}
