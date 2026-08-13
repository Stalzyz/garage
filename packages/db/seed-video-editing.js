/**
 * Seed: Video Editing Course Landing Page (CMS)
 * 
 * Run: node packages/db/seed-video-editing.js
 * 
 * This creates a LandingPage with slug "video_editing" in the DB so that
 * the admin can edit it from:  https://grekam.in/dashboard/cms/video_editing
 * 
 * The public page lives at:   https://academy.grekam.in/video_editing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Upsert the landing page record
  const page = await prisma.landingPage.upsert({
    where: { slug: 'video_editing' },
    update: {
      isActive: true,
    },
    create: {
      slug: 'video_editing',
      title: 'Video Editing Course',
      description: 'Professional video editing course page for Grekam Academy. Edit sections below to customise the public landing page at academy.grekam.in/video_editing.',
      isActive: true,
    },
  });

  console.log('✅  LandingPage upserted:', page.slug, '| ID:', page.id);

  // 2. Seed a default hero HTML section (editable from the CMS)
  const existing = await prisma.pageSection.count({
    where: { landingPageId: page.id },
  });

  if (existing === 0) {
    await prisma.pageSection.create({
      data: {
        landingPageId: page.id,
        sectionId: 'promo-banner',
        sortOrder: 0,
        content: {
          type: 'html',
          html: `<div style="background:linear-gradient(135deg,#FF6B35,#9999FF);padding:32px 24px;text-align:center;color:#fff;font-family:sans-serif;">
  <p style="font-size:14px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;opacity:0.85;margin:0 0 8px;">🎬 Limited Seats Available</p>
  <h2 style="font-size:28px;font-weight:900;margin:0 0 12px;line-height:1.2;">Next Batch Starts Soon — Enroll Today &amp; Get ₹2,000 Off</h2>
  <p style="font-size:15px;opacity:0.9;margin:0 0 20px;">3-month intensive · Live mentorship · Placement support</p>
  <a href="#enroll" style="display:inline-block;background:#fff;color:#FF6B35;font-weight:800;padding:12px 32px;border-radius:999px;font-size:15px;text-decoration:none;">Claim Offer →</a>
</div>`,
        },
      },
    });
    console.log('✅  Default promo section created');
  } else {
    console.log('ℹ️   Sections already exist, skipping.');
  }

  console.log('\n🎉  Done!');
  console.log('   Admin CMS editor: https://grekam.in/dashboard/cms/video_editing');
  console.log('   Public page:      https://academy.grekam.in/video_editing');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
