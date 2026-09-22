"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle2, ArrowRight, Calendar, Clock, Award, 
  BookOpen, ShieldCheck, Layers, Palette, Megaphone, 
  Film, Code2, Users, ChevronDown, 
  ChevronUp, MessageCircle, Send, Check, Search, Download, Briefcase, ExternalLink, Phone,
  Star, ChevronLeft, ChevronRight, SlidersHorizontal
} from "lucide-react"
import { toast } from "sonner"

// ─────────────────────────────────────────────
// Curriculum Data (Day 01 to Day 45 + Bonus)
// ─────────────────────────────────────────────

const CURRICULUM_DATA = [
  // MODULE 1: GRAPHIC DESIGN (15 Days)
  {
    module: 1,
    moduleTitle: "Module 1 — Graphic Design",
    moduleSubtitle: "15 Days Intensive Training",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    days: [
      {
        day: 1,
        title: "Design Fundamentals & AI Workflows",
        topics: [
          "What is graphic design?",
          "Elements of design (Line, Shape, Texture, Space)",
          "Principles of design (Balance, Contrast, Harmony)",
          "Composition & visual hierarchy",
          "Professional design workflow & brief analysis",
          "Introduction to AI-assisted design ideation"
        ],
        practical: "Recreate an existing professional commercial poster"
      },
      {
        day: 2,
        title: "Color Theory & Palette Creation",
        topics: [
          "Color wheel & color relationships",
          "Primary, secondary & tertiary colors",
          "Color harmony & psychological triggers",
          "RGB vs CMYK color spaces for print & digital",
          "Creating harmonious brand color palettes"
        ],
        practical: "Create 5 distinct brand color palettes with hex codes"
      },
      {
        day: 3,
        title: "Typography & Layout Architecture",
        topics: [
          "Typography fundamentals & font anatomy",
          "Font classifications (Serif, Sans-serif, Script, Display)",
          "Font pairing techniques & readability rules",
          "Hierarchy, kerning, tracking & leading (line height)",
          "Creating clean, professional grid layouts"
        ],
        practical: "Design an editorial typography poster"
      },
      {
        day: 4,
        title: "Photoshop Fundamentals",
        topics: [
          "Photoshop interface, workspaces & shortcuts",
          "Layer management, groups & layer styles",
          "Selection tools (Lasso, Pen tool, Object selection)",
          "Layer masks & non-destructive editing",
          "Smart objects, custom brushes & adjustment layers"
        ],
        practical: "Create a multi-layered social media creative"
      },
      {
        day: 5,
        title: "Photoshop Advanced Manipulation",
        topics: [
          "Creative photo manipulation & surreal compositing",
          "High-end portrait retouching & frequency separation",
          "Advanced background removal & hair masking",
          "Blending modes, shadow creation & realistic lighting",
          "Color grading & camera raw filter adjustments"
        ],
        practical: "Design a creative photo manipulation artwork"
      },
      {
        day: 6,
        title: "Adobe Illustrator Vector Mastery",
        topics: [
          "Vector graphics vs raster graphics explained",
          "Geometric shapes, anchor points & handle controls",
          "Pen tool precision & curvature tool",
          "Pathfinder panel & shape builder tool",
          "Custom stroke, fills, gradients & icon design"
        ],
        practical: "Illustrate a set of custom vector icons"
      },
      {
        day: 7,
        title: "Logo Design & Vectorization",
        topics: [
          "Types of logos (Wordmark, Lettermark, Brandmark, Emblem)",
          "Logo research & moodboard preparation",
          "Concept sketching & geometric grid alignment",
          "Vectorizing hand sketches in Illustrator",
          "Logo presentation techniques for clients"
        ],
        practical: "Create a complete vector logo from concept sketch"
      },
      {
        day: 8,
        title: "Brand Identity Systems",
        topics: [
          "Building a complete brand identity system",
          "Logo usage guidelines & clear space rules",
          "Color palette definitions & typography system",
          "Creating professional brand guidelines PDF",
          "Applying brand assets to realistic 3D mockups"
        ],
        practical: "Develop a mini brand identity package"
      },
      {
        day: 9,
        title: "Social Media Campaign Design",
        topics: [
          "Instagram post & story dimensions",
          "Multi-slide carousel design workflow",
          "Facebook ad creatives & YouTube thumbnail strategy",
          "Maintaining brand consistency across posts",
          "Design rules for high click-through rates"
        ],
        practical: "Design a 5-piece social media campaign set"
      },
      {
        day: 10,
        title: "Advertising & Conversion Design",
        topics: [
          "Promotional poster & offer creative design",
          "E-commerce ad banners & display banners",
          "Call-To-Action (CTA) placement & visual contrast",
          "Conversion-focused design psychology",
          "Designing for performance advertising"
        ],
        practical: "Design a conversion-focused product advertisement"
      },
      {
        day: 11,
        title: "Print Design & Business Stationery",
        topics: [
          "Visiting card design & standard dimensions",
          "Bi-fold & tri-fold brochure layouts",
          "Flyers, pamphlets & event banners",
          "Product packaging & label design basics",
          "Print resolution (300 DPI), CMYK & bleed margins"
        ],
        practical: "Design complete corporate business stationery"
      },
      {
        day: 12,
        title: "Canva Pro & AI-Powered Design Tools",
        topics: [
          "Canva Pro speed workflows & brand kits",
          "Utilizing premium templates for rapid turnaround",
          "Generative AI image creation & background replacement",
          "AI prompt engineering for visual assets",
          "Automating repetitive design resizing"
        ],
        practical: "Build a complete brand kit and batch design graphics with AI"
      },
      {
        day: 13,
        title: "Real Client Simulation Project",
        topics: [
          "Analyzing a real-world client project brief",
          "Deconstructing requirements & timelines",
          "Executing branding, social graphics & ads",
          "Assembling client pitch deck presentation"
        ],
        practical: "Execute full creative suite for a simulated client brief"
      },
      {
        day: 14,
        title: "Portfolio Development & Positioning",
        topics: [
          "Selecting & curating your best 5 projects",
          "Setting up a Behance portfolio & case studies",
          "Instagram creator portfolio layout strategy",
          "Writing project briefs, rationale & deliverables",
          "Freelance rate cards & pitch deck templates"
        ],
        practical: "Publish your first Behance portfolio case study"
      },
      {
        day: 15,
        title: "Graphic Design Final Capstone",
        topics: [
          "End-to-end full branding campaign execution",
          "Final deliverable audit: Logo, Guidelines, Social, Print",
          "Exporting print-ready & web-optimized assets",
          "Live project presentation & peer feedback review"
        ],
        practical: "Submit & present your complete Brand Identity Campaign"
      }
    ]
  },

  // MODULE 2: DIGITAL MARKETING (15 Days)
  {
    module: 2,
    moduleTitle: "Module 2 — Digital Marketing",
    moduleSubtitle: "15 Days Intensive Training",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    days: [
      {
        day: 16,
        title: "Digital Marketing Ecosystem & Career Paths",
        topics: [
          "What is digital marketing & core channels?",
          "Understanding the digital marketing funnel (AIDA model)",
          "Customer journey mapping (Awareness to Conversion)",
          "B2B vs B2C marketing strategies",
          "Organic vs Paid marketing channels",
          "Digital marketing career roadmaps & freelance models"
        ],
        practical: "Map out a complete customer journey funnel for a business"
      },
      {
        day: 17,
        title: "Market & Competitor Research",
        topics: [
          "Identifying target audience demographics & psychographics",
          "Creating detailed Customer Personas",
          "Competitor social media & ad audit techniques",
          "Keyword intent research & search volume analysis",
          "Content gap analysis for competitive edge"
        ],
        practical: "Create 2 detailed ICP (Ideal Customer Persona) profiles"
      },
      {
        day: 18,
        title: "Social Media Strategy (IG, FB, LinkedIn, YT)",
        topics: [
          "Platform demographics: Instagram vs LinkedIn vs YouTube",
          "Defining content pillars (Educational, Promotional, Viral)",
          "Content posting schedules & frequency rules",
          "Community engagement & comment handling tactics"
        ],
        practical: "Develop a content pillar framework for a brand"
      },
      {
        day: 19,
        title: "Content Strategy & AI Content Creation",
        topics: [
          "Short-form video scriptwriting (Reels/Shorts)",
          "Carousel copywriting & hooks to increase swipe-throughs",
          "AI-assisted content ideation & copy generation (ChatGPT/Claude)",
          "Building a 30-day content calendar spreadsheet"
        ],
        practical: "Create a complete 30-day content calendar"
      },
      {
        day: 20,
        title: "Instagram Marketing & Growth Hacking",
        topics: [
          "Profile optimization & high-converting bio structure",
          "Reels algorithm triggers & audio trend discovery",
          "Hashtag research & topic tagging strategy",
          "Instagram SEO: Keywords in name, bio & captions",
          "Lead generation via DMs & link-in-bio funnels"
        ],
        practical: "Audit and optimize an Instagram profile for lead generation"
      },
      {
        day: 21,
        title: "Facebook Business & Lead Generation",
        topics: [
          "Facebook Business Page setup & optimization",
          "Leveraging Facebook Groups for organic lead capture",
          "Organic engagement tactics & video distribution",
          "Introduction to Meta Business Suite tools"
        ],
        practical: "Set up a Facebook Business Page optimized for conversions"
      },
      {
        day: 22,
        title: "Google & SEO Fundamentals",
        topics: [
          "How Google Search crawlers & indexers work",
          "Keyword types: Short-tail, Long-tail & Commercial Intent",
          "On-page SEO: Title tags, H1s, Meta descriptions, Alt text",
          "Technical SEO basics: Site speed, mobile responsiveness",
          "Off-page SEO: Backlinks & domain authority basics"
        ],
        practical: "Perform on-page SEO optimization for a landing page"
      },
      {
        day: 23,
        title: "Local SEO & Google Business Profile",
        topics: [
          "Google Business Profile (GBP) creation & verification",
          "Local keyword optimization & NAP consistency",
          "Local citation building & directory listings",
          "Review generation strategies & reputation management",
          "Geotagged photos & local posts optimization"
        ],
        practical: "Setup & optimize a local Google Business Profile listing"
      },
      {
        day: 24,
        title: "Landing Page Marketing & Conversions",
        topics: [
          "Anatomy of a high-converting landing page",
          "Hook headlines, sub-headlines & benefit bullet points",
          "Lead intake forms, pop-ups & CTA placements",
          "Direct WhatsApp integration & click-to-chat triggers",
          "Conversion Rate Optimization (CRO) best practices"
        ],
        practical: "Design the wireframe structure of a high-converting landing page"
      },
      {
        day: 25,
        title: "Meta Ads Manager Architecture",
        topics: [
          "Meta Ads Manager interface & business settings",
          "Campaign hierarchy: Campaign → Ad Set → Ad Creative",
          "Campaign objectives: Leads, Sales, Traffic, Awareness",
          "Audience targeting: Detailed interest, Lookalike & Custom audiences",
          "Placements, budgets (CBO vs ABO) & bidding strategies"
        ],
        practical: "Build a campaign structure plan for Meta Ads"
      },
      {
        day: 26,
        title: "Meta Lead Generation Ad Campaign",
        topics: [
          "Setting up Instant Lead Forms in Meta Ads",
          "Writing compelling ad copy & headline variations",
          "Creative ad selection: Single image vs Video vs Carousel",
          "Form question setup & privacy policy integration",
          "Testing audiences & creative splits"
        ],
        practical: "Create a live draft Meta Lead Generation campaign"
      },
      {
        day: 27,
        title: "Google Search Ads Essentials",
        topics: [
          "Google Ads interface & account setup",
          "Search Ads campaign setup & network settings",
          "Keyword match types: Broad, Phrase, Exact match",
          "Writing responsive search ads & ad extensions (sitelinks, callouts)",
          "Budget allocation & Quality Score optimization"
        ],
        practical: "Set up a Google Search Ad campaign draft with match types"
      },
      {
        day: 28,
        title: "Analytics, Metrics & Campaign Reporting",
        topics: [
          "Google Analytics 4 (GA4) basics & metric tracking",
          "Understanding performance metrics: CPC, CPM, CTR, CPL, ROAS",
          "Meta Ads insights & ad fatigue identification",
          "Building client reporting dashboards & performance summaries"
        ],
        practical: "Calculate ROAS, CPL, and CTR from a sample campaign report"
      },
      {
        day: 29,
        title: "Lead Management & Automation Funnels",
        topics: [
          "Connecting ad lead forms to CRM database",
          "Instant WhatsApp lead notification alerts",
          "Basic lead scoring & follow-up automated emails",
          "Customer relationship management (CRM) workflows"
        ],
        practical: "Map out an automated lead follow-up sequence"
      },
      {
        day: 30,
        title: "Digital Marketing Final Capstone",
        topics: [
          "Building a complete end-to-end marketing strategy",
          "Deliverable compilation: Personas, Content Calendar, SEO & Ads",
          "Final performance forecast & budget allocation report",
          "Campaign presentation to mentors"
        ],
        practical: "Submit & present your 30-Day Digital Marketing Strategy"
      }
    ]
  },

  // MODULE 3: MOTION GRAPHICS (15 Days)
  {
    module: 3,
    moduleTitle: "Module 3 — Motion Graphics",
    moduleSubtitle: "15 Days Intensive Training",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    days: [
      {
        day: 31,
        title: "Motion Design Fundamentals & Storyboarding",
        topics: [
          "What is motion graphics & industry applications?",
          "12 Principles of Animation adapted for motion design",
          "Timing, spacing & keyframe interpolation",
          "Storyboarding motion sequences & visual references",
          "Preparing graphic assets for animation"
        ],
        practical: "Create a 4-frame motion storyboard"
      },
      {
        day: 32,
        title: "After Effects Core Interface & Keyframes",
        topics: [
          "After Effects interface, composition settings & frame rates",
          "Layer types: Vector, Solid, Text, Null, Adjustment layer",
          "Transform properties: Position, Scale, Rotation, Opacity, Anchor point",
          "Setting basic keyframes & timeline navigation",
          "Pre-composing layers & project organization"
        ],
        practical: "Animate a multi-layer composite using basic transform keyframes"
      },
      {
        day: 33,
        title: "Animation Principles & Graph Editor",
        topics: [
          "Easy Ease (F9) & keyframe velocity controls",
          "Mastering the Speed Graph & Value Graph",
          "Anticipation, overshoot & follow-through techniques",
          "Creating fluid, organic motion curves",
          "Motion blur activation & rendering settings"
        ],
        practical: "Animate a realistic bouncing ball with squanch and stretch"
      },
      {
        day: 34,
        title: "Kinetic Typography & Text Animation",
        topics: [
          "Text layers, animators & selectors (Range, Wiggly)",
          "Tracking, opacity, scale & position text reveals",
          "Kinetic typography timing to voiceover/music beats",
          "Creating animated lower thirds & title cards"
        ],
        practical: "Create a 10-second kinetic typography video quote"
      },
      {
        day: 35,
        title: "Shape Layer Animation & Vector FX",
        topics: [
          "Shape layer path animation & Trim Paths",
          "Repeater & Wiggle Transform operators",
          "Morphing vector shapes seamlessly",
          "Animating custom UI icons & badge reveals"
        ],
        practical: "Animate a set of 4 interactive UI vector icons"
      },
      {
        day: 36,
        title: "Logo Animation & Brand Motion Intros",
        topics: [
          "Preparing Illustrator logo files for After Effects",
          "Layering logo elements & path reveals",
          "Combining shape accents, glows & optical flares",
          "Creating professional 5-second brand intros & outros"
        ],
        practical: "Animate a professional brand logo reveal"
      },
      {
        day: 37,
        title: "Social Media Motion Creatives",
        topics: [
          "Designing high-energy Instagram Reel motion graphics",
          "Animated story ads & promotional banners",
          "E-commerce product pop-ups & price tag animations",
          "Exporting vertical (9:16) & square (1:1) video formats"
        ],
        practical: "Create a 15-second animated social media promo"
      },
      {
        day: 38,
        title: "Video Editing Essentials (Premiere Pro)",
        topics: [
          "Premiere Pro workspace & project organization",
          "Cutting, trimming & multi-track timeline editing",
          "Transitions, L-cuts & J-cuts for smooth pacing",
          "Essential Sound panel: Audio cleaning & ducking",
          "Basic color correction with Lumetri Color"
        ],
        practical: "Edit a 30-second promo video with audio sync"
      },
      {
        day: 39,
        title: "Motion Tracking & Camera Tracking",
        topics: [
          "Point motion tracking in After Effects",
          "3D Camera Tracker & null object attachment",
          "Attaching text, graphics & logos to live footage",
          "Planar tracking concepts"
        ],
        practical: "Track a 3D graphic onto live camera footage"
      },
      {
        day: 40,
        title: "Masking, Track Mattes & Rotoscoping",
        topics: [
          "Advanced mask paths & feathering",
          "Alpha mattes & Luma mattes explained",
          "Roto Brush 2.0 for subject isolation",
          "Chroma Key (Green screen removal with Keylight)"
        ],
        practical: "Isolate a moving subject and place animated graphics behind it"
      },
      {
        day: 41,
        title: "Visual Effects (VFX) & Compositing",
        topics: [
          "Glows, light leaks & particle systems (CC Particle World)",
          "Distortion, chromatic aberration & glitch effects",
          "Screen replacement on smartphones & laptops",
          "Blending video layers with realistic compositing"
        ],
        practical: "Perform a device screen replacement with visual effects"
      },
      {
        day: 42,
        title: "3D Motion Design in After Effects",
        topics: [
          "3D layers, axis controls & 3D space",
          "Creating & animating 3D Cameras (One-node vs Two-node)",
          "Point, Spot & Ambient lighting setups",
          "Depth of field & camera blur effects"
        ],
        practical: "Build a 3D camera fly-through title sequence"
      },
      {
        day: 43,
        title: "AI Integration with Motion Graphics",
        topics: [
          "Generating AI backgrounds & texture assets (Midjourney/DALL-E)",
          "AI voiceover generation & lip sync tools",
          "AI script & animatic storyboarding",
          "Combining AI assets with After Effects animations"
        ],
        practical: "Create a motion video combining AI visual assets & AE animation"
      },
      {
        day: 44,
        title: "Commercial Product Motion Project",
        topics: [
          "Executing a 15-30 second commercial product ad",
          "Pipeline: Concept → Storyboard → Asset Prep → Animation → Audio → Final Render",
          "Applying commercial color grading & sound design"
        ],
        practical: "Create a complete 15-30 second commercial product ad"
      },
      {
        day: 45,
        title: "Showreel Assembly & Career Roadmap",
        topics: [
          "Editing your 45-second Motion Graphics Showreel",
          "Optimizing export settings (H.264, ProRes, GIF)",
          "Building your Video Portfolio (Vimeo, YouTube, Behance)",
          "Freelance pricing rate cards & client outreach strategy",
          "Resume preparation & job interview preparation"
        ],
        practical: "Export & publish your official 45-Second Motion Showreel"
      }
    ]
  },

  // BONUS MODULE: AI VIBE CODING
  {
    module: 4,
    moduleTitle: "🎁 BONUS MODULE — AI Vibe Coding (Full-Stack Intro)",
    moduleSubtitle: "Included FREE with 3-in-1 Program",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    days: [
      {
        day: "Bonus 1",
        title: "Frontend Fundamentals & AI Prompting",
        topics: [
          "HTML5 Semantic structure & modern CSS3 styling",
          "JavaScript ES6 essentials (Variables, Functions, DOM)",
          "React & Next.js component fundamentals",
          "Prompt engineering for AI coding assistants (v0, Claude, Cursor)",
          "Generating UI components instantly with AI prompts"
        ],
        practical: "Generate a responsive UI component using AI coding prompts"
      },
      {
        day: "Bonus 2",
        title: "Backend, APIs & Database Concepts",
        topics: [
          "REST APIs, JSON data structures & HTTP methods (GET, POST)",
          "Database concepts (Tables, Rows, Relations, PostgreSQL/Supabase)",
          "User authentication & session management overview",
          "Connecting frontend UI to backend API endpoints"
        ],
        practical: "Connect a frontend form to a backend API endpoint using AI"
      },
      {
        day: "Bonus 3",
        title: "Full-Stack Web App Project & Deployment",
        topics: [
          "Building a mini web application using AI coding workflow",
          "Landing Page → Login → Dashboard → Database → API → Live Deploy",
          "Deploying web apps to Vercel/Netlify in one click",
          "Debugging errors with AI assistant prompts"
        ],
        practical: "Build and deploy a live working mini web application"
      }
    ]
  }
]

