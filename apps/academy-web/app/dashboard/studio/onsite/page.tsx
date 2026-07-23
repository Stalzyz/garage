"use client"

import { motion } from "framer-motion"
import { Users, BookOpen, Star, DollarSign, ArrowUpRight, Plus, Video, Play, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function EducatorDashboard() {
  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight mb-2"
          >
            Welcome back to the Studio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50"
          >
            Here's what's happening with your courses and students today.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <button className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-sm transition-colors flex items-center gap-2">
            <Video className="w-4 h-4" /> Go Live
          </button>
          <Link href="/dashboard/studio/onsite/courses/builder" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Plus className="w-4 h-4" /> New Course
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="1,248" change="+12%" icon={Users} delay={0.1} />
        <StatCard title="Active Courses" value="4" change="+1" icon={BookOpen} delay={0.2} />
        <StatCard title="Average Rating" value="4.8" change="+0.2" icon={Star} delay={0.3} />
        <StatCard title="Monthly Revenue" value="$4,200" change="+8%" icon={DollarSign} delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col - Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Reviews / Assignments */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Onsite Studio</h1>
              <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-1">Campus Teaching Environment</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-purple-500/30 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-80" />
                      <div>
                        <h4 className="font-semibold text-sm group-hover:text-purple-400 transition-colors">UI/UX Design Final Project</h4>
                        <p className="text-xs text-white/40">Submitted by Alex Johnson • 2 hours ago</p>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Top Courses */}
          <section>
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">Your Courses</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <CourseCard title="Advanced React Patterns" students="420" rating="4.9" revenue="$1,800" status="Published" />
              <CourseCard title="Figma for Developers" students="828" rating="4.7" revenue="$2,400" status="Published" />
            </div>
          </section>

        </div>

        {/* Right Col - Schedule & Tips */}
        <div className="space-y-8">
          
          {/* Upcoming Live Sessions */}
          <section className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px]" />
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-400" /> Upcoming Live
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10">
                <div className="text-xs font-bold text-purple-400 mb-1 uppercase tracking-wider">Today, 4:00 PM</div>
                <h4 className="font-semibold mb-3">Q&A: State Management in React</h4>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-colors">Join Room</button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">Edit</button>
                </div>
              </div>
            </div>
          </section>

          {/* AI Assistant Insight */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> AI Insights
            </h3>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              Based on recent quiz results, 40% of your students are struggling with "React Hooks dependencies". 
              Consider adding a supplementary video or a live Q&A session on this topic.
            </p>
            <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors">
              Generate Lesson Plan
            </button>
          </section>

        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, change, icon: Icon, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-white/70 group-hover:text-purple-400 transition-colors" />
        </div>
        <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
          {change}
        </span>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
        <div className="text-sm text-white/50">{title}</div>
      </div>
    </motion.div>
  )
}

function CourseCard({ title, students, rating, revenue, status }: any) {
  return (
    <div className="p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent group cursor-pointer">
      <div className="bg-[#0a0a0a] rounded-[1.4rem] p-5 h-full">
        <div className="aspect-video bg-white/5 rounded-xl mb-4 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-shadow">
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm z-10">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                <Play className="w-5 h-5 text-white ml-1" />
              </div>
           </div>
        </div>
        <h3 className="font-bold mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">{title}</h3>
        
        <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
          <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {students}</div>
          <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {rating}</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> {status}</div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40">This month</span>
          <span className="font-bold text-emerald-400">{revenue}</span>
        </div>
      </div>
    </div>
  )
}
