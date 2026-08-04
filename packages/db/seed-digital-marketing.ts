import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  {
    title: 'MODULE 1: Introduction to Digital Marketing',
    lessons: [
      { title: '1. What is Digital Marketing?', type: LessonType.VIDEO },
      { title: '2. Traditional vs Digital Marketing', type: LessonType.VIDEO },
      { title: '3. Digital Marketing Ecosystem', type: LessonType.VIDEO },
      { title: '4. Customer Journey', type: LessonType.VIDEO },
      { title: '5. Marketing Funnel (TOFU, MOFU, BOFU)', type: LessonType.VIDEO },
      { title: '6. Branding Fundamentals', type: LessonType.VIDEO },
      { title: '7. Buyer Personas', type: LessonType.VIDEO },
      { title: '8. Digital Marketing Career Paths', type: LessonType.VIDEO },
      { title: '9. Marketing KPIs', type: LessonType.VIDEO },
      { title: '10. Future of AI in Marketing', type: LessonType.VIDEO },
      { title: 'Practical: Analyze successful digital marketing campaigns & Create a customer journey map', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 2: Marketing Strategy & Branding',
    lessons: [
      { title: '11. Brand Positioning', type: LessonType.VIDEO },
      { title: '12. Unique Value Proposition (UVP)', type: LessonType.VIDEO },
      { title: '13. Target Audience Identification', type: LessonType.VIDEO },
      { title: '14. Market Segmentation', type: LessonType.VIDEO },
      { title: '15. Competitor Analysis', type: LessonType.VIDEO },
      { title: '16. SWOT Analysis', type: LessonType.VIDEO },
      { title: '17. Marketing Calendar', type: LessonType.VIDEO },
      { title: '18. Campaign Planning', type: LessonType.VIDEO },
      { title: '19. Budget Allocation', type: LessonType.VIDEO },
      { title: '20. Marketing Automation Overview', type: LessonType.VIDEO },
      { title: 'Assignment: Develop a marketing strategy for a local business', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 3: Website & Landing Pages',
    lessons: [
      { title: '21. Website Fundamentals', type: LessonType.VIDEO },
      { title: '22. UX for Marketing', type: LessonType.VIDEO },
      { title: '23. Conversion-Focused Design', type: LessonType.VIDEO },
      { title: '24. Landing Page Structure', type: LessonType.VIDEO },
      { title: '25. Call-to-Action (CTA)', type: LessonType.VIDEO },
      { title: '26. Lead Capture Forms', type: LessonType.VIDEO },
      { title: '27. Thank You Pages', type: LessonType.VIDEO },
      { title: '28. A/B Landing Pages', type: LessonType.VIDEO },
      { title: '29. Website Speed Optimization', type: LessonType.VIDEO },
      { title: '30. Mobile Optimization', type: LessonType.VIDEO },
      { title: 'Project: Build a high-converting landing page', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 4: Search Engine Optimization (SEO)',
    lessons: [
      { title: '31. Search Engine Basics', type: LessonType.VIDEO },
      { title: '32. Keyword Research', type: LessonType.VIDEO },
      { title: '33. Search Intent', type: LessonType.VIDEO },
      { title: '34. On-Page SEO', type: LessonType.VIDEO },
      { title: '35. Technical SEO', type: LessonType.VIDEO },
      { title: '36. Off-Page SEO', type: LessonType.VIDEO },
      { title: '37. Local SEO', type: LessonType.VIDEO },
      { title: '38. Google Business Profile Optimization', type: LessonType.VIDEO },
      { title: '39. Schema Markup', type: LessonType.VIDEO },
      { title: '40. SEO Audits', type: LessonType.VIDEO },
      { title: '41. Backlink Strategies', type: LessonType.VIDEO },
      { title: '42. SEO Reporting', type: LessonType.VIDEO },
      { title: 'Project: Optimize a business website for search engines', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 5: Content Marketing',
    lessons: [
      { title: '43. Content Strategy', type: LessonType.VIDEO },
      { title: '44. Content Calendar', type: LessonType.VIDEO },
      { title: '45. Blog Writing', type: LessonType.VIDEO },
      { title: '46. Copywriting Fundamentals', type: LessonType.VIDEO },
      { title: '47. Storytelling', type: LessonType.VIDEO },
      { title: '48. Email Copy', type: LessonType.VIDEO },
      { title: '49. Sales Pages', type: LessonType.VIDEO },
      { title: '50. Case Studies', type: LessonType.VIDEO },
      { title: '51. Video Content Planning', type: LessonType.VIDEO },
      { title: '52. Repurposing Content', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 6: Social Media Marketing',
    lessons: [
      { title: '53. Facebook Marketing', type: LessonType.VIDEO },
      { title: '54. Instagram Marketing', type: LessonType.VIDEO },
      { title: '55. LinkedIn Marketing', type: LessonType.VIDEO },
      { title: '56. YouTube Marketing', type: LessonType.VIDEO },
      { title: '57. X (Twitter) Marketing', type: LessonType.VIDEO },
      { title: '58. Pinterest Marketing', type: LessonType.VIDEO },
      { title: '59. Threads Marketing', type: LessonType.VIDEO },
      { title: '60. Community Building', type: LessonType.VIDEO },
      { title: '61. Influencer Marketing', type: LessonType.VIDEO },
      { title: '62. Social Media Analytics', type: LessonType.VIDEO },
      { title: 'Project: Create a 30-day social media campaign', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 7: Meta Ads',
    lessons: [
      { title: '63. Meta Business Manager', type: LessonType.VIDEO },
      { title: '64. Campaign Objectives', type: LessonType.VIDEO },
      { title: '65. Audience Targeting', type: LessonType.VIDEO },
      { title: '66. Custom Audiences', type: LessonType.VIDEO },
      { title: '67. Lookalike Audiences', type: LessonType.VIDEO },
      { title: '68. Ad Creatives', type: LessonType.VIDEO },
      { title: '69. Ad Copywriting', type: LessonType.VIDEO },
      { title: '70. Pixel Setup', type: LessonType.VIDEO },
      { title: '71. Conversion API (CAPI)', type: LessonType.VIDEO },
      { title: '72. Lead Generation Campaigns', type: LessonType.VIDEO },
      { title: '73. Remarketing', type: LessonType.VIDEO },
      { title: '74. Campaign Optimization', type: LessonType.VIDEO },
      { title: 'Project: Launch a lead generation campaign', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 8: Google Ads',
    lessons: [
      { title: '75. Google Ads Interface', type: LessonType.VIDEO },
      { title: '76. Search Campaigns', type: LessonType.VIDEO },
      { title: '77. Display Campaigns', type: LessonType.VIDEO },
      { title: '78. Video Campaigns', type: LessonType.VIDEO },
      { title: '79. Shopping Campaigns', type: LessonType.VIDEO },
      { title: '80. Performance Max', type: LessonType.VIDEO },
      { title: '81. Keyword Match Types', type: LessonType.VIDEO },
      { title: '82. Quality Score', type: LessonType.VIDEO },
      { title: '83. Ad Extensions', type: LessonType.VIDEO },
      { title: '84. Conversion Tracking', type: LessonType.VIDEO },
      { title: '85. Bid Strategies', type: LessonType.VIDEO },
      { title: '86. Optimization Techniques', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 9: Email & WhatsApp Marketing',
    lessons: [
      { title: '87. Email Marketing Basics', type: LessonType.VIDEO },
      { title: '88. List Building', type: LessonType.VIDEO },
      { title: '89. Segmentation', type: LessonType.VIDEO },
      { title: '90. Automation Workflows', type: LessonType.VIDEO },
      { title: '91. Newsletter Design', type: LessonType.VIDEO },
      { title: '92. Drip Campaigns', type: LessonType.VIDEO },
      { title: '93. WhatsApp Business API', type: LessonType.VIDEO },
      { title: '94. Broadcast Campaigns', type: LessonType.VIDEO },
      { title: '95. WhatsApp Automation', type: LessonType.VIDEO },
      { title: '96. Customer Retention', type: LessonType.VIDEO },
      { title: 'Project: Build an automated email + WhatsApp funnel', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 10: AI for Digital Marketing',
    lessons: [
      { title: '97. ChatGPT for Marketing', type: LessonType.VIDEO },
      { title: '98. Prompt Engineering', type: LessonType.VIDEO },
      { title: '99. AI Copywriting', type: LessonType.VIDEO },
      { title: '100. AI Blog Generation', type: LessonType.VIDEO },
      { title: '101. AI Image Creation', type: LessonType.VIDEO },
      { title: '102. AI Video Generation', type: LessonType.VIDEO },
      { title: '103. AI Ad Creatives', type: LessonType.VIDEO },
      { title: '104. AI Email Writing', type: LessonType.VIDEO },
      { title: '105. AI Marketing Automation', type: LessonType.VIDEO },
      { title: '106. AI Analytics', type: LessonType.VIDEO },
      { title: '107. AI Customer Support', type: LessonType.VIDEO },
      { title: '108. AI Workflow Automation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 11: Analytics & Reporting',
    lessons: [
      { title: '109. Google Analytics 4 (GA4)', type: LessonType.VIDEO },
      { title: '110. Google Search Console', type: LessonType.VIDEO },
      { title: '111. Meta Ads Reporting', type: LessonType.VIDEO },
      { title: '112. UTM Tracking', type: LessonType.VIDEO },
      { title: '113. Conversion Funnels', type: LessonType.VIDEO },
      { title: '114. Event Tracking', type: LessonType.VIDEO },
      { title: '115. KPI Dashboards', type: LessonType.VIDEO },
      { title: '116. ROI Analysis', type: LessonType.VIDEO },
      { title: '117. Attribution Models', type: LessonType.VIDEO },
      { title: '118. Monthly Reporting', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 12: E-commerce Marketing',
    lessons: [
      { title: '119. Shopify Marketing', type: LessonType.VIDEO },
      { title: '120. WooCommerce Marketing', type: LessonType.VIDEO },
      { title: '121. Product SEO', type: LessonType.VIDEO },
      { title: '122. Marketplace Marketing', type: LessonType.VIDEO },
      { title: '123. Shopping Feeds', type: LessonType.VIDEO },
      { title: '124. Cart Recovery', type: LessonType.VIDEO },
      { title: '125. Coupon Campaigns', type: LessonType.VIDEO },
      { title: '126. Upselling & Cross-selling', type: LessonType.VIDEO },
      { title: '127. Customer Reviews', type: LessonType.VIDEO },
      { title: '128. Retention Strategies', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 13: Video Marketing',
    lessons: [
      { title: '129. YouTube SEO', type: LessonType.VIDEO },
      { title: '130. Shorts & Reels Strategy', type: LessonType.VIDEO },
      { title: '131. Thumbnail Optimization', type: LessonType.VIDEO },
      { title: '132. Video Script Writing', type: LessonType.VIDEO },
      { title: '133. Live Streaming', type: LessonType.VIDEO },
      { title: '134. Podcast Marketing', type: LessonType.VIDEO },
      { title: '135. Video Analytics', type: LessonType.VIDEO },
      { title: '136. Video Advertising', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 14: Lead Generation',
    lessons: [
      { title: '137. Lead Magnets', type: LessonType.VIDEO },
      { title: '138. Funnels', type: LessonType.VIDEO },
      { title: '139. CRM Integration', type: LessonType.VIDEO },
      { title: '140. Lead Scoring', type: LessonType.VIDEO },
      { title: '141. Nurturing Campaigns', type: LessonType.VIDEO },
      { title: '142. Appointment Booking Funnels', type: LessonType.VIDEO },
      { title: '143. Webinar Marketing', type: LessonType.VIDEO },
      { title: '144. Sales Pipeline Management', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 15: Automation & CRM',
    lessons: [
      { title: '145. Marketing Automation Platforms', type: LessonType.VIDEO },
      { title: '146. CRM Fundamentals', type: LessonType.VIDEO },
      { title: '147. Customer Segmentation', type: LessonType.VIDEO },
      { title: '148. Workflow Automation', type: LessonType.VIDEO },
      { title: '149. WhatsApp CRM', type: LessonType.VIDEO },
      { title: '150. Email Automation', type: LessonType.VIDEO },
      { title: '151. Lead Lifecycle', type: LessonType.VIDEO },
      { title: '152. Customer Retention Automation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 16: Freelancing & Agency Operations',
    lessons: [
      { title: '153. Building a Personal Brand', type: LessonType.VIDEO },
      { title: '154. Finding Clients', type: LessonType.VIDEO },
      { title: '155. Proposal Writing', type: LessonType.VIDEO },
      { title: '156. Pricing Services', type: LessonType.VIDEO },
      { title: '157. Client Onboarding', type: LessonType.VIDEO },
      { title: '158. Campaign Reporting', type: LessonType.VIDEO },
      { title: '159. Team Collaboration', type: LessonType.VIDEO },
      { title: '160. Agency SOPs', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 17: Legal, Privacy & Ethics',
    lessons: [
      { title: '161. GDPR Basics', type: LessonType.VIDEO },
      { title: '162. Cookie Consent', type: LessonType.VIDEO },
      { title: '163. Data Privacy', type: LessonType.VIDEO },
      { title: '164. Copyright', type: LessonType.VIDEO },
      { title: '165. Ad Policies', type: LessonType.VIDEO },
      { title: '166. Ethical Marketing', type: LessonType.VIDEO },
      { title: '167. Brand Safety', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 18: Portfolio Development',
    lessons: [
      { title: 'Portfolio: SEO Audit Report & Content Calendar', type: LessonType.ASSIGNMENT },
      { title: 'Portfolio: Ad Campaign Reports & Landing Page', type: LessonType.ASSIGNMENT },
      { title: 'Portfolio: Social Media & Email Marketing Workflow', type: LessonType.ASSIGNMENT },
      { title: 'Portfolio: Analytics Dashboard', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 19: Industry Simulation',
    lessons: [
      { title: 'Simulation: Manage campaigns for a Local Business & E-commerce', type: LessonType.ASSIGNMENT },
      { title: 'Simulation: Manage campaigns for Healthcare & Startup', type: LessonType.ASSIGNMENT },
      { title: 'Weekly Reporting & Campaign Optimization', type: LessonType.VIDEO },
      { title: 'Client Meetings & Budget Management', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 20: Final Capstone Project',
    lessons: [
      { title: 'Capstone Overview (End-to-end digital marketing campaign)', type: LessonType.VIDEO },
      { title: 'Final Project Submission & ROI Report', type: LessonType.ASSIGNMENT },
    ],
  },
];

async function main() {
  console.log('Seeding Digital Marketing Course and Landing Page (CMS)...');

  const course = await prisma.course.upsert({
    where: { code: 'PDMM-2026' },
    update: {},
    create: {
      name: 'Professional Digital Marketing with AI Master Program',
      code: 'PDMM-2026',
      description: 'A 4-6 Month Professional Digital Marketing Master Program focusing on performance marketing, SEO, social media, and AI workflows.',
      duration: '4-6 Months (220+ Hours)',
      fee: 45000,
      isPublished: true,
    },
  });
  console.log('✅ Base course created:', course.name);

  const lmsCourse = await prisma.lMSCourse.upsert({
    where: { courseId: course.id },
    update: {},
    create: {
      courseId: course.id,
      thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1000&auto=format&fit=crop',
      outcomes: [
        '5 SEO audit reports',
        '3 complete content calendars',
        '5 social media campaign portfolios',
        '3 Meta Ads campaigns',
        '2 Google Ads campaigns',
        '2 email automation workflows',
        '2 WhatsApp marketing campaigns',
        '1 e-commerce marketing strategy',
        '1 analytics dashboard',
        '1 complete digital marketing case study'
      ],
      prerequisites: ['Basic computer skills', 'Interest in marketing'],
      isPublished: true,
      pricing: 45000,
      seoTitle: 'Digital Marketing Course 2026 - Master SEO, Ads & AI',
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
    where: { slug: 'digital_marketing' },
    update: { isActive: true },
    create: { slug: 'digital_marketing', title: 'Professional Digital Marketing with AI', description: 'Editable CMS page for the Digital Marketing Course.', isActive: true },
  });
  console.log('✅ CMS Landing Page upserted:', page.slug);

  const existingSections = await prisma.pageSection.count({ where: { landingPageId: page.id } });
  if (existingSections === 0) {
    await prisma.pageSection.createMany({
      data: [
        {
          landingPageId: page.id, sectionId: 'hero', sortOrder: 0,
          content: { type: 'html', html: `<div style="padding:80px 20px; text-align:center; background:#0055FF; color:#fff;"><h1 style="font-size:3rem; font-weight:bold; margin-bottom:1rem;">Professional Digital Marketing with AI Master Program</h1><p style="font-size:1.25rem; opacity:0.9; max-width:650px; margin:0 auto 2rem;">Become a performance marketer, SEO specialist, and growth expert with AI-driven workflows.</p><a href="#enroll" style="display:inline-block; padding:12px 24px; background:#fff; color:#0055FF; font-weight:bold; text-decoration:none; border-radius:4px;">Enroll Now</a></div>` }
        },
        {
          landingPageId: page.id, sectionId: 'details', sortOrder: 1,
          content: { type: 'html', html: `<div style="padding:60px 20px; max-width:800px; margin:0 auto; font-family:sans-serif;"><h2>Course Overview</h2><ul><li><strong>Duration:</strong> 4-6 Months (220+ Hours)</li><li><strong>Modules:</strong> 20</li><li><strong>Lessons:</strong> 150+</li><li><strong>Certifications:</strong> Google, Meta & HubSpot Ready</li></ul></div>` }
        }
      ]
    });
    console.log('✅ Default CMS sections created for the landing page.');
  }
  console.log('🎉 Digital Marketing course seeded completely!');
}

main().catch(console.error).finally(async () => await prisma.$disconnect());
