"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ResellerWhiteLabelRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/partner/whitelabel")
  }, [router])
  return <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 text-xs">Redirecting to White Label...</div>
}
