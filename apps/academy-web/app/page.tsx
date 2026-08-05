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
    { id: "act-1", title: "My Stagnation" },
    { id: "act-2", title: "The Studio" },
    { id: "act-3", title: "The Breakthrough" },
    { id: "act-4", title: "The Package" },
    { id: "act-5", title: "The Leap" }
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
        <NarrativeAct id="act-1" number="01" title="My Stagnation" theme="light" className="min-h-full py-16 lg:py-32 flex flex-col justify-center">
          <div className="max-w-4xl mt-12">
            <h1 className="text-4xl md:text-8xl font-editorial-display leading-[0.9] font-black uppercase mb-12">
              I copied video tutorials for months. My designs looked clean, but they had no soul.
            </h1>
            <p className="text-xl md:text-3xl font-editorial-body italic text-black/60 max-w-2xl leading-relaxed">
              I realized standard courses were just wasting my time. They teach you software, but not how to think like a designer.
            </p>
          </div>
        </NarrativeAct>
      </div>

      {/* Slide 2: Magazine Spread Transition */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <MagazineSpread 
          imageSrc="/editorial/magazine_spread.png" 
          headline="Stop\nUsing\nTemplates" 
          subtext="Companies don't need another generic portfolio. They want your unique style." 
        />
      </div>

      {/* Slide 3: Act 2 (The Twist - Studio Environment) */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <NarrativeAct id="act-2" number="02" title="The Studio" theme="dark" className="min-h-full py-16 lg:py-32 flex flex-col justify-center">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h2 className="text-3xl font-editorial-display font-bold uppercase sticky top-32">
                When I joined, they threw out the textbook.
              </h2>
            </div>
            <div className="md:col-span-8 space-y-12">
              <p className="text-2xl font-editorial-body leading-relaxed text-white/80">
                There were no classrooms or boring lectures. On Day 1, I was treated like a junior designer in a real studio. The stakes were real.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="border-t border-white/20 pt-6">
                  <div className="editorial-footnote text-white/50 mb-4 font-mono">01 — The Studio</div>
                  <h4 className="text-xl font-bold mb-2 font-editorial-display">No Classrooms</h4>
                  <p className="text-white/60 font-editorial-body">We work like a real design studio. You are not just a student; you are a junior designer. The projects are real.</p>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <div className="editorial-footnote text-white/50 mb-4 font-mono">02 — The Critique</div>
                  <h4 className="text-xl font-bold mb-2 font-editorial-display">Direct Feedback</h4>
                  <p className="text-white/60 font-editorial-body">If my design needed work, they told me. But they also showed me exactly how to fix it. Being too nice won't help you learn.</p>
                </div>
              </div>
            </div>
          </div>
        </NarrativeAct>
      </div>

      {/* Slide 4: Testimonial PullQuote */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <PullQuote 
          quote="I spent four years in college and learned more in four weeks here. It was hard, but it was exactly what I needed."
          author="Sarah Jenkins"
          role="Art Director at VMLY&R"
          theme="light"
        />
      </div>

      {/* Slide 5: Act 3 (The Evidence - The Breakthrough) */}
      <div className="w-screen h-screen flex-shrink-0 snap-start overflow-y-auto lg:w-auto lg:h-auto lg:overflow-visible flex flex-col justify-center">
        <NarrativeAct id="act-3" number="03" title="The Breakthrough" theme="dark" className="min-h-full py-16 lg:py-32 flex flex-col justify-center">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl md:text-6xl font-editorial-display font-bold uppercase mb-6">
              I built real projects. Not fake mockups.
            </h2>
            <p className="text-xl font-editorial-body text-white/60">
              No templates. Just my raw process of solving design problems. That is when recruiters started calling me.
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
                80% of my class got hired before the 12 weeks even ended. We don't promise fake guarantees—we teach you real skills.
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
        <NarrativeAct id="act-4" number="04" title="The Package" theme="light" className="min-h-full py-16 lg:py-32 flex flex-col justify-center">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <TypewriterReveal 
              text="One Course. Everything Included." 
              className="text-3xl md:text-5xl font-editorial-display font-bold uppercase"
            />
            <p className="text-xl md:text-2xl font-editorial-body text-black/70 max-w-2xl mx-auto">
              We don't have basic, premium, or ultimate versions. We have one training: Our Best Version. You get all the mentoring, all the client projects, and all the career help. Because you don't need a half-baked course. You need to get hired.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16">
               <div className="bg-black/5 p-8 border border-black/10">
                  <div className="font-mono text-xs uppercase tracking-widest text-black/50 mb-4">Phase 1</div>
                  <h4 className="font-bold text-xl mb-4 font-editorial-display">Fundamentals</h4>
                  <ul className="space-y-3 font-editorial-body text-black/70">
                    <li>• Fonts & typography</li>
                    <li>• Grids & layouts</li>
                    <li>• How to use colors</li>
                  </ul>
               </div>
               <div className="bg-black text-white p-8 border border-black transform md:-translate-y-4 shadow-2xl">
                  <div className="font-mono text-xs uppercase tracking-widest text-white/50 mb-4">Phase 2</div>
                  <h4 className="font-bold text-xl mb-4 font-editorial-display">Building</h4>
                  <ul className="space-y-3 font-editorial-body text-white/70">
                    <li>• Logo & brand design</li>
                    <li>• App & website design</li>
                    <li>• Design direction</li>
                  </ul>
               </div>
               <div className="bg-black/5 p-8 border border-black/10">
                  <div className="font-mono text-xs uppercase tracking-widest text-black/50 mb-4">Phase 3</div>
                  <h4 className="font-bold text-xl mb-4 font-editorial-display">Launch</h4>
                  <ul className="space-y-3 font-editorial-body text-black/70">
                    <li>• Portfolio building</li>
                    <li>• Job interview prep</li>
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
        <NarrativeAct id="act-5" number="05" title="The Leap" theme="dark" className="min-h-full py-16 lg:py-32 flex flex-col justify-center border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto my-auto">
            <h2 className="text-5xl md:text-7xl font-editorial-display font-black uppercase mb-8">
              I was hesitant too.
            </h2>
            <p className="text-2xl font-editorial-body text-white/60 mb-12 italic">
              But either you keep copying templates, or you start building your real career.
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
