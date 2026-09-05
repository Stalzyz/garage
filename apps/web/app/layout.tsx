import type { Metadata } from "next"
import { Barlow_Condensed, Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
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

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-code",
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
        url: '/og-image.png',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body className={`min-h-screen bg-background font-sans antialiased ${barlowCondensed.variable} ${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
        {/* Chunk-load self-healing: inline script runs synchronously before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              window.addEventListener('error', function(e) {
                var msg = e && e.message ? e.message : '';
                if (msg.indexOf('Loading chunk') !== -1 || msg.indexOf('Failed to fetch dynamically imported module') !== -1 || msg.indexOf('CSS_CHUNK_LOAD_FAILED') !== -1) {
                  var key = 'last_chunk_reload';
                  var lastReload = parseInt(sessionStorage.getItem(key) || '0', 10);
                  if (Date.now() - lastReload > 10000) {
                    sessionStorage.setItem(key, Date.now().toString());
                    window.location.reload();
                  }
                }
              }, true);
            } catch(e) {}
          })();
        `}} />
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
