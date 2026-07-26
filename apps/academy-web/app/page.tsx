import { Hero } from "../components/landing/Hero";
import { CreativeJourney } from "../components/landing/CreativeJourney";
import { FeaturedCourses } from "../components/landing/FeaturedCourses";
import { About } from "../components/landing/About";
import { Methodology } from "../components/landing/Methodology";
import { Outcomes } from "../components/landing/Outcomes";
import { StudentExperience } from "../components/landing/StudentExperience";
import { PlatformFeatures } from "../components/landing/PlatformFeatures";
import { Demographics } from "../components/landing/Demographics";
import { SubscriptionCard } from "../components/landing/SubscriptionCard";
import { Faq } from "../components/landing/Faq";
import { FinalCTA } from "../components/landing/FinalCTA";
import { Footer } from "../components/landing/Footer";
import { BackgroundWrapper } from "../components/landing/BackgroundWrapper";

import { AnnouncementsBanner } from "../components/landing/AnnouncementsBanner";
import { DynamicSections } from "../components/landing/DynamicSections";
import { UpcomingEvents } from "../components/landing/UpcomingEvents";
import { HiringPartners } from "../components/landing/HiringPartners";
import { StudentShowcase } from "../components/landing/StudentShowcase";
import { InstructorsSection } from "../components/landing/InstructorsSection";

export default function Home() {
  return (
    <main className="text-gray-900 custom-scrollbar overflow-x-hidden selection:bg-gray-200">
      <AnnouncementsBanner />
      <BackgroundWrapper>
        <Hero />
        <DynamicSections />
        <CreativeJourney />
        <FeaturedCourses />
        <UpcomingEvents />
        <HiringPartners />
        <About />
        <Methodology />
        <StudentShowcase />
        <InstructorsSection />
        <Outcomes />
        <StudentExperience />
        <PlatformFeatures />
        <Demographics />
        <SubscriptionCard />
        <Faq />
        <FinalCTA />
        <Footer />
      </BackgroundWrapper>
    </main>
  );
}
