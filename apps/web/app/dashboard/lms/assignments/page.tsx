"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, FileText, UploadCloud, Link as LinkIcon, RefreshCw, Layers, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"

export default function StudentAssignmentsPage() {
  // Mock logged-in student context. In production, this comes from useAuth()
  const currentStudentId = "cmqldrpk200012hqtdlcqtoap";
  
  const { data, isLoading: loading, mutate } = useApi<{ assignments: any[] }>(`/lms/assignments?studentId=${currentStudentId}`);
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, "idle" | "uploading" | "submitted">>({});
  const [submissionUrls, setSubmissionUrls] = useState<Record<string, string>>({});

  const assignments = data?.assignments || [];

  const handleSubmit = async (e: React.FormEvent, assignmentId: string) => {
    e.preventDefault()
    const url = submissionUrls[assignmentId];
    if (!url) return

    setSubmissionStatus(prev => ({ ...prev, [assignmentId]: "uploading" }));

    try {
      await fetchApi('/lms/assignments/submit', {
        method: 'POST',
        body: JSON.stringify({
          assignmentId,
          studentId: currentStudentId,
          submissionUrl: url
        })
      });
      
      setSubmissionStatus(prev => ({ ...prev, [assignmentId]: "submitted" }));
      toast.success("Protocol submitted. Matrix AI evaluation initiated.");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit protocol.");
      setSubmissionStatus(prev => ({ ...prev, [assignmentId]: "idle" }));
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-transparent text-white relative p-6 lg:p-10 space-y-10">
      
      {/* Background Ambience */}
      <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-pink-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
            <Layers className="w-6 h-6 text-pink-400 relative z-10" />
            <div className="absolute inset-0 bg-pink-500/20 animate-pulse mix-blend-overlay" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)] mb-1">Academic Protocol</p>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-none">
              Assignment Matrix
            </h1>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <AnimatePresence>
            {assignments.map((assignment: any, i: number) => {
              const submission = assignment.submissions && assignment.submissions.length > 0 ? assignment.submissions[0] : null;
              const isGraded = submission && submission.status === 'GRADED';
              const status = submissionStatus[assignment.id] || (submission ? 'submitted' : 'idle');

              return (
                <motion.div 
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group ${isGraded ? 'opacity-80' : 'hover:border-pink-500/30 transition-colors'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${isGraded ? 'emerald' : 'pink'}-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    {isGraded ? (
                      <span className="inline-flex items-center rounded-lg border px-3 py-1 text-[9px] font-mono tracking-widest uppercase font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">Graded</span>
                    ) : (
                      <span className="inline-flex items-center rounded-lg border px-3 py-1 text-[9px] font-mono tracking-widest uppercase font-bold bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[inset_0_0_10px_rgba(236,72,153,0.1)]">Active</span>
                    )}
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40">Masterclass</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-white relative z-10">{assignment.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-8 relative z-10">{assignment.brief}</p>
                  
                  <div className="flex items-center gap-6 mb-8 text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 relative z-10">
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${isGraded ? 'text-emerald-400' : 'text-pink-400'}`} />
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className={`h-4 w-4 ${isGraded ? 'text-emerald-400' : 'text-pink-400'}`} />
                      {assignment.maxScore} Points
                    </div>
                  </div>

                  <div className="mt-auto relative z-10">
                    {isGraded ? (
                      <div className="border-t border-white/10 pt-6 bg-black/40 rounded-b-3xl -mx-8 -mb-8 px-8 pb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold flex items-center text-white"><CheckCircle2 className="mr-2 h-5 w-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> Matrix Score: {submission.grade}/{assignment.maxScore}</h4>
                        </div>
                        <div className="text-xs text-emerald-400/80 border-l-2 border-emerald-500/30 pl-4 py-1 markdown-body prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-emerald-500/20">
                          <ReactMarkdown>{submission.feedback}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <>
                        {status === "idle" && (
                          <form onSubmit={(e) => handleSubmit(e, assignment.id)} className="space-y-4">
                            <div className="relative">
                              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                              <input 
                                type="url"
                                required
                                value={submissionUrls[assignment.id] || ""}
                                onChange={(e) => setSubmissionUrls(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                                placeholder="Paste Figma Link here..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors font-mono"
                              />
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-mono font-bold tracking-widest uppercase px-5 py-3.5 rounded-xl hover:bg-pink-500/30 transition-all shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                              <UploadCloud className="w-4 h-4" /> Submit Protocol
                            </button>
                          </form>
                        )}

                        {status === "uploading" && (
                          <div className="py-6 flex flex-col items-center justify-center text-center bg-black/40 border border-white/10 rounded-xl">
                            <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-pink-400 animate-pulse">Uploading to Matrix...</p>
                          </div>
                        )}

                        {status === "submitted" && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <h4 className="font-bold text-emerald-400 mb-1">Submission Successful</h4>
                            <p className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-widest mb-4">Awaiting AI/Human Grade</p>
                            <div className="flex items-center justify-center gap-2 text-xs font-mono text-white/50 bg-black/40 py-2 px-3 rounded-lg border border-white/5">
                              <LinkIcon className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[200px]">{submission?.linkUrl || submissionUrls[assignment.id]}</span>
                            </div>
                            <button 
                              onClick={() => { setSubmissionStatus(prev => ({ ...prev, [assignment.id]: "idle" })); setSubmissionUrls(prev => ({ ...prev, [assignment.id]: "" })); }}
                              className="mt-6 w-full flex items-center justify-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 hover:text-white py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Retract & Re-submit
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
