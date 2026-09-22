"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, CheckCircle2, ArrowRight, Calendar, Clock, Award, 
  BookOpen, Video, ShieldCheck, Zap, Layers, Palette, Megaphone, 
  Film, Code2, Users, IndianRupee, HelpCircle, Star, ChevronDown, 
  ChevronUp, MessageCircle, Send, FileCheck, Check, Search, Download
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
          "Photoshop UI & workspace customization",
          "Layers, layer masks & non-destructive editing",
          "Selection tools (Lasso, Pen, Quick Selection)",
          "Smart objects & smart filters",
          "Adjustment layers & blend modes"
        ],
        practical: "Design a high-converting social media creative"
      },
      {
        day: 5,
        title: "Photoshop Advanced Compositing & Retouching",
        topics: [
          "High-end photo manipulation & retouching",
          "Clean background removal & hair masking",
          "Blending multiple images seamlessly",
          "Realistic shadows & studio lighting effects",
          "Color grading & color correction"
        ],
        practical: "Create a surreal creative photo manipulation poster"
      },
      {
        day: 6,
        title: "Adobe Illustrator Vector Art",
        topics: [
          "Vector vs raster graphics demystified",
          "Shapes, Pathfinder & Shape Builder tools",
          "Pen tool mastery & bezier curve control",
          "Strokes, fills, gradients & mesh basics",
          "Designing scalable vector icons"
        ],
        practical: "Design a custom vector illustration set"
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
        title: "Portfolio Development & Case Studies",
        topics: [
          "Selecting your best 5-7 design projects",
          "Setting up a Behance & Dribbble portfolio",
          "Instagram portfolio curation for freelancers",
          "Structuring design case studies (Problem → Concept → Result)",
          "Client pitch decks & proposal techniques"
        ],
        practical: "Publish a complete case study on Behance"
      },
      {
        day: 15,
        title: "Graphic Design Capstone Project",
        topics: [
          "Final Project Execution: Full Branding Campaign",
          "Deliverables: Logo, Color Guide, Typography, Social Campaign, Ad Creatives & Print Stationery",
          "Live peer review & mentor evaluation"
        ],
        practical: "Present your complete Graphic Design Capstone Campaign"
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
        title: "Digital Marketing Fundamentals",
        topics: [
          "Overview of modern digital marketing ecosystem",
          "Marketing funnel architecture (TOFU, MOFU, BOFU)",
          "Mapping the customer journey & touchpoints",
          "B2B vs B2C marketing strategies",
          "Organic vs Paid growth channels",
          "Career paths: Agency, In-House & Freelance"
        ],
        practical: "Map out a 3-stage customer funnel for a business"
      },
      {
        day: 17,
        title: "Market & Competitor Research",
        topics: [
          "Defining target audience demographics & psychographics",
          "Building Buyer Personas with detailed pain points",
          "Competitor ad library & content analysis",
          "Keyword & trend research tools",
          "Identifying market positioning gaps"
        ],
        practical: "Create a detailed 360° Customer Buyer Persona card"
      },
      {
        day: 18,
        title: "Social Media Marketing Strategy",
        topics: [
          "Platform strategies: Instagram, Facebook, LinkedIn & YouTube",
          "Content pillars (Educational, Entertaining, Promotional)",
          "Posting frequency & timing optimization",
          "Community engagement & comment strategies",
          "Algorithm breakdown for organic reach"
        ],
        practical: "Formulate social media platform strategies & content pillars"
      },
      {
        day: 19,
        title: "Content Planning & AI Content Systems",
        topics: [
          "Short-form video strategy (Reels, Shorts)",
          "Carousel post copywriting & visual hooks",
          "Prompt engineering for ChatGPT & AI copy tools",
          "Creating 30-day content calendars in Notion/Excel",
          "Batch content production workflow"
        ],
        practical: "Build a complete 30-day social media content calendar"
      },
      {
        day: 20,
        title: "Instagram Marketing Mastery",
        topics: [
          "Profile optimization for maximum conversion",
          "High-converting bio & link-in-bio setups",
          "Reels hook scripting & trending audio strategy",
          "Instagram Search & SEO keyword optimization",
          "DM automation & lead generation strategies"
        ],
        practical: "Optimize a live Instagram business profile"
      },
      {
        day: 21,
        title: "Facebook Organic & Community Growth",
        topics: [
          "Facebook Business Page setup & optimization",
          "Community management with Facebook Groups",
          "Organic lead generation strategies",
          "Combining organic posting with paid strategies"
        ],
        practical: "Create a Facebook Business Page & Group growth plan"
      },
      {
        day: 22,
        title: "Google Search & SEO Fundamentals",
        topics: [
          "How Google crawler & indexer work",
          "Keyword research & search intent analysis",
          "On-Page SEO: Meta titles, descriptions, H1-H3 headers",
          "Technical SEO essentials (Page speed, mobile responsiveness)",
          "Internal linking & content cluster strategy"
        ],
        practical: "Perform full On-Page SEO audit for a web page"
      },
      {
        day: 23,
        title: "Local SEO & Google Business Profile",
        topics: [
          "Setting up & verifying Google Business Profile",
          "Local keyword targeting & GMB optimization",
          "Local citations, NAPs & customer review strategy",
          "Ranking in Google 3-Pack map results",
          "Geotagged content & local link building"
        ],
        practical: "Build a complete Local SEO ranking strategy"
      },
      {
        day: 24,
        title: "Website & Landing Page Marketing",
        topics: [
          "Landing page layout structure for high conversions",
          "Crafting irresistible headlines & subheadings",
          "Lead form design & Call-To-Action optimization",
          "WhatsApp lead integration & click-to-chat setups",
          "Conversion Rate Optimization (CRO) best practices"
        ],
        practical: "Wireframe a high-converting landing page structure"
      },
      {
        day: 25,
        title: "Meta Ads Manager Architecture",
        topics: [
          "Meta Ads Manager account structure & setup",
          "Campaign objectives (Leads, Traffic, Engagement, Sales)",
          "Audience targeting (Core, Custom, Lookalike audiences)",
          "Placement selection & budget bidding strategies",
          "Creative strategy for Meta Ads"
        ],
        practical: "Setup Meta Ads Manager structure & audience personas"
      },
      {
        day: 26,
        title: "Meta Ads Practical — Lead Generation",
        topics: [
          "Creating instant lead forms in Meta Ads",
          "Drafting high-converting ad copy & headlines",
          "A/B testing creatives & headlines",
          "Setting up custom questions & lead filters",
          "Launching a live lead generation campaign"
        ],
        practical: "Build a complete Meta Lead Generation Ad campaign"
      },
      {
        day: 27,
        title: "Google Ads (Search Campaigns)",
        topics: [
          "Google Search Ads campaign structure",
          "Keyword match types (Exact, Phrase, Broad)",
          "Negative keyword management",
          "Responsive Search Ad headlines & descriptions",
          "Bidding strategies & Quality Score improvement"
        ],
        practical: "Setup a Google Search Ad campaign mock"
      },
      {
        day: 28,
        title: "Analytics, Metrics & Performance Tracking",
        topics: [
          "Google Analytics 4 (GA4) dashboard overview",
          "Google Search Console performance metrics",
          "Understanding key metrics: CTR, CPC, CPL, CPM, ROAS",
          "Conversion tracking & UTM parameter tagging",
          "Creating client monthly marketing performance reports"
        ],
        practical: "Generate a marketing analytics performance dashboard"
      },
      {
        day: 29,
        title: "Lead Nurturing, CRM & Automation",
        topics: [
          "Automating lead capture from Meta Ads to CRM",
          "WhatsApp automated greeting & auto-reply workflows",
          "Email marketing sequences for lead nurturing",
          "CRM lead status management & SLA follow-ups",
          "Building automated sales funnels"
        ],
        practical: "Design an automated lead follow-up CRM flow"
      },
      {
        day: 30,
        title: "Digital Marketing Capstone Project",
        topics: [
          "Final Project Execution: 360° Digital Marketing Campaign",
          "Deliverables: Persona, 30-Day Content Plan, SEO Strategy, Meta Lead Ad Campaign, Landing Page & Analytics Report",
          "Live peer review & campaign audit"
        ],
        practical: "Present complete 360° Digital Marketing Strategy"
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
        title: "Motion Design Fundamentals",
        topics: [
          "What is motion graphics & industry applications",
          "12 principles of animation overview",
          "Timing, spacing, keyframe concepts",
          "Storyboarding & animatics preparation",
          "Analyzing award-winning motion references"
        ],
        practical: "Create a 6-frame motion storyboard concept"
      },
      {
        day: 32,
        title: "After Effects Core Workflow",
        topics: [
          "After Effects interface, panels & composition setup",
          "Layer types (Solid, Shape, Text, Adjustment, Null)",
          "Timeline navigation & keyframing basics",
          "Transform properties: Position, Scale, Rotation, Opacity, Anchor Point",
          "Rendering & MP4 export settings"
        ],
        practical: "Create your first multi-layer After Effects composition"
      },
      {
        day: 33,
        title: "Animation Principles & Velocity Graphs",
        topics: [
          "Easy Ease (F9) & keyframe interpolation",
          "Speed Graph & Value Graph Editor deep dive",
          "Anticipation, overshoot & follow-through motion",
          "Creating fluid, natural kinetic movements"
        ],
        practical: "Animate a realistic bouncing ball with squash & stretch"
      },
      {
        day: 34,
        title: "Kinetic Typography & Text Animation",
        topics: [
          "Text layers & text animators (Range Selector, Wiggly)",
          "Kinetic typography for social media & commercials",
          "Text reveal effects & mask transitions",
          "Custom text presets & expression controls"
        ],
        practical: "Design an animated kinetic typography quote video"
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
        practical: "Connect an AI-generated UI form to a live database API"
      },
      {
        day: "Bonus 3",
        title: "Full-Stack Project & Live Deployment",
        topics: [
          "Combining Frontend + API + Database into a mini web app",
          "AI-assisted code debugging & refactoring",
          "Deploying applications live on Vercel / Netlify",
          "Custom domain connection & SSL configuration"
        ],
        practical: "Deploy a live working mini web application using AI-assisted coding"
      }
    ]
  }
]

