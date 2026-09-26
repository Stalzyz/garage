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
    // Force dark class on documentElement
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("dark")
    }
    const savedTheme = (localStorage.getItem("dashboard-theme") as Theme) || "dark"
    setTheme(savedTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark"
      localStorage.setItem("dashboard-theme", newTheme)
      if (typeof document !== "undefined") {
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
      return newTheme
    })
  }

  return (
    <DashboardThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={!mounted ? "invisible" : (theme === "dark" ? "dashboard-dark" : "dashboard-light")}>
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
