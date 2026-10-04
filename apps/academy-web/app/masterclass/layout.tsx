import type { Metadata } from "next"
import Script from "next/script"

export const metadata: Metadata = {
  title: "CREATIVEX 45 | Traditional Skills. AI-Powered Workflow.",
  description: "CREATIVEX 45 — 45-Day Intensive Masterclass in Graphic Design, Digital Marketing, Motion Graphics & AI Vibe Coding.",
  openGraph: {
    title: "CREATIVEX 45 | Traditional Skills. AI-Powered Workflow.",
    description: "45-Day Intensive Masterclass in Graphic Design, Digital Marketing, Motion Graphics & AI Vibe Coding.",
    url: "https://grekam.in/masterclass",
    siteName: "Grekam Creative Academy & Agency",
  },
}

export default function MasterclassLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1141630427850672');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1141630427850672&ev=PageView&noscript=1"
        />
      </noscript>
      {children}
    </>
  )
}

