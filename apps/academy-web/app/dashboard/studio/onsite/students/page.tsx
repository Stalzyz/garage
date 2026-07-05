"use client"

import { useState } from "react"
import { Search, Filter, MoreHorizontal, Mail, GraduationCap, ChevronDown, Download } from "lucide-react"

const dummyStudents = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", course: "Advanced React", progress: 85, lastActive: "2 hours ago", status: "Active" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", course: "UI/UX Design Masterclass", progress: 32, lastActive: "1 day ago", status: "Active" },
  { id: 3, name: "Charlie Davis", email: "charlie@example.com", course: "Advanced React", progress: 100, lastActive: "1 week ago", status: "Completed" },
  { id: 4, name: "Diana Evans", email: "diana@example.com", course: "Next.js Enterprise", progress: 12, lastActive: "1 month ago", status: "Inactive" },
  { id: 5, name: "Ethan Hunt", email: "ethan@example.com", course: "UI/UX Design Masterclass", progress: 60, lastActive: "5 hours ago", status: "Active" },
]

export default function MyStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#050505] text-white">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">My Students</h1>
            <p className="text-white/50 mt-1">Manage and track your students across all courses.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="flex-1 md:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Message All
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search students by name or email..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className="w-3 h-3 ml-1 text-white/50" />
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-white/60">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Enrolled Course</th>
                  <th className="px-6 py-4 font-medium">Progress</th>
                  <th className="px-6 py-4 font-medium">Last Active</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dummyStudents
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="font-bold text-purple-400">{student.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{student.name}</div>
                          <div className="text-white/50 text-xs mt-0.5">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-white/40" />
                        <span className="text-white/80">{student.course}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full max-w-[100px] h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" 
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-white/60 text-xs w-8">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60">{student.lastActive}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                        student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        student.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-white/5 text-white/50 border-white/10'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
