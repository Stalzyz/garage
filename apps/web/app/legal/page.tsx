import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Legal Policies | Grekam Visuals",
  description: "Legal policies, terms and conditions, privacy policy, and service policies for Grekam Visuals.",
}

export default function LegalIndexPage() {
  redirect("/legal/terms")
}
