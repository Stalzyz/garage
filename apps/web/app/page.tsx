"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Building2, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Star, Sparkles, 
  LayoutDashboard, Layers, Users, Briefcase, DollarSign, UserCheck, CheckSquare, 
  Trophy, Radio, Globe, BarChart2, LifeBuoy, Workflow, MessageSquare, HardDrive, Bell, 
  BookOpen, Settings, Phone, Calendar, Mail, Clock, FileText, Package, RefreshCw, X, AlertCircle,
  TrendingUp, Sliders, Smartphone, Check, Zap, HelpCircle, ChevronDown, PlayCircle, ExternalLink,
  Receipt, Flame, Compass, Award, ShieldAlert, FileCode2, ChevronUp, Send, Calculator, UserPlus,
  Lock, Share2, Sparkle, ChevronLeft, Quote
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function GarageLandingPage() {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeModuleCategory, setActiveModuleCategory] = useState<"ALL" | "OPS" | "CRM" | "FINANCE" | "HR">("ALL")
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("ANNUAL")
  
  // ── DROPDOWN NAVIGATION STATE ──
  const [activeNavDropdown, setActiveNavDropdown] = useState<"FEATURES" | "ECOSYSTEM" | null>(null)

  // ── HERO SLIDESHOW STATE ──
  const heroSlides = [
    {
      image: "/hero-slide-1.jpg",
      title: "Garage CRM — Live Service Bay Operations",
      caption: "Track customer vehicles, active service bays, and technician jobs in real time."
    },
    {
      image: "/hero-slide-2.jpg",
      title: "Garage CRM — Sales Pipeline & Lead Tracking",
      caption: "Turn customer enquiries into confirmed bookings with visual Kanban stages."
    },
    {
      image: "/hero-slide-3.jpg",
      title: "Garage CRM — GST Invoicing & WhatsApp Billing",
      caption: "Create instant GST invoices and collect payments via 1-click WhatsApp links."
    }
  ]
  const [activeSlide, setActiveSlide] = useState(0)

  // ── PERSONA & CURRENCY STATE ──
  const [persona, setPersona] = useState<"OWNER" | "MANAGER" | "RESELLER">("OWNER")
  const [selectedCurrency, setSelectedCurrency] = useState<"INR" | "AED" | "USD">("INR")
  
  // ROI Calculator Sliders
  const [bayCount, setBayCount] = useState(6)
  const [monthlyJobs, setMonthlyJobs] = useState(180)
  const [avgTicketPrice, setAvgTicketPrice] = useState(4500)

  // WhatsApp Simulator State
  const [simulatedChat, setSimulatedChat] = useState<Array<{ sender: "bot" | "user"; text: string; time: string }>>([
    { sender: "bot", text: "🚗 Apex Motors: Hi Vikram! Your Honda City (MH 12 AB 4589) is ready after Full Synthetic Oil Service & Brake Inspection.", time: "10:30 AM" },
    { sender: "bot", text: "🧾 Click to view & pay your GST invoice: https://app.garage.grekam.in/verify/inv/8841", time: "10:31 AM" }
  ])
  const [simulatingWhatsApp, setSimulatingWhatsApp] = useState(false)

  // Calculate ROI Metrics
  const hoursSavedMonthly = Math.round(bayCount * 14)
  const unbilledRecoveredMonthly = Math.round(monthlyJobs * (avgTicketPrice * 0.08))
  const annualProfitIncrease = Math.round((unbilledRecoveredMonthly * 12) + (bayCount * 45000))

  const currencySymbols = {
    INR: "₹",
    AED: "AED ",
    USD: "$"
  }

  const currencyMultipliers = {
    INR: 1,
    AED: 0.044,
    USD: 0.012
  }

  const formatPrice = (valInInr: number) => {
    const symbol = currencySymbols[selectedCurrency]
    const rate = currencyMultipliers[selectedCurrency]
    const converted = Math.round(valInInr * rate)
    return `${symbol}${converted.toLocaleString("en-US")}`
  }

  const handleSimulateWhatsAppAction = (actionType: "SERVICE_UPDATE" | "PAYMENT_LINK" | "REMINDER") => {
    setSimulatingWhatsApp(true)
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    let newMsg = ""

    if (actionType === "SERVICE_UPDATE") {
      newMsg = "🔧 Service Alert: Wheel Alignment & Balancing complete on KA 05 CD 8821. Technician Karthik is conducting final road test."
    } else if (actionType === "PAYMENT_LINK") {
      newMsg = "💳 Payment Request: Total Bill ₹8,450. Click link to pay via UPI / Credit Card & get instant digital receipt."
    } else {
      newMsg = "📅 Maintenance Reminder: Your 6-Month Oil Service for MH 12 AB 4589 is due next Tuesday. Click to confirm your 10 AM slot."
    }

    setTimeout(() => {
      setSimulatedChat(prev => [...prev, { sender: "bot", text: newMsg, time: now }])
      setSimulatingWhatsApp(false)
      toast.success("WhatsApp Automated Alert Triggered!")
    }, 600)
  }

  const [form, setForm] = useState({
    name: "",
    garageName: "",
    email: "",
    phone: "",
    city: "",
    notes: ""
  })
  const [submitting, setSubmitting] = useState(false)

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.garageName) {
      toast.error("Please fill in your name, garage name, and phone number.")
      return
    }

    setSubmitting(true)
    try {
      await fetch("/api/calculator/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            businessName: form.garageName,
            email: form.email,
            phone: form.phone,
            city: form.city,
            additionalNotes: form.notes
          },
          state: {
            customerName: form.name,
            businessName: form.garageName,
            email: form.email,
            phone: form.phone,
            city: form.city,
            websiteType: "garage_crm",
            pageTier: "10-20",
            designTier: "enterprise",
            deliverySpeed: "standard",
            includeGst: true,
            selectedFeatures: ["Garage CRM & Sales", "Garage Operations", "Finance & GST Billing", "HR & Payroll"],
            selectedEcommerceFeatures: [],
            productTier: "50-200",
            productUploadTier: "done_by_agency",
            selectedIntegrations: ["WhatsApp Automation"],
            customIntegrationText: "",
            seoOption: "standard",
            contentOption: "agency_writes",
            imageOption: "custom_graphics",
            brandingOption: "full_suite",
            migrationOption: "none",
            marketingRetainerOption: "monthly",
            slaOption: "priority"
          }
        })
      })

      toast.success("Thank you! Our Garage CRM specialist will contact you shortly.")
      setIsInquiryModalOpen(false)
      setForm({ name: "", garageName: "", email: "", phone: "", city: "", notes: "" })
    } catch {
      toast.error("Form submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Complete module catalog
  const allModules = [
    {
      id: "lead-pipeline",
      category: "CRM",
      title: "Lead Pipeline CRM",
      icon: Layers,
      badge: "🎯 Purple",
      gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
      description: "Convert customer enquiries into repeat garage visits. Visual Kanban pipeline: New Lead → Contacted → Follow-up → Service Booked → Converted → Lost."
    },
    {
      id: "power-dialer",
      category: "CRM",
      title: "Power Dialer",
      icon: Phone,
      badge: "📞 Green",
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      description: "High-speed 1-click calling for service advisors. Automatic follow-up lists and integrated call duration tracking to close sales faster."
    },
    {
      id: "call-intel",
      category: "CRM",
      title: "Call Intel & Notes",
      icon: Zap,
      badge: "🧠 Orange",
      gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
      borderColor: "border-orange-500/30",
      iconColor: "text-orange-400",
      description: "Connect customer call recordings, duration metrics, disposition tags, and notes directly to vehicle service histories."
    },
    {
      id: "contacts",
      category: "CRM",
      title: "Customer & Vehicle Directory",
      icon: Users,
      badge: "👥 Cyan",
      gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
      description: "Complete customer database with vehicle registration numbers, repair histories, follow-up dates, and chat logs in one search."
    },
    {
      id: "proposals",
      category: "CRM",
      title: "Quotations & Estimates",
      icon: FileText,
      badge: "📄 Violet",
      gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-violet-500/30",
      iconColor: "text-violet-400",
      description: "Send professional repair proposals with itemized labor & spare parts pricing, validity timelines, and 1-click digital client approval."
    },
    {
      id: "subscriptions",
      category: "CRM",
      title: "Service Subscriptions & AMC",
      icon: RefreshCw,
      badge: "🔄 Blue",
      gradient: "from-blue-500/20 via-sky-500/10 to-transparent",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      description: "Build predictable recurring income with Annual Maintenance Contracts (AMC), roadside assistance packages, and automated renewals."
    },
    {
      id: "dashboard",
      category: "OPS",
      title: "Garage Dashboard",
      icon: LayoutDashboard,
      badge: "📊 Blue",
      gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      description: "Your workshop at a glance. Real-time today's jobs, new enquiries, active customers, pending payments, overdue work, and revenue."
    },
    {
      id: "products-catalogue",
      category: "OPS",
      title: "Spare Parts Catalogue",
      icon: Package,
      badge: "📦 Amber",
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-400",
      description: "Manage spare parts stock, engine oils & fluids, accessories, reorder levels, and standard pricing for fast job estimates."
    },
    {
      id: "projects",
      category: "OPS",
      title: "Major Overhaul Projects",
      icon: Briefcase,
      badge: "📁 Purple",
      gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
      description: "Manage complex multi-stage vehicle rebuilds and body repairs with task assignments, technician timelines, attachment files, and budgets."
    },
    {
      id: "content-calendar",
      category: "OPS",
      title: "Marketing Content Calendar",
      icon: Calendar,
      badge: "📅 Pink",
      gradient: "from-pink-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-pink-500/30",
      iconColor: "text-pink-400",
      description: "Plan and schedule marketing promotions across social media, WhatsApp broadcasts, and seasonal vehicle service offers."
    },
    {
      id: "invoices-payments",
      category: "FINANCE",
      title: "GST Invoices & Payments",
      icon: FileCode2,
      badge: "🧾 Emerald",
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      description: "Generate compliant GST invoices with HSN/SAC codes, track pending payments, and send instant WhatsApp payment links."
    },
    {
      id: "finance-income",
      category: "FINANCE",
      title: "Income & Sales Tracking",
      icon: DollarSign,
      badge: "💰 Green",
      gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      description: "Track all workshop income from customer service payments, counter sales, and recurring maintenance contracts in real time."
    },
    {
      id: "finance-expenses",
      category: "FINANCE",
      title: "Workshop Expenses",
      icon: Receipt,
      badge: "💸 Red",
      gradient: "from-red-500/20 via-rose-500/10 to-transparent",
      borderColor: "border-red-500/30",
      iconColor: "text-red-400",
      description: "Track spare parts purchasing, shop rent, electricity, tools, and operational expenses to know your exact profit margin."
    },
    {
      id: "ess-workspace",
      category: "HR",
      title: "Employee ESS Workspace",
      icon: UserCheck,
      badge: "👤 Blue",
      gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-indigo-500/30",
      iconColor: "text-indigo-400",
      description: "Dedicated portal for technicians & advisors to clock-in/out attendance, apply for leaves, download payslips, and submit requests."
    },
    {
      id: "employees",
      category: "HR",
      title: "Staff & Technician Profiles",
      icon: Users,
      badge: "👨‍🔧 Cyan",
      gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
      description: "Organize employee profiles, job designations, bay assignments, emergency contacts, and joining documentation."
    },
    {
      id: "attendance",
      category: "HR",
      title: "Digital Attendance & Kiosk",
      icon: CheckSquare,
      badge: "✅ Green",
      gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
      borderColor: "border-green-500/30",
      iconColor: "text-green-400",
      description: "Eliminate manual registers. Track Present, Absent, Late punch-ins, and generate monthly payroll reports with 1 click."
    },
    {
      id: "payroll",
      category: "HR",
      title: "Payroll & Salary Slips",
      icon: DollarSign,
      badge: "💳 Emerald",
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      description: "Calculate technician salaries, overtime allowances, commission bonuses, and generate downloadable monthly payslips."
    },
    {
      id: "team-wins",
      category: "HR",
      title: "Team Culture & Wins",
      icon: Trophy,
      badge: "🏆 Gold",
      gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-400",
      description: "Keep mechanics and advisors motivated. Celebrate targets achieved, top performers, and garage milestones."
    }
  ]

  const filteredModules = activeModuleCategory === "ALL" 
    ? allModules 
    : allModules.filter(m => m.category === activeModuleCategory)

  const faqs = [
    {
      q: "What is Garage CRM?",
      a: "Garage is an all-in-one CRM and business operations software built specifically for automotive garages, multi-brand workshops, and detailing studios to increase sales, streamline vehicle repairs, and manage teams."
    },
    {
      q: "How does Garage CRM increase garage sales?",
      a: "Garage CRM captures customer enquiries from WhatsApp, phone calls, and walk-ins, moves them through a high-converting sales pipeline, triggers automated follow-ups, and prevents lost repeat business."
    },
    {
      q: "Can I send GST invoices and payment links directly on WhatsApp?",
      a: "Yes. Garage CRM integrates with WhatsApp to generate compliant GST invoices and send 1-click payment links (UPI, Cards, Netbanking) directly to vehicle owners."
    },
    {
      q: "Can my technicians and staff use Garage?",
      a: "Yes. Employees receive their own Employee Self-Service (ESS) workspace for attendance clock-ins, leave requests, task tracking, and viewing monthly payslips."
    },
    {
      q: "Can I manage recurring maintenance packages?",
      a: "Yes. The Subscriptions module lets you sell and manage Annual Maintenance Contracts (AMC), periodic service packages, and membership renewals seamlessly."
    },
    {
      q: "Will Garage replace all my separate spreadsheets and apps?",
      a: "Yes. Garage eliminates scattered paper notebooks, WhatsApp chat logs, Excel sheets, and disconnected billing tools into one single source of truth."
    }
  ]

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      
      {/* ── 1. TOP FLOATING NAVIGATION BAR WITH DROPDOWNS ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-[#07090E]/80 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name in Inter */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
              <div className="w-full h-full bg-[#090D16] rounded-[11px] flex items-center justify-center p-1.5">
                <img 
                  src="/garage-crm-logo.svg" 
                  alt="Garage CRM Logo" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors leading-none font-sans">
                Garage
              </span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
                CRM & Operations
              </span>
            </div>
          </Link>

          {/* Clean Dropdown Menus */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300 relative">
            
            {/* Features Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveNavDropdown("FEATURES")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button className="flex items-center gap-1.5 hover:text-white py-2 transition-colors">
                <span>Features</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              <AnimatePresence>
                {activeNavDropdown === "FEATURES" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-80 p-3 rounded-2xl bg-[#0B0F19] border border-white/10 shadow-2xl backdrop-blur-2xl space-y-1"
                  >
                    <a href="#modules" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400">Lead Pipeline CRM</span>
                        <span className="text-[11px] text-slate-400">Track customer enquiries & sales conversions.</span>
                      </div>
                    </a>

                    <a href="#whatsapp-demo" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400">WhatsApp Automation</span>
                        <span className="text-[11px] text-slate-400">Instant job card alerts & payment links.</span>
                      </div>
                    </a>

                    <a href="#modules" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <FileCode2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400">GST Invoices & Billing</span>
                        <span className="text-[11px] text-slate-400">Itemized billing with HSN codes & taxes.</span>
                      </div>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Grekam Ecosystem Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveNavDropdown("ECOSYSTEM")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button className="flex items-center gap-1.5 hover:text-white py-2 transition-colors">
                <span>Grekam Products</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              <AnimatePresence>
                {activeNavDropdown === "ECOSYSTEM" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-80 p-3 rounded-2xl bg-[#0B0F19] border border-white/10 shadow-2xl backdrop-blur-2xl space-y-1"
                  >
                    <a 
                      href="https://agency.grekam.in" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400 flex items-center gap-1">
                          Grekam Agency
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </span>
                        <span className="text-[11px] text-slate-400">SaaS development & enterprise digital studio.</span>
                      </div>
                    </a>

                    <a 
                      href="https://echo.grekam.in" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-cyan-400 flex items-center gap-1">
                          Echo LMS
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </span>
                        <span className="text-[11px] text-slate-400">Academy LMS, video courses & student portal.</span>
                      </div>
                    </a>

                    <a 
                      href="https://grafty.pro" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-emerald-400 flex items-center gap-1">
                          Grafty
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </span>
                        <span className="text-[11px] text-slate-400">WhatsApp API gateway & marketing automation.</span>
                      </div>
                    </a>

                    <a 
                      href="https://atlasadmin.grekam.in" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-purple-400 flex items-center gap-1">
                          Atlas E-Commerce
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </span>
                        <span className="text-[11px] text-slate-400">Multi-tenant e-commerce & storefront builder.</span>
                      </div>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#calculator" className="hover:text-white transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="hidden lg:flex items-center bg-white/[0.04] border border-white/10 p-1 rounded-xl text-xs font-mono">
              {(["INR", "AED", "USD"] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCurrency(c)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedCurrency === c ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <Link 
              href="/auth/login" 
              className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-slate-950 hover:bg-slate-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-95 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. HERO SECTION (SIMPLE WORDS, TARGETING SALES & GROWTH) ── */}
      <section className="relative pt-36 pb-16 md:pt-48 md:pb-24 overflow-hidden">
        
        {/* Glow Radial Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8 text-xs font-medium text-slate-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Garage CRM — Built for Auto Repair Workshops & Detailing Studios</span>
          </div>

          {/* Simple, Punchy Sales-Driven Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-5xl mx-auto font-sans"
          >
            Get more customer leads.
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent block mt-2 font-sans">
              Grow your garage sales faster.
            </span>
          </motion.h1>

          {/* Simple, Clear Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6 text-lg sm:text-xl text-slate-300/80 max-w-3xl mx-auto font-normal leading-relaxed font-sans"
          >
            <strong>Garage</strong> is the all-in-one CRM and workshop platform. Capture customer enquiries, send fast repair estimates, automate WhatsApp service reminders, and collect payments without paperwork.
          </motion.p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(255,255,255,0.4)] active:scale-98 transition-all flex items-center justify-center gap-3 group font-sans"
            >
              Get Started with Garage CRM
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#calculator"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-medium bg-white/[0.05] text-white hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-3 font-sans"
            >
              Calculate Your Growth
              <Calculator className="w-5 h-5 text-blue-400" />
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Trusted by 500+ top multi-brand garages & service chains
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all font-sans">
              <span className="font-bold tracking-wider text-base text-slate-300">AUTO-CARE PRO</span>
              <span className="font-bold tracking-wider text-base text-slate-300">GARAGE ONE</span>
              <span className="font-bold tracking-wider text-base text-slate-300">SPEEDWORKS</span>
              <span className="font-bold tracking-wider text-base text-slate-300">APEX MOTORS</span>
              <span className="font-bold tracking-wider text-base text-slate-300">VELOCITY AUTO</span>
            </div>
          </div>
        </div>

        {/* ── 3. HERO SLIDESHOW CAROUSEL ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
          <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/90 backdrop-blur-2xl p-4 sm:p-6 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            
            {/* Window Controls & Slide Title Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white tracking-wide font-sans">
                  {heroSlides[activeSlide].title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slideshow Display Box */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-white/10 bg-slate-950">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSlide}
                  src={heroSlides[activeSlide].image}
                  alt={heroSlides[activeSlide].title}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Slide Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex justify-between items-center">
                <p className="text-xs text-slate-200 font-medium font-sans">
                  {heroSlides[activeSlide].caption}
                </p>
                <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded">
                  Slide {activeSlide + 1} of {heroSlides.length}
                </span>
              </div>
            </div>

            {/* Pagination Indicators */}
            <div className="flex justify-center items-center gap-2 mt-4">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === idx ? "w-8 bg-blue-500" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. INTERACTIVE "GARAGE ROI & SAVINGS CALCULATOR" ── */}
      <section id="calculator" className="py-24 relative bg-[#090D16] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-3">Profit & Productivity Calculator</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-sans">
              See how much revenue Garage CRM adds to your business.
            </h3>
            <p className="mt-4 text-base text-slate-400 font-sans">
              Adjust the sliders below based on your workshop capacity to calculate your estimated annual growth.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders Input Column */}
            <div className="lg:col-span-7 p-8 rounded-2xl bg-[#07090E] border border-white/10 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-white font-sans">Service Bays / Technicians</label>
                  <span className="text-sm font-mono font-bold text-blue-400">{bayCount} Bays</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="25" 
                  value={bayCount} 
                  onChange={(e) => setBayCount(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-white font-sans">Monthly Job Cards Processed</label>
                  <span className="text-sm font-mono font-bold text-purple-400">{monthlyJobs} Jobs / Month</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="1000" 
                  step="10"
                  value={monthlyJobs} 
                  onChange={(e) => setMonthlyJobs(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-white font-sans">Average Service Ticket Value</label>
                  <span className="text-sm font-mono font-bold text-emerald-400">{formatPrice(avgTicketPrice)} / Ticket</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="35000" 
                  step="500"
                  value={avgTicketPrice} 
                  onChange={(e) => setAvgTicketPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-5 p-8 rounded-2xl bg-gradient-to-br from-blue-950/40 via-[#0B0F19] to-purple-950/40 border-2 border-blue-500/50 space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold">
                ESTIMATED ANNUAL GROWTH
              </span>

              <div>
                <span className="text-xs text-slate-400 block mb-1 font-sans">Additional Annual Revenue Recovered</span>
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent font-sans">
                  +{formatPrice(annualProfitIncrease)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">Calculated from unbilled spare parts & automated follow-ups.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div>
                  <span className="text-xs text-slate-400 block font-sans">Time Saved / Month</span>
                  <p className="text-xl font-bold text-white font-mono">{hoursSavedMonthly} Hours</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-sans">Monthly Revenue Boost</span>
                  <p className="text-xl font-bold text-emerald-400 font-mono">+{formatPrice(unbilledRecoveredMonthly)}</p>
                </div>
              </div>

              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-lg font-sans"
              >
                Claim Your Estimated Growth Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. INTERACTIVE "WHATSAPP AUTOMATION SIMULATOR" ── */}
      <section id="whatsapp-demo" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">WhatsApp Automation</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-sans">
              Automate customer updates right on WhatsApp.
            </h3>
            <p className="mt-4 text-base text-slate-400 font-sans">
              Test how Garage sends instant job card receipts, payment links, and service alerts to your customers' phones.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Action Trigger Buttons */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="text-lg font-bold text-white mb-2 font-sans">Click to test instant automated triggers:</h4>
              
              <button
                onClick={() => handleSimulateWhatsAppAction("SERVICE_UPDATE")}
                className="w-full p-5 rounded-2xl bg-[#090D16] border border-white/10 hover:border-emerald-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <span className="text-sm font-bold text-white block group-hover:text-emerald-400 transition-colors font-sans">
                    1. Send Live Service Status Alert
                  </span>
                  <span className="text-xs text-slate-400 font-sans">Notify customer when vehicle inspection or alignment is complete.</span>
                </div>
                <Send className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => handleSimulateWhatsAppAction("PAYMENT_LINK")}
                className="w-full p-5 rounded-2xl bg-[#090D16] border border-white/10 hover:border-emerald-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <span className="text-sm font-bold text-white block group-hover:text-emerald-400 transition-colors font-sans">
                    2. Send Instant WhatsApp Payment Link
                  </span>
                  <span className="text-xs text-slate-400 font-sans">Send GST invoice link with 1-click UPI / Credit Card payment.</span>
                </div>
                <Send className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => handleSimulateWhatsAppAction("REMINDER")}
                className="w-full p-5 rounded-2xl bg-[#090D16] border border-white/10 hover:border-emerald-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <span className="text-sm font-bold text-white block group-hover:text-emerald-400 transition-colors font-sans">
                    3. Send 6-Month Maintenance Reminder
                  </span>
                  <span className="text-xs text-slate-400 font-sans">Automatically invite previous customers back for scheduled service.</span>
                </div>
                <Send className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>

            {/* Smartphone Simulated Frame */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-[340px] rounded-[36px] border-4 border-slate-700 bg-slate-950 p-4 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative">
                {/* Notch */}
                <div className="w-32 h-4 bg-slate-900 rounded-b-xl mx-auto mb-4" />
                
                {/* WhatsApp Chat Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                    G
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block font-sans">Apex Motors (Garage CRM)</span>
                    <span className="text-[10px] text-emerald-400 font-sans">Verified Business Account</span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="space-y-3 min-h-[300px] max-h-[340px] overflow-y-auto pr-1 text-xs custom-scrollbar font-sans">
                  {simulatedChat.map((msg, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 space-y-1">
                      <p className="text-slate-200 leading-relaxed">{msg.text}</p>
                      <span className="text-[9px] text-emerald-400/80 block text-right font-mono">{msg.time} ✓✓</span>
                    </div>
                  ))}
                  {simulatingWhatsApp && (
                    <div className="text-[10px] text-slate-400 animate-pulse italic">
                      Automated bot typing message...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. COMPLETE MODULE DIRECTORY ── */}
      <section id="modules" className="py-24 relative bg-[#090D16] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-3">All-In-One Platform</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-sans">
              Every module your garage needs to run & scale.
            </h3>
            <p className="mt-4 text-base text-slate-400 font-sans">
              Garage connects your customers, vehicle service operations, sales, employees, finance, and marketing into one seamless workspace.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12 font-sans">
            {[
              { id: "ALL", label: "All Modules" },
              { id: "CRM", label: "🎯 CRM & Sales" },
              { id: "OPS", label: "⚙️ Operations & Jobs" },
              { id: "FINANCE", label: "💰 Finance & Billing" },
              { id: "HR", label: "👨‍🔧 HR & Team ESS" },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveModuleCategory(cat.id as any)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeModuleCategory === cat.id
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                    : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => {
              const IconComp = module.icon
              return (
                <div
                  key={module.id}
                  className={`p-6 rounded-2xl bg-[#07090E] border ${module.borderColor} hover:border-blue-500/50 transition-all hover:-translate-y-1 group relative overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${module.gradient} rounded-full blur-2xl group-hover:scale-150 transition-transform`} />
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center ${module.iconColor}`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {module.badge}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors relative z-10 font-sans">
                    {module.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed relative z-10 font-sans">
                    {module.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 7. CUSTOMER REVIEWS & GREKAM PRODUCT ECOSYSTEM SECTION ── */}
      <section id="reviews" className="py-24 relative bg-[#07090E] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Reviews Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">Customer Testimonials</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-sans">
              Loved by workshop owners & service advisors.
            </h3>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 rounded-2xl bg-[#090D16] border border-white/10 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {"★".repeat(5)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic font-sans">
                "Garage CRM completely transformed our multi-bay workshop. We saved over 40 hours a month on manual invoicing and increased repeat service bookings by 25%."
              </p>
              <div>
                <span className="text-sm font-bold text-white block font-sans">Ramesh V.</span>
                <span className="text-xs text-slate-400 font-sans">Owner, Apex Motors & Auto Care</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[#090D16] border border-white/10 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {"★".repeat(5)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic font-sans">
                "The WhatsApp billing integration is incredible. Customers receive job card estimates and pay online before even arriving to collect their vehicle."
              </p>
              <div>
                <span className="text-sm font-bold text-white block font-sans">Siddharth Menon</span>
                <span className="text-xs text-slate-400 font-sans">Managing Director, SpeedWorks Auto</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[#090D16] border border-white/10 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {"★".repeat(5)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic font-sans">
                "As a whitelabel reseller partner, launching this under our custom domain gave us a high-margin recurring SaaS offer for our auto clients."
              </p>
              <div>
                <span className="text-sm font-bold text-white block font-sans">Vikramaditya S.</span>
                <span className="text-xs text-slate-400 font-sans">CEO, AutoTech Agency Network</span>
              </div>
            </div>
          </div>

          {/* Built By Grekam Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 mb-16 text-center">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block mb-2">PROUDLY BUILT BY GREKAM</span>
            <h4 className="text-2xl font-bold text-white mb-2 font-sans">Part of the Grekam Enterprise Ecosystem</h4>
            <p className="text-xs text-slate-300 max-w-2xl mx-auto mb-4 font-sans">
              Garage is developed & backed by <strong>Grekam Agency</strong> — building world-class SaaS, AI applications, and digital platforms.
            </p>
            <a
              href="https://agency.grekam.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all font-sans"
            >
              Visit Grekam Agency
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Grekam Ecosystem Products Showcase Grid */}
          <div className="border-t border-white/10 pt-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h4 className="text-lg font-bold text-white font-sans">Explore Other Grekam Platforms</h4>
              <p className="text-xs text-slate-400 font-sans">Empowering education, communication, and e-commerce.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Echo LMS */}
              <a
                href="https://echo.grekam.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-[#090D16] border border-white/10 hover:border-cyan-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h5 className="text-base font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors flex items-center justify-between font-sans">
                  Echo LMS
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h5>
                <p className="text-xs text-slate-400 font-sans">Academy LMS, student management, video courses & educator platform.</p>
              </a>

              {/* Grafty WhatsApp Automation */}
              <a
                href="https://grafty.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-[#090D16] border border-white/10 hover:border-emerald-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h5 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors flex items-center justify-between font-sans">
                  Grafty
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h5>
                <p className="text-xs text-slate-400 font-sans">High-speed WhatsApp API gateway, broadcast campaigns & chatbots.</p>
              </a>

              {/* Atlas E-Commerce */}
              <a
                href="https://atlasadmin.grekam.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-[#090D16] border border-white/10 hover:border-purple-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <h5 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors flex items-center justify-between font-sans">
                  Atlas E-Commerce
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h5>
                <p className="text-xs text-slate-400 font-sans">Multi-tenant e-commerce platform, digital storefronts & inventory suite.</p>
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* ── 8. PRICING SECTION ── */}
      <section id="pricing" className="py-24 relative bg-[#090D16] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-3">Transparent Pricing</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-sans">
              Simple plans that grow with your business.
            </h3>
            <p className="mt-4 text-base text-slate-400 font-sans">
              No hidden fees. Every plan includes customer CRM, job cards, and full GST invoicing.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-xl bg-white/[0.04] border border-white/10 font-sans">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === "MONTHLY"
                    ? "bg-white text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("ANNUAL")}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  billingCycle === "ANNUAL"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Annual Billing
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Starter Bay */}
            <div className="p-8 rounded-2xl bg-[#07090E] border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white mb-1 font-sans">Starter Bay</h4>
                <p className="text-xs text-slate-400 mb-6 font-sans">Perfect for small auto repair workshops & single bays.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-sans">
                    {formatPrice(billingCycle === "ANNUAL" ? 2399 : 2999)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/month + tax</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-white/10 pt-6 font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 3 Technicians & Staff</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Customer CRM & Job Cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>GST Invoicing & Payments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Basic Expense Tracker</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 border border-white/10 transition-all font-sans"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Pro Garage (Featured) */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-950/30 via-[#090D16] to-[#07090E] border-2 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg font-sans">
                MOST POPULAR
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1 font-sans">Pro Garage</h4>
                <p className="text-xs text-slate-300 mb-6 font-sans">Designed for multi-bay service centers & scaling garages.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-sans">
                    {formatPrice(billingCycle === "ANNUAL" ? 5599 : 6999)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/month + tax</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-200 mb-8 border-t border-white/10 pt-6 font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 15 Technicians & Advisors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Power Dialer & Call Intel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Employee ESS, Attendance & Payroll</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Recurring Subscriptions & Marketing</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all font-sans"
              >
                Get Started Now
              </button>
            </div>

            {/* Enterprise Whitelabel */}
            <div className="p-8 rounded-2xl bg-[#07090E] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white mb-1 font-sans">Whitelabel Partner</h4>
                <p className="text-xs text-slate-400 mb-6 font-sans">For garage chains, agency partners & franchise networks.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-sans">
                    {formatPrice(billingCycle === "ANNUAL" ? 11999 : 14999)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/month + tax</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-white/10 pt-6 font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Staff & Multiple Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom Domain Branding (Your Logo)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Reseller Commission Control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated Account Manager & SLA</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 border border-white/10 transition-all font-sans"
              >
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ACCORDION SECTION ── */}
      <section id="faq" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-3">Frequently Asked Questions</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-sans">
              Got questions? We've got answers.
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-2xl bg-[#090D16] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base text-white hover:text-blue-400 transition-colors font-sans"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-blue-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4 font-sans"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. BOTTOM CTA BANNER & FOOTER ── */}
      <section className="py-24 relative bg-gradient-to-b from-[#090D16] to-[#05070B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-br from-blue-950/50 via-[#0B0F19] to-purple-950/30 border border-white/10 text-center relative overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)]">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 font-sans">
              Run smarter. Serve better. Grow faster.
            </h2>
            <p className="text-slate-300 text-base max-w-2xl mx-auto mb-8 font-sans">
              Less chasing. Less paperwork. More control. More growth. Connect your entire garage operations into one single source of truth today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_35px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 font-sans"
              >
                Set up your garage now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer with Grekam Links */}
      <footer className="py-12 border-t border-white/5 bg-[#05070B] text-xs text-slate-500 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-white">Garage CRM</span>
            <span>•</span>
            <span>A product by <a href="https://agency.grekam.in" target="_blank" rel="noopener noreferrer" className="text-slate-300 underline font-semibold hover:text-white">Grekam Agency</a>.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 flex-wrap justify-center font-sans">
            <a href="https://agency.grekam.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Grekam Agency</a>
            <a href="https://echo.grekam.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Echo LMS</a>
            <a href="https://grafty.pro" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Grafty WhatsApp</a>
            <a href="https://atlasadmin.grekam.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Atlas E-Commerce</a>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>

      {/* ── 11. INQUIRY / ONBOARDING MODAL ── */}
      <AnimatePresence>
        {isInquiryModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0D121F] border border-white/10 rounded-2xl p-6 sm:p-8 relative shadow-2xl"
            >
              <button
                onClick={() => setIsInquiryModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-1 font-sans">Set Up Garage CRM</h3>
              <p className="text-xs text-slate-400 mb-6 font-sans">
                Fill in your details to activate your 14-day free trial & schedule a live walkthrough.
              </p>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">Garage / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Auto Care & Service"
                    value={form.garageName}
                    onChange={(e) => setForm({ ...form, garageName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Coimbatore"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">Email Address</label>
                  <input
                    type="email"
                    placeholder="ramesh@apexautocare.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4 font-sans"
                >
                  {submitting ? "Processing..." : "Activate Free Trial & Walkthrough"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
