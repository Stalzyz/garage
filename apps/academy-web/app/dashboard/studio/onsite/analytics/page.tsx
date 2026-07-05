"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts"
import { TrendingUp, Users, BookOpen, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"

const monthlyRevenue = [
  { name: "Jan", revenue: 4000, students: 240 },
  { name: "Feb", revenue: 3000, students: 139 },
  { name: "Mar", revenue: 2000, students: 980 },
  { name: "Apr", revenue: 2780, students: 390 },
  { name: "May", revenue: 1890, students: 480 },
  { name: "Jun", revenue: 2390, students: 380 },
  { name: "Jul", revenue: 3490, students: 430 },
]

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("6m")

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#050505] text-white">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Analytics & Revenue</h1>
            <p className="text-white/50 mt-1">Track your course performance and earnings.</p>
          </div>
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            {['1w', '1m', '3m', '6m', '1y', 'all'].map((t) => (
              <button 
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  timeframe === t ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                12.5%
              </div>
            </div>
            <h3 className="text-white/50 text-sm font-medium mb-1 relative z-10">Total Revenue</h3>
            <div className="text-3xl font-bold text-white relative z-10">$24,590.00</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-purple-400 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                8.2%
              </div>
            </div>
            <h3 className="text-white/50 text-sm font-medium mb-1 relative z-10">Active Students</h3>
            <div className="text-3xl font-bold text-white relative z-10">1,492</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                <ArrowDownRight className="w-4 h-4" />
                2.1%
              </div>
            </div>
            <h3 className="text-white/50 text-sm font-medium mb-1 relative z-10">Course Enrollments</h3>
            <div className="text-3xl font-bold text-white relative z-10">3,240</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pink-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                18.4%
              </div>
            </div>
            <h3 className="text-white/50 text-sm font-medium mb-1 relative z-10">Completion Rate</h3>
            <div className="text-3xl font-bold text-white relative z-10">68.2%</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Revenue Overview</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Student Enrollments</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#a855f7' }}
                    cursor={{ fill: '#ffffff05' }}
                  />
                  <Bar dataKey="students" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
