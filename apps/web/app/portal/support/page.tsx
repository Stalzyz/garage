import { SupportTickets } from "@/components/portal/SupportTickets"

export default function PortalSupportPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#050505] text-white min-h-screen">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Client Support</h1>
      <SupportTickets />
    </div>
  )
}
