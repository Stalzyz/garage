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
            Honestly, most design courses are a waste of your time.
          </h1>
          <p className="text-xl md:text-3xl font-editorial-body italic text-black/60 max-w-2xl leading-relaxed">
            We built this because we were frustrated by that. Templates won't save you. Only taste, repetition, and a critical eye will.
          </p>
        </div>
      </NarrativeAct>

      {/* Magazine Spread Transition */}
      <MagazineSpread 
        imageSrc="/editorial/magazine_spread.png" 
        headline="Kill\nThe\nTemplate" 
        subtext="The industry doesn't need another generic portfolio. It needs point of view." 
      />

      {/* Act 2 */}
      <NarrativeAct id="act-2" number="02" title="The Twist" theme="dark">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h2 className="text-3xl font-editorial-display font-bold uppercase sticky top-32">
              We threw out the curriculum twice.
            </h2>
          </div>
          <div className="md:col-span-8 space-y-12">
            <p className="text-2xl font-editorial-body leading-relaxed text-white/80">
              The third version is the one that actually works. We realized that teaching software is the easy part. The hard part is teaching you how to see.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="border-t border-white/20 pt-6">
                <div className="editorial-footnote text-white/50 mb-4">01 — The Studio</div>
                <h4 className="text-xl font-bold mb-2">No Classrooms</h4>
                <p className="text-white/60 font-editorial-body">We treat this like a functioning design studio. You aren't students; you are junior creatives. The stakes are real.</p>
              </div>
              <div className="border-t border-white/20 pt-6">
                <div className="editorial-footnote text-white/50 mb-4">02 — The Critique</div>
                <h4 className="text-xl font-bold mb-2">Ruthless Feedback</h4>
                <p className="text-white/60 font-editorial-body">If it's not good enough, we will tell you. But we will also show you exactly how to fix it. Sugar-coating helps no one.</p>
              </div>
            </div>
          </div>
        </div>
      </NarrativeAct>

      <PullQuote 
        quote="I spent four years in university and learned more in four weeks here. It was terrifying, and it was exactly what I needed."
        author="Sarah Jenkins"
        role="Art Director at VMLY&R"
        theme="light"
      />

      {/* Act 3 */}
      <NarrativeAct id="act-3" number="03" title="The Evidence" theme="dark">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl md:text-6xl font-editorial-display font-bold uppercase mb-6">
            Real Student Work.
          </h2>
          <p className="text-xl font-editorial-body text-white/60">
            No mockups. No templates. Just the raw, unedited process of figuring it out.
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
            <h3 className="text-2xl font-bold mb-4 font-editorial-display">The Outcomes</h3>
            <p className="font-editorial-body text-white/70 text-lg">
              4 out of 5 of our students got hired before they even finished. One is still figuring it out — and honestly, that's okay too. We don't sell guarantees, we sell competence.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-sm text-white/50 uppercase">Placement Rate</span>
              <span className="font-bold text-xl">82%</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-sm text-white/50 uppercase">Avg Starting Salary</span>
              <span className="font-bold text-xl">$65k+</span>
            </div>
            <div className="flex justify-between pb-4">
              <span className="font-mono text-sm text-white/50 uppercase">Alumni Network</span>
              <span className="font-bold text-xl">Global</span>
            </div>
          </div>
        </div>
      </NarrativeAct>

      {/* Act 4 */}
      <NarrativeAct id="act-4" number="04" title="The Offer" theme="light">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <TypewriterReveal 
            text="The Masterclass Programme" 
            className="text-3xl md:text-5xl font-editorial-display font-bold uppercase"
          />
          <p className="text-xl md:text-2xl font-editorial-body text-black/70 max-w-2xl mx-auto">
            12 weeks of intense, studio-style training. You will build a portfolio that actually gets you hired. 
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16">
             <div className="bg-black/5 p-8 border border-black/10">
               <div className="font-mono text-xs uppercase tracking-widest text-black/50 mb-4">Phase 1</div>
               <h4 className="font-bold text-xl mb-4">Deconstruction</h4>
               <ul className="space-y-3 font-editorial-body text-black/70">
                 <li>• Typography fundamentals</li>
                 <li>• Grid systems & layout</li>
                 <li>• Color theory in practice</li>
               </ul>
             </div>
             <div className="bg-black text-white p-8 border border-black transform md:-translate-y-4 shadow-2xl">
               <div className="font-mono text-xs uppercase tracking-widest text-white/50 mb-4">Phase 2</div>
               <h4 className="font-bold text-xl mb-4">The Build</h4>
               <ul className="space-y-3 font-editorial-body text-white/70">
                 <li>• Brand identity systems</li>
                 <li>• UI/UX product design</li>
                 <li>• Art direction</li>
               </ul>
             </div>
             <div className="bg-black/5 p-8 border border-black/10">
               <div className="font-mono text-xs uppercase tracking-widest text-black/50 mb-4">Phase 3</div>
               <h4 className="font-bold text-xl mb-4">The Launch</h4>
               <ul className="space-y-3 font-editorial-body text-black/70">
                 <li>• Portfolio construction</li>
                 <li>• Interview prep</li>
                 <li>• Studio handoff</li>
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
            Either you're ready to put in the work, or you're not.
          </p>
          <Link 
            href="/auth/login" 
            className="inline-block bg-white text-black px-12 py-5 font-bold uppercase tracking-widest hover:bg-white/90 hover:scale-105 transition-all duration-300"
          >
            Apply for the next cohort
          </Link>
        </div>
      </NarrativeAct>

      <Footer />
    </main>
  );
}
