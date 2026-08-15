"use client";

import { useState, useEffect } from "react";
import { getCourses } from "../../app/actions/courses";
import { EditorialCourseSpread } from "../editorial/EditorialCourseSpread";

const defaultCourses = [
  { title: "Graphic Design", code: "PGDM-2026", coverImage: null },
  { title: "UI/UX Design", code: "PUXMP-2026", coverImage: null },
  { title: "Web Design", code: "PWDM-2026", coverImage: null },
  { title: "Full Stack Development", code: "PFSD-2026", coverImage: null },
  { title: "Digital Marketing", code: "PDMM-2026", coverImage: null },
  { title: "Motion Graphics", code: "PMGM-2026", coverImage: null },
  { title: "Video Editing", code: "PVEM-2026", coverImage: null },
  { title: "3D & Animation", code: "P3DA-2026", coverImage: null }
];

export function FeaturedCourses() {
  const [courses, setCourses] = useState<any[]>(defaultCourses);

  useEffect(() => {
    async function load() {
      const data = await getCourses();
      if (data && data.length > 0) {
        setCourses(data);
      }
    }
    load();
  }, []);

  return (
    <section className="pt-32 pb-48 bg-[#0d0d0d] border-y border-white/10 text-white" id="courses">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto mb-20 relative">
          <svg className="absolute -top-10 left-[10%] w-24 h-24 opacity-40 pointer-events-none" viewBox="0 0 100 100">
            <path d="M10,90 Q50,10 90,90 M30,50 L70,50" stroke="#FAFAF8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <text x="35" y="80" fill="#FAFAF8" fontSize="12" fontFamily="monospace" transform="rotate(-15 35 80)">Learn</text>
          </svg>

          <h2 className="text-4xl md:text-6xl font-black mb-6 text-[#FAFAF8] tracking-tight font-editorial-display uppercase relative inline-block">
            Master Your Craft.
            <svg className="absolute -bottom-4 left-0 w-full h-4" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 10 Q50 20 100 5 M10 15 Q50 25 90 10" stroke="#ffffff" strokeWidth="2" fill="transparent" strokeLinecap="round" opacity="0.3" />
            </svg>
          </h2>
          <p className="text-xl text-[#A1A1AA] font-editorial-body italic mt-8">
            Don't just watch tutorials. Build real projects, get mentored, and launch your career.
          </p>
        </div>

        <EditorialCourseSpread courses={courses} />

      </div>
    </section>
  );
}
