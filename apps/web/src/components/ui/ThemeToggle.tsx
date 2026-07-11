"use client"

import React from "react"
import { Moon, Sun } from "lucide-react"
import { useDashboardTheme } from "@/context/DashboardThemeContext"

export function ThemeToggle() {
  const { theme, toggleTheme } = useDashboardTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center p-2 rounded-xl bg-dash-bg-elevated hover:bg-dash-border-subtle transition-colors border border-dash-border-subtle"
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
