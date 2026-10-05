import type { Metadata } from "next"
import SplitEcosystemClient from "./SplitEcosystemClient"

export const metadata: Metadata = {
  title: "Grekam Ecosystem — Select Destination (Agency, Garage OS, Academy)",
  description: "Unified digital & enterprise portal for Grekam Visuals Agency, Garage OS CRM, and Grekam Academy.",
}

export default function Page() {
  return <SplitEcosystemClient />
}
