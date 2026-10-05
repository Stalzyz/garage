"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"

const MIN_PASSWORD_LENGTH = 12

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || "Unable to reset your password.")
        return
      }
      setDone(true)
      // All sessions were revoked server-side, so send them back through login.
      setTimeout(() => router.push("/auth/login?reset=1"), 2500)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <Shell>
        <StatusCard
          icon={<AlertCircle className="w-8 h-8 text-red-500" />}
          title="Reset link missing"
          body="This page needs a reset token. Request a new link from the forgot-password page."
        />
        <Link
          href="/auth/forgot-password"
          className="block text-center text-sm font-semibold text-emerald-600 hover:underline"
        >
          Request a new reset link
        </Link>
      </Shell>
    )
  }

  if (done) {
    return (
      <Shell>
        <StatusCard
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          title="Password updated"
          body="Your password has been changed and all other sessions were signed out. Taking you to the login page…"
        />
        <Link
          href="/auth/login"
          className="block text-center text-sm font-semibold text-emerald-600 hover:underline"
        >
          Go to login
        </Link>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 mb-3">
          <KeyRound className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Choose a new password</h1>
        <p className="text-sm text-slate-500 mt-1">
          This link can be used once and expires in 15 minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider py-3.5 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Updating…
            </>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {children}
      </div>
    </div>
  )
}

function StatusCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 mb-3">
        {icon}
      </div>
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500 mt-2">{body}</p>
    </div>
  )
}

// useSearchParams() requires a Suspense boundary during static prerendering.
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}