export default function MasterclassLandingPage() {
  const [selectedModule, setSelectedModule] = useState<number | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  
  // Lead Intake Form State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    mode: 'ONSITE',
    preferredBatch: 'MORNING',
    notes: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Filtered Days
  const filteredModules = useMemo(() => {
    return CURRICULUM_DATA.map(mod => {
      if (selectedModule !== 'ALL' && mod.module !== selectedModule) {
        return null
      }
      const matchingDays = mod.days.filter(d => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          d.title.toLowerCase().includes(q) ||
          d.practical.toLowerCase().includes(q) ||
          d.topics.some(t => t.toLowerCase().includes(q))
        )
      })
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
          estimatedBudget: 24000,
          source: "WEBSITE",
          notes: `Masterclass Lead Intake | Mode: ${leadForm.mode} | Batch: ${leadForm.preferredBatch} | Notes: ${leadForm.notes}`
        })
      })

      setIsSubmitted(true)
      toast.success("Enrollment enquiry submitted successfully! Our career counselor will reach out within 2 hours.")
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
          TOP TICKER BANNER
      ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2.5 px-4 text-center text-xs font-mono font-bold tracking-wider relative z-20 flex items-center justify-center gap-3 shadow-lg">
        <span className="flex items-center gap-1.5 bg-black/30 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
          <Zap className="w-3 h-3 text-amber-300 animate-pulse" /> Limited Batch Offer
        </span>
        <span className="hidden md:inline">Save ₹6,000 + Get FREE AI Vibe Coding Full-Stack Development Bonus (Worth ₹7,500)!</span>
        <span className="md:hidden">Save ₹6,000 + FREE Vibe Coding Bonus!</span>
        <a href="#enroll" className="underline hover:text-amber-200 transition-colors ml-1">
          Claim Offer Now →
        </a>
      </div>

      {/* ─────────────────────────────────────────────
          NAVBAR
      ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <div className="w-full h-full bg-[#0A0D14] rounded-[10px] flex items-center justify-center font-black font-mono text-lg text-white">
                G
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-none">GREKAM ACADEMY</span>
              <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-bold">3-in-1 Masterclass</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-white/70">
            <a href="#overview" className="hover:text-blue-400 transition-colors">Program</a>
            <a href="#curriculum" className="hover:text-blue-400 transition-colors">45-Day Syllabus</a>
            <a href="#outcomes" className="hover:text-blue-400 transition-colors">Portfolio</a>
            <a href="#pricing" className="hover:text-blue-400 transition-colors">Fees & EMI</a>
            <a href="#faqs" className="hover:text-blue-400 transition-colors">FAQs</a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919876543210?text=Hi!%20I%20want%20to%20know%20more%20about%20the%203-in-1%20Masterclass%20Program"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase hover:bg-emerald-500/20 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              WhatsApp
            </a>
            <a
              href="#enroll"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-all"
            >
              Enroll Now
            </a>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────
          HERO SECTION
      ───────────────────────────────────────────── */}
      <section id="overview" className="relative pt-12 md:pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Hero Header Pill */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-mono font-bold uppercase tracking-widest text-blue-400 shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>3-in-1 Creative Career Program • 45 Days Intensive</span>
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
            className="text-sm md:text-base text-white/70 max-w-2xl leading-relaxed"
          >
            Learn. Create. Market. Animate. Build. Position yourself as a job-ready or freelance-ready creative professional with 10+ real-world projects, AI workflows, and personalized career mentorship.
          </motion.p>

          {/* Feature Badges Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-4"
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

          {/* Pricing Highlight Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-3xl bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-slate-900/40 border border-white/15 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Special Batch Launch Offer
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-5xl font-black text-white">₹24,000</span>
                  <span className="text-lg md:text-xl text-white/40 line-through font-mono">₹30,000</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold px-2.5 py-1 rounded-full uppercase">Save ₹6,000</span>
                </div>
                <p className="text-xs text-white/60 font-mono">
                  Flexible EMI available: <strong className="text-white">₹12,000 × 2 Months</strong> (or ₹7,000/mo)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a
                  href="#enroll"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-mono font-bold tracking-wider uppercase text-sm shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 group"
                >
                  Enroll Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────
          PROGRAM DETAILS & SYLLABUS DISCOVERY
      ───────────────────────────────────────────── */}
      <section id="curriculum" className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Intensive 45-Day Syllabus
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Comprehensive Practical Curriculum
          </h2>
          <p className="text-sm md:text-base text-white/60 font-mono">
            Explore every single day of hands-on training, real client briefs, and practical projects.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Module Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
            <button
              onClick={() => setSelectedModule('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                selectedModule === 'ALL'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              All 45 Days
            </button>
            <button
              onClick={() => setSelectedModule(1)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                selectedModule === 1
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Graphic Design (D1-15)
            </button>
            <button
              onClick={() => setSelectedModule(2)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                selectedModule === 2
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Digital Marketing (D16-30)
            </button>
            <button
              onClick={() => setSelectedModule(3)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                selectedModule === 3
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Motion Graphics (D31-45)
            </button>
            <button
              onClick={() => setSelectedModule(4)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                selectedModule === 4
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              🎁 Bonus: Vibe Coding
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. Photoshop, SEO, Meta Ads)..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Modules Accordion / List */}
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

              {/* Days Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mod.days.map((dayItem) => (
                  <div 
                    key={typeof dayItem.day === 'number' ? `day-${dayItem.day}` : dayItem.day}
                    className="bg-white/[0.02] border border-white/10 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/[0.04] transition-all space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                          {typeof dayItem.day === 'number' ? `Day ${dayItem.day < 10 ? `0${dayItem.day}` : dayItem.day}` : dayItem.day}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <h4 className="font-bold text-base text-white group-hover:text-blue-300 transition-colors mb-3">
                        {dayItem.title}
                      </h4>

                      <ul className="space-y-1.5 text-xs text-white/70">
                        {dayItem.topics.map((t, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span className="leading-snug">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-white/5 bg-blue-950/20 -mx-5 -mb-5 p-3 rounded-b-2xl">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-400" /> Practical Task:
                      </p>
                      <p className="text-xs text-white/90 font-medium mt-0.5">
                        {dayItem.practical}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
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
          CERTIFICATION SHOWCASE
      ───────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-900/60 border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center lg:justify-start gap-1.5">
                <Award className="w-4 h-4" /> Earn Industry Recognized Credentials
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                4 Official Certifications Included
              </h2>
              <p className="text-sm text-white/70 leading-relaxed font-mono">
                Upon program completion, receive specialized module certificates plus the Master 3-in-1 Career Credential to showcase on LinkedIn & resume.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-left">
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
                  ✓ 3-in-1 Master Credential
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto flex justify-center">
              <div className="w-64 h-44 bg-gradient-to-tr from-amber-500/20 to-purple-600/20 border-2 border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_40px_rgba(245,158,11,0.2)] relative group hover:scale-105 transition-transform">
                <Award className="w-10 h-10 text-amber-400" />
                <div>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold">GREKAM ACADEMY CREDENTIAL</p>
                  <p className="font-bold text-sm text-white">3-in-1 Masterclass Career Program</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          PRICING & EMI BREAKDOWN SECTION
      ───────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Transparent Pricing & Offers
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Program Fee & Value Breakdown
          </h2>
          <p className="text-sm md:text-base text-white/60 font-mono">
            Invest in a bundled career program worth ₹60,500 at an exclusive batch launch offer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Itemized Value Table Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Itemized Standard Value</h3>
              <p className="text-xs text-white/50 font-mono mb-6">Standard individual module values before bundle discount:</p>
              
              <div className="space-y-4 divide-y divide-white/5 font-mono text-xs">
                <div className="flex justify-between pt-2">
                  <span className="text-white/80">Graphic Design (15 Days)</span>
                  <span className="font-bold text-white">₹15,000</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-white/80">Digital Marketing (15 Days)</span>
                  <span className="font-bold text-white">₹15,000</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-white/80">Motion Graphics (15 Days)</span>
                  <span className="font-bold text-white">₹18,000</span>
                </div>
                <div className="flex justify-between pt-3 text-amber-400">
                  <span>AI Vibe Coding Bonus</span>
                  <span className="font-bold">₹7,500</span>
                </div>
                <div className="flex justify-between pt-3 text-blue-400">
                  <span>Portfolio & Mentorship</span>
                  <span className="font-bold">₹5,000</span>
                </div>
                <div className="flex justify-between pt-4 text-base font-bold border-t-2 border-white/10 text-white">
                  <span>Total Value:</span>
                  <span className="text-amber-400">₹60,500</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs font-mono text-white/60">
              💡 Bundle Offer saves you over 60% compared to individual modules!
            </div>
          </div>

          {/* Featured Launch Offer Card */}
          <div className="bg-gradient-to-b from-blue-900/40 via-purple-900/40 to-slate-900/60 border-2 border-blue-500/50 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.25)] flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-black font-mono font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-lg">
              POPULAR BATCH OFFER
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
                45-Day 3-in-1 Full Program
              </span>
              <h3 className="text-3xl font-extrabold text-white mb-4">Complete 3-in-1 Bundle</h3>

              <div className="space-y-1 mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-white tracking-tight">₹24,000</span>
                  <span className="text-xl text-white/40 line-through font-mono">₹30,000</span>
                </div>
                <p className="text-xs text-emerald-400 font-mono font-bold">Instant ₹6,000 Direct Discount</p>
              </div>

              <ul className="space-y-3 text-xs font-mono text-white/80 mb-8 border-t border-white/10 pt-6">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 45 Days Intensive Practical Training</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 10+ Real Portfolio Projects</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> FREE AI Vibe Coding Bonus (Worth ₹7,500)</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 4 Official Certifications</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Freelance & Job Placement Mentorship</li>
              </ul>
            </div>

            <a
              href="#enroll"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-mono font-bold tracking-wider uppercase text-center text-sm shadow-xl hover:scale-105 transition-all block"
            >
              Enroll at ₹24,000
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
                  <p className="text-amber-400 font-bold text-sm">2-Month No-Cost EMI</p>
                  <p className="text-2xl font-black text-white">₹12,000 × 2 Months</p>
                  <p className="text-[10px] text-white/50">Total Payable: ₹24,000 (0% Interest)</p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <p className="text-blue-400 font-bold text-sm">Early-Bird Single Payment</p>
                  <p className="text-2xl font-black text-white">₹21,999</p>
                  <p className="text-[10px] text-white/50">Limited to first 15 seats of upcoming batch</p>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/919876543210?text=Hi!%20I%20want%20to%20apply%20for%20the%20₹12,000%20x%202%20Months%20EMI%20option%20for%20the%20Masterclass"
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
              Reserve Your Seat for ₹24,000 Offer
            </h2>
            <p className="text-xs md:text-sm text-white/60 font-mono">
              Fill in your details below. Our career counselor will call you within 2 hours to confirm batch timing and enrollment setup.
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
                    placeholder="+91 98765 43210"
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
              q: "Do I need prior design or coding experience to join?",
              a: "No prior experience is required! The program is structured step-by-step from beginner to job-ready level. We start with fundamental principles before moving into advanced Adobe tools, campaign setup, and AI tools."
            },
            {
              q: "What software tools will I learn during the 45 days?",
              a: "You will master Adobe Photoshop, Adobe Illustrator, Adobe After Effects, Adobe Premiere Pro, Canva Pro, Meta Ads Manager, Google Search Ads, Google Analytics 4 (GA4), Google Business Profile, and AI Coding tools (Cursor/v0)."
            },
            {
              q: "How does the 2-Month EMI payment plan work?",
              a: "You can enroll by paying ₹12,000 as the 1st installment, and the remaining ₹12,000 in Month 2. We also have flexible monthly options starting from ₹7,000/month."
            },
            {
              q: "What is included in the FREE AI Vibe Coding Bonus?",
              a: "The Vibe Coding bonus teaches you how to use AI coding assistants to build live web applications without writing raw code from scratch. You will build and deploy a working mini web app."
            },
            {
              q: "Will I get certificates after completing the course?",
              a: "Yes! You receive 3 Module Certificates (Graphic Design, Digital Marketing, Motion Graphics), 1 Master Program Credential, and 1 Vibe Coding Bonus Certificate."
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
                className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:bg-white/5 transition-colors font-sans"
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p>© {new Date().getFullYear()} Grekam Academy. All rights reserved.</p>
            <p className="text-[10px] text-white/30 mt-1">3-in-1 Creative & Digital Marketing Career Program</p>
          </div>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0D14]/95 backdrop-blur-xl border-t border-white/15 p-3 flex items-center gap-2">
        <a
          href="https://wa.me/919876543210?text=Hi!%20I%20want%20to%20enquire%20about%20the%20Masterclass"
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
          Enroll at ₹24,000
        </a>
      </div>

    </div>
  )
}
