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

export const revalidate = 60; // Revalidate every 60 seconds

export default function Home() {
  const acts = [
    { id: "act-1", title: "The Problem" },
    { id: "act-2", title: "The Twist" },
    { id: "act-3", title: "The Evidence" },
    { id: "act-4", title: "The Offer" },
    { id: "act-5", title: "The Decision" }
  ];

  return (
    <main className="text-gray-900 custom-scrollbar overflow-x-hidden selection:bg-gray-200 bg-[#FAFAF8]">
      <Header />
      <ScrollProgress acts={acts} />
      
      {/* Hero / Act 1 */}
      <NarrativeAct id="act-1" number="01" title="The Problem" theme="light" className="min-h-[90vh] flex flex-col justify-center">
        <div className="max-w-4xl mt-12">
          <h1 className="text-5xl md:text-8xl font-editorial-display leading-[0.9] font-black uppercase mb-12">
            Honestly, most design courses are a waste of time.
          </h1>
          <p className="text-xl md:text-3xl font-editorial-body italic text-black/60 max-w-2xl leading-relaxed">
            We built this because we were frustrated by that. Templates won't save you. Only practice, feedback, and real skills will.
          </p>
        </div>
      </NarrativeAct>

      {/* Magazine Spread Transition */}
      <MagazineSpread 
        imageSrc="/editorial/magazine_spread.png" 
        headline="Kill\nThe\nTemplate" 
        subtext="Companies don't need another generic portfolio. They want unique designers." 
      />

      {/* Act 2 */}
      <NarrativeAct id="act-2" number="02" title="The Twist" theme="dark">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h2 className="text-3xl font-editorial-display font-bold uppercase sticky top-32">
              We rebuilt our training twice.
            </h2>
          </div>
          <div className="md:col-span-8 space-y-12">
            <p className="text-2xl font-editorial-body leading-relaxed text-white/80">
              Our third version actually works. Teaching design tools is easy. Teaching you how to think like a designer is the hard part.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="border-t border-white/20 pt-6">
                <div className="editorial-footnote text-white/50 mb-4">01 — The Studio</div>
                <h4 className="text-xl font-bold mb-2">No Classrooms</h4>
                <p className="text-white/60 font-editorial-body">We work like a real design studio. You are not just a student; you are a junior designer. The projects are real.</p>
              </div>
              <div className="border-t border-white/20 pt-6">
                <div className="editorial-footnote text-white/50 mb-4">02 — The Critique</div>
                <h4 className="text-xl font-bold mb-2">Direct Feedback</h4>
                <p className="text-white/60 font-editorial-body">If your design needs work, we will tell you. But we will also show you exactly how to fix it. Being too nice won't help you learn.</p>
              </div>
            </div>
          </div>
        </div>
      </NarrativeAct>

      <PullQuote 
        quote="I spent four years in college and learned more in four weeks here. It was hard, but it was exactly what I needed."
        author="Sarah Jenkins"
        role="Art Director at VMLY&R"
        theme="light"
      />

      {/* Act 3 */}
      <NarrativeAct id="act-3" number="03" title="The Evidence" theme="dark">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl md:text-6xl font-editorial-display font-bold uppercase mb-6">
            Real Student Projects.
          </h2>
          <p className="text-xl font-editorial-body text-white/60">
            No fake designs. No templates. Just real work and real learning.
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
              80% of our students get hired before they even finish. One is still figuring it out — and that's okay too. We don't promise fake guarantees—we teach you real skills.
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

      {/* Act 4 */}
      <NarrativeAct id="act-4" number="04" title="The Offer" theme="light">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <TypewriterReveal 
            text="Our Master Course" 
            className="text-3xl md:text-5xl font-editorial-display font-bold uppercase"
          />
          <p className="text-xl md:text-2xl font-editorial-body text-black/70 max-w-2xl mx-auto">
            12 weeks of hands-on design training. You will build a portfolio that gets you hired. 
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16">
             <div className="bg-black/5 p-8 border border-black/10">
                <div className="font-mono text-xs uppercase tracking-widest text-black/50 mb-4">Phase 1</div>
                <h4 className="font-bold text-xl mb-4">Fundamentals</h4>
                <ul className="space-y-3 font-editorial-body text-black/70">
                  <li>• Fonts & typography</li>
                  <li>• Grids & layouts</li>
                  <li>• How to use colors</li>
                </ul>
             </div>
             <div className="bg-black text-white p-8 border border-black transform md:-translate-y-4 shadow-2xl">
                <div className="font-mono text-xs uppercase tracking-widest text-white/50 mb-4">Phase 2</div>
                <h4 className="font-bold text-xl mb-4">Building</h4>
                <ul className="space-y-3 font-editorial-body text-white/70">
                  <li>• Logo & brand design</li>
                  <li>• App & website design</li>
                  <li>• Design direction</li>
                </ul>
             </div>
             <div className="bg-black/5 p-8 border border-black/10">
                <div className="font-mono text-xs uppercase tracking-widest text-black/50 mb-4">Phase 3</div>
                <h4 className="font-bold text-xl mb-4">Launch</h4>
                <ul className="space-y-3 font-editorial-body text-black/70">
                  <li>• Portfolio building</li>
                  <li>• Job interview prep</li>
                  <li>• Client handoff</li>
                </ul>
             </div>
          </div>
        </div>
      </NarrativeAct>

      <FeaturedCourses />

      {/* Act 5 */}
      <NarrativeAct id="act-5" number="05" title="The Decision" theme="dark" className="min-h-[70vh] flex flex-col justify-center border-b border-white/10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-editorial-display font-black uppercase mb-8">
            Enough reading.
          </h2>
          <p className="text-2xl font-editorial-body text-white/60 mb-12 italic">
            Ready to start your design career?
          </p>
          <Link 
            href="/auth/login" 
            className="inline-block bg-white text-black px-12 py-5 font-bold uppercase tracking-widest hover:bg-white/90 hover:scale-105 transition-all duration-300"
          >
            Apply for the next batch
          </Link>
        </div>
      </NarrativeAct>

      <Footer />
    </main>
  );
}
