"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  BookOpen, PlayCircle, Award, Clock, TrendingUp, CheckCircle2,
  Loader2, ArrowRight, GraduationCap, Flame, BarChart2, Lock
} from "lucide-react"
import { motion } from "framer-motion"
import { useApi } from "@/lib/useApi"
import { useCurrentUser } from "@/context/CurrentUserContext"
import { formatDistanceToNow } from "date-fns"

function secsToTime(secs: number) {
  const hrs = Math.floor(secs / 3600)
  const mins = Math.floor((secs % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  if (mins > 0) return `${mins}m`
  return `${secs}s`
}

function CircleProgress({ pct, size = 80 }: { pct: number; size?: number }) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={7} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={pct === 100 ? "#10b981" : "#3b82f6"}
        strokeWidth={7} fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        className="transition-all duration-1000"
      />
    </svg>
  )
}

export default function LMSDashboard() {
  const { firstName, isLoading: userLoading } = useCurrentUser()
  const { data, isLoading } = useApi<any>("/lms/enrollments/my")

  const enrollments: any[] = data?.enrollments || []
  const totalCourses = data?.totalCourses || 0
  const certificatesEarned = data?.certificatesEarned || 0
  const totalWatchedSecs = data?.totalWatchedSecs || 0

  // Find course with most recent activity / in progress
  const inProgress = enrollments.filter(e => e.completionPct > 0 && e.completionPct < 100)
  const notStarted = enrollments.filter(e => e.completionPct === 0)
  const completed = enrollments.filter(e => e.completionPct === 100)

  if (isLoading || userLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-white/40 text-sm font-mono">Loading your learning hub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-y-auto custom-scrollbar">
      
      {/* Hero Header */}
      <div className="relative px-8 pt-10 pb-8 overflow-hidden border-b border-white/10">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 left-0 w-72 h-72 bg-purple-600/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-400/80">Learning Hub</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            {firstName ? `Keep going, ${firstName}` : "Your Learning Hub"}
          </h1>
          <p className="text-white/40 mt-2 text-base">
            {totalCourses > 0 
              ? `${totalCourses} course${totalCourses > 1 ? 's' : ''} enrolled — ${inProgress.length} in progress`
              : "Discover and enroll in courses to begin your journey"}
          </p>
        </div>
      </div>

      <div className="px-8 py-8 space-y-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Enrolled",
              value: totalCourses.toString(),
              icon: <BookOpen className="w-5 h-5 text-blue-400" />,
              color: "from-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              label: "In Progress",
              value: inProgress.length.toString(),
              icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
              color: "from-amber-500/10",
              border: "border-amber-500/20",
            },
            {
              label: "Watch Time",
              value: secsToTime(totalWatchedSecs),
              icon: <Clock className="w-5 h-5 text-purple-400" />,
              color: "from-purple-500/10",
              border: "border-purple-500/20",
            },
            {
              label: "Certificates",
              value: certificatesEarned.toString(),
              icon: <Award className="w-5 h-5 text-emerald-400" />,
              color: "from-emerald-500/10",
              border: "border-emerald-500/20",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-gradient-to-br ${stat.color} to-transparent border ${stat.border} rounded-2xl p-5 relative overflow-hidden group hover:brightness-110 transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">{stat.label}</span>
                {stat.icon}
              </div>
              <div className="text-3xl font-black text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Continue Learning */}
        {inProgress.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <PlayCircle className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold">Continue Learning</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black">{inProgress.length}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((enr, i) => (
                <CourseCard key={enr.id} enrollment={enr} delay={i * 0.06} variant="active" />
              ))}
            </div>
          </section>
        )}

        {/* Not Started */}
        {notStarted.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <BookOpen className="w-5 h-5 text-white/40" />
              <h2 className="text-lg font-bold text-white/70">Ready to Start</h2>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black">{notStarted.length}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notStarted.map((enr, i) => (
                <CourseCard key={enr.id} enrollment={enr} delay={i * 0.06} variant="idle" />
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-emerald-400/80">Completed</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black">{completed.length}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completed.map((enr, i) => (
                <CourseCard key={enr.id} enrollment={enr} delay={i * 0.06} variant="done" />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {enrollments.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white/70">No courses yet</p>
              <p className="text-sm text-white/30 mt-2">Browse the catalog and enroll to start learning</p>
            </div>
            <Link 
              href="/dashboard/lms/courses"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors"
            >
              Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

      </div>
    </div>
  )
}

function CourseCard({ enrollment: enr, delay, variant }: { enrollment: any; delay: number; variant: "active" | "idle" | "done" }) {
  const pct = enr.completionPct || 0

  const borderColor = variant === "done" 
    ? "border-emerald-500/20 hover:border-emerald-500/40" 
    : variant === "active"
    ? "border-blue-500/20 hover:border-blue-500/40"
    : "border-white/10 hover:border-white/20"

  const barColor = variant === "done" ? "bg-emerald-500" : "bg-blue-500"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link href={`/dashboard/lms/course/${enr.course.id}`} className="group block">
        <div className={`relative bg-white/[0.03] border ${borderColor} rounded-2xl overflow-hidden transition-all duration-200 hover:bg-white/[0.06] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]`}>
          
          {/* Course Thumbnail / Color Band */}
          <div className={`h-36 relative flex items-center justify-center overflow-hidden
            ${variant === "done" ? "bg-emerald-950/40" : variant === "active" ? "bg-blue-950/40" : "bg-white/[0.02]"}
          `}>
            {/* Gradient overlay */}
            <div className={`absolute inset-0 opacity-30
              ${variant === "done" ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/10" 
                : variant === "active" ? "bg-gradient-to-br from-blue-500/20 to-purple-500/10"
                : "bg-gradient-to-br from-white/5 to-transparent"}
            `} />

            {/* Circular progress ring */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="relative">
                <CircleProgress pct={pct} size={72} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {variant === "done" 
                    ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    : <span className="text-sm font-black text-white">{pct}%</span>
                  }
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="absolute top-3 right-3">
              {variant === "done" && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  ✓ Done
                </span>
              )}
              {variant === "active" && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400">
                  ▶ Active
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
              {enr.course.name}
            </h3>
            <p className="text-[11px] text-white/40 font-mono mb-3">
              {enr.completedLessons}/{enr.totalLessons} lessons
              {enr.watchedSecs > 0 && ` · ${secsToTime(enr.watchedSecs)} watched`}
            </p>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-700 shadow-[0_0_8px_currentColor]`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* CTA */}
            <div className={`mt-4 flex items-center justify-between text-xs font-bold ${
              variant === "done" ? "text-emerald-400" : "text-blue-400"
            } group-hover:gap-3 transition-all`}>
              <span>
                {variant === "done" ? "Review Course" : pct > 0 ? "Continue" : "Start Learning"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
