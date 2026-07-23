"use client"

import { useState } from "react"
import { Search, Plus, MoreVertical, Clock, HelpCircle, CheckCircle2 } from "lucide-react"

import { useApi } from "@/lib/useApi"

export default function QuizBuilderPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: quizzesData, isLoading } = useApi<any>("/lms/quizzes")
  const quizzes = quizzesData?.data || []

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#050505] text-white">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Quiz Builder</h1>
            <p className="text-white/50 mt-1">Create and manage assessments for your courses.</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Create Quiz
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search quizzes..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quizzes Grid */}
        {isLoading ? (
          <div className="text-white/50">Loading quizzes...</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes
            .filter((q: any) => q.title.toLowerCase().includes(searchQuery.toLowerCase()) || (q.lesson?.module?.lmsCourse?.course?.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
            .map((quiz: any) => (
            <div key={quiz.id} className="bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-2xl p-6 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
                  Published
                </span>
                <button className="text-white/40 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{quiz.title}</h3>
              <p className="text-white/50 text-sm mb-6 line-clamp-1">{quiz.lesson?.module?.lmsCourse?.course?.name || "Unassigned"}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Questions</div>
                    <div className="text-sm font-medium">{quiz._count?.questions || 0}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Passing Score</div>
                    <div className="text-sm font-medium">{quiz.passingScore}%</div>
                  </div>
                </div>
                
                <div className="col-span-2 pt-4 mt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {quiz._count?.attempts || 0} Completions
                  </div>
                  <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                    Edit Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Add New Card */}
          <div className="border-2 border-dashed border-white/10 hover:border-white/20 transition-all rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[280px]">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-white/50" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Create New Quiz</h3>
            <p className="text-white/50 text-sm max-w-[200px]">Add multiple choice, true/false, and coding questions.</p>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
