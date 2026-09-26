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
  metadataBase: new URL('https://garage.grekam.in'),
  title: {
    default: 'Garage CRM — Garage Operations, Sales & CRM Platform',
    template: '%s | Garage CRM'
  },
  description: 'Garage CRM brings your customers, vehicles, leads, service operations, employees, finance and growth into one simple platform.',
  openGraph: {
    title: 'Garage CRM — Garage Operations, Sales & CRM Platform',
    description: 'Get more customer leads. Grow your garage sales faster with Garage CRM.',
    url: 'https://garage.grekam.in',
    siteName: 'Garage CRM',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Garage CRM Dashboard Preview',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garage CRM — Operations & Growth Platform',
    description: 'All-in-one CRM, garage operations, billing, and team management platform.',
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
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap" rel="stylesheet" />
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
                var msg = (e && e.message ? e.message : '').toLowerCase();
                var target = e && e.target ? (e.target.src || e.target.href || '') : '';
                if (msg.indexOf('chunk') !== -1 || msg.indexOf('dynamically imported') !== -1 || target.indexOf('_next/static') !== -1) {
                  var key = 'last_chunk_reload';
                  var lastReload = parseInt(sessionStorage.getItem(key) || '0', 10);
                  if (Date.now() - lastReload > 5000) {
                    sessionStorage.setItem(key, Date.now().toString());
                    window.location.href = window.location.pathname + '?_ts=' + Date.now();
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
