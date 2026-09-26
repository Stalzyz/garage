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
  Lock, Share2, ChevronLeft, Quote, Car, Wrench, Truck, Bike, BatteryCharging, Gauge, FileCheck
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function GarageLandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeModuleCategory, setActiveModuleCategory] = useState<"ALL" | "OPS" | "CRM" | "FINANCE" | "HR">("ALL")
  
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

  // ── 6 DETAILED INDUSTRY CASE STUDIES STATE ──
  const [activeCaseStudy, setActiveCaseStudy] = useState(0)

  const caseStudies = [
    {
      id: "multi-brand-car",
      title: "Multi-Brand Car Workshops",
      shortTitle: "Car Workshops",
      icon: Car,
      tagline: "4 to 15-Bay Independent Service & Body Repair Centers",
      stats: {
        retention: "+38%",
        retentionLabel: "Repeat Service Retention",
        recovery: "₹1,45,000",
        recoveryLabel: "Monthly Leakage Recovered",
        timeSaved: "2.5 Hrs",
        timeSavedLabel: "Daily Admin Saved per Bay"
      },
      story: {
        garageName: "Apex Auto Care (8 Service Bays, Pune)",
        challenge: "Suffered from manual paper job cards where mechanics frequently forgot to bill small spare parts, engine oil liters, and minor electrical labor. Customer follow-ups were chaotic over phone calls, leading to low repeat retention.",
        solution: "Implemented Garage CRM with digital job card creation on tablets. Mechanics scan parts barcodes at the bay. The customer receives an automated WhatsApp repair estimate with 1-click digital approval before work starts.",
        impact: "Zero unbilled spare parts leakage. Automated service-due reminders brought back 38% more periodic maintenance customers within 6 months.",
        keyModules: ["Digital Job Cards with Photos", "WhatsApp Estimate Approvals", "Barcode Parts Inventory", "Automated Service Due Reminders"]
      }
    },
    {
      id: "tw-superbike",
      title: "Two-Wheeler & Superbike Studios",
      shortTitle: "Bikes & Superbikes",
      icon: Bike,
      tagline: "High-Volume Express Service & Superbike Performance Tuning",
      stats: {
        retention: "2.8x",
        retentionLabel: "Faster Vehicle Intake",
        recovery: "+42%",
        recoveryLabel: "Engine Oil & Lube Sales",
        timeSaved: "100%",
        timeSavedLabel: "Mechanic Commission Clarity"
      },
      story: {
        garageName: "SpeedCraft Moto Hub (6 Lifts, Bengaluru)",
        challenge: "Handling 35+ bikes daily created huge front-desk queues during morning peak hours. Customers constantly called asking 'Is my bike ready?'. Tracking technician labor incentives manually took hours every weekend.",
        solution: "Deployed Garage CRM's 30-second license plate lookup and express job card intake. When the job is marked complete, customers automatically get a WhatsApp ready alert with UPI payment link. Mechanic incentives are calculated per completed job card.",
        impact: "Intake time dropped from 8 minutes to 90 seconds. Mechanics work 20% faster knowing their live daily commissions on the workshop TV kiosk.",
        keyModules: ["Express Vehicle Intake", "Automated 'Job Ready' WhatsApp", "Mechanic Incentive Engine", "Periodic Lube Renewal Tracking"]
      }
    },
    {
      id: "detailing-ppf",
      title: "Auto Detailing & Ceramic Studios",
      shortTitle: "Detailing & PPF",
      icon: Sparkles,
      tagline: "High-Ticket Paint Protection Film (PPF), Ceramic Coating & Car Spas",
      stats: {
        retention: "4.9 ★",
        retentionLabel: "Google Review Rating",
        recovery: "100%",
        recoveryLabel: "Dispute Elimination",
        timeSaved: "92%",
        timeSavedLabel: "Annual Warranty Compliance"
      },
      story: {
        garageName: "Obsidian Detailing Studio (Delhi NCR)",
        challenge: "With ticket sizes averaging ₹45,000 to ₹1,20,000 for full PPF and 5-year ceramic packages, customers demanded proof of surface prep. Existing scratches were sometimes blamed on the studio. Tracking 1-year warranty inspections was done on paper.",
        solution: "Used Garage CRM's 360° vehicle intake visual damage tagging with timestamped photos. Automated milestone updates sent to car owners as stages complete (Wash → Paint Correction → Ceramic Layer 1 → Cure). Generates digital warranty certificates.",
        impact: "100% elimination of damage disputes. Automated annual ceramic maintenance inspection reminders boosted customer lifetime value by ₹28,000 per vehicle.",
        keyModules: ["360° Photo Damage Tagging", "Stage-by-Stage Customer Gallery", "Digital PDF Warranty Cards", "Annual Inspection Follow-ups"]
      }
    },
    {
      id: "commercial-fleet",
      title: "Commercial Fleet Maintenance Hubs",
      shortTitle: "Fleet Maintenance",
      icon: Truck,
      tagline: "Logistics Delivery Vans, Cab Aggregators & Rental Fleets",
      stats: {
        retention: "-24%",
        retentionLabel: "Unplanned Breakdown Time",
        recovery: "100%",
        recoveryLabel: "GST Corporate Compliance",
        timeSaved: "15 Days",
        timeSavedLabel: "Faster Monthly Billing Cycle"
      },
      story: {
        garageName: "Metro Logistics Central Workshop (40+ Fleet Vans)",
        challenge: "Corporate clients demanded consolidated monthly GST billing and detailed maintenance expense breakdowns per van registration. Emergency roadside breakdowns were frequent due to missed preventive maintenance.",
        solution: "Setup Garage CRM's Corporate Fleet portal. System automatically flags vehicles due for brake checks, tire rotations, and oil service based on odometer readings. Generates 1-click consolidated monthly corporate invoices with complete job logs.",
        impact: "Fleet breakdown downtime decreased by 24%. Monthly corporate invoice approvals went from 3 weeks to 2 days with transparent digital job history.",
        keyModules: ["Fleet Account Management", "Odometer-Based Preventive Alerts", "Consolidated Monthly GST Billing", "Cost-per-KM Analytics"]
      }
    },
    {
      id: "heavy-diesel",
      title: "Heavy Equipment & Diesel Truck Workshops",
      shortTitle: "Trucks & Heavy Equipment",
      icon: Wrench,
      tagline: "Commercial Trucks, Buses, Hydraulics & Earthmovers",
      stats: {
        retention: "35%",
        retentionLabel: "Faster Engine Overhauls",
        recovery: "Zero",
        recoveryLabel: "Vendor Subcontract Leakage",
        timeSaved: "₹3.2L",
        timeSavedLabel: "Active Credit Ledger Controlled"
      },
      story: {
        garageName: "Titan Heavy Diesel Repairs (Multi-Axle Truck Bays, Chennai)",
        challenge: "Engine rebuilds and hydraulic overhauls take 5-10 days and involve outsourced lathe work and injector calibration. Tracking vendor bills, core returns, and customer credit ledgers on physical books caused severe cash flow delays.",
        solution: "Utilized Garage CRM's Multi-Stage Job Order & Sub-Contracting module. Work outsourced to machine shops is matched to customer job cards. Partial milestone payments and customer credit limits are enforced at invoicing.",
        impact: "Outsourced labor margins increased by 18% with zero unbilled machining costs. Outstanding payment recovery accelerated by 22 days.",
        keyModules: ["Multi-Stage Overhaul Tracking", "Outsourced Vendor Work Orders", "Credit Limit & Ledger Control", "Core Return Tracking"]
      }
    },
    {
      id: "ev-battery",
      title: "EV & Battery Care Centers",
      shortTitle: "EV & Battery Care",
      icon: BatteryCharging,
      tagline: "Electric 2W/4W Service, Diagnostics & Battery Pack Labs",
      stats: {
        retention: "100%",
        retentionLabel: "Battery Serial Traceability",
        recovery: "0",
        recoveryLabel: "Rejected OEM Warranty Claims",
        timeSaved: "3x",
        timeSavedLabel: "Faster Diagnostic Intake"
      },
      story: {
        garageName: "Voltron EV Solutions (Electric 2W/3W Hub, Hyderabad)",
        challenge: "Diagnosing battery cell degradation, motor controllers, and validating manufacturer warranty claims required strict serial number tracking and State-of-Health (SoH) logging that regular generic garage software lacked.",
        solution: "Adopted Garage CRM with custom EV fields. Technicians log battery pack serials, cell voltage reports, and controller firmware versions directly into the job card. Automated OEM warranty claim export with full diagnostic history.",
        impact: "100% trace on battery warranties with zero rejected claims. EV customers receive a digital Battery Health Report Card on WhatsApp after each service.",
        keyModules: ["Battery Serial & SoH Diagnostics", "OEM Warranty Claim Exporter", "High-Voltage Safety Checklist", "Digital Health Report Card"]
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
          recipientName: demoName || "Garage Partner",
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
    { sender: "bot", text: "🚗 Apex Motors: Hi Vikram! Your Honda City (MH 12 AB 4589) is ready after Full Synthetic Oil Service & Brake Inspection.", time: "10:30 AM" },
    { sender: "bot", text: "🧾 Click to view & pay your GST invoice: https://garage.grekam.in/verify/inv/8841", time: "10:31 AM" }
  ])
  const [simulatingWhatsApp, setSimulatingWhatsApp] = useState(false)

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

  const coreModules = [
    {
      category: "OPS",
      title: "Digital Job Cards & Bay Operations",
      icon: Layers,
      badge: "Core Operations",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
      description: "Create digital job cards in under 60 seconds with vehicle license plate search, photo damage tagging, and live bay assignment.",
      bullets: ["360° Vehicle photo inspection", "Technician assignment & time logs", "Real-time service progress stages", "Parts requisition from store"]
    },
    {
      category: "CRM",
      title: "Lead Management & Sales Pipeline",
      icon: Users,
      badge: "Growth & Sales",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
      description: "Capture enquiries from Google, WhatsApp, and walk-ins. Convert leads into high-margin service packages with automated follow-ups.",
      bullets: ["Visual Kanban sales pipeline", "1-Click WhatsApp estimate approvals", "Service renewal follow-up scheduler", "Lost enquiry re-engagement"]
    },
    {
      category: "FINANCE",
      title: "GST Invoicing & Digital Billing",
      icon: DollarSign,
      badge: "Finance & Cash Flow",
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
      description: "Generate compliant GST invoices with automated HSN/SAC codes, instant UPI QR payment links, and vendor purchase ledgers.",
      bullets: ["1-Click GST tax invoice generation", "UPI QR code on invoices", "Technician labor rate cards", "Spare parts margin analysis"]
    },
    {
      category: "OPS",
      title: "Live Spare Parts & Stock Inventory",
      icon: Package,
      badge: "Stock Control",
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
      description: "Eliminate parts theft and stockouts. Track fast-moving engine oils, brake pads, and fluids with low-stock alerts and barcode scan.",
      bullets: ["Low stock WhatsApp alerts", "Barcode / QR code scanning", "Multi-vendor purchase orders", "Dead stock & margin reporting"]
    },
    {
      category: "CRM",
      title: "WhatsApp Automated Communication",
      icon: MessageSquare,
      badge: "Customer Retention",
      color: "from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30",
      description: "Keep car owners informed without making phone calls. Send automated service updates, digital receipts, and Google review requests.",
      bullets: ["Automated 'Job Ready' alerts", "Digital estimate approval buttons", "Automated service-due reminders", "5-Star Google Review booster"]
    },
    {
      category: "HR",
      title: "Mechanic Productivity & Staff HR",
      icon: UserCheck,
      badge: "Team Management",
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
      description: "Manage technician shifts, workshop kiosk clock-in, and automated labor commission payouts based on completed job cards.",
      bullets: ["Workshop Tablet Kiosk Clock-in", "Per-job technician commissions", "Leave requests & attendance logs", "Technician efficiency scoring"]
    }
  ]

  const filteredModules = activeModuleCategory === "ALL"
    ? coreModules
    : coreModules.filter(m => m.category === activeModuleCategory)

  const faqs = [
    {
      q: "What is Garage CRM and how is it different from basic billing software?",
      a: "Garage CRM is a complete operational and revenue growth platform built specifically for auto repair workshops. Unlike simple billing software, Garage CRM manages the entire customer lifecycle: lead capture, vehicle intake with photo damage inspection, live bay tracking, spare parts inventory, WhatsApp estimate approvals, mechanic commissions, and automated service reminders that bring customers back."
    },
    {
      q: "How does the Live Demo access work?",
      a: "You can click the 'View Demo' button, enter your work email, and you will instantly receive access credentials (demo@garage.in / Demo2023) to explore the live, fully-functional workshop dashboard."
    },
    {
      q: "Can my mechanics use this on tablets or phones inside the workshop bays?",
      a: "Yes! Garage CRM is 100% responsive and mobile-optimized. Service advisors and mechanics can create job cards, upload damage photos, and scan parts barcodes directly from any Android phone, iPhone, iPad, or tablet."
    },
    {
      q: "How do WhatsApp notifications and estimate approvals work?",
      a: "Garage CRM connects with WhatsApp Cloud API to deliver instant job cards, photos of worn parts, estimates, and payment links. Customers can click a single button on WhatsApp to approve additional repair work instantly."
    },
    {
      q: "Can I migrate my existing customer list and spare parts inventory from Excel?",
      a: "Absolutely. Our onboarding team provides 1-click bulk CSV/Excel import tools to bring in your entire customer list, vehicle history, and spare parts catalog seamlessly."
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
              <span className="text-[10px] text-zinc-400 font-normal tracking-wide">Operations & Sales Growth</span>
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
                      <Car className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">6 Industry Case Studies</div>
                        <div className="text-[11px] text-zinc-400">See how garages grow sales</div>
                      </div>
                    </a>
                    <a href="#features" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">Job Cards & Workflow</div>
                        <div className="text-[11px] text-zinc-400">Live bay tracking & parts</div>
                      </div>
                    </a>
                    <a href="#features" className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">WhatsApp Automations</div>
                        <div className="text-[11px] text-zinc-400">Instant job updates & approvals</div>
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
            <span>Built for Modern Workshops & Auto Service Centers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
            Get more customer leads. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Grow your garage sales faster.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Garage CRM is the all-in-one workspace that brings your customer bookings, job cards, service tracking, team, billing, and automated WhatsApp follow-ups into one simple dashboard.
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
              <span>30-Sec Digital Job Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>1-Click WhatsApp Estimate Approvals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Unbilled Parts Leakage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant GST Invoices & Payment Links</span>
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
              <Car className="w-3.5 h-3.5" />
              <span>Who is Garage CRM for?</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Tailored for Every Segment of the Auto Repair Industry
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
              Explore how 6 distinct workshop categories use Garage CRM to eliminate revenue leakage, streamline technician workflow, and drive 5-star customer retention.
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
                    Industry Segment #{activeCaseStudy + 1}
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
                    <Wrench className="w-4 h-4" />
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
              Everything Needed to Run & Scale Your Workshop
            </h2>
            <p className="text-sm text-zinc-400 mt-3">
              One connected database for vehicles, job cards, mechanics, inventory, and customer retention.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: "ALL", label: "All Modules" },
                { id: "OPS", label: "Bay Operations & Jobs" },
                { id: "CRM", label: "CRM & WhatsApp" },
                { id: "FINANCE", label: "GST Billing & Finance" },
                { id: "HR", label: "Mechanics & Team" },
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
                <span>Zero Customer Phone Calls</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Keep Car Owners Informed with Automated WhatsApp Updates
              </h2>

              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                90% of customer phone calls are just asking <em>"Is my vehicle ready?"</em>. Garage CRM automatically triggers WhatsApp alerts for intake, estimate approvals, live stage completion, and digital payment links.
              </p>

              {/* Action Buttons to test simulator */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSimulateWhatsAppAction("SERVICE_UPDATE")}
                  disabled={simulatingWhatsApp}
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-semibold text-white transition-colors"
                >
                  <span>1. Simulate "Service Stage Completed" Alert</span>
                  <Send className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => handleSimulateWhatsAppAction("PAYMENT_LINK")}
                  disabled={simulatingWhatsApp}
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-semibold text-white transition-colors"
                >
                  <span>2. Simulate "GST Invoice & UPI Payment Link"</span>
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </button>

                <button
                  onClick={() => handleSimulateWhatsAppAction("REMINDER")}
                  disabled={simulatingWhatsApp}
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-semibold text-white transition-colors"
                >
                  <span>3. Simulate "6-Month Periodic Service Due" Reminder</span>
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
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                      AP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Apex Motors Official</div>
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
                Garage CRM is part of Grekam's high-performance enterprise SaaS suite, built for reliability, data security, and scalable multi-branch performance.
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
            Ready to upgrade your workshop operations?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Test the live garage dashboard in seconds. View job cards, inventory alerts, automated invoicing, and technician commissions in action.
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
                    Enter your work email to receive live garage demo credentials instantly and access the full suite of Job Cards, WhatsApp alerts, and Billing.
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
