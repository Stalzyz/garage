"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ResellerSupportRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/partner/support")
  }, [router])
  return <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 text-xs">Redirecting to Support...</div>
}
