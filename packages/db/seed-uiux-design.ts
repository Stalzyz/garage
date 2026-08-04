import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  {
    title: 'MODULE 1: Introduction to UI/UX Design',
    lessons: [
      { title: '1. What is UI Design?', type: LessonType.VIDEO },
      { title: '2. What is UX Design?', type: LessonType.VIDEO },
      { title: '3. Difference Between UI & UX', type: LessonType.VIDEO },
      { title: '4. Product Design Overview', type: LessonType.VIDEO },
      { title: '5. Design Thinking Process', type: LessonType.VIDEO },
      { title: '6. User-Centered Design', type: LessonType.VIDEO },
      { title: '7. Human-Centered Design', type: LessonType.VIDEO },
      { title: '8. Digital Product Lifecycle', type: LessonType.VIDEO },
      { title: '9. UI/UX Career Opportunities', type: LessonType.VIDEO },
      { title: '10. Future of AI in UI/UX', type: LessonType.VIDEO },
      { title: 'Practical: Analyze 10 popular mobile apps', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 2: UX Fundamentals',
    lessons: [
      { title: '11. User Experience Principles', type: LessonType.VIDEO },
      { title: '12. Business Goals vs User Goals', type: LessonType.VIDEO },
      { title: '13. User Needs', type: LessonType.VIDEO },
      { title: '14. User Behavior', type: LessonType.VIDEO },
      { title: '15. Cognitive Psychology', type: LessonType.VIDEO },
      { title: '16. Mental Models', type: LessonType.VIDEO },
      { title: '17. Usability Principles', type: LessonType.VIDEO },
      { title: '18. Nielsen’s Heuristics', type: LessonType.VIDEO },
      { title: '19. Accessibility Basics', type: LessonType.VIDEO },
      { title: '20. Inclusive Design', type: LessonType.VIDEO },
      { title: 'Assignment: Evaluate an existing website using usability heuristics', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 3: UX Research',
    lessons: [
      { title: '21. Research Methods', type: LessonType.VIDEO },
      { title: '22. Primary vs Secondary Research', type: LessonType.VIDEO },
      { title: '23. Stakeholder Interviews', type: LessonType.VIDEO },
      { title: '24. User Interviews', type: LessonType.VIDEO },
      { title: '25. Surveys', type: LessonType.VIDEO },
      { title: '26. Competitive Analysis', type: LessonType.VIDEO },
      { title: '27. Market Research', type: LessonType.VIDEO },
      { title: '28. Affinity Mapping', type: LessonType.VIDEO },
      { title: '29. User Personas', type: LessonType.VIDEO },
      { title: '30. Empathy Maps', type: LessonType.VIDEO },
      { title: '31. Customer Journey Maps', type: LessonType.VIDEO },
      { title: '32. Experience Maps', type: LessonType.VIDEO },
      { title: '33. User Scenarios', type: LessonType.VIDEO },
      { title: '34. Problem Statements', type: LessonType.VIDEO },
      { title: '35. How Might We Questions', type: LessonType.VIDEO },
      { title: 'Project: Conduct UX research for a food delivery app', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 4: Information Architecture',
    lessons: [
      { title: '36. Content Inventory', type: LessonType.VIDEO },
      { title: '37. Content Hierarchy', type: LessonType.VIDEO },
      { title: '38. Card Sorting', type: LessonType.VIDEO },
      { title: '39. Tree Testing', type: LessonType.VIDEO },
      { title: '40. Navigation Design', type: LessonType.VIDEO },
      { title: '41. Sitemap Creation', type: LessonType.VIDEO },
      { title: '42. User Flow Design', type: LessonType.VIDEO },
      { title: '43. Task Flow Design', type: LessonType.VIDEO },
      { title: '44. Process Flow', type: LessonType.VIDEO },
      { title: '45. Feature Prioritization', type: LessonType.VIDEO },
      { title: 'Assignment: Design the IA for an e-commerce platform', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 5: Wireframing',
    lessons: [
      { title: '46. Low-Fidelity Wireframes', type: LessonType.VIDEO },
      { title: '47. Mid-Fidelity Wireframes', type: LessonType.VIDEO },
      { title: '48. High-Fidelity Wireframes', type: LessonType.VIDEO },
      { title: '49. Sketching Interfaces', type: LessonType.VIDEO },
      { title: '50. Mobile Wireframes', type: LessonType.VIDEO },
      { title: '51. Desktop Wireframes', type: LessonType.VIDEO },
      { title: '52. Tablet Layouts', type: LessonType.VIDEO },
      { title: '53. Dashboard Wireframes', type: LessonType.VIDEO },
      { title: '54. Landing Pages', type: LessonType.VIDEO },
      { title: '55. Form Design', type: LessonType.VIDEO },
      { title: 'Practical: Wireframe five different applications', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 6: Visual Design Principles',
    lessons: [
      { title: '56. Layout Principles', type: LessonType.VIDEO },
      { title: '57. Grid Systems', type: LessonType.VIDEO },
      { title: '58. White Space', type: LessonType.VIDEO },
      { title: '59. Typography', type: LessonType.VIDEO },
      { title: '60. Color Systems', type: LessonType.VIDEO },
      { title: '61. Icons', type: LessonType.VIDEO },
      { title: '62. Imagery', type: LessonType.VIDEO },
      { title: '63. Visual Hierarchy', type: LessonType.VIDEO },
      { title: '64. Consistency', type: LessonType.VIDEO },
      { title: '65. Responsive Design', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 7: Figma Essentials',
    lessons: [
      { title: '66. Figma Interface', type: LessonType.VIDEO },
      { title: '67. Frames', type: LessonType.VIDEO },
      { title: '68. Shapes', type: LessonType.VIDEO },
      { title: '69. Layers', type: LessonType.VIDEO },
      { title: '70. Constraints', type: LessonType.VIDEO },
      { title: '71. Auto Layout', type: LessonType.VIDEO },
      { title: '72. Components', type: LessonType.VIDEO },
      { title: '73. Variants', type: LessonType.VIDEO },
      { title: '74. Variables', type: LessonType.VIDEO },
      { title: '75. Styles', type: LessonType.VIDEO },
      { title: '76. Libraries', type: LessonType.VIDEO },
      { title: '77. Team Collaboration', type: LessonType.VIDEO },
      { title: '78. Version History', type: LessonType.VIDEO },
      { title: '79. Plugins', type: LessonType.VIDEO },
      { title: '80. Export Assets', type: LessonType.VIDEO },
      { title: 'Project: Recreate a popular mobile app UI in Figma', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 8: Design Systems',
    lessons: [
      { title: '81. Design Tokens', type: LessonType.VIDEO },
      { title: '82. Atomic Design', type: LessonType.VIDEO },
      { title: '83. Component Libraries', type: LessonType.VIDEO },
      { title: '84. Buttons', type: LessonType.VIDEO },
      { title: '85. Inputs', type: LessonType.VIDEO },
      { title: '86. Cards', type: LessonType.VIDEO },
      { title: '87. Navigation Components', type: LessonType.VIDEO },
      { title: '88. Tables', type: LessonType.VIDEO },
      { title: '89. Modals', type: LessonType.VIDEO },
      { title: '90. Alerts', type: LessonType.VIDEO },
      { title: '91. Forms', type: LessonType.VIDEO },
      { title: '92. Responsive Components', type: LessonType.VIDEO },
      { title: '93. Documentation', type: LessonType.VIDEO },
      { title: '94. Maintaining Design Systems', type: LessonType.VIDEO },
      { title: '95. Enterprise Design Systems', type: LessonType.VIDEO },
      { title: 'Project: Build a reusable design system from scratch', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 9: Mobile App Design',
    lessons: [
      { title: '96. iOS Guidelines', type: LessonType.VIDEO },
      { title: '97. Android Material Design', type: LessonType.VIDEO },
      { title: '98. Navigation Patterns', type: LessonType.VIDEO },
      { title: '99. Bottom Navigation', type: LessonType.VIDEO },
      { title: '100. Tab Bars', type: LessonType.VIDEO },
      { title: '101. Gestures', type: LessonType.VIDEO },
      { title: '102. Mobile Forms', type: LessonType.VIDEO },
      { title: '103. Mobile Accessibility', type: LessonType.VIDEO },
      { title: '104. Mobile Microinteractions', type: LessonType.VIDEO },
      { title: '105. App Store Assets', type: LessonType.VIDEO },
      { title: 'Project: Design a banking mobile application', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 10: Web Application Design',
    lessons: [
      { title: '106. SaaS Dashboards', type: LessonType.VIDEO },
      { title: '107. CRM Interfaces', type: LessonType.VIDEO },
      { title: '108. Analytics Dashboards', type: LessonType.VIDEO },
      { title: '109. Admin Panels', type: LessonType.VIDEO },
      { title: '110. E-commerce Websites', type: LessonType.VIDEO },
      { title: '111. Landing Pages', type: LessonType.VIDEO },
      { title: '112. Portfolio Websites', type: LessonType.VIDEO },
      { title: '113. Enterprise Software', type: LessonType.VIDEO },
      { title: '114. Data Visualization', type: LessonType.VIDEO },
      { title: '115. Empty States', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 11: Interaction Design',
    lessons: [
      { title: '116. Interaction Principles', type: LessonType.VIDEO },
      { title: '117. Microinteractions', type: LessonType.VIDEO },
      { title: '118. Motion Design', type: LessonType.VIDEO },
      { title: '119. Loading States', type: LessonType.VIDEO },
      { title: '120. Hover States', type: LessonType.VIDEO },
      { title: '121. Feedback Systems', type: LessonType.VIDEO },
      { title: '122. Error Handling', type: LessonType.VIDEO },
      { title: '123. Success States', type: LessonType.VIDEO },
      { title: '124. Onboarding Flows', type: LessonType.VIDEO },
      { title: '125. Progressive Disclosure', type: LessonType.VIDEO },
      { title: 'Project: Prototype complete app interactions', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 12: Prototyping',
    lessons: [
      { title: '126. Interactive Components', type: LessonType.VIDEO },
      { title: '127. Smart Animate', type: LessonType.VIDEO },
      { title: '128. Overlay', type: LessonType.VIDEO },
      { title: '129. Variables in Prototypes', type: LessonType.VIDEO },
      { title: '130. Prototype Testing', type: LessonType.VIDEO },
      { title: '131. Presentation Mode', type: LessonType.VIDEO },
      { title: '132. Developer Handoff', type: LessonType.VIDEO },
      { title: '133. Interactive Presentations', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 13: UX Testing',
    lessons: [
      { title: '134. Usability Testing', type: LessonType.VIDEO },
      { title: '135. A/B Testing', type: LessonType.VIDEO },
      { title: '136. Heatmaps', type: LessonType.VIDEO },
      { title: '137. Analytics', type: LessonType.VIDEO },
      { title: '138. User Feedback', type: LessonType.VIDEO },
      { title: '139. Observation Techniques', type: LessonType.VIDEO },
      { title: '140. Accessibility Testing', type: LessonType.VIDEO },
      { title: '141. Task Analysis', type: LessonType.VIDEO },
      { title: '142. Reporting Findings', type: LessonType.VIDEO },
      { title: '143. Iterative Improvements', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 14: AI for UI/UX Designers',
    lessons: [
      { title: '144. AI Prompt Engineering for Designers', type: LessonType.VIDEO },
      { title: '145. AI User Research', type: LessonType.VIDEO },
      { title: '146. AI Wireframe Generation', type: LessonType.VIDEO },
      { title: '147. AI UI Generation', type: LessonType.VIDEO },
      { title: '148. AI Design Systems', type: LessonType.VIDEO },
      { title: '149. AI UX Writing', type: LessonType.VIDEO },
      { title: '150. AI User Flows', type: LessonType.VIDEO },
      { title: '151. AI Personas', type: LessonType.VIDEO },
      { title: '152. AI Image Generation', type: LessonType.VIDEO },
      { title: '153. AI Design Automation', type: LessonType.VIDEO },
      { title: 'Project: Generate a SaaS product from idea to prototype using AI', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 15: Accessibility & Inclusive Design',
    lessons: [
      { title: '154. WCAG Guidelines', type: LessonType.VIDEO },
      { title: '155. Color Contrast', type: LessonType.VIDEO },
      { title: '156. Keyboard Navigation', type: LessonType.VIDEO },
      { title: '157. Screen Readers', type: LessonType.VIDEO },
      { title: '158. Typography Accessibility', type: LessonType.VIDEO },
      { title: '159. Accessible Forms', type: LessonType.VIDEO },
      { title: '160. Inclusive Components', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 16: Front-end Collaboration',
    lessons: [
      { title: '161. HTML Basics for Designers', type: LessonType.VIDEO },
      { title: '162. CSS Basics', type: LessonType.VIDEO },
      { title: '163. Responsive Breakpoints', type: LessonType.VIDEO },
      { title: '164. Tailwind CSS Overview', type: LessonType.VIDEO },
      { title: '165. Bootstrap Overview', type: LessonType.VIDEO },
      { title: '166. Design-to-Code Workflow', type: LessonType.VIDEO },
      { title: '167. Developer Handoff', type: LessonType.VIDEO },
      { title: '168. Component Naming', type: LessonType.VIDEO },
      { title: '169. Asset Optimization', type: LessonType.VIDEO },
      { title: '170. Version Control Basics', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 17: Product Design',
    lessons: [
      { title: '171. Product Discovery', type: LessonType.VIDEO },
      { title: '172. MVP Planning', type: LessonType.VIDEO },
      { title: '173. Feature Prioritization', type: LessonType.VIDEO },
      { title: '174. Product Roadmaps', type: LessonType.VIDEO },
      { title: '175. Agile & Scrum Basics', type: LessonType.VIDEO },
      { title: '176. Design Sprints', type: LessonType.VIDEO },
      { title: '177. Working with Product Managers', type: LessonType.VIDEO },
      { title: '178. Working with Developers', type: LessonType.VIDEO },
      { title: '179. Product Metrics', type: LessonType.VIDEO },
      { title: '180. Design Reviews', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 18: Portfolio Development',
    lessons: [
      { title: 'Case Study: Research, Personas & User Flows', type: LessonType.ASSIGNMENT },
      { title: 'Case Study: Wireframes & UI Screens', type: LessonType.ASSIGNMENT },
      { title: 'Case Study: Design System & Prototype', type: LessonType.ASSIGNMENT },
      { title: 'Setting up Behance, Dribbble & Portfolio Website', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 19: Industry Simulation',
    lessons: [
      { title: 'Daily Design Challenges', type: LessonType.ASSIGNMENT },
      { title: 'Team Collaboration & Design Critiques', type: LessonType.VIDEO },
      { title: 'Sprint Planning', type: LessonType.VIDEO },
      { title: 'Client Presentations', type: LessonType.VIDEO },
      { title: 'Stakeholder Feedback & Revisions', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 20: Final Capstone Project',
    lessons: [
      { title: 'Capstone Overview (Choose from 10 Product Types)', type: LessonType.VIDEO },
      { title: 'Final Project Submission', type: LessonType.ASSIGNMENT },
    ],
  },
];

async function main() {
  console.log('Seeding UI/UX Design Course and Landing Page (CMS)...');

  // 1. Create the base Course
  const course = await prisma.course.upsert({
    where: { code: 'PUXMP-2026' },
    update: {},
    create: {
      name: 'Professional UI/UX Designing with AI Master Program',
      code: 'PUXMP-2026',
      description: 'A 5-6 Month Professional UI/UX Diploma focusing on UX strategy, AI-assisted workflows, design systems, and product thinking.',
      duration: '5-6 Months (220+ Hours)',
      fee: 55000,
      isPublished: true,
    },
  });
  console.log('✅ Base course created:', course.name);

  // 2. Create the LMS Course connected to it
  const lmsCourse = await prisma.lMSCourse.upsert({
    where: { courseId: course.id },
    update: {},
    create: {
      courseId: course.id,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop',
      outcomes: [
        '10 UX research exercises',
        '8 wireframing projects',
        '6 responsive website designs',
        '5 mobile application designs',
        '2 SaaS dashboards',
        '2 enterprise design systems',
        '1 accessibility audit',
        '1 interactive high-fidelity prototype',
        '1 complete product case study',
        '1 professional portfolio website'
      ],
      prerequisites: ['Basic computer skills', 'No prior design experience required'],
      isPublished: true,
      pricing: 55000,
      seoTitle: 'UI/UX Design Course 2026 - Master Figma & UX Research',
      draftStatus: 'PUBLISHED',
      publishedAt: new Date(),
    }
  });
  console.log('✅ LMS Course created');

  // 3. Create the Modules & Lessons
  console.log('Seeding Curriculum...');
  for (let i = 0; i < curriculumData.length; i++) {
    const moduleData = curriculumData[i];
    
    // Create the module
    const lmsModule = await prisma.lMSModule.create({
      data: {
        lmsCourseId: lmsCourse.id,
        title: moduleData.title,
        sortOrder: i,
      }
    });

    // Prepare lessons payload
    const lessonsPayload = moduleData.lessons.map((lesson, index) => ({
      moduleId: lmsModule.id,
      title: lesson.title,
      type: lesson.type,
      sortOrder: index,
    }));

    // Create the lessons in bulk
    await prisma.lMSLesson.createMany({
      data: lessonsPayload,
    });
  }
  console.log('✅ LMS Curriculum (Modules & Lessons) seeded successfully.');

  // 4. Upsert the editable Landing Page for CMS
  const page = await prisma.landingPage.upsert({
    where: { slug: 'ui_ux_design' },
    update: { isActive: true },
    create: {
      slug: 'ui_ux_design',
      title: 'Professional UI/UX Designing with AI Master Program',
      description: 'Editable CMS page for the UI/UX Design Course landing page.',
      isActive: true,
    },
  });
  console.log('✅ CMS Landing Page upserted:', page.slug);

  // 5. Seed default CMS sections if none exist
  const existingSections = await prisma.pageSection.count({
    where: { landingPageId: page.id },
  });

  if (existingSections === 0) {
    await prisma.pageSection.createMany({
      data: [
        {
          landingPageId: page.id,
          sectionId: 'hero',
          sortOrder: 0,
          content: {
            type: 'html',
            html: `<div style="padding:80px 20px; text-align:center; background:#4B0082; color:#fff;">
              <h1 style="font-size:3rem; font-weight:bold; margin-bottom:1rem;">Professional UI/UX Designing with AI Master Program</h1>
              <p style="font-size:1.25rem; opacity:0.9; max-width:650px; margin:0 auto 2rem;">Master UX strategy, AI workflows, and design systems for 2026.</p>
              <a href="#enroll" style="display:inline-block; padding:12px 24px; background:#fff; color:#4B0082; font-weight:bold; text-decoration:none; border-radius:4px;">Enroll Now</a>
            </div>`
          }
        },
        {
          landingPageId: page.id,
          sectionId: 'details',
          sortOrder: 1,
          content: {
            type: 'html',
            html: `<div style="padding:60px 20px; max-width:800px; margin:0 auto; font-family:sans-serif;">
              <h2>Course Overview</h2>
              <ul>
                <li><strong>Duration:</strong> 5-6 Months (220+ Hours)</li>
                <li><strong>Modules:</strong> 20</li>
                <li><strong>Lessons:</strong> 140+</li>
                <li><strong>Projects:</strong> 25+</li>
                <li><strong>Portfolio:</strong> 12+ Professional Case Studies</li>
              </ul>
            </div>`
          }
        }
      ]
    });
    console.log('✅ Default CMS sections created for the landing page.');
  }

  console.log('🎉 UI/UX Design course seeded completely!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
