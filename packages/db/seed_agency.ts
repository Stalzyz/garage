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
  { id: "intro", category: "Manifesto", title: "The Digital Ecosystem", subtitle: "We don't just build software. We engineer scalable architectures and strategic brand identities that dominate markets.", iconName: "Sparkles", colorHex: "#4ade80", cta: "Enter the Ecosystem" },
  { id: "branding", category: "Identity", title: "Strategic Brand Perception", subtitle: "Aesthetics mean nothing without strategy. We craft high-converting visual identities that establish immediate market authority and trust.", iconName: "Palette", colorHex: "#c084fc", cta: "Redefine Your Brand", projects: BRANDING_PROJECTS },
  { id: "webdev", category: "Build", title: "Enterprise Commerce", subtitle: "Monolithic platforms slow you down. We build headless, lightning-fast eCommerce engines capable of handling infinite scale without bottlenecks.", iconName: "Code2", colorHex: "#22d3ee", cta: "Scale Infrastructure", projects: DUMMY_PROJECTS },
  { id: "crm", category: "Systems", title: "Bespoke CRM Operations", subtitle: "Stop forcing your team into generic software. We develop custom CRM platforms tailored to the exact neuro-pathways of your business operations.", iconName: "Fingerprint", colorHex: "#fbbf24", cta: "Enter CRM Dashboard", isCrm: true },
  { id: "hrm", category: "People", title: "HRM & Talent", subtitle: "Scale your workforce seamlessly. Manage payroll, attendance, and recruitment through our centralized human resource management system.", iconName: "Users", colorHex: "#10b981", cta: "Enter HR Dashboard", isHrm: true },
  { id: "grafty", category: "Proprietary Tech", title: "The Grafty Advantage", subtitle: "Leverage our proprietary WhatsApp Business API integration. Automate your support, scale your outreach, and connect exactly where your customers already live.", iconName: "Rocket", colorHex: "#f43f5e", cta: "Deploy Grafty", projects: [{ id: 'g1', title: 'Grafty Integration Demo', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80' }] },
  { id: "ecosystem", category: "Partnership", title: "Fractional CTO & Creative", subtitle: "We don't do one-off projects. We act as your dedicated technical and creative partners, guiding your digital strategy from inception to enterprise scale.", iconName: "Users", colorHex: "#6366f1", cta: "Request Strategic Audit" },
  { id: "contact_form", category: "Secure Link", title: "Initiate Project", subtitle: "Ready to overhaul your digital infrastructure? Submit a technical brief and our lead architects will review your operational requirements.", iconName: "Send", colorHex: "#a78bfa", cta: "Submit Brief", isContactForm: true },
  { id: "products", category: "Our Arsenal", title: "Products & Tools", subtitle: "We build powerful platforms that redefine industry standards. Explore our suite of tools.", iconName: "Layers", colorHex: "#f43f5e", cta: "Explore Products", isProducts: true },
  { id: "portfolio", category: "Exhibition", title: "Creative Portfolio", subtitle: "A glimpse into our meticulously crafted digital experiences.", iconName: "Image", colorHex: "#3b82f6", cta: "View Portfolio", isPortfolio: true },
  { id: "academy", category: "Education", title: "Grekam Academy", subtitle: "Master the art of software engineering and design with our elite programs.", iconName: "GraduationCap", colorHex: "#eab308", cta: "Join Academy", isAcademy: true },
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
