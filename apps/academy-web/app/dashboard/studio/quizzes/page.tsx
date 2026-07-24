"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"

export default function QuizBuilderPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: quizData, isLoading, mutate } = useApi<any>("/lms/quizzes")
  const rawQuizzes = quizData?.data || []

  const quizzes = rawQuizzes.map((q: any) => ({
    id: q.id,
    title: q.title || 'Untitled Quiz',
    course: q.lesson?.chapter?.course?.name || 'Onsite Course',
    questions: Array.isArray(q.questions) ? q.questions.length : 10,
    timeLimit: `${q.timeLimitMinutes || 30} mins`,
    status: q.isPublished ? 'Published' : 'Draft',
    passingScore: q.passingScore || 70,
    completions: q._count?.submissions || 0
  }))

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizForm, setQuizForm] = useState({ title: "", passingScore: 70 })

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi("/lms/quizzes", {
        method: "POST",
        body: JSON.stringify({
          title: quizForm.title,
          passingScore: Number(quizForm.passingScore),
          isPublished: true
        })
      })
      toast.success("Quiz created successfully!")
      setIsCreateOpen(false)
      setQuizForm({ title: "", passingScore: 70 })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#050505] text-white">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Quiz Builder</h1>
            <p className="text-white/50 mt-1">Create and manage assessments for your courses.</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
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
          <div className="text-white/50 text-center py-8">Loading quizzes...</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes
            .filter((q: any) => q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.course.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((quiz: any) => (
            <div key={quiz.id} className="bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-2xl p-6 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                  quiz.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {quiz.status}
                </span>
                <button className="text-white/40 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{quiz.title}</h3>
              <p className="text-white/50 text-sm mb-6 line-clamp-1">{quiz.course}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Questions</div>
                    <div className="text-sm font-medium">{quiz.questions}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Time Limit</div>
                    <div className="text-sm font-medium">{quiz.timeLimit}</div>
                  </div>
                </div>
                
                <div className="col-span-2 pt-4 mt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {quiz.completions} Completions
                  </div>
                  <button 
                    onClick={() => {
                      setEditingQuiz(quiz)
                      setQuizForm({ title: quiz.title, passingScore: quiz.passingScore })
                    }}
                    className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors"
                  >
                    Edit Assessment &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Create / Edit Quiz Modal */}
          {(isCreateOpen || editingQuiz) && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{editingQuiz ? "Edit Quiz" : "Create Quiz"}</h2>
                  <button onClick={() => { setIsCreateOpen(false); setEditingQuiz(null); }}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
                </div>
                <form onSubmit={handleCreateQuiz} className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Quiz Title</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                      placeholder="e.g. Advanced System Architecture"
                      value={quizForm.title} onChange={e => setQuizForm(p => ({...p, title: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Passing Score (%)</label>
                    <input required type="number" min={1} max={100} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                      value={quizForm.passingScore} onChange={e => setQuizForm(p => ({...p, passingScore: Number(e.target.value)}))} />
                  </div>
                  <button disabled={isSubmitting || !quizForm.title} type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 mt-4 flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Quiz"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Empty State / Add New Card */}
          <div onClick={() => setIsCreateOpen(true)} className="border-2 border-dashed border-white/10 hover:border-white/20 transition-all rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[280px]">
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
