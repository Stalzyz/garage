"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ResellerDashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/partner")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 text-xs font-sans">
      Redirecting to Partner Control Center...
    </div>
  )
}
