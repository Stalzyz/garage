"use client"

import React from "react"
import { Moon, Sun } from "lucide-react"
import { useDashboardTheme } from "@/context/DashboardThemeContext"

export function ThemeToggle() {
  const { theme, toggleTheme } = useDashboardTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center p-2 rounded-xl bg-[var(--dash-bg-elevated,rgba(255,255,255,0.05))] hover:bg-[var(--dash-border-subtle,rgba(255,255,255,0.1))] transition-colors border border-[var(--dash-border-subtle,rgba(255,255,255,0.05))]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600" />
      )}
    </button>
  )
}