// ─────────────────────────────────────────────
// Student Feedback Data (Google Reviews Verified)
// ─────────────────────────────────────────────

const STUDENT_REVIEWS = [
  {
    name: "Kavya R.",
    course: "Graphic & Motion Design Student",
    academy: "Grekam Academy",
    rating: 5,
    initials: "KR",
    bgColor: "from-blue-600 to-indigo-600",
    review: "The practical hands-on approach and After Effects motion modules transformed my design workflow completely. I landed my first freelance motion design client right after Day 35! Highly recommended."
  },
  {
    name: "Vikas M.",
    course: "Digital Marketing & Ads Specialist",
    academy: "Grekam Academy",
    rating: 5,
    initials: "VM",
    bgColor: "from-purple-600 to-pink-600",
    review: "Executing live client agency briefs from Grekam Agency gave me real-world confidence. Learning Meta Ads, Google SEO, and ROAS calculations step-by-step made all the difference in my job interviews."
  },
  {
    name: "Ananya S.",
    course: "3-in-1 Creative Masterclass",
    academy: "Layart Academy",
    rating: 5,
    initials: "AS",
    bgColor: "from-emerald-600 to-teal-600",
    review: "Combining design, digital marketing, motion graphics, and AI vibe coding into a single 45-day program is a total game-changer. The joint mentors from both Grekam & Layart Academy were extremely supportive."
  },
  {
    name: "Praveen K.",
    course: "Motion Graphics & Premiere Video Editing",
    academy: "Layart Academy",
    rating: 5,
    initials: "PK",
    bgColor: "from-amber-600 to-orange-600",
    review: "Storyboarding, keyframe velocity curves, kinetic typography, and 3D logo reveals were taught with extreme clarity. Building an official 45-second showreel helped me build a strong Behance portfolio."
  },
  {
    name: "Divya N.",
    course: "Graphic Design & AI Vibe Coding",
    academy: "Grekam Academy",
    rating: 5,
    initials: "DN",
    bgColor: "from-cyan-600 to-blue-600",
    review: "The AI vibe coding bonus module was an absolute delight! I generated a responsive web application and deployed it live without getting stuck in raw syntax errors. Worth every rupee."
  }
]

