"use client"

import { useState } from "react"
import { 
  BookOpen, Search, LayoutDashboard, Layers, Briefcase, DollarSign, 
  Users, GraduationCap, UserCheck, Radio, Globe, BarChart2, 
  LifeBuoy, Zap, MessageSquare, HardDrive, Bell, Settings, ExternalLink, ChevronRight, HelpCircle
} from "lucide-react"

// Knowledge Base Data
const KB_SECTIONS = [
  {
    category: "CRM & Sales",
    items: [
      {
        title: "Lead Pipeline",
        icon: Layers,
        desc: "Visual drag-and-drop board for tracking potential clients from initial contact to conversion.",
        howToUse: "Move lead cards horizontally across columns (New, Contacted, Qualified, etc.) as their deal progress moves forward.",
        howItWorks: "Queries the database for active Lead records and groups them by pipeline status. Saves deal stages on update.",
        roles: ["Super Admin", "Manager", "Staff"]
      },
      {
        title: "Contacts",
        icon: Users,
        desc: "Directory of client contacts and historical communication profiles.",
        howToUse: "Search contacts by name/company, click individual records to view detail tabs, or add logs and attachments.",
        howItWorks: "Interacts directly with the Contact table to register customer metadata and history log feeds.",
        roles: ["Super Admin", "Manager", "Staff"]
      },
      {
        title: "Proposals",
        icon: Briefcase,
        desc: "Generate and send digitally-signable Statements of Work (SOWs) and design agreements.",
        howToUse: "Select a client template, define project scope milestones, set the price, and email the direct signing link.",
        howItWorks: "Generates digital PDF documents linked to proposal records. Captures and hashes user sign-consent events.",
        roles: ["Super Admin", "Manager", "Staff"]
      },
      {
        title: "Power Dialer",
        icon: Radio,
        desc: "High-velocity client calling with automated queue parsing and mobile device routing integrations.",
        howToUse: "Activate 'Mobile Dialer Mode' in the header, click Start Power Dialer, and accept the native call trigger prompts on your mobile phone browser.",
        howItWorks: "Emits real-time dial requests via WebSockets to the representative's mobile client using the user's email matching index.",
        roles: ["Super Admin", "Manager", "Staff"]
      }
    ]
  },
  {
    category: "Delivery & Assets",
    items: [
      {
        title: "Kanban Board",
        icon: Briefcase,
        desc: "Task tracking matrix for client project deliverables.",
        howToUse: "Assign team members, set task priorities (High/Medium/Low), and update statuses to keep projects moving.",
        howItWorks: "Tied directly to Project and Task models. Emits websocket update events for active dashboard collaboration.",
        roles: ["Super Admin", "Manager", "Staff", "Client", "Vendor", "Intern"]
      },
      {
        title: "Asset Drive",
        icon: HardDrive,
        desc: "Built-in document storage and file explorer (alternative to Google Drive).",
        howToUse: "Create folder structures, drag-and-drop uploads, and generate shareable links for client deliverables.",
        howItWorks: "Communicates with Cloudflare R2 / S3 object buckets. Generates secure, short-lived pre-signed file URLs.",
        roles: ["Super Admin", "Manager", "Staff"]
      }
    ]
  },
  {
    category: "Finance & Billing",
    items: [
      {
        title: "Revenue & Invoices",
        icon: DollarSign,
        desc: "Professional client invoice builder, billing tracking, and payment link portal.",
        howToUse: "Select clients, insert line items with HSN codes, and define GST tax rates. Send Razorpay billing links to clients.",
        howItWorks: "Calculates SGST/CGST splits or IGST by comparing organization and client state identifiers. Generates PDF formats dynamically.",
        roles: ["Super Admin", "Manager", "Client"]
      },
      {
        title: "Taxes & Ledger",
        icon: BarChart2,
        desc: "GST ledger ledger tracking and tax calculation breakdowns.",
        howToUse: "Review monthly and quarterly GST calculations separated into CGST, SGST, and IGST streams.",
        howItWorks: "Queries invoice items containing active tax percentages to aggregate tax ledgers.",
        roles: ["Super Admin", "Manager"]
      }
    ]
  },
  {
    category: "Academy & LMS",
    items: [
      {
        title: "Admissions",
        icon: GraduationCap,
        desc: "Review and process new academy student registrations.",
        howToUse: "Review course interest forms, log interview notes, and approve students to cohort batches.",
        howItWorks: "Converts Lead nodes into Student models inside database transactions, mapping them to cohorts.",
        roles: ["Super Admin", "Manager", "Staff"]
      },
      {
        title: "LMS Course Room",
        icon: BookOpen,
        desc: "The student virtual learning classroom containing lessons, achievements, and assignments.",
        howToUse: "Browse course curriculums, download materials, watch video lectures, and submit assignments.",
        howItWorks: "Renders dynamically using Next.js route validation. Tracks student progress telemetry on lesson changes.",
        roles: ["Super Admin", "Manager", "Staff", "Student", "Intern"]
      }
    ]
  }
]

