"use client"

import { useState } from "react"
import { Users, TrendingUp, AlertTriangle, BookOpen, ChevronDown, Activity, Filter, Download } from "lucide-react"

// Mock Data
const AT_RISK_STUDENTS = [
  { id: "s1", name: "Alex Chen", course: "UI/UX Masterclass", progress: 12, lastActive: "14 days ago", score: "65%" },
  { id: "s2", name: "Sarah Miller", course: "Figma Basics", progress: 4, lastActive: "8 days ago", score: "N/A" },
  { id: "s3", name: "Rahul Verma", course: "UI/UX Masterclass", progress: 45, lastActive: "5 days ago", score: "72%" },
]

const LESSON_DROP_OFFS = [
  { lesson: "Auto-Layout Deep Dive", dropOff: "18%", metric: "High Difficulty", color: "text-red-500" },
  { lesson: "Component Variants", dropOff: "12%", metric: "Moderate", color: "text-amber-500" },
  { lesson: "Intro to Typography", dropOff: "2%", metric: "Easy", color: "text-emerald-500" },
]

export default function CohortAnalyticsDashboard() {
  const [cohort, setCohort] = useState("Summer 2025 Batch")

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cohort Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Track student progress, engagement drops, and at-risk learners.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all border border-border/50">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold border border-primary/20 hover:bg-primary/20 transition-all">
              <Filter className="w-4 h-4" />
              {cohort}
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Users className="w-4 h-4" />
              <p className="text-sm font-medium">Active Students</p>
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-foreground">142</h2>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">+12 this week</span>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <BookOpen className="w-4 h-4" />
              <p className="text-sm font-medium">Avg. Completion Rate</p>
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-foreground">68%</h2>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">+5% MoM</span>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Activity className="w-4 h-4" />
              <p className="text-sm font-medium">Avg. Quiz Score</p>
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-foreground">84%</h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-500/10 px-2 py-1 rounded border border-slate-500/20">Steady</span>
            </div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-red-500 mb-3">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-sm font-medium">At-Risk Students</p>
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-red-500">12</h2>
              <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Needs Attention</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* At-Risk Students Table */}
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Students Needing Intervention
              </h3>
              <button className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Progress</th>
                  <th className="px-5 py-3 font-medium">Last Active</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {AT_RISK_STUDENTS.map(student => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.course}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden max-w-[60px]">
                          <div className="h-full bg-red-500" style={{ width: `${student.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-red-500">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">{student.lastActive}</td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Engagement Drop-off Analysis */}
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border/50 bg-muted/20">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Lesson Drop-off Analysis
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Identify which lessons are causing students to pause or drop out.</p>
            </div>
            <div className="p-5 space-y-4">
              {LESSON_DROP_OFFS.map((lesson, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{lesson.lesson}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Course: UI/UX Masterclass</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-lg ${lesson.color}`}>{lesson.dropOff} Drop-off</div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      lesson.metric === 'High Difficulty' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      lesson.metric === 'Moderate' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {lesson.metric}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
