import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  {
    title: 'MODULE 1: Introduction to Web Development',
    lessons: [
      { title: '1. How the Internet Works', type: LessonType.VIDEO },
      { title: '2. Client & Server Architecture', type: LessonType.VIDEO },
      { title: '3. Frontend vs Backend', type: LessonType.VIDEO },
      { title: '4. Static vs Dynamic Websites', type: LessonType.VIDEO },
      { title: '5. HTTP & HTTPS', type: LessonType.VIDEO },
      { title: '6. DNS & Domains', type: LessonType.VIDEO },
      { title: '7. Hosting & Servers', type: LessonType.VIDEO },
      { title: '8. Development Workflow', type: LessonType.VIDEO },
      { title: '9. IDE Setup (VS Code)', type: LessonType.VIDEO },
      { title: '10. AI in Software Development', type: LessonType.VIDEO },
      { title: 'Practical: Install development tools & Configure Git & VS Code', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 2: HTML5',
    lessons: [
      { title: '11. HTML Structure', type: LessonType.VIDEO },
      { title: '12. Semantic Elements', type: LessonType.VIDEO },
      { title: '13. Head & Metadata', type: LessonType.VIDEO },
      { title: '14. Images', type: LessonType.VIDEO },
      { title: '15. Audio & Video', type: LessonType.VIDEO },
      { title: '16. Tables', type: LessonType.VIDEO },
      { title: '17. Forms', type: LessonType.VIDEO },
      { title: '18. Input Types', type: LessonType.VIDEO },
      { title: '19. Accessibility', type: LessonType.VIDEO },
      { title: '20. SEO-Friendly HTML', type: LessonType.VIDEO },
      { title: 'Project: Build a responsive personal profile page', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 3: CSS3',
    lessons: [
      { title: '21. Selectors', type: LessonType.VIDEO },
      { title: '22. Box Model', type: LessonType.VIDEO },
      { title: '23. Typography', type: LessonType.VIDEO },
      { title: '24. Colors & Gradients', type: LessonType.VIDEO },
      { title: '25. Flexbox', type: LessonType.VIDEO },
      { title: '26. CSS Grid', type: LessonType.VIDEO },
      { title: '27. Positioning', type: LessonType.VIDEO },
      { title: '28. Animations', type: LessonType.VIDEO },
      { title: '29. Transitions', type: LessonType.VIDEO },
      { title: '30. Responsive Design', type: LessonType.VIDEO },
      { title: 'Project: Create a modern landing page', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 4: JavaScript Fundamentals',
    lessons: [
      { title: '31. Variables', type: LessonType.VIDEO },
      { title: '32. Data Types', type: LessonType.VIDEO },
      { title: '33. Operators', type: LessonType.VIDEO },
      { title: '34. Functions', type: LessonType.VIDEO },
      { title: '35. Arrays', type: LessonType.VIDEO },
      { title: '36. Objects', type: LessonType.VIDEO },
      { title: '37. Loops', type: LessonType.VIDEO },
      { title: '38. DOM Manipulation', type: LessonType.VIDEO },
      { title: '39. Events', type: LessonType.VIDEO },
      { title: '40. ES6+ Features', type: LessonType.VIDEO },
      { title: 'Assignment: Develop interactive UI components', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 5: Advanced JavaScript',
    lessons: [
      { title: '41. Closures', type: LessonType.VIDEO },
      { title: '42. Promises', type: LessonType.VIDEO },
      { title: '43. Async/Await', type: LessonType.VIDEO },
      { title: '44. Fetch API', type: LessonType.VIDEO },
      { title: '45. Modules', type: LessonType.VIDEO },
      { title: '46. Error Handling', type: LessonType.VIDEO },
      { title: '47. Local Storage', type: LessonType.VIDEO },
      { title: '48. Session Storage', type: LessonType.VIDEO },
      { title: '49. JSON', type: LessonType.VIDEO },
      { title: '50. Browser APIs', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 6: Git & GitHub',
    lessons: [
      { title: '51. Git Basics', type: LessonType.VIDEO },
      { title: '52. Repository Management', type: LessonType.VIDEO },
      { title: '53. Branching', type: LessonType.VIDEO },
      { title: '54. Merging', type: LessonType.VIDEO },
      { title: '55. Pull Requests', type: LessonType.VIDEO },
      { title: '56. GitHub Issues', type: LessonType.VIDEO },
      { title: '57. Collaboration', type: LessonType.VIDEO },
      { title: '58. GitHub Actions', type: LessonType.VIDEO },
      { title: '59. Versioning', type: LessonType.VIDEO },
      { title: '60. Deployment with GitHub', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 7: React.js',
    lessons: [
      { title: '61. React Fundamentals', type: LessonType.VIDEO },
      { title: '62. JSX', type: LessonType.VIDEO },
      { title: '63. Components', type: LessonType.VIDEO },
      { title: '64. Props', type: LessonType.VIDEO },
      { title: '65. State', type: LessonType.VIDEO },
      { title: '66. Hooks', type: LessonType.VIDEO },
      { title: '67. Routing', type: LessonType.VIDEO },
      { title: '68. Forms', type: LessonType.VIDEO },
      { title: '69. Context API', type: LessonType.VIDEO },
      { title: '70. Performance Optimization', type: LessonType.VIDEO },
      { title: 'Project: Develop a task management application', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 8: Next.js',
    lessons: [
      { title: '71. File Routing', type: LessonType.VIDEO },
      { title: '72. App Router', type: LessonType.VIDEO },
      { title: '73. Server Components', type: LessonType.VIDEO },
      { title: '74. Client Components', type: LessonType.VIDEO },
      { title: '75. Layouts', type: LessonType.VIDEO },
      { title: '76. API Routes', type: LessonType.VIDEO },
      { title: '77. Metadata', type: LessonType.VIDEO },
      { title: '78. Server Actions', type: LessonType.VIDEO },
      { title: '79. Authentication', type: LessonType.VIDEO },
      { title: '80. Deployment', type: LessonType.VIDEO },
      { title: 'Project: Create a company website with CMS features', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 9: Tailwind CSS',
    lessons: [
      { title: '81. Utility Classes', type: LessonType.VIDEO },
      { title: '82. Responsive Design', type: LessonType.VIDEO },
      { title: '83. Flex & Grid', type: LessonType.VIDEO },
      { title: '84. Dark Mode', type: LessonType.VIDEO },
      { title: '85. Components', type: LessonType.VIDEO },
      { title: '86. Theme Customization', type: LessonType.VIDEO },
      { title: '87. Animations', type: LessonType.VIDEO },
      { title: '88. Best Practices', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 10: TypeScript',
    lessons: [
      { title: '89. Type System', type: LessonType.VIDEO },
      { title: '90. Interfaces', type: LessonType.VIDEO },
      { title: '91. Types', type: LessonType.VIDEO },
      { title: '92. Generics', type: LessonType.VIDEO },
      { title: '93. Utility Types', type: LessonType.VIDEO },
      { title: '94. Classes', type: LessonType.VIDEO },
      { title: '95. Modules', type: LessonType.VIDEO },
      { title: '96. API Typing', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 11: Backend Development (Node.js)',
    lessons: [
      { title: '97. Node.js Introduction', type: LessonType.VIDEO },
      { title: '98. npm', type: LessonType.VIDEO },
      { title: '99. Express.js', type: LessonType.VIDEO },
      { title: '100. Routing', type: LessonType.VIDEO },
      { title: '101. Middleware', type: LessonType.VIDEO },
      { title: '102. Controllers', type: LessonType.VIDEO },
      { title: '103. Services', type: LessonType.VIDEO },
      { title: '104. Validation', type: LessonType.VIDEO },
      { title: '105. Logging', type: LessonType.VIDEO },
      { title: '106. Error Handling', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 12: Database Development',
    lessons: [
      { title: '107. SQL Basics', type: LessonType.VIDEO },
      { title: '108. PostgreSQL', type: LessonType.VIDEO },
      { title: '109. MongoDB', type: LessonType.VIDEO },
      { title: '110. Prisma ORM', type: LessonType.VIDEO },
      { title: '111. CRUD Operations', type: LessonType.VIDEO },
      { title: '112. Relationships', type: LessonType.VIDEO },
      { title: '113. Migrations', type: LessonType.VIDEO },
      { title: '114. Indexing', type: LessonType.VIDEO },
      { title: '115. Transactions', type: LessonType.VIDEO },
      { title: '116. Database Optimization', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 13: Authentication & Security',
    lessons: [
      { title: '117. Authentication', type: LessonType.VIDEO },
      { title: '118. Authorization', type: LessonType.VIDEO },
      { title: '119. JWT', type: LessonType.VIDEO },
      { title: '120. OAuth', type: LessonType.VIDEO },
      { title: '121. Google Login', type: LessonType.VIDEO },
      { title: '122. Password Hashing', type: LessonType.VIDEO },
      { title: '123. Sessions', type: LessonType.VIDEO },
      { title: '124. RBAC', type: LessonType.VIDEO },
      { title: '125. Rate Limiting', type: LessonType.VIDEO },
      { title: '126. OWASP Basics', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 14: REST APIs',
    lessons: [
      { title: '127. API Design', type: LessonType.VIDEO },
      { title: '128. REST Principles', type: LessonType.VIDEO },
      { title: '129. CRUD APIs', type: LessonType.VIDEO },
      { title: '130. API Validation', type: LessonType.VIDEO },
      { title: '131. API Documentation', type: LessonType.VIDEO },
      { title: '132. Pagination', type: LessonType.VIDEO },
      { title: '133. Filtering', type: LessonType.VIDEO },
      { title: '134. Upload APIs', type: LessonType.VIDEO },
      { title: '135. Testing APIs', type: LessonType.VIDEO },
      { title: '136. API Versioning', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 15: AI Integration',
    lessons: [
      { title: '137. OpenAI APIs', type: LessonType.VIDEO },
      { title: '138. AI Chatbots', type: LessonType.VIDEO },
      { title: '139. Prompt Engineering', type: LessonType.VIDEO },
      { title: '140. AI Image Generation', type: LessonType.VIDEO },
      { title: '141. AI Code Generation', type: LessonType.VIDEO },
      { title: '142. AI Assistants', type: LessonType.VIDEO },
      { title: '143. Embeddings', type: LessonType.VIDEO },
      { title: '144. Vector Databases', type: LessonType.VIDEO },
      { title: '145. RAG Basics', type: LessonType.VIDEO },
      { title: '146. AI Automation', type: LessonType.VIDEO },
      { title: 'Project: Build an AI-powered chatbot application', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 16: Cloud & Deployment',
    lessons: [
      { title: '147. Linux Basics', type: LessonType.VIDEO },
      { title: '148. VPS Setup', type: LessonType.VIDEO },
      { title: '149. Docker', type: LessonType.VIDEO },
      { title: '150. Nginx', type: LessonType.VIDEO },
      { title: '151. PM2', type: LessonType.VIDEO },
      { title: '152. SSL', type: LessonType.VIDEO },
      { title: '153. Domain Configuration', type: LessonType.VIDEO },
      { title: '154. CI/CD', type: LessonType.VIDEO },
      { title: '155. Monitoring', type: LessonType.VIDEO },
      { title: '156. Backup Strategy', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 17: Testing & Debugging',
    lessons: [
      { title: '157. Unit Testing', type: LessonType.VIDEO },
      { title: '158. Integration Testing', type: LessonType.VIDEO },
      { title: '159. API Testing', type: LessonType.VIDEO },
      { title: '160. End-to-End Testing', type: LessonType.VIDEO },
      { title: '161. Debugging Tools', type: LessonType.VIDEO },
      { title: '162. Performance Profiling', type: LessonType.VIDEO },
      { title: '163. Logging', type: LessonType.VIDEO },
      { title: '164. Error Monitoring', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 18: Performance Optimization',
    lessons: [
      { title: '165. Lazy Loading', type: LessonType.VIDEO },
      { title: '166. Image Optimization', type: LessonType.VIDEO },
      { title: '167. Caching', type: LessonType.VIDEO },
      { title: '168. Code Splitting', type: LessonType.VIDEO },
      { title: '169. SEO Optimization', type: LessonType.VIDEO },
      { title: '170. Core Web Vitals', type: LessonType.VIDEO },
      { title: '171. Lighthouse', type: LessonType.VIDEO },
      { title: '172. Bundle Analysis', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 19: Real-Time Applications',
    lessons: [
      { title: '173. WebSockets', type: LessonType.VIDEO },
      { title: '174. Socket.IO', type: LessonType.VIDEO },
      { title: '175. Live Chat', type: LessonType.VIDEO },
      { title: '176. Notifications', type: LessonType.VIDEO },
      { title: '177. Presence System', type: LessonType.VIDEO },
      { title: '178. Realtime Dashboards', type: LessonType.VIDEO },
      { title: '179. Event-Based Architecture', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 20: SaaS Development',
    lessons: [
      { title: '180. Multi-Tenant Architecture', type: LessonType.VIDEO },
      { title: '181. Subscription Models', type: LessonType.VIDEO },
      { title: '182. Payment Integration', type: LessonType.VIDEO },
      { title: '183. User Management', type: LessonType.VIDEO },
      { title: '184. Admin Dashboard', type: LessonType.VIDEO },
      { title: '185. Analytics', type: LessonType.VIDEO },
      { title: '186. Audit Logs', type: LessonType.VIDEO },
      { title: '187. Feature Flags', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 21: Freelancing & Software Business',
    lessons: [
      { title: '188. Requirement Analysis', type: LessonType.VIDEO },
      { title: '189. Project Estimation', type: LessonType.VIDEO },
      { title: '190. Proposal Writing', type: LessonType.VIDEO },
      { title: '191. Client Communication', type: LessonType.VIDEO },
      { title: '192. Agile Basics', type: LessonType.VIDEO },
      { title: '193. Pricing', type: LessonType.VIDEO },
      { title: '194. Documentation', type: LessonType.VIDEO },
      { title: '195. Maintenance Contracts', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 22: Industry Simulation',
    lessons: [
      { title: 'Simulation: Work in teams to build applications', type: LessonType.ASSIGNMENT },
      { title: 'Sprint Planning & Daily Standups', type: LessonType.VIDEO },
      { title: 'Code Reviews & Git Collaboration', type: LessonType.VIDEO },
      { title: 'QA Testing & Deployment', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 23: Portfolio Development',
    lessons: [
      { title: 'GitHub Profile & Portfolio Website', type: LessonType.ASSIGNMENT },
      { title: 'Resume & Technical Blog', type: LessonType.ASSIGNMENT },
      { title: 'API Documentation & Project Presentations', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 24: Final Capstone Projects',
    lessons: [
      { title: 'Project 1: Business Management System', type: LessonType.ASSIGNMENT },
      { title: 'Project 2: E-commerce Platform', type: LessonType.ASSIGNMENT },
      { title: 'Project 3: AI SaaS Application', type: LessonType.ASSIGNMENT },
    ],
  },
];

async function main() {
  console.log('Seeding Full Stack Web Development Course and Landing Page (CMS)...');

  const course = await prisma.course.upsert({
    where: { code: 'PFSD-2026' },
    update: {},
    create: {
      name: 'Professional Full Stack Web Development with AI Master Program',
      code: 'PFSD-2026',
      description: 'An 8-10 Month Professional Full Stack Web Development program focusing on modern software development careers, AI-assisted coding, cloud deployment, and production-ready applications.',
      duration: '8-10 Months (350+ Hours)',
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
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
      outcomes: [
        '5 responsive websites',
        '5 JavaScript applications',
        '3 React projects',
        '2 Next.js web applications',
        '5 REST APIs',
        '1 real-time chat application',
        '1 complete e-commerce platform',
        '1 AI-powered SaaS application',
        'GitHub profile with 20+ repositories'
      ],
      prerequisites: ['Basic computer skills', 'Commitment to learning'],
      isPublished: true,
      pricing: 85000,
      seoTitle: 'Full Stack Web Development Course 2026 - Master React, Node & AI',
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
    where: { slug: 'fullstack_web_dev' },
    update: { isActive: true },
    create: { slug: 'fullstack_web_dev', title: 'Professional Full Stack Web Development with AI', description: 'Editable CMS page for the Full Stack Course.', isActive: true },
  });
  console.log('✅ CMS Landing Page upserted:', page.slug);

  const existingSections = await prisma.pageSection.count({ where: { landingPageId: page.id } });
  if (existingSections === 0) {
    await prisma.pageSection.createMany({
      data: [
        {
          landingPageId: page.id, sectionId: 'hero', sortOrder: 0,
          content: { type: 'html', html: `<div style="padding:80px 20px; text-align:center; background:#1E293B; color:#38BDF8;"><h1 style="font-size:3rem; font-weight:bold; margin-bottom:1rem; color:#fff;">Professional Full Stack Web Development with AI Master Program</h1><p style="font-size:1.25rem; opacity:0.9; max-width:650px; margin:0 auto 2rem; color:#E2E8F0;">Build production-ready applications, master Next.js, Node, and AI-assisted workflows.</p><a href="#enroll" style="display:inline-block; padding:12px 24px; background:#38BDF8; color:#0F172A; font-weight:bold; text-decoration:none; border-radius:4px;">Enroll Now</a></div>` }
        },
        {
          landingPageId: page.id, sectionId: 'details', sortOrder: 1,
          content: { type: 'html', html: `<div style="padding:60px 20px; max-width:800px; margin:0 auto; font-family:sans-serif;"><h2>Course Overview</h2><ul><li><strong>Duration:</strong> 8-10 Months (350+ Hours)</li><li><strong>Modules:</strong> 24</li><li><strong>Lessons:</strong> 200+</li><li><strong>Projects:</strong> 25+</li><li><strong>Capstone:</strong> 3 Industry-Level Applications</li></ul></div>` }
        }
      ]
    });
    console.log('✅ Default CMS sections created for the landing page.');
  }
  console.log('🎉 Full Stack course seeded completely!');
}

main().catch(console.error).finally(async () => await prisma.$disconnect());
