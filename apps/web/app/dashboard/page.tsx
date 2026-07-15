"use client"

import { useSession } from "next-auth/react"
import { Activity, Users, DollarSign, TrendingUp, Calendar, AlertCircle, Briefcase, GraduationCap, BookOpen } from "lucide-react"
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
    return <EducatorDashboard />
  }

  // Super Admin / Manager view
  return <AdminDashboard session={session} />
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
    <div className="flex flex-col h-full bg-dash-bg-surface text-dash-text-primary p-8">
      <h1 className="text-3xl font-bold mb-2">Client Overview</h1>
      <p className="text-dash-text-secondary mb-8">A snapshot of your active projects and billing.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Projects" value="2" icon={<Briefcase className="w-5 h-5"/>} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard title="Pending Invoices" value="1" icon={<DollarSign className="w-5 h-5"/>} color="text-amber-400" bg="bg-amber-500/10" />
        <StatCard title="Support Tickets" value="0" icon={<AlertCircle className="w-5 h-5"/>} color="text-emerald-400" bg="bg-emerald-500/10" />
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
