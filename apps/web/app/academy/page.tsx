import { Header } from "../../components/landing/Header";
import { Hero } from "../../components/landing/Hero";
import { CreativeJourney } from "../../components/landing/CreativeJourney";
import { FeaturedCourses } from "../../components/landing/FeaturedCourses";
import { About } from "../../components/landing/About";
import { Methodology } from "../../components/landing/Methodology";
import { Outcomes } from "../../components/landing/Outcomes";
import { StudentExperience } from "../../components/landing/StudentExperience";
import { PlatformFeatures } from "../../components/landing/PlatformFeatures";
import { Demographics } from "../../components/landing/Demographics";
import { SubscriptionCard } from "../../components/landing/SubscriptionCard";
import { Faq } from "../../components/landing/Faq";
import { FinalCTA } from "../../components/landing/FinalCTA";
import { Footer } from "../../components/landing/Footer";
import { BackgroundWrapper } from "../../components/landing/BackgroundWrapper";
import { HiringPartners } from "../../components/landing/HiringPartners";
import { InstructorsSection } from "../../components/landing/InstructorsSection";
import { StudentShowcase } from "../../components/landing/StudentShowcase";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Revalidate every hour

// Next.js App Router Server Component
export default async function Home() {
  // Fetch dynamic data from the database
  const companies = await prisma.placementCompany.findMany({
    select: { id: true, name: true, logoUrl: true },
    take: 12
  });

  const rawEducators = await prisma.educator.findMany({
    include: { user: true },
    take: 6
  });

  // Map to the shape expected by InstructorsSection
  const instructors = rawEducators.map(e => ({
    id: e.id,
    name: `${e.user.firstName} ${e.user.lastName}`,
    avatarUrl: e.user.avatarUrl,
    designation: e.designation,
    company: e.company,
    bio: e.bio
  }));

  const rawProjects = await prisma.portfolioProject.findMany({
    include: {
      portfolio: {
        include: {
          student: {
            include: { user: true }
          }
        }
      }
    },
    take: 4,
    orderBy: { createdAt: 'desc' }
  });

  // Map to the shape expected by StudentShowcase
  const projects = rawProjects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: p.imageUrl,
    linkUrl: p.linkUrl,
    studentName: p.portfolio?.student?.user 
      ? `${p.portfolio.student.user.firstName} ${p.portfolio.student.user.lastName}` 
      : 'Grekam Student'
  }));

  return (
    <main className="relative min-h-screen bg-[#020202] text-[#FAFAF8] selection:bg-gray-200 overflow-x-hidden pt-24 pb-12">
      {/* Subtle Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#49abc9] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#49abc9] opacity-[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 space-y-12 max-w-7xl mx-auto px-4 md:px-6">
        <BackgroundWrapper>
          <Header />
          <Hero />
          
          <HiringPartners companies={companies} />
          
          <CreativeJourney />
          <FeaturedCourses />
          
          <InstructorsSection instructors={instructors} />
          
          <About />
          <Methodology />
          <Outcomes />
          
          <StudentShowcase projects={projects} />
          
          <StudentExperience />
          <PlatformFeatures />
          <Demographics />
          <SubscriptionCard />
          <Faq />
          <FinalCTA />
          <Footer />
        </BackgroundWrapper>
      </div>
    </main>
  );
}
