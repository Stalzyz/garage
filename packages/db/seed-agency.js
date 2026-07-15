const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const INITIAL_CARDS = [
  {
    id: 'branding',
    category: '01. Identity',
    title: 'Identity & Branding',
    subtitle: 'We craft magnetic brand identities that command attention. From striking logos to comprehensive design systems, we build the foundation of your digital presence.',
    iconName: 'Sparkles',
    colorHex: '#3b82f6', // blue
    cta: 'View Branding Work',
    projects: []
  },
  {
    id: 'webdev',
    category: '02. Build',
    title: 'Web & App Development',
    subtitle: 'High-performance, scalable web applications built with Next.js, React, and modern backend architectures. We turn complex requirements into elegant solutions.',
    iconName: 'Code2',
    colorHex: '#8b5cf6', // purple
    cta: 'Explore Our Tech',
    projects: []
  },
  {
    id: 'marketing',
    category: '03. Growth',
    title: 'Performance Marketing',
    subtitle: 'Data-driven campaigns designed for maximum ROI. We leverage advanced analytics and creative precision to scale your customer acquisition.',
    iconName: 'Rocket',
    colorHex: '#ef4444', // red
    cta: 'Scale Your Business',
  },
  {
    id: 'content',
    category: '04. Content',
    title: 'Content & Strategy',
    subtitle: 'Compelling narratives that resonate with your audience. Our content strategies drive engagement and establish your authority in the market.',
    iconName: 'Palette',
    colorHex: '#f59e0b', // amber
    cta: 'See Our Content',
  },
  {
    id: 'security',
    category: '05. Security',
    title: 'Cybersecurity & Audits',
    subtitle: 'Enterprise-grade security implementations. We protect your digital assets with comprehensive audits, penetration testing, and robust defense systems.',
    iconName: 'Fingerprint',
    colorHex: '#10b981', // emerald
    cta: 'Secure Your Apps',
  },
  {
    id: 'consulting',
    category: '06. Advisory',
    title: 'Tech Consulting',
    subtitle: 'Strategic technical guidance for CTOs and founders. We help you navigate complex architectural decisions and optimize your engineering operations.',
    iconName: 'Users',
    colorHex: '#ec4899', // pink
    cta: 'Book a Consultation',
  },
  {
    id: 'contact_form',
    category: 'Get in touch',
    title: 'Start a Project',
    subtitle: 'Ready to build something extraordinary? Drop your details below and our team will get back to you within 24 hours.',
    iconName: 'Send',
    colorHex: '#ffffff',
    cta: 'Submit Request',
    isContactForm: true
  },
  {
    id: 'products',
    category: 'Software',
    title: 'Our Products',
    subtitle: 'We also build our own software products. Check out our suite of tools designed to help agencies and creators scale.',
    iconName: 'Code2',
    colorHex: '#3b82f6',
    cta: 'View Products',
    isProducts: true
  },
  {
    id: 'portfolio',
    category: 'Work',
    title: 'Our Portfolio',
    subtitle: 'A selection of our best work across various industries.',
    iconName: 'Palette',
    colorHex: '#8b5cf6',
    cta: 'View All Work',
    isPortfolio: true
  },
  {
    id: 'academy',
    category: 'Learn',
    title: 'Grekam Academy',
    subtitle: 'Level up your skills with our industry-leading courses in development, design, and marketing.',
    iconName: 'Rocket',
    colorHex: '#ef4444',
    cta: 'Explore Academy',
    isAcademy: true
  }
];

  let page = await prisma.landingPage.findUnique({
    where: { slug: 'agency' },
    include: { sections: true }
  });

  if (!page) {
    page = await prisma.landingPage.create({
      data: {
        slug: 'agency',
        title: 'Agency Homepage',
        description: 'Main landing page for the Agency side',
        isActive: true,
        sections: {
          create: {
            sectionId: 'agency-main-data',
            content: INITIAL_CARDS
          }
        }
      }
    });
    console.log("Created missing landing page and section.");
  } else {
    const section = page.sections.find(s => s.sectionId === 'agency-main-data');
    if (!section) {
      await prisma.pageSection.create({
        data: {
          landingPageId: page.id,
          sectionId: 'agency-main-data',
          content: INITIAL_CARDS
        }
      });
      console.log("Created missing section agency-main-data.");
    } else {
      console.log("Already exists.");
    }
  }
}
main().catch(console.error);
