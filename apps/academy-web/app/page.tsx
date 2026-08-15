"use client";

import { useState, useRef } from "react";
import { Footer } from "../components/landing/Footer";
import { NarrativeAct } from "../components/editorial/NarrativeAct";
import { ScrollProgress } from "../components/editorial/ScrollProgress";
import { FilmStrip } from "../components/editorial/FilmStrip";
import { MagazineSpread } from "../components/editorial/MagazineSpread";
import { PullQuote } from "../components/editorial/PullQuote";
import { TypewriterReveal } from "../components/editorial/TypewriterReveal";
import Link from "next/link";
import { Header } from "../components/landing/Header";
import { FeaturedCourses } from "../components/landing/FeaturedCourses";

export default function Home() {
  const [activeMobileSlide, setActiveMobileSlide] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  const acts = [
    { id: "act-1", title: "The Problem" },
    { id: "act-2", title: "The Method" },
    { id: "act-3", title: "The Results" },
    { id: "act-4", title: "The Program" },
    { id: "act-5", title: "Next Step" }
  ];

  const handleMainScroll = () => {
    if (window.innerWidth >= 1024) return;
    const container = mainRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / window.innerWidth);
    setActiveMobileSlide(index);
  };

  return (
    <main 
      ref={mainRef}
      onScroll={handleMainScroll}
      className="lg:block flex flex-row overflow-x-auto lg:overflow-visible snap-x snap-mandatory w-screen h-screen lg:h-auto lg:w-auto text-gray-900 custom-scrollbar overflow-y-hidden lg:overflow-y-visible selection:bg-gray-200 bg-[#FAFAF8]"
    >
      <Header />
      
      {/* Hide vertical scrollbar index on mobile */}
      <div className="hidden lg:block">
        <ScrollProgress acts={acts} />
      </div>

      {/* Mobile Swipe Dots Indicator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 lg:hidden z-40 bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-2xl">
        {Array.from({ length: 8 }).map((_, idx) => {
          const isActive = activeMobileSlide === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                mainRef.current?.scrollTo({
                  left: idx * window.innerWidth,
                  behavior: "smooth"
                });
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive ? "w-6 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          );
        })}
      </div>
      
      {/* Slide 1: Act 1 (Problem Hero - Student Perspective) */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <NarrativeAct id="act-1" number="01" title="The Problem" theme="light" className="min-h-full py-16 lg:py-32 flex flex-col justify-center">
          <div className="max-w-4xl mt-12">
            <h1 className="text-4xl md:text-8xl font-editorial-display leading-[0.9] font-black uppercase mb-12">
              Tutorials teach tools, not design.
            </h1>
            <p className="text-xl md:text-3xl font-editorial-body italic text-black/60 max-w-2xl leading-relaxed">
              Stop wasting time. Learn how to think, build, and work like a professional.
            </p>
          </div>
        </NarrativeAct>
      </div>

      {/* Slide 2: Magazine Spread Transition */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <MagazineSpread 
          imageSrc="/editorial/magazine_spread.png" 
          headline="Build\nReal\nSkills" 
          subtext="Learn to design custom websites and apps from scratch. No templates." 
        />
      </div>

      {/* Slide 3: Act 2 (The Twist - Studio Environment) */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <NarrativeAct id="act-2" number="02" title="The Method" theme="dark" className="min-h-full py-16 lg:py-32 flex flex-col justify-center">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h2 className="text-3xl font-editorial-display font-bold uppercase sticky top-32">
                Learn by doing in a real studio.
              </h2>
            </div>
            <div className="md:col-span-8 space-y-12">
              <p className="text-2xl font-editorial-body leading-relaxed text-white/80">
                Work on real projects from day one. No boring lectures or textbooks.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="border-t border-white/20 pt-6">
                  <div className="editorial-footnote text-white/50 mb-4 font-mono">01 — Practical</div>
                  <h4 className="text-xl font-bold mb-2 font-editorial-display">Real Projects</h4>
                  <p className="text-white/60 font-editorial-body">Practice with hands-on tasks and solve actual design problems.</p>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <div className="editorial-footnote text-white/50 mb-4 font-mono">02 — Feedback</div>
                  <h4 className="text-xl font-bold mb-2 font-editorial-display">Daily Reviews</h4>
                  <p className="text-white/60 font-editorial-body">Get clear, direct feedback from expert mentors to improve fast.</p>
                </div>
              </div>
            </div>
          </div>
        </NarrativeAct>
      </div>

      {/* Slide 4: Testimonial PullQuote */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <PullQuote 
          quote="This program taught me more in weeks than years in college. It gave me the skills to get hired."
          author="Sarah J."
          role="Lead Designer"
          theme="light"
        />
      </div>

      {/* Slide 5: Act 3 (The Evidence - The Breakthrough) */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <NarrativeAct id="act-3" number="03" title="The Results" theme="dark" className="min-h-full py-16 lg:py-32 flex flex-col justify-center">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl md:text-6xl font-editorial-display font-bold uppercase mb-6">
              Launch a solid design career.
            </h2>
            <p className="text-xl font-editorial-body text-white/60">
              Develop a strong portfolio that gets you noticed by top companies.
            </p>
          </div>
          
          <FilmStrip images={[
            "/editorial/filmstrip_1.png",
            "/editorial/filmstrip_2.png",
            "/editorial/filmstrip_1.png",
            "/editorial/filmstrip_2.png"
          ]} />
          
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/20 pt-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 font-editorial-display">Our Results</h3>
              <p className="font-editorial-body text-white/70 text-lg">
                Build real-world client deliverables and secure a high-paying job.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-sm text-white/50 uppercase">Students Hired</span>
                <span className="font-bold text-xl">82%</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-sm text-white/50 uppercase">Average Salary</span>
                <span className="font-bold text-xl">$65k+</span>
              </div>
              <div className="flex justify-between pb-4">
                <span className="font-mono text-sm text-white/50 uppercase">Graduate Network</span>
                <span className="font-bold text-xl">Global</span>
              </div>
            </div>
          </div>
        </NarrativeAct>
      </div>

      {/* Slide 6: Act 4 (The Offer - Steve Jobs Single-Tier Pitch) */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <NarrativeAct id="act-4" number="04" title="The Program" theme="light" className="min-h-full py-16 lg:py-32 flex flex-col justify-center">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <TypewriterReveal 
              text="One complete training program." 
              className="text-3xl md:text-5xl font-editorial-display font-bold uppercase"
            />
            <p className="text-xl md:text-2xl font-editorial-body text-black/70 max-w-2xl mx-auto">
              Get full access to expert mentoring, real projects, and job placement help.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16">
               <div className="bg-black/5 p-8 border border-black/10">
                  <div className="font-mono text-xs uppercase tracking-widest text-black/50 mb-4">Phase 1</div>
                  <h4 className="font-bold text-xl mb-4 font-editorial-display">Basics</h4>
                  <ul className="space-y-3 font-editorial-body text-black/70">
                    <li>• Typography</li>
                    <li>• Grid layouts</li>
                    <li>• Color theory</li>
                  </ul>
               </div>
               <div className="bg-black text-white p-8 border border-black transform md:-translate-y-4 shadow-2xl">
                  <div className="font-mono text-xs uppercase tracking-widest text-white/50 mb-4">Phase 2</div>
                  <h4 className="font-bold text-xl mb-4 font-editorial-display">Design</h4>
                  <ul className="space-y-3 font-editorial-body text-white/70">
                    <li>• Branding</li>
                    <li>• Web & mobile UI</li>
                    <li>• Design systems</li>
                  </ul>
               </div>
               <div className="bg-black/5 p-8 border border-black/10">
                  <div className="font-mono text-xs uppercase tracking-widest text-black/50 mb-4">Phase 3</div>
                  <h4 className="font-bold text-xl mb-4 font-editorial-display">Career</h4>
                  <ul className="space-y-3 font-editorial-body text-black/70">
                    <li>• Portfolio</li>
                    <li>• Mock interviews</li>
                    <li>• Client handoff</li>
                  </ul>
               </div>
            </div>
          </div>
        </NarrativeAct>
      </div>

      {/* Slide 7: Featured Courses Detail Accordion */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <FeaturedCourses />
      </div>

      {/* Slide 8: Act 5 (The Decision - The Leap) + Footer */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-between">
        <NarrativeAct id="act-5" number="05" title="Next Step" theme="dark" className="min-h-full py-16 lg:py-32 flex flex-col justify-center border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto my-auto">
            <h2 className="text-5xl md:text-7xl font-editorial-display font-black uppercase mb-8">
              Ready to start?
            </h2>
            <p className="text-2xl font-editorial-body text-white/60 mb-12 italic">
              Join the next cohort and build your design career today.
            </p>
            <Link 
              href="/auth/login" 
              className="inline-block bg-white text-black px-12 py-5 font-bold uppercase tracking-widest hover:bg-white/90 hover:scale-105 transition-all duration-300"
            >
              Start My Journey
            </Link>
          </div>
        </NarrativeAct>
        <Footer />
      </div>
    </main>
  );
}
