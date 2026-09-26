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

export default function OrchestraGarageLandingPage() {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "CRM" | "DIALER" | "INVOICES" | "ESS">("DASHBOARD")
  const [activeModuleCategory, setActiveModuleCategory] = useState<"ALL" | "OPS" | "CRM" | "FINANCE" | "HR">("ALL")
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("ANNUAL")
  
  // ── HERO SLIDESHOW STATE ──
  const heroSlides = [
    {
      image: "/hero-slide-1.jpg",
      title: "Live Operations & Service Bay Tracker",
      caption: "Track vehicle status across all active service bays in real time."
    },
    {
      image: "/hero-slide-2.jpg",
      title: "Sales Lead Pipeline & Enquiry CRM",
      caption: "Move customer leads through stages from initial contact to booking."
    },
    {
      image: "/hero-slide-3.jpg",
      title: "GST Invoice Generator & WhatsApp Billing",
      caption: "Issue compliant GST invoices and send 1-click WhatsApp payment links."
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
            websiteType: "garage_saas",
            pageTier: "10-20",
            designTier: "enterprise",
            deliverySpeed: "standard",
            includeGst: true,
            selectedFeatures: ["Garage Operations", "CRM & Sales", "Finance & GST Billing", "HR & Payroll"],
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

      toast.success("Thank you! Our garage operations specialist will contact you shortly.")
      setIsInquiryModalOpen(false)
      setForm({ name: "", garageName: "", email: "", phone: "", city: "", notes: "" })
    } catch {
      toast.error("Form submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Complete module catalog from user specification
  const allModules = [
    {
      id: "dashboard",
      category: "OPS",
      title: "Dashboard",
      icon: LayoutDashboard,
      badge: "📊 Blue",
      gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      description: "Your garage operations at a glance. Real-time today's jobs, new enquiries, active customers, pending payments, overdue work, team activity, and revenue."
    },
    {
      id: "content-calendar",
      category: "OPS",
      title: "Content Calendar",
      icon: Calendar,
      badge: "📅 Pink",
      gradient: "from-pink-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-pink-500/30",
      iconColor: "text-pink-400",
      description: "Plan and schedule marketing activities from one unified calendar across social media, email campaigns, ads, promotions, and content publishing."
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
      description: "Keep your garage team motivated. Celebrate achievements, targets completed, employee recognition, milestones, and company announcements."
    },
    {
      id: "ess-workspace",
      category: "HR",
      title: "My Workspace / ESS",
      icon: UserCheck,
      badge: "👤 Blue",
      gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-indigo-500/30",
      iconColor: "text-indigo-400",
      description: "Employee Self-Service portal for personal profiles, clock-in/out attendance, leave applications, payslips, and internal document requests."
    },
    {
      id: "lead-pipeline",
      category: "CRM",
      title: "Lead Pipeline",
      icon: Layers,
      badge: "🎯 Purple",
      gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
      description: "Track every customer enquiry through a visual kanban sales pipeline: New Lead → Contacted → Follow-up → Interested → Converted → Lost."
    },
    {
      id: "contacts",
      category: "CRM",
      title: "Contacts Directory",
      icon: Users,
      badge: "👥 Cyan",
      gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
      description: "Store customer details, vehicle registration numbers, phone/email, repair history notes, follow-ups, and complete chat history in one place."
    },
    {
      id: "proposals",
      category: "CRM",
      title: "Proposals & Estimates",
      icon: FileText,
      badge: "📄 Violet",
      gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-violet-500/30",
      iconColor: "text-violet-400",
      description: "Send professional quotations faster with itemized service details, spare parts pricing, validity dates, and instant digital customer approval."
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
      description: "Structured click-to-call workflow for sales and service teams with call lists, automated follow-up scheduling, and call tracking."
    },
    {
      id: "call-intel",
      category: "CRM",
      title: "Call Intel",
      icon: Zap,
      badge: "🧠 Orange",
      gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
      borderColor: "border-orange-500/30",
      iconColor: "text-orange-400",
      description: "Connect call recordings, duration metrics, disposition tags, and AI call notes directly to customer CRM profiles for full context."
    },
    {
      id: "products-catalogue",
      category: "CRM",
      title: "Products & Parts",
      icon: Package,
      badge: "📦 Amber",
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-400",
      description: "Manage spare parts inventory, oils & lubricants, tools, accessories, stock levels, and consistent retail pricing for estimates and jobs."
    },
    {
      id: "subscriptions",
      category: "CRM",
      title: "Subscriptions & Plans",
      icon: RefreshCw,
      badge: "🔄 Blue",
      gradient: "from-blue-500/20 via-sky-500/10 to-transparent",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      description: "Manage recurring customer maintenance plans, annual service packages, roadside assistance memberships, and automated renewals."
    },
    {
      id: "projects",
      category: "OPS",
      title: "Projects & Repair Jobs",
      icon: Briefcase,
      badge: "📁 Purple",
      gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
      description: "Manage complex vehicle overhauls and multi-stage repair jobs with task assignments, technician timelines, attachment files, and budgets."
    },
    {
      id: "finance-income",
      category: "FINANCE",
      title: "Income & Sales",
      icon: DollarSign,
      badge: "💰 Green",
      gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      description: "Track all money coming into the business from customer payments, job cards, counter sales, and recurring maintenance billing."
    },
    {
      id: "finance-expenses",
      category: "FINANCE",
      title: "Business Expenses",
      icon: Receipt,
      badge: "💸 Red",
      gradient: "from-red-500/20 via-rose-500/10 to-transparent",
      borderColor: "border-red-500/30",
      iconColor: "text-red-400",
      description: "Track money going out for spare parts purchases, shop rent, electricity, technician expenses, and day-to-day operating costs."
    },
    {
      id: "invoices-payments",
      category: "FINANCE",
      title: "Invoices & GST Billing",
      icon: FileCode2,
      badge: "🧾 Emerald",
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      description: "Create compliant GST invoices, track pending/overdue payments, send automated WhatsApp payment links, and reduce delayed collections."
    },
    {
      id: "employees",
      category: "HR",
      title: "Employees & Roles",
      icon: Users,
      badge: "👨‍🔧 Cyan",
      gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
      description: "Organize employee profiles, job titles, department assignments, contact details, emergency contacts, and joining records."
    },
    {
      id: "time-track",
      category: "HR",
      title: "Time Track & Work Hours",
      icon: Clock,
      badge: "⏱️ Orange",
      gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
      borderColor: "border-orange-500/30",
      iconColor: "text-orange-400",
      description: "Track exact working hours spent by technicians on specific job cards to optimize staff allocation and bay throughput."
    },
    {
      id: "attendance",
      category: "HR",
      title: "Attendance Management",
      icon: CheckSquare,
      badge: "✅ Green",
      gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
      borderColor: "border-green-500/30",
      iconColor: "text-green-400",
      description: "Eliminate manual attendance registers. Track Present, Absent, Late arrivals, Approved Leaves, and monthly attendance reports."
    },
    {
      id: "leaves",
      category: "HR",
      title: "Leave Requests",
      icon: Compass,
      badge: "🏖️ Blue",
      gradient: "from-sky-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-sky-500/30",
      iconColor: "text-sky-400",
      description: "Seamless leave application workflow for employees with instant manager approval notifications, leave balances, and history."
    },
    {
      id: "payroll",
      category: "HR",
      title: "Payroll & Payslips",
      icon: DollarSign,
      badge: "💳 Emerald",
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      description: "Calculate technician salaries, overtime allowances, deductions, generate payslips, and maintain clear payment audit trails."
    },
    {
      id: "documents-vault",
      category: "HR",
      title: "Document Vault",
      icon: HardDrive,
      badge: "📄 Violet",
      gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-violet-500/30",
      iconColor: "text-violet-400",
      description: "Secure digital storage for employee ID proofs, driving licenses, certifications, employment contracts, and tax documents."
    },
    {
      id: "ats-hiring",
      category: "HR",
      title: "ATS — Garage Hiring",
      icon: Building2,
      badge: "🔎 Pink",
      gradient: "from-pink-500/20 via-rose-500/10 to-transparent",
      borderColor: "border-pink-500/30",
      iconColor: "text-pink-400",
      description: "Applicant Tracking System tailored for garage mechanics, service advisors, and managers. Manage job applications, interviews, and selections."
    }
  ]

  const filteredModules = activeModuleCategory === "ALL" 
    ? allModules 
    : allModules.filter(m => m.category === activeModuleCategory)

  const faqs = [
    {
      q: "What is Garage?",
      a: "Garage is an all-in-one operations, CRM, sales, finance, and HR platform designed specifically to help auto service centers and multi-brand garages run everything from one connected workspace."
    },
    {
      q: "Is Garage only a CRM?",
      a: "No. Garage combines CRM, sales pipelines, power dialer, job card projects, GST invoicing, expense tracking, employee attendance, payroll, and marketing tools in one platform."
    },
    {
      q: "Can I manage my customer and vehicle records?",
      a: "Yes. You can manage leads, contacts, vehicle service history, proposals, call logs, follow-ups, and communication history from the CRM."
    },
    {
      q: "Can my employees use Garage?",
      a: "Yes. Employees get their own workspace (ESS) for clock-in/out attendance, leave applications, viewing payslips, and submitting internal requests based on permissions."
    },
    {
      q: "Can I manage GST invoices and payments?",
      a: "Yes. Finance tools let you issue GST-compliant invoices, track cash vs online payments, view overdue collections, and send payment reminders via WhatsApp."
    },
    {
      q: "Can I manage recurring maintenance packages?",
      a: "Yes. The Subscriptions module handles annual maintenance contracts (AMC), periodic service packages, and membership renewals seamlessly."
    },
    {
      q: "Can my sales/service team make calls from Garage?",
      a: "Yes. The Power Dialer provides a high-velocity calling queue, while Call Intel attaches call duration metrics and notes directly to the customer record."
    },
    {
      q: "Will Garage replace all my separate spreadsheets and apps?",
      a: "Yes. Garage is built to eliminate paper notebooks, scattered WhatsApp groups, Excel sheets, and disconnected billing tools into one single source of truth."
    },
    {
      q: "Can I control employee access permissions?",
      a: "Yes. Role-based access controls ensure technicians, service advisors, accountants, and managers only view and edit the areas permitted by the admin."
    }
  ]

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      
      {/* ── 1. GETORCHESTRA TOP FLOATING NAVIGATION BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-[#07090E]/80 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
              <div className="w-full h-full bg-[#090D16] rounded-[11px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  GARAGE
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  ENTERPRISE
                </span>
              </div>
            </div>
          </Link>

          {/* Nav Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#calculator" className="hover:text-white transition-colors">ROI Calculator</a>
            <a href="#whatsapp-demo" className="hover:text-white transition-colors">WhatsApp Automation</a>
            <a href="#modules" className="hover:text-white transition-colors">Modules</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews & Ecosystem</a>
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
              Set up your garage
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. HERO SECTION (WITH SLIDESHOW & ROLE SWITCHER) ── */}
      <section className="relative pt-36 pb-16 md:pt-48 md:pb-24 overflow-hidden">
        
        {/* Glow Radial Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Persona View Switcher */}
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8 shadow-xl">
            <button
              onClick={() => setPersona("OWNER")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                persona === "OWNER" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              👨‍💼 For Garage Owners
            </button>
            <button
              onClick={() => setPersona("MANAGER")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                persona === "MANAGER" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              👨‍🔧 For Service Managers
            </button>
            <button
              onClick={() => setPersona("RESELLER")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                persona === "RESELLER" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              🏢 Whitelabel Partners
            </button>
          </div>

          {/* Dynamic Headline Based on Persona */}
          <motion.h1 
            key={persona}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-5xl mx-auto"
          >
            {persona === "OWNER" && (
              <>
                Run your garage. Manage your team.
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent block mt-2">
                  Grow your revenue 2x faster.
                </span>
              </>
            )}
            {persona === "MANAGER" && (
              <>
                Create job cards, track bays, and
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent block mt-2">
                  inspect vehicles 5x faster.
                </span>
              </>
            )}
            {persona === "RESELLER" && (
              <>
                Launch your branded garage software
                <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-amber-400 bg-clip-text text-transparent block mt-2">
                  under your custom domain.
                </span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            key={`${persona}-sub`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6 text-lg sm:text-xl text-slate-300/80 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            {persona === "OWNER" && "Accept service bookings, manage technicians & inventory, issue instant GST invoices, and automate customer follow-ups from one single connected workspace."}
            {persona === "MANAGER" && "Streamline workshop throughput with live bay tracking, power dialer follow-ups, barcode spare parts stock management, and employee kiosk attendance."}
            {persona === "RESELLER" && "Offer an enterprise garage management platform to your automotive clients. Set your own pricing, earn high recurring margins, and build your brand."}
          </motion.p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(255,255,255,0.4)] active:scale-98 transition-all flex items-center justify-center gap-3 group"
            >
              Set up your garage
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#calculator"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-medium bg-white/[0.05] text-white hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-3"
            >
              Calculate Your ROI
              <Calculator className="w-5 h-5 text-blue-400" />
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Trusted by 500+ top multi-brand garages & service chains
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all">
              <span className="font-bold tracking-wider text-base text-slate-300">AUTO-CARE PRO</span>
              <span className="font-bold tracking-wider text-base text-slate-300">GARAGE ONE</span>
              <span className="font-bold tracking-wider text-base text-slate-300">SPEEDWORKS</span>
              <span className="font-bold tracking-wider text-base text-slate-300">APEX MOTORS</span>
              <span className="font-bold tracking-wider text-base text-slate-300">VELOCITY AUTO</span>
            </div>
          </div>
        </div>

        {/* ── 3. HERO SLIDESHOW CAROUSEL (REPLACING DASHBOARD CONTAINER) ── */}
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
                <span className="text-xs font-bold text-white tracking-wide">
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
                <p className="text-xs text-slate-200 font-medium">
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
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              See how much revenue Garage saves your business.
            </h3>
            <p className="mt-4 text-base text-slate-400">
              Adjust the sliders below based on your workshop capacity to calculate your estimated annual growth.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders Input Column */}
            <div className="lg:col-span-7 p-8 rounded-2xl bg-[#07090E] border border-white/10 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-white">Service Bays / Technicians</label>
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
                  <label className="text-sm font-bold text-white">Monthly Job Cards Processed</label>
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
                  <label className="text-sm font-bold text-white">Average Service Ticket Value</label>
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
                ESTIMATED ANNUAL ROI
              </span>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Additional Annual Revenue Recovered</span>
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  +{formatPrice(annualProfitIncrease)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Calculated from unbilled spare parts & automated follow-ups.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div>
                  <span className="text-xs text-slate-400 block">Time Saved / Month</span>
                  <p className="text-xl font-bold text-white font-mono">{hoursSavedMonthly} Hours</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Monthly Revenue Boost</span>
                  <p className="text-xl font-bold text-emerald-400 font-mono">+{formatPrice(unbilledRecoveredMonthly)}</p>
                </div>
              </div>

              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-lg"
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
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Automate customer updates right on WhatsApp.
            </h3>
            <p className="mt-4 text-base text-slate-400">
              Test how Garage sends instant job card receipts, payment links, and service alerts to your customers' phones.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Action Trigger Buttons */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="text-lg font-bold text-white mb-2">Click to test instant automated triggers:</h4>
              
              <button
                onClick={() => handleSimulateWhatsAppAction("SERVICE_UPDATE")}
                className="w-full p-5 rounded-2xl bg-[#090D16] border border-white/10 hover:border-emerald-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <span className="text-sm font-bold text-white block group-hover:text-emerald-400 transition-colors">
                    1. Send Live Service Status Alert
                  </span>
                  <span className="text-xs text-slate-400">Notify customer when vehicle inspection or alignment is complete.</span>
                </div>
                <Send className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => handleSimulateWhatsAppAction("PAYMENT_LINK")}
                className="w-full p-5 rounded-2xl bg-[#090D16] border border-white/10 hover:border-emerald-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <span className="text-sm font-bold text-white block group-hover:text-emerald-400 transition-colors">
                    2. Send Instant WhatsApp Payment Link
                  </span>
                  <span className="text-xs text-slate-400">Send GST invoice link with 1-click UPI / Credit Card payment.</span>
                </div>
                <Send className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => handleSimulateWhatsAppAction("REMINDER")}
                className="w-full p-5 rounded-2xl bg-[#090D16] border border-white/10 hover:border-emerald-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <span className="text-sm font-bold text-white block group-hover:text-emerald-400 transition-colors">
                    3. Send 6-Month Maintenance Reminder
                  </span>
                  <span className="text-xs text-slate-400">Automatically invite previous customers back for scheduled service.</span>
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
                    <span className="text-xs font-bold text-white block">Apex Motors (Garage SaaS)</span>
                    <span className="text-[10px] text-emerald-400">Verified Business Account</span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="space-y-3 min-h-[300px] max-h-[340px] overflow-y-auto pr-1 text-xs custom-scrollbar">
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
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Every module your garage needs to run & scale.
            </h3>
            <p className="mt-4 text-base text-slate-400">
              Garage connects your customers, vehicle service operations, sales, employees, finance, and marketing into one seamless workspace.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: "ALL", label: "All 22 Modules" },
              { id: "OPS", label: "⚙️ Operations & Jobs" },
              { id: "CRM", label: "🎯 CRM & Sales" },
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

                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors relative z-10">
                    {module.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed relative z-10">
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
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Loved by workshop owners & service advisors.
            </h3>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 rounded-2xl bg-[#090D16] border border-white/10 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {"★".repeat(5)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Garage completely transformed our multi-bay workshop. We saved over 40 hours a month on manual invoicing and increased repeat service bookings by 25%."
              </p>
              <div>
                <span className="text-sm font-bold text-white block">Ramesh V.</span>
                <span className="text-xs text-slate-400">Owner, Apex Motors & Auto Care</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[#090D16] border border-white/10 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {"★".repeat(5)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The WhatsApp billing integration is incredible. Customers receive job card estimates and pay online before even arriving to collect their vehicle."
              </p>
              <div>
                <span className="text-sm font-bold text-white block">Siddharth Menon</span>
                <span className="text-xs text-slate-400">Managing Director, SpeedWorks Auto</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[#090D16] border border-white/10 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {"★".repeat(5)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "As a whitelabel reseller partner, launching this under our custom domain gave us a high-margin recurring SaaS offer for our auto clients."
              </p>
              <div>
                <span className="text-sm font-bold text-white block">Vikramaditya S.</span>
                <span className="text-xs text-slate-400">CEO, AutoTech Agency Network</span>
              </div>
            </div>
          </div>

          {/* Built By Grekam Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 mb-16 text-center">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block mb-2">PROUDLY BUILT BY GREKAM</span>
            <h4 className="text-2xl font-bold text-white mb-2">Part of the Grekam Enterprise Ecosystem</h4>
            <p className="text-xs text-slate-300 max-w-2xl mx-auto mb-4">
              Garage is developed & backed by <strong>Grekam Agency</strong> — building world-class SaaS, AI applications, and digital platforms.
            </p>
            <a
              href="https://agency.grekam.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Visit Grekam Agency
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Grekam Ecosystem Products Showcase Grid */}
          <div className="border-t border-white/10 pt-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h4 className="text-lg font-bold text-white">Explore Other Grekam Platforms</h4>
              <p className="text-xs text-slate-400">Empowering education, communication, and e-commerce.</p>
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
                <h5 className="text-base font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  Echo LMS
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h5>
                <p className="text-xs text-slate-400">Academy LMS, student management, video courses & educator platform.</p>
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
                <h5 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  Grafty
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h5>
                <p className="text-xs text-slate-400">High-speed WhatsApp API gateway, broadcast campaigns & chatbots.</p>
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
                <h5 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors flex items-center justify-between">
                  Atlas E-Commerce
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h5>
                <p className="text-xs text-slate-400">Multi-tenant e-commerce platform, digital storefronts & inventory suite.</p>
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
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Simple plans that grow with your business.
            </h3>
            <p className="mt-4 text-base text-slate-400">
              No hidden fees. Every plan includes customer CRM, job cards, and full GST invoicing.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-xl bg-white/[0.04] border border-white/10">
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
                <h4 className="text-lg font-bold text-white mb-1">Starter Bay</h4>
                <p className="text-xs text-slate-400 mb-6">Perfect for small auto repair workshops & single bays.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">
                    {formatPrice(billingCycle === "ANNUAL" ? 2399 : 2999)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/month + tax</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-white/10 pt-6">
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
                className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 border border-white/10 transition-all"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Pro Garage (Featured) */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-950/30 via-[#090D16] to-[#07090E] border-2 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                MOST POPULAR
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1">Pro Garage</h4>
                <p className="text-xs text-slate-300 mb-6">Designed for multi-bay service centers & scaling garages.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">
                    {formatPrice(billingCycle === "ANNUAL" ? 5599 : 6999)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/month + tax</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-200 mb-8 border-t border-white/10 pt-6">
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
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all"
              >
                Get Started Now
              </button>
            </div>

            {/* Enterprise Whitelabel */}
            <div className="p-8 rounded-2xl bg-[#07090E] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white mb-1">Whitelabel Partner</h4>
                <p className="text-xs text-slate-400 mb-6">For garage chains, agency partners & franchise networks.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">
                    {formatPrice(billingCycle === "ANNUAL" ? 11999 : 14999)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/month + tax</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-white/10 pt-6">
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
                className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 border border-white/10 transition-all"
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
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
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
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base text-white hover:text-blue-400 transition-colors"
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
                      className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4"
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

      {/* ── 10. GETORCHESTRA BOTTOM CTA BANNER & FOOTER ── */}
      <section className="py-24 relative bg-gradient-to-b from-[#090D16] to-[#05070B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-br from-blue-950/50 via-[#0B0F19] to-purple-950/30 border border-white/10 text-center relative overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)]">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Run smarter. Serve better. Grow faster.
            </h2>
            <p className="text-slate-300 text-base max-w-2xl mx-auto mb-8">
              Less chasing. Less paperwork. More control. More growth. Connect your entire garage operations into one single source of truth today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_35px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2"
              >
                Set up your garage now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer with Grekam Links */}
      <footer className="py-12 border-t border-white/5 bg-[#05070B] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-white">GARAGE SaaS</span>
            <span>•</span>
            <span>A product by <a href="https://agency.grekam.in" target="_blank" rel="noopener noreferrer" className="text-slate-300 underline font-semibold hover:text-white">Grekam Agency</a>.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 flex-wrap justify-center">
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

              <h3 className="text-xl font-bold text-white mb-1">Set Up Your Garage</h3>
              <p className="text-xs text-slate-400 mb-6">
                Fill in your details to activate your 14-day free trial & schedule a walkthrough.
              </p>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Garage / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Auto Care & Service"
                    value={form.garageName}
                    onChange={(e) => setForm({ ...form, garageName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Coimbatore"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="ramesh@apexautocare.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4"
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
