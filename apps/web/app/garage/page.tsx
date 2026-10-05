import type { Metadata } from "next"
import GarageLandingClient from "./GarageLandingClient"

export const metadata: Metadata = {
  title: "Garage OS — All-in-One CRM, Sales & Operations Platform",
  description: "Automated sales pipelines, GST invoicing, job cards, Android telecaller sync, & HR portal for garage owners and enterprise operations.",
}

export default function Page() {
  return <GarageLandingClient />
}
