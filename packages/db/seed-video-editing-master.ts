import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  {
    title: 'MODULE 1: Introduction to Video Editing',
    lessons: [
      { title: '1. What is Video Editing?', type: LessonType.VIDEO },
      { title: '2. Types of Video Editing', type: LessonType.VIDEO },
      { title: '3. Pre-Production', type: LessonType.VIDEO },
      { title: '4. Production', type: LessonType.VIDEO },
      { title: '5. Post-Production', type: LessonType.VIDEO },
      { title: '6. Editing Workflow', type: LessonType.VIDEO },
      { title: '7. File Formats', type: LessonType.VIDEO },
      { title: '8. Codecs', type: LessonType.VIDEO },
      { title: '9. Frame Rates', type: LessonType.VIDEO },
      { title: '10. Resolution & Aspect Ratios', type: LessonType.VIDEO },
      { title: 'Practical: Organize media for a sample project', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 2: Editing Fundamentals',
    lessons: [
      { title: '11. Storytelling Through Editing', type: LessonType.VIDEO },
      { title: '12. Continuity Editing', type: LessonType.VIDEO },
      { title: '13. Match Cuts', type: LessonType.VIDEO },
      { title: '14. Jump Cuts', type: LessonType.VIDEO },
      { title: '15. Cutaway Shots', type: LessonType.VIDEO },
      { title: '16. B-Roll Editing', type: LessonType.VIDEO },
      { title: '17. Pacing & Rhythm', type: LessonType.VIDEO },
      { title: '18. Shot Selection', type: LessonType.VIDEO },
      { title: '19. Timeline Organization', type: LessonType.VIDEO },
      { title: '20. Project Management', type: LessonType.VIDEO },
      { title: 'Assignment: Edit a 60-second storytelling video', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 3: Adobe Premiere Pro Essentials',
    lessons: [
      { title: '21. Interface Overview', type: LessonType.VIDEO },
      { title: '22. Project Settings', type: LessonType.VIDEO },
      { title: '23. Importing Media', type: LessonType.VIDEO },
      { title: '24. Sequence Settings', type: LessonType.VIDEO },
      { title: '25. Timeline Editing', type: LessonType.VIDEO },
      { title: '26. Trim Tools', type: LessonType.VIDEO },
      { title: '27. Ripple & Roll Edit', type: LessonType.VIDEO },
      { title: '28. Multi-Camera Editing', type: LessonType.VIDEO },
      { title: '29. Keyboard Shortcuts', type: LessonType.VIDEO },
      { title: '30. Workspace Customization', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 4: Advanced Premiere Pro',
    lessons: [
      { title: '31. Nested Sequences', type: LessonType.VIDEO },
      { title: '32. Adjustment Layers', type: LessonType.VIDEO },
      { title: '33. Speed Ramping', type: LessonType.VIDEO },
      { title: '34. Time Remapping', type: LessonType.VIDEO },
      { title: '35. Proxy Workflow', type: LessonType.VIDEO },
      { title: '36. Essential Graphics', type: LessonType.VIDEO },
      { title: '37. Dynamic Link', type: LessonType.VIDEO },
      { title: '38. Multicam Workflow', type: LessonType.VIDEO },
      { title: '39. Scene Detection', type: LessonType.VIDEO },
      { title: '40. AI Features in Premiere Pro', type: LessonType.VIDEO },
      { title: 'Project: Edit a cinematic travel video', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 5: Audio Editing',
    lessons: [
      { title: '41. Audio Fundamentals', type: LessonType.VIDEO },
      { title: '42. Dialogue Editing', type: LessonType.VIDEO },
      { title: '43. Noise Reduction', type: LessonType.VIDEO },
      { title: '44. Audio Mixing', type: LessonType.VIDEO },
      { title: '45. Equalization (EQ)', type: LessonType.VIDEO },
      { title: '46. Compression', type: LessonType.VIDEO },
      { title: '47. Sound Effects', type: LessonType.VIDEO },
      { title: '48. Background Music', type: LessonType.VIDEO },
      { title: '49. Voice-over Recording', type: LessonType.VIDEO },
      { title: '50. Audio Loudness Standards', type: LessonType.VIDEO },
      { title: 'Project: Produce a podcast episode with clean audio', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 6: Color Correction & Color Grading',
    lessons: [
      { title: '51. Color Theory for Video', type: LessonType.VIDEO },
      { title: '52. Lumetri Color Panel', type: LessonType.VIDEO },
      { title: '53. White Balance', type: LessonType.VIDEO },
      { title: '54. Exposure', type: LessonType.VIDEO },
      { title: '55. Contrast', type: LessonType.VIDEO },
      { title: '56. Curves', type: LessonType.VIDEO },
      { title: '57. Color Wheels', type: LessonType.VIDEO },
      { title: '58. LUTs', type: LessonType.VIDEO },
      { title: '59. Secondary Color Correction', type: LessonType.VIDEO },
      { title: '60. Cinematic Color Grading', type: LessonType.VIDEO },
      { title: 'Project: Grade a short cinematic sequence', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 7: Titles & Graphics',
    lessons: [
      { title: '61. Essential Graphics', type: LessonType.VIDEO },
      { title: '62. Lower Thirds', type: LessonType.VIDEO },
      { title: '63. Animated Titles', type: LessonType.VIDEO },
      { title: '64. Kinetic Typography', type: LessonType.VIDEO },
      { title: '65. End Screens', type: LessonType.VIDEO },
      { title: '66. Intro & Outro Design', type: LessonType.VIDEO },
      { title: '67. Social Media Graphics', type: LessonType.VIDEO },
      { title: '68. Brand Templates', type: LessonType.VIDEO },
      { title: '69. Motion Presets', type: LessonType.VIDEO },
      { title: '70. Export Graphics', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 8: Editing for Social Media',
    lessons: [
      { title: '71. Instagram Reels', type: LessonType.VIDEO },
      { title: '72. YouTube Shorts', type: LessonType.VIDEO },
      { title: '73. TikTok Videos', type: LessonType.VIDEO },
      { title: '74. Facebook Videos', type: LessonType.VIDEO },
      { title: '75. LinkedIn Videos', type: LessonType.VIDEO },
      { title: '76. Vertical Video Editing', type: LessonType.VIDEO },
      { title: '77. Hook Creation', type: LessonType.VIDEO },
      { title: '78. Retention Editing', type: LessonType.VIDEO },
      { title: '79. Viral Editing Techniques', type: LessonType.VIDEO },
      { title: '80. Captioning', type: LessonType.VIDEO },
      { title: 'Project: Create five social media videos', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 9: Commercial Editing',
    lessons: [
      { title: '81. Product Commercials', type: LessonType.VIDEO },
      { title: '82. Brand Films', type: LessonType.VIDEO },
      { title: '83. Promotional Videos', type: LessonType.VIDEO },
      { title: '84. Corporate Videos', type: LessonType.VIDEO },
      { title: '85. Real Estate Videos', type: LessonType.VIDEO },
      { title: '86. Restaurant Promotions', type: LessonType.VIDEO },
      { title: '87. Educational Videos', type: LessonType.VIDEO },
      { title: '88. Fashion Videos', type: LessonType.VIDEO },
      { title: '89. Event Highlights', type: LessonType.VIDEO },
      { title: '90. Customer Testimonials', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 10: Wedding & Event Editing',
    lessons: [
      { title: '91. Wedding Storytelling', type: LessonType.VIDEO },
      { title: '92. Highlight Reels', type: LessonType.VIDEO },
      { title: '93. Cinematic Sequences', type: LessonType.VIDEO },
      { title: '94. Multi-Camera Sync', type: LessonType.VIDEO },
      { title: '95. Ceremony Editing', type: LessonType.VIDEO },
      { title: '96. Reception Highlights', type: LessonType.VIDEO },
      { title: '97. Drone Footage', type: LessonType.VIDEO },
      { title: '98. Music Synchronization', type: LessonType.VIDEO },
      { title: '99. Color Matching', type: LessonType.VIDEO },
      { title: '100. Final Delivery', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 11: Documentary & Film Editing',
    lessons: [
      { title: '101. Documentary Structure', type: LessonType.VIDEO },
      { title: '102. Interview Editing', type: LessonType.VIDEO },
      { title: '103. Narrative Construction', type: LessonType.VIDEO },
      { title: '104. B-Roll Integration', type: LessonType.VIDEO },
      { title: '105. Scene Transitions', type: LessonType.VIDEO },
      { title: '106. Emotional Storytelling', type: LessonType.VIDEO },
      { title: '107. Film Editing Styles', type: LessonType.VIDEO },
      { title: '108. Credits & Closing Sequences', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 12: AI for Video Editors',
    lessons: [
      { title: '109. AI Editing Assistants', type: LessonType.VIDEO },
      { title: '110. AI Scene Detection', type: LessonType.VIDEO },
      { title: '111. AI Auto Reframing', type: LessonType.VIDEO },
      { title: '112. AI Caption Generation', type: LessonType.VIDEO },
      { title: '113. AI Voice Cleanup', type: LessonType.VIDEO },
      { title: '114. AI Music Generation', type: LessonType.VIDEO },
      { title: '115. AI Background Removal', type: LessonType.VIDEO },
      { title: '116. AI Object Removal', type: LessonType.VIDEO },
      { title: '117. AI Upscaling', type: LessonType.VIDEO },
      { title: '118. AI Video Enhancement', type: LessonType.VIDEO },
      { title: 'Project: Create an AI-assisted promotional video', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 13: DaVinci Resolve Basics',
    lessons: [
      { title: '119. Interface Overview', type: LessonType.VIDEO },
      { title: '120. Media Management', type: LessonType.VIDEO },
      { title: '121. Edit Page', type: LessonType.VIDEO },
      { title: '122. Fusion Basics', type: LessonType.VIDEO },
      { title: '123. Color Page', type: LessonType.VIDEO },
      { title: '124. Fairlight Audio', type: LessonType.VIDEO },
      { title: '125. Deliver Page', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 14: Workflow & Collaboration',
    lessons: [
      { title: '126. Project Organization', type: LessonType.VIDEO },
      { title: '127. Proxy Editing', type: LessonType.VIDEO },
      { title: '128. Team Collaboration', type: LessonType.VIDEO },
      { title: '129. File Sharing', type: LessonType.VIDEO },
      { title: '130. Version Control', type: LessonType.VIDEO },
      { title: '131. Backup Strategies', type: LessonType.VIDEO },
      { title: '132. Client Review Process', type: LessonType.VIDEO },
      { title: '133. Revision Management', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 15: Export & Delivery',
    lessons: [
      { title: '134. Export Formats', type: LessonType.VIDEO },
      { title: '135. H.264 & H.265', type: LessonType.VIDEO },
      { title: '136. YouTube Export', type: LessonType.VIDEO },
      { title: '137. Instagram Export', type: LessonType.VIDEO },
      { title: '138. Broadcast Export', type: LessonType.VIDEO },
      { title: '139. HDR Export', type: LessonType.VIDEO },
      { title: '140. Archive Projects', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 16: Freelancing & Business',
    lessons: [
      { title: '141. Building a Showreel', type: LessonType.VIDEO },
      { title: '142. Pricing Projects', type: LessonType.VIDEO },
      { title: '143. Client Communication', type: LessonType.VIDEO },
      { title: '144. Contracts', type: LessonType.VIDEO },
      { title: '145. Project Planning', type: LessonType.VIDEO },
      { title: '146. Time Management', type: LessonType.VIDEO },
      { title: '147. Freelance Platforms', type: LessonType.VIDEO },
      { title: '148. Personal Branding', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 17: YouTube Content Creation',
    lessons: [
      { title: '149. Video SEO', type: LessonType.VIDEO },
      { title: '150. Thumbnail Planning', type: LessonType.VIDEO },
      { title: '151. Audience Retention', type: LessonType.VIDEO },
      { title: '152. Story Hooks', type: LessonType.VIDEO },
      { title: '153. Playlist Strategy', type: LessonType.VIDEO },
      { title: '154. Analytics Basics', type: LessonType.VIDEO },
      { title: '155. Monetization', type: LessonType.VIDEO },
      { title: '156. Content Planning', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 18: Industry Simulation',
    lessons: [
      { title: 'Simulation: Edit projects for multiple client types', type: LessonType.ASSIGNMENT },
      { title: 'Client Brief Analysis & Deadlines', type: LessonType.VIDEO },
      { title: 'Review Meetings & Revision Cycles', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 19: Portfolio Development',
    lessons: [
      { title: 'Portfolio: Travel & Wedding Highlights', type: LessonType.ASSIGNMENT },
      { title: 'Portfolio: Corporate Video & Social Media Campaign', type: LessonType.ASSIGNMENT },
      { title: 'Portfolio: Music Video, YouTube Episode & Professional Showreel', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 20: Final Capstone Project',
    lessons: [
      { title: 'Capstone Overview (Choose from 10 Major Project Types)', type: LessonType.VIDEO },
      { title: 'Final Video Project Submission', type: LessonType.ASSIGNMENT },
    ],
  },
];

async function main() {
  console.log('Seeding Video Editing Master Course and Landing Page (CMS)...');

  const course = await prisma.course.upsert({
    where: { code: 'PVEM-2026' },
    update: {},
    create: {
      name: 'Professional Video Editing with AI Master Program',
      code: 'PVEM-2026',
      description: 'A 4-6 Month Professional Video Editing Master Program covering Adobe Premiere Pro, DaVinci Resolve, storytelling, and AI tools.',
      duration: '4-6 Months (220+ Hours)',
      fee: 50000,
      isPublished: true,
    },
  });
  console.log('✅ Base course created:', course.name);

  const lmsCourse = await prisma.lMSCourse.upsert({
    where: { courseId: course.id },
    update: {},
    create: {
      courseId: course.id,
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000&auto=format&fit=crop',
      outcomes: [
        '5 cinematic edits',
        '5 YouTube videos',
        '10 Instagram Reels/Shorts',
        '3 corporate videos',
        '2 wedding highlight films',
        '2 product commercials',
        '1 short film',
        'Professional editing showreel'
      ],
      prerequisites: ['Basic computer skills', 'Passion for storytelling'],
      isPublished: true,
      pricing: 50000,
      seoTitle: 'Video Editing Course 2026 - Master Premiere Pro & AI',
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
    where: { slug: 'video_editing_ai' },
    update: { isActive: true },
    create: { slug: 'video_editing_ai', title: 'Professional Video Editing with AI', description: 'Editable CMS page for the Video Editing Course.', isActive: true },
  });
  console.log('✅ CMS Landing Page upserted:', page.slug);

  const existingSections = await prisma.pageSection.count({ where: { landingPageId: page.id } });
  if (existingSections === 0) {
    await prisma.pageSection.createMany({
      data: [
        {
          landingPageId: page.id, sectionId: 'hero', sortOrder: 0,
          content: { type: 'html', html: `<div style="padding:80px 20px; text-align:center; background:#0F172A; color:#E11D48;"><h1 style="font-size:3rem; font-weight:bold; margin-bottom:1rem; color:#fff;">Professional Video Editing with AI Master Program</h1><p style="font-size:1.25rem; opacity:0.9; max-width:650px; margin:0 auto 2rem; color:#cbd5e1;">Master Premiere Pro, DaVinci Resolve, storytelling, and AI tools.</p><a href="#enroll" style="display:inline-block; padding:12px 24px; background:#E11D48; color:#fff; font-weight:bold; text-decoration:none; border-radius:4px;">Enroll Now</a></div>` }
        },
        {
          landingPageId: page.id, sectionId: 'details', sortOrder: 1,
          content: { type: 'html', html: `<div style="padding:60px 20px; max-width:800px; margin:0 auto; font-family:sans-serif;"><h2>Course Overview</h2><ul><li><strong>Duration:</strong> 4-6 Months (220+ Hours)</li><li><strong>Modules:</strong> 20</li><li><strong>Lessons:</strong> 150+</li><li><strong>Projects:</strong> 25+</li><li><strong>Portfolio:</strong> Professional Showreel</li></ul></div>` }
        }
      ]
    });
    console.log('✅ Default CMS sections created for the landing page.');
  }
  console.log('🎉 Video Editing course seeded completely!');
}

main().catch(console.error).finally(async () => await prisma.$disconnect());
