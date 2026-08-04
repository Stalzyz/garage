import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  {
    title: 'MODULE 1: Introduction to VFX',
    lessons: [
      { title: '1. What is VFX?', type: LessonType.VIDEO },
      { title: '2. History of Visual Effects', type: LessonType.VIDEO },
      { title: '3. Film Production Pipeline', type: LessonType.VIDEO },
      { title: '4. VFX Production Pipeline', type: LessonType.VIDEO },
      { title: '5. Live Action vs CGI', type: LessonType.VIDEO },
      { title: '6. Types of Visual Effects', type: LessonType.VIDEO },
      { title: '7. Career Opportunities', type: LessonType.VIDEO },
      { title: '8. Industry Software', type: LessonType.VIDEO },
      { title: '9. Hardware Requirements', type: LessonType.VIDEO },
      { title: '10. AI in VFX', type: LessonType.VIDEO },
      { title: 'Practical: Analyze VFX breakdowns', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 2: Digital Imaging Fundamentals',
    lessons: [
      { title: '11. Resolution', type: LessonType.VIDEO },
      { title: '12. Frame Rates', type: LessonType.VIDEO },
      { title: '13. Bit Depth', type: LessonType.VIDEO },
      { title: '14. Color Spaces', type: LessonType.VIDEO },
      { title: '15. Dynamic Range', type: LessonType.VIDEO },
      { title: '16. HDR', type: LessonType.VIDEO },
      { title: '17. RAW Formats', type: LessonType.VIDEO },
      { title: '18. EXR Workflow', type: LessonType.VIDEO },
      { title: '19. Alpha Channels', type: LessonType.VIDEO },
      { title: '20. Image Sequences', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 3: Adobe After Effects Fundamentals',
    lessons: [
      { title: '21. Interface', type: LessonType.VIDEO },
      { title: '22. Compositions', type: LessonType.VIDEO },
      { title: '23. Layers', type: LessonType.VIDEO },
      { title: '24. Keyframes', type: LessonType.VIDEO },
      { title: '25. Masks', type: LessonType.VIDEO },
      { title: '26. Blend Modes', type: LessonType.VIDEO },
      { title: '27. Parenting', type: LessonType.VIDEO },
      { title: '28. Pre-Compositions', type: LessonType.VIDEO },
      { title: '29. Graph Editor', type: LessonType.VIDEO },
      { title: '30. Expressions Basics', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 4: Compositing Fundamentals',
    lessons: [
      { title: '31. Layer Compositing', type: LessonType.VIDEO },
      { title: '32. Alpha Channels', type: LessonType.VIDEO },
      { title: '33. Matte Operations', type: LessonType.VIDEO },
      { title: '34. Blend Modes', type: LessonType.VIDEO },
      { title: '35. Color Correction', type: LessonType.VIDEO },
      { title: '36. Depth Compositing', type: LessonType.VIDEO },
      { title: '37. Render Order', type: LessonType.VIDEO },
      { title: '38. Edge Cleanup', type: LessonType.VIDEO },
      { title: '39. Multi-Pass Compositing', type: LessonType.VIDEO },
      { title: '40. Final Output', type: LessonType.VIDEO },
      { title: 'Project: Composite a CGI object into live-action footage', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 5: Green Screen & Keying',
    lessons: [
      { title: '41. Chroma Key Basics', type: LessonType.VIDEO },
      { title: '42. Keylight', type: LessonType.VIDEO },
      { title: '43. Primatte', type: LessonType.VIDEO },
      { title: '44. Spill Suppression', type: LessonType.VIDEO },
      { title: '45. Edge Refinement', type: LessonType.VIDEO },
      { title: '46. Hair Keying', type: LessonType.VIDEO },
      { title: '47. Garbage Mattes', type: LessonType.VIDEO },
      { title: '48. Light Wrap', type: LessonType.VIDEO },
      { title: '49. Shadow Integration', type: LessonType.VIDEO },
      { title: '50. Background Replacement', type: LessonType.VIDEO },
      { title: 'Project: Replace a green-screen background', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 6: Rotoscoping',
    lessons: [
      { title: '51. Roto Brush', type: LessonType.VIDEO },
      { title: '52. Bezier Masks', type: LessonType.VIDEO },
      { title: '53. Advanced Masking', type: LessonType.VIDEO },
      { title: '54. Feathering', type: LessonType.VIDEO },
      { title: '55. Motion Blur', type: LessonType.VIDEO },
      { title: '56. Character Isolation', type: LessonType.VIDEO },
      { title: '57. Hair Rotoscoping', type: LessonType.VIDEO },
      { title: '58. Edge Refinement', type: LessonType.VIDEO },
      { title: '59. Cleanup', type: LessonType.VIDEO },
      { title: '60. Production Workflow', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 7: Paint & Cleanup',
    lessons: [
      { title: '61. Clone Stamp', type: LessonType.VIDEO },
      { title: '62. Wire Removal', type: LessonType.VIDEO },
      { title: '63. Object Removal', type: LessonType.VIDEO },
      { title: '64. Dust Cleanup', type: LessonType.VIDEO },
      { title: '65. Beauty Cleanup', type: LessonType.VIDEO },
      { title: '66. Reflection Removal', type: LessonType.VIDEO },
      { title: '67. Patch Techniques', type: LessonType.VIDEO },
      { title: '68. Frame-by-Frame Painting', type: LessonType.VIDEO },
      { title: '69. Plate Cleanup', type: LessonType.VIDEO },
      { title: '70. Final Integration', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 8: Motion Tracking',
    lessons: [
      { title: '71. Point Tracking', type: LessonType.VIDEO },
      { title: '72. Planar Tracking', type: LessonType.VIDEO },
      { title: '73. Camera Tracking', type: LessonType.VIDEO },
      { title: '74. Object Tracking', type: LessonType.VIDEO },
      { title: '75. Surface Tracking', type: LessonType.VIDEO },
      { title: '76. Corner Pin', type: LessonType.VIDEO },
      { title: '77. Stabilization', type: LessonType.VIDEO },
      { title: '78. Data Export', type: LessonType.VIDEO },
      { title: '79. Motion Graphics Integration', type: LessonType.VIDEO },
      { title: '80. Tracking Troubleshooting', type: LessonType.VIDEO },
      { title: 'Project: Insert graphics onto a moving object', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 9: Matchmoving',
    lessons: [
      { title: '81. Camera Solving', type: LessonType.VIDEO },
      { title: '82. Lens Distortion', type: LessonType.VIDEO },
      { title: '83. Ground Plane Setup', type: LessonType.VIDEO },
      { title: '84. Scene Alignment', type: LessonType.VIDEO },
      { title: '85. Scale Matching', type: LessonType.VIDEO },
      { title: '86. Export to 3D Software', type: LessonType.VIDEO },
      { title: '87. Matchmove Cleanup', type: LessonType.VIDEO },
      { title: '88. Practical Integration', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 10: CGI Integration',
    lessons: [
      { title: '89. Multi-Pass Rendering', type: LessonType.VIDEO },
      { title: '90. Shadow Catchers', type: LessonType.VIDEO },
      { title: '91. Reflection Matching', type: LessonType.VIDEO },
      { title: '92. Light Matching', type: LessonType.VIDEO },
      { title: '93. Perspective Matching', type: LessonType.VIDEO },
      { title: '94. Camera Matching', type: LessonType.VIDEO },
      { title: '95. Depth Integration', type: LessonType.VIDEO },
      { title: '96. Atmospheric Effects', type: LessonType.VIDEO },
      { title: '97. Final Composite', type: LessonType.VIDEO },
      { title: '98. Render Optimization', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 11: Particle Systems',
    lessons: [
      { title: '99. Particle Emitters', type: LessonType.VIDEO },
      { title: '100. Sparks', type: LessonType.VIDEO },
      { title: '101. Dust', type: LessonType.VIDEO },
      { title: '102. Smoke', type: LessonType.VIDEO },
      { title: '103. Fire', type: LessonType.VIDEO },
      { title: '104. Rain', type: LessonType.VIDEO },
      { title: '105. Snow', type: LessonType.VIDEO },
      { title: '106. Debris', type: LessonType.VIDEO },
      { title: '107. Magic Effects', type: LessonType.VIDEO },
      { title: '108. Environmental Effects', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 12: Advanced Compositing',
    lessons: [
      { title: '109. Color Matching', type: LessonType.VIDEO },
      { title: '110. Lens Effects', type: LessonType.VIDEO },
      { title: '111. Depth of Field', type: LessonType.VIDEO },
      { title: '112. Motion Blur', type: LessonType.VIDEO },
      { title: '113. Chromatic Aberration', type: LessonType.VIDEO },
      { title: '114. Film Grain', type: LessonType.VIDEO },
      { title: '115. Glows', type: LessonType.VIDEO },
      { title: '116. Lens Flares', type: LessonType.VIDEO },
      { title: '117. Fog', type: LessonType.VIDEO },
      { title: '118. Atmospherics', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 13: 3D Compositing',
    lessons: [
      { title: '119. 3D Layers', type: LessonType.VIDEO },
      { title: '120. Cameras', type: LessonType.VIDEO },
      { title: '121. Lights', type: LessonType.VIDEO },
      { title: '122. Shadows', type: LessonType.VIDEO },
      { title: '123. 3D Text', type: LessonType.VIDEO },
      { title: '124. 3D Logos', type: LessonType.VIDEO },
      { title: '125. Camera Projection', type: LessonType.VIDEO },
      { title: '126. Multi-Layer Compositing', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 14: Nuke Fundamentals',
    lessons: [
      { title: '127. Node-Based Workflow', type: LessonType.VIDEO },
      { title: '128. Read Nodes', type: LessonType.VIDEO },
      { title: '129. Merge Nodes', type: LessonType.VIDEO },
      { title: '130. Transform Nodes', type: LessonType.VIDEO },
      { title: '131. Color Correct Nodes', type: LessonType.VIDEO },
      { title: '132. Shuffle Nodes', type: LessonType.VIDEO },
      { title: '133. Keyer Nodes', type: LessonType.VIDEO },
      { title: '134. Write Nodes', type: LessonType.VIDEO },
      { title: '135. Gizmos', type: LessonType.VIDEO },
      { title: '136. Node Organization', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 15: Virtual Production',
    lessons: [
      { title: '137. LED Volume Basics', type: LessonType.VIDEO },
      { title: '138. Unreal Engine for VFX', type: LessonType.VIDEO },
      { title: '139. Camera Tracking Systems', type: LessonType.VIDEO },
      { title: '140. Virtual Cameras', type: LessonType.VIDEO },
      { title: '141. Environment Setup', type: LessonType.VIDEO },
      { title: '142. Green Screen vs LED', type: LessonType.VIDEO },
      { title: '143. Virtual Sets', type: LessonType.VIDEO },
      { title: '144. Production Workflow', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 16: AI for VFX',
    lessons: [
      { title: '145. AI Rotoscoping', type: LessonType.VIDEO },
      { title: '146. AI Object Removal', type: LessonType.VIDEO },
      { title: '147. AI Background Extension', type: LessonType.VIDEO },
      { title: '148. AI Frame Interpolation', type: LessonType.VIDEO },
      { title: '149. AI Upscaling', type: LessonType.VIDEO },
      { title: '150. AI Video Enhancement', type: LessonType.VIDEO },
      { title: '151. AI Motion Tracking', type: LessonType.VIDEO },
      { title: '152. AI Asset Generation', type: LessonType.VIDEO },
      { title: '153. AI Plate Cleanup', type: LessonType.VIDEO },
      { title: '154. AI Workflow Automation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 17: Color Management',
    lessons: [
      { title: '155. ACES Workflow', type: LessonType.VIDEO },
      { title: '156. LUTs', type: LessonType.VIDEO },
      { title: '157. Color Pipelines', type: LessonType.VIDEO },
      { title: '158. Linear Workflow', type: LessonType.VIDEO },
      { title: '159. HDR Grading', type: LessonType.VIDEO },
      { title: '160. Monitor Calibration', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 18: Rendering & Optimization',
    lessons: [
      { title: '161. Render Passes', type: LessonType.VIDEO },
      { title: '162. EXR Workflow', type: LessonType.VIDEO },
      { title: '163. Multi-Channel EXR', type: LessonType.VIDEO },
      { title: '164. Render Layers', type: LessonType.VIDEO },
      { title: '165. Optimization Techniques', type: LessonType.VIDEO },
      { title: '166. Cache Management', type: LessonType.VIDEO },
      { title: '167. Final Delivery', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 19: Film & Commercial VFX',
    lessons: [
      { title: '168. Film Shots', type: LessonType.ASSIGNMENT },
      { title: '169. OTT Series', type: LessonType.ASSIGNMENT },
      { title: '170. Television Commercials', type: LessonType.ASSIGNMENT },
      { title: '171. Music Videos', type: LessonType.ASSIGNMENT },
      { title: '172. Product Commercials', type: LessonType.ASSIGNMENT },
      { title: '173. Social Media Campaigns', type: LessonType.ASSIGNMENT },
      { title: '174. Corporate Films', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 20: Freelancing & Studio Workflow',
    lessons: [
      { title: '175. Production Scheduling', type: LessonType.VIDEO },
      { title: '176. Shot Management', type: LessonType.VIDEO },
      { title: '177. Client Communication', type: LessonType.VIDEO },
      { title: '178. Review Sessions', type: LessonType.VIDEO },
      { title: '179. Pricing', type: LessonType.VIDEO },
      { title: '180. Contracts', type: LessonType.VIDEO },
      { title: '181. Portfolio Building', type: LessonType.VIDEO },
      { title: '182. Freelance Platforms', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 21: Industry Simulation',
    lessons: [
      { title: 'Feature Film Sequence', type: LessonType.ASSIGNMENT },
      { title: 'Commercial Advertisement', type: LessonType.ASSIGNMENT },
      { title: 'OTT Title Sequence', type: LessonType.ASSIGNMENT },
      { title: 'Green Screen Studio Shoot', type: LessonType.ASSIGNMENT },
      { title: 'CGI Integration Project', type: LessonType.ASSIGNMENT },
      { title: 'Cleanup & Roto Pipeline', type: LessonType.ASSIGNMENT },
      { title: 'Client Presentation', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 22: Portfolio Development',
    lessons: [
      { title: 'Rotoscoping & Matchmove Reels', type: LessonType.ASSIGNMENT },
      { title: 'Compositing & Green Screen Reels', type: LessonType.ASSIGNMENT },
      { title: 'CGI Integration & Paint/Cleanup Reels', type: LessonType.ASSIGNMENT },
      { title: 'Professional Breakdown Videos', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 23: Interview & Studio Preparation',
    lessons: [
      { title: '197. Studio Pipeline', type: LessonType.VIDEO },
      { title: '198. Shot Breakdown', type: LessonType.VIDEO },
      { title: '199. Review Etiquette', type: LessonType.VIDEO },
      { title: '200. Team Collaboration', type: LessonType.VIDEO },
      { title: '201. File Organization & Naming Conventions', type: LessonType.VIDEO },
      { title: '202. Showreel Presentation', type: LessonType.VIDEO },
      { title: '203. Interview Preparation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 24: Final Capstone Project',
    lessons: [
      { title: 'Capstone Overview (Choose from 10 VFX Shots)', type: LessonType.VIDEO },
      { title: 'Final VFX Sequence Delivery', type: LessonType.ASSIGNMENT },
    ],
  },
];

async function main() {
  console.log('Seeding VFX Course and Landing Page (CMS)...');

  const course = await prisma.course.upsert({
    where: { code: 'PVFX-2026' },
    update: {},
    create: {
      name: 'Professional VFX & Compositing with AI Master Program',
      code: 'PVFX-2026',
      description: 'An 8-10 Month Professional VFX & Compositing Program covering After Effects, Nuke, Virtual Production, and AI tools.',
      duration: '8-10 Months (400+ Hours)',
      fee: 85000,
      isPublished: true,
    },
  });
  console.log('✅ Base course created:', course.name);

  const lmsCourse = await prisma.lMSCourse.upsert({
    where: { courseId: course.id },
    update: {},
    create: {
      courseId: course.id,
      thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop',
      outcomes: [
        '5 green-screen composites',
        '5 motion tracking projects',
        '3 camera tracking projects',
        '3 paint and cleanup projects',
        '3 CGI integration shots',
        '2 particle effects sequences',
        '2 virtual production demos',
        '2 Nuke compositing projects',
        '1 commercial-quality VFX sequence',
        '1 complete professional VFX showreel',
        '1 portfolio with shot breakdowns'
      ],
      prerequisites: ['Basic computer skills', 'Creative aptitude'],
      isPublished: true,
      pricing: 85000,
      seoTitle: 'VFX & Compositing Course 2026 - Master Nuke, After Effects & AI',
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
    where: { slug: 'vfx_compositing' },
    update: { isActive: true },
    create: { slug: 'vfx_compositing', title: 'Professional VFX & Compositing with AI', description: 'Editable CMS page for the VFX Course.', isActive: true },
  });
  console.log('✅ CMS Landing Page upserted:', page.slug);

  const existingSections = await prisma.pageSection.count({ where: { landingPageId: page.id } });
  if (existingSections === 0) {
    await prisma.pageSection.createMany({
      data: [
        {
          landingPageId: page.id, sectionId: 'hero', sortOrder: 0,
          content: { type: 'html', html: `<div style="padding:80px 20px; text-align:center; background:#020617; color:#fff;"><h1 style="font-size:3rem; font-weight:bold; margin-bottom:1rem; color:#fff;">Professional VFX & Compositing with AI Master Program</h1><p style="font-size:1.25rem; opacity:0.9; max-width:650px; margin:0 auto 2rem; color:#94a3b8;">Master After Effects, Foundry Nuke, and AI tools for an industry-ready visual effects portfolio.</p><a href="#enroll" style="display:inline-block; padding:12px 24px; background:#06b6d4; color:#fff; font-weight:bold; text-decoration:none; border-radius:4px;">Enroll Now</a></div>` }
        },
        {
          landingPageId: page.id, sectionId: 'details', sortOrder: 1,
          content: { type: 'html', html: `<div style="padding:60px 20px; max-width:800px; margin:0 auto; font-family:sans-serif;"><h2>Course Overview</h2><ul><li><strong>Duration:</strong> 8-10 Months (400+ Hours)</li><li><strong>Modules:</strong> 24</li><li><strong>Lessons:</strong> 220+</li><li><strong>Projects:</strong> 30+</li><li><strong>Portfolio:</strong> Industry-Ready VFX Showreel</li></ul></div>` }
        }
      ]
    });
    console.log('✅ Default CMS sections created for the landing page.');
  }
  console.log('🎉 VFX course seeded completely!');
}

main().catch(console.error).finally(async () => await prisma.$disconnect());
