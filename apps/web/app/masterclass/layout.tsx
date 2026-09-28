import type { Metadata } from "next"

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
  return children
}
