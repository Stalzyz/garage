"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  GraduationCap, BookOpen, Users, Award, Briefcase, Plus, 
  ArrowUpRight, Video, Calendar, Sparkles, LayoutTemplate, 
  CheckCircle2, Clock, FileText, ChevronRight, BarChart3, Search
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import { motion } from "framer-motion"

export default function LMSAcademyDashboard() {
  const { data: overview, isLoading } = useApi<any>("/analytics/overview")
  const [searchQuery, setSearchQuery] = useState("")

  const totalStudents = overview?.academy?.totalStudents || 148
  const activeBatches = overview?.academy?.activeBatches || 6
  const activeCourses = 12
  const placementRate = "94.2%"

  const modules = [
    {
      title: "Course Catalog & Curriculum",
      desc: "Create, organize, and manage video modules, lessons, and assignments.",
      href: "/dashboard/cms/courses",
      icon: BookOpen,
      color: "from-amber-500/20 to-amber-500/5",
      border: "border-amber-500/30",
      text: "text-amber-400",
      badge: "12 Courses Active",
    },
    {
      title: "Visual Course Landing Page Builder",
      desc: "Build high-converting course landing pages with visual drag-and-drop builder.",
      href: "/dashboard/cms/pages/builder",
      icon: LayoutTemplate,
      color: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      badge: "Drag & Drop CMS",
    },
    {
      title: "Student Learning Portal",
      desc: "Monitor student submissions, assignment grading, and watch progress.",
      href: "/portal/student",
      icon: Users,
      color: "from-sky-500/20 to-sky-500/5",
      border: "border-sky-500/30",
      text: "text-sky-400",
      badge: "Live Student View",
    },
    {
      title: "Educators & Faculty Hub",
      desc: "Manage lead mentors, guest lecturers, and workshop instructors.",
      href: "/dashboard/cms/educators",
      icon: GraduationCap,
      color: "from-purple-500/20 to-purple-500/5",
      border: "border-purple-500/30",
      text: "text-purple-400",
      badge: "Faculty Roster",
    },
    {
      title: "Career & Student Placements",
      desc: "Track student hiring records, partner companies, and CTC offers.",
      href: "/dashboard/cms/placements",
      icon: Award,
      color: "from-indigo-500/20 to-indigo-500/5",
      border: "border-indigo-500/30",
      text: "text-indigo-400",
      badge: "94% Placement Rate",
    },
    {
      title: "Masterclasses & Bootcamps",
      desc: "Schedule weekend bootcamps, live webinars, and certificate distribution.",
      href: "/dashboard/cms/events",
      icon: Calendar,
      color: "from-rose-500/20 to-rose-500/5",
      border: "border-rose-500/30",
      text: "text-rose-400",
      badge: "Upcoming Cohorts",
    },
  ]

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-[#06080e] min-h-screen text-white font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-amber-400 uppercase mb-1">
            <GraduationCap className="w-4 h-4" /> Grekam Academy · LMS Enterprise Matrix
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            LMS & Academy Command Center
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Integrated learning management, course syllabi, student progress, and placement tracks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/cms/courses"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Course
          </Link>
          <Link
            href="/dashboard/cms/pages/builder"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 flex items-center gap-2 transition-all"
          >
            <LayoutTemplate className="w-4 h-4" /> Course Page Builder
          </Link>
        </div>
      </div>

      {/* Hero Stats Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0b0e17] border border-amber-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block mb-1">Total Students</span>
          <div className="text-3xl font-black text-white tracking-tight tabular-nums">
            {isLoading ? "..." : totalStudents.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Enrolled across batches</span>
        </div>

        <div className="bg-[#0b0e17] border border-sky-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase block mb-1">Active Cohorts</span>
          <div className="text-3xl font-black text-white tracking-tight tabular-nums">
            {isLoading ? "..." : activeBatches}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Live classroom streams</span>
        </div>

        <div className="bg-[#0b0e17] border border-emerald-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase block mb-1">Course Catalog</span>
          <div className="text-3xl font-black text-white tracking-tight tabular-nums">
            {activeCourses}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Modular learning tracks</span>
        </div>

        <div className="bg-[#0b0e17] border border-purple-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase block mb-1">Placement Success</span>
          <div className="text-3xl font-black text-white tracking-tight tabular-nums">
            {placementRate}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Verified hiring rate</span>
        </div>
      </div>

      {/* Modules Directory Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
          LMS Operations & Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, idx) => {
            const Icon = m.icon
            return (
              <Link
                key={idx}
                href={m.href}
                className={`group p-6 rounded-2xl bg-gradient-to-br ${m.color} border ${m.border} hover:scale-[1.01] transition-all shadow-xl flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-black/40 border border-white/10 ${m.text}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/40 border border-white/10 ${m.text}`}>
                      {m.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                    {m.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mt-6 group-hover:translate-x-1 transition-transform">
                  <span>Open Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
