"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Zap } from "lucide-react"
import { useSession } from "next-auth/react"
import { getNavItemsByRole, Role } from "@/config/navigation"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (!open) return null

  const { data: session } = useSession()
  const role = (session?.user?.role || "Intern") as Role
  const navItems = getNavItemsByRole(role)

  const items = navItems.flatMap(nav => {
    if (nav.children) {
      return nav.children.map(child => ({
        title: child.title,
        href: child.href,
        icon: nav.icon,
        type: nav.title
      }))
    }
    return [{
      title: nav.title,
      href: nav.href,
      icon: nav.icon,
      type: "Dashboard"
    }]
  })

  const filtered = items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div 
        className="w-full max-w-xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-border/50">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Grekam OS... (e.g. Invoices, Projects, Leads)"
            className="flex-1 h-14 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground uppercase border border-border/50 shadow-sm">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</div>
              {filtered.map((item, i) => {
                const Icon = item.icon
                return (
                  <button 
                    key={i}
                    onClick={() => {
                      setOpen(false)
                      setOpen(false)
                      router.push(item.href)
                    }}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      <span className="font-medium text-foreground group-hover:text-primary">{item.title}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted group-hover:bg-primary/20 px-2 py-1 rounded">
                      {item.type}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded border border-border/50">↑</kbd><kbd className="bg-muted px-1.5 py-0.5 rounded border border-border/50">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded border border-border/50">↵</kbd> to select</span>
          </div>
          <span className="font-bold flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Grekam OS Search</span>
        </div>
      </div>
    </div>
  )
}

