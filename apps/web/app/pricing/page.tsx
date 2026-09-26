"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  X,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  Car,
  Wrench,
  Users,
  CreditCard,
  MessageSquareQuote,
  Send
} from "lucide-react"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [productsOpen, setProductsOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)

  // Demo Modal state
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [demoEmail, setDemoEmail] = useState("")
  const [demoName, setDemoName] = useState("")
  const [demoPhone, setDemoPhone] = useState("")
  const [demoSubmitted, setDemoSubmitted] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoEmail) return
    setDemoLoading(true)

    try {
      await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DEMO_ACCESS",
          recipientEmail: demoEmail,
          recipientName: demoName || "Garage Partner",
          details: { phone: demoPhone }
        })
      })
    } catch (err) {
      console.error("Demo email notification error:", err)
    } finally {
      setDemoLoading(false)
      setDemoSubmitted(true)
    }
  }

  const plans = [
    {
      name: "Starter Garage",
      tagline: "Ideal for 1-2 bay independent mechanics & small repair shops.",
      monthlyPrice: 1899,
      yearlyPrice: 1499,
      badge: null,
      popular: false,
      ctaText: "Start Free Trial",
      features: [
        "Up to 2 Service Bays & 3 Staff Logins",
        "Digital Job Cards & Status Tracking",
        "Vehicle History & Customer Database",
        "Basic GST Invoicing & Estimates",
        "Standard Parts Inventory (up to 500 SKUs)",
        "Email Support & Knowledge Base",
      ],
      missing: [
        "Automated WhatsApp Service Alerts",
        "Barcode Scanning for Parts",
        "Customer Digital Approvals on Web",
        "Multi-Branch Centralized Reporting",
      ]
    },
    {
      name: "Growth Garage",
      tagline: "For fast-scaling multi-bay garages looking to maximize sales & retention.",
      monthlyPrice: 4299,
      yearlyPrice: 3499,
      badge: "Most Popular",
      popular: true,
      ctaText: "Get Growth Plan",
      features: [
        "Up to 8 Service Bays & Unlimited Technicians",
        "Automated WhatsApp Job Updates & Approvals",
        "Instant Inspection Reports with Photo Upload",
        "Advanced Parts Inventory & Low-Stock Alerts",
        "Automated Service Due & Insurance Reminders",
        "Labour Rate Cards & Technician Productivity",
        "Customer Review Automation (Google 5★)",
        "Priority WhatsApp & Phone Support",
      ],
      missing: [
        "Multi-Branch Centralized Reporting",
        "Custom Whitelabel Partner Branding",
      ]
    },
    {
      name: "Pro Workshop",
      tagline: "For busy auto centers, detailing studios & multi-location repair hubs.",
      monthlyPrice: 8499,
      yearlyPrice: 6999,
      badge: "High Performance",
      popular: false,
      ctaText: "Upgrade to Pro",
      features: [
        "Unlimited Service Bays & Workstations",
        "Multi-Branch Support (up to 3 locations)",
        "Full HR & Payroll: Bio-metric & Kiosk Clock-in",
        "Commission & Incentive Tracking per Job",
        "Advanced P&L, Expense & Vendor Management",
        "Customer Web Portal (Track Live Job Progress)",
        "Dedicated Account Manager & Onboarding",
        "Custom Workflow Automations & API Access",
      ],
      missing: [
        "Custom Whitelabel Reseller Domain",
      ]
    },
    {
      name: "Whitelabel Partner",
      tagline: "For fleet operators, dealership networks & IT resellers offering custom CRM.",
      monthlyPrice: 17999,
      yearlyPrice: 14999,
      badge: "White-Label",
      popular: false,
      ctaText: "Partner With Us",
      features: [
        "Unlimited Locations & Sub-Garages",
        "100% Custom Domain & Brand Logo",
        "Wholesale Reseller Dashboard & Margin Control",
        "Automated Client Provisioning & Invoicing",
        "Custom SMS & WhatsApp Gateway Integration",
        "Full Source Config & SLA Guarantee",
        "24/7 VIP Engineering Escalation",
      ],
      missing: []
    }
  ]

  const comparisonCategories = [
    {
      category: "Job Cards & Bay Operations",
      features: [
        { name: "Digital Job Cards creation", starter: true, growth: true, pro: true, enterprise: true },
        { name: "Vehicle Damage Markings & Photos", starter: true, growth: true, pro: true, enterprise: true },
        { name: "Bay & Technician Allocation", starter: "Basic", growth: "Advanced", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Live Service Stage Tracking", starter: true, growth: true, pro: true, enterprise: true },
        { name: "Technician Time Logging", starter: false, growth: true, pro: true, enterprise: true },
      ]
    },
    {
      category: "Customer CRM & Communication",
      features: [
        { name: "Customer & Vehicle Profile History", starter: true, growth: true, pro: true, enterprise: true },
        { name: "Automated WhatsApp Job Updates", starter: false, growth: true, pro: true, enterprise: true },
        { name: "1-Click Digital Estimate Approvals", starter: false, growth: true, pro: true, enterprise: true },
        { name: "Automated Service Due & Insurance Alerts", starter: false, growth: true, pro: true, enterprise: true },
        { name: "Automated Google Review Follow-ups", starter: false, growth: true, pro: true, enterprise: true },
        { name: "Customer Self-Service Web Portal", starter: false, growth: false, pro: true, enterprise: true },
      ]
    },
    {
      category: "Inventory, Parts & Billing",
      features: [
        { name: "Spare Parts Catalog & Reorder Alerts", starter: "500 SKUs", growth: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "GST Compliant Invoices & Estimates", starter: true, growth: true, pro: true, enterprise: true },
        { name: "Vendor Purchase Orders & Stock-In", starter: false, growth: true, pro: true, enterprise: true },
        { name: "Barcode & QR Scanning", starter: false, growth: true, pro: true, enterprise: true },
        { name: "Margin & Profit Analysis per Job", starter: false, growth: true, pro: true, enterprise: true },
      ]
    },
    {
      category: "Staff, HR & Business Management",
      features: [
        { name: "Staff Roles & Access Permissions", starter: "3 Users", growth: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Technician Commission Tracking", starter: false, growth: true, pro: true, enterprise: true },
        { name: "Attendance, Leaves & Kiosk Clock-in", starter: false, growth: false, pro: true, enterprise: true },
        { name: "Multi-Branch Central Reporting", starter: false, growth: false, pro: "Up to 3", enterprise: "Unlimited" },
        { name: "Custom Whitelabel Branding & Domain", starter: false, growth: false, pro: false, enterprise: true },
      ]
    }
  ]

  const faqs = [
    {
      q: "Do I need special hardware to run Garage CRM?",
      a: "No special hardware is required. Garage CRM is a 100% cloud platform that works smoothly on any device — smartphones, tablets, iPads, laptops, or desktop computers with an internet connection."
    },
    {
      q: "How does the automated WhatsApp notification system work?",
      a: "Garage CRM connects with WhatsApp Cloud API to trigger instant status updates, digital estimate approvals, invoice PDFs, and service due reminders directly to your customers' WhatsApp numbers."
    },
    {
      q: "Can I migrate my existing customer and parts data from Excel or another software?",
      a: "Yes! Our team provides free bulk data migration for your customer list, vehicle numbers, and spare parts inventory from Excel/CSV spreadsheets."
    },
    {
      q: "Is there any setup fee or long-term lock-in contract?",
      a: "No hidden setup fees. You can choose month-to-month billing and cancel anytime, or choose annual billing to save 20% on all plans."
    },
    {
      q: "How does the 18% GST calculation work?",
      a: "All displayed subscription fees are exclusive of 18% GST. You will receive a 100% compliant GST tax invoice immediately upon payment so you can claim full Input Tax Credit (ITC)."
    }
  ]

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-blue-500/30 font-sans relative overflow-hidden">
      
      {/* ── HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <div className="w-full h-full bg-[#090D16] rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/garage-logo.svg" alt="Garage CRM Logo" className="w-6 h-6 object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">Garage</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 tracking-wider">CRM</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-normal tracking-wide">Operations & Sales Growth</span>
            </div>
          </Link>

          {/* Desktop Navigation Menus */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Overview</Link>
            
            {/* Features Dropdown */}
            <div className="relative" onMouseEnter={() => setFeaturesOpen(true)} onMouseLeave={() => setFeaturesOpen(false)}>
              <button className="flex items-center gap-1 hover:text-white transition-colors py-2">
                Features
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${featuresOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              <AnimatePresence>
                {featuresOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full left-0 w-72 p-3 bg-[#0c1220]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col gap-1"
                  >
                    <Link href="/#case-studies" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <Car className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">6 Industry Case Studies</div>
                        <div className="text-[11px] text-zinc-400">See how garages grow sales</div>
                      </div>
                    </Link>
                    <Link href="/#features" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">Job Cards & Workflow</div>
                        <div className="text-[11px] text-zinc-400">Live bay tracking & parts</div>
                      </div>
                    </Link>
                    <Link href="/#features" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <MessageSquareQuote className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">WhatsApp Automations</div>
                        <div className="text-[11px] text-zinc-400">Instant job updates & approvals</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/#case-studies" className="hover:text-white transition-colors">Case Studies</Link>
            <Link href="/pricing" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Pricing</Link>

            {/* Grekam Products Dropdown */}
            <div className="relative" onMouseEnter={() => setProductsOpen(true)} onMouseLeave={() => setProductsOpen(false)}>
              <button className="flex items-center gap-1 hover:text-white transition-colors py-2 text-zinc-300">
                Grekam Products
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${productsOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              <AnimatePresence>
                {productsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full right-0 w-80 p-3 bg-[#0c1220]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col gap-1"
                  >
                    <a href="https://agency.grekam.in" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">Grekam Agency</div>
                        <div className="text-[11px] text-zinc-400">Digital agency & enterprise tech</div>
                      </div>
                    </a>
                    <a href="https://echo.grekam.in" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">Echo LMS</div>
                        <div className="text-[11px] text-zinc-400">Academy & student learning portal</div>
                      </div>
                    </a>
                    <a href="https://grafty.pro" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <Zap className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">Grafty WhatsApp</div>
                        <div className="text-[11px] text-zinc-400">WhatsApp business automation</div>
                      </div>
                    </a>
                    <a href="https://atlasadmin.grekam.in" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">Atlas E-Commerce</div>
                        <div className="text-[11px] text-zinc-400">Direct-to-consumer store admin</div>
                      </div>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              View Demo
            </button>
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO HEADER ── */}
      <section className="pt-20 pb-16 px-6 relative text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing • No Hidden Setup Fees</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Choose the plan that fits your <br className="hidden md:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              garage growth goals.
            </span>
          </h1>

          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Everything you need to manage customer job cards, streamline technician workflow, automate WhatsApp approvals, and boost workshop sales.
          </p>

          {/* Monthly / Yearly Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SAVE 20%
              </span>
            </button>
          </div>

          <p className="text-xs text-zinc-500 mt-4">
            * All plans are subject to +18% GST. GST invoice with full ITC claim provided instantly.
          </p>
        </div>
      </section>

      {/* ── PRICING CARDS GRID ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => {
            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
            return (
              <div
                key={idx}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-blue-900/30 via-[#0a1122] to-[#080d1a] border-2 border-blue-500/60 shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-[1.02]"
                    : "bg-[#090D16] border border-white/10 hover:border-white/20"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="text-lg font-bold text-white mb-1">{plan.name}</div>
                  <p className="text-xs text-zinc-400 min-h-[36px] leading-relaxed mb-6">{plan.tagline}</p>

                  <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl lg:text-4xl font-extrabold text-white">₹{price.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-zinc-400 font-medium">/ month</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
                      <span>{billingCycle === "yearly" ? "Billed annually" : "Billed monthly"}</span>
                      <span className="text-blue-400 font-semibold">+ 18% GST</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Included Features:</div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}

                    {plan.missing.length > 0 && (
                      <div className="pt-2 space-y-2 opacity-50">
                        {plan.missing.map((mFeat, mIdx) => (
                          <div key={mIdx} className="flex items-start gap-2.5 text-xs text-zinc-500">
                            <X className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                            <span>{mFeat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-blue-500/25"
                        : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-center text-zinc-500 mt-2">Instant demo & setup support</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── DETAILED PLAN COMPARISON TABLE ── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-2">Feature-by-Feature</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Detailed Plan Comparison
          </h2>
          <p className="text-sm text-zinc-400 mt-3">
            Compare all features across Starter, Growth, Pro, and Whitelabel Partner editions.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#090D16]/90 backdrop-blur-xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-5 text-sm font-bold text-zinc-300 w-2/5">Capabilities & Modules</th>
                <th className="p-5 text-xs font-bold text-center text-zinc-300">Starter</th>
                <th className="p-5 text-xs font-bold text-center text-blue-400 bg-blue-500/5">Growth</th>
                <th className="p-5 text-xs font-bold text-center text-zinc-300">Pro</th>
                <th className="p-5 text-xs font-bold text-center text-purple-400">Whitelabel</th>
              </tr>
            </thead>
            <tbody>
              {comparisonCategories.map((cat, cIdx) => (
                <tr key={`header-${cIdx}`} className="contents">
                  <td colSpan={5} className="py-3 px-5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-white/[0.04] border-t border-b border-white/10">
                    {cat.category}
                  </td>
                  {cat.features.map((row, rIdx) => (
                    <tr key={`row-${cIdx}-${rIdx}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-xs font-medium text-zinc-300">{row.name}</td>
                      
                      <td className="p-4 text-xs text-center text-zinc-400">
                        {typeof row.starter === "boolean" ? (
                          row.starter ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-zinc-600 mx-auto" />
                        ) : (
                          <span className="font-semibold text-zinc-300">{row.starter}</span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-center bg-blue-500/5 text-blue-200">
                        {typeof row.growth === "boolean" ? (
                          row.growth ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-zinc-600 mx-auto" />
                        ) : (
                          <span className="font-semibold text-blue-300">{row.growth}</span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-center text-zinc-300">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-zinc-600 mx-auto" />
                        ) : (
                          <span className="font-semibold text-zinc-200">{row.pro}</span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-center text-purple-300">
                        {typeof row.enterprise === "boolean" ? (
                          row.enterprise ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-zinc-600 mx-auto" />
                        ) : (
                          <span className="font-semibold text-purple-200">{row.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-2">Got Questions?</div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#090D16] border border-white/10 overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 bg-[#060911] py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <img src="/garage-logo.svg" alt="Garage CRM" className="w-5 h-5" />
            <span className="text-zinc-300 font-bold">Garage CRM</span>
            <span>•</span>
            <span>A proud product by <a href="https://agency.grekam.in" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Grekam</a></span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Overview</Link>
            <Link href="/#case-studies" className="hover:text-white transition-colors">Case Studies</Link>
            <Link href="/pricing" className="text-blue-400 font-semibold hover:text-white transition-colors">Pricing</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
          <div>
            © {new Date().getFullYear()} Grekam Technologies. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ── LIVE DEMO CREDENTIALS POPUP MODAL ── */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#0B101D] border border-white/15 p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!demoSubmitted ? (
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Live Access</span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">Explore Garage CRM Demo</h3>
                  <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                    Enter your email to receive live garage demo credentials instantly and access the full suite of Job Cards, WhatsApp alerts, and Billing.
                  </p>

                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Your Work Email *</label>
                      <input
                        type="email"
                        required
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        placeholder="you@yourgarage.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Garage / Name</label>
                        <input
                          type="text"
                          value={demoName}
                          onChange={(e) => setDemoName(e.target.value)}
                          placeholder="Apex Motors"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={demoPhone}
                          onChange={(e) => setDemoPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={demoLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      {demoLoading ? (
                        <span>Preparing Demo Workspace...</span>
                      ) : (
                        <>
                          <span>Get Instant Demo Credentials</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                    <ShieldCheck className="w-7 h-7" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">Live Demo Credentials Ready!</h3>
                  <p className="text-xs text-zinc-400 mb-6">
                    We also emailed these credentials to <span className="text-blue-400 font-semibold">{demoEmail}</span>.
                  </p>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3 mb-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Demo Email:</span>
                      <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">demo@garage.in</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Demo Password:</span>
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Demo2023</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Role:</span>
                      <span className="text-zinc-300 font-semibold">Garage Owner / Super Admin</span>
                    </div>
                  </div>

                  <Link
                    href="/auth/login"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
                  >
                    <span>Enter Demo Dashboard Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
