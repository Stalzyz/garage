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
  metadataBase: new URL('https://academy.grekam.in'),
  title: {
    default: 'Grekam Academy — Master Design & Tech',
    template: '%s | Grekam Academy'
  },
  description: 'Learn design, visual arts, and digital technology from industry experts. Master professional tools with Grekam Academy.',
  openGraph: {
    title: 'Grekam Academy — Master Design & Technical Arts',
    description: 'Learn design, visual arts, and digital technology from industry experts. Hands-on projects, certification, and career placement.',
    url: 'https://academy.grekam.in',
    siteName: 'Grekam Academy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Grekam Academy Course Preview',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grekam Academy',
    description: 'Learn visual editing, color grading, and motion design.',
    images: ['/og-image.png'],
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
