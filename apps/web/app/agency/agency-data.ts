export type ProjectData = { 
  id: string; 
  title: string; 
  image: string; 
  url?: string; 
  category?: string; 
  techStack?: string[]; 
  description?: string; 
}

export type PosterCardItem = { text: string; sub: string; icon: string }

export type CardData = { 
  id: string; 
  category: string; 
  title: string; 
  subtitle: string; 
  icon?: any; 
  iconName?: string; 
  colorHex: string; 
  isGlitch?: boolean; 
  cta?: string; 
  projects?: ProjectData[]; 
  features?: string[]; 
  deliverables?: string[]; 
  techStack?: string[]; 
  idealFor?: string; 
  turnaround?: string; 
  isContactForm?: boolean; 
  isProducts?: boolean; 
  isPortfolio?: boolean; 
  isAcademy?: boolean; 
  isCrm?: boolean; 
  isHrm?: boolean; 
  isPricing?: boolean; 
  isServices?: boolean; 
  isLegal?: boolean; 
  // Cinematic Poster Control Fields
  posterTitle1?: string;
  posterTitle2?: string;
  growth?: string;
  gets?: string;
  portalText?: string;
  topTagLeft?: string;
  topTagRight?: string;
  gradient?: string;
  posterCards?: PosterCardItem[];
}

export const DUMMY_PROJECTS: ProjectData[] = [
  { 
    id: 'p1', 
    title: 'Raaghas Luxury E-Commerce', 
    image: 'https://api.microlink.io/?url=https%3A%2F%2Fraaghas.in&screenshot=true&embed=screenshot.url&meta=false',
    url: 'https://raaghas.in',
    category: 'Luxury E-Commerce',
    techStack: ['Next.js 15', 'TypeScript', 'TailwindCSS', 'Razorpay'],
    description: 'Ultra-fast luxury fashion e-commerce with headless architecture and sub-800ms page transitions.'
  },
  { 
    id: 'p2', 
    title: 'Grafty WhatsApp AI Engine', 
    image: 'https://api.microlink.io/?url=https%3A%2F%2Fgrafty.pro&screenshot=true&embed=screenshot.url&meta=false',
    url: 'https://grafty.pro',
    category: 'AI Automation',
    techStack: ['Node.js', 'WhatsApp API', 'Fastify', 'PostgreSQL'],
    description: 'Proprietary WhatsApp AI automation engine for business outreach and customer support.'
  },
  { 
    id: 'p3', 
    title: 'Grekam Academy Portal', 
    image: 'https://api.microlink.io/?url=https%3A%2F%2Facademy.grekam.in&screenshot=true&embed=screenshot.url&meta=false',
    url: 'https://academy.grekam.in',
    category: 'EdTech & Learning',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    description: 'Next-generation learning portal for design and software engineering education.'
  },
]

export const BRANDING_PROJECTS: ProjectData[] = [
  { 
    id: 'b1', 
    title: 'Vanguard Identity', 
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    url: 'https://grekam.in',
    category: 'Brand Strategy',
    techStack: ['Visual Identity', 'Typography', '3D Design'],
    description: 'Comprehensive luxury brand identity and digital design guideline system.'
  },
  { 
    id: 'b2', 
    title: 'Zephyr Campaign', 
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
    url: 'https://academy.grekam.in',
    category: 'Visual Design',
    techStack: ['Motion Graphics', 'UI/UX', 'Campaign Assets'],
    description: 'Multi-channel digital marketing assets and high-conversion creative system.'
  },
]

