"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

interface DashboardThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const DashboardThemeContext = createContext<DashboardThemeContextType | undefined>(undefined)

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check localStorage on mount
    const savedTheme = localStorage.getItem("dashboard-theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark"
      localStorage.setItem("dashboard-theme", newTheme)
      return newTheme
    })
  }

  // Prevent flash of incorrect theme (hydration mismatch)
  if (!mounted) {
    return <div className="invisible">{children}</div>
  }

  return (
    <DashboardThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "dashboard-dark" : "dashboard-light"}>
        {children}
      </div>
    </DashboardThemeContext.Provider>
  )
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext)
  if (!context) {
    throw new Error("useDashboardTheme must be used within a DashboardThemeProvider")
  }
  return context
}
