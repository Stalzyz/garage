import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  {
    title: 'MODULE 1: Introduction to Graphic Design',
    lessons: [
      { title: '1. What is Graphic Design?', type: LessonType.VIDEO },
      { title: '2. History of Graphic Design', type: LessonType.VIDEO },
      { title: '3. Evolution of Design', type: LessonType.VIDEO },
      { title: '4. Graphic Design Career Paths', type: LessonType.VIDEO },
      { title: '5. Types of Graphic Designers', type: LessonType.VIDEO },
      { title: '6. Freelancing vs Agency', type: LessonType.VIDEO },
      { title: '7. Design Industries', type: LessonType.VIDEO },
      { title: '8. Future of Graphic Design', type: LessonType.VIDEO },
      { title: '9. AI in Graphic Design', type: LessonType.VIDEO },
      { title: '10. Graphic Designer Mindset', type: LessonType.VIDEO },
      { title: 'Practical: Research famous brands & analyze logos', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 2: Design Fundamentals',
    lessons: [
      { title: '11. Point', type: LessonType.VIDEO },
      { title: '12. Line', type: LessonType.VIDEO },
      { title: '13. Shape', type: LessonType.VIDEO },
      { title: '14. Form', type: LessonType.VIDEO },
      { title: '15. Texture', type: LessonType.VIDEO },
      { title: '16. Space', type: LessonType.VIDEO },
      { title: '17. Value', type: LessonType.VIDEO },
      { title: '18. Balance', type: LessonType.VIDEO },
      { title: '19. Contrast', type: LessonType.VIDEO },
      { title: '20. Emphasis', type: LessonType.VIDEO },
      { title: '21. Hierarchy', type: LessonType.VIDEO },
      { title: '22. Repetition', type: LessonType.VIDEO },
      { title: '23. Pattern', type: LessonType.VIDEO },
      { title: '24. Rhythm', type: LessonType.VIDEO },
      { title: '25. Movement', type: LessonType.VIDEO },
      { title: '26. Unity', type: LessonType.VIDEO },
      { title: '27. Proportion', type: LessonType.VIDEO },
      { title: '28. Scale', type: LessonType.VIDEO },
      { title: '29. Symmetry', type: LessonType.VIDEO },
      { title: '30. Asymmetry', type: LessonType.VIDEO },
      { title: 'Assignment: Create 20 abstract compositions using only shapes', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 3: Color Theory',
    lessons: [
      { title: '31. Understanding Color', type: LessonType.VIDEO },
      { title: '32. RGB', type: LessonType.VIDEO },
      { title: '33. CMYK', type: LessonType.VIDEO },
      { title: '34. HEX', type: LessonType.VIDEO },
      { title: '35. Pantone', type: LessonType.VIDEO },
      { title: '36. Color Wheel', type: LessonType.VIDEO },
      { title: '37. Warm Colors', type: LessonType.VIDEO },
      { title: '38. Cool Colors', type: LessonType.VIDEO },
      { title: '39. Primary Colors', type: LessonType.VIDEO },
      { title: '40. Secondary Colors', type: LessonType.VIDEO },
      { title: '41. Tertiary Colors', type: LessonType.VIDEO },
      { title: '42. Complementary Colors', type: LessonType.VIDEO },
      { title: '43. Split Complementary', type: LessonType.VIDEO },
      { title: '44. Analogous', type: LessonType.VIDEO },
      { title: '45. Triadic', type: LessonType.VIDEO },
      { title: '46. Monochromatic', type: LessonType.VIDEO },
      { title: '47. Color Psychology', type: LessonType.VIDEO },
      { title: '48. Brand Colors', type: LessonType.VIDEO },
      { title: '49. Accessibility', type: LessonType.VIDEO },
      { title: '50. Color Trends', type: LessonType.VIDEO },
      { title: 'Project: Build 10 brand color palettes', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 4: Typography',
    lessons: [
      { title: '51. History of Typography', type: LessonType.VIDEO },
      { title: '52. Anatomy of Fonts', type: LessonType.VIDEO },
      { title: '53. Serif Fonts', type: LessonType.VIDEO },
      { title: '54. Sans Serif Fonts', type: LessonType.VIDEO },
      { title: '55. Display Fonts', type: LessonType.VIDEO },
      { title: '56. Script Fonts', type: LessonType.VIDEO },
      { title: '57. Font Pairing', type: LessonType.VIDEO },
      { title: '58. Kerning', type: LessonType.VIDEO },
      { title: '59. Tracking', type: LessonType.VIDEO },
      { title: '60. Leading', type: LessonType.VIDEO },
      { title: '61. Paragraph Styles', type: LessonType.VIDEO },
      { title: '62. Grid Systems', type: LessonType.VIDEO },
      { title: '63. Visual Hierarchy', type: LessonType.VIDEO },
      { title: '64. Readability', type: LessonType.VIDEO },
      { title: '65. Typography for Branding', type: LessonType.VIDEO },
      { title: '66. Typography for Social Media', type: LessonType.VIDEO },
      { title: '67. Typography for Print', type: LessonType.VIDEO },
      { title: '68. Typography Mistakes', type: LessonType.VIDEO },
      { title: '69. Choosing Fonts', type: LessonType.VIDEO },
      { title: '70. Variable Fonts', type: LessonType.VIDEO },
      { title: 'Project: Design 25 typography posters', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 5: Layout & Composition',
    lessons: [
      { title: '71. Rule of Thirds', type: LessonType.VIDEO },
      { title: '72. Golden Ratio', type: LessonType.VIDEO },
      { title: '73. Grid Layout', type: LessonType.VIDEO },
      { title: '74. Modular Grid', type: LessonType.VIDEO },
      { title: '75. White Space', type: LessonType.VIDEO },
      { title: '76. Focal Point', type: LessonType.VIDEO },
      { title: '77. Eye Flow', type: LessonType.VIDEO },
      { title: '78. Visual Balance', type: LessonType.VIDEO },
      { title: '79. Composition Techniques', type: LessonType.VIDEO },
      { title: '80. Magazine Layout', type: LessonType.VIDEO },
      { title: '81. Newspaper Layout', type: LessonType.VIDEO },
      { title: '82. Flyer Layout', type: LessonType.VIDEO },
      { title: '83. Brochure Layout', type: LessonType.VIDEO },
      { title: '84. Business Card Layout', type: LessonType.VIDEO },
      { title: '85. Presentation Design', type: LessonType.VIDEO },
      { title: 'Assignment: Redesign five poor layouts', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 6: Adobe Photoshop Fundamentals',
    lessons: [
      { title: '86. Interface', type: LessonType.VIDEO },
      { title: '87. Preferences', type: LessonType.VIDEO },
      { title: '88. Workspace', type: LessonType.VIDEO },
      { title: '89. Layers', type: LessonType.VIDEO },
      { title: '90. Layer Styles', type: LessonType.VIDEO },
      { title: '91. Smart Objects', type: LessonType.VIDEO },
      { title: '92. Selection Tools', type: LessonType.VIDEO },
      { title: '93. Masking', type: LessonType.VIDEO },
      { title: '94. Blending Modes', type: LessonType.VIDEO },
      { title: '95. Adjustment Layers', type: LessonType.VIDEO },
      { title: '96. Filters', type: LessonType.VIDEO },
      { title: '97. Camera RAW', type: LessonType.VIDEO },
      { title: '98. Exporting', type: LessonType.VIDEO },
      { title: '99. Keyboard Shortcuts', type: LessonType.VIDEO },
      { title: '100. Productivity Tips', type: LessonType.VIDEO },
      { title: 'Practical: Recreate five professional posters', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 7: Professional Photoshop',
    lessons: [
      { title: '101. Photo Retouching', type: LessonType.VIDEO },
      { title: '102. Skin Retouching', type: LessonType.VIDEO },
      { title: '103. Object Removal', type: LessonType.VIDEO },
      { title: '104. AI Remove Tool', type: LessonType.VIDEO },
      { title: '105. Generative Fill', type: LessonType.VIDEO },
      { title: '106. Frequency Separation', type: LessonType.VIDEO },
      { title: '107. Dodge & Burn', type: LessonType.VIDEO },
      { title: '108. Color Matching', type: LessonType.VIDEO },
      { title: '109. Product Editing', type: LessonType.VIDEO },
      { title: '110. Background Replacement', type: LessonType.VIDEO },
      { title: '111. Composite Design', type: LessonType.VIDEO },
      { title: '112. Cinematic Poster', type: LessonType.VIDEO },
      { title: '113. Matte Painting', type: LessonType.VIDEO },
      { title: '114. Double Exposure', type: LessonType.VIDEO },
      { title: '115. Social Media Ads', type: LessonType.VIDEO },
      { title: 'Projects: Movie Poster, Product Ad, Cosmetic Poster, Restaurant Ad, Festival Campaign', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 8: Adobe Illustrator',
    lessons: [
      { title: '116. Interface', type: LessonType.VIDEO },
      { title: '117. Pen Tool', type: LessonType.VIDEO },
      { title: '118. Shape Builder', type: LessonType.VIDEO },
      { title: '119. Pathfinder', type: LessonType.VIDEO },
      { title: '120. Curvature Tool', type: LessonType.VIDEO },
      { title: '121. Brushes', type: LessonType.VIDEO },
      { title: '122. Symbols', type: LessonType.VIDEO },
      { title: '123. Patterns', type: LessonType.VIDEO },
      { title: '124. Gradients', type: LessonType.VIDEO },
      { title: '125. Mesh Tool', type: LessonType.VIDEO },
      { title: '126. Live Paint', type: LessonType.VIDEO },
      { title: '127. Vector Illustration', type: LessonType.VIDEO },
      { title: '128. Icon Design', type: LessonType.VIDEO },
      { title: '129. Character Illustration', type: LessonType.VIDEO },
      { title: '130. Export Assets', type: LessonType.VIDEO },
      { title: 'Project: Create a complete icon pack', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 9: Logo Design',
    lessons: [
      { title: 'Logo Psychology', type: LessonType.VIDEO },
      { title: 'Logo Discovery Process', type: LessonType.VIDEO },
      { title: 'Mood Boards', type: LessonType.VIDEO },
      { title: 'Sketching', type: LessonType.VIDEO },
      { title: 'Logo Construction', type: LessonType.VIDEO },
      { title: 'Grid System', type: LessonType.VIDEO },
      { title: 'Minimal Logos', type: LessonType.VIDEO },
      { title: 'Mascot Logos', type: LessonType.VIDEO },
      { title: 'Monograms', type: LessonType.VIDEO },
      { title: 'Responsive Logos', type: LessonType.VIDEO },
      { title: 'Logo Animation Basics', type: LessonType.VIDEO },
      { title: 'Brand Presentation', type: LessonType.VIDEO },
      { title: 'Projects: Design 10 different logos', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 10: Brand Identity Design',
    lessons: [
      { title: 'Brand Identity Design Complete System', type: LessonType.VIDEO },
      { title: 'Deliverables: Logo, Color Palette, Typography', type: LessonType.VIDEO },
      { title: 'Deliverables: Print assets (Business Card, Letterhead, Envelope)', type: LessonType.VIDEO },
      { title: 'Deliverables: Digital assets (Social Media Kit, Email Signature)', type: LessonType.VIDEO },
      { title: 'Deliverables: Packaging & Invoice', type: LessonType.VIDEO },
      { title: 'Deliverables: Brand Guidelines Book', type: LessonType.VIDEO },
      { title: 'Assignment: Design complete branding for a company', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 11: Adobe InDesign',
    lessons: [
      { title: 'Books & Newspapers', type: LessonType.VIDEO },
      { title: 'Catalogues & Magazine Design', type: LessonType.VIDEO },
      { title: 'Master Pages', type: LessonType.VIDEO },
      { title: 'Paragraph Styles', type: LessonType.VIDEO },
      { title: 'Print Setup & Interactive PDFs', type: LessonType.VIDEO },
      { title: 'Project: Design a 32-page magazine', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 12: Print Design',
    lessons: [
      { title: 'Printing Technologies & Paper Types', type: LessonType.VIDEO },
      { title: 'GSM, Spot UV, Emboss, Foil Printing, Die Cut', type: LessonType.VIDEO },
      { title: 'Packaging & Prepress', type: LessonType.VIDEO },
      { title: 'Color Proofing', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 13: Packaging Design',
    lessons: [
      { title: 'Chocolate Box', type: LessonType.DESIGN },
      { title: 'Perfume & Cosmetic Packaging', type: LessonType.DESIGN },
      { title: 'Juice Bottle & Tea Package', type: LessonType.DESIGN },
      { title: 'Coffee Label, Medicine Box, Food Package', type: LessonType.DESIGN },
    ],
  },
  {
    title: 'MODULE 14: Social Media Design',
    lessons: [
      { title: 'Instagram Posts & Carousels', type: LessonType.DESIGN },
      { title: 'Stories, Reels Covers, YouTube Thumbnails', type: LessonType.DESIGN },
      { title: 'Facebook Ads & LinkedIn Posts', type: LessonType.DESIGN },
      { title: 'WhatsApp Banners', type: LessonType.DESIGN },
    ],
  },
  {
    title: 'MODULE 15: Advertising Design',
    lessons: [
      { title: 'Billboard & Newspaper Ads', type: LessonType.DESIGN },
      { title: 'Bus Branding & Vehicle Wraps', type: LessonType.DESIGN },
      { title: 'POS Materials, Roll-up Banners, Trade Show Booths', type: LessonType.DESIGN },
    ],
  },
  {
    title: 'MODULE 16: AI for Designers',
    lessons: [
      { title: 'ChatGPT & Prompt Engineering for Design', type: LessonType.VIDEO },
      { title: 'Adobe Firefly & Photoshop/Illustrator AI', type: LessonType.VIDEO },
      { title: 'Midjourney, Leonardo AI, Ideogram, Stable Diffusion', type: LessonType.VIDEO },
      { title: 'Canva AI, Remove.bg, Magnific AI', type: LessonType.VIDEO },
      { title: 'Projects: AI-assisted Branding, Product Campaign, Mockups', type: LessonType.ASSIGNMENT },
    ],
  },
  {
    title: 'MODULE 17: Freelancing & Client Management',
    lessons: [
      { title: 'Finding Clients & Proposal Writing', type: LessonType.VIDEO },
      { title: 'Pricing Strategies & Contracts', type: LessonType.VIDEO },
      { title: 'Invoicing & GST Basics', type: LessonType.VIDEO },
      { title: 'Client Meetings, Revisions, Long-term Relationships', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 18: Portfolio Development',
    lessons: [
      { title: 'Building Portfolios on Behance & Dribbble', type: LessonType.VIDEO },
      { title: 'Adobe Portfolio & Personal Website', type: LessonType.VIDEO },
      { title: 'LinkedIn for Designers', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 19: Internship Simulation',
    lessons: [
      { title: 'Daily Creative Briefs & Deadline Management', type: LessonType.VIDEO },
      { title: 'Team Collaboration & Client Feedback Sessions', type: LessonType.VIDEO },
      { title: 'Brand Presentation', type: LessonType.VIDEO },
    ],
  },
  {
    title: 'MODULE 20: Final Capstone Project',
    lessons: [
      { title: 'Capstone Project Overview', type: LessonType.VIDEO },
      { title: 'Final Review & Submission', type: LessonType.ASSIGNMENT },
    ],
  },
];

async function main() {
  console.log('Seeding Graphic Design Course and Landing Page (CMS)...');

  // 1. Create the base Course
  const course = await prisma.course.upsert({
    where: { code: 'PGDMP-2026' },
    update: {},
    create: {
      name: 'Professional Graphic Designing Master Program',
      code: 'PGDMP-2026',
      description: 'A 4-6 Month Professional Graphic Design Diploma focused on design thinking first, software second. Updated for 2026 with AI integration.',
      duration: '4-6 Months (180+ Hours)',
      fee: 45000,
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
      thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000&auto=format&fit=crop',
      outcomes: [
        '10 Logo Designs',
        '5 Brand Identity Projects',
        '25 Social Media Creatives',
        '10 Print Design Projects',
        '5 Packaging Designs',
        '10 Advertising Campaigns',
        '1 Magazine Layout',
        '1 Professional Brand Guidelines Book',
        'Complete Online Portfolio'
      ],
      prerequisites: ['Basic computer skills', 'Passion for creativity'],
      isPublished: true,
      pricing: 45000,
      seoTitle: 'Graphic Design Diploma 2026 - Master AI & Design Thinking',
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
    where: { slug: 'graphic_design' },
    update: { isActive: true },
    create: {
      slug: 'graphic_design',
      title: 'Professional Graphic Designing Master Program',
      description: 'Editable CMS page for the Graphic Design Course landing page.',
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
            html: `<div style="padding:80px 20px; text-align:center; background:#111; color:#fff;">
              <h1 style="font-size:3rem; font-weight:bold; margin-bottom:1rem;">Professional Graphic Designing Master Program</h1>
              <p style="font-size:1.25rem; opacity:0.8; max-width:600px; margin:0 auto 2rem;">Design thinking first. Software second. Updated for 2026 with AI integration.</p>
              <a href="#enroll" style="display:inline-block; padding:12px 24px; background:#f5a623; color:#111; font-weight:bold; text-decoration:none; border-radius:4px;">Enroll Now</a>
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
                <li><strong>Duration:</strong> 4-6 Months (180+ Hours)</li>
                <li><strong>Modules:</strong> 20</li>
                <li><strong>Lessons:</strong> 120+</li>
                <li><strong>Projects:</strong> 20+</li>
                <li><strong>Portfolio:</strong> 15+ Professional Works</li>
              </ul>
            </div>`
          }
        }
      ]
    });
    console.log('✅ Default CMS sections created for the landing page.');
  }

  console.log('🎉 Graphic Design course seeded completely!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