export const CINEMATIC_POSTERS_DATA = [
  { 
    id: "webdesigning", 
    title1: "WEB", 
    title2: "DESIGNING", 
    tag: "UI/UX LAYOUTS", 
    color: "#F97316",
    gradient: "from-orange-500 via-amber-500 to-red-600",
    topTagLeft: "IDEAS INTO DIGITAL REALITY",
    topTagRight: "DESIGN // DEVELOP // LAUNCH",
    growth: "Turns casual visitors into paying customers with high-converting layouts.",
    gets: "Modern mobile-friendly page designs & interactive prototypes.",
    cards: [
      { text: "BRANDS GROW HERE", sub: "Good design builds trust", icon: "fa-solid fa-gem" },
      { text: "BUSINESS BEYOND BORDERS", sub: "Websites that work 24/7", icon: "fa-solid fa-globe" }
    ],
    portalText: "A BIGGER TOMORROW ONLINE",
    bottomTag: "MORE THAN WEBSITES"
  },
  { 
    id: "digital_marketing", 
    title1: "DIGITAL", 
    title2: "MARKETING", 
    tag: "GET BUYERS DAILY", 
    color: "#A3E635",
    gradient: "from-lime-400 via-emerald-400 to-green-500",
    topTagLeft: "BRANDS PEOPLE TALK ABOUT",
    topTagRight: "STRATEGY // CREATIVE // CAMPAIGNS",
    growth: "Brings a continuous stream of new buyers through Google & social ads.",
    gets: "Google SEO ranking setup, ad graphics & monthly growth reports.",
    cards: [
      { text: "PEOPLE DISCOVER BRANDS HERE", sub: "Targeted Ads & SEO", icon: "fa-brands fa-instagram" },
      { text: "STORIES BUILD TRUST", sub: "Communities create opportunities", icon: "fa-brands fa-youtube" }
    ],
    portalText: "IDEAS REACH PEOPLE",
    bottomTag: "MORE THAN MARKETING"
  },
  { 
    id: "webdev", 
    title1: "WEB", 
    title2: "DEVELOPMENT", 
    tag: "FAST WEBSITES", 
    color: "#22D3EE",
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    topTagLeft: "SUB-800MS CODE",
    topTagRight: "NEXT.JS // REACT // TYPESCRIPT",
    growth: "Ultra-fast website loading so visitors never leave due to lag or crashes.",
    gets: "Ready-to-use website, admin access, domain & SSL security.",
    cards: [
      { text: "LIGHTNING FAST LOADING", sub: "99.9% Speed Score", icon: "fa-solid fa-bolt" },
      { text: "ENTERPRISE SCALE", sub: "PostgreSQL & Vercel VPS", icon: "fa-solid fa-server" }
    ],
    portalText: "FUTURE OF SPEED",
    bottomTag: "MORE THAN CODE"
  },
  { 
    id: "web_automation", 
    title1: "WEB", 
    title2: "AUTOMATION", 
    tag: "SAVE HOURS DAILY", 
    color: "#A78BFA",
    gradient: "from-purple-400 via-violet-500 to-indigo-600",
    topTagLeft: "24/7 AUTOPILOT",
    topTagRight: "BOTS // SCRAPING // WORKFLOWS",
    growth: "Replaces tedious manual work with 24/7 automated background tools.",
    gets: "Data extraction tools, automatic lead alerts & workflow tools.",
    cards: [
      { text: "LEAD ALERT BOTS", sub: "Automatic Data Ingestion", icon: "fa-solid fa-robot" },
      { text: "SAVING 20+ HOURS WEEKLY", sub: "Zero Manual Entry Errors", icon: "fa-solid fa-rotate" }
    ],
    portalText: "AUTOMATED EFFICIENCY",
    bottomTag: "MORE THAN BOT SCRIPTS"
  },
  { 
    id: "ecommerce", 
    title1: "ECOMMERCE", 
    title2: "STORES", 
    tag: "SELL ONLINE 24/7", 
    color: "#F59E0B",
    gradient: "from-amber-400 via-orange-400 to-yellow-500",
    topTagLeft: "GLOBAL STOREFRONT",
    topTagRight: "CATALOG // PAYMENTS // ORDERS",
    growth: "Allows customers to browse products, order & pay online 24/7.",
    gets: "Online store, catalog manager, UPI/Card payments & order dashboard.",
    cards: [
      { text: "INSTANT UPI & CARDS", sub: "Razorpay & Stripe Setup", icon: "fa-solid fa-credit-card" },
      { text: "ORDER MANAGEMENT", sub: "Live Order Status Dashboard", icon: "fa-solid fa-bag-shopping" }
    ],
    portalText: "COMMERCE UNBOUND",
    bottomTag: "MORE THAN STORES"
  },
  { 
    id: "crm_erp", 
    title1: "CRM // ERP", 
    title2: "SYSTEMS", 
    tag: "MANAGE SALES", 
    color: "#38BDF8",
    gradient: "from-sky-400 via-blue-500 to-teal-500",
    topTagLeft: "100% CONTROL",
    topTagRight: "PIPELINES // DEALS // REVENUE",
    growth: "Organizes sales leads and customer inquiries so no deal is forgotten.",
    gets: "Custom sales dashboard, lead pipeline board & team roles.",
    cards: [
      { text: "KANBAN SALES BOARD", sub: "Drag & Drop Lead Stages", icon: "fa-solid fa-table-cells-large" },
      { text: "ROLE PERMISSIONS", sub: "Admin, Manager & Staff Roles", icon: "fa-solid fa-users" }
    ],
    portalText: "TOTAL COMMAND",
    bottomTag: "MORE THAN BOARDS"
  },
  { 
    id: "graphic_designing", 
    title1: "GRAPHIC", 
    title2: "DESIGNING", 
    tag: "BRAND IDENTITY", 
    color: "#EC4899",
    gradient: "from-pink-500 via-rose-500 to-purple-600",
    topTagLeft: "VISUAL AUTHORITY",
    topTagRight: "LOGOS // TYPOGRAPHY // ASSETS",
    growth: "Builds instant trust so customers buy from you instead of competitors.",
    gets: "Logos, brand guide, social media templates & banners.",
    cards: [
      { text: "VECTOR LOGO SYSTEM", sub: "Primary & Monogram Marks", icon: "fa-solid fa-palette" },
      { text: "CAMPAIGN ASSETS", sub: "Ad Templates & Banners", icon: "fa-solid fa-layer-group" }
    ],
    portalText: "COMMAND RESPECT",
    bottomTag: "MORE THAN GRAPHICS"
  },
  { 
    id: "whatsapp_automation", 
    title1: "WHATSAPP", 
    title2: "AUTOMATION", 
    tag: "INSTANT CHAT", 
    color: "#22C55E",
    gradient: "from-emerald-400 via-green-500 to-teal-600",
    topTagLeft: "98% OPEN RATE",
    topTagRight: "AUTO CHAT // ALERTS // META API",
    growth: "Answers customer questions instantly on WhatsApp and boosts repeat orders.",
    gets: "Official WhatsApp bot setup, auto-reply chat & message sender.",
    cards: [
      { text: "24/7 AUTO REPLIES", sub: "Zero Waiting Time for Leads", icon: "fa-brands fa-whatsapp" },
      { text: "BROADCAST CAMPAIGNS", sub: "Direct Customer Outreach", icon: "fa-solid fa-paper-plane" }
    ],
    portalText: "CHAT THAT CONVERTS",
    bottomTag: "MORE THAN MESSAGES"
  }
]

