import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  {
    title: 'MODULE 1: Introduction to Web Design & WordPress',
    lessons: [
      { title: '1. What is a Website?', type: LessonType.VIDEO },
      { title: '2. Static vs Dynamic Websites', type: LessonType.VIDEO },
      { title: '3. How the Internet Works', type: LessonType.VIDEO },
      { title: '4. Domain Names', type: LessonType.VIDEO },
      { title: '5. Web Hosting', type: LessonType.VIDEO },
      { title: '6. DNS Basics', type: LessonType.VIDEO },
      { title: '7. HTTP & HTTPS', type: LessonType.VIDEO },
      { title: '8. SSL Certificates', type: LessonType.VIDEO },
      { title: '9. Website Architecture', type: LessonType.VIDEO },
      { title: '10. Introduction to WordPress', type: LessonType.VIDEO },
      { title: 'Practical: Register a domain & Connect a domain to hosting', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 2: Hosting & Server Management',
    lessons: [
      { title: '11. Choosing the Right Hosting', type: LessonType.VIDEO },
      { title: '12. Shared Hosting', type: LessonType.VIDEO },
      { title: '13. VPS & Cloud Hosting', type: LessonType.VIDEO },
      { title: '14. cPanel Basics', type: LessonType.VIDEO },
      { title: '15. File Manager', type: LessonType.VIDEO },
      { title: '16. FTP & SFTP', type: LessonType.VIDEO },
      { title: '17. phpMyAdmin', type: LessonType.VIDEO },
      { title: '18. Email Accounts', type: LessonType.VIDEO },
      { title: '19. Database Management', type: LessonType.VIDEO },
      { title: '20. Backup & Restore', type: LessonType.VIDEO },
      { title: 'Assignment: Set up a live hosting environment', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 3: WordPress Installation & Configuration',
    lessons: [
      { title: '21. Manual Installation', type: LessonType.VIDEO },
      { title: '22. One-Click Installation', type: LessonType.VIDEO },
      { title: '23. Dashboard Overview', type: LessonType.VIDEO },
      { title: '24. General Settings', type: LessonType.VIDEO },
      { title: '25. Permalinks', type: LessonType.VIDEO },
      { title: '26. User Roles', type: LessonType.VIDEO },
      { title: '27. Media Library', type: LessonType.VIDEO },
      { title: '28. Categories & Tags', type: LessonType.VIDEO },
      { title: '29. Menus', type: LessonType.VIDEO },
      { title: '30. Widgets', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 4: Themes & Customization',
    lessons: [
      { title: '31. WordPress Theme Structure', type: LessonType.VIDEO },
      { title: '32. Installing Themes', type: LessonType.VIDEO },
      { title: '33. Customizing Themes', type: LessonType.VIDEO },
      { title: '34. Theme Builder Concepts', type: LessonType.VIDEO },
      { title: '35. Header Design', type: LessonType.VIDEO },
      { title: '36. Footer Design', type: LessonType.VIDEO },
      { title: '37. Global Styles', type: LessonType.VIDEO },
      { title: '38. Custom Fonts', type: LessonType.VIDEO },
      { title: '39. Theme Options', type: LessonType.VIDEO },
      { title: '40. Child Themes', type: LessonType.VIDEO },
      { title: 'Project: Customize a business website theme', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 5: Elementor Website Builder',
    lessons: [
      { title: '41. Elementor Interface', type: LessonType.VIDEO },
      { title: '42. Containers & Flexbox', type: LessonType.VIDEO },
      { title: '43. Sections & Columns', type: LessonType.VIDEO },
      { title: '44. Responsive Layouts', type: LessonType.VIDEO },
      { title: '45. Widgets', type: LessonType.VIDEO },
      { title: '46. Templates', type: LessonType.VIDEO },
      { title: '47. Theme Builder', type: LessonType.VIDEO },
      { title: '48. Popups', type: LessonType.VIDEO },
      { title: '49. Forms', type: LessonType.VIDEO },
      { title: '50. Dynamic Content', type: LessonType.VIDEO },
      { title: 'Project: Create a multi-page corporate website', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 6: Website Design Principles',
    lessons: [
      { title: '51. UX for Websites', type: LessonType.VIDEO },
      { title: '52. Layout & Grids', type: LessonType.VIDEO },
      { title: '53. Typography', type: LessonType.VIDEO },
      { title: '54. Color Systems', type: LessonType.VIDEO },
      { title: '55. Visual Hierarchy', type: LessonType.VIDEO },
      { title: '56. Icons & Graphics', type: LessonType.VIDEO },
      { title: '57. Call-to-Action Design', type: LessonType.VIDEO },
      { title: '58. Mobile-First Design', type: LessonType.VIDEO },
      { title: '59. Accessibility', type: LessonType.VIDEO },
      { title: '60. Landing Page Design', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 7: Essential Plugins',
    lessons: [
      { title: '61. Plugin Management', type: LessonType.VIDEO },
      { title: '62. Contact Forms', type: LessonType.VIDEO },
      { title: '63. Security Plugins', type: LessonType.VIDEO },
      { title: '64. Backup Plugins', type: LessonType.VIDEO },
      { title: '65. SEO Plugins', type: LessonType.VIDEO },
      { title: '66. Cache Plugins', type: LessonType.VIDEO },
      { title: '67. Image Optimization', type: LessonType.VIDEO },
      { title: '68. Analytics Plugins', type: LessonType.VIDEO },
      { title: '69. SMTP Email Setup', type: LessonType.VIDEO },
      { title: '70. Maintenance Mode', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 8: WooCommerce Development',
    lessons: [
      { title: '71. WooCommerce Installation', type: LessonType.VIDEO },
      { title: '72. Store Settings', type: LessonType.VIDEO },
      { title: '73. Product Management', type: LessonType.VIDEO },
      { title: '74. Product Categories', type: LessonType.VIDEO },
      { title: '75. Variable Products', type: LessonType.VIDEO },
      { title: '76. Digital Products', type: LessonType.VIDEO },
      { title: '77. Inventory Management', type: LessonType.VIDEO },
      { title: '78. Coupons & Discounts', type: LessonType.VIDEO },
      { title: '79. Taxes & GST', type: LessonType.VIDEO },
      { title: '80. Shipping Zones', type: LessonType.VIDEO },
      { title: '81. Payment Gateways', type: LessonType.VIDEO },
      { title: '82. Order Management', type: LessonType.VIDEO },
      { title: 'Project: Build a complete online store', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 9: Payment Gateway Integration',
    lessons: [
      { title: '83. Razorpay Integration', type: LessonType.VIDEO },
      { title: '84. Stripe Integration', type: LessonType.VIDEO },
      { title: '85. PayPal Integration', type: LessonType.VIDEO },
      { title: '86. UPI Payments', type: LessonType.VIDEO },
      { title: '87. COD Setup', type: LessonType.VIDEO },
      { title: '88. Subscription Payments', type: LessonType.VIDEO },
      { title: '89. Payment Security', type: LessonType.VIDEO },
      { title: '90. Refund Workflow', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 10: Forms & Lead Generation',
    lessons: [
      { title: '91. Contact Forms', type: LessonType.VIDEO },
      { title: '92. Multi-Step Forms', type: LessonType.VIDEO },
      { title: '93. Quote Request Forms', type: LessonType.VIDEO },
      { title: '94. Appointment Booking', type: LessonType.VIDEO },
      { title: '95. CRM Integration', type: LessonType.VIDEO },
      { title: '96. WhatsApp Integration', type: LessonType.VIDEO },
      { title: '97. Newsletter Signup', type: LessonType.VIDEO },
      { title: '98. Popup Forms', type: LessonType.VIDEO },
      { title: '99. Lead Capture', type: LessonType.VIDEO },
      { title: '100. Form Automation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 11: SEO & Performance Optimization',
    lessons: [
      { title: '101. On-Page SEO', type: LessonType.VIDEO },
      { title: '102. Rank Math SEO', type: LessonType.VIDEO },
      { title: '103. XML Sitemap', type: LessonType.VIDEO },
      { title: '104. Robots.txt', type: LessonType.VIDEO },
      { title: '105. Core Web Vitals', type: LessonType.VIDEO },
      { title: '106. Image Compression', type: LessonType.VIDEO },
      { title: '107. Lazy Loading', type: LessonType.VIDEO },
      { title: '108. CDN Integration', type: LessonType.VIDEO },
      { title: '109. Database Optimization', type: LessonType.VIDEO },
      { title: '110. Performance Testing', type: LessonType.VIDEO },
      { title: 'Project: Optimize a website to achieve high performance scores', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 12: Security & Maintenance',
    lessons: [
      { title: '111. WordPress Security', type: LessonType.VIDEO },
      { title: '112. User Permissions', type: LessonType.VIDEO },
      { title: '113. Firewall Configuration', type: LessonType.VIDEO },
      { title: '114. Malware Scanning', type: LessonType.VIDEO },
      { title: '115. Login Protection', type: LessonType.VIDEO },
      { title: '116. Backup Strategies', type: LessonType.VIDEO },
      { title: '117. Website Migration', type: LessonType.VIDEO },
      { title: '118. Updates & Maintenance', type: LessonType.VIDEO },
      { title: '119. Troubleshooting', type: LessonType.VIDEO },
      { title: '120. Disaster Recovery', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 13: AI for WordPress',
    lessons: [
      { title: '121. AI Website Planning', type: LessonType.VIDEO },
      { title: '122. AI Content Writing', type: LessonType.VIDEO },
      { title: '123. AI Image Generation', type: LessonType.VIDEO },
      { title: '124. AI Landing Page Design', type: LessonType.VIDEO },
      { title: '125. AI SEO Optimization', type: LessonType.VIDEO },
      { title: '126. AI Chatbots', type: LessonType.VIDEO },
      { title: '127. AI Translation', type: LessonType.VIDEO },
      { title: '128. AI Accessibility Tools', type: LessonType.VIDEO },
      { title: '129. AI Marketing Integration', type: LessonType.VIDEO },
      { title: '130. AI Workflow Automation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 14: Custom CSS & JavaScript',
    lessons: [
      { title: '131. CSS Basics', type: LessonType.VIDEO },
      { title: '132. Custom Styling', type: LessonType.VIDEO },
      { title: '133. CSS Variables', type: LessonType.VIDEO },
      { title: '134. Animations', type: LessonType.VIDEO },
      { title: '135. JavaScript Basics', type: LessonType.VIDEO },
      { title: '136. Interactive Elements', type: LessonType.VIDEO },
      { title: '137. Custom Code Snippets', type: LessonType.VIDEO },
      { title: '138. Responsive Fixes', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 15: Business Website Projects',
    lessons: [
      { title: 'Project: Company Website', type: LessonType.ASSIGNMENT },
      { title: 'Project: Portfolio Website', type: LessonType.ASSIGNMENT },
      { title: 'Project: Educational Institute Website', type: LessonType.ASSIGNMENT },
      { title: 'Project: Healthcare Website', type: LessonType.ASSIGNMENT },
      { title: 'Project: Restaurant Website', type: LessonType.ASSIGNMENT },
      { title: 'Project: NGO Website', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 16: E-commerce Projects',
    lessons: [
      { title: 'Project: Fashion Store', type: LessonType.ASSIGNMENT },
      { title: 'Project: Electronics Store', type: LessonType.ASSIGNMENT },
      { title: 'Project: Grocery Store', type: LessonType.ASSIGNMENT },
      { title: 'Project: Digital Products Store', type: LessonType.ASSIGNMENT },
      { title: 'Project: Service Booking Website', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 17: Freelancing & Client Management',
    lessons: [
      { title: '139. Requirement Gathering', type: LessonType.VIDEO },
      { title: '140. Proposal Writing', type: LessonType.VIDEO },
      { title: '141. Pricing & Packages', type: LessonType.VIDEO },
      { title: '142. Contracts', type: LessonType.VIDEO },
      { title: '143. Client Communication', type: LessonType.VIDEO },
      { title: '144. Revision Management', type: LessonType.VIDEO },
      { title: '145. Website Handover', type: LessonType.VIDEO },
      { title: '146. Maintenance Plans', type: LessonType.VIDEO },
      { title: '147. Upselling Services', type: LessonType.VIDEO },
      { title: '148. Building a Freelance Portfolio', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 18: Deployment & Live Hosting',
    lessons: [
      { title: '149. Domain Mapping', type: LessonType.VIDEO },
      { title: '150. SSL Installation', type: LessonType.VIDEO },
      { title: '151. Email Configuration', type: LessonType.VIDEO },
      { title: '152. Website Migration', type: LessonType.VIDEO },
      { title: '153. Backup Before Launch', type: LessonType.VIDEO },
      { title: '154. Go-Live Checklist', type: LessonType.VIDEO },
      { title: '155. Monitoring & Maintenance', type: LessonType.VIDEO },
      { title: '156. Client Training', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 19: Industry Simulation',
    lessons: [
      { title: 'Simulation: Agency-style Website Builds', type: LessonType.ASSIGNMENT },
      { title: 'Speed Optimization & SEO Audit', type: LessonType.ASSIGNMENT },
      { title: 'Client Presentation & Revision Cycle', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 20: Final Capstone Project',
    lessons: [
      { title: 'Capstone Overview (Choose from 10 Project Types)', type: LessonType.VIDEO },
      { title: 'Final Website Deployment & Delivery', type: LessonType.ASSIGNMENT },
    ],
  },
];

async function main() {
  console.log('Seeding WordPress Web Designing Course and Landing Page (CMS)...');

  const course = await prisma.course.upsert({
    where: { code: 'PWD-2026' },
    update: {},
    create: {
      name: 'Professional WordPress Web Designing with AI Master Program',
      code: 'PWD-2026',
      description: 'A 4-5 Month Professional WordPress Developer course covering hosting, performance, SEO, security, AI, and client deployment.',
      duration: '4-5 Months (200+ Hours)',
      fee: 40000,
      isPublished: true,
    },
  });
  console.log('✅ Base course created:', course.name);

  const lmsCourse = await prisma.lMSCourse.upsert({
    where: { courseId: course.id },
    update: {},
    create: {
      courseId: course.id,
      thumbnail: 'https://images.unsplash.com/photo-1616161560417-66d4aba5ce44?q=80&w=1000&auto=format&fit=crop',
      outcomes: [
        '1 Corporate Website',
        '1 Portfolio Website',
        '1 Educational Institute Website',
        '1 WooCommerce E-commerce Store',
        '2 High-Converting Landing Pages',
        '1 SEO & Speed Optimized Website',
        'Client Handover Documentation',
        'Professional Freelance Portfolio'
      ],
      prerequisites: ['Basic computer skills', 'No coding required'],
      isPublished: true,
      pricing: 40000,
      seoTitle: 'WordPress Web Design Course 2026 - Master Elementor & AI',
      draftStatus: 'PUBLISHED',
      publishedAt: new Date(),
    }
  });
  console.log('✅ LMS Course created');

  console.log('Seeding Curriculum...');
  for (let i = 0; i < curriculumData.length; i++) {
    const moduleData = curriculumData[i];
    const lmsModule = await prisma.lMSModule.create({
      data: { lmsCourseId: lmsCourse.id, title: moduleData.title, sortOrder: i }
    });
    const lessonsPayload = moduleData.lessons.map((lesson, index) => ({
      moduleId: lmsModule.id, title: lesson.title, type: lesson.type, sortOrder: index
    }));
    await prisma.lMSLesson.createMany({ data: lessonsPayload });
  }
  console.log('✅ LMS Curriculum seeded successfully.');

  const page = await prisma.landingPage.upsert({
    where: { slug: 'wordpress_web_design' },
    update: { isActive: true },
    create: { slug: 'wordpress_web_design', title: 'Professional WordPress Web Designing with AI', description: 'Editable CMS page for the WordPress Course.', isActive: true },
  });
  console.log('✅ CMS Landing Page upserted:', page.slug);

  const existingSections = await prisma.pageSection.count({ where: { landingPageId: page.id } });
  if (existingSections === 0) {
    await prisma.pageSection.createMany({
      data: [
        {
          landingPageId: page.id, sectionId: 'hero', sortOrder: 0,
          content: { type: 'html', html: `<div style="padding:80px 20px; text-align:center; background:#21759B; color:#fff;"><h1 style="font-size:3rem; font-weight:bold; margin-bottom:1rem;">Professional WordPress Web Designing with AI Master Program</h1><p style="font-size:1.25rem; opacity:0.9; max-width:650px; margin:0 auto 2rem;">Produce professional WordPress websites, master Elementor, WooCommerce, and freelance deployments.</p><a href="#enroll" style="display:inline-block; padding:12px 24px; background:#fff; color:#21759B; font-weight:bold; text-decoration:none; border-radius:4px;">Enroll Now</a></div>` }
        },
        {
          landingPageId: page.id, sectionId: 'details', sortOrder: 1,
          content: { type: 'html', html: `<div style="padding:60px 20px; max-width:800px; margin:0 auto; font-family:sans-serif;"><h2>Course Overview</h2><ul><li><strong>Duration:</strong> 4-5 Months (200+ Hours)</li><li><strong>Modules:</strong> 20</li><li><strong>Lessons:</strong> 140+</li><li><strong>Projects:</strong> 15+ Live Websites</li></ul></div>` }
        }
      ]
    });
    console.log('✅ Default CMS sections created for the landing page.');
  }
  console.log('🎉 WordPress course seeded completely!');
}

main().catch(console.error).finally(async () => await prisma.$disconnect());
