import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { SmoothScroll } from "@/components/SmoothScroll"
import { OrganizationProvider } from "@/context/OrganizationContext"
import { Toaster } from "sonner"

// Self-hosted fonts. next/font/google fetched these from fonts.googleapis.com
// during `next build`, and an intermittent network failure there aborted the
// whole build with "next/font/google queries have exactly one entry" (seen
// 3 times in 5 attempts). Vendoring the latin woff2 files removes the build's
// third-party network dependency — and the runtime one, since next/font/google
// also links fonts.gstatic.com from the rendered HTML.
const inter = localFont({
  src: [
    { path: "./fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/inter-800.woff2", weight: "800", style: "normal" },
    { path: "./fonts/inter-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://grekam.in'),
  title: {
    default: 'Automated CRM — All-in-One Sales & Operations Platform',
    template: '%s | Automated CRM'
  },
  description: 'Automated CRM is the all-in-one workspace that brings your sales pipeline, client proposals, project delivery, team HR, finance, and automated WhatsApp follow-ups into one simple platform.',
  openGraph: {
    title: 'Automated CRM — All-in-One Sales & Operations Platform',
    description: 'Get more high-value clients. Close deals faster. Run your agency and business operations seamlessly with Garage CRM.',
    url: 'https://grekam.in',
    siteName: 'Garage CRM',
    images: [
      {
        url: '/garage_social_share.png',
        width: 1200,
        height: 630,
        alt: 'Garage CRM — All-in-One CRM, Sales & Operations Platform',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garage CRM — Operations & Growth Platform for Businesses',
    description: 'All-in-one CRM, sales pipelines, client proposals, billing, and team management platform.',
    images: ['/garage_social_share.png'],
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
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.className} ${inter.variable}`}>
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
