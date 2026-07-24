"use client"

import { useSession } from "next-auth/react"
import { Activity, Users, DollarSign, TrendingUp, Calendar, AlertCircle, Briefcase, GraduationCap, BookOpen, CheckCircle, Clock, ArrowRight, UploadCloud, PlayCircle, Image as ImageIcon } from "lucide-react"
import { useApi } from "@/lib/useApi"

export default function DashboardHome() {
  const { data: session } = useSession()
  const role = session?.user?.role || "INTERN"

  if (role === "STUDENT") {
    return <StudentDashboard />
  }
  
  if (role === "CLIENT") {
    return <ClientDashboard />
  }

  if (role === "STAFF") {
    return <StaffDashboard />
  }

  // Super Admin / Manager view
  return <AdminDashboard session={session} />
}

function StaffDashboard() {
  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary p-8">
      <h1 className="text-3xl font-bold mb-2">Staff Portal</h1>
      <p className="text-dash-text-secondary mb-8">Welcome to your workspace.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="My Projects" value="4" icon={<Briefcase className="w-5 h-5"/>} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard title="Open Tasks" value="12" icon={<Activity className="w-5 h-5"/>} color="text-amber-400" bg="bg-amber-500/10" />
        <StatCard title="Hours Logged" value="32h" icon={<Clock className="w-5 h-5"/>} color="text-emerald-400" bg="bg-emerald-500/10" />
      </div>

      <div className="mt-8 bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400"/> Recent Activity</h2>
        <div className="text-sm text-dash-text-secondary">You recently completed the "Wireframing" task for Project X.</div>
      </div>
    </div>
  )
}

function StudentDashboard() {
  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary p-8">
      <h1 className="text-3xl font-bold mb-2">My Academy</h1>
      <p className="text-dash-text-secondary mb-8">Welcome back! Ready to continue learning?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Enrolled Courses" value="3" icon={<BookOpen className="w-5 h-5"/>} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard title="Completed" value="1" icon={<GraduationCap className="w-5 h-5"/>} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard title="Pending Assignments" value="2" icon={<Briefcase className="w-5 h-5"/>} color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      <div className="mt-8 bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-400"/> Continue Learning</h2>
        <div className="text-sm text-dash-text-secondary">You are currently taking "Advanced Web Development". You have completed 45% of the course.</div>
      </div>
    </div>
  )
}

function EducatorDashboard() {
  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary p-8">
      <h1 className="text-3xl font-bold mb-2">Educator Portal</h1>
      <p className="text-dash-text-secondary mb-8">Here is the overview of your classes and students.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Classes" value="4" icon={<BookOpen className="w-5 h-5"/>} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard title="Total Students" value="128" icon={<Users className="w-5 h-5"/>} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard title="Assignments to Grade" value="15" icon={<AlertCircle className="w-5 h-5"/>} color="text-amber-400" bg="bg-amber-500/10" />
      </div>
    </div>
  )
}

