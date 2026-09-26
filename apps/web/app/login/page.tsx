"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DirectLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/auth/login")
  }, [router])

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
      <p className="text-xs text-zinc-500">Redirecting to Garage Customer Login...</p>
    </div>
  )
}
