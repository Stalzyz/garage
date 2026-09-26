"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Building2, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Star, Sparkles, 
  LayoutDashboard, Layers, Users, Briefcase, DollarSign, UserCheck, CheckSquare, 
  Trophy, Radio, Globe, BarChart2, LifeBuoy, Workflow, MessageSquare, HardDrive, Bell, 
  BookOpen, Settings, Phone, Calendar, Mail, Clock, FileText, Package, RefreshCw, X, AlertCircle,
  TrendingUp, Sliders, Smartphone, Check, Zap, HelpCircle, ChevronDown, PlayCircle, ExternalLink,
  Receipt, Flame, Compass, Award, ShieldAlert, FileCode2, ChevronUp, Send, UserPlus,
  Lock, Share2, ChevronLeft, Quote, Code, Megaphone, Video, BriefcaseBusiness, ShoppingCart, Server
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function GarageLandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeModuleCategory, setActiveModuleCategory] = useState<"ALL" | "SALES" | "PROJECTS" | "FINANCE" | "HR">("ALL")
  
  // ── DROPDOWN NAVIGATION STATE ──
  const [activeNavDropdown, setActiveNavDropdown] = useState<"FEATURES" | "ECOSYSTEM" | null>(null)

  // ── HERO SLIDESHOW STATE ──
  const heroSlides = [
    {
      image: "/hero-slide-2.jpg",
      title: "Garage CRM — Visual Sales Pipeline & Lead Tracking",
      caption: "Turn inbound leads into paying clients with high-converting Kanban pipeline stages."
    },
    {
      image: "/hero-slide-1.jpg",
      title: "Garage CRM — Project Delivery & Client Workspace",
      caption: "Manage client deliverables, milestones, assets, and team tasks in one transparent workspace."
    },
    {
      image: "/hero-slide-3.jpg",
      title: "Garage CRM — GST Invoicing, Retainers & Instant Payments",
      caption: "Send itemized proposals, recurring retainer invoices, and collect payments via 1-click links."
    }
  ]
  const [activeSlide, setActiveSlide] = useState(0)

  // ── 6 DETAILED INDUSTRY CASE STUDIES STATE ──
  const [activeCaseStudy, setActiveCaseStudy] = useState(0)

  const caseStudies = [
    {
      id: "digital-agency",
      title: "Digital Marketing & SEO Agencies",
      shortTitle: "Marketing Agencies",
      icon: Megaphone,
      tagline: "Performance marketing, SEO retainers, social media management & PPC firms",
      stats: {
        retention: "+45%",
        retentionLabel: "Retainer Renewal Rate",
        recovery: "3.2x",
        recoveryLabel: "Faster Lead-to-Close Cycle",
        timeSaved: "18 Hrs",
        timeSavedLabel: "Weekly Reporting Admin Saved"
      },
      story: {
        businessName: "Catalyst Media (22 Team Members, Bengaluru)",
        challenge: "Managing 30+ monthly retainer clients across spreadsheets caused missed renewal invoices, untracked client deliverables, and constant manual WhatsApp updates on campaign status.",
        solution: "Adopted Garage CRM to automate monthly retainer invoicing, track client campaign milestones, and send automated weekly WhatsApp progress summaries directly to client founders.",
        impact: "Retainer renewals increased by 45% due to proactive transparency. Invoicing delays dropped to zero with automated recurring billing.",
        keyModules: ["Recurring Retainer Invoicing", "Automated WhatsApp Reports", "Lead Kanban Pipeline", "Client Account History"]
      }
    },
    {
      id: "web-dev",
      title: "Web Design & Software Studios",
      shortTitle: "Web & Dev Studios",
      icon: Code,
      tagline: "Custom software development, UI/UX design, Next.js & mobile app agencies",
      stats: {
        retention: "68%",
        retentionLabel: "Proposal Win Rate",
        recovery: "Zero",
        recoveryLabel: "Scope Creep Disputes",
        timeSaved: "10 Days",
        timeSavedLabel: "Faster Milestone Payments"
      },
      story: {
        businessName: "PixelCraft Dev Labs (15 Developers, Mumbai)",
        challenge: "Sending static PDF estimates resulted in slow approvals, scope creep arguments during sprints, and delayed milestone payments from overseas & domestic clients.",
        solution: "Switched to Garage CRM's interactive web proposals with itemized deliverables, dynamic change-order approvals, and automated milestone invoice triggers upon phase sign-off.",
        impact: "Proposal acceptance rate jumped to 68%. Milestone payments are collected 10 days faster via built-in payment links.",
        keyModules: ["Interactive Web Proposals", "Digital E-Signatures", "Milestone Invoicing", "Client File & Asset Vault"]
      }
    },
    {
      id: "creative-video",
      title: "Creative & Video Production Houses",
      shortTitle: "Creative & Video",
      icon: Video,
      tagline: "Commercial video production, brand identity studios, 3D animation & post-production",
      stats: {
        retention: "100%",
        retentionLabel: "Revision Round Clarity",
        recovery: "₹2.4L",
        recoveryLabel: "Freelancer Over-payouts Saved",
        timeSaved: "4.9 ★",
        timeSavedLabel: "Client Satisfaction Rating"
      },
      story: {
        businessName: "Aperture Films & Creative (Delhi NCR)",
        challenge: "Handling complex video projects with endless unbilled client revision rounds, untracked freelance editor hours, and scattered Google Drive asset links.",
        solution: "Used Garage CRM to establish structured project stages (Script → Shoot → Rough Cut → Final Delivery), cap client revisions, track contractor hourly costs, and host secure asset links.",
        impact: "Eliminated unbilled revision requests completely and saved ₹2.4 Lakhs in unbudgeted contractor costs within the first quarter.",
        keyModules: ["Project Stage Milestones", "Revision Tracking", "Freelancer Cost Tracking", "Branded Client Portal"]
      }
    },
    {
      id: "b2b-consulting",
      title: "B2B Consulting & Advisory Firms",
      shortTitle: "B2B Consulting",
      icon: BriefcaseBusiness,
      tagline: "Management consultants, corporate strategy advisors, legal & financial consultancies",
      stats: {
        retention: "+52%",
        retentionLabel: "Deal Closing Speed",
        recovery: "100%",
        recoveryLabel: "NDA & Contract Compliance",
        timeSaved: "25 Hrs",
        timeSavedLabel: "Monthly Executive Admin Saved"
      },
      story: {
        businessName: "Vanguard Corporate Advisors (Hyderabad)",
        challenge: "High-ticket enterprise consulting deals require multi-stakeholder follow-ups, strict confidential document sharing, and long payment follow-up cycles.",
        solution: "Deployed Garage CRM for enterprise deal pipelines, automated follow-up cadences, contract expiry alerts, and integrated client-facing document verification portals.",
        impact: "Deal turnaround accelerated by 52%. All contracts and NDAs are digitally organized with complete audit trails.",
        keyModules: ["Enterprise CRM Pipeline", "Contract Vault & Expiry Alerts", "Scheduled Retainer Invoicing", "Client Activity Logs"]
      }
    },
    {
      id: "ecommerce-growth",
      title: "E-Commerce & Performance Agencies",
      shortTitle: "E-Commerce & D2C",
      icon: ShoppingCart,
      tagline: "Shopify agencies, Meta/Google ad growth partners & direct-to-consumer brand accelerators",
      stats: {
        retention: "+60%",
        retentionLabel: "Client LTV Growth",
        recovery: "100%",
        recoveryLabel: "Ad-Spend Margin Tracking",
        timeSaved: "1 Click",
        timeSavedLabel: "Multi-Brand Switcher"
      },
      story: {
        businessName: "ScaleScale Growth Partners (Bengaluru)",
        challenge: "Managing ad budgets, percentage-of-revenue billing, and performance reporting for 25+ D2C brands created severe billing calculation headaches each month-end.",
        solution: "Leveraged Garage CRM's dynamic billing calculations to combine base retainers with performance commission invoices, with instant WhatsApp receipts sent to brand directors.",
        impact: "Month-end finance close time reduced from 5 days to 2 hours. Client retention improved as brands received transparent, automated performance billing.",
        keyModules: ["Performance Commission Invoicing", "Multi-Client Dashboard", "Automated WhatsApp Alerts", "Client P&L Analytics"]
      }
    },
    {
      id: "it-reseller",
      title: "IT Resellers & Whitelabel Service Providers",
      shortTitle: "IT Resellers & SaaS",
      icon: Server,
      tagline: "Whitelabel software partners, MSPs, cloud consulting & regional IT distributors",
      stats: {
        retention: "100%",
        retentionLabel: "Custom Whitelabel Branding",
        recovery: "+35%",
        recoveryLabel: "Wholesale Margin Control",
        timeSaved: "2 Min",
        timeSavedLabel: "Automated Client Provisioning"
      },
      story: {
        businessName: "CloudSphere IT Solutions (Chennai)",
        challenge: "Wanted to offer a complete CRM and operational software suite to their business clients under their own brand name without spending millions developing custom code.",
        solution: "Enrolled in Garage CRM's Whitelabel Partner program. Customized the domain, logo, and pricing tiers to provision client accounts instantly with full wholesale margin control.",
        impact: "Launched an entirely new recurring software revenue stream in 48 hours, onboarding 40+ client organizations with 100% proprietary branding.",
        keyModules: ["Whitelabel Custom Domain", "Sub-Tenant Provisioning", "Wholesale Reseller Dashboard", "Commission Payout Engine"]
      }
    }
  ]

  // ── DEMO CREDENTIALS POPUP MODAL STATE ──
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [demoEmail, setDemoEmail] = useState("")
  const [demoName, setDemoName] = useState("")
  const [demoPhone, setDemoPhone] = useState("")
  const [demoSubmitted, setDemoSubmitted] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoEmail) {
      toast.error("Please enter your work email to receive demo credentials.")
      return
    }
    setDemoLoading(true)

    try {
      await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DEMO_ACCESS",
          recipientEmail: demoEmail,
          recipientName: demoName || "Business Partner",
          details: { phone: demoPhone }
        })
      })
      toast.success("Demo credentials generated and sent to your email!")
    } catch (err) {
      console.error("Demo email notification error:", err)
    } finally {
      setDemoLoading(false)
      setDemoSubmitted(true)
    }
  }

  // WhatsApp Simulator State
  const [simulatedChat, setSimulatedChat] = useState<Array<{ sender: "bot" | "user"; text: string; time: string }>>([
    { sender: "bot", text: "💼 Catalyst Agency: Hi Vikram! Your Q3 Growth Proposal is ready for review.", time: "10:30 AM" },
    { sender: "bot", text: "📄 Click to review scope & approve digitally: https://garage.grekam.in/verify/prop/9921", time: "10:31 AM" }
  ])
  const [simulatingWhatsApp, setSimulatingWhatsApp] = useState(false)

  const handleSimulateWhatsAppAction = (actionType: "PROPOSAL" | "PAYMENT_LINK" | "MILESTONE") => {
    setSimulatingWhatsApp(true)
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    let newMsg = ""

    if (actionType === "PROPOSAL") {
      newMsg = "📄 Proposal Alert: Website Redesign & Brand Strategy scope is ready. 1-Click review & approve digitally."
    } else if (actionType === "PAYMENT_LINK") {
      newMsg = "💳 Retainer Invoice #INV-1048 for ₹45,000 is generated. Click link to pay via UPI / NetBanking."
    } else {
      newMsg = "🚀 Milestone Update: Sprint Phase 2 (UI/UX Prototypes) is complete. Client portal updated with Figma assets."
    }

    setTimeout(() => {
      setSimulatedChat(prev => [...prev, { sender: "bot", text: newMsg, time: now }])
      setSimulatingWhatsApp(false)
      toast.success("Automated Client WhatsApp Alert Triggered!")
    }, 600)
  }

  const coreModules = [
    {
      category: "SALES",
      title: "Visual CRM & Sales Pipeline",
      icon: Users,
      badge: "Lead Conversion",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
      description: "Capture leads from website forms, WhatsApp, and campaigns. Track high-value deals through customizable visual Kanban stages.",
      bullets: ["Custom sales stages & lead scoring", "Deal value forecasting & analytics", "Automated follow-up reminders", "Lead source attribution"]
    },
    {
      category: "SALES",
      title: "Interactive Proposals & Contracts",
      icon: FileText,
      badge: "Deal Closing",
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
      description: "Send stunning interactive web proposals with itemized scopes, contract agreements, and 1-click digital client approval.",
      bullets: ["1-Click digital client sign-offs", "Itemized service packages & deliverables", "Automated proposal expiry dates", "PDF & Web view modes"]
    },
    {
      category: "PROJECTS",
      title: "Project Delivery & Client Portals",
      icon: Layers,
      badge: "Operations",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
      description: "Manage client sprints, deliverables, and team tasks. Give your clients a branded self-service portal to track live progress.",
      bullets: ["Milestone & sprint task tracking", "Client-facing branded portal", "File, asset & Figma link vault", "Client feedback & revision logs"]
    },
    {
      category: "FINANCE",
      title: "GST Invoicing, Retainers & Billing",
      icon: DollarSign,
      badge: "Cash Flow",
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
      description: "Automate monthly client retainer invoices, track advance payments, and generate 100% compliant GST invoices with UPI QR codes.",
      bullets: ["Automated recurring retainer billing", "Instant UPI & Card payment links", "Client ledger & outstanding tracking", "Vendor & expense management"]
    },
    {
      category: "SALES",
      title: "Automated WhatsApp & Email CRM",
      icon: MessageSquare,
      badge: "Client Retention",
      color: "from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30",
      description: "Never let a client wonder about project status. Trigger automated WhatsApp updates for proposal approvals, invoice links, and milestone deliveries.",
      bullets: ["Instant proposal approval alerts", "Automated payment reminder pings", "Weekly project progress summaries", "Custom WhatsApp Cloud API"]
    },
    {
      category: "HR",
      title: "Team HR, Attendance & Payroll",
      icon: UserCheck,
      badge: "Team Management",
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
      description: "Track employee attendance, project hours, leave approvals, and automated commission payouts based on closed client accounts.",
      bullets: ["Time tracking per client project", "Leave requests & approvals", "Sales commission calculations", "Team performance analytics"]
    }
  ]

  const filteredModules = activeModuleCategory === "ALL"
    ? coreModules
    : coreModules.filter(m => m.category === activeModuleCategory)

  const faqs = [
    {
      q: "What is Garage CRM and who is it designed for?",
      a: "Garage CRM is a comprehensive, all-in-one CRM, sales, operations, project management, and finance platform built for digital marketing agencies, software development studios, B2B consulting firms, creative agencies, and fast-growing modern businesses. It streamlines everything from first client contact to proposal closing, project delivery, and automated monthly retainer billing."
    },
    {
      q: "How does the Live Demo access work?",
      a: "Click 'View Demo', enter your work email, and you will instantly receive full credentials (demo@garage.in / Demo2023) to explore the live, fully functional agency dashboard with real-time leads, proposals, project boards, and billing."
    },
    {
      q: "Can I send interactive proposals and contracts to my clients?",
      a: "Yes! Garage CRM allows you to create interactive web proposals with your agency branding, itemized scope of work, timeline milestones, and 1-click digital e-signatures for instant deal closing."
    },
    {
      q: "Does Garage CRM support monthly recurring retainers and GST invoicing?",
      a: "Absolutely. You can set up automated monthly recurring invoices with automated GST calculations, HSN/SAC codes, and 1-click UPI/payment links dispatched directly to your clients' WhatsApp and email."
    },
    {
      q: "Can I whitelabel Garage CRM for my own agency or clients?",
      a: "Yes! Our Whitelabel Partner edition allows IT resellers and agencies to run Garage CRM on their own custom domain with custom brand logos, automated tenant provisioning, and wholesale pricing control."
    }
  ]

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-blue-500/30 font-sans relative overflow-x-hidden">
      
      {/* ── 1. HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Inter Typography */}
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
              <span className="text-[10px] text-zinc-400 font-normal tracking-wide">Business & Agency Growth</span>
            </div>
          </Link>

          {/* Desktop Navigation with Dropdowns */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300 font-medium">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            
            {/* Features Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveNavDropdown("FEATURES")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-white transition-colors py-2">
                Features
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeNavDropdown === "FEATURES" ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              <AnimatePresence>
                {activeNavDropdown === "FEATURES" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full left-0 w-80 p-3 bg-[#0c1220]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col gap-1"
                  >
                    <a href="#case-studies" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">6 Industry Case Studies</div>
                        <div className="text-[11px] text-zinc-400">Agencies, Tech Studios & Consulting</div>
                      </div>
                    </a>
                    <a href="#features" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <Workflow className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">Sales Pipeline & Proposals</div>
                        <div className="text-[11px] text-zinc-400">Kanban deals & 1-click approvals</div>
                      </div>
                    </a>
                    <a href="#features" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">WhatsApp Automations</div>
                        <div className="text-[11px] text-zinc-400">Client updates & invoice alerts</div>
                      </div>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#case-studies" className="hover:text-white transition-colors">Case Studies</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>

            {/* Grekam Ecosystem Products Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveNavDropdown("ECOSYSTEM")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-white transition-colors py-2 text-zinc-300">
                Grekam Products
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeNavDropdown === "ECOSYSTEM" ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              <AnimatePresence>
                {activeNavDropdown === "ECOSYSTEM" && (
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
                      <DollarSign className="w-5 h-5 text-amber-400 mt-0.5" />
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

      {/* ── 2. HERO SECTION ── */}
      <section id="overview" className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>All-in-One CRM, Sales & Operations Platform for Modern Businesses</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
            Get more clients. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Close deals faster. Scale your business.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Garage CRM is the all-in-one workspace that brings your sales pipeline, interactive client proposals, project deliverables, recurring retainer billing, team HR, and automated WhatsApp follow-ups into one simple platform.
          </p>

          {/* Direct CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Explore Live Demo Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#case-studies"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 backdrop-blur-xl transition-all flex items-center justify-center gap-2"
            >
              <span>See 6 Industry Case Studies</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </a>
          </div>

          {/* Quick Feature Proof Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Visual Kanban Sales Pipelines</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Interactive Proposals with E-Signatures</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automated Retainer Billing & GST Invoices</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Branded Client Portals & WhatsApp Updates</span>
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE HERO SLIDESHOW ── */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="relative rounded-3xl p-2 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl border border-white/10 backdrop-blur-2xl">
            
            {/* Slideshow Screen Container */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#0A0E1A]">
              <img
                src={heroSlides[activeSlide].image}
                alt={heroSlides[activeSlide].title}
                className="w-full h-full object-cover transition-opacity duration-700"
              />

              {/* Slide Caption Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm sm:text-base font-bold text-white">{heroSlides[activeSlide].title}</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{heroSlides[activeSlide].caption}</div>
                </div>
                <button
                  onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shrink-0 shadow-md flex items-center gap-1.5"
                >
                  <span>Test in Live Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Slide Navigation Tabs */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {heroSlides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    activeSlide === idx
                      ? "bg-blue-600/20 border border-blue-500/40 text-white"
                      : "bg-white/[0.02] border border-transparent text-zinc-400 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">{slide.title.replace("Garage CRM — ", "")}</div>
                  <div className="text-[9px] text-zinc-400 truncate mt-0.5">Click to preview</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. WHO IS THIS FOR? 6 DETAILED INDUSTRY CASE STUDIES ── */}
      <section id="case-studies" className="py-24 relative bg-[#060A14] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Who is Garage CRM for?</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Engineered for Modern Agencies, Studios & B2B Businesses
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
              Discover how 6 distinct business categories use Garage CRM to capture high-value clients, accelerate project delivery, and automate monthly revenue.
            </p>
          </div>

          {/* 6 Industry Tabs Header */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {caseStudies.map((cs, idx) => {
              const Icon = cs.icon
              const isActive = activeCaseStudy === idx
              return (
                <button
                  key={cs.id}
                  onClick={() => setActiveCaseStudy(idx)}
                  className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between gap-3 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 border border-blue-400/50 scale-[1.03]"
                      : "bg-[#0B101D] border border-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? "bg-white/20 text-white" : "bg-white/5 text-blue-400"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400"}`}>
                      0{idx + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight line-clamp-1">{cs.shortTitle}</div>
                    <div className={`text-[10px] truncate mt-0.5 ${isActive ? "text-blue-100" : "text-zinc-500"}`}>
                      View Case Study
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active Case Study Detail Card */}
          {caseStudies[activeCaseStudy] && (
            <motion.div
              key={activeCaseStudy}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl bg-[#090E1C] border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden"
            >
              {/* Header Info */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
                    Business Vertical #{activeCaseStudy + 1}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {caseStudies[activeCaseStudy].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    {caseStudies[activeCaseStudy].tagline}
                  </p>
                </div>

                <button
                  onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 shrink-0 self-start lg:self-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test this Workflow in Demo</span>
                </button>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8 border-b border-white/10">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">{caseStudies[activeCaseStudy].stats.retention}</div>
                  <div className="text-xs text-zinc-400 mt-1 font-medium">{caseStudies[activeCaseStudy].stats.retentionLabel}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-2xl sm:text-3xl font-black text-blue-400">{caseStudies[activeCaseStudy].stats.recovery}</div>
                  <div className="text-xs text-zinc-400 mt-1 font-medium">{caseStudies[activeCaseStudy].stats.recoveryLabel}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-2xl sm:text-3xl font-black text-purple-400">{caseStudies[activeCaseStudy].stats.timeSaved}</div>
                  <div className="text-xs text-zinc-400 mt-1 font-medium">{caseStudies[activeCaseStudy].stats.timeSavedLabel}</div>
                </div>
              </div>

              {/* Story Narrative: Challenge, Solution, Impact */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
                <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/15">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>The Real-World Challenge</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {caseStudies[activeCaseStudy].story.challenge}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/15">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Workflow className="w-4 h-4" />
                    <span>How Garage CRM Solves It</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {caseStudies[activeCaseStudy].story.solution}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Measurable Business Impact</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {caseStudies[activeCaseStudy].story.impact}
                  </p>
                </div>
              </div>

              {/* Key Workflow Chips */}
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mr-2">Featured Workflows:</span>
                {caseStudies[activeCaseStudy].story.keyModules.map((mod, mIdx) => (
                  <span key={mIdx} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300">
                    ✓ {mod}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </section>

      {/* ── 4. COMPLETE MODULE SUITE ── */}
      <section id="features" className="py-24 relative bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-2">Integrated Platform</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Everything Needed to Run & Scale Your Business
            </h2>
            <p className="text-sm text-zinc-400 mt-3">
              One connected workspace for leads, proposals, project sprints, team tasks, and automated billing.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: "ALL", label: "All Modules" },
                { id: "SALES", label: "Sales & Proposals" },
                { id: "PROJECTS", label: "Projects & Portals" },
                { id: "FINANCE", label: "Retainers & GST Invoicing" },
                { id: "HR", label: "Team & Payroll" },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveModuleCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeModuleCategory === cat.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((mod, idx) => {
              const Icon = mod.icon
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-[#080D19] border border-white/10 p-7 hover:border-white/20 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${mod.color}`}>
                        {mod.badge}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2">{mod.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">{mod.description}</p>
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-4">
                    {mod.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>View transparent pricing and compare all plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── 5. INTERACTIVE WHATSAPP AUTOMATION SIMULATOR ── */}
      <section className="py-24 relative bg-[#090D16] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Instant Client Communications</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Close Deals & Update Clients with Automated WhatsApp Alerts
              </h2>

              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                Keep client founders and decision makers informed instantly. Garage CRM automatically triggers WhatsApp alerts for interactive proposal reviews, milestone completion, and digital invoice payment links.
              </p>

              {/* Action Buttons to test simulator */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSimulateWhatsAppAction("PROPOSAL")}
                  disabled={simulatingWhatsApp}
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-semibold text-white transition-colors"
                >
                  <span>1. Simulate "Proposal Ready for Review" Alert</span>
                  <Send className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => handleSimulateWhatsAppAction("PAYMENT_LINK")}
                  disabled={simulatingWhatsApp}
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-semibold text-white transition-colors"
                >
                  <span>2. Simulate "Retainer Invoice & UPI Payment Link"</span>
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </button>

                <button
                  onClick={() => handleSimulateWhatsAppAction("MILESTONE")}
                  disabled={simulatingWhatsApp}
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-semibold text-white transition-colors"
                >
                  <span>3. Simulate "Project Sprint Milestone Completed"</span>
                  <Calendar className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            </div>

            {/* Live WhatsApp Screen Mockup */}
            <div className="relative mx-auto w-full max-w-sm rounded-[2.5rem] bg-black p-3.5 border-4 border-zinc-700 shadow-2xl">
              <div className="rounded-[2rem] bg-[#0c1317] h-[520px] flex flex-col justify-between overflow-hidden">
                
                {/* WhatsApp Chat Header */}
                <div className="bg-[#1f2c34] p-3.5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      GA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Garage Business CRM</div>
                      <div className="text-[10px] text-emerald-400">Verified Business Account</div>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>

                {/* WhatsApp Chat Bubble Stream */}
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  <div className="text-center text-[10px] text-zinc-500 my-1">TODAY</div>
                  {simulatedChat.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                        msg.sender === "bot"
                          ? "bg-[#005c4b] text-white rounded-tl-none self-start mr-auto shadow"
                          : "bg-[#1f2c34] text-zinc-200 rounded-tr-none self-end ml-auto"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div className="text-[9px] text-emerald-200/70 text-right mt-1">{msg.time}</div>
                    </div>
                  ))}
                </div>

                {/* Input Bar Placeholder */}
                <div className="bg-[#1f2c34] p-3 flex items-center justify-between text-zinc-400 text-xs">
                  <span>Type a message...</span>
                  <Send className="w-4 h-4 text-emerald-400" />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. GREKAM ECOSYSTEM PRODUCT SHOWCASE ── */}
      <section className="py-20 bg-[#060911] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-purple-950/40 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Grekam Technologies Ecosystem</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Proudly Engineered & Maintained by Grekam
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Garage CRM is part of Grekam's high-performance enterprise SaaS suite, built for reliability, data security, and scalable multi-tenant performance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
              <a href="https://agency.grekam.in" target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors">
                <div className="text-xs font-bold text-white">Grekam Agency ↗</div>
                <div className="text-[10px] text-zinc-400">agency.grekam.in</div>
              </a>
              <a href="https://echo.grekam.in" target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors">
                <div className="text-xs font-bold text-white">Echo LMS ↗</div>
                <div className="text-[10px] text-zinc-400">echo.grekam.in</div>
              </a>
              <a href="https://grafty.pro" target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors">
                <div className="text-xs font-bold text-white">Grafty WhatsApp ↗</div>
                <div className="text-[10px] text-zinc-400">grafty.pro</div>
              </a>
              <a href="https://atlasadmin.grekam.in" target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors">
                <div className="text-xs font-bold text-white">Atlas E-Commerce ↗</div>
                <div className="text-[10px] text-zinc-400">atlasadmin.grekam.in</div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ SECTION ── */}
      <section className="py-24 relative bg-[#030712]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-2">Clear Answers</div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#090D16] border border-white/10 overflow-hidden hover:border-white/20 transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
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
        </div>
      </section>

      {/* ── 8. BOTTOM CTA ── */}
      <section className="py-24 relative bg-gradient-to-b from-[#060911] to-[#030712] border-t border-white/10 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to accelerate your business sales?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Test the live agency and business dashboard in seconds. View Kanban sales pipelines, interactive client proposals, project deliverables, and automated billing in action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              <span>Get Instant Demo Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition-colors"
            >
              View Plan Comparison
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. FOOTER ── */}
      <footer className="border-t border-white/10 bg-[#04060c] py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <img src="/garage-logo.svg" alt="Garage CRM" className="w-5 h-5" />
            <span className="text-zinc-300 font-bold">Garage CRM</span>
            <span>•</span>
            <span>A proud product by <a href="https://agency.grekam.in" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Grekam</a></span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#case-studies" className="hover:text-white transition-colors">Case Studies</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
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
                    Enter your work email to receive live demo credentials instantly and access the full suite of Sales Pipelines, Proposals, Client Portals, and Invoicing.
                  </p>

                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Your Work Email *</label>
                      <input
                        type="email"
                        required
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        placeholder="you@yourcompany.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Company / Agency Name</label>
                        <input
                          type="text"
                          value={demoName}
                          onChange={(e) => setDemoName(e.target.value)}
                          placeholder="Apex Media Studio"
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
                      <span className="text-zinc-300 font-semibold">Business Admin / Agency Owner</span>
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
