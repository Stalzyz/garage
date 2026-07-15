"use client"

import { useState } from "react"
import { Search, Filter, Download, MoreVertical, GraduationCap, Clock, CheckCircle2, AlertCircle } from "lucide-react"

// Mock Data for Educator Student Performance View
const MOCK_STUDENTS = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", course: "Advanced React", progress: 85, grade: "A", lastActive: "2 hours ago", status: "On Track" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", course: "Node.js Basics", progress: 42, grade: "C+", lastActive: "3 days ago", status: "Falling Behind" },
  { id: "3", name: "Charlie Davis", email: "charlie@example.com", course: "Advanced React", progress: 100, grade: "A+", lastActive: "1 day ago", status: "Completed" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", course: "UI/UX Fundamentals", progress: 15, grade: "B", lastActive: "5 mins ago", status: "On Track" },
  { id: "5", name: "Evan Wright", email: "evan@example.com", course: "Node.js Basics", progress: 0, grade: "N/A", lastActive: "Never", status: "At Risk" },
]

export default function EducatorStudentsPage() {
  const [search, setSearch] = useState("")

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.course.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Performance</h1>
          <p className="text-sm text-white/50 mt-2">Monitor progress, grades, and engagement across all courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 text-sm font-bold">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students by name or course..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors">
            <Filter className="w-4 h-4 text-white/50" /> Filter
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Student</th>
                  <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Course</th>
                  <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Progress</th>
                  <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{student.name}</div>
                          <div className="text-xs text-white/40">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <GraduationCap className="w-4 h-4 text-white/30" />
                        {student.course}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-full max-w-[120px] h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-white/60">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                        student.status === 'On Track' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        student.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {student.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : 
                         student.status === 'On Track' ? <Clock className="w-3 h-3" /> : 
                         <AlertCircle className="w-3 h-3" />}
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/30">
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
