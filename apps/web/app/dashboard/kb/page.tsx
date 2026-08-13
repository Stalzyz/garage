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
    category: "Company Playbooks & SOPs",
    items: [
      {
        title: "MASTER INDEX — Full Document Library",
        icon: LayoutDashboard,
        desc: "The front door to every Grekam OS document. 23 documents organised by tier.",
        howToUse: "Start here. Find the document you need by tier (Culture, Roles, Products, Sales, Delivery, Finance, Marketing).",
        howItWorks: "Maintained in the /docs directory of the monorepo. Updated when any document is added or changed.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/MASTER_INDEX.md"
      },
      {
        title: "Culture Deck",
        icon: Users,
        desc: "Who we are, how we decide, and what we do not tolerate at Grekam.",
        howToUse: "Share with every candidate before their interview. Every employee reads it on Day 1.",
        howItWorks: "Defines the 10 company operating rules and values that govern all decisions at Grekam.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/culture_deck.md"
      },
      {
        title: "BDM Hiring & Interview Playbook",
        icon: UserCheck,
        desc: "Job profile, pre-screening questions, live role-play scenarios, and evaluation scorecard for recruiting a BDM.",
        howToUse: "Send Section 2 pre-screen questions before booking a call. Run Round 1 (Values) and Round 2 (Role-Play) interviews. Score using the Section 5 rubric. Hire if score is 22+/25.",
        howItWorks: "The scoring rubric covers 5 axes: Process Discipline, Discovery, Conflict Resolution, Scope Protection, and Coachability.",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/bdm_hiring_process.md"
      },
      {
        title: "BDM 90-Day Onboarding Playbook",
        icon: Briefcase,
        desc: "The complete 90-day blueprint for a new Business Development & Operations Manager.",
        howToUse: "Hand to new BDM on Day 1. Follow the day-by-day reading and execution plan (Day 1–3: Company, Day 4–7: Grekam OS, Day 8–10: Grafty, etc.)",
        howItWorks: "Month 1: Frontline execution. Month 2: Consistent selling. Month 3: Build the sales department SOPs.",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/bdm_90day_playbook.md"
      },
      {
        title: "Developer 90-Day Playbook",
        icon: Globe,
        desc: "Full onboarding blueprint for developers joining Grekam.",
        howToUse: "Hand to new developer on Day 1. Follow environment setup → codebase orientation → project shadowing → first independent delivery.",
        howItWorks: "Covers coding standards, review gates, handoff discipline, and the Month 3 transition to system builder.",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/developer_90day_playbook.md"
      },
      {
        title: "Designer 90-Day Playbook",
        icon: Layers,
        desc: "Full onboarding blueprint for designers joining Grekam.",
        howToUse: "Hand to new designer on Day 1. Follow brand immersion → project shadowing → first wireframe → design system contribution.",
        howItWorks: "Covers tool standards, brand guidelines, client communication rules, and the developer handoff discipline.",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/designer_90day_playbook.md"
      },
      {
        title: "Support 90-Day Playbook",
        icon: LifeBuoy,
        desc: "Full onboarding blueprint for support roles at Grekam.",
        howToUse: "Hand to new support hire on Day 1. Day 1–14: Product mastery + shadowing. Day 15+: Independent ticket resolution.",
        howItWorks: "Covers product mastery requirements, ticket management, escalation decision-making, and the Month 3 knowledge base build.",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/support_90day_playbook.md"
      },
      {
        title: "Grafty Training Playbook",
        icon: MessageSquare,
        desc: "Product overview, 10-minute demo script, pricing packages, and certification guide for Grafty.",
        howToUse: "Required reading in Days 8–10 of onboarding. Must be able to conduct a 10-minute demo independently before selling.",
        howItWorks: "Covers WhatsApp API concepts, Grafty feature walkthroughs, common objections, and the 6-level certification path.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/grafty_training_playbook.md"
      },
      {
        title: "Atlas Training Playbook",
        icon: GraduationCap,
        desc: "Product overview, customer journey, demo script, and requirements mapping for Atlas Ecommerce.",
        howToUse: "Required reading in Days 11–12 of onboarding. Must map customer requirements (UPI, COD, GST, Shipping) before selling.",
        howItWorks: "Covers the Atlas product scope, what requires customization, demo flow, and pricing packages.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/atlas_training_playbook.md"
      },
      {
        title: "Web Dev Sales Guide",
        icon: Globe,
        desc: "How to classify, scope, and sell web development projects profitably.",
        howToUse: "Use to qualify whether a customer needs a brochure site, lead-gen site, ecommerce, or a custom web app. Never promise features without technical confirmation.",
        howItWorks: "Defines the 8 project types, scoping questions, pricing bands, and handoff requirements for every web project.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/web_dev_sales_guide.md"
      },
      {
        title: "Calling Script",
        icon: Radio,
        desc: "Word-for-word call scripts for 6 scenarios: cold call, warm follow-up, demo booking, proposal follow-up, objection handling, and closing.",
        howToUse: "Use these scripts verbatim until you are confident. Adapt after 4+ weeks of active calling.",
        howItWorks: "Each script has a 30-second opening, discovery questions, value statement, and a next-action close.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/calling_script.md"
      },
      {
        title: "WhatsApp Scripts",
        icon: MessageSquare,
        desc: "Ready-to-use message templates for 10 WhatsApp scenarios (first contact, follow-up, proposal sent, payment reminder, etc.)",
        howToUse: "Copy-paste the template, replace [Name] and [Product] with actual values. Do not send generic messages.",
        howItWorks: "Every script is designed for high open-rate and response rate based on direct-response principles.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/whatsapp_scripts.md"
      },
      {
        title: "Lead Qualification Form",
        icon: UserCheck,
        desc: "Questions, scoring system, and disqualification guide for every inbound lead.",
        howToUse: "Complete this form for every lead in Grekam OS before booking a demo. Disqualify early if score is too low.",
        howItWorks: "Covers business type, problem urgency, budget, decision authority, and timeline. Each question scores 1–3 points.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/lead_qualification_form.md"
      },
      {
        title: "Objection Handbook",
        icon: HelpCircle,
        desc: "20 common objections across all 4 Grekam products with structured response frameworks.",
        howToUse: "Before a demo, review the objections for that product. During a call, find the objection and use the response as a framework.",
        howItWorks: "Each objection has a diagnosis (what the customer actually means), a counter question, and a value bridge.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/objection_handbook.md"
      },
      {
        title: "Proposal Templates",
        icon: Briefcase,
        desc: "Ready-to-personalise proposals for all 4 Grekam products.",
        howToUse: "Copy the relevant template, fill in the client name, scope, price, and payment milestones. Review with BDM before sending.",
        howItWorks: "Each template includes a project scope definition, deliverables list, payment schedule, and Ts & Cs.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/proposal_templates.md"
      },
      {
        title: "Customer Onboarding SOP",
        icon: UserCheck,
        desc: "Step-by-step onboarding process for all 4 Grekam products immediately after payment is confirmed.",
        howToUse: "Trigger this document the moment a payment is confirmed. Complete every checklist item in sequence.",
        howItWorks: "Covers account setup, kickoff call agenda, credentials delivery, training schedule, and first milestone review.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/customer_onboarding_sop.md"
      },
      {
        title: "Sales-to-Dev Handoff SOP",
        icon: Zap,
        desc: "Mandatory handoff form and process every time a project is sold and passed to the development team.",
        howToUse: "Complete this form for every project before any development begins. The developer must never start without a completed handoff.",
        howItWorks: "Captures client info, scope, features, design references, integrations, payment status, and anything promised in the sale.",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/sales_dev_handoff_sop.md"
      },
      {
        title: "Escalation SOP",
        icon: LifeBuoy,
        desc: "Protocols for handling client complaints, refund requests, and crisis situations (L1 to L5 severity).",
        howToUse: "Identify the severity level of the issue. Follow the exact response script and timeline for that level. Log everything in Grekam OS.",
        howItWorks: "L1: Minor complaint (resolve in 24h). L2: Delivery dispute (48h). L3: Refund demand (management involved). L4/L5: Legal/reputational risk (founder escalation).",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/escalation_sop.md"
      },
      {
        title: "KPI Dashboard Guide",
        icon: BarChart2,
        desc: "What to measure, how often, and what management action to take based on results.",
        howToUse: "Review weekly with BDM. Review monthly with the founder. Flag any metric that is 20%+ below target.",
        howItWorks: "Covers Sales KPIs (calls, demos, pipeline value, revenue), Delivery KPIs (project health), and Operational KPIs (CRM hygiene, response times).",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/kpi_dashboard.md"
      },
      {
        title: "Financial Model & Growth Targets",
        icon: DollarSign,
        desc: "Pricing, ARPU, CAC, Gross Margin, and 12-month active customer targets for all 4 Grekam products.",
        howToUse: "Review at the start of each month. Compare active customer counts against the monthly target table. If behind, check lead flow and CAC.",
        howItWorks: "Defines the Cash Engine (Web Dev & Atlas setups) and the Scale Engine (Grafty & SaaS MRR). Includes breakeven points per product.",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/financial_model.md"
      },
      {
        title: "Grafty Landing Page Copy Specs",
        icon: Globe,
        desc: "Direct-response copywriting blueprint for the grafty.pro website. Hero, pain points, features, pricing, and FAQ.",
        howToUse: "Use when rebuilding or updating grafty.pro. Each section has exact copy, layout specs, and CTA positioning.",
        howItWorks: "Structured as a conversion-optimised direct-response page targeting SME business owners in India.",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/grafty_landing_page_copy.md"
      },
      {
        title: "Atlas Landing Page Copy Specs",
        icon: Globe,
        desc: "Direct-response copywriting blueprint for atlas.grekam.in/build-ecommerce. Shopify comparison, local integrations, and pricing CTA.",
        howToUse: "Use when rebuilding or updating the Atlas build-ecommerce page. Each section has exact copy, comparison tables, and CTA positioning.",
        howItWorks: "Structured as a conversion page targeting D2C brands and retail businesses frustrated with Shopify's transaction fees and poor India localisation.",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/atlas_landing_page_copy.md"
      },
      {
        title: "Role Checklists",
        icon: UserCheck,
        desc: "Daily and weekly operating routines for every role at Grekam.",
        howToUse: "Print or pin to desk on Day 1. Use as the daily operating rhythm. Do not skip checklist items.",
        howItWorks: "Covers Sales (CRM updates, calls, follow-ups), Developers (task hygiene, PR standards), Designers (handoff discipline), and Support (ticket management).",
        roles: ["Super Admin", "Manager", "Staff"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/role_checklists.md"
      },
      {
        title: "Evaluation & Certification Tests",
        icon: GraduationCap,
        desc: "4 progressive competency tests to verify Grekam OS mastery for every new hire.",
        howToUse: "Test 1 (Day 7): Setup & navigation. Test 2 (Week 3): Live audit. Test 3 (Month 1): Continuity. Test 4 (Month 1): Role Reversal (teach back).",
        howItWorks: "Scored 1–10 per section. A score below 6 requires a re-test before full role access is granted.",
        roles: ["Super Admin", "Manager"],
        docUrl: "https://github.com/Stalzyz/garage/blob/main/docs/evaluation_tests.md"
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
                              {'docUrl' in item && item.docUrl && (
                                <div className="pt-3 border-t border-white/5">
                                  <a
                                    href={(item as any).docUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide hover:bg-blue-600/25 hover:border-blue-400/50 transition-all duration-200"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Open Full Document
                                  </a>
                                </div>
                              )}
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
