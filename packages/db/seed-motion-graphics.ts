import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  {
    title: 'MODULE 1: Introduction to Motion Graphics',
    lessons: [
      { title: '1. What is Motion Graphics?', type: LessonType.VIDEO },
      { title: '2. Motion Graphics vs Animation', type: LessonType.VIDEO },
      { title: '3. Motion Graphics Pipeline', type: LessonType.VIDEO },
      { title: '4. Types of Motion Graphics', type: LessonType.VIDEO },
      { title: '5. Motion Design Industry', type: LessonType.VIDEO },
      { title: '6. Design Principles', type: LessonType.VIDEO },
      { title: '7. Animation Principles', type: LessonType.VIDEO },
      { title: '8. Storytelling with Motion', type: LessonType.VIDEO },
      { title: '9. Design Workflow', type: LessonType.VIDEO },
      { title: '10. Future of AI in Motion Design', type: LessonType.VIDEO },
      { title: 'Practical: Analyze TV commercials and explainer videos', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 2: Design Fundamentals for Motion',
    lessons: [
      { title: '11. Color Theory', type: LessonType.VIDEO },
      { title: '12. Typography', type: LessonType.VIDEO },
      { title: '13. Layout Design', type: LessonType.VIDEO },
      { title: '14. Composition', type: LessonType.VIDEO },
      { title: '15. Visual Hierarchy', type: LessonType.VIDEO },
      { title: '16. Grid Systems', type: LessonType.VIDEO },
      { title: '17. Branding Principles', type: LessonType.VIDEO },
      { title: '18. Design Consistency', type: LessonType.VIDEO },
      { title: '19. Icon Design', type: LessonType.VIDEO },
      { title: '20. Style Frames', type: LessonType.VIDEO },
      { title: 'Assignment: Design style frames for a brand animation', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 3: Adobe After Effects Essentials',
    lessons: [
      { title: '21. Interface Overview', type: LessonType.VIDEO },
      { title: '22. Project Settings', type: LessonType.VIDEO },
      { title: '23. Importing Assets', type: LessonType.VIDEO },
      { title: '24. Composition Settings', type: LessonType.VIDEO },
      { title: '25. Layers', type: LessonType.VIDEO },
      { title: '26. Keyframes', type: LessonType.VIDEO },
      { title: '27. Timeline', type: LessonType.VIDEO },
      { title: '28. Basic Animation', type: LessonType.VIDEO },
      { title: '29. Graph Editor', type: LessonType.VIDEO },
      { title: '30. Easy Ease', type: LessonType.VIDEO },
      { title: 'Practical: Animate simple geometric objects', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 4: Professional Animation Techniques',
    lessons: [
      { title: '31. Position Animation', type: LessonType.VIDEO },
      { title: '32. Scale Animation', type: LessonType.VIDEO },
      { title: '33. Rotation', type: LessonType.VIDEO },
      { title: '34. Opacity', type: LessonType.VIDEO },
      { title: '35. Anchor Points', type: LessonType.VIDEO },
      { title: '36. Parenting', type: LessonType.VIDEO },
      { title: '37. Null Objects', type: LessonType.VIDEO },
      { title: '38. Motion Blur', type: LessonType.VIDEO },
      { title: '39. Time Remapping', type: LessonType.VIDEO },
      { title: '40. Expressions Basics', type: LessonType.VIDEO },
      { title: 'Project: Create a kinetic animation sequence', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 5: Shape Layer Animation',
    lessons: [
      { title: '41. Shape Layers', type: LessonType.VIDEO },
      { title: '42. Paths', type: LessonType.VIDEO },
      { title: '43. Trim Paths', type: LessonType.VIDEO },
      { title: '44. Repeater', type: LessonType.VIDEO },
      { title: '45. Merge Paths', type: LessonType.VIDEO },
      { title: '46. Gradient Animation', type: LessonType.VIDEO },
      { title: '47. Stroke Animation', type: LessonType.VIDEO },
      { title: '48. Morphing Shapes', type: LessonType.VIDEO },
      { title: '49. Pattern Animation', type: LessonType.VIDEO },
      { title: '50. Animated Backgrounds', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 6: Typography Animation',
    lessons: [
      { title: '51. Text Animators', type: LessonType.VIDEO },
      { title: '52. Character Animation', type: LessonType.VIDEO },
      { title: '53. Word Animation', type: LessonType.VIDEO },
      { title: '54. Paragraph Animation', type: LessonType.VIDEO },
      { title: '55. Typewriter Effect', type: LessonType.VIDEO },
      { title: '56. Kinetic Typography', type: LessonType.VIDEO },
      { title: '57. Text Presets', type: LessonType.VIDEO },
      { title: '58. Animated Quotes', type: LessonType.VIDEO },
      { title: '59. Promotional Typography', type: LessonType.VIDEO },
      { title: '60. End Titles', type: LessonType.VIDEO },
      { title: 'Project: Create a kinetic typography advertisement', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 7: Logo Animation',
    lessons: [
      { title: '61. Logo Preparation', type: LessonType.VIDEO },
      { title: '62. Reveal Techniques', type: LessonType.VIDEO },
      { title: '63. Mask Animation', type: LessonType.VIDEO },
      { title: '64. Shape Morphing', type: LessonType.VIDEO },
      { title: '65. Particle Logo Reveal', type: LessonType.VIDEO },
      { title: '66. Liquid Animation', type: LessonType.VIDEO },
      { title: '67. Stroke Animation', type: LessonType.VIDEO },
      { title: '68. 3D Logo Animation', type: LessonType.VIDEO },
      { title: '69. Brand Intro', type: LessonType.VIDEO },
      { title: '70. Brand Outro', type: LessonType.VIDEO },
      { title: 'Project: Animate five different logo reveal styles', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 8: Motion Graphics for Social Media',
    lessons: [
      { title: '71. Instagram Reels Graphics', type: LessonType.VIDEO },
      { title: '72. YouTube Intros', type: LessonType.VIDEO },
      { title: '73. YouTube Outros', type: LessonType.VIDEO },
      { title: '74. Animated Stories', type: LessonType.VIDEO },
      { title: '75. Lower Thirds', type: LessonType.VIDEO },
      { title: '76. Animated Captions', type: LessonType.VIDEO },
      { title: '77. Promotional Posts', type: LessonType.VIDEO },
      { title: '78. Product Launch Graphics', type: LessonType.VIDEO },
      { title: '79. Event Announcements', type: LessonType.VIDEO },
      { title: '80. Social Media Templates', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 9: Explainer Videos',
    lessons: [
      { title: '81. Storyboarding', type: LessonType.VIDEO },
      { title: '82. Script Breakdown', type: LessonType.VIDEO },
      { title: '83. Scene Planning', type: LessonType.VIDEO },
      { title: '84. Character Assets', type: LessonType.VIDEO },
      { title: '85. Icon Animation', type: LessonType.VIDEO },
      { title: '86. Infographics', type: LessonType.VIDEO },
      { title: '87. Callouts', type: LessonType.VIDEO },
      { title: '88. Transitions', type: LessonType.VIDEO },
      { title: '89. Voice-over Sync', type: LessonType.VIDEO },
      { title: '90. Final Delivery', type: LessonType.VIDEO },
      { title: 'Project: Create a 90-second explainer video', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 10: Motion Graphics for Advertising',
    lessons: [
      { title: '91. Product Advertisements', type: LessonType.VIDEO },
      { title: '92. Fashion Promotions', type: LessonType.VIDEO },
      { title: '93. Restaurant Promotions', type: LessonType.VIDEO },
      { title: '94. Corporate Ads', type: LessonType.VIDEO },
      { title: '95. Mobile App Promotions', type: LessonType.VIDEO },
      { title: '96. SaaS Product Videos', type: LessonType.VIDEO },
      { title: '97. Event Promotions', type: LessonType.VIDEO },
      { title: '98. Educational Ads', type: LessonType.VIDEO },
      { title: '99. Healthcare Campaigns', type: LessonType.VIDEO },
      { title: '100. Real Estate Promotions', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 11: UI Motion Design',
    lessons: [
      { title: '101. Mobile UI Animation', type: LessonType.VIDEO },
      { title: '102. Website UI Animation', type: LessonType.VIDEO },
      { title: '103. App Onboarding', type: LessonType.VIDEO },
      { title: '104. Button States', type: LessonType.VIDEO },
      { title: '105. Microinteractions', type: LessonType.VIDEO },
      { title: '106. Page Transitions', type: LessonType.VIDEO },
      { title: '107. Dashboard Animations', type: LessonType.VIDEO },
      { title: '108. Prototype Videos', type: LessonType.VIDEO },
      { title: 'Project: Create an animated mobile app walkthrough', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 12: Broadcast Graphics',
    lessons: [
      { title: '109. News Lower Thirds', type: LessonType.VIDEO },
      { title: '110. TV Titles', type: LessonType.VIDEO },
      { title: '111. Sports Graphics', type: LessonType.VIDEO },
      { title: '112. Weather Graphics', type: LessonType.VIDEO },
      { title: '113. Channel Branding', type: LessonType.VIDEO },
      { title: '114. Opening Sequences', type: LessonType.VIDEO },
      { title: '115. Closing Credits', type: LessonType.VIDEO },
      { title: '116. Broadcast Packages', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 13: 3D Motion Graphics',
    lessons: [
      { title: '117. Cinema 4D Lite Introduction', type: LessonType.VIDEO },
      { title: '118. 3D Layers', type: LessonType.VIDEO },
      { title: '119. Cameras', type: LessonType.VIDEO },
      { title: '120. Lights', type: LessonType.VIDEO },
      { title: '121. Extruded Text', type: LessonType.VIDEO },
      { title: '122. 3D Logos', type: LessonType.VIDEO },
      { title: '123. Product Spins', type: LessonType.VIDEO },
      { title: '124. Simple 3D Scenes', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 14: Visual Effects for Motion Designers',
    lessons: [
      { title: '125. Motion Tracking', type: LessonType.VIDEO },
      { title: '126. Camera Tracking', type: LessonType.VIDEO },
      { title: '127. Rotoscoping', type: LessonType.VIDEO },
      { title: '128. Green Screen Keying', type: LessonType.VIDEO },
      { title: '129. Masking', type: LessonType.VIDEO },
      { title: '130. Glow Effects', type: LessonType.VIDEO },
      { title: '131. Light Rays', type: LessonType.VIDEO },
      { title: '132. Particles', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 15: Expressions & Automation',
    lessons: [
      { title: '133. Expression Basics', type: LessonType.VIDEO },
      { title: '134. Wiggle', type: LessonType.VIDEO },
      { title: '135. Loop Expressions', type: LessonType.VIDEO },
      { title: '136. Slider Controls', type: LessonType.VIDEO },
      { title: '137. Time Expressions', type: LessonType.VIDEO },
      { title: '138. Essential Graphics Templates', type: LessonType.VIDEO },
      { title: '139. Dynamic Data', type: LessonType.VIDEO },
      { title: '140. Automation Workflows', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 16: AI for Motion Graphics',
    lessons: [
      { title: '141. AI Storyboarding', type: LessonType.VIDEO },
      { title: '142. AI Script Writing', type: LessonType.VIDEO },
      { title: '143. AI Image Generation', type: LessonType.VIDEO },
      { title: '144. AI Video Generation', type: LessonType.VIDEO },
      { title: '145. AI Animation Assistance', type: LessonType.VIDEO },
      { title: '146. AI Voice Generation', type: LessonType.VIDEO },
      { title: '147. AI Sound Effects', type: LessonType.VIDEO },
      { title: '148. AI Motion Tracking', type: LessonType.VIDEO },
      { title: '149. AI Background Removal', type: LessonType.VIDEO },
      { title: '150. AI Workflow Automation', type: LessonType.VIDEO },
      { title: 'Project: Produce a 30-second AI-assisted advertisement', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 17: Rendering & Delivery',
    lessons: [
      { title: '151. Adobe Media Encoder', type: LessonType.VIDEO },
      { title: '152. Export Settings', type: LessonType.VIDEO },
      { title: '153. Alpha Channels', type: LessonType.VIDEO },
      { title: '154. GIF Export', type: LessonType.VIDEO },
      { title: '155. Lottie Animation', type: LessonType.VIDEO },
      { title: '156. Social Media Formats', type: LessonType.VIDEO },
      { title: '157. Broadcast Formats', type: LessonType.VIDEO },
      { title: '158. Project Archiving', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 18: Freelancing & Client Workflow',
    lessons: [
      { title: '159. Creative Briefs', type: LessonType.VIDEO },
      { title: '160. Storyboarding', type: LessonType.VIDEO },
      { title: '161. Pricing Projects', type: LessonType.VIDEO },
      { title: '162. Revision Cycles', type: LessonType.VIDEO },
      { title: '163. Client Presentations', type: LessonType.VIDEO },
      { title: '164. Project Documentation', type: LessonType.VIDEO },
      { title: '165. Contracts', type: LessonType.VIDEO },
      { title: '166. Building a Motion Design Brand', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 19: Industry Simulation',
    lessons: [
      { title: 'Simulation: Projects for TV Channel Branding & Startup Launch', type: LessonType.ASSIGNMENT },
      { title: 'Simulation: Campaigns for Restaurant, Fashion, Educational, SaaS', type: LessonType.ASSIGNMENT },
      { title: 'Daily Creative Briefs & Team Collaboration', type: LessonType.VIDEO },
      { title: 'Client Reviews & Final Presentation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 20: Final Capstone Project',
    lessons: [
      { title: 'Capstone Overview (Choose from 10 Project Types)', type: LessonType.VIDEO },
      { title: 'Final Capstone Project Submission', type: LessonType.ASSIGNMENT },
    ],
  },
];

async function main() {
  console.log('Seeding Motion Graphics Course and Landing Page (CMS)...');

  const course = await prisma.course.upsert({
    where: { code: 'PMGM-2026' },
    update: {},
    create: {
      name: 'Professional Motion Graphics with AI Master Program',
      code: 'PMGM-2026',
      description: 'A 5-6 Month Professional Motion Graphics Master Program covering Adobe After Effects, Illustrator, Cinema 4D Lite, and AI tools.',
      duration: '5-6 Months (240+ Hours)',
      fee: 55000,
      isPublished: true,
    },
  });
  console.log('✅ Base course created:', course.name);

  const lmsCourse = await prisma.lMSCourse.upsert({
    where: { courseId: course.id },
    update: {},
    create: {
      courseId: course.id,
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop',
      outcomes: [
        '5 logo animations',
        '10 social media motion graphics',
        '3 explainer videos',
        '3 product advertisements',
        '2 broadcast graphics packages',
        '2 UI animation demos',
        '2 kinetic typography videos',
        '1 brand animation package',
        '1 TV opening sequence',
        '1 professional motion graphics showreel'
      ],
      prerequisites: ['Basic computer skills', 'Creative mindset'],
      isPublished: true,
      pricing: 55000,
      seoTitle: 'Motion Graphics Course 2026 - Master After Effects & AI',
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
    where: { slug: 'motion_graphics' },
    update: { isActive: true },
    create: { slug: 'motion_graphics', title: 'Professional Motion Graphics with AI', description: 'Editable CMS page for the Motion Graphics Course.', isActive: true },
  });
  console.log('✅ CMS Landing Page upserted:', page.slug);

  const existingSections = await prisma.pageSection.count({ where: { landingPageId: page.id } });
  if (existingSections === 0) {
    await prisma.pageSection.createMany({
      data: [
        {
          landingPageId: page.id, sectionId: 'hero', sortOrder: 0,
          content: { type: 'html', html: `<div style="padding:80px 20px; text-align:center; background:#4C1D95; color:#fff;"><h1 style="font-size:3rem; font-weight:bold; margin-bottom:1rem; color:#fff;">Professional Motion Graphics with AI Master Program</h1><p style="font-size:1.25rem; opacity:0.9; max-width:650px; margin:0 auto 2rem; color:#DDD6FE;">Become a Motion Designer. Create explainer videos, ads, and UI animations with After Effects & AI.</p><a href="#enroll" style="display:inline-block; padding:12px 24px; background:#FACC15; color:#4C1D95; font-weight:bold; text-decoration:none; border-radius:4px;">Enroll Now</a></div>` }
        },
        {
          landingPageId: page.id, sectionId: 'details', sortOrder: 1,
          content: { type: 'html', html: `<div style="padding:60px 20px; max-width:800px; margin:0 auto; font-family:sans-serif;"><h2>Course Overview</h2><ul><li><strong>Duration:</strong> 5-6 Months (240+ Hours)</li><li><strong>Modules:</strong> 20</li><li><strong>Lessons:</strong> 160+</li><li><strong>Projects:</strong> 20+</li><li><strong>Portfolio:</strong> Industry-Ready Showreel</li></ul></div>` }
        }
      ]
    });
    console.log('✅ Default CMS sections created for the landing page.');
  }
  console.log('🎉 Motion Graphics course seeded completely!');
}

main().catch(console.error).finally(async () => await prisma.$disconnect());