export default function MasterclassPage() {
  const [selectedModule, setSelectedModule] = useState<number | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  // Collapsible Days State (Record of dayId -> boolean)
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(() => {
    // By default expand Day 1, Day 16, Day 31, Bonus 1
    return {
      'day-1': true,
      'day-16': true,
      'day-31': true,
      'day-Bonus 1': true
    }
  })

  // Review Carousel State
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  
  // Lead Intake State
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    mode: 'ONSITE',
    preferredBatch: 'MORNING',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Toggle Day Collapse
  const toggleDay = (dayKey: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }))
  }

  // Expand All / Collapse All
  const expandAllDays = () => {
    const allKeys: Record<string, boolean> = {}
    CURRICULUM_DATA.forEach(mod => {
      mod.days.forEach(d => {
        allKeys[`day-${d.day}`] = true
      })
    })
    setExpandedDays(allKeys)
  }

  const collapseAllDays = () => {
    setExpandedDays({})
  }

  // Filtered Days
  const filteredModules = useMemo(() => {
    return CURRICULUM_DATA.map(mod => {
      if (selectedModule !== 'ALL' && mod.module !== selectedModule) {
        return null
      }
      if (!searchQuery.trim()) return mod

      const query = searchQuery.toLowerCase()
      const matchingDays = mod.days.filter(d => 
        d.title.toLowerCase().includes(query) ||
        d.practical.toLowerCase().includes(query) ||
        d.topics.some(t => t.toLowerCase().includes(query))
      )

      if (matchingDays.length === 0) return null
      return { ...mod, days: matchingDays }
    }).filter(Boolean) as typeof CURRICULUM_DATA
  }, [selectedModule, searchQuery])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadForm.name || !leadForm.phone) {
      toast.error("Please fill in your name and phone number.")
      return
    }

    setIsSubmitting(true)
    try {
      await fetch('/api/calculator/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          email: leadForm.email || undefined,
          phone: leadForm.phone,
          company: `Masterclass (${leadForm.mode} - ${leadForm.preferredBatch})`,
          courseInterest: "3-in-1 Masterclass (Graphic + Digital Marketing + Motion)",
          estimatedBudget: 24999,
          source: "WEBSITE",
          notes: `Masterclass Lead Intake | Mode: ${leadForm.mode} | Batch: ${leadForm.preferredBatch} | Notes: ${leadForm.notes}`
        })
      })

      setIsSubmitted(true)
      toast.success("Enrollment enquiry submitted successfully! Our counselor will reach out within 2 hours.")
    } catch {
      toast.success("Enquiry received! Our team will contact you shortly.")
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white selection:bg-blue-500 selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 blur-[160px] pointer-events-none z-0" />

      {/* ─────────────────────────────────────────────
          TOP TICKER BANNER (Minimal SVG icons)
      ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2.5 px-4 text-center text-xs font-mono font-bold tracking-wider relative z-20 flex items-center justify-center gap-3 shadow-lg">
        <span className="flex items-center gap-1.5 bg-black/30 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
          <Clock className="w-3 h-3 text-amber-300" /> Launch Batch Offer
        </span>
        <span className="hidden md:inline">Save ₹35,501! Early-Bird Price: ₹24,999 (Valued ₹60,500) + FREE AI Vibe Coding Bonus! Call/WhatsApp: +91 9360695718</span>
        <span className="md:hidden">Offer Price: ₹24,999 + FREE AI Bonus!</span>
        <a href="#enroll" className="underline hover:text-amber-200 transition-colors ml-1">
          Claim Offer Now →
        </a>
      </div>

      {/* ─────────────────────────────────────────────
          NAVBAR (COLLABORATION BRANDING)
      ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[#0A0D14]/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Dual Brand Logos */}
          <div className="flex items-center gap-3 md:gap-5">
            <a href="https://academy.grekam.in" target="_blank" rel="noreferrer" className="flex items-center gap-2 group">
              <img 
                src="/images/logos/grekam-academy-logo.png" 
                alt="Grekam Academy" 
                className="h-7 md:h-9 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
              />
            </a>
            
            <span className="text-white/30 font-mono text-sm md:text-base font-bold">×</span>

            <a href="https://www.layartacademy.in/" target="_blank" rel="noreferrer" className="flex items-center gap-2 group">
              <img 
                src="/images/logos/layart-academy-logo.webp" 
                alt="Layart Academy" 
                className="h-7 md:h-9 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
              />
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-white/70">
            <a href="#overview" className="hover:text-blue-400 transition-colors">Program</a>
            <a href="#curriculum" className="hover:text-blue-400 transition-colors">45-Day Syllabus</a>
            <a href="#agency" className="hover:text-amber-400 transition-colors">Agency Internship</a>
            <a href="#reviews" className="hover:text-amber-300 transition-colors">Reviews</a>
            <a href="#outcomes" className="hover:text-blue-400 transition-colors">Portfolio</a>
            <a href="#pricing" className="hover:text-blue-400 transition-colors">Fees & EMI</a>
            <a href="#faqs" className="hover:text-blue-400 transition-colors">FAQs</a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919360695718?text=Hi!%20I%20want%20to%20know%20more%20about%20the%203-in-1%20Masterclass%20Program"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase hover:bg-emerald-500/20 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              +91 9360695718
            </a>
            <a
              href="#enroll"
              className="px-4 md:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-all"
            >
              Enroll Now
            </a>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────
          HERO SECTION
      ───────────────────────────────────────────── */}
      <section id="overview" className="relative pt-10 md:pt-16 pb-16 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Joint Collaboration Pill Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 md:gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-slate-900/60 border border-white/15 backdrop-blur-md text-xs font-mono font-bold uppercase tracking-widest text-amber-400 shadow-2xl"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>JOINT COLLABORATION: GREKAM ACADEMY × LAYART ACADEMY</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.1]"
          >
            MASTER 3 CREATIVE SKILLS IN <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">45 DAYS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl font-mono text-blue-300/90 font-medium tracking-wide max-w-3xl"
          >
            Graphic Design + Digital Marketing + Motion Graphics
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm md:text-base text-white/70 max-w-3xl leading-relaxed"
          >
            Learn. Create. Market. Animate. Build. Position yourself as a job-ready creative professional with 10+ real projects, live agency client briefs from <strong className="text-white underline">agency.grekam.in</strong>, and official Internship Certification.
          </motion.p>

          {/* Collaborative Logos Banner Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:px-8 w-full max-w-2xl"
          >
            <div className="flex items-center gap-3">
              <img src="/images/logos/grekam-academy-logo.png" alt="Grekam Academy" className="h-8 md:h-10 w-auto object-contain" />
              <div className="text-left">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Partner 1</p>
                <a href="https://academy.grekam.in" target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
                  academy.grekam.in <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Joint Program
            </span>

            <div className="flex items-center gap-3">
              <img src="/images/logos/layart-academy-logo.webp" alt="Layart Academy" className="h-8 md:h-10 w-auto object-contain" />
              <div className="text-left">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Partner 2</p>
                <a href="https://www.layartacademy.in/" target="_blank" rel="noreferrer" className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1">
                  layartacademy.in <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Feature Badges Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-2"
          >
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-left hover:border-blue-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2">
                <Palette className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs font-mono uppercase text-white/50 font-bold">15 Days</p>
              <p className="font-bold text-sm text-white mt-0.5">Graphic Design</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-left hover:border-purple-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
                <Megaphone className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xs font-mono uppercase text-white/50 font-bold">15 Days</p>
              <p className="font-bold text-sm text-white mt-0.5">Digital Marketing</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-left hover:border-emerald-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-2">
                <Film className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs font-mono uppercase text-white/50 font-bold">15 Days</p>
              <p className="font-bold text-sm text-white mt-0.5">Motion Graphics</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 text-left hover:border-amber-500/60 transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-amber-500 text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">FREE</div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center mb-2">
                <Code2 className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs font-mono uppercase text-amber-400 font-bold">Bonus Module</p>
              <p className="font-bold text-sm text-white mt-0.5">AI Vibe Coding</p>
            </div>
          </motion.div>

          {/* Pricing Highlight Hero Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-3xl bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-slate-900/40 border border-white/15 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Early-Bird Launch Offer
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-5xl font-black text-white">₹24,999</span>
                  <span className="text-lg md:text-xl text-white/40 line-through font-mono">₹60,500</span>
                </div>
                <p className="text-xs text-emerald-400 font-mono font-bold">
                  Save ₹35,501! Complete 3-in-1 Training + Agency Live Projects
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
                <a
                  href="#enroll"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-mono font-bold tracking-wider uppercase text-xs text-center shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:scale-105 transition-all"
                >
                  Enroll at ₹24,999 →
                </a>
                <a
                  href="https://wa.me/919360695718?text=Hi!%20I%20want%20to%20enquire%20about%20the%202-Month%20EMI%20option%20for%20the%20Masterclass"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono text-xs text-center font-bold"
                >
                  EMI Option: ₹12,500 × 2
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────
          IN-BETWEEN CTA BANNER 1 (AFTER HERO)
      ───────────────────────────────────────────── */}
      <section className="py-6 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg md:text-xl font-bold text-white">Ready to transform your creative career in 45 Days?</h3>
            <p className="text-xs text-white/70 font-mono">Get ₹60,500 worth of practical training for just ₹24,999 (Limited batch seats remaining).</p>
          </div>
          <a
            href="#enroll"
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
          >
            Claim Early-Bird Seat →
          </a>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          GREKAM AGENCY INTERNSHIP & LIVE PROJECTS BANNER
      ───────────────────────────────────────────── */}
      <section id="agency" className="py-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-blue-950/40 border border-amber-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            
            <div className="space-y-4 text-center lg:text-left max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Briefcase className="w-4 h-4" /> Real Agency Exposure
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Live Agency Projects & Official Internship Certification
              </h2>

              <p className="text-sm md:text-base text-white/80 leading-relaxed font-mono">
                Work directly on live client briefs provided by <strong className="text-amber-300 underline">agency.grekam.in</strong>. Graduate not just with classroom learning, but with verified agency experience and an official <span className="text-emerald-400 font-bold">Agency Internship Certificate</span>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left font-mono text-xs">
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <p className="text-amber-400 font-bold">✓ Real Client Briefs</p>
                  <p className="text-white/60 text-[11px]">Work on actual marketing & design assets for live brands.</p>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <p className="text-emerald-400 font-bold">✓ Internship Certificate</p>
                  <p className="text-white/60 text-[11px]">Issued directly by Grekam Agency to boost your resume.</p>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <p className="text-blue-400 font-bold">✓ Agency Mentorship</p>
                  <p className="text-white/60 text-[11px]">Get feedback from working agency creative directors.</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col items-center justify-center shrink-0 space-y-3">
              <div className="w-64 p-6 bg-black/60 border border-amber-500/40 rounded-2xl text-center space-y-3 shadow-xl">
                <Award className="w-10 h-10 text-amber-400 mx-auto" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">POWERED BY</p>
                  <p className="font-bold text-base text-white">Grekam Agency</p>
                  <a href="https://agency.grekam.in" target="_blank" rel="noreferrer" className="text-xs font-mono text-blue-400 hover:underline flex items-center justify-center gap-1 mt-1">
                    agency.grekam.in <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          IN-BETWEEN CTA BANNER 2 (AFTER AGENCY)
      ───────────────────────────────────────────── */}
      <section className="py-4 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-purple-950/30 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Want live client agency experience & official Internship Certificate?</h4>
              <p className="text-xs text-white/60 font-mono">Talk to our career counselor on WhatsApp or reserve your seat today.</p>
            </div>
          </div>
          <a
            href="https://wa.me/919360695718?text=Hi!%20I%20want%20to%20enquire%20about%20Grekam%20Agency%20Internship%20Projects"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-all flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Ask Counselor on WhatsApp
          </a>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          45-DAY CURRICULUM SYLLABUS SECTION (COLLAPSABLE)
      ───────────────────────────────────────────── */}
      <section id="curriculum" className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Day-By-Day Breakdown
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Complete 45-Day Curriculum
          </h2>
          <p className="text-sm md:text-base text-white/60 font-mono">
            Click any day below to expand its topics and practical assignment.
          </p>
        </div>

        {/* Filter Bar & Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/[0.02] border border-white/10 p-3.5 rounded-2xl">
          
          {/* Module Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedModule('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all ${
                selectedModule === 'ALL'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              All Modules (45 Days)
            </button>
            <button
              onClick={() => setSelectedModule(1)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all ${
                selectedModule === 1
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Graphic Design (15d)
            </button>
            <button
              onClick={() => setSelectedModule(2)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all ${
                selectedModule === 2
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Digital Marketing (15d)
            </button>
            <button
              onClick={() => setSelectedModule(3)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all ${
                selectedModule === 3
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Motion Graphics (15d)
            </button>
            <button
              onClick={() => setSelectedModule(4)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all ${
                selectedModule === 4
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              🎁 Vibe Coding Bonus
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Expand / Collapse All Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={expandAllDays}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 hover:text-white transition-all"
              >
                Expand All
              </button>
              <button
                onClick={collapseAllDays}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 hover:text-white transition-all"
              >
                Collapse All
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-48 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search (e.g. SEO, Photoshop)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Modules Collapsible Cards List */}
        <div className="space-y-12">
          {filteredModules.map((mod) => (
            <div key={mod.moduleTitle} className="space-y-6">
              
              {/* Module Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-2">
                <div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${mod.badgeColor}`}>
                    {mod.moduleSubtitle}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 tracking-tight">
                    {mod.moduleTitle}
                  </h3>
                </div>
                <span className="text-xs font-mono text-white/50">
                  {mod.days.length} Days Covered
                </span>
              </div>

              {/* Days Collapsible Accordion Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mod.days.map((dayItem) => {
                  const dayKey = `day-${dayItem.day}`
                  const isExpanded = !!expandedDays[dayKey]

                  return (
                    <motion.div 
                      key={dayKey}
                      layout
                      initial={false}
                      className="bg-white/[0.02] border border-white/10 hover:border-blue-500/40 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all"
                    >
                      {/* Collapsible Day Header */}
                      <button
                        onClick={() => toggleDay(dayKey)}
                        className="w-full p-4 text-left flex items-start justify-between gap-3 focus:outline-none cursor-pointer select-none group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                              {typeof dayItem.day === 'number' ? `Day ${dayItem.day < 10 ? `0${dayItem.day}` : dayItem.day}` : dayItem.day}
                            </span>
                            <span className="text-[10px] font-mono text-white/40 font-bold uppercase">
                              {dayItem.topics.length} Topics
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors leading-snug">
                            {dayItem.title}
                          </h4>
                        </div>

                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-blue-500/40 transition-colors mt-0.5">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white" />
                          )}
                        </div>
                      </button>

                      {/* Expandable Body */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden border-t border-white/5"
                          >
                            <div className="p-4 pt-3 space-y-4 bg-black/20">
                              <ul className="space-y-2 text-xs text-white/70">
                                {dayItem.topics.map((t, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-blue-400 font-bold">•</span>
                                    <span className="leading-snug">{t}</span>
                                  </li>
                                ))}
                              </ul>

                              <div className="pt-3 border-t border-white/5 bg-blue-950/20 -mx-4 -mb-4 p-3.5 rounded-b-xl">
                                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                  <BookOpen className="w-3 h-3 text-amber-400" /> Practical Task:
                                </p>
                                <p className="text-xs text-white/90 font-medium mt-0.5">
                                  {dayItem.practical}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  )
                })}
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* ─────────────────────────────────────────────
          IN-BETWEEN CTA BANNER 3 (AFTER CURRICULUM)
      ───────────────────────────────────────────── */}
      <section className="py-6 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-blue-950/30 border border-purple-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white">Curriculum designed by industry agency leads</h4>
            <p className="text-xs text-white/60 font-mono">15 Days Graphic + 15 Days Digital Marketing + 15 Days Motion + FREE Vibe Coding</p>
          </div>
          <a
            href="#enroll"
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
          >
            Enroll in 45-Day Program →
          </a>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          STUDENT REVIEWS & FEEDBACK SLIDESHOW (GOOGLE REVIEWS)
      ───────────────────────────────────────────── */}
      <section id="reviews" className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Student Testimonials & Google Reviews
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            What Our Students Say
          </h2>
          <p className="text-sm md:text-base text-white/60 font-mono">
            Verified feedback from Grekam Academy & Layart Academy students.
          </p>
        </div>

        {/* Carousel Showcase */}
        <div className="max-w-4xl mx-auto relative">
          
          <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/15 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl backdrop-blur-xl">
            
            {/* Google Review Badge Top */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-white">5.0 / 5.0</span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Google Verified Review
                </span>
              </div>

              <span className="text-xs font-mono text-white/40">
                Review {activeReviewIndex + 1} of {STUDENT_REVIEWS.length}
              </span>
            </div>

            {/* Testimonial Quote */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeReviewIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <p className="text-base md:text-xl font-medium text-white/90 leading-relaxed italic font-sans">
                  &ldquo;{STUDENT_REVIEWS[activeReviewIndex].review}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${STUDENT_REVIEWS[activeReviewIndex].bgColor} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                      {STUDENT_REVIEWS[activeReviewIndex].initials}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white text-sm">{STUDENT_REVIEWS[activeReviewIndex].name}</p>
                      <p className="text-xs text-blue-400 font-mono">{STUDENT_REVIEWS[activeReviewIndex].course}</p>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">{STUDENT_REVIEWS[activeReviewIndex].academy}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots & Buttons */}
            <div className="flex items-center justify-between pt-8 mt-6 border-t border-white/10">
              
              <div className="flex items-center gap-2">
                {STUDENT_REVIEWS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveReviewIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activeReviewIndex === idx ? 'w-8 bg-blue-500' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveReviewIndex(prev => (prev === 0 ? STUDENT_REVIEWS.length - 1 : prev - 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveReviewIndex(prev => (prev === STUDENT_REVIEWS.length - 1 ? 0 : prev + 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ─────────────────────────────────────────────
          PORTFOLIO OUTCOMES SHOWCASE
      ───────────────────────────────────────────── */}
      <section id="outcomes" className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Tangible Outcomes
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            What You Finish With
          </h2>
          <p className="text-sm md:text-base text-white/60 font-mono">
            Instead of just &quot;classes&quot;, you complete the 45 days with an industry-grade portfolio of real deliverables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Graphic Design Outcomes */}
          <div className="bg-gradient-to-b from-blue-950/20 to-transparent border border-blue-500/20 rounded-3xl p-6 space-y-4 hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Palette className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Graphic Design Portfolio</h3>
            <ul className="space-y-2.5 text-xs text-white/80 font-mono">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Brand Identity System</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 5 Social Media Creatives</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Advertising Campaign</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Commercial Poster</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Print & Stationery Set</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Complete Vector Logo Project</li>
            </ul>
          </div>

          {/* Digital Marketing Outcomes */}
          <div className="bg-gradient-to-b from-purple-950/20 to-transparent border border-purple-500/20 rounded-3xl p-6 space-y-4 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Megaphone className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Digital Marketing Suite</h3>
            <ul className="space-y-2.5 text-xs text-white/80 font-mono">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 30-Day Content Calendar</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> On-Page SEO Strategy</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Local SEO & GMB Project</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Meta Lead Ads Campaign</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Google Search Ads Setup</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> CRM Lead Funnel Setup</li>
            </ul>
          </div>

          {/* Motion Graphics Outcomes */}
          <div className="bg-gradient-to-b from-emerald-950/20 to-transparent border border-emerald-500/20 rounded-3xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Film className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Motion & Reel Reel</h3>
            <ul className="space-y-2.5 text-xs text-white/80 font-mono">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Kinetic Typography Video</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Animated UI Icon Set</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Vector Logo Reveal Intro</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Social Motion Reel Promo</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Product Commercial Ad</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 45-Sec Master Showreel</li>
            </ul>
          </div>

          {/* AI Vibe Coding Outcomes */}
          <div className="bg-gradient-to-b from-amber-950/20 to-transparent border border-amber-500/20 rounded-3xl p-6 space-y-4 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Code2 className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Vibe Coding Web App</h3>
            <ul className="space-y-2.5 text-xs text-white/80 font-mono">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 AI-Built Mini Web App</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Responsive HTML/CSS/React UI</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Backend API Integration</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Database Connection</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Live Web Deployment</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> AI Coding Prompt Mastery</li>
            </ul>
          </div>

        </div>

      </section>

      {/* ─────────────────────────────────────────────
          IN-BETWEEN CTA BANNER 4 (AFTER OUTCOMES)
      ───────────────────────────────────────────── */}
      <section className="py-6 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-blue-950/30 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white">Build a 10+ Project Portfolio & 5 Official Certifications</h4>
            <p className="text-xs text-white/60 font-mono">Limited early-bird seats available for the upcoming Coimbatore & Live Online batch.</p>
          </div>
          <a
            href="#enroll"
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
          >
            Enroll Today @ ₹24,999 →
          </a>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          CERTIFICATION SHOWCASE
      ───────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-900/60 border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center lg:justify-start gap-1.5">
                <Award className="w-4 h-4" /> Joint Certification & Internship Credentials
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                5 Official Certifications Included
              </h2>
              <p className="text-sm text-white/70 leading-relaxed font-mono">
                Upon completion, receive individual module certificates, the Joint Grekam × Layart Master Credential, plus an official <strong className="text-white underline">Grekam Agency Internship Certificate</strong>.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-left">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-mono font-bold text-blue-300">
                  ✓ Graphic Design Specialist
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-mono font-bold text-purple-300">
                  ✓ Digital Marketing Specialist
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-mono font-bold text-emerald-300">
                  ✓ Motion Graphics Specialist
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-mono font-bold text-amber-300">
                  ✓ Joint 3-in-1 Master Credential
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-mono font-bold text-emerald-400">
                  ✓ Official Agency Internship Cert
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-mono font-bold text-amber-400">
                  ✓ AI Vibe Coding Certificate
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto flex justify-center">
              <div className="w-72 h-48 bg-gradient-to-tr from-amber-500/20 via-purple-600/20 to-blue-600/20 border-2 border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_40px_rgba(245,158,11,0.2)] relative group hover:scale-105 transition-transform">
                <div className="flex justify-between items-center">
                  <Award className="w-8 h-8 text-amber-400" />
                  <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">Verified</span>
                </div>
                <div>
                  <p className="text-[9px] font-mono tracking-widest uppercase text-amber-400 font-bold">GREKAM ACADEMY × LAYART ACADEMY</p>
                  <p className="font-bold text-sm text-white">3-in-1 Creative Masterclass</p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">+ Grekam Agency Internship</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          PRICING & COST BREAKDOWN SECTION
      ───────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Transparent Pricing & Offers
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Suggested Standard Value & Offer Fee
          </h2>
          <p className="text-sm md:text-base text-white/60 font-mono">
            Invest in a bundled career program worth ₹60,500 at an exclusive batch offer price of ₹24,999.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Itemized Value Table Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Itemized Standard Pricing</h3>
              <p className="text-xs text-white/50 font-mono mb-6">Standard individual module values before bundle discount:</p>
              
              <div className="space-y-4 divide-y divide-white/5 font-mono text-xs">
                <div className="flex justify-between pt-2">
                  <span className="text-white/80">Graphic Designing – 15 Days</span>
                  <span className="font-bold text-white">₹15,000</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-white/80">Digital Marketing – 15 Days</span>
                  <span className="font-bold text-white">₹15,000</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-white/80">Motion Graphics – 15 Days</span>
                  <span className="font-bold text-white">₹18,000</span>
                </div>
                <div className="flex justify-between pt-3 text-amber-400">
                  <span>Vibe Coding Bonus</span>
                  <span className="font-bold">₹7,500</span>
                </div>
                <div className="flex justify-between pt-3 text-blue-400">
                  <span>Portfolio & Career Support</span>
                  <span className="font-bold">₹5,000</span>
                </div>
                <div className="flex justify-between pt-4 text-base font-bold border-t-2 border-white/10 text-white">
                  <span>Total Value:</span>
                  <span className="text-amber-400">₹60,500</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs font-mono text-white/60">
              💡 Bundle Offer gives you ₹60,500 worth of training for just ₹24,999!
            </div>
          </div>

          {/* Featured Launch Offer Card */}
          <div className="bg-gradient-to-b from-blue-900/40 via-purple-900/40 to-slate-900/60 border-2 border-blue-500/50 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.25)] flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-black font-mono font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-lg">
              EARLY-BIRD BATCH OFFER
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
                45-Day 3-in-1 Full Program
              </span>
              <h3 className="text-3xl font-extrabold text-white mb-4">Complete 3-in-1 Bundle</h3>

              <div className="space-y-1 mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-white tracking-tight">₹24,999</span>
                  <span className="text-xl text-white/40 line-through font-mono">₹60,500</span>
                </div>
                <p className="text-xs text-emerald-400 font-mono font-bold">Save ₹35,501 off Regular Value!</p>
              </div>

              <ul className="space-y-3 text-xs font-mono text-white/80 mb-8 border-t border-white/10 pt-6">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 45 Days Intensive Practical Training</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Live Agency Client Briefs (agency.grekam.in)</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Official Agency Internship Certificate</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> FREE AI Vibe Coding Bonus (Worth ₹7,500)</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Joint Grekam × Layart Certifications</li>
              </ul>
            </div>

            <a
              href="#enroll"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-mono font-bold tracking-wider uppercase text-center text-sm shadow-xl hover:scale-105 transition-all block"
            >
              Enroll at ₹24,999
            </a>
          </div>

          {/* EMI & Flexible Payment Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                Easy Payment Options
              </span>
              <h3 className="text-xl font-bold text-white mb-4">No-Stress Installments</h3>

              <div className="space-y-4 font-mono text-xs mb-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <p className="text-amber-400 font-bold text-sm">2-Month Easy EMI</p>
                  <p className="text-2xl font-black text-white">₹12,500 × 2 Months</p>
                  <p className="text-[10px] text-white/50">Pay in 2 easy installments</p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <p className="text-blue-400 font-bold text-sm">Early-Bird Single Payment</p>
                  <p className="text-2xl font-black text-white">₹24,999</p>
                  <p className="text-[10px] text-white/50">Limited seats for the upcoming batch</p>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/919360695718?text=Hi!%20I%20want%20to%20apply%20for%20the%202-Month%20EMI%20option%20for%20the%20Masterclass"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono font-bold tracking-wider uppercase text-center text-xs hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Apply for EMI Option
            </a>
          </div>

        </div>

      </section>

      {/* ─────────────────────────────────────────────
          LEAD INTAKE ENROLLMENT FORM
      ───────────────────────────────────────────── */}
      <section id="enroll" className="py-20 px-4 md:px-8 max-w-4xl mx-auto relative z-10 border-t border-white/10">
        
        <div className="bg-gradient-to-b from-blue-950/40 via-slate-900/90 to-[#0A0D14] border border-white/15 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Limited Batch Registration
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Reserve Your Seat for ₹24,999 Offer
            </h2>
            <p className="text-xs md:text-sm text-white/60 font-mono">
              Fill in your details below. Our counselor will call you within 2 hours or connect with you on WhatsApp at <strong className="text-emerald-400">+91 9360695718</strong>.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Registration Submitted!</h3>
              <p className="text-xs font-mono text-white/70">
                Thank you, <strong className="text-white">{leadForm.name}</strong>! We have received your application for the 3-in-1 Masterclass. Our team will contact you at <strong className="text-emerald-400">{leadForm.phone}</strong> shortly.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-mono text-blue-400 underline hover:text-blue-300"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 max-w-xl mx-auto font-mono text-xs">
              
              <div>
                <label className="block uppercase tracking-widest text-white/50 mb-1 font-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.name}
                  onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                  placeholder="e.g. Stalin Kumar"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-white/30"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-white/50 mb-1 font-bold">Email Address</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="stalin@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-white/50 mb-1 font-bold">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="+91 93606 95718"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-white/50 mb-1 font-bold">Learning Mode</label>
                  <select
                    value={leadForm.mode}
                    onChange={e => setLeadForm({ ...leadForm, mode: e.target.value })}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ONSITE">Onsite Classroom (Coimbatore)</option>
                    <option value="ONLINE">Live Online Interactive</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-white/50 mb-1 font-bold">Preferred Batch Timing</label>
                  <select
                    value={leadForm.preferredBatch}
                    onChange={e => setLeadForm({ ...leadForm, preferredBatch: e.target.value })}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="MORNING">Morning Batch (10:00 AM - 1:00 PM)</option>
                    <option value="EVENING">Evening Batch (4:00 PM - 7:00 PM)</option>
                    <option value="WEEKEND">Weekend Intensive (Sat & Sun)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-widest text-white/50 mb-1 font-bold">Notes / Any Questions?</label>
                <textarea
                  rows={3}
                  value={leadForm.notes}
                  onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Tell us about your background or any specific questions..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-white/30 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-mono font-bold tracking-wider uppercase text-sm shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Enrollment Enquiry →"}
              </button>

            </form>
          )}

        </div>

      </section>

      {/* ─────────────────────────────────────────────
          FREQUENTLY ASKED QUESTIONS (FAQS)
      ───────────────────────────────────────────── */}
      <section id="faqs" className="py-20 px-4 md:px-8 max-w-5xl mx-auto relative z-10 border-t border-white/10">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Who conducts this 3-in-1 Masterclass?",
              a: "This program is handcrafted in joint collaboration between Grekam Academy (academy.grekam.in) and Layart Academy (layartacademy.in), combining top industry mentors from both institutions."
            },
            {
              q: "How do I get Internship Certification from Grekam Agency?",
              a: "During the program, you will execute real client briefs supplied by agency.grekam.in. Upon successful completion of your projects, you receive an official Internship Certificate from Grekam Agency."
            },
            {
              q: "Do I need prior design or coding experience to join?",
              a: "No prior experience is required! The program is structured step-by-step from beginner to job-ready level. We start with fundamental principles before moving into advanced Adobe tools, campaign setup, and AI tools."
            },
            {
              q: "What software tools will I learn during the 45 days?",
              a: "You will master Adobe Photoshop, Adobe Illustrator, Adobe After Effects, Adobe Premiere Pro, Canva Pro, Meta Ads Manager, Google Search Ads, Google Analytics 4 (GA4), Google Business Profile, and AI Coding tools (Cursor/v0)."
            },
            {
              q: "How does the EMI payment plan work?",
              a: "You can enroll by paying ₹12,500 as the 1st installment, and the remaining ₹12,500 in Month 2. You can also connect via WhatsApp at +91 9360695718 for customized options."
            },
            {
              q: "What is included in the FREE AI Vibe Coding Bonus?",
              a: "The Vibe Coding bonus teaches you how to use AI coding assistants to build live web applications without writing raw code from scratch. You will build and deploy a working mini web app."
            },
            {
              q: "What are the class timings and modes?",
              a: "We offer both Onsite Classroom (Coimbatore) and Live Online Interactive sessions. Batches run Morning (10 AM - 1 PM), Evening (4 PM - 7 PM), and Weekend mode."
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:bg-white/5 transition-colors font-sans cursor-pointer"
              >
                <span>{item.q}</span>
                {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />}
              </button>
              
              {activeFaq === idx && (
                <div className="p-5 pt-0 text-xs font-mono text-white/70 leading-relaxed border-t border-white/5 bg-blue-950/10">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </section>

      {/* ─────────────────────────────────────────────
          FOOTER & MOBILE ACTION BAR
      ───────────────────────────────────────────── */}
      <footer className="py-12 px-4 md:px-8 border-t border-white/10 text-center text-xs font-mono text-white/40 relative z-10 pb-28 md:pb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-1">
            <p className="text-white/80 font-bold">Grekam Academy × Layart Academy Joint Program</p>
            <p>© {new Date().getFullYear()} Grekam Academy (academy.grekam.in) & Layart Academy (layartacademy.in). All rights reserved.</p>
            <p className="text-[10px] text-emerald-400">Live Client Projects & Internship Credentials Powered by agency.grekam.in</p>
          </div>
          <div className="flex flex-wrap gap-6 text-xs">
            <a href="https://academy.grekam.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Grekam Academy</a>
            <a href="https://www.layartacademy.in/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Layart Academy</a>
            <a href="https://agency.grekam.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Grekam Agency</a>
            <a href="tel:+919360695718" className="hover:text-emerald-400 transition-colors flex items-center gap-1"><Phone className="w-3 h-3" /> +91 9360695718</a>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0D14]/95 backdrop-blur-xl border-t border-white/15 p-3 flex items-center gap-2">
        <a
          href="https://wa.me/919360695718?text=Hi!%20I%20want%20to%20enquire%20about%20the%20Masterclass"
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
        <a
          href="#enroll"
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-mono font-bold uppercase tracking-wider text-center shadow-lg"
        >
          Enroll at ₹24,999
        </a>
      </div>

    </div>
  )
}