export default function KnowledgeBaseDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const categories = ["All", ...KB_SECTIONS.map(s => s.category)]

  const filteredSections = KB_SECTIONS.map(section => {
    if (activeCategory !== "All" && section.category !== activeCategory) {
      return null
    }

    const matchedItems = section.items.filter(item => {
      const matchText = `${item.title} ${item.desc} ${item.howToUse}`.toLowerCase()
      return matchText.includes(searchQuery.toLowerCase())
    })

    if (matchedItems.length === 0) return null

    return {
      ...section,
      items: matchedItems
    }
  }).filter(Boolean) as typeof KB_SECTIONS

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-blue-500" /> Knowledge Base
          </h1>
          <p className="text-sm text-white/50 mt-2">Comprehensive guide to Grekam OS workflows, sidebar tools, and mechanics.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search guides, menus, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Filter Tabs */}
        <div className="w-56 border-r border-white/10 bg-black/20 p-4 space-y-1 hidden md:block">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-3">Categories</div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeCategory === cat 
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.25)]" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Side: Accordion Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          
          <div className="relative z-10 max-w-4xl space-y-8">
            {filteredSections.length === 0 ? (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl p-8 max-w-md mx-auto">
                <HelpCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="font-bold text-lg">No guides found</h3>
                <p className="text-sm text-white/50 mt-1">Try refining your search keyword or selecting a different category.</p>
              </div>
            ) : (
              filteredSections.map(section => (
                <div key={section.category} className="space-y-4">
                  <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest border-b border-white/5 pb-2">
                    {section.category}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {section.items.map(item => {
                      const Icon = item.icon
                      const isExpanded = expandedItem === item.title
                      
                      return (
                        <div 
                          key={item.title} 
                          className={`bg-white/5 border rounded-2xl transition-all duration-300 overflow-hidden ${
                            isExpanded ? "border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)] bg-white/[0.07]" : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          <button
                            onClick={() => setExpandedItem(isExpanded ? null : item.title)}
                            className="w-full text-left p-5 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                isExpanded ? "bg-blue-600/10 border-blue-500/30 text-blue-400" : "bg-white/5 border-white/10 text-white/70"
                              }`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-white/50 mt-1 line-clamp-1">{item.desc}</p>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isExpanded ? "rotate-90 text-blue-400" : ""}`} />
                          </button>

                          {isExpanded && (
                            <div className="px-5 pb-6 pt-1 border-t border-white/5 space-y-4 text-sm bg-black/20 animate-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                                <div className="space-y-1.5">
                                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-400">How to Use</div>
                                  <p className="text-white/80 leading-relaxed text-xs">{item.howToUse}</p>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-400">How it Works (Under the Hood)</div>
                                  <p className="text-white/80 leading-relaxed text-xs">{item.howItWorks}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Access Clearance:</span>
                                {item.roles.map(role => (
                                  <span key={role} className="text-[9px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white/60">
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
