import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    absolute: "Creativex-45",
  },
  description: "CREATIVEX 45 — 45-Day Intensive Masterclass in Graphic Design, Digital Marketing, Motion Graphics & AI Vibe Coding.",
  openGraph: {
    title: "Creativex-45",
    description: "45-Day Intensive Masterclass in Graphic Design, Digital Marketing, Motion Graphics & AI Vibe Coding.",
    url: "https://grekam.in/masterclass",
    siteName: "Grekam Creative Academy & Agency",
  },
}

export default function MasterclassLayout({ children }: { children: React.ReactNode }) {
  return children
}
