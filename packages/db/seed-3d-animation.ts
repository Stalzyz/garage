import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  {
    title: 'MODULE 1: Introduction to 3D Animation',
    lessons: [
      { title: '1. What is 3D Animation?', type: LessonType.VIDEO },
      { title: '2. Animation Industry Overview', type: LessonType.VIDEO },
      { title: '3. Production Pipeline', type: LessonType.VIDEO },
      { title: '4. Pre-production', type: LessonType.VIDEO },
      { title: '5. Production', type: LessonType.VIDEO },
      { title: '6. Post-production', type: LessonType.VIDEO },
      { title: '7. Career Opportunities', type: LessonType.VIDEO },
      { title: '8. Hardware Requirements', type: LessonType.VIDEO },
      { title: '9. Software Overview', type: LessonType.VIDEO },
      { title: '10. AI in 3D Production', type: LessonType.VIDEO },
      { title: 'Practical: Study animation pipelines & reference gathering', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 2: Autodesk Maya / Blender Interface',
    lessons: [
      { title: '11. User Interface', type: LessonType.VIDEO },
      { title: '12. Viewports', type: LessonType.VIDEO },
      { title: '13. Navigation', type: LessonType.VIDEO },
      { title: '14. Preferences', type: LessonType.VIDEO },
      { title: '15. Scene Organization', type: LessonType.VIDEO },
      { title: '16. Object Management', type: LessonType.VIDEO },
      { title: '17. Pivot Points', type: LessonType.VIDEO },
      { title: '18. Transform Tools', type: LessonType.VIDEO },
      { title: '19. Snapping Tools', type: LessonType.VIDEO },
      { title: '20. Outliner & Collections', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 3: 3D Modeling Fundamentals',
    lessons: [
      { title: '21. Polygon Modeling', type: LessonType.VIDEO },
      { title: '22. Primitive Objects', type: LessonType.VIDEO },
      { title: '23. Extrude Tool', type: LessonType.VIDEO },
      { title: '24. Bevel Tool', type: LessonType.VIDEO },
      { title: '25. Loop Cuts', type: LessonType.VIDEO },
      { title: '26. Bridge Tool', type: LessonType.VIDEO },
      { title: '27. Boolean Operations', type: LessonType.VIDEO },
      { title: '28. Topology Basics', type: LessonType.VIDEO },
      { title: '29. Edge Flow', type: LessonType.VIDEO },
      { title: '30. Clean Mesh Techniques', type: LessonType.VIDEO },
      { title: 'Project: Model everyday household objects', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 4: Hard Surface Modeling',
    lessons: [
      { title: '31. Product Modeling', type: LessonType.VIDEO },
      { title: '32. Vehicle Parts', type: LessonType.VIDEO },
      { title: '33. Furniture', type: LessonType.VIDEO },
      { title: '34. Mechanical Objects', type: LessonType.VIDEO },
      { title: '35. Electronics', type: LessonType.VIDEO },
      { title: '36. Architectural Assets', type: LessonType.VIDEO },
      { title: '37. Game Props', type: LessonType.VIDEO },
      { title: '38. Optimization', type: LessonType.VIDEO },
      { title: '39. High Poly vs Low Poly', type: LessonType.VIDEO },
      { title: '40. Asset Library Creation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 5: Organic Modeling',
    lessons: [
      { title: '41. Human Anatomy Basics', type: LessonType.VIDEO },
      { title: '42. Face Modeling', type: LessonType.VIDEO },
      { title: '43. Hands', type: LessonType.VIDEO },
      { title: '44. Feet', type: LessonType.VIDEO },
      { title: '45. Clothing', type: LessonType.VIDEO },
      { title: '46. Hair Basics', type: LessonType.VIDEO },
      { title: '47. Sculpting Introduction', type: LessonType.VIDEO },
      { title: '48. Character Topology', type: LessonType.VIDEO },
      { title: '49. Creature Modeling', type: LessonType.VIDEO },
      { title: '50. Stylized Characters', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 6: UV Mapping',
    lessons: [
      { title: '51. UV Concepts', type: LessonType.VIDEO },
      { title: '52. UV Unwrapping', type: LessonType.VIDEO },
      { title: '53. Seam Placement', type: LessonType.VIDEO },
      { title: '54. UV Packing', type: LessonType.VIDEO },
      { title: '55. Multi-UV Sets', type: LessonType.VIDEO },
      { title: '56. Texel Density', type: LessonType.VIDEO },
      { title: '57. UDIM Workflow', type: LessonType.VIDEO },
      { title: '58. UV Troubleshooting', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 7: Texturing & Materials',
    lessons: [
      { title: '59. PBR Workflow', type: LessonType.VIDEO },
      { title: '60. Material Editor', type: LessonType.VIDEO },
      { title: '61. Metalness', type: LessonType.VIDEO },
      { title: '62. Roughness', type: LessonType.VIDEO },
      { title: '63. Normal Maps', type: LessonType.VIDEO },
      { title: '64. Ambient Occlusion', type: LessonType.VIDEO },
      { title: '65. Smart Materials', type: LessonType.VIDEO },
      { title: '66. Decals', type: LessonType.VIDEO },
      { title: '67. Texture Painting', type: LessonType.VIDEO },
      { title: '68. Material Optimization', type: LessonType.VIDEO },
      { title: 'Project: Texture a complete product visualization scene', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 8: Substance 3D Painter',
    lessons: [
      { title: '69. Interface', type: LessonType.VIDEO },
      { title: '70. Baking Maps', type: LessonType.VIDEO },
      { title: '71. Smart Masks', type: LessonType.VIDEO },
      { title: '72. Smart Materials', type: LessonType.VIDEO },
      { title: '73. Layer Workflow', type: LessonType.VIDEO },
      { title: '74. Export Textures', type: LessonType.VIDEO },
      { title: '75. Wear & Tear', type: LessonType.VIDEO },
      { title: '76. Dirt Effects', type: LessonType.VIDEO },
      { title: '77. Fabric Materials', type: LessonType.VIDEO },
      { title: '78. Custom Materials', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 9: Lighting',
    lessons: [
      { title: '79. Three-Point Lighting', type: LessonType.VIDEO },
      { title: '80. HDRI Lighting', type: LessonType.VIDEO },
      { title: '81. Area Lights', type: LessonType.VIDEO },
      { title: '82. Spot Lights', type: LessonType.VIDEO },
      { title: '83. Directional Lights', type: LessonType.VIDEO },
      { title: '84. Volumetric Lighting', type: LessonType.VIDEO },
      { title: '85. Interior Lighting', type: LessonType.VIDEO },
      { title: '86. Exterior Lighting', type: LessonType.VIDEO },
      { title: '87. Product Lighting', type: LessonType.VIDEO },
      { title: '88. Cinematic Lighting', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 10: Cameras & Composition',
    lessons: [
      { title: '89. Camera Types', type: LessonType.VIDEO },
      { title: '90. Camera Movement', type: LessonType.VIDEO },
      { title: '91. Composition Rules', type: LessonType.VIDEO },
      { title: '92. Depth of Field', type: LessonType.VIDEO },
      { title: '93. Focal Length', type: LessonType.VIDEO },
      { title: '94. Camera Animation', type: LessonType.VIDEO },
      { title: '95. Cinematic Shots', type: LessonType.VIDEO },
      { title: '96. Storytelling with Camera', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 11: Rendering',
    lessons: [
      { title: '97. Render Engines', type: LessonType.VIDEO },
      { title: '98. Arnold', type: LessonType.VIDEO },
      { title: '99. Cycles', type: LessonType.VIDEO },
      { title: '100. Eevee', type: LessonType.VIDEO },
      { title: '101. Render Settings', type: LessonType.VIDEO },
      { title: '102. AOV Passes', type: LessonType.VIDEO },
      { title: '103. Denoising', type: LessonType.VIDEO },
      { title: '104. Render Optimization', type: LessonType.VIDEO },
      { title: '105. Render Farms', type: LessonType.VIDEO },
      { title: '106. Output Formats', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 12: Rigging',
    lessons: [
      { title: '107. Skeleton Creation', type: LessonType.VIDEO },
      { title: '108. Joints', type: LessonType.VIDEO },
      { title: '109. IK & FK', type: LessonType.VIDEO },
      { title: '110. Constraints', type: LessonType.VIDEO },
      { title: '111. Skinning', type: LessonType.VIDEO },
      { title: '112. Weight Painting', type: LessonType.VIDEO },
      { title: '113. Facial Rigging', type: LessonType.VIDEO },
      { title: '114. Controllers', type: LessonType.VIDEO },
      { title: '115. Rig Optimization', type: LessonType.VIDEO },
      { title: '116. Animation Controls', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 13: Character Animation',
    lessons: [
      { title: '117. 12 Principles of Animation', type: LessonType.VIDEO },
      { title: '118. Walk Cycle', type: LessonType.VIDEO },
      { title: '119. Run Cycle', type: LessonType.VIDEO },
      { title: '120. Jump', type: LessonType.VIDEO },
      { title: '121. Idle Animation', type: LessonType.VIDEO },
      { title: '122. Acting', type: LessonType.VIDEO },
      { title: '123. Lip Sync', type: LessonType.VIDEO },
      { title: '124. Facial Expressions', type: LessonType.VIDEO },
      { title: '125. Body Mechanics', type: LessonType.VIDEO },
      { title: '126. Performance Animation', type: LessonType.VIDEO },
      { title: 'Project: Animate a complete character sequence', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 14: Environment Creation',
    lessons: [
      { title: '127. Terrain', type: LessonType.VIDEO },
      { title: '128. Vegetation', type: LessonType.VIDEO },
      { title: '129. Buildings', type: LessonType.VIDEO },
      { title: '130. Roads', type: LessonType.VIDEO },
      { title: '131. Modular Assets', type: LessonType.VIDEO },
      { title: '132. Props', type: LessonType.VIDEO },
      { title: '133. Sky Systems', type: LessonType.VIDEO },
      { title: '134. Atmospheric Effects', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 15: Product Visualization',
    lessons: [
      { title: '135. Product Modeling', type: LessonType.VIDEO },
      { title: '136. Product Lighting', type: LessonType.VIDEO },
      { title: '137. Product Rendering', type: LessonType.VIDEO },
      { title: '138. Packaging Visualization', type: LessonType.VIDEO },
      { title: '139. Turntable Animation', type: LessonType.VIDEO },
      { title: '140. Marketing Visuals', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 16: Architectural Visualization',
    lessons: [
      { title: '141. Interior Modeling', type: LessonType.VIDEO },
      { title: '142. Exterior Modeling', type: LessonType.VIDEO },
      { title: '143. Materials', type: LessonType.VIDEO },
      { title: '144. Furniture Assets', type: LessonType.VIDEO },
      { title: '145. Day & Night Lighting', type: LessonType.VIDEO },
      { title: '146. Walkthrough Animation', type: LessonType.VIDEO },
      { title: '147. Photorealistic Rendering', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 17: AI for 3D Artists',
    lessons: [
      { title: '148. AI Concept Art', type: LessonType.VIDEO },
      { title: '149. AI Texture Generation', type: LessonType.VIDEO },
      { title: '150. AI Material Creation', type: LessonType.VIDEO },
      { title: '151. AI Background Generation', type: LessonType.VIDEO },
      { title: '152. AI Asset Generation', type: LessonType.VIDEO },
      { title: '153. AI Animation Assistance', type: LessonType.VIDEO },
      { title: '154. AI Motion Capture', type: LessonType.VIDEO },
      { title: '155. AI Upscaling', type: LessonType.VIDEO },
      { title: '156. AI Workflow Automation', type: LessonType.VIDEO },
      { title: '157. AI Render Enhancement', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 18: Simulation Basics',
    lessons: [
      { title: '158. Cloth Simulation', type: LessonType.VIDEO },
      { title: '159. Soft Body', type: LessonType.VIDEO },
      { title: '160. Rigid Body', type: LessonType.VIDEO },
      { title: '161. Fluid Simulation', type: LessonType.VIDEO },
      { title: '162. Smoke', type: LessonType.VIDEO },
      { title: '163. Fire', type: LessonType.VIDEO },
      { title: '164. Destruction', type: LessonType.VIDEO },
      { title: '165. Particle Systems', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 19: Compositing',
    lessons: [
      { title: '166. Render Passes', type: LessonType.VIDEO },
      { title: '167. Color Correction', type: LessonType.VIDEO },
      { title: '168. Depth Pass', type: LessonType.VIDEO },
      { title: '169. Shadow Pass', type: LessonType.VIDEO },
      { title: '170. Ambient Occlusion', type: LessonType.VIDEO },
      { title: '171. Motion Blur', type: LessonType.VIDEO },
      { title: '172. Final Composite', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 20: Game Asset Pipeline',
    lessons: [
      { title: '173. Low Poly Modeling', type: LessonType.VIDEO },
      { title: '174. Baking', type: LessonType.VIDEO },
      { title: '175. Game Textures', type: LessonType.VIDEO },
      { title: '176. Asset Optimization', type: LessonType.VIDEO },
      { title: '177. LODs', type: LessonType.VIDEO },
      { title: '178. FBX Export', type: LessonType.VIDEO },
      { title: '179. Unity Basics', type: LessonType.VIDEO },
      { title: '180. Unreal Engine Basics', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 21: Freelancing & Studio Workflow',
    lessons: [
      { title: '181. Client Briefs', type: LessonType.VIDEO },
      { title: '182. Project Planning', type: LessonType.VIDEO },
      { title: '183. Pricing', type: LessonType.VIDEO },
      { title: '184. Contracts', type: LessonType.VIDEO },
      { title: '185. Asset Delivery', type: LessonType.VIDEO },
      { title: '186. Render Delivery', type: LessonType.VIDEO },
      { title: '187. Revision Workflow', type: LessonType.VIDEO },
      { title: '188. Portfolio Pricing', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 22: Industry Simulation',
    lessons: [
      { title: 'Simulation: Client Projects for Ad/Game/Animation Studios', type: LessonType.ASSIGNMENT },
      { title: 'Team Collaboration & Asset Reviews', type: LessonType.VIDEO },
      { title: 'Production Meetings & Render Approval', type: LessonType.VIDEO },
      { title: 'Client Presentation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 23: Portfolio Development',
    lessons: [
      { title: 'Portfolio: Product Vis, Character, Environment, Arch Render', type: LessonType.ASSIGNMENT },
      { title: 'Portfolio: Animation Reel & Turntable Showcase', type: LessonType.ASSIGNMENT },
      { title: 'ArtStation Portfolio & LinkedIn Profile setup', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 24: Final Capstone Project',
    lessons: [
      { title: 'Capstone Overview (Choose from 10 Project Types)', type: LessonType.VIDEO },
      { title: 'Final Capstone Project Submission', type: LessonType.ASSIGNMENT },
    ],
  },
];

async function main() {
  console.log('Seeding 3D Animation Course and Landing Page (CMS)...');

  const course = await prisma.course.upsert({
    where: { code: 'P3DA-2026' },
    update: {},
    create: {
      name: 'Professional 3D Animation with AI Master Program',
      code: 'P3DA-2026',
      description: 'An 8-10 Month Professional 3D Animation Program covering Maya, Blender, modeling, texturing, rigging, animation, rendering, and AI tools.',
      duration: '8-10 Months (400+ Hours)',
      fee: 80000,
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
        '15 hard-surface models',
        '5 organic character models',
        '5 fully textured assets',
        '3 product visualization projects',
        '2 architectural visualization scenes',
        '2 environment projects',
        '2 rigged characters',
        '3 animated character sequences',
        '1 complete CGI advertisement',
        '1 professional animation showreel',
        '1 ArtStation-ready portfolio'
      ],
      prerequisites: ['Basic computer skills', 'Creative aptitude'],
      isPublished: true,
      pricing: 80000,
      seoTitle: '3D Animation Course 2026 - Master Maya, Blender & AI',
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
    where: { slug: '3d_animation' },
    update: { isActive: true },
    create: { slug: '3d_animation', title: 'Professional 3D Animation with AI', description: 'Editable CMS page for the 3D Animation Course.', isActive: true },
  });
  console.log('✅ CMS Landing Page upserted:', page.slug);

  const existingSections = await prisma.pageSection.count({ where: { landingPageId: page.id } });
  if (existingSections === 0) {
    await prisma.pageSection.createMany({
      data: [
        {
          landingPageId: page.id, sectionId: 'hero', sortOrder: 0,
          content: { type: 'html', html: `<div style="padding:80px 20px; text-align:center; background:#18181b; color:#fff;"><h1 style="font-size:3rem; font-weight:bold; margin-bottom:1rem; color:#fff;">Professional 3D Animation with AI Master Program</h1><p style="font-size:1.25rem; opacity:0.9; max-width:650px; margin:0 auto 2rem; color:#a1a1aa;">Master Maya, Blender, Substance Painter, and AI tools for an industry-ready 3D portfolio.</p><a href="#enroll" style="display:inline-block; padding:12px 24px; background:#10b981; color:#fff; font-weight:bold; text-decoration:none; border-radius:4px;">Enroll Now</a></div>` }
        },
        {
          landingPageId: page.id, sectionId: 'details', sortOrder: 1,
          content: { type: 'html', html: `<div style="padding:60px 20px; max-width:800px; margin:0 auto; font-family:sans-serif;"><h2>Course Overview</h2><ul><li><strong>Duration:</strong> 8-10 Months (400+ Hours)</li><li><strong>Modules:</strong> 24</li><li><strong>Lessons:</strong> 220+</li><li><strong>Projects:</strong> 30+</li><li><strong>Portfolio:</strong> Industry-Ready 3D Showreel</li></ul></div>` }
        }
      ]
    });
    console.log('✅ Default CMS sections created for the landing page.');
  }
  console.log('🎉 3D Animation course seeded completely!');
}

main().catch(console.error).finally(async () => await prisma.$disconnect());
