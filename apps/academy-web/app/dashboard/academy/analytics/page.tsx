"use client"

import { useState, useEffect } from "react"
import { Users, Zap, CheckCircle2, AlertTriangle, TrendingUp, BookOpen, Clock, Activity } from "lucide-react"

export default function MentorAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/academy/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data.data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500" /></div>
  }

  if (!analytics) return <div className="p-8">Failed to load analytics.</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cohort Analytics</h1>
        <p className="text-slate-500 mt-1">Monitor student engagement and track learning outcomes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Students</div>
            <div className="text-3xl font-black text-slate-900">{analytics.totalStudents}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg Cohort XP</div>
            <div className="text-3xl font-black text-slate-900">{analytics.avgXp}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quiz Pass Rate</div>
            <div className="text-3xl font-black text-slate-900">{analytics.quizPassRate}%</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">At-Risk Students</div>
            <div className="text-3xl font-black text-red-600">{analytics.atRiskStudents.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Engagement Graph Mock */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Weekly Engagement Activity</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none font-medium">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          
          {/* Mock Bar Chart */}
          <div className="h-64 flex items-end gap-2 justify-between">
            {[40, 65, 45, 80, 55, 90, 75].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-full group cursor-pointer">
                <div className="w-full bg-slate-100 rounded-t-lg relative h-[200px] overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-t-lg group-hover:bg-blue-400 transition-colors" 
                    style={{ height: `${val}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-400">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Students List */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Needs Intervention
          </h2>
          
          <div className="space-y-4">
            {analytics.atRiskStudents.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-500">No at-risk students right now!</p>
              </div>
            ) : (
              analytics.atRiskStudents.map((student: any) => (
                <div key={student.id} className="p-4 rounded-2xl border border-red-100 bg-red-50 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-200 text-red-700 font-bold flex items-center justify-center shrink-0">
                      {student.user.firstName.charAt(0)}{student.user.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{student.user.firstName} {student.user.lastName}</div>
                      <div className="text-xs text-slate-500 font-mono">{student.user.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm font-bold">
                    <div className="text-red-600 flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
                      <Zap className="w-3.5 h-3.5" /> {student.xp} XP
                    </div>
                    <button className="ml-auto text-blue-600 hover:text-blue-700">Send Email →</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
