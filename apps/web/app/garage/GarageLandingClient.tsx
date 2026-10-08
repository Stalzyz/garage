"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  Building2, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Star, 
  LayoutDashboard, Layers, Users, Briefcase, DollarSign, UserCheck, CheckSquare, 
  Trophy, Radio, Globe, BarChart2, LifeBuoy, Workflow, MessageSquare, HardDrive, Bell, 
  BookOpen, Settings, Phone, Calendar, Mail, Clock, FileText, Package, RefreshCw, X, AlertCircle,
  TrendingUp, Sliders, Smartphone, Check, HelpCircle, ChevronDown, PlayCircle, ExternalLink,
  Receipt, Compass, Award, ShieldAlert, FileCode2, ChevronUp, Send, UserPlus,
  Lock, Share2, ChevronLeft, Quote, Code, Megaphone, Video, BriefcaseBusiness, ShoppingCart, Server,
  Copy, Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function GarageLandingPage() {
  const router = useRouter()
  const [loggingInRole, setLoggingInRole] = useState<"GARAGE" | "PARTNER" | null>(null)

  const handleLaunchDemo = (roleType: "GARAGE" | "PARTNER") => {
    setLoggingInRole(roleType)
    // Demo access goes through the real login (demo@garage.in / Demo2023).
    // The old /api/auth/demo-switch shortcut minted a session with a
    // placeholder id the API could never resolve, so every request and WS
    // upgrade came back 401/4401 — and it issued a password-less token.
    toast.success("Opening demo login…")
    router.push("/auth/login?callbackUrl=/dashboard")
  }

  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeModuleCategory, setActiveModuleCategory] = useState<"ALL" | "SALES" | "PROJECTS" | "FINANCE" | "HR">("ALL")
  
  // ── DROPDOWN NAVIGATION STATE ──
  const [activeNavDropdown, setActiveNavDropdown] = useState<"FEATURES" | "ECOSYSTEM" | null>(null)

  // ── HERO SLIDESHOW STATE (crm1.jpeg to crm5.jpeg) ──
  const heroSlides = [
    {
      id: "crm-pipeline",
      image: "/crm1.jpeg",
      title: "Garage CRM — Visual Sales Pipeline & Lead Kanban",
      caption: "Track and convert high-ticket leads through customizable pipeline stages with instant contact sync.",
      tabName: "Sales & Pipeline",
      badge: "Inbound Deals",
      icon: Users
    },
    {
      id: "crm-proposals",
      image: "/crm2.jpeg",
      title: "Garage CRM — Interactive Web Proposals & Sign-offs",
      caption: "Send dynamic client proposals with itemized scopes, contract agreements, and 1-click approvals.",
      tabName: "Proposals & Contracts",
      badge: "Deal Closing",
      icon: FileText
    },
    {
      id: "crm-projects",
      image: "/crm3.jpeg",
      title: "Garage CRM — Client Sprint Milestones & Task Delivery",
      caption: "Manage client deliverables, team sprints, asset vaults, and deliverable approvals in one workspace.",
      tabName: "Project Milestones",
      badge: "Operations",
      icon: Layers
    },
    {
      id: "crm-finance",
      image: "/crm4.jpeg",
      title: "Garage CRM — GST Invoicing, Retainers & Instant UPI",
      caption: "Automate monthly recurring retainer billing, create compliant GST tax bills, and collect payments.",
      tabName: "GST & Retainers",
      badge: "Finance & Cashflow",
      icon: DollarSign
    },
    {
      id: "crm-whatsapp-followup",
      image: "/crm6.jpeg",
      title: "Garage CRM — Automated WhatsApp Follow-ups & Alerts",
      caption: "Send automated proposal approval links, payment reminders, and weekly client progress summaries via WhatsApp.",
      tabName: "WhatsApp Follow-ups",
      badge: "Automated Drips",
      icon: MessageSquare
    }
  ]
  const [activeSlide, setActiveSlide] = useState(0)
  const [isSlidePaused, setIsSlidePaused] = useState(false)

  // Auto-play slideshow timer (every 5 seconds)
  useEffect(() => {
    if (isSlidePaused) return
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isSlidePaused, heroSlides.length])

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
    { sender: "bot", text: "📄 Click to review scope & approve digitally: https://grekam.in/verify/prop/9921", time: "10:31 AM" }
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

  // ── 3-ROW INTEGRATION DEFINITIONS ──
  const integrationsRow1 = [
    {
      name: "Meta Ads & Leads",
      category: "Paid Social & Inbound",
      badge: "Instant Ingestion",
      brief: "Auto-sync Facebook & Instagram lead ad submissions straight into your CRM Kanban pipeline in <1s.",
      icon: (
        <svg className="w-5 h-5 text-[#0081FB]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
        </svg>
      )
    },
    {
      name: "Google Ads (PPC)",
      category: "Search & Display",
      badge: "ROAS Tracking",
      brief: "Attribute closed client deals back to high-intent Google Search campaigns for exact cost-per-acquisition.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M3.7 13.3L8.8 4.5C9.4 3.4 10.8 3 11.9 3.6C13 4.2 13.4 5.6 12.8 6.7L7.7 15.5C7.1 16.6 5.7 17 4.6 16.4C3.5 15.8 3.1 14.4 3.7 13.3Z" fill="#FBBC04"/>
          <path d="M12.8 6.7L17.9 15.5C18.5 16.6 18.1 18 17 18.6C15.9 19.2 14.5 18.8 13.9 17.7L8.8 8.9C9.4 8.2 10.3 7.8 11.2 7.8C11.8 7.8 12.4 8 12.8 8.4L12.8 6.7Z" fill="#4285F4"/>
          <circle cx="5.5" cy="17.5" r="2.5" fill="#34A853"/>
        </svg>
      )
    },
    {
      name: "Google Sheets",
      category: "Spreadsheet Sync",
      badge: "2-Way Live Sync",
      brief: "Continuous two-way sync for deal contacts, proposal values, pipeline stages, and revenue ledgers.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#0F9D58"/>
          <path d="M7 6H17V18H7V6Z" fill="white"/>
          <path d="M9 9H15M9 12H15M9 15H15" stroke="#0F9D58" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      name: "WhatsApp Business API",
      category: "Client Messaging",
      badge: "Instant Alerts",
      brief: "Trigger automated proposal review links, milestone completion alerts, and 1-click UPI invoice links.",
      icon: (
        <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.62L5.07 16.3C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.69 12.04 3.69C14.24 3.69 16.31 4.55 17.86 6.11C19.42 7.66 20.27 9.73 20.27 11.92C20.28 16.46 16.58 20.15 12.04 20.15Z"/>
        </svg>
      )
    },
    {
      name: "Grafty WhatsApp AI",
      category: "AI Chatbots & Drips",
      badge: "grafty.pro",
      brief: "Automated multi-turn WhatsApp chatbots, lead qualification questionnaires, and drip broadcasts.",
      icon: (
        <img src="https://grafty.pro/grafty.svg" alt="Grafty" className="w-5 h-5 object-contain" />
      )
    },
    {
      name: "Make (Integromat)",
      category: "Visual iPaaS",
      badge: "No-Code Logic",
      brief: "Connect Garage CRM events to 1,500+ apps with visual multi-branch conditional routing.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#6B38FB"/>
          <path d="M6 16V8L10 13L14 8V16M14 16H18V8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ]

  const integrationsRow2 = [
    {
      name: "n8n AI Workflows",
      category: "Workflow Automation",
      badge: "Self-Hosted / Cloud",
      brief: "Trigger custom Python/JS webhook scripts, LangChain agents, and internal API orchestrations.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#FF6D5A"/>
          <circle cx="7" cy="12" r="2.5" fill="white"/>
          <circle cx="17" cy="8" r="2.5" fill="white"/>
          <circle cx="17" cy="16" r="2.5" fill="white"/>
          <path d="M9.5 12H14.5M14.5 8.5L9.5 12L14.5 15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      name: "Zoom Discovery Calls",
      category: "Video Conferencing",
      badge: "Auto-Scheduling",
      brief: "Auto-generate Zoom discovery links upon lead intake and attach recorded calls to client records.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#2D8CFF"/>
          <path d="M6 9C6 7.89543 6.89543 7 8 7H13C14.1046 7 15 7.89543 15 9V15C15 16.1046 14.1046 17 13 17H8C6.89543 17 6 16.1046 6 15V9Z" fill="white"/>
          <path d="M15 10.5L18.5 8V16L15 13.5V10.5Z" fill="white"/>
        </svg>
      )
    },
    {
      name: "Google Meet",
      category: "Client Meetings",
      badge: "1-Click Calendar",
      brief: "Sync team calendars with 1-click Meet invites for sprint milestone reviews and proposal pitches.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M14 8.5V6C14 4.89543 13.1046 4 12 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H12C13.1046 20 14 19.1046 14 18V15.5L19 19.5C19.6 20 20.5 19.6 20.5 18.8V5.2C20.5 4.4 19.6 4 19 4.5L14 8.5Z" fill="#00AC47"/>
          <path d="M14 8.5L19 4.5V10.5L14 8.5Z" fill="#EA4335"/>
          <path d="M14 15.5L19 19.5V13.5L14 15.5Z" fill="#4285F4"/>
          <path d="M14 8.5V15.5L19 13.5V10.5L14 8.5Z" fill="#FBBC04"/>
        </svg>
      )
    },
    {
      name: "Google Analytics 4",
      category: "Traffic Attribution",
      badge: "Funnel Velocity",
      brief: "Monitor client proposal views, time spent reviewing deliverables, and checkout conversion drop-offs.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#F9AB00"/>
          <rect x="5" y="13" width="3" height="6" rx="1" fill="#E37400"/>
          <rect x="10.5" y="9" width="3" height="10" rx="1" fill="#E37400"/>
          <rect x="16" y="5" width="3" height="14" rx="1" fill="white"/>
        </svg>
      )
    },
    {
      name: "Gmail & Workspace",
      category: "Email Client Sync",
      badge: "2-Way Thread Sync",
      brief: "Dispatch professional proposals and contract PDFs from your verified agency domain with open tracking.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#EA4335"/>
          <path d="M5 7L12 12.5L19 7M5 7V17H19V7H5Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      name: "Zapier Automation Hub",
      category: "Webhooks & iPaaS",
      badge: "5,000+ Apps",
      brief: "Trigger automated actions across Typeform, Calendly, ClickUp, and Notion without writing any code.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#FF4A00"/>
          <path d="M12 5V19M5 12H19M7 7L17 17M7 17L17 7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      )
    }
  ]

  const integrationsRow3 = [
    {
      name: "Razorpay Gateway",
      category: "Payments & Invoicing",
      badge: "UPI, Cards & NetBanking",
      brief: "Accept instant client milestone payments via dynamic UPI QR codes, credit cards, and auto-generate tax receipts.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#0C2340"/>
          <path d="M7 17L12 7H17L12 17H7ZM12 7L15 12H10.5L12 7Z" fill="#0C83FD"/>
        </svg>
      )
    },
    {
      name: "PhonePe Business",
      category: "UPI Intent Gateway",
      badge: "Instant UPI Settlement",
      brief: "Zero-drop mobile UPI intent payment links sent directly inside WhatsApp proposal approval chats.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#5F259F"/>
          <path d="M8.5 7H14C15.5 7 16.5 8 16.5 9.5C16.5 11 15.5 12 14 12H11V17H8.5V7ZM11 9.5V10H13.5C14 10 14.3 9.8 14.3 9.5C14.3 9.2 14 9 13.5 9H11V9.5Z" fill="white"/>
        </svg>
      )
    },
    {
      name: "Stripe Subscriptions",
      category: "Global Retainer Billing",
      badge: "USD / EUR / INR",
      brief: "Process recurring monthly retainer credit cards worldwide with automated smart failed-payment retries.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#635BFF"/>
          <path d="M14.5 10.2C14.5 9.4 13.8 8.9 12.6 8.9C11.1 8.9 9.8 9.5 9 10L8.2 8.2C9.3 7.5 10.9 7 12.7 7C15.3 7 17 8.2 17 10.4C17 13.5 12.9 13.2 12.9 14.5C12.9 15.2 13.7 15.6 14.8 15.6C16.2 15.6 17.5 15 18.2 14.4L19 16.2C18 17 16.4 17.5 14.6 17.5C12.1 17.5 10.4 16.2 10.4 14.1C10.4 10.8 14.5 11.2 14.5 10.2Z" fill="white"/>
        </svg>
      )
    },
    {
      name: "GST e-Invoicing (IRN)",
      category: "Tax Compliance",
      badge: "100% Tax Compliant",
      brief: "Automated HSN/SAC code mapping, IRN generation, and compliant B2B tax invoices with full ITC claim.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#1E3A8A"/>
          <path d="M12 4L18 7V12C18 16 12 20 12 20C12 20 6 16 6 12V7L12 4Z" stroke="#38BDF8" strokeWidth="1.5" fill="#0284C7"/>
          <path d="M9 12L11 14L15 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      name: "Smart Invoice Generator",
      category: "Billing Engine",
      badge: "1-Click PDF & Web Bills",
      brief: "Convert accepted client proposals and sprint milestones into itemized bills in a single click.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#059669"/>
          <path d="M8 6H16M8 10H16M8 14H12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M15 13L17 17L14 18L18 20" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      name: "Slack Deal Alerts",
      category: "Team Notifications",
      badge: "Real-Time Pings",
      brief: "Post instant win notifications into your #agency-sales channel whenever a client signs or pays.",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#4A154B"/>
          <circle cx="8" cy="8" r="1.8" fill="#ECB22E"/>
          <circle cx="16" cy="8" r="1.8" fill="#2EB67D"/>
          <circle cx="8" cy="16" r="1.8" fill="#36C5F0"/>
          <circle cx="16" cy="16" r="1.8" fill="#E01E5A"/>
        </svg>
      )
    }
  ]

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

            <a href="#why-us" className="hover:text-white transition-colors text-blue-300 font-semibold">Why Us</a>
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
                      <MessageSquare className="w-5 h-5 text-emerald-400 mt-0.5" />
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
              <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
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
      <section id="overview" className="relative pt-16 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6 sm:mb-8">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>All-in-One CRM, Sales & Operations Platform for Modern Businesses</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            Get more clients. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Close deals faster. Scale your business.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
            Garage CRM is the all-in-one workspace that brings your sales pipeline, interactive client proposals, project deliverables, recurring retainer billing, team HR, and automated WhatsApp follow-ups into one simple platform.
          </p>

          {/* Direct CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            <button
              onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
              className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Explore Live Demo Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#case-studies"
              className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 backdrop-blur-xl transition-all flex items-center justify-center gap-2"
            >
              <span>See 6 Industry Case Studies</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </a>
          </div>

          {/* ⚡ PREFILLED INSTANT DEMO ACCOUNTS PANEL */}
          <div className="mb-10 p-5 rounded-3xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-zinc-900/60 border border-white/10 backdrop-blur-md shadow-2xl text-left max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Instant Demo Accounts (Prefilled)</h3>
                  <p className="text-[11px] text-zinc-400">Select any demo mode below to test the live system with 1-click access</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold uppercase tracking-wider">
                No Registration Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account 1: Without Whitelabel Partner (Direct Public Access) */}
              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">1. Direct Garage Owner</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Without Whitelabel
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Public demo for garage workshops. Includes Job Cards, GST Invoicing, Inventory, CRM, and Retainers.
                </p>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between"><span className="text-zinc-500">Email:</span> <span className="text-emerald-300 font-bold">demo@garage.in</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Password:</span> <span className="text-zinc-300">Demo2023</span></div>
                </div>
                <button
                  onClick={() => handleLaunchDemo("GARAGE")}
                  disabled={loggingInRole !== null}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  {loggingInRole === "GARAGE" ? (
                    <span className="animate-pulse">Launching Public Demo...</span>
                  ) : (
                    <>
                      <span>Launch Public Garage Demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Account 2: With Whitelabel Partner (Shareable / Reseller Access) */}
              <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 hover:border-purple-500/40 transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">2. Whitelabel Partner</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    With Whitelabel
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  For partners & resellers. Features custom domain setup, reseller margins, and tenant provisioning.
                </p>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between"><span className="text-zinc-500">Email:</span> <span className="text-purple-300 font-bold">reseller@grekam.com</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Password:</span> <span className="text-zinc-300">reseller123</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLaunchDemo("PARTNER")}
                    disabled={loggingInRole !== null}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    {loggingInRole === "PARTNER" ? (
                      <span className="animate-pulse">Launching Partner Demo...</span>
                    ) : (
                      <>
                        <span>Launch Partner Demo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("https://grekam.in/partner/login?demo=partner\nCredentials: reseller@grekam.com / reseller123")
                      toast.success("Partner Demo share link copied to clipboard!")
                    }}
                    title="Copy Shareable Partner Demo Credentials"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Feature Proof Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-400 border-t border-white/5 pt-6 sm:pt-8">
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

        {/* ── INTERACTIVE HERO SLIDESHOW WITH 5 TABS ── */}
        <div 
          className="max-w-6xl mx-auto mt-12 sm:mt-16"
          onMouseEnter={() => setIsSlidePaused(true)}
          onMouseLeave={() => setIsSlidePaused(false)}
        >
          <div className="relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-2xl">
            
            {/* Slideshow Screen Container */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] min-h-[220px] sm:min-h-[460px] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#070B14] border border-white/10 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSlide}
                  src={heroSlides[activeSlide].image}
                  alt={heroSlides[activeSlide].title}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="w-full h-full object-contain bg-[#060913]"
                />
              </AnimatePresence>

              {/* Prev / Next Arrow Controls */}
              <button
                onClick={() => setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Top Floating Badge on All Devices */}
              <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-blue-300 border border-blue-500/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>{heroSlides[activeSlide].badge}</span>
              </div>

              {/* Desktop Slide Caption Overlay */}
              <div className="hidden sm:flex absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5 sm:p-6 items-center justify-between gap-4 z-10">
                <div className="max-w-2xl">
                  <div className="text-sm sm:text-base font-extrabold text-white tracking-tight">{heroSlides[activeSlide].title}</div>
                  <div className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{heroSlides[activeSlide].caption}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex gap-1.5 mr-2">
                    {heroSlides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setActiveSlide(dotIdx)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeSlide === dotIdx ? "w-6 bg-blue-500" : "w-1.5 bg-white/30 hover:bg-white/50"
                        }`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shrink-0 shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    <span>Try in Live Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mobile Compact Bottom Bar */}
              <div className="flex sm:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2.5 items-center justify-between gap-2 z-10">
                <div className="text-[11px] font-bold text-white truncate max-w-[170px]">{heroSlides[activeSlide].tabName}</div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex gap-1">
                    {heroSlides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setActiveSlide(dotIdx)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeSlide === dotIdx ? "w-4 bg-blue-500" : "w-1.5 bg-white/40"
                        }`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1 shadow-md"
                  >
                    <span>Demo</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 5 Slide Navigation Tabs — Mobile Horizontal Swipe & Desktop 5-Col Grid */}
            <div className="flex sm:grid sm:grid-cols-5 gap-2 mt-2 sm:mt-3 overflow-x-auto pb-1 sm:pb-0 no-scrollbar snap-x snap-mandatory">
              {heroSlides.map((slide, idx) => {
                const TabIcon = slide.icon
                const isActive = activeSlide === idx
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(idx)}
                    className={`relative min-w-[145px] sm:min-w-0 flex-1 shrink-0 snap-start p-2.5 sm:p-3 rounded-xl text-left transition-all overflow-hidden ${
                      isActive
                        ? "bg-blue-600/20 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] text-white"
                        : "bg-white/[0.02] border border-white/5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                    }`}
                  >
                    {/* Active Tab Progress Bar */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400" />
                    )}

                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? "bg-blue-500 text-white" : "bg-white/5 text-zinc-400"
                      }`}>
                        <TabIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? "text-blue-300" : "text-zinc-500"
                      }`}>
                        0{idx + 1}
                      </span>
                    </div>

                    <div className="text-xs font-bold truncate leading-tight">{slide.tabName}</div>
                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">{slide.badge}</div>
                  </button>
                )
              })}
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
                  <ArrowRight className="w-3.5 h-3.5" />
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

      {/* ── 3.5 SEAMLESS APP & PAYMENT INTEGRATIONS (CENTRAL HUB & GLOWING NETWORK) ── */}
      <section className="py-24 relative bg-[#040813] border-b border-white/5 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-blue-600/10 blur-[150px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Connected Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Connect Your Stack. Automate Your Work. Move Fast.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl mx-auto mt-4 leading-relaxed">
            Garage CRM sits at the center of your growth engine, connecting your lead sources, client meetings, automated WhatsApp messaging, and billing gateways seamlessly.
          </p>
        </div>

        {/* ── INTERACTIVE 360° ORBITAL INTEGRATION NETWORK DIAGRAM ── */}
        <div className="max-w-6xl mx-auto px-4 mb-16">
          <div className="relative rounded-3xl bg-[#050914]/95 border border-white/10 p-4 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.85)] overflow-hidden">
            
            {/* SVG Interactive Orbital Canvas */}
            <div className="relative w-full aspect-[1000/600] max-h-[600px]">
              <svg 
                viewBox="0 0 1000 600" 
                className="w-full h-full select-none"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Glowing Filters */}
                  <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <filter id="centerPlateGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#38BDF8" floodOpacity="0.6"/>
                  </filter>

                  <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Radial Center Glow Ring */}
                  <radialGradient id="centerGlowRing" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.6" />
                    <stop offset="60%" stopColor="#1E1B4B" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>

                  {/* Directional Gradients */}
                  <linearGradient id="gradTop" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="gradRight" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="gradBottom" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="gradLeft" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* ── CONCENTRIC ORBITAL RINGS ── */}
                {/* Outer Orbit Glow */}
                <ellipse cx="500" cy="300" rx="380" ry="215" stroke="#00E5FF" strokeWidth="4" strokeOpacity="0.08" filter="url(#particleGlow)" />
                {/* Outer Orbit Dashed Line */}
                <ellipse cx="500" cy="300" rx="380" ry="215" stroke="rgba(56,189,248,0.25)" strokeWidth="1.5" strokeDasharray="6 8" />
                
                {/* Inner Orbit Dashed Line */}
                <ellipse cx="500" cy="300" rx="230" ry="130" stroke="rgba(99,102,241,0.18)" strokeWidth="1" strokeDasharray="4 6" />

                {/* ── AMBIENT NEON GLOW BACKDROP CONNECTING LINES ── */}
                <path d="M 500 300 C 500 220, 500 160, 500 85" stroke="#10B981" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 575 300, 640 220, 690 115" stroke="#14B8A6" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 640 300, 750 260, 830 195" stroke="#0C83FD" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 660 300, 780 300, 880 300" stroke="#6366F1" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 640 300, 750 340, 830 405" stroke="#0284C7" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 575 300, 640 380, 690 485" stroke="#5F259F" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 500 380, 500 440, 500 515" stroke="#EA4335" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 425 300, 360 380, 310 485" stroke="#F59E0B" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 360 300, 250 340, 170 405" stroke="#FF6D5A" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 340 300, 220 300, 120 300" stroke="#6B38FB" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 360 300, 250 260, 170 195" stroke="#2D8CFF" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />
                <path d="M 500 300 C 425 300, 360 220, 310 115" stroke="#0081FB" strokeWidth="4" strokeOpacity="0.18" filter="url(#particleGlow)" />

                {/* ── CRISP CONNECTING GLOWING RADIAL BEZIER PATHS ── */}
                <path id="pathOrb0" d="M 500 300 C 500 220, 500 160, 500 85" stroke="url(#gradTop)" strokeWidth="1.8" strokeLinecap="round" />
                <path id="pathOrb1" d="M 500 300 C 575 300, 640 220, 690 115" stroke="url(#gradTop)" strokeWidth="1.8" strokeLinecap="round" />
                <path id="pathOrb2" d="M 500 300 C 640 300, 750 260, 830 195" stroke="url(#gradRight)" strokeWidth="1.8" strokeLinecap="round" />
                <path id="pathOrb3" d="M 500 300 C 660 300, 780 300, 880 300" stroke="url(#gradRight)" strokeWidth="2.2" strokeLinecap="round" />
                <path id="pathOrb4" d="M 500 300 C 640 300, 750 340, 830 405" stroke="url(#gradRight)" strokeWidth="1.8" strokeLinecap="round" />
                <path id="pathOrb5" d="M 500 300 C 575 300, 640 380, 690 485" stroke="url(#gradBottom)" strokeWidth="1.8" strokeLinecap="round" />
                <path id="pathOrb6" d="M 500 300 C 500 380, 500 440, 500 515" stroke="url(#gradBottom)" strokeWidth="1.8" strokeLinecap="round" />
                <path id="pathOrb7" d="M 500 300 C 425 300, 360 380, 310 485" stroke="url(#gradBottom)" strokeWidth="1.8" strokeLinecap="round" />
                <path id="pathOrb8" d="M 500 300 C 360 300, 250 340, 170 405" stroke="url(#gradLeft)" strokeWidth="1.8" strokeLinecap="round" />
                <path id="pathOrb9" d="M 500 300 C 340 300, 220 300, 120 300" stroke="url(#gradLeft)" strokeWidth="2.2" strokeLinecap="round" />
                <path id="pathOrb10" d="M 500 300 C 360 300, 250 260, 170 195" stroke="url(#gradLeft)" strokeWidth="1.8" strokeLinecap="round" />
                <path id="pathOrb11" d="M 500 300 C 425 300, 360 220, 310 115" stroke="url(#gradLeft)" strokeWidth="1.8" strokeLinecap="round" />

                {/* ── ANIMATED TRAVELING ENERGY PARTICLES (360° Radial Flow) ── */}
                <circle r="4" fill="#10B981" filter="url(#particleGlow)">
                  <animateMotion dur="2.8s" repeatCount="indefinite" path="M 500 300 C 500 220, 500 160, 500 85" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#14B8A6" filter="url(#particleGlow)">
                  <animateMotion dur="3.2s" repeatCount="indefinite" path="M 500 300 C 575 300, 640 220, 690 115" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#0C83FD" filter="url(#particleGlow)">
                  <animateMotion dur="2.6s" repeatCount="indefinite" path="M 500 300 C 640 300, 750 260, 830 195" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#6366F1" filter="url(#particleGlow)">
                  <animateMotion dur="3.5s" repeatCount="indefinite" path="M 500 300 C 660 300, 780 300, 880 300" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#0284C7" filter="url(#particleGlow)">
                  <animateMotion dur="3.0s" repeatCount="indefinite" path="M 500 300 C 640 300, 750 340, 830 405" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#A855F7" filter="url(#particleGlow)">
                  <animateMotion dur="3.4s" repeatCount="indefinite" path="M 500 300 C 575 300, 640 380, 690 485" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#EA4335" filter="url(#particleGlow)">
                  <animateMotion dur="2.9s" repeatCount="indefinite" path="M 500 300 C 500 380, 500 440, 500 515" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#F59E0B" filter="url(#particleGlow)">
                  <animateMotion dur="3.3s" repeatCount="indefinite" path="M 500 300 C 425 300, 360 380, 310 485" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#FF6D5A" filter="url(#particleGlow)">
                  <animateMotion dur="2.7s" repeatCount="indefinite" path="M 500 300 C 360 300, 250 340, 170 405" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#6B38FB" filter="url(#particleGlow)">
                  <animateMotion dur="3.6s" repeatCount="indefinite" path="M 500 300 C 340 300, 220 300, 120 300" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#2D8CFF" filter="url(#particleGlow)">
                  <animateMotion dur="3.1s" repeatCount="indefinite" path="M 500 300 C 360 300, 250 260, 170 195" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>
                <circle r="4" fill="#00E5FF" filter="url(#particleGlow)">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path="M 500 300 C 425 300, 360 220, 310 115" keyPoints="0;1;0" keyTimes="0;0.5;1" />
                </circle>

                {/* ── TERMINAL CONNECTION GLOWING DOTS ── */}
                <circle cx="500" cy="85" r="4" fill="#10B981" filter="url(#dotGlow)" />
                <circle cx="690" cy="115" r="4" fill="#14B8A6" filter="url(#dotGlow)" />
                <circle cx="830" cy="195" r="4" fill="#0C83FD" filter="url(#dotGlow)" />
                <circle cx="880" cy="300" r="4" fill="#6366F1" filter="url(#dotGlow)" />
                <circle cx="830" cy="405" r="4" fill="#0284C7" filter="url(#dotGlow)" />
                <circle cx="690" cy="485" r="4" fill="#A855F7" filter="url(#dotGlow)" />
                <circle cx="500" cy="515" r="4" fill="#EA4335" filter="url(#dotGlow)" />
                <circle cx="310" cy="485" r="4" fill="#F59E0B" filter="url(#dotGlow)" />
                <circle cx="170" cy="405" r="4" fill="#FF6D5A" filter="url(#dotGlow)" />
                <circle cx="120" cy="300" r="4" fill="#6B38FB" filter="url(#dotGlow)" />
                <circle cx="170" cy="195" r="4" fill="#2D8CFF" filter="url(#dotGlow)" />
                <circle cx="310" cy="115" r="4" fill="#0081FB" filter="url(#dotGlow)" />

                {/* ── CENTER HUB: GARAGE CRM LOGO WITH GLOWING ORBITAL ENGINE ── */}
                {/* Outer Ripple 1 */}
                <circle cx="500" cy="300" r="86" fill="url(#centerGlowRing)">
                  <animate attributeName="r" values="80;92;80" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
                </circle>

                {/* Outer Glow Ring 2 */}
                <circle cx="500" cy="300" r="68" fill="#081021" stroke="#00E5FF" strokeWidth="1.5" strokeOpacity="0.5" filter="url(#hubGlow)" />
                <circle cx="500" cy="300" r="54" fill="#040813" stroke="#38BDF8" strokeWidth="2" strokeOpacity="0.8" />

                {/* Center White Clean Circular Plate */}
                <circle cx="500" cy="300" r="44" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" filter="url(#centerPlateGlow)" />

                {/* Garage CRM Logo Mark Image in Center */}
                <image 
                  href="/garage-logo.svg" 
                  x="466" 
                  y="266" 
                  width="68" 
                  height="68" 
                  className="rounded-full"
                />

                {/* ── 12 SURROUNDING CIRCULAR INTEGRATION LOGOS IN 360° ORBIT ── */}
                
                {/* Node 0 (12 o'clock / Top): WhatsApp Marketing */}
                <g transform="translate(500, 85)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#25D366] shadow-[0_0_22px_rgba(37,211,102,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.62L5.07 16.3C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.69 12.04 3.69C14.24 3.69 16.31 4.55 17.86 6.11C19.42 7.66 20.27 9.73 20.27 11.92C20.28 16.46 16.58 20.15 12.04 20.15Z"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="0" y="-32" textAnchor="middle" className="text-[11px] font-bold fill-emerald-300 tracking-wide">WhatsApp</text>
                </g>

                {/* Node 1 (1 o'clock): Grafty AI */}
                <g transform="translate(690, 115)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#0F766E] shadow-[0_0_22px_rgba(20,184,166,0.6)] flex items-center justify-center border-2 border-teal-300/40 p-2 hover:scale-110 transition-transform cursor-pointer">
                      <img src="https://grafty.pro/grafty.svg" alt="Grafty" className="w-full h-full object-contain" />
                    </div>
                  </foreignObject>
                  <text x="35" y="-12" textAnchor="start" className="text-[11px] font-bold fill-teal-300 tracking-wide">Grafty AI</text>
                </g>

                {/* Node 2 (2 o'clock): Razorpay */}
                <g transform="translate(830, 195)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#0C2340] shadow-[0_0_22px_rgba(12,131,253,0.6)] flex items-center justify-center border-2 border-blue-400/40 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M7 17L12 7H17L12 17H7ZM12 7L15 12H10.5L12 7Z" fill="#0C83FD"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="35" y="5" textAnchor="start" className="text-[11px] font-bold fill-blue-300 tracking-wide">Razorpay</text>
                </g>

                {/* Node 3 (3 o'clock / East): Stripe */}
                <g transform="translate(880, 300)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#635BFF] shadow-[0_0_22px_rgba(99,91,255,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.5 10.2C14.5 9.4 13.8 8.9 12.6 8.9C11.1 8.9 9.8 9.5 9 10L8.2 8.2C9.3 7.5 10.9 7 12.7 7C15.3 7 17 8.2 17 10.4C17 13.5 12.9 13.2 12.9 14.5C12.9 15.2 13.7 15.6 14.8 15.6C16.2 15.6 17.5 15 18.2 14.4L19 16.2C18 17 16.4 17.5 14.6 17.5C12.1 17.5 10.4 16.2 10.4 14.1C10.4 10.8 14.5 11.2 14.5 10.2Z"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="35" y="5" textAnchor="start" className="text-[11px] font-bold fill-indigo-300 tracking-wide">Stripe</text>
                </g>

                {/* Node 4 (4 o'clock): GST e-Invoicing */}
                <g transform="translate(830, 405)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#0284C7] shadow-[0_0_22px_rgba(2,132,199,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4L18 7V12C18 16 12 20 12 20C12 20 6 16 6 12V7L12 4Z" stroke="#38BDF8" strokeWidth="1.5" fill="#0284C7"/>
                        <path d="M9 12L11 14L15 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="35" y="5" textAnchor="start" className="text-[11px] font-bold fill-sky-300 tracking-wide">GST Portal</text>
                </g>

                {/* Node 5 (5 o'clock): PhonePe */}
                <g transform="translate(690, 485)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#5F259F] shadow-[0_0_22px_rgba(95,37,159,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M8.5 7H14C15.5 7 16.5 8 16.5 9.5C16.5 11 15.5 12 14 12H11V17H8.5V7ZM11 9.5V10H13.5C14 10 14.3 9.8 14.3 9.5C14.3 9.2 14 9 13.5 9H11V9.5Z" fill="white"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="35" y="15" textAnchor="start" className="text-[11px] font-bold fill-purple-300 tracking-wide">PhonePe</text>
                </g>

                {/* Node 6 (6 o'clock / Bottom): Gmail */}
                <g transform="translate(500, 515)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#EA4335] shadow-[0_0_22px_rgba(234,67,53,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M5 7L12 12.5L19 7M5 7V17H19V7H5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="0" y="42" textAnchor="middle" className="text-[11px] font-bold fill-red-300 tracking-wide">Gmail Sync</text>
                </g>

                {/* Node 7 (7 o'clock): Google Analytics */}
                <g transform="translate(310, 485)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#F59E0B] shadow-[0_0_22px_rgba(245,158,11,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="13" width="3" height="6" rx="1" fill="#E37400"/>
                        <rect x="10.5" y="9" width="3" height="10" rx="1" fill="#E37400"/>
                        <rect x="16" y="5" width="3" height="14" rx="1" fill="white"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="-35" y="15" textAnchor="end" className="text-[11px] font-bold fill-amber-300 tracking-wide">Analytics</text>
                </g>

                {/* Node 8 (8 o'clock): n8n Workflows */}
                <g transform="translate(170, 405)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#FF6D5A] shadow-[0_0_22px_rgba(255,109,90,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="7" cy="12" r="2.5" fill="white"/>
                        <circle cx="17" cy="8" r="2.5" fill="white"/>
                        <circle cx="17" cy="16" r="2.5" fill="white"/>
                        <path d="M9.5 12H14.5M14.5 8.5L9.5 12L14.5 15.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="-35" y="5" textAnchor="end" className="text-[11px] font-bold fill-orange-300 tracking-wide">n8n AI</text>
                </g>

                {/* Node 9 (9 o'clock / West): Make */}
                <g transform="translate(120, 300)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#6B38FB] shadow-[0_0_22px_rgba(107,56,251,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M6 16V8L10 13L14 8V16M14 16H18V8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="-35" y="5" textAnchor="end" className="text-[11px] font-bold fill-purple-300 tracking-wide">Make</text>
                </g>

                {/* Node 10 (10 o'clock): Zoom & Meet */}
                <g transform="translate(170, 195)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#2D8CFF] shadow-[0_0_22px_rgba(45,140,255,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 8C5 6.89543 5.89543 6 7 6H13C14.1046 6 15 6.89543 15 8V16C15 17.1046 14.1046 18 13 18H7C5.89543 18 5 17.1046 5 16V8Z"/>
                        <path d="M16 10L19.5 7.5V16.5L16 14V10Z"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="-35" y="5" textAnchor="end" className="text-[11px] font-bold fill-blue-300 tracking-wide">Zoom / Meet</text>
                </g>

                {/* Node 11 (11 o'clock): Meta & Google Ads */}
                <g transform="translate(310, 115)">
                  <foreignObject x="-24" y="-24" width="48" height="48">
                    <div className="w-12 h-12 rounded-full bg-[#0081FB] shadow-[0_0_22px_rgba(0,129,251,0.6)] flex items-center justify-center border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                      </svg>
                    </div>
                  </foreignObject>
                  <text x="-35" y="-12" textAnchor="end" className="text-[11px] font-bold fill-cyan-300 tracking-wide">Meta & Ads</text>
                </g>

              </svg>
            </div>

            <div className="text-center pt-3">
              <span className="text-[11px] text-zinc-400 font-mono uppercase tracking-widest">
                360° Orbital Architecture • Real-Time Bi-directional Synchronization
              </span>
            </div>

          </div>
        </div>

        {/* ── ROW 1: Meta, Google Ads, Sheets, WhatsApp, Grafty, Make (Right to Left) ── */}
        <div className="mb-4 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee-row-1 gap-4 py-1">
            {[...integrationsRow1, ...integrationsRow1].map((item, idx) => (
              <div
                key={`r1-${idx}`}
                className="w-[360px] p-5 rounded-2xl bg-[#090E1C]/90 border border-white/10 hover:border-blue-500/40 hover:bg-[#0c1326] transition-all flex flex-col justify-between shrink-0 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">{item.name}</div>
                      <div className="text-[10px] text-zinc-500">{item.category}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[34px]">
                  {item.brief}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 2: n8n, Zoom, Google Meet, Analytics, Gmail, Zapier (Left to Right) ── */}
        <div className="mb-4 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee-row-2 gap-4 py-1">
            {[...integrationsRow2, ...integrationsRow2].map((item, idx) => (
              <div
                key={`r2-${idx}`}
                className="w-[360px] p-5 rounded-2xl bg-[#090E1C]/90 border border-white/10 hover:border-purple-500/40 hover:bg-[#0c1326] transition-all flex flex-col justify-between shrink-0 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">{item.name}</div>
                      <div className="text-[10px] text-zinc-500">{item.category}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[34px]">
                  {item.brief}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 3: Razorpay, PhonePe, Stripe, GST e-Invoice, Invoice Gen, Slack (Right to Left) ── */}
        <div className="overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee-row-3 gap-4 py-1">
            {[...integrationsRow3, ...integrationsRow3].map((item, idx) => (
              <div
                key={`r3-${idx}`}
                className="w-[360px] p-5 rounded-2xl bg-[#090E1C]/90 border border-white/10 hover:border-emerald-500/40 hover:bg-[#0c1326] transition-all flex flex-col justify-between shrink-0 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">{item.name}</div>
                      <div className="text-[10px] text-zinc-500">{item.category}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[34px]">
                  {item.brief}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Fast-Integration Footnote */}
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-2 text-xs text-zinc-400 bg-white/[0.03] px-4 py-2 rounded-full border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>REST API & Webhooks enabled on all plans for custom in-house tools.</span>
          </div>
        </div>
      </section>

      {/* ── 3.75 WHAT MAKES US BETTER / WHY GARAGE OS WINS ── */}
      <section id="why-us" className="py-24 relative bg-gradient-to-b from-[#040813] via-[#070d1e] to-[#030712] border-b border-white/5 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[160px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Competitive Superiority</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Stop Paying for 7 Disconnected Apps. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Run One High-Velocity Business Engine.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
              Traditional CRMs only store contacts. Garage OS bridges your entire revenue cycle — from the first telecaller phone call to interactive proposals, sprint milestone tracking, automated GST retainers, and client WhatsApp alerts.
            </p>
          </div>

          {/* ── COMPARISON: 7-APP FRAGMENTED STACK VS GARAGE OS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-stretch">
            
            {/* Left: The Old Disjointed SaaS Hell */}
            <div className="lg:col-span-5 rounded-3xl bg-[#090D16]/90 border border-red-500/20 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-500/10 border-b border-l border-red-500/20 rounded-bl-2xl text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                The Disjointed Stack (Painful & Costly)
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <h3 className="text-lg font-bold text-white">7 Fragmented Subscriptions</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-6">
                  Constant Zapier errors, lost leads between apps, duplicate data entry, and runaway monthly software invoices.
                </p>

                <div className="space-y-2.5 text-xs text-zinc-300">
                  {[
                    { tool: "CRM & Lead Pipeline (HubSpot / Salesforce)", cost: "₹4,500 – ₹12,000 / mo" },
                    { tool: "Proposals & E-Signatures (PandaDoc / Proposify)", cost: "₹3,900 – ₹6,000 / mo" },
                    { tool: "Power Dialer & Call Recording (Exotel / CloudTalk)", cost: "₹3,500 – ₹7,500 / mo" },
                    { tool: "WhatsApp Marketing & Drip Alerts (Wati / Interakt)", cost: "₹3,000 – ₹8,000 / mo" },
                    { tool: "Project Tasks & Sprint Boards (Asana / Monday)", cost: "₹2,500 – ₹5,000 / mo" },
                    { tool: "HR Attendance & Payroll (Keka / Gusto)", cost: "₹3,000 – ₹7,000 / mo" },
                    { tool: "GST Invoicing & Retainers (QuickBooks / Zoho)", cost: "₹2,000 – ₹4,000 / mo" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2">
                        <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-zinc-300 text-[11px]">{item.tool}</span>
                      </div>
                      <span className="text-[10px] font-mono text-red-300/80 shrink-0">{item.cost}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total Cost per User:</div>
                  <div className="text-lg font-black text-red-400">₹22,400+ / mo</div>
                </div>
                <div className="text-right text-[10px] text-zinc-400">
                  ✕ Multiple Logins<br />
                  ✕ Zapier Sync Breaks
                </div>
              </div>
            </div>

            {/* Right: Garage All-In-One Revenue Engine */}
            <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-blue-950/40 via-[#070e20] to-[#091228] border-2 border-blue-500/40 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.18)]">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500/20 border-b border-l border-emerald-500/30 rounded-bl-2xl text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Garage OS All-in-One
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="text-lg font-bold text-white">1 Unified Operating Workspace</h3>
                </div>
                <p className="text-xs text-zinc-300 mb-6">
                  Everything connects natively into one centralized database with zero synchronization lag, zero third-party connectors, and automated workflows.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { title: "Native AI Power Dialer", desc: "Instant click-to-dial, auto-timestamped call notes, and instant disposition status." },
                    { title: "Dual WhatsApp Outreach", desc: "1-Click WhatsApp Web/App deep links + verified Meta Cloud API background alerts." },
                    { title: "Proposal-to-Invoice Flow", desc: "Interactive web proposals with digital e-signatures auto-converting into projects." },
                    { title: "Indian GST & UPI Billing", desc: "Full 18% GST tax invoices, HSN/SAC codes, instant UPI QR links, and client P&L." },
                    { title: "Turnkey Whitelabel Engine", desc: "Run under your own custom domain (crm.yourbrand.com) with pre-login branding." },
                    { title: "Granular Modular Control", desc: "Super admin toggles for individual features (Dialer, HR, Finance) and staff seats." },
                  ].map((feat, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors">
                      <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-500/10 -mx-6 -mb-6 p-6">
                <div>
                  <div className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">Single Transparent Annual Plan:</div>
                  <div className="text-2xl font-black text-white flex items-baseline gap-1.5">
                    <span>Save 80%+</span>
                    <span className="text-xs font-normal text-zinc-300">vs fragmented tools</span>
                  </div>
                </div>
                <button
                  onClick={() => { setShowDemoModal(true); setDemoSubmitted(false) }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <span>Experience the Difference</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* ── 6 CORE COMPETITIVE SUPERPOWERS GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1 */}
            <div className="p-7 rounded-3xl bg-[#070B14] border border-white/10 hover:border-blue-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">1. Eliminate SaaS Bloat & Data Silos</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Say goodbye to juggling 7 tabs and maintaining brittle Zapier automations. Garage OS acts as your single source of truth across leads, client deliverables, staff payroll, and financial ledgers.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-semibold text-blue-400">
                <span>Unified Database Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2 */}
            <div className="p-7 rounded-3xl bg-[#070B14] border border-white/10 hover:border-emerald-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">2. Sales Velocity Power Dialer</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Telecallers dial directly from the pipeline. The moment the call ends, an unclosable disposition modal pops up with auto-timestamps <code className="text-emerald-300 font-mono text-[10px] bg-black/40 px-1 py-0.5 rounded">[DD Mon YYYY · Agent]</code> and instant WhatsApp proposal triggers.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <span>Zero Lost Follow-ups</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3 */}
            <div className="p-7 rounded-3xl bg-[#070B14] border border-white/10 hover:border-purple-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">3. 1-Click Proposal-to-Project Pipeline</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Send interactive client proposals with selectable scope tiers and legal digital e-signatures. Once signed, the system automatically creates the client portal, task sprints, and retainer invoice schedules.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-semibold text-purple-400">
                <span>Instant Deal Closing</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 4 */}
            <div className="p-7 rounded-3xl bg-[#070B14] border border-white/10 hover:border-amber-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">4. 100% Indian GST & UPI Native</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Unlike foreign tools, Garage OS comes built-in with 18% GST tax invoices, HSN/SAC codes, CGST/SGST/IGST breakdowns, B2B GSTIN validation, ITC compliance, and direct UPI QR payment collection links.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                <span>Full Tax Compliance</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 5 */}
            <div className="p-7 rounded-3xl bg-[#070B14] border border-white/10 hover:border-cyan-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">5. Turnkey White-Label Engine</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Empower IT resellers, agencies, and enterprise partners to run on custom domains (<code className="text-cyan-300 font-mono text-[10px]">crm.theirbrand.com</code>) with automated pre-login logo resolution and wholesale partner margin controls.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
                <span>100% Brand Ownership</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 6 */}
            <div className="p-7 rounded-3xl bg-[#070B14] border border-white/10 hover:border-pink-500/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">6. Modular Super Admin Governance</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Super Admin has total modular control: toggle Power Dialer, HR, Marketing, or Finance modules per workshop, set custom validity dates, enforce staff seat limits, and manage multi-tenant access securely.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-semibold text-pink-400">
                <span>Centralized Control Plane</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

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
                <Building2 className="w-3.5 h-3.5" />
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
              className="relative w-full max-w-2xl rounded-3xl bg-[#0B101D] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Instant 1-Click Live Demo Access</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">Select Your Demo Experience</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Choose between public garage owner access or white-label partner portal. Both accounts are prefilled and ready to launch.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-6">
                {/* 1. Public Garage Owner Demo (Without Whitelabel) */}
                <div className="p-5 rounded-2xl bg-white/5 border border-emerald-500/30 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" /> Garage Owner
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                        No Whitelabel
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                      Standard SaaS portal. Experience visual Kanban pipelines, GST invoicing, job cards, and CRM.
                    </p>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-1 text-zinc-300">
                      <div><span className="text-zinc-500">Email:</span> demo@garage.in</div>
                      <div><span className="text-zinc-500">Pass:</span> Demo2023</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowDemoModal(false)
                      handleLaunchDemo("GARAGE")
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all mt-3"
                  >
                    <span>Launch Garage Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Whitelabel Partner Demo (With Whitelabel) */}
                <div className="p-5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> Whitelabel Partner
                      </span>
                      <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                        With Whitelabel
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                      Reseller control panel. Manage custom domain branding, reseller margins, and garage activation wallets.
                    </p>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-1 text-zinc-300">
                      <div><span className="text-zinc-500">Email:</span> reseller@grekam.com</div>
                      <div><span className="text-zinc-500">Pass:</span> reseller123</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        setShowDemoModal(false)
                        handleLaunchDemo("PARTNER")
                      }}
                      className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Launch Partner Demo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("https://grekam.in/partner/login?demo=partner\nCredentials: reseller@grekam.com / reseller123")
                        toast.success("Partner Demo credentials copied for manual sharing!")
                      }}
                      title="Copy Partner Demo Credentials to share manually"
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
                <span className="text-[11px]">Need to manually share the partner demo credentials with a partner?</span>
                <a
                  href="https://wa.me/?text=Hi%20Partner!%20Here%20are%20your%20Whitelabel%20Partner%20Demo%20credentials%20for%20Garage%20CRM:%0A%0A🌐%20Portal:%20https://grekam.in/partner/login?demo=partner%0A📧%20Email:%20reseller@grekam.com%0A🔑%20Password:%20reseller123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 font-semibold text-[11px] flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Share via WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── STICKY FLOATING ACTION BUTTON (FAB) FOR FREE DEMO VIA WHATSAPP ── */}
      <aside aria-label="WhatsApp Free Demo Support" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center">
        <a
          href="https://wa.me/919789359407?text=Hi%20Garage%20Team%2C%20I%20would%20like%20to%20get%20a%20Free%20Demo%20of%20Garage%20CRM."
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(37,211,102,0.6)] hover:shadow-[0_0_35px_rgba(37,211,102,0.85)] transition-all transform hover:scale-105 active:scale-95 border-2 border-white/30"
          aria-label="Connect on WhatsApp for Free Demo"
        >
          {/* Animated Glowing Ring Beacon */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>

          {/* WhatsApp SVG Icon */}
          <svg className="w-5 h-5 text-white shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.62L5.07 16.3C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.69 12.04 3.69C14.24 3.69 16.31 4.55 17.86 6.11C19.42 7.66 20.27 9.73 20.27 11.92C20.28 16.46 16.58 20.15 12.04 20.15Z"/>
          </svg>

          <span className="tracking-wide">Free Demo</span>
          <span className="hidden sm:inline-block text-[11px] font-normal opacity-90 border-l border-white/30 pl-2">Chat on WhatsApp</span>
        </a>
      </aside>

    </div>
  )
}
