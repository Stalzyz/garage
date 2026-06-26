"use client"

import { useState } from "react"
import { Search, Plus, Package, Layers, Globe, Zap, ArrowRight, Server, Shield, Headphones } from "lucide-react"

// Types
type ProductTier = {
  id: string
  name: string
  price: string
  billing: "monthly" | "yearly" | "once" | "retainer"
  description: string
  features: string[]
  isPopular?: boolean
}

type ProductCategory = {
  id: string
  name: string
  icon: any
  description: string
  tiers: ProductTier[]
}

// Mock Data
const CATALOGUE: ProductCategory[] = [
  {
    id: "grafty-pro",
    name: "Grafty Pro",
    icon: Layers,
    description: "SaaS platform for creative agencies",
    tiers: [
      { id: "gp-starter", name: "Starter", price: "₹1,999", billing: "monthly", description: "Perfect for solo creatives", features: ["1 Workspace", "3 Users", "Core Features", "Email Support"] },
      { id: "gp-pro", name: "Pro", price: "₹4,999", billing: "monthly", description: "For growing teams", features: ["5 Workspaces", "15 Users", "Analytics Dashboard", "Priority Support"], isPopular: true },
      { id: "gp-agency", name: "Agency", price: "₹12,999", billing: "monthly", description: "Full white-label solution", features: ["Unlimited Workspaces", "White-label Portal", "API Access", "Dedicated Success Manager"] },
    ]
  },
  {
    id: "send-grafty",
    name: "Send Grafty",
    icon: Zap,
    description: "Email marketing automation platform",
    tiers: [
      { id: "sg-lite", name: "Lite", price: "₹799", billing: "monthly", description: "Start sending newsletters", features: ["10,000 Emails/mo", "Basic Templates", "Standard Delivery"] },
      { id: "sg-growth", name: "Growth", price: "₹1,999", billing: "monthly", description: "Scale your campaigns", features: ["50,000 Emails/mo", "Advanced Automation", "A/B Testing"], isPopular: true },
      { id: "sg-scale", name: "Scale", price: "₹4,999", billing: "monthly", description: "High volume sending", features: ["200,000 Emails/mo", "Dedicated IP", "Deliverability Consulting"] },
    ]
  },
  {
    id: "web-waas",
    name: "Website-as-a-Service",
    icon: Globe,
    description: "Managed website subscriptions (WaaS)",
    tiers: [
      { id: "ws-care", name: "Basic Care", price: "₹4,999", billing: "monthly", description: "Maintenance for existing sites", features: ["Hosting & SSL", "Plugin Updates", "Weekly Backups", "1hr Support"] },
      { id: "ws-starter", name: "Starter Site", price: "₹7,999", billing: "monthly", description: "New site + maintenance", features: ["5-Page Custom Site", "Hosting & Domain", "Basic SEO", "Content Updates"], isPopular: true },
      { id: "ws-ecommerce", name: "Ecommerce WaaS", price: "₹24,999", billing: "monthly", description: "Managed online store", features: ["Online Store Setup", "Payment Gateway Setup", "Inventory Sync", "Priority Support"] },
    ]
  }
]

export default function ProductCataloguePage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<string>("grafty-pro")

  const activeCategory = CATALOGUE.find(c => c.id === activeTab)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Product Catalogue</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your software and agency service subscriptions.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Add Product Tier
          </button>
        </div>

        {/* Top Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex bg-muted/30 p-1 rounded-lg border border-border/50 overflow-x-auto">
            {CATALOGUE.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  activeTab === cat.id ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative max-w-sm w-full hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeCategory && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Category Header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
                <activeCategory.icon className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{activeCategory.name}</h2>
              <p className="text-muted-foreground">{activeCategory.description}</p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {activeCategory.tiers.map((tier) => (
                <div 
                  key={tier.id}
                  className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md ${
                    tier.isPopular ? "border-primary shadow-primary/10 scale-105 z-10" : "border-border/50"
                  }`}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 h-10">{tier.description}</p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-border/50">
                    <div className="flex items-baseline gap-1 text-foreground">
                      <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                      <span className="text-sm font-medium text-muted-foreground">/{tier.billing}</span>
                    </div>
                  </div>

                  <ul className="flex-1 space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                        <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    tier.isPopular 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}>
                    Edit Plan Details
                  </button>
                </div>
              ))}
            </div>

            {/* Technical Specs Placeholder */}
            {activeCategory.id === "web-waas" && (
              <div className="mt-12 p-6 rounded-2xl bg-muted/20 border border-border/50 flex items-start gap-4">
                <div className="p-3 bg-card rounded-xl border border-border shadow-sm shrink-0">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">Premium Hosting Infrastructure</h4>
                  <p className="text-sm text-muted-foreground mt-1">All WaaS plans include globally distributed CDN, daily automated backups, free SSL certificates, and 99.9% uptime SLA. Built for speed and security.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
