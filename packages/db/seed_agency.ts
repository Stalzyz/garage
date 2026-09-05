import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DUMMY_PROJECTS = [
  { id: 'p1', title: 'Aura SaaS Platform', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80' },
  { id: 'p2', title: 'Lumina Dashboard', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  { id: 'p3', title: 'Nexus Mobile App', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80' },
]

const BRANDING_PROJECTS = [
  { id: 'b1', title: 'Vanguard Identity', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80' },
  { id: 'b2', title: 'Zephyr Campaign', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80' },
]

const INITIAL_CARDS = [
  { 
    id: "graphic_design", 
    category: "Design Services", 
    title: "Graphic Designing", 
    subtitle: "Eye-catching visual designs, logo branding, social media graphics, brochures, and marketing collateral tailored to elevate your brand.", 
    iconName: "Palette", 
    colorHex: "#c084fc", 
    cta: "Begin Graphic Design Project", 
    features: [
      "Custom Logo Design & Vector Brand Identity",
      "Social Media Creatives & Ad Banners",
      "Brochures, Flyers, Posters & Print Media",
      "Business Cards, Letterheads & Brand Stationery",
      "High-Resolution Print-Ready & Digital Assets"
    ],
    deliverables: [
      "Source Vector Files (AI, SVG, EPS)",
      "High-Res PNG, JPEG & Print PDF",
      "Editable Canva & Figma Templates",
      "Brand Usage & Font Guidelines"
    ],
    techStack: ["Figma", "Adobe Illustrator", "Photoshop", "Canva Pro"],
    idealFor: "Startups, Re-brands, E-commerce Stores & Local Businesses",
    turnaround: "2 to 5 Business Days"
  },
  { 
    id: "uiux_design", 
    category: "User Experience", 
    title: "UI/UX Design", 
    subtitle: "Intuitive, accessible, and high-converting user interfaces and wireframes for mobile apps and web platforms.", 
    iconName: "Fingerprint", 
    colorHex: "#38bdf8", 
    cta: "Begin UI/UX Project", 
    features: [
      "User Research & Wireframing Architecture",
      "High-Fidelity UI Design & Clickable Prototypes",
      "Mobile App (iOS & Android) & Web Interfaces",
      "Design Systems, Component Libraries & Design Tokens",
      "Developer-Ready Inspection & Handoff Specs"
    ],
    deliverables: [
      "Interactive Figma Prototype",
      "Complete Design System & Components",
      "Developer Assets & Typography Tokens",
      "User Journey Maps & Wireframes"
    ],
    techStack: ["Figma", "Adobe XD", "Framer", "FigJam", "Principle"],
    idealFor: "Mobile Apps, SaaS Startups, Web Portals & Product Teams",
    turnaround: "1 to 2 Weeks Sprint"
  },
  { 
    id: "web_design", 
    category: "Visual Web", 
    title: "Web Designing", 
    subtitle: "Modern, responsive, and aesthetically stunning website designs engineered to engage visitors and drive conversions.", 
    iconName: "Layout", 
    colorHex: "#f472b6", 
    cta: "Begin Web Design Project", 
    features: [
      "Custom Landing Page & Multi-Page Web Layouts",
      "Fully Responsive Desktop, Tablet & Mobile Breakpoints",
      "Interactive Micro-Animations & Scroll Dynamics",
      "SEO & Conversion-Rate Optimized Layouts",
      "Custom Visual Icons & Graphics Integration"
    ],
    deliverables: [
      "Full Website Design in Figma",
      "Responsive UI Assets & Graphics",
      "Style Guide & Color Palette",
      "Clickable Design Prototype"
    ],
    techStack: ["Figma", "Adobe Photoshop", "Framer", "HTML5/CSS3"],
    idealFor: "Agencies, Corporate Portals, Professional Services & Portfolios",
    turnaround: "5 to 10 Business Days"
  },
  { 
    id: "web_dev", 
    category: "Web Engineering", 
    title: "Web Development", 
    subtitle: "Fast, secure, and responsive custom websites and web applications built with modern frontend & backend technologies.", 
    iconName: "Code2", 
    colorHex: "#22d3ee", 
    cta: "Begin Web Dev Project", 
    projects: DUMMY_PROJECTS,
    features: [
      "Next.js 15 & React Production Web Apps",
      "Lightning-Fast Sub-Second Page Load Speeds",
      "Dynamic Admin CMS & Content Management",
      "Technical SEO, Schema Tags & Social Cards",
      "Domain Setup, SSL Security & Cloud Hosting Deployment"
    ],
    deliverables: [
      "Full Production Source Code (GitHub)",
      "Admin Dashboard for Content & Leads",
      "Live Domain & SSL Deployment",
      "Speed & SEO Audit Report"
    ],
    techStack: ["Next.js 15", "TypeScript", "TailwindCSS", "Node.js", "PostgreSQL"],
    idealFor: "Businesses, High-Traffic Corporate Portals, Tech Companies",
    turnaround: "1 to 3 Weeks Production"
  },
  { 
    id: "digital_marketing", 
    category: "Growth & Reach", 
    title: "Digital Marketing", 
    subtitle: "Result-driven digital marketing, Meta & Google ad campaigns, SEO growth, and social media management to boost sales.", 
    iconName: "TrendingUp", 
    colorHex: "#f59e0b", 
    cta: "Begin Digital Marketing", 
    features: [
      "Meta Ads (Facebook & Instagram) & Google Search/Display Ads",
      "Search Engine Optimization (SEO) & Technical Audits",
      "Social Media Content Strategy & Account Management",
      "Lead Capture & High-Converting Landing Pages",
      "Real-Time Performance Analytics & Weekly ROI Reports"
    ],
    deliverables: [
      "Configured Ad Accounts & Conversion Pixels",
      "Ad Copies, Video & Image Creatives",
      "Target Audience & Keyword Research Strategy",
      "Weekly Growth & Performance Dashboard"
    ],
    techStack: ["Meta Ads Manager", "Google Ads", "GA4", "Semrush", "WhatsApp API"],
    idealFor: "E-commerce Stores, D2C Brands, Real Estate & Service Firms",
    turnaround: "Rapid Campaign Launch in 48 Hours"
  },
  { 
    id: "ecommerce", 
    category: "Online Store", 
    title: "Ecommerce Web Development", 
    subtitle: "Complete online store solutions with fast product catalogues, secure payment gateways, cart systems, and order tracking.", 
    iconName: "ShoppingBag", 
    colorHex: "#10b981", 
    cta: "Begin Ecommerce Project", 
    projects: DUMMY_PROJECTS,
    features: [
      "Custom Fast Product Catalogue, Search & Instant Filters",
      "Seamless Shopping Cart & One-Click Checkout Flow",
      "Integrated Payment Gateways (Razorpay, Stripe, UPI)",
      "Admin Order Management, Invoices & Inventory Tracking",
      "Automated Order Updates & Shipping Notifications"
    ],
    deliverables: [
      "Complete Ecommerce Web Store",
      "Admin Management Control Panel",
      "Payment & WhatsApp Notification Integration",
      "Product Upload & Inventory Setup"
    ],
    techStack: ["Next.js", "React", "Razorpay", "Stripe", "Node.js", "PostgreSQL"],
    idealFor: "Retail Brands, D2C Apparel, Online Stores, Wholesalers",
    turnaround: "2 to 3 Weeks Build"
  },
  { 
    id: "crm_erp", 
    category: "Business Systems", 
    title: "CRM / ERP Development", 
    subtitle: "Custom CRM and ERP platforms tailored to automate your business sales pipelines, employee operations, inventory, and analytics.", 
    iconName: "Layers", 
    colorHex: "#8b5cf6", 
    cta: "Begin CRM / ERP Project", 
    isCrm: true,
    features: [
      "Drag-and-Drop Lead Management Kanban Pipeline",
      "Automated WhatsApp & Email Customer Reminders",
      "Employee HR, Attendance & Automated Payroll Portal",
      "Inventory Stock & Invoicing Tracking Systems",
      "Multi-Role Access Control (Admin, Manager, Staff)"
    ],
    deliverables: [
      "Bespoke Web CRM & ERP Dashboard",
      "Configured User Roles & Permissions",
      "Website & Lead Source Webhook Integration",
      "Complete Team Onboarding & Documentation"
    ],
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "TailwindCSS"],
    idealFor: "Growing Businesses, Multi-Branch Operations, Real Estate & Services",
    turnaround: "3 to 5 Weeks Engagement"
  },
  { 
    id: "custom_app", 
    category: "Custom Software", 
    title: "Custom App Development", 
    subtitle: "Bespoke mobile (iOS & Android) and cloud web applications engineered from scratch to solve your unique business needs.", 
    iconName: "Rocket", 
    colorHex: "#ec4899", 
    cta: "Begin Custom App Project", 
    features: [
      "Cross-Platform Mobile Apps (iOS & Android)",
      "Scalable Backend API Infrastructure & Cloud Databases",
      "Real-Time Push Notifications, Chat & Live Tracking",
      "User Authentication, Security Hardening & Encryption",
      "App Store & Google Play Store Publishing Support"
    ],
    deliverables: [
      "Production iOS & Android App Builds (APK & IPA)",
      "Full Cloud Backend API Server Source Code",
      "Admin Management Control Panel",
      "Store Submission & Deployment Support"
    ],
    techStack: ["React Native", "Flutter", "Next.js", "Node.js", "PostgreSQL", "AWS"],
    idealFor: "Tech Startups, On-Demand Platforms, SaaS Products & Enterprises",
    turnaround: "3 to 6 Weeks Sprint"
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
  { id: "contact_form", category: "Secure Link", title: "Initiate Project", subtitle: "Ready to overhaul your digital infrastructure? Submit a technical brief and our lead architects will review your operational requirements.", iconName: "Send", colorHex: "#a78bfa", cta: "Submit Brief", isContactForm: true },
  { id: "portfolio", category: "Exhibition", title: "Creative Portfolio", subtitle: "A glimpse into our meticulously crafted digital experiences.", iconName: "Image", colorHex: "#3b82f6", cta: "View Portfolio", isPortfolio: true },
  { id: "academy", category: "Education", title: "Grekam Academy", subtitle: "Master the art of software engineering and design with our elite programs.", iconName: "GraduationCap", colorHex: "#eab308", cta: "Join Academy", isAcademy: true },
  { id: "policies", category: "Legal & Governance", title: "Policies & Terms", subtitle: "Access official terms of service, privacy policy, payment terms, refund rules, and service delivery guidelines.", iconName: "Shield", colorHex: "#38bdf8", cta: "View All Policies", isPolicies: true },
]

async function main() {
  console.log('Upserting Agency data...')
  const page = await prisma.landingPage.upsert({
    where: { slug: 'agency' },
    update: {},
    create: {
      title: 'Agency Homepage',
      slug: 'agency',
      isActive: true,
      description: 'The main agency homepage content',
    }
  })

  // Delete existing sections
  await prisma.pageSection.deleteMany({
    where: { landingPageId: page.id }
  })

  // Create a section with the JSON data
  await prisma.pageSection.create({
    data: {
      landingPageId: page.id,
      sectionId: 'agency-main-data',
      sortOrder: 1,
      content: INITIAL_CARDS,
    }
  })
  
  console.log('Agency data seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
