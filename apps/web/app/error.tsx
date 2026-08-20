"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Uncaught application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center text-white font-sans">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Temporary Display Issue</h2>
      <p className="text-white/50 text-sm max-w-md mb-8">
        The application encountered a display sync issue. Click below to reload cleanly.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Reload Portal
        </button>
      </div>
    </div>
  )
}