export const INITIAL_CARDS: CardData[] = [
  { 
    id: "intro", 
    category: "Services", 
    title: "Complete Digital Services", 
    subtitle: "Everything your business needs to grow: Graphic Design, Website Design, Custom Web Apps, Automation, Online Stores, CRM/ERP Tools, Digital Marketing, and WhatsApp Bots.", 
    iconName: "LayoutGrid", 
    colorHex: "#4ade80", 
    cta: "Explore All Services",
    isServices: true,
    features: [
      "Graphic Designing — Build a premium brand look with logos, banners & visual templates that win customer trust.",
      "Webdesigning — Modern, responsive layouts designed to turn site visitors into paying clients.",
      "Web Development — Fast websites and web apps built to load instantly on any mobile or desktop screen.",
      "Web Automation — Automate repetitive daily work, data collection & lead tracking to save hours every week.",
      "Ecommerce — Launch your online store with product catalogs, instant UPI/card payments & order management.",
      "CRM / ERP — Simple custom dashboards to track sales leads, customer records & team work in one place.",
      "Digital Marketing — Boost Google search ranking (SEO) and run targeted ads to bring in new customers daily.",
      "WhatsApp Automation — Send instant auto-replies, order alerts & marketing messages directly on WhatsApp."
    ],
    deliverables: [
      "Ready-to-Use Website & Source Code Files",
      "Complete Brand Design Package (Logos, Banners & Fonts)",
      "Automated Web Tools & WhatsApp Assistant Setup",
      "Custom Sales & Operations Control Dashboard",
      "Step-by-Step Video Guide & Ongoing Technical Support"
    ],
    techStack: ["Figma", "Next.js", "TypeScript", "Node.js", "WhatsApp API", "PostgreSQL", "SEO Tools"],
    idealFor: "Business Owners, Retailers, E-Commerce Stores & Growing Companies wanting to scale revenue",
    turnaround: "1 to 3 Weeks Delivery Sprint"
  },
  { 
    id: "branding", 
    category: "Identity", 
    title: "Strategic Brand Perception", 
    subtitle: "Aesthetics mean nothing without strategy. We craft high-converting visual identities that establish immediate market authority and customer trust.", 
    iconName: "Palette", 
    colorHex: "#c084fc", 
    cta: "Redefine Your Brand", 
    projects: BRANDING_PROJECTS,
    features: [
      "Brand Strategy & Market Positioning Analysis",
      "Vector Logo System (Primary, Secondary & Monogram)",
      "Custom Color Palettes & Typography Pairings",
      "Figma Design Tokens & UI Component Guidelines",
      "Social Media Campaign Templates & Ad Assets"
    ],
    deliverables: [
      "Master Brand Guidelines Manual (PDF)",
      "Complete Figma Design System Source File",
      "High-Resolution Vector Assets (SVG, EPS, PNG)",
      "Social Media Marketing Asset Pack"
    ],
    techStack: ["Figma", "Adobe Illustrator", "Cinema 4D", "Framer Motion", "Vector Systems"],
    idealFor: "New Venture Launches, Brand Re-designs & D2C Brands",
    turnaround: "10 to 14 Business Days"
  },
  { 
    id: "webdev", 
    category: "Build", 
    title: "Enterprise Commerce & Web Dev", 
    subtitle: "Monolithic platforms slow you down. We build headless, lightning-fast eCommerce platforms and web apps capable of handling infinite scale without bottlenecks.", 
    iconName: "Code2", 
    colorHex: "#22d3ee", 
    cta: "Scale Infrastructure", 
    projects: DUMMY_PROJECTS,
    features: [
      "Custom Next.js 15 App Router & Server Components",
      "Headless E-commerce Engine with Sub-second Transitions",
      "Payment Gateway Link (Razorpay, Stripe, PayPal)",
      "Custom Product Catalog, Search & Filter System",
      "Technical SEO, OpenGraph Meta & Schema Markup"
    ],
    deliverables: [
      "Full Production Source Code (GitHub Repository)",
      "Admin Control Panel for Products & Content",
      "Live VPS / Vercel Server Deployment",
      "Google Analytics & Search Console Setup"
    ],
    techStack: ["Next.js 15", "TypeScript", "TailwindCSS", "Prisma ORM", "Razorpay", "PostgreSQL"],
    idealFor: "D2C Brands, Retailers & High-Traffic Corporate Portals",
    turnaround: "14 to 21 Days Production Sprint"
  },
  { 
    id: "pricing", 
    category: "Investment", 
    title: "Pricing & Packages", 
    subtitle: "Transparent tiers for websites, e-commerce, custom web apps, and interactive add-on estimate calculations.", 
    iconName: "IndianRupee", 
    colorHex: "#10b981", 
    cta: "Calculate Quote", 
    isPricing: true 
  },
  { 
    id: "crm", 
    category: "Systems", 
    title: "Bespoke CRM Operations", 
    subtitle: "Stop forcing your team into generic tools. We build custom CRM platforms tailored to the exact operational workflows of your business.", 
    iconName: "Fingerprint", 
    colorHex: "#fbbf24", 
    cta: "Enter CRM Dashboard", 
    isCrm: true,
    features: [
      "Automated Lead Capture & Multi-Source Ingestion",
      "Interactive Drag-and-Drop Sales Pipeline (Kanban)",
      "Automated WhatsApp & Email Customer Triggers",
      "Role-Based Access Control (Admin, Manager, Agent)",
      "Real-Time Revenue Analytics & Forecasting Charts"
    ],
    deliverables: [
      "Custom CRM Web Portal & Dashboard",
      "Configured User Roles & Access Permissions",
      "Webhook Integrations with Website Leads",
      "Team Onboarding & Video Documentation"
    ],
    techStack: ["React", "TypeScript", "Fastify", "PostgreSQL", "Prisma", "TailwindCSS"],
    idealFor: "Sales Teams, Real Estate Agencies, Service Firms & B2B Operations",
    turnaround: "3 to 5 Weeks Engagement"
  },
  { 
    id: "hrm", 
    category: "People", 
    title: "HRM & Talent Operations", 
    subtitle: "Scale your workforce seamlessly. Manage payroll, attendance, leave approvals, and recruitment through a centralized human resource portal.", 
    iconName: "Users", 
    colorHex: "#10b981", 
    cta: "Enter HR Dashboard", 
    isHrm: true,
    features: [
      "Centralized Employee Directory & Confidential Records",
      "Automated Attendance & Leave Request Workflows",
      "Automated Payroll Engine with Tax Calculations & PDF Payslips",
      "Applicant Tracking System (ATS) for Hiring Pipelines",
      "Performance Appraisal & Goal Tracking Modules"
    ],
    deliverables: [
      "Enterprise HR Control Dashboard",
      "Employee Self-Service Portal",
      "Automated PDF Payslip Generator",
      "Workforce Analytics & Exportable Reports"
    ],
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Prisma", "PDF Generation", "TailwindCSS"],
    idealFor: "Growing Companies (10 to 500 Employees) & Multi-Branch Franchises",
    turnaround: "3 to 4 Weeks Build"
  },
  { 
    id: "grafty", 
    category: "Proprietary Tech", 
    title: "The Grafty Advantage (WhatsApp Tech)", 
    subtitle: "Leverage our proprietary Meta WhatsApp Business API engine. Automate customer support, scale outreach campaigns, and connect where customers live.", 
    iconName: "Rocket", 
    colorHex: "#f43f5e", 
    cta: "Deploy Grafty", 
    projects: [{ id: 'g1', title: 'Grafty Integration Demo', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80' }],
    features: [
      "Official Meta WhatsApp Cloud API Integration",
      "Visual Chatbot Flow & Automated Lead Screener",
      "Bulk Broadcast Campaigns with Delivery Tracking",
      "Automated Order Updates & Invoice Alerts via WhatsApp",
      "Multi-Agent Shared Customer Support Inbox"
    ],
    deliverables: [
      "Verified WhatsApp Business API Integration",
      "Dedicated Webhook Receiver Server Instance",
      "Custom Chatbot Workflows & Template Approvals",
      "Multi-Agent Support Portal"
    ],
    techStack: ["WhatsApp Cloud API", "Node.js", "Fastify", "PostgreSQL", "Redis", "Webhooks"],
    idealFor: "D2C Stores, E-commerce Brands, Lead-Gen Companies & Support Teams",
    turnaround: "7 to 10 Days Deployment"
  },
  { 
    id: "ecosystem", 
    category: "Partnership", 
    title: "Fractional CTO & Strategic Advisory", 
    subtitle: "We don't do one-off projects. We act as your dedicated technical and creative leadership team, guiding digital strategy from inception to enterprise scale.", 
    iconName: "Users", 
    colorHex: "#6366f1", 
    cta: "Request Strategic Audit",
    features: [
      "System Architecture Audits & Code Health Reviews",
      "Tech Stack Selection & Cloud Infrastructure Cost Optimization",
      "Weekly Engineering Sprints & Delivery Sprint Oversight",
      "Security Audits, Compliance & Backup Disaster Recovery",
      "Technical Hiring & Engineering Mentorship"
    ],
    deliverables: [
      "Quarterly Strategic Technical Roadmap",
      "Weekly CTO Advisory & Sprint Syncs",
      "Continuous Codebase & Security Audits",
      "Priority 24/7 Technical SLA Support"
    ],
    techStack: ["AWS", "Docker", "Kubernetes", "Next.js", "PostgreSQL", "CI/CD"],
    idealFor: "Funded Startups, Non-Tech Founders & High-Growth Companies",
    turnaround: "Monthly Retainer / Ongoing Strategic Partnership"
  },
  { id: "contact_form", category: "Secure Link", title: "Initiate Project", subtitle: "Ready to overhaul your digital infrastructure? Submit a technical brief and our lead architects will review your operational requirements.", iconName: "Send", colorHex: "#a78bfa", cta: "Submit Brief", isContactForm: true },
  { id: "products", category: "Our Arsenal", title: "Products & Tools", subtitle: "We build powerful platforms that redefine industry standards. Explore our suite of tools.", iconName: "Layers", colorHex: "#f43f5e", cta: "Explore Products", isProducts: true },
  { id: "portfolio", category: "Exhibition", title: "Creative Portfolio", subtitle: "A glimpse into our meticulously crafted digital experiences.", iconName: "Image", colorHex: "#3b82f6", cta: "View Portfolio", isPortfolio: true },
  { id: "academy", category: "Education", title: "Grekam Academy", subtitle: "Master the art of software engineering and design with our elite programs.", iconName: "GraduationCap", colorHex: "#eab308", cta: "Join Academy", isAcademy: true },
  { 
    id: "legal", 
    category: "Legal & Guarantees", 
    title: "Client Policies & Direct Links", 
    subtitle: "Simple, transparent agreements: Terms of Service, Privacy Policy, Payment & Refund terms, Delivery guarantees, and Full Ownership rights.", 
    iconName: "Scale", 
    colorHex: "#38bdf8", 
    cta: "View All Legal Links", 
    isLegal: true,
    features: [
      "Terms & Conditions — Fair, clear service agreements that protect your business rights.",
      "Privacy Policy — Your customer data and business info remain 100% private and secure.",
      "Payment & Billing — Transparent milestone payments with zero hidden fees or unexpected costs.",
      "Cancellation & Refunds — Clear quality guarantees and fair refund policies.",
      "Service Delivery — Agreed schedules so your project launches on time.",
      "Revision & Scope — Flexible revision steps to make sure you love the final result.",
      "Intellectual Property — You own 100% of your code, designs, and domain files upon delivery.",
      "Maintenance & Support — Continuous support and technical assistance whenever you need help.",
      "Data Deletion Instructions — Easy options to manage or erase stored data anytime."
    ],
    deliverables: [
      "Clear Written Service Agreement & Scope Guarantee",
      "Full Copyright & Code Ownership Handover",
      "Written Privacy Protection & SLA Guarantee"
    ],
    techStack: ["Legal Security", "Privacy Protection", "SLA Guarantees", "Full IP Transfer"],
    idealFor: "Clients, Business Partners, Investors & Legal Compliance",
    turnaround: "Instant 24/7 Access"
  },
]
