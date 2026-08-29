import { prisma } from "../apps/web/src/lib/prisma"

const AGENCY_CARDS = [
  {
    id: "intro",
    category: "01 // MANIFESTO",
    title: "Engineering Scalable Digital Ecosystems",
    subtitle: "We don't just build websites. We architect high-converting digital infrastructure, bespoke enterprise SaaS, and uncompromising brand identities that dominate competitive markets.",
    iconName: "Zap",
    colorHex: "#4ade80",
    cta: "Explore Ecosystem",
  },
  {
    id: "services",
    category: "02 // EXPERTISE",
    title: "Full-Spectrum Digital Engineering",
    subtitle: "End-to-end capabilities: High-Performance Next.js Web Platforms, AI Automation Systems, Custom ERP/CRM Solutions, and Precision UI/UX Design Systems.",
    iconName: "Layers",
    colorHex: "#c084fc",
    cta: "Our Capabilities",
  },
  {
    id: "portfolio",
    category: "03 // SELECTED WORKS",
    title: "Live Interactive Showcase",
    subtitle: "Interact with our live client platforms directly in real-time viewports across MacBook, iPad, and iPhone frames.",
    iconName: "Monitor",
    colorHex: "#3b82f6",
    cta: "Launch Live Demos",
    isPortfolio: true,
    projects: [
      {
        id: "p1",
        title: "Raaghas Luxury E-Commerce",
        url: "https://www.raaghas.in",
        category: "Headless E-Commerce",
        techStack: ["Next.js", "Node.js", "Razorpay", "TailwindCSS"],
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
      },
      {
        id: "p2",
        title: "Grafty AI Automation",
        url: "https://grafty.pro",
        category: "Enterprise WhatsApp AI",
        techStack: ["FastAPI", "PostgreSQL", "WhatsApp Cloud API"],
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"
      },
      {
        id: "p3",
        title: "Grekam FM Studio",
        url: "https://fm.grekam.in",
        category: "Interactive Audio Streaming",
        techStack: ["WebAudio API", "React", "Cloudflare R2"],
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
      }
    ]
  },
  {
    id: "products",
    category: "04 // OUR ARSENAL",
    title: "Proprietary Software & Tools",
    subtitle: "Beyond client builds, we engineer enterprise software platforms that eliminate operational friction and automate 90% of manual workflows.",
    iconName: "Package",
    colorHex: "#f43f5e",
    cta: "Explore Platforms",
    isProducts: true
  },
  {
    id: "pricing",
    category: "05 // INVESTMENT",
    title: "Predictable Engagement Models",
    subtitle: "Transparent pricing tailored for startups, scaling brands, and established enterprises. Rapid 2-week turnarounds, dedicated retainers, and enterprise SLAs.",
    iconName: "IndianRupee",
    colorHex: "#eab308",
    cta: "View Pricing Plans",
    isPricing: true
  },
  {
    id: "contact_form",
    category: "06 // SECURE LINK",
    title: "Initiate Your Next Build",
    subtitle: "Ready to overhaul your digital infrastructure or launch a breakthrough product? Submit your brief and receive an architectural roadmap within 24 hours.",
    iconName: "Send",
    colorHex: "#a78bfa",
    cta: "Submit Project Brief",
    isContactForm: true
  }
]

async function main() {
  const page = await prisma.landingPage.upsert({
    where: { slug: 'agency' },
    create: {
      slug: 'agency',
      title: 'Grekam Agency',
      isActive: true,
    },
    update: {
      title: 'Grekam Agency',
      isActive: true,
    }
  })

  const section = await prisma.pageSection.findFirst({
    where: { landingPageId: page.id, sectionId: 'agency-main-data' }
  })

  if (section) {
    await prisma.pageSection.update({
      where: { id: section.id },
      data: { content: AGENCY_CARDS }
    })
  } else {
    await prisma.pageSection.create({
      data: {
        landingPageId: page.id,
        sectionId: 'agency-main-data',
        content: AGENCY_CARDS,
        sortOrder: 0
      }
    })
  }

  console.log("Successfully seeded 6 agency cards into database!")
}

main().finally(() => prisma.$disconnect())
