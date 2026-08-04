"use client"

import { FeaturedCourseCard } from "../../components/landing/FeaturedCourseCard"
import { motion } from "framer-motion"

type RelatedCoursesProps = {
  courses: any[]
}

export function RelatedCourses({ courses }: RelatedCoursesProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-24 px-4 bg-[#0a0a0a] border-t border-white/5">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#FAFAF8] mb-2">
              Explore More Courses
            </h2>
            <p className="text-[#A1A1AA]">
              Broaden your skillset with these related programs.
            </p>
          </div>
          <a
            href="/#courses"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-sm bg-white/5 text-[#FAFAF8] hover:bg-white/10 transition-colors border border-white/10"
          >
            View All Courses
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <FeaturedCourseCard
              key={course.id}
              title={course.name}
              index={index}
              code={course.code}
              coverImage={course.lmsCourse?.thumbnail}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
