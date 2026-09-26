"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Building2, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Star, Sparkles, 
  LayoutDashboard, Layers, Users, Briefcase, DollarSign, Users2, UserCheck, CheckSquare, 
  Trophy, Radio, Globe, BarChart2, LifeBuoy, Workflow, MessageSquare, HardDrive, Bell, 
  BookOpen, Settings, Phone, Calendar, Mail, Clock, FileText, Package, RefreshCw, X, AlertCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function GarageLandingPage() {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  
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

  const modules = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
      description: "Your garage operations at a glance. Real-time jobs, enquiries, revenue, and pending tasks."
    },
    {
      title: "CRM & Sales Pipeline",
      icon: Layers,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
      description: "Convert enquiries into repeat customers. Track leads from first inquiry to closed proposal."
    },
    {
      title: "Contacts & Vehicle Vault",
      icon: Users,
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
      description: "Centralized customer database with vehicle specs, service history, and communication logs."
    },
    {
      title: "Digital Proposals",
      icon: FileText,
      color: "from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30",
      description: "Create professional digital quotes & estimate links for instant client approval."
    },
    {
      title: "Power Dialer & Call Intel",
      icon: Phone,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
      description: "1-click calling workflow with structured call notes and customer activity tracking."
    },
    {
      title: "Products & Parts Stock",
      icon: Package,
      color: "from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30",
      description: "Manage spare parts catalogue, oils, fluids, stock levels, and standardized pricing."
    },
    {
      title: "Maintenance Subscriptions",
      icon: RefreshCw,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
      description: "Offer monthly service packages, vehicle maintenance plans, and recurring memberships."
    },
    {
      title: "Kanban Projects & Jobs",
      icon: Briefcase,
      color: "from-fuchsia-500/20 to-purple-500/20 text-fuchsia-400 border-fuchsia-500/30",
      description: "Track complex garage repair jobs step-by-step with team assignments and task deadlines."
    },
    {
      title: "Finance & GST Invoicing",
      icon: DollarSign,
      color: "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30",
      description: "Income, expenses, P&L reports, GST billing, and payment tracking in one place."
    },
    {
      title: "HR, Attendance & Payroll",
      icon: Users2,
      color: "from-sky-500/20 to-indigo-500/20 text-sky-400 border-sky-500/30",
      description: "Staff directory, time tracker, digital leave requests, payslips, and performance incentives."
    },
    {
      title: "ATS Mechanics Hiring",
      icon: UserCheck,
      color: "from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30",
      description: "Applicant tracking pipeline to recruit, interview, and onboard technicians and staff."
    },
    {
      title: "Content Marketing Calendar",
      icon: Radio,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
      description: "Plan, schedule, and execute marketing campaigns, social posts, and customer promotions."
    }
  ]

  const faqs = [
    {
      q: "What is Garage?",
      a: "Garage is an all-in-one business management platform designed to help garage businesses manage customer inquiries, sales, service jobs, finance, and staff from one connected workspace."
    },
    {
      q: "Is Garage only a CRM?",
      a: "No. Garage combines CRM, sales pipelines, job cards, inventory, GST billing, HR attendance, payroll, and business analytics into one platform."
    },
    {
      q: "Can my employees use Garage with custom permissions?",
      a: "Yes. Every technician, manager, or front-desk staff member receives a dedicated login with role-based access control, so they only see what they need."
    },
    {
      q: "How does GST Invoicing and Finance work?",
      a: "Garage automatically generates GST-compliant invoices, tracks incoming client payments, logs vendor expenses, and presents live profit & loss reports."
    },
    {
      q: "Is Whitelabeling available for agencies and partners?",
      a: "Yes! Whitelabel partners can run Garage under their own custom domain and custom brand logo for their client garages."
    }
  ]

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-[800px] left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-[#07090e]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">GARAGE</span>
              <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase">Enterprise SaaS</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-300">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#modules" className="hover:text-white transition-colors">Modules</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing Tiers</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
            >
              Request Demo
            </button>
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="pt-20 pb-16 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Complete Garage Operations + CRM + Finance + HR Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Run Your Garage. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Manage Your Team. Grow Your Business.
            </span>
          </h1>

          <p className="text-base md:text-lg text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Instead of managing your garage through notebooks, spreadsheets, separate apps and scattered WhatsApp conversations, Garage gives your team one connected workspace.
          </p>

          {/* Interactive Customer Journey Banner */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-semibold">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center gap-1.5">
              <span>🟢 Get Leads</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-center gap-1.5">
              <span>🔵 Convert Sales</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center gap-1.5">
              <span>🟣 Service Jobs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center gap-1.5">
              <span>🟠 Manage Team</span>
            </div>
            <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 flex items-center justify-center gap-1.5">
              <span>🟡 Track Money</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center gap-1.5">
              <span>🚀 Scale Garage</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              Get Started — Request Demo
            </button>
            <a
              href="#modules"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition-all text-center"
            >
              Explore All Modules
            </a>
          </div>
        </div>
      </section>

      {/* Modules Grid Section */}
      <section id="modules" className="py-20 px-6 bg-black/40 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Complete Garage Platform Modules</h2>
            <p className="text-xs md:text-sm text-zinc-400">
              From the first customer enquiry to the final payment — everything stays connected in one unified operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((m, i) => {
              const Icon = m.icon
              return (
                <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} border flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{m.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{m.description}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-blue-400">
                    <span>Explore Module</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How Everything Connects Section */}
      <section id="workflow" className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Connected Architecture
            </span>
            <h2 className="text-3xl font-bold tracking-tight">How Everything Connects</h2>
            <p className="text-xs md:text-sm text-zinc-400">
              The real power of Garage is how customer enquiries, job cards, inventory, GST billing, and team tasks work seamlessly together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Workflow List */}
            <div className="space-y-4">
              {[
                { step: "01", title: "Lead Enquiry", desc: "Customer enquiry enters Lead Pipeline via phone, web, or social." },
                { step: "02", title: "Call & Proposal", desc: "Power Dialer connects staff, sends digital quote with spare parts pricing." },
                { step: "03", title: "Job Approval & Service", desc: "Customer approves quote; repair job assigned to technician Kanban board." },
                { step: "04", title: "GST Invoice & Payment", desc: "Invoice generated with spare parts stock update & online payment link." },
                { step: "05", title: "Retention & Repeat Business", desc: "Automated service reminders & maintenance subscription renewals." }
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
                  <span className="text-sm font-black font-mono text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Before vs After Comparison Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-950/40 via-purple-950/20 to-zinc-900 border border-white/15 space-y-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">From Chaos to Connected Control</h3>
              
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1 text-red-200">
                  <span className="font-bold text-red-400 block text-sm">❌ Without Garage:</span>
                  <p>Notebooks, personal WhatsApp chats, lost invoices, missed follow-ups, and zero visibility into daily team attendance or profit margins.</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-emerald-200">
                  <span className="font-bold text-emerald-400 block text-sm">✅ With Garage:</span>
                  <p>Leads, customer history, job cards, spare parts inventory, GST billing, employee attendance, and real-time dashboard analytics in one connected app.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-black/40 border-t border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Flexible SaaS Subscription Plans</h2>
            <p className="text-xs md:text-sm text-zinc-400">
              Transparent pricing with no hidden charges. Standard packages include GST options and dedicated support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-400 block">Starter Tier</span>
                <h3 className="text-2xl font-bold text-white">Basic Garage</h3>
                <div className="space-y-1">
                  <span className="text-3xl font-black text-white">₹14,999</span>
                  <span className="text-xs font-bold text-amber-400 ml-1">/ yr + GST</span>
                  <p className="text-xs text-zinc-400">₹1,499 / month + GST</p>
                </div>
                <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 500 Active Customers</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 3 Staff User Accounts</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> CRM & Sales Pipeline</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Basic Finance & GST Invoicing</div>
                </div>
              </div>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all"
              >
                Inquire Basic Plan
              </button>
            </div>

            {/* Growth Plan (Featured) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-blue-900/40 to-indigo-950/40 border border-blue-500/50 flex flex-col justify-between space-y-6 relative shadow-2xl scale-105">
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg">
                Most Popular
              </span>
              <div className="space-y-4">
                <span className="text-xs font-mono font-semibold uppercase text-blue-300 block">Growth Tier</span>
                <h3 className="text-2xl font-bold text-white">Growth Garage</h3>
                <div className="space-y-1">
                  <span className="text-3xl font-black text-blue-400">₹29,999</span>
                  <span className="text-xs font-bold text-amber-400 ml-1">/ yr + GST</span>
                  <p className="text-xs text-zinc-400">₹2,999 / month + GST</p>
                </div>
                <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-zinc-200">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 2,500 Active Customers</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 10 Staff & Mechanics Accounts</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> WhatsApp Automation & Alerts</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Full HR, Attendance & Payroll</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Kanban Job Cards & Assets</div>
                </div>
              </div>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
              >
                Inquire Growth Plan
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono font-semibold uppercase text-purple-400 block">Enterprise Tier</span>
                <h3 className="text-2xl font-bold text-white">Enterprise Garage</h3>
                <div className="space-y-1">
                  <span className="text-3xl font-black text-white">₹49,999</span>
                  <span className="text-xs font-bold text-amber-400 ml-1">/ yr + GST</span>
                  <p className="text-xs text-zinc-400">₹4,999 / month + GST</p>
                </div>
                <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited Customers & Vehicles</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 25 Staff Accounts & Multi-Garage</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> White Label & Custom Domain</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Full Suite + Marketing Calendar</div>
                </div>
              </div>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all"
              >
                Inquire Enterprise Plan
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs md:text-sm text-zinc-400">
              Everything you need to know about Garage SaaS implementation and features.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-blue-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeFaq === index ? "rotate-90 text-blue-400" : "text-zinc-500"}`} />
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60 py-12 px-6 text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="font-bold text-white text-sm">GARAGE Enterprise SaaS</span>
          </div>
          <p>© {new Date().getFullYear()} Garage OS. All rights reserved. Run Smarter. Serve Better. Grow Faster.</p>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="hover:text-white transition-colors">Staff Login</Link>
            <button onClick={() => setIsInquiryModalOpen(true)} className="hover:text-white transition-colors">Contact Sales</button>
          </div>
        </div>
      </footer>

      {/* INQUIRY / DEMO REQUEST MODAL */}
      <AnimatePresence>
        {isInquiryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0f19] border border-white/15 rounded-3xl p-6 md:p-8 w-full max-w-lg space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsInquiryModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white p-2 rounded-xl bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-xl font-bold text-white">Request Garage Demo & Inquiry</h3>
                <p className="text-xs text-zinc-400 mt-1">Fill in your details to speak with a Garage operations specialist.</p>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Stalin Kumar"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold">Garage / Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Apex Auto Motors"
                      value={form.garageName}
                      onChange={(e) => setForm({ ...form, garageName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold">Email Address</label>
                    <input
                      type="email"
                      placeholder="stalin@garage.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">City / Location</label>
                  <input
                    type="text"
                    placeholder="Coimbatore, Tamil Nadu"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Requirements / Message</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your garage size, staff count, or specific requirements..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
                >
                  {submitting ? "Submitting Inquiry..." : "Submit Inquiry Request"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
