"use client"

import { useState, useEffect } from "react"
import { Bot, FileText, CheckCircle2, Star, Zap, Code, ShieldCheck, Printer, Share2 } from "lucide-react"

export default function AIPortfolioBuilderPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mockUserId, setMockUserId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch mock user ID
    fetch('/api/v1/lms/assignments/mock-context')
      .then(res => res.json())
      .then(ctx => {
        if (ctx.studentId) {
          setMockUserId(ctx.studentId)
          return fetch(`/api/v1/academy/portfolio/${ctx.studentId}`)
        }
        throw new Error("No student ID")
      })
      .then(res => res.json())
      .then(resData => {
        setData(resData.data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#49ABC9]" /></div>
  }

  if (!data) return <div className="p-8 text-center text-slate-500">Failed to generate portfolio.</div>

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] overflow-y-auto font-sans pb-24">
      {/* Top Banner (Hidden when printing) */}
      <div className="bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] text-white pt-16 pb-32 px-6 relative overflow-hidden print:hidden">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-bold text-blue-300 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Bot className="w-4 h-4" /> AI Auto-Generated
            </div>
            <h1 className="text-4xl font-black mb-2">Your Professional Portfolio</h1>
            <p className="text-blue-200/70 max-w-lg">Generated automatically using your academy progress, quiz scores, and verified certificates.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
              <Share2 className="w-5 h-5" /> Share Link
            </button>
            <button onClick={handlePrint} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex items-center gap-2">
              <Printer className="w-5 h-5" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* The Resume/Portfolio Document */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20 print:m-0 print:p-0 print:max-w-none">
        <div className="bg-white rounded-3xl p-10 md:p-16 border border-slate-200 shadow-xl shadow-slate-200/50 print:shadow-none print:border-none print:rounded-none">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start gap-8 border-b border-slate-100 pb-12 mb-12">
            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-black text-slate-400 overflow-hidden shrink-0">
              {data.user.avatarUrl ? <img src={data.user.avatarUrl} alt="" className="w-full h-full object-cover" /> : `${data.user.firstName.charAt(0)}${data.user.lastName.charAt(0)}`}
            </div>
            <div>
              <h2 className="text-5xl font-black text-slate-900 mb-2">{data.user.firstName} {data.user.lastName}</h2>
              <div className="text-[#49ABC9] font-bold text-xl mb-4">Grekam Academy Graduate</div>
              <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> {data.xp} XP Earned</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {data.QuizAttempt.length} Quizzes Passed</span>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="mb-12">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" /> Professional Summary
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed">{data.aiSummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Skills */}
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-500" /> Verified Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {data.aiSkills.map((skill: string, i: number) => (
                  <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Certifications
              </h3>
              <div className="space-y-4">
                {data.Certificate.map((cert: any) => (
                  <div key={cert.id} className="p-4 rounded-2xl border border-green-100 bg-green-50 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
                    <div className="font-bold text-slate-900">{cert.course.title}</div>
                    <div className="text-xs font-mono text-slate-500">Hash: {cert.credentialHash.substring(0, 16)}...</div>
                    <div className="text-xs font-bold text-green-600 mt-1">Verified by Grekam OS</div>
                  </div>
                ))}
                {data.Certificate.length === 0 && (
                  <div className="text-sm text-slate-500 italic">No certificates earned yet.</div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