function ClientDashboard() {
  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-8">
      
      {/* 1. Welcome Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-dash-text-primary to-dash-text-secondary bg-clip-text text-transparent">
            Client Portal
          </h1>
          <p className="text-dash-text-secondary mt-2 text-lg">Your central hub for projects, assets, and billing.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Files
          </button>
          <button className="px-4 py-2 bg-dash-bg-elevated hover:bg-dash-border-subtle border border-dash-border-strong rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Book Call
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. Visual Project "Pizza Tracker" */}
          <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-400" /> Website Redesign (V2)
                </h2>
                <p className="text-xs text-dash-text-secondary mt-1">Est. Completion: Aug 15, 2026</p>
              </div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold tracking-wider uppercase">
                In Progress
              </span>
            </div>

            <div className="relative pt-4 pb-2">
              {/* Progress Line */}
              <div className="absolute top-8 left-[10%] right-[10%] h-1 bg-dash-border-subtle rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[60%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </div>
              
              <div className="flex justify-between relative z-10">
                {/* Phase 1 */}
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-primary text-center">Kickoff</span>
                </div>
                {/* Phase 2 */}
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-primary text-center">Design</span>
                </div>
                {/* Phase 3 */}
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className="w-8 h-8 rounded-full bg-dash-bg-elevated border-2 border-blue-500 text-blue-400 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 text-center">Revisions</span>
                </div>
                {/* Phase 4 */}
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className="w-8 h-8 rounded-full bg-dash-bg-base border-2 border-dash-border-strong text-dash-text-secondary flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-secondary text-center">Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Recent Deliverables Gallery */}
          <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" /> Recent Deliverables
              </h2>
              <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="group relative aspect-video rounded-xl overflow-hidden bg-dash-bg-elevated border border-dash-border-strong cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm transition-opacity">
                  <PlayCircle className="w-8 h-8 text-white mb-2" />
                  <span className="text-xs font-bold text-white">Promo_v2.mp4</span>
                </div>
              </div>
              <div className="group relative aspect-video rounded-xl overflow-hidden bg-dash-bg-elevated border border-dash-border-strong cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm transition-opacity">
                  <ImageIcon className="w-8 h-8 text-white mb-2" />
                  <span className="text-xs font-bold text-white">Logo_Final.png</span>
                </div>
              </div>
              <div className="group relative aspect-video rounded-xl overflow-hidden bg-dash-bg-elevated border border-dash-border-strong cursor-pointer hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm transition-opacity">
                  <ImageIcon className="w-8 h-8 text-white mb-2" />
                  <span className="text-xs font-bold text-white">Social_Banners.zip</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* 3. Interactive Financial Summary */}
          <div className="bg-gradient-to-br from-dash-bg-card to-dash-bg-base border border-dash-border-subtle rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-colors pointer-events-none" />
            
            <h2 className="text-sm font-bold tracking-wider uppercase text-dash-text-secondary mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" /> Outstanding Balance
            </h2>
            <p className="text-4xl font-black font-mono text-dash-text-primary tracking-tight mb-1">$2,450.00</p>
            <p className="text-xs text-dash-text-secondary mb-6">Due on August 1st, 2026 (Invoice #1042)</p>
            
            <button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all">
              Pay Invoice Now
            </button>
          </div>

          {/* 5. Live Activity Feed */}
          <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Recent Activity
            </h2>
            <div className="space-y-6">
              <ActivityItem 
                title="Stalin uploaded 3 files" 
                desc="Logo_Final.png and 2 others" 
                time="2 hours ago" 
                color="bg-emerald-500" 
              />
              <ActivityItem 
                title="Invoice #1042 Generated" 
                desc="Amount: $2,450.00" 
                time="1 day ago" 
                color="bg-amber-500" 
              />
              <ActivityItem 
                title="Project Moved to Revisions" 
                desc="Website Redesign (V2)" 
                time="2 days ago" 
                color="bg-blue-500" 
              />
              <ActivityItem 
                title="Kickoff Meeting Completed" 
                desc="Notes have been attached to project" 
                time="1 week ago" 
                color="bg-purple-500" 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ session }: { session: any }) {
  const { data: overview, isLoading } = useApi<any>("/analytics/overview")
  const { data: revenueData } = useApi<any>("/analytics/revenue?months=8")

  const revenue = overview?.agency?.revenueCollected || 0
  const students = overview?.academy?.totalStudents || 0
  const activeProjects = overview?.agency?.activeProjects || 0
  const openTickets = overview?.support?.openTickets || 0

  return (
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="px-8 py-10">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-dash-text-primary to-dash-text-secondary bg-clip-text text-transparent">
          Welcome back, {session?.user?.name || 'Commander'}
        </h1>
        <p className="text-dash-text-secondary mt-2 text-lg">Here is your system overview for today.</p>
      </div>

      <div className="px-8 pb-10 space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={isLoading ? "..." : `$${revenue.toLocaleString()}`} 
            trend="Live Data" 
            icon={<DollarSign className="w-5 h-5" />} 
            color="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <StatCard 
            title="Active Students" 
            value={isLoading ? "..." : students.toLocaleString()} 
            trend="Live Data" 
            icon={<GraduationCap className="w-5 h-5" />} 
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatCard 
            title="Open Projects" 
            value={isLoading ? "..." : activeProjects.toLocaleString()} 
            trend="Live Data" 
            icon={<Briefcase className="w-5 h-5" />} 
            color="text-purple-400"
            bg="bg-purple-500/10"
          />
          <StatCard 
            title="Support Tickets" 
            value={isLoading ? "..." : openTickets.toLocaleString()} 
            trend="Live Data" 
            icon={<AlertCircle className="w-5 h-5" />} 
            color="text-amber-400"
            bg="bg-amber-500/10"
          />
        </div>

        {/* Two Col Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Revenue Growth
            </h2>
            
            {/* Live Chart Visualization using CSS Grid */}
            <div className="h-64 flex items-end gap-3 pt-6 border-b border-white/10 relative">
              {/* Y Axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-white/30 font-mono py-2">
                <span>$50k</span>
                <span>$25k</span>
                <span>$0</span>
              </div>
              
              <div className="flex-1 flex items-end gap-4 pl-12 h-full">
                {revenueData?.data?.map((m: any, i: number) => {
                  const maxRev = Math.max(...(revenueData.data.map((d: any) => d.revenue || 0)), 50000)
                  const hPct = m.revenue > 0 ? Math.max((m.revenue / maxRev) * 100, 5) : 2 // 2% minimum height
                  
                  return (
                    <div key={i} className="flex-1 group relative h-full flex items-end">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600/50 to-blue-400/80 rounded-t-md border-t border-x border-blue-400/50 transition-all duration-500 hover:from-blue-500 hover:to-blue-300"
                        style={{ height: `${hPct}%` }}
                      />
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-opacity">
                        ${m.revenue.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-between pl-12 pr-4 pt-4 text-[10px] text-white/40 font-mono">
              {revenueData?.data?.map((m: any, i: number) => (
                <span key={i} className="flex-1 text-center">{m.month}</span>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1 bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" /> Recent Activity
            </h2>
            <div className="space-y-6">
              <ActivityItem 
                title="New Proposal Accepted" 
                desc="Stark Industries approved 'Brand Redesign'" 
                time="2 hours ago" 
                color="bg-emerald-500" 
              />
              <ActivityItem 
                title="Support Ticket Opened" 
                desc="Login issue reported by student" 
                time="4 hours ago" 
                color="bg-amber-500" 
              />
              <ActivityItem 
                title="Payroll Processed" 
                desc="June 2026 salaries dispatched" 
                time="1 day ago" 
                color="bg-blue-500" 
              />
              <ActivityItem 
                title="New Course Module" 
                desc="'Advanced React' published to LMS" 
                time="2 days ago" 
                color="bg-purple-500" 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, trend, icon, color, bg }: any) {
  return (
    <div className="bg-dash-bg-card border border-dash-border-subtle rounded-3xl p-6 hover:bg-dash-bg-elevated transition-colors group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-dash-bg-elevated rounded-full blur-2xl group-hover:bg-dash-border-subtle transition-colors" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-dash-text-secondary tracking-wider uppercase">{title}</h3>
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold font-mono tracking-tight mb-2">{value}</div>
      <div className="text-xs text-white/40">{trend}</div>
    </div>
  )
}

function ActivityItem({ title, desc, time, color }: any) {
  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full ${color} mt-1.5 ring-4 ring-black`} />
        <div className="w-px h-full bg-dash-border-subtle mt-2" />
      </div>
      <div className="pb-2">
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="text-dash-text-secondary text-xs mt-2">{desc}</p>
        <span className="text-[10px] text-dash-text-secondary font-mono">{time}</span>
      </div>
    </div>
  )
}